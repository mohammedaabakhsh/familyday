"""Verify approved text-only previews, browser photos, and actual copy/share payloads.

No message is sent: native sharing, clipboard writes and WhatsApp links are
captured locally. This cannot inspect a previously cached WhatsApp preview.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.parse import urlparse, parse_qs
import json,re,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8051'
pages=json.loads((ROOT/'share-pages.json').read_text())+json.loads((ROOT/'share-extras.json').read_text())
by_path={p['path']:p for p in pages}
TITLE_ONLY={'/stay/ground-floor/','/stay/upper-floor/','/chalet/details/'}
assert {p['path'] for p in pages if not p['description']}==TITLE_ONLY
assert all(p['title'].strip() for p in pages)
class Document(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[];self.schema=[];self.in_schema=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content')
  if tag in ['img','source'] and (a.get('src') or a.get('srcset')):self.images.append(a)
  if tag=='link' and a.get('href') and (a.get('rel') in ['image_src','icon','shortcut icon','apple-touch-icon'] or a.get('as')=='image'):self.images.append(a)
  if tag=='script':self.in_schema=a.get('type')=='application/ld+json'
 def handle_endtag(self,tag):
  if tag=='script':self.in_schema=False
 def handle_data(self,text):
  if self.in_schema:self.schema.append(json.loads(text))
def contains_image(value):
 if isinstance(value,dict):return any(k in ['image','thumbnailUrl','logo'] or contains_image(v) for k,v in value.items())
 if isinstance(value,list):return any(contains_image(v) for v in value)
 return False
for entry in pages:
 source=urlopen(BASE+entry['path']).read().decode();doc=Document();doc.feed(source)
 assert doc.meta['og:title']==doc.meta['twitter:title']==entry['title'],entry['path']
 assert doc.meta['description']==doc.meta['og:description']==doc.meta['twitter:description']==entry['description'],entry['path']
 assert doc.meta['og:url']=='https://familydaystay.com'+entry['path']
 assert doc.meta['twitter:card']=='summary'
 assert not any(k and (k.startswith('og:image') or k.startswith('twitter:image') or k=='thumbnail') for k in doc.meta),entry['path']
 assert 'max-image-preview:none' in doc.meta['robots']
 assert not doc.images,(entry['path'],doc.images)
 assert not any(contains_image(schema) for schema in doc.schema),entry['path']
for path in ['/guest-services.html','/app-preview.html']:
 doc=Document();doc.feed(urlopen(BASE+path).read().decode());assert not doc.images and not any(contains_image(s) for s in doc.schema)
 assert not any(k and (k.startswith('og:image') or k.startswith('twitter:image')) for k in doc.meta)
print(f'PASS {len(pages)} exact title/description previews plus legacy entries; no initial thumbnail candidates',flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':740},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 for path in ['/resort/','/stay/','/chalet/','/services/cinema/','/services/games/','/services/dining-tables/']:
  page.goto(BASE+path,wait_until='networkidle')
  images=page.locator('img:visible');assert images.count(),path
  for image in images.all():
   image.scroll_into_view_if_needed();image.evaluate('e=>e.decode()')
   assert image.evaluate('e=>e.naturalWidth>0 && (!e.dataset.pageSrc || e.getAttribute("src")===e.dataset.pageSrc)'),path
  assert not page.locator('meta[property^="og:image"],meta[name^="twitter:image"]').count()
 print('PASS original website photos load at their unchanged sources',flush=True)
 for entry in pages:
  if '-tour/' not in entry['path']:continue
  page.goto(BASE+entry['path'],wait_until='networkidle')
  assert page.title()==entry['title'];assert page.locator('.dt-image').evaluate('e=>e.naturalWidth>0')
 print('PASS all ten illustrated tours retain photos and approved short titles',flush=True)
 # Returning from a direct detail entry must not keep its preview on the root.
 page.goto(BASE+'/cabins/dome-1/',wait_until='networkidle')
 page.evaluate('closeM()');page.wait_for_url(BASE+'/cabins/')
 page.evaluate('goBack()');page.wait_for_url(BASE+'/resort/')
 page.evaluate('goBackToDestination()');page.wait_for_url(BASE+'/')
 assert page.title()==by_path['/']['title']
 assert page.locator('meta[property="og:description"]').get_attribute('content')==by_path['/']['description']
 # Existing canonical cabin routes, including both rest-house sections and chalet.
 for path in ['/cabins/dome-1/','/cabins/greek-2/','/stay/ground-floor/','/stay/upper-floor/','/chalet/details/']:
  page.goto(BASE+path+'?fbclid=test',wait_until='networkidle')
  page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.copied=text},configurable:true})")
  page.locator('#fd-cabin-sharing button').click()
  assert page.evaluate('window.copied')==BASE+path
  link=page.locator('#fd-cabin-sharing a').get_attribute('href')
  text=parse_qs(urlparse(link).query)['text'][0];assert BASE+path in text and 'fbclid' not in text
 print('PASS cabin, section and chalet copy buttons and WhatsApp payloads retain canonical URLs',flush=True)
 # The two client links are fixed, including native share, clipboard and manual fallback.
 for path,button,expected in [('/guest-services/','#share-page','/guest-services/'),('/services-guide/','[data-share]','/arrangements/')]:
  page.goto(BASE+path,wait_until='networkidle')
  page.evaluate("Object.defineProperty(navigator,'share',{value:async value=>window.shared=value,configurable:true})")
  page.locator(button).first.click();assert page.evaluate('window.shared.url')==BASE+expected
  page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.copied=text},configurable:true})")
  page.locator(button).first.click();assert page.evaluate('window.copied')==BASE+expected
  page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
  page.locator(button).first.click();assert page.locator('#share-dialog').is_visible();assert page.locator('#share-link').input_value()==BASE+expected
  page.locator('#close-share').click()
 page.goto(BASE+'/arrangements/',wait_until='networkidle');page.wait_for_url('**/services-guide/')
 assert page.title()==by_path['/services-guide/']['title']
 # Cabin previews use exactly the existing cabin descriptions.
 page.goto(BASE+'/resort/',wait_until='networkidle')
 units=page.evaluate('data.resort.items.filter(c=>c.guests>0).map(c=>({id:c.id,name:c.name,type:c.type}))')
 for unit in units:
  entry=next(p for p in pages if p.get('route')=='cabin='+str(unit['id']))
  assert entry['description']==unit['type'] and entry['title']==unit['name']+' | منتجع يوم العائلة'
 assert not errors,errors
 print('PASS both client links across all share fallbacks, unchanged destinations, and exact cabin descriptions',flush=True)
 browser.close()

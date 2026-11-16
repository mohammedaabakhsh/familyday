"""Verify the approved long/short copy across details, map cards and share entries."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
pages=json.loads((ROOT/'share-pages.json').read_text())
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.values={}
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.values[a.get('property',a.get('name'))]=a.get('content')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(1440,900)]:
  page=b.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/cabins/',wait_until='networkidle')
  units=page.evaluate('data.resort.items.concat(FD_STAY_UNITS,[PRIVATE_CHALET]).map(c=>({id:c.id,name:c.name,long:c.description,short:c.type,suitable:c.suitable}))')
  assert len(units)==16
  # Existing cabin cards keep their original brief suitability label.
  for unit in units:
   if unit['id']>=20 or unit['id']==11:continue
   card=page.locator('#grid .card').filter(has=page.locator('[data-cid="'+str(unit['id'])+'"]'))
   assert card.locator('.fd-cabin-card-v2-subtitle').inner_text()==unit['suitable']
  assert page.locator('#grid + .fd-carousel-controls').is_visible()==(width<900)
  for unit in units:
   assert len(unit['long'].splitlines())==3
   assert not re.search('[،,]',unit['long']+unit['short'])
   assert '\n' not in unit['short']
   assert not re.search('[٠-٩۰-۹]',unit['long']+unit['short'])
   entry=next(x for x in pages if x['path']=='/chalet/details/') if unit['id']==30 else next(x for x in pages if x['route']=='cabin='+str(unit['id']))
   assert entry['description']==unit['short'],unit['name']
   if width==390:
    raw=urlopen(BASE+entry['path']).read().decode();meta=Metadata();meta.feed(raw)
    assert meta.values['og:description']==meta.values['description']==meta.values['twitter:description']==unit['short']
    assert not any(key and key.startswith(('og:image','twitter:image')) for key in meta.values)
   page.goto(BASE+entry['path'],wait_until='networkidle')
   intro=page.locator('#mBody .fd-cabin-description')
   assert intro.is_visible(),unit['name']
   assert intro.text_content()==unit['long'],unit['name']
   assert intro.evaluate('e=>getComputedStyle(e).whiteSpace')=='normal'
   assert intro.locator('.fd-cabin-description-line').count()==3
   # Check actual line boxes after the Arabic font loads rather than only CSS.
   page.evaluate('document.fonts.ready')
   lines=intro.locator('.fd-cabin-description-line').evaluate_all(r"""els=>els.map(el=>{
    const text=el.firstChild;const rows=new Map();
    for(const match of text.textContent.matchAll(/\S+/g)){
     const r=document.createRange();r.setStart(text,match.index);r.setEnd(text,match.index+match[0].length);
     const top=Math.round(r.getBoundingClientRect().top);rows.set(top,(rows.get(top)||0)+1);
    }
    return Array.from(rows.values());
   })""")
   assert all(len(row)==1 or min(row)>1 for row in lines),(unit['name'],width,lines)
   title=page.locator('#mBody .fd-cabin-title')
   if unit['id']!=11:
    suitable=unit.get('suitable') or 'مناسب للعائلات'
    label=title.locator('.fd-cabin-title-suitability')
    assert label.inner_text()=='('+suitable+')'
    assert label.evaluate('e=>getComputedStyle(e).color')=='rgb(25, 196, 201)'
   assert page.locator('#mBody .fd-cabin-combined-note').count()==0
   if unit['id']==11:
    assert page.locator('.fd-cabin-feature').filter(has_text='الوصول:').count()==1
    assert page.locator('#mBody .fd-cabin-instructions').count()==0
   assert page.locator('#mBody').evaluate('e=>e.scrollWidth<=e.clientWidth+1'),unit['name']
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if unit['id']==21:assert 'برسوم إضافية' in intro.inner_text() and 'برسوم إضافية' in unit['short']
   if unit['id'] in [1,3,9,11,20,21,30] and width in [390,1440]:
    intro.scroll_into_view_if_needed();page.screenshot(path=f'/tmp/accommodation-description-{unit["id"]}-{width}.png')
  page.goto(BASE+'/resort-map/',wait_until='networkidle')
  locations=page.evaluate('FD_RESORT_MAP_DATA.locations.map(x=>({key:x.key,id:x.cabinId}))')
  for location in locations:
   marker=page.locator('[data-location-key="'+location['key']+'"]')
   marker.locator('span').click()
   assert marker.get_attribute('aria-pressed')=='true'
   short=next(u['short'] for u in units if u['id']==location['id'])
   assert page.locator('.fd-map-description').inner_text()==short
   assert page.locator('#fd-map-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
   page.locator('.fd-map-clear').click()
  assert not errors,errors
  print(width,'PASS all 16 approved descriptions, unchanged cards, no commas, map/share parity, balanced text, title labels and layout',flush=True)
  page.close()
 b.close()

"""Approved second-review flows: package deep links, chalet return, photo retry and native details links."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from urllib.request import urlopen
from xml.etree import ElementTree as ET
from playwright.sync_api import sync_playwright
import json,sys
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
question='هل سعة الضيوف المذكورة للاستقبال أم للمبيت؟'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in ([] if '--feedback-only' in sys.argv else [320,390,1440]):
  page=b.new_page(viewport={'width':width,'height':900},reduced_motion='reduce');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  # Details links are native across the resort; keep modifier-aware navigation.
  page.goto(BASE+'/cabins/',wait_until='networkidle')
  assert page.locator('#grid a.card-btn').count()==13
  assert page.locator('#grid button.card-btn').count()==0
  link=page.locator('#grid a.card-btn').first;assert link.get_attribute('href')=='/cabins/dome-1/'
  page.evaluate('window.modifiedPrevented=null;document.querySelector("a.card-btn").addEventListener("click",e=>{window.modifiedPrevented=e.defaultPrevented;e.preventDefault()},{once:true})')
  link.dispatch_event('click',{'ctrlKey':True,'button':0})
  assert page.evaluate('window.modifiedPrevented') is False and page.url.endswith('/cabins/')
  link.click();page.wait_for_url('**/cabins/dome-1/')
  assert page.evaluate('history.state.route.parent.name')=='resort'
  assert page.locator('.fd-gallery-caption').inner_text()=='غرفة النوم والصالة'
  page.go_back();page.wait_for_url('**/cabins/')
  # Every resort cabin's original sources all remain assigned, with matching captions.
  units=page.evaluate('data.resort.items.filter(c=>c.id!==11).map(c=>c.id)')
  for id in units:
   page.evaluate('(id)=>openM(id,"resort")',id)
   sources=page.evaluate('GALLERY[curId]')
   assert page.locator('.fd-dome-slide img').count()==len(sources)
   assert page.locator('.fd-dome-slide img').evaluate_all('es=>es.map(e=>e.getAttribute("src"))')==sources
   assert page.locator('.fd-gallery-caption').inner_text()==page.evaluate('galleryPhotoLabel(curId,GALLERY[curId][0])')
   assert page.locator('.fd-gallery-caption').inner_text()
   page.evaluate('closeM()');page.wait_for_url('**/cabins/')
  # Six exact package URLs: auto-open, scroll, reload, share/copy and Back/Forward.
  for key in ['1','2','3','celebration','vip','resort']:
   page.goto(BASE+'/services/coordination/?package='+key,wait_until='networkidle')
   card=page.locator('#hd-coordination-package-'+key).locator('..').locator('..')
   assert card.locator('details').get_attribute('open') is not None
   card.locator('.fd-package-share').wait_for(state='visible')
   assert 0<=card.bounding_box()['y']<300,(key,card.bounding_box())
   share=card.locator('.fd-package-share');gallery=card.locator('.package-gallery')
   assert gallery.count()==1
   assert share.bounding_box()['y']<gallery.bounding_box()['y']
   page.evaluate('Object.defineProperty(navigator,"share",{configurable:true,value:async data=>window.shared=data})')
   share.click();assert page.evaluate('window.shared.url')==BASE+'/services/coordination/?package='+key
   page.reload(wait_until='networkidle');assert card.locator('details').get_attribute('open') is not None
   page.evaluate("showContact('resort')");page.wait_for_url('**/resort/contact/')
   page.go_back();page.wait_for_url('**?package='+key);assert card.locator('details').get_attribute('open') is not None
   page.go_forward();page.wait_for_url('**/resort/contact/');page.go_back();page.wait_for_url('**?package='+key)
  page.evaluate('Object.defineProperty(navigator,"share",{configurable:true,value:undefined});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async url=>window.copied=url}})')
  page.locator('#hd-coordination-package-resort').locator('..').locator('..').locator('.fd-package-share').click()
  assert page.evaluate('window.copied')==BASE+'/services/coordination/?package=resort'
  page.goto(BASE+'/services/coordination/?package=invalid',wait_until='networkidle');assert 'package=' not in page.url
  # Chalet details -> own catalogue -> own games -> Back retains photo/scroll state.
  page.goto(BASE+'/chalet/details/',wait_until='networkidle');page.locator('.fd-dome-next').click()
  page.wait_for_function('galIdx===1')
  link=page.locator('#ov .fd-cabin-services-link');link.scroll_into_view_if_needed()
  top=page.locator('#mBody').evaluate('e=>e.scrollTop')
  link.click();page.wait_for_url('**/chalet/services/')
  assert page.locator('#services-overlay .svcs-card:visible').count()==2
  page.evaluate('showTarfihi()');page.wait_for_url('**/chalet/services/games/')
  page.evaluate('closeTarfihiDetail()');page.wait_for_url('**/chalet/services/')
  page.evaluate('closeServices()');page.wait_for_url('**/chalet/details/')
  assert page.evaluate('galIdx')==1
  assert abs(page.locator('#mBody').evaluate('e=>e.scrollTop')-top)<2
  link.click();page.reload(wait_until='networkidle');page.evaluate('closeServices()');page.wait_for_url('**/chalet/details/')
  # Confirm FAQ answers in each venue using its existing accordion mechanism.
  for venue,selector,noun in [('resort','#faq-resort-cabins','الكوخ'),('stay','#faq-stay-sections','قسم الاستراحة'),('chalet','#chalet-faq-facilities','الشاليه')]:
   page.goto(BASE+'/'+venue+'/faq/',wait_until='networkidle')
   page.locator('.fd-faq-shortcuts button[aria-controls="'+selector[1:]+'"]').click()
   panel=page.locator(selector);assert question in panel.inner_text()
   assert 'تفاصيل غرف النوم والأسرّة موضحة في مواصفات '+noun in panel.text_content()
   if venue=='chalet':assert 'يضم الشاليه 3 حمامات' in panel.text_content()
  assert not errors,errors
  print(width,'PASS package links/share/reload/Back, all captions, chalet return, FAQs and native details links',flush=True)
  page.close()
 # Feedback: pending and failed image, exact-source retry, fullscreen retry, existing map retries.
 page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');failed=set()
 def fail_once(route):
  url=route.request.url
  if url not in failed:failed.add(url);route.abort()
  else:route.continue_()
 page.route('**/imgs/dome_6.webp*',fail_once)
 page.goto(BASE+'/cabins/dome-1/',wait_until='networkidle')
 slide=page.locator('.fd-dome-slide').first
 assert slide.locator('.fd-image-retry').is_visible()
 assert page.locator('#fsOverlay').is_hidden()
 slide.click();page.wait_for_function('document.querySelector(".fd-dome-slide img").naturalWidth>0')
 assert slide.locator('.fd-image-feedback').is_hidden()
 assert page.locator('#fsOverlay').is_hidden()
 page.unroute('**/imgs/dome_6.webp*')
 page.evaluate('openFS(["/imgs/dome_7.webp?retry-test"],0,1)')
 page.wait_for_function('document.querySelector("#fsTrack img").naturalWidth>0')
 page.route('**/imgs/dome_8.webp*',fail_once)
 page.evaluate('openFS(["/imgs/dome_8.webp?retry-test"],0,1)')
 page.locator('#fsTrack .fd-image-retry').click()
 page.wait_for_function('document.querySelector("#fsTrack img").naturalWidth>0')
 assert page.locator('#fsTrack .fd-image-feedback').is_hidden()
 page.evaluate('closeFS()')
 for path,glob,viewport,retry in [('/resort-map/','**/imgs/resort-map*','.fd-map-viewport','.fd-map-retry'),('/chalet-map/','**/imgs/chalet-tour-clarity-v1.png*','.cm-viewport','.cm-retry')]:
  # Determine the original map path, rather than replace image content.
  page.goto(BASE+path,wait_until='networkidle')
  image=page.locator('.fd-map-image' if path.startswith('/resort') else '.cm-image').get_attribute('src')
  page.route('**/'+image.lstrip('/').split('?')[0]+'*',fail_once)
  page.reload(wait_until='networkidle');page.locator(retry).click()
  page.wait_for_function('(selector)=>document.querySelector(selector).getAttribute("aria-busy")==="false"',arg=viewport)
  assert page.locator(viewport+' .fd-map-loading').is_hidden()
  assert page.locator(retry).is_hidden()
  page.unroute('**/'+image.lstrip('/').split('?')[0]+'*')
 # Pending feedback is visible without adding lazy loading or changing any source.
 pending=[]
 page.route('**/imgs/dome_6.webp*',lambda route:pending.append(route))
 page.goto(BASE+'/cabins/dome-1/',wait_until='domcontentloaded')
 page.locator('.fd-dome-slide .fd-image-feedback.is-loading').first.wait_for(state='visible')
 assert page.locator('.fd-dome-slide img[src]').count()==8
 for route in pending:route.continue_()
 page.wait_for_function('document.querySelector(".fd-dome-slide img").naturalWidth>0')
 page.unroute('**/imgs/dome_6.webp*')
 # Illustrated tours preserve their PNG geometry and retry that same source.
 page.route('**/imgs/dome-tour-15-clarity-v1.png*',fail_once)
 page.goto(BASE+'/dome-tour/',wait_until='networkidle')
 page.locator('.dt-stage .fd-image-retry').click()
 page.wait_for_function('document.querySelector(".dt-image").naturalWidth===1536')
 assert page.locator('.dt-stage .fd-image-feedback').is_hidden()
 page.close();b.close()
print('PASS photo failure/retry, pending feedback and existing map recovery',flush=True)
urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
assert len(urls)==len(set(urls))==56
assert all(url.startswith('https://familydaystay.com/') for url in urls)
assert not any(any(x in url for x in ['guest-services','app-preview','stay-preview','arrangements','prototype']) for url in urls)
assert 'Sitemap: https://familydaystay.com/sitemap.xml' in (ROOT/'robots.txt').read_text()
for path in ['/services/coordination/?package=vip','/chalet/faq/']:
 raw=urlopen(BASE+path).read().decode();assert 'property="og:image"' not in raw
print('PASS canonical public sitemap and text-only package previews')

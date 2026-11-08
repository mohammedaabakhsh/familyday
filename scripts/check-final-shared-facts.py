"""Integration regressions: independent unit edits, dependent views, entry metadata and mobile fit."""
from pathlib import Path
import json,re,sys
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8051'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':740},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 for path,venue in [('/','brand'),('/resort/','resort'),('/cabins/dome-1/','resort'),('/stay/sections/','stay'),('/chalet/details/','chalet')]:
  raw=urlopen(BASE+path).read().decode();schema=json.loads(re.search(r'<script id="fd-venue-schema"[^>]*>(.*?)</script>',raw,re.S)[1]);expected=json.loads((ROOT/'venue-data.json').read_text())[venue];assert schema==expected
  page.goto(BASE+path,wait_until='networkidle');assert page.locator('#fd-venue-schema').text_content() and json.loads(page.locator('#fd-venue-schema').text_content())==expected
 for venue in ['resort','stay','chalet']:
  page.evaluate('showDestination',venue)
  assert json.loads(page.locator('#fd-venue-schema').text_content())['name']==json.loads((ROOT/'venue-data.json').read_text())[venue]['name']
 print('PASS first-response and in-page venue identity/location/social accounts',flush=True)
 cold=b.new_page(viewport={'width':390,'height':740});images=[]
 cold.on('request',lambda r:images.append(r.url) if r.resource_type=='image' else None)
 cold.goto(BASE+'/chalet/',wait_until='networkidle')
 assert not any(any(name in url for name in ['cinema_1.webp','tarfihi_1.webp','tawilat_1.webp']) for url in images)
 for fn,name,close in [('showSinema','cinema_1.webp','closeSetupsDetail'),('showTarfihi','tarfihi_1.webp','closeTarfihiDetail'),('showTawilat','tawilat_1.webp','closeSetupsDetail')]:
  cold.evaluate(fn+'()')
  if fn=='showTawilat':cold.locator('#dining-card-6 summary').click()
  image=cold.locator('img[src*="'+name+'"]:visible');image.wait_for();cold.wait_for_function('(name)=>Array.from(document.images).some(i=>i.src.includes(name)&&i.naturalWidth>=1000)',arg=name);cold.evaluate(close+'()');cold.wait_for_timeout(100)
 cold.close()
 print('PASS unopened service photos deferred; original full-resolution photos load on opening',flush=True)

 for w,h in [(320,568),(390,640),(390,740),(430,932),(844,390),(1440,1000)]:
  page.set_viewport_size({'width':w,'height':h});page.goto(BASE+'/services/',wait_until='networkidle')
  assert page.locator('#services-overlay').evaluate('e=>e.scrollHeight<=e.clientHeight+1 && e.scrollWidth<=e.clientWidth+1'),(w,h)
  last=page.locator('#services-overlay .svcs-card').last.bounding_box();assert last['y']+last['height']<=h and h-(last['y']+last['height'])<35,(w,h,last)
  for s in ['انشر الفيديو ونافس بالمشاهدات','صوّر تجربتك وأرسلها لنا']:assert s in page.locator('#services-overlay').inner_text()
 print('PASS services fit six screen sizes, descriptions visible, loyalty at bottom',flush=True)
 page.set_viewport_size({'width':390,'height':740})
 # Change one physical unit at its source; Dome 2 must stay independent.
 original=(ROOT/'resort-data.js').read_text()
 edited=original.replace('"guests": 2','"guests": 21',1).replace('"depthCm": 140','"depthCm": 135',1).replace('غرفة النوم الرئيسية بسرير مزدوج','غرفة النوم الرئيسية بسرير تجريبي',1)
 page.route('**/resort-data.js*',lambda r:r.fulfill(body=edited,content_type='application/javascript'))
 page.goto(BASE+'/cabins/dome-1/',wait_until='networkidle')
 details=page.locator('#mBody').inner_text();assert 'حتى 21 ضيفًا' in details and '135 سم' in details and 'سرير تجريبي' in details
 assert page.locator('#ov .modal').bounding_box()['y']==0
 assert abs(page.locator('#ov .modal').bounding_box()['height']-740)<1
 page.goto(BASE+'/cabins/dome-2/',wait_until='networkidle');details=page.locator('#mBody').inner_text();assert 'حتى ضيفين' in details and '140 سم' in details and 'سرير تجريبي' not in details
 page.goto(BASE+'/cabins/',wait_until='networkidle')
 assert 'حتى 21 ضيفًا' in page.locator('#grid').text_content()
 page.goto(BASE+'/resort-map/#map=1',wait_until='networkidle');assert page.locator('.fd-map-guests').inner_text()=='حتى 21 ضيفًا'
 page.goto(BASE+'/dome-tour/',wait_until='networkidle');assert 'حتى 21 ضيفًا' in page.locator('.dt-occupancy').inner_text();assert 'سرير تجريبي' in page.locator('.dt-details').inner_text()
 page.locator('.dt-label[data-part="pool"]').click();assert '135 سم' in page.locator('.dt-details').inner_text()
 page.goto(BASE+'/resort/faq/',wait_until='networkidle');assert '21 ضيفًا' in page.locator('[data-shared-fact="resort-capacity"]').text_content();assert '135 و140' in page.locator('[data-shared-fact="resort-pools"]').text_content()
 page.unroute('**/resort-data.js*')
 print('PASS one cabin edit propagates to card/detail/map/tour/FAQ; second Dome unchanged',flush=True)
 source=(ROOT/'stay-design.js').read_text().replace('rooms:2,guests:25','rooms:3,guests:26',1).replace('maxGuests:70','maxGuests:71',1)
 page.route('**/stay-design.js*',lambda r:r.fulfill(body=source,content_type='application/javascript'))
 page.goto(BASE+'/stay/ground-floor/',wait_until='networkidle');assert all(t in page.locator('#mBody').inner_text() for t in ['حتى 26 ضيفًا','3 غرف','71 ضيفًا'])
 page.goto(BASE+'/stay/sections/',wait_until='networkidle');assert 'حتى 26 ضيفًا' in page.locator('#grid2').text_content();assert '3 غرف' in page.locator('#fd-stay-comparison-panel').text_content()
 page.goto(BASE+'/stay/faq/',wait_until='networkidle');answer=page.locator('[data-shared-fact="stay-capacity"]').text_content();assert all(t in answer for t in ['26 ضيفًا','25 ضيفًا','71','70']);assert 'غرف' not in answer;assert page.locator('[data-shared-fact="stay-first-rooms"]').text_content()=='3 غرف نوم'
 page.unroute('**/stay-design.js*');print('PASS rest-house card/detail/comparison/FAQ share unit capacities',flush=True)
 source=(ROOT/'chalet-design.js').read_text().replace('guests: 15','guests: 16',1).replace('depthCm: 60','depthCm: 65',1).replace("bed: 'سرير مزدوج'","bed: 'سرير تجريبي'",1)
 page.route('**/chalet-design.js*',lambda r:r.fulfill(body=source,content_type='application/javascript'))
 page.goto(BASE+'/chalet/details/',wait_until='networkidle');assert all(t in page.locator('#mBody').inner_text() for t in ['حتى 16 ضيفًا','65 سم','سرير تجريبي'])
 page.locator('#ov .fd-chalet-map-open').click();assert 'حتى 16 ضيفًا' in page.locator('.cm-occupancy').inner_text();page.locator('.cm-marker[data-room="upper"]').click();assert 'سرير تجريبي' in page.locator('.cm-details').inner_text();page.locator('.cm-marker[data-room="pool"]').click();assert '65 سم' in page.locator('.cm-details').inner_text()
 page.goto(BASE+'/chalet/faq/',wait_until='networkidle');assert all(t in page.locator('#chalet-faq').text_content() for t in ['حتى 16 ضيفًا','65 سم','سرير تجريبي'])
 assert not errors,errors
 print('PASS chalet detail/map/FAQ share occupancy, bedrooms and pool depth; no JS errors',flush=True)
 b.close()

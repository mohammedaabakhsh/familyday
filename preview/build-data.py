"""Capture current approved presentation content for the isolated UI preview.
Run against the current site locally: python preview/build-data.py http://127.0.0.1:8056
This writes preview/catalog.json only; it never edits production source files.
"""
from pathlib import Path
import json,sys,subprocess
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
PAGES=json.loads((ROOT/'share-pages.json').read_text())
UNIT_PATHS=[]
for item in PAGES:
 if item['route'].startswith('cabin='):
  uid=int(item['route'].split('=')[1]);path=item['path']
  UNIT_PATHS.append(('stay' if uid>=20 else 'resort',path.rstrip('/').split('/')[-1],uid,path))
UNIT_PATHS.append(('chalet','chalet',30,'/chalet/details/'))
VENUES=json.loads((ROOT/'venue-data.json').read_text())
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 units=[]
 for venue,key,id,path in UNIT_PATHS:
  page.goto(BASE+path,wait_until='networkidle')
  unit=page.evaluate('''({id,key,venue,path})=>{
   const c=id===30?PRIVATE_CHALET:id>=20?FD_STAY_UNITS.find(c=>c.id===id):data.resort.items.find(c=>c.id===id);
   const clean=t=>(t||'').replace(/\\s+/g,' ').trim();
   const root=document.getElementById('mBody');
   const tour=root.querySelector('a[href*="-tour/"],a[href*="chalet-map/"]');
   return {key,venue,id,path,raw:c,name:c.name,short:c.type,description:c.description,suitable:c.suitable||(id===11?'لجميع الضيوف':'مناسب للعائلات'),guests:c.guests,rooms:c.rooms,bathrooms:c.bathroom||3,booking:c.bookUrl,
    images:GALLERY[id].map(src=>'/'+src.replace(/^\\//,'')),labels:GALLERY[id].map(src=>galleryPhotoLabel(id,src)),
    gardenFeatures:id===11?[...root.querySelectorAll('.fd-cabin-feature')].map(n=>clean(n.textContent)):[],tour:id===11?'https://my.matterport.com/show/?m=S7Z2CF9tdwm':tour?new URL(tour.getAttribute('href'),'https://familydaystay.com').pathname+new URL(tour.getAttribute('href'),'https://familydaystay.com').search:null,
    sections:[...root.querySelectorAll('.fd-cabin-accordion')].map(e=>({title:clean(e.querySelector('summary').textContent),items:[...e.querySelectorAll('.fd-cabin-feature')].map(n=>clean(n.textContent)),notes:[...e.querySelectorAll('.fd-cabin-instructions')].map(n=>{const c=n.cloneNode(true);c.querySelectorAll('br').forEach(b=>b.replaceWith(document.createTextNode(' ')));c.querySelectorAll('p,div').forEach(b=>b.append(' '));return clean(c.textContent);}),times:[...e.querySelectorAll('.fd-cabin-times>div')].map(n=>({label:clean(n.querySelector('span').textContent),value:clean(n.querySelector('strong').textContent)}))})),
    extras:[...root.querySelectorAll('.fd-cabin-combined-note')].map(n=>({title:clean(n.querySelector('h3')?.textContent),text:clean(n.querySelector('p')?.textContent)}))};
  }''',{'id':id,'key':key,'venue':venue,'path':path})
  units.append(unit)
 page.goto(BASE+'/services/',wait_until='networkidle')
 services=page.evaluate('''()=>{
 const clean=e=>(typeof e==='string'?e:e?.textContent||'').replace(/\\s+/g,' ').trim();
 const text=(s,r=document)=>clean(r.querySelector(s));
 const photo=(s,r=document)=>{const e=r.querySelector(s);return e?(e.getAttribute('data-page-src')||e.getAttribute('src')):null;};
 const packages=selector=>[...document.querySelectorAll(selector)].map(e=>({id:e.querySelector('.hd-package-name')?.id||'',name:text('.hd-package-name',e),price:text('.hd-package-price',e),description:text('.hd-package-description',e),items:[...e.querySelectorAll('.hd-item')].map(n=>clean(n.querySelector('span:last-child')||n)),note:text('.hd-package-note',e),images:(_coordinationPhotos[e.querySelector('.hd-package-name')?.id]||[]).map(s=>'/'+s.replace(/^\\//,'')),path:(e.querySelector('.hd-package-name')?.id||'').startsWith('hd-coordination-package-')?'/services/coordination/?package='+encodeURIComponent(e.querySelector('.hd-package-name').id.replace('hd-coordination-package-','')):'/services/hospitality/packages/'}));
 const dining=document.getElementById('dining-card-template').content;
 const all=[
 {id:'menu',name:'المطعم',group:'طعام ومشروبات',path:'/menu/',intro:'تصفّح قائمة الطعام والمشروبات',icon:'utensils',menu:_menuData},
 {id:'dining',name:'طاولات الطعام',group:'طعام ومشروبات',path:'/services/dining-tables/',intro:text('.tw-intro'),icon:'dining',image:photo('img',dining),prices:_tawilatPrices,items:_tawilatInclusions},
 {id:'games',name:'الألعاب الترفيهية',group:'ترفيه',path:'/services/games/',intro:text('.tg-intro'),icon:'games',image:photo('.tg-photo img'),packages:[...document.querySelectorAll('.tg-package')].map(e=>({name:text('.tg-package-name',e),price:text('.tg-package-price',e),note:text('.tg-package-description',e)})),items:[...document.querySelectorAll('.tg-games li')].map(clean)},
 {id:'water',name:'الألعاب المائية',group:'ترفيه',path:'/services/water-games/',intro:text('.wm-intro'),icon:'water',offer:text('.wm-offer'),notes:[...document.querySelectorAll('.wm-notes-list li')].map(clean)},
 {id:'cinema',name:'جلسة السينما',group:'ترفيه',path:'/services/cinema/',intro:'استمتع بتجربة سينما في مساحتكم الخاصة',icon:'cinema',image:photo('.cn-photo img'),stats:[...document.querySelectorAll('.cn-stat')].map(e=>({label:text('dt',e),value:text('dd',e)})),items:[...document.querySelectorAll('.cn-inclusions li')].map(clean)},
 {id:'hospitality',name:'الضيافة',group:'تجهيز مناسبتك',path:'/services/hospitality/packages/',intro:text('#hd-hospitality-panel .hd-intro'),icon:'coffee',packages:packages('#hd-hospitality-panel .hd-package')},
 {id:'coordination',name:'التنسيقات',group:'تجهيز مناسبتك',path:'/services/coordination/',intro:'نجهّز مناسباتكم بكل تفاصيلها',icon:'flower',packages:packages('#hd-coordination-panel .hd-package')},
 {id:'seating',name:'الجلسات الخارجية',group:'تجهيز مناسبتك',path:'/services/outdoor-seating/',intro:text('.jl-intro'),icon:'sofa',sessions:_jalsatAllSessions},
 {id:'competition',name:'شارك بفيديو… ويومك الجاي علينا',group:'عروض وامتيازات',path:'/contest/',intro:'انشر الفيديو ونافس بالمشاهدات',icon:'video',copy:text('#contest-detail .sw-prize-description')},
 {id:'video',name:'شارك واربح',group:'عروض وامتيازات',path:'/services/share-and-win/',intro:'صوّر تجربتكم وأرسلها لنا',icon:'gift',copy:text('#sharik-detail .sw-prize-description')},
 {id:'loyalty',name:'بطاقة الولاء',group:'عروض وامتيازات',path:'/services/loyalty/',intro:text('.wl-promise'),icon:'card',copy:text('.wl-section-title')}
 ];
 return all.map(s=>{if(!s.image&&s.packages?.[0]?.images?.[0])s.image=s.packages[0].images[0];if(!s.image&&s.sessions?.[0]?.img)s.image=s.sessions[0].img;return s;});
 }''')
 # Capture current ordering quantities, terms and campaigns without inventing copy.
 source=page.evaluate('''()=>{
 const clean=t=>(t||'').replace(/\\s+/g,' ').trim();
 const text=(s,r=document)=>clean(r.querySelector(s)?.textContent);
 const links=(r)=>[...r.querySelectorAll('a[href]')].map(a=>({text:clean(a.textContent)||a.getAttribute('aria-label')||'فتح الرابط',href:a.getAttribute('href'),download:a.hasAttribute('download')}));
 return {times:[...document.querySelectorAll('#order-time option')].filter(o=>o.value).map(o=>({value:o.value,label:clean(o.textContent)})),cabins:FD_CABIN_NUMBERS,hours:text('.menu-hours'),notes:{cinema:[...document.querySelectorAll('.cn-notes-list li')].map(e=>clean(e.textContent)),games:[...document.querySelectorAll('.tg-notes-list li')].map(e=>clean(e.textContent)),seating:[...document.querySelectorAll('.jl-notes-list li')].map(e=>clean(e.textContent))},campaigns:['contest-detail','sharik-detail','walaa-detail'].map(id=>{const r=document.getElementById(id);return {id,title:text('h1',r),sections:[...r.querySelectorAll('section')].filter(e=>!e.parentElement.closest('section')).map(e=>({title:text('h2,h3',e),paragraphs:[...e.querySelectorAll('p')].map(n=>clean(n.textContent)).filter(Boolean),items:[...e.querySelectorAll('li')].map(n=>clean(n.textContent)),links:links(e)})),links:links(r),paragraphs:[...r.querySelectorAll('p')].map(e=>clean(e.textContent)).filter(Boolean),headings:[...r.querySelectorAll('h2,h3,h4')].map(e=>clean(e.textContent))};})};
 }''')
 source['resortMap']=page.evaluate('FD_RESORT_MAP_DATA')
 source['chalet']=page.evaluate('PRIVATE_CHALET')
 source['campaigns']=page.evaluate('''()=>['contest-detail','sharik-detail','walaa-detail'].map(id=>{const r=document.getElementById(id),clean=e=>(e?.textContent||'').replace(/\\s+/g,' ').trim(),links=e=>[...e.querySelectorAll('a[href]')].map(a=>({text:clean(a)||a.getAttribute('aria-label')||'فتح الرابط',href:a.getAttribute('href')}));return {id,title:clean(r.querySelector('h1')),paragraphs:[...r.querySelectorAll('p')].map(clean).filter(Boolean),items:[...r.querySelectorAll('li')].map(clean),headings:[...r.querySelectorAll('h2,h3,h4')].map(clean),links:links(r),sections:[...r.querySelectorAll('section')].filter(e=>!e.parentElement.closest('section')).map(e=>({title:clean(e.querySelector('h2,h3')),paragraphs:[...e.querySelectorAll('p')].map(clean).filter(Boolean),items:[...e.querySelectorAll('li')].map(clean),links:links(e)}))}})''')
 page.goto(BASE+'/guest-services/',wait_until='networkidle')
 source['extras']=page.evaluate('''()=>[...document.querySelectorAll('[data-extra]')].map(e=>({id:e.dataset.extra,name:e.querySelector('h3').textContent.trim(),price:Number(e.querySelector('.extra-price bdi').textContent),description:e.querySelector('.extra-description,.extra-note')?.textContent.trim()||''}))''')
 source['guestCatalog']=page.evaluate('''async()=>{const c=await FD_GUEST_SOURCE.load();delete c.menuMessage;return c;}''')
 venues={}
 for key,faqpath,root in [('resort','/resort/faq/','#faq-overlay'),('stay','/stay/faq/','#faq2-overlay'),('chalet','/chalet/faq/','#chalet-faq')]:
  page.goto(BASE+faqpath,wait_until='networkidle')
  faqs=page.evaluate('''selector=>{
   const r=document.querySelector(selector),clean=t=>(t||'').replace(/[⌄⌃]/g,'').replace(/\\s+/g,' ').trim();
   return [...r.querySelectorAll('.faq-accordion-card,details')].map(e=>({question:clean(e.querySelector('.faq-question-text,.faq-question,summary')?.textContent||e.querySelector('.faq-question-row')?.textContent),answer:clean((()=>{const a=e.querySelector('.faq-answer,.chalet-faq-answer')?.cloneNode(true);if(!a)return '';a.querySelectorAll('a,button,svg').forEach(n=>n.remove());a.querySelectorAll('br').forEach(n=>n.replaceWith(document.createTextNode(' ')));a.querySelectorAll('p,div,li').forEach(n=>n.append(' '));return a.textContent;})())})).filter(q=>q.question&&q.answer);
  }''',root)
  page.goto(BASE+f'/{key}/contact/',wait_until='networkidle')
  mapurl=page.evaluate('''()=>[...document.querySelectorAll('#contact-page a[href]')].map(a=>a.href).find(h=>/maps.app.goo.gl|google.com\\/maps/.test(h))||null''')
  name=VENUES[key]['name'];region=VENUES[key]['address']['addressRegion']
  venues[key]={'name':name,'location':'جدة — '+('حي '+region if key=='chalet' else region),'phone':VENUES[key]['telephone'],'social':VENUES[key].get('sameAs',[]),'map':mapurl,'faqs':faqs,'home':f'/{key}/','contact':f'/{key}/contact/','faq':faqpath,'services':['games','water'] if key=='chalet' else [s['id'] for s in services] if key=='resort' else []}
 browser.close()
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
result={'sourceRevision':revision,'source':source,'units':units,'services':services,'venues':venues}
# Every photo remains an original source URL, never a resized generated copy.
for service in services:
 if service.get('image'):service['image']='/'+service['image'].lstrip('/')
 for session in service.get('sessions',[]):session['img']='/'+session['img'].lstrip('/')
(ROOT/'preview/catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'units':[(u['name'],len(u['images']),len(u['sections'])) for u in units],'services':[(s['name'],len(s.get('packages',[]))) for s in services],'venues':{k:{'faqs':len(v['faqs']),'map':v['map']} for k,v in venues.items()}},ensure_ascii=False))

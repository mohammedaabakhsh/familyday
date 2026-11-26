"""Verify the approved four-service batch and preview metadata without sending messages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,parse_qs
import os,json,sys,subprocess,re
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';D=Path('/tmp/reviewed-services-v103');D.mkdir(exist_ok=True);COPY=json.loads((R/'site/guide-copy.json').read_text());DATA=json.loads((R/'data/services.json').read_text());SHARES=json.loads((R/'site/share-metadata.json').read_text());out={'version':'20261126-live-v103','profiles':[],'previews':[],'errors':[],'messagesSent':False}
PATHS={'coordination':'/services/coordination/','dining':'/services/dining-tables/','seating':'/services/outdoor-seating/','cinema':'/services/cinema/'}
DESCS={'coordination':'نجهّز مناسباتكم بكل تفاصيلها','dining':'طاولة الطعام تجمعكم في المساحة الخارجية الخاصة بالكوخ','seating':'جلسات نجهّزها لكم في المساحة الخارجية الخاصة بالكوخ','cinema':'جلسة سينما خارجية في المساحة الخاصة بالكوخ'}
for name in ['data/services.json','js/menu-order-message.js','js/order-privacy.js','guest-services/guest-services.js','services-guide/guide-orders.js','site/orders/native-orders.js','site/orders/restaurant-inline.js']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show','HEAD:'+name]),name
class Preview(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[];self.canonical=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content','')
  if tag in ['img','picture','source'] and a.get('src') or tag=='link' and a.get('rel') in ['icon','image_src'] and a.get('href'):self.images.append(a)
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
REDIRECTS=json.loads((R/'site/routes.json').read_text())['redirectRoutes']
init="window.opened=[];window.shares=[];window.open=url=>{top.opened.push(url);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})"
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']};reqopts={'ignore_https_errors':True}
 if BASE.startswith('https:'):opts['proxy']=reqopts['proxy']={'server':os.environ['HTTPS_PROXY']}
 api=p.request.new_context(**reqopts)
 # Every resort title keeps its name, while no description repeats it.
 for path,item in SHARES.items():
  assert not ('منتجع يوم العائلة' in item['title'] and 'منتجع يوم العائلة' in item['description']),path
  if 'منتجع يوم العائلة' not in item['title']:continue
  html=api.get(BASE+path,headers={'User-Agent':'WhatsApp/2.24'}).text();meta=Preview();meta.feed(html);assert 'منتجع يوم العائلة' not in meta.meta['og:description']
  if path not in REDIRECTS:assert meta.meta['og:title']==item['title'] and meta.meta['og:description']==item['description'],path
 for key,path in PATHS.items():
  for mode,target in [('main',path),('portal','/services-guide/'+key+'/')]:
   response=api.get(BASE+target,headers={'User-Agent':'WhatsApp/2.24'});assert response.status==200;preview=Preview();preview.feed(response.text());assert preview.meta['og:description']==preview.meta['twitter:description']==DESCS[key];assert 'منتجع يوم العائلة' in preview.meta['og:title'];assert preview.meta['og:url']==preview.canonical=='https://familydaystay.com'+target;assert not preview.images;assert not any(k and k.startswith(('og:image','twitter:image')) for k in preview.meta);out['previews'].append({'mode':mode,'path':target,'description':DESCS[key],'titleOnlyBrand':True,'textOnly':True})
 api.dispose();b=p.chromium.launch(**opts)
 for w,h in [(390,844),(320,568),(430,932),(390,430)]:
  c=b.new_context(viewport={'width':w,'height':h},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:out['errors'].append(str(e)));drafts={}
  for mode in ['main','portal']:
   main=mode=='main'
   for kind in ['dining','seating','cinema','coordination']:
    target=PATHS[kind] if main else '/services-guide/'+kind+'/';page.goto(BASE+target);page.locator('#main h1' if main else '#guide-content.is-ready').wait_for(state='attached');expect(page.locator('meta[property="og:description"]')).to_have_attribute('content',DESCS[kind]);page.locator('.header [data-share]' if main else '.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+target};assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    if kind=='dining':
     table=page.locator('.dining-guide-prices table' if main else '#dining .fd-dining-table');expect(table.locator('thead th').first).to_have_text('عدد الأشخاص');expectedFont='12px' if main or w<359 else '13px';assert table.locator('thead th').first.evaluate('e=>getComputedStyle(e).fontSize')==expectedFont
     assert page.locator('.dining-guide-currency').count()==0
     for size,prices in DATA['arrangements']['dining']['prices'].items():
      for option,price in prices.items():
       button=page.locator('[data-dining-size="'+size+'"][data-dining-option="'+option+'"]' if main else '.fd-dining-option[data-size="'+size+'"][data-option="'+option+'"]');expect(button.locator('bdi')).to_have_text(str(price));expect(button.locator('.dining-guide-price-currency' if main else '.fd-dining-currency')).to_have_text('ريال');a=button.locator('bdi').bounding_box();z=button.locator('span').last.bounding_box();assert abs((a['y']+a['height']/2)-(z['y']+z['height']/2))<2
     # Clicking the currency itself still selects its price; closing clears it.
     page.locator('[data-dining-size="32"][data-dining-option="tansiq"] .dining-guide-price-currency' if main else '.fd-dining-option[data-size="32"][data-option="tansiq"] .fd-dining-currency').click();page.locator('.dining-guide-link' if main else '[data-dining-request]').click()
     if main:expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');expect(f.locator('#arrangement-total')).to_have_text('1199');page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden();expect(page.locator('.dining-guide-link')).to_be_disabled()
     else:expect(page.locator('#arrangement-total')).to_have_text('1199');page.locator('.arrangement-request [data-close-request]').click();expect(page.locator('.arrangement-request')).to_be_hidden();expect(page.locator('[data-dining-request]')).to_be_disabled()
    if kind in ['seating','cinema']:
     count=6 if kind=='seating' and w==390 and h==844 else 1
     for i in range(count):
      root=page.locator('.service-guide-packages>.package').nth(i) if main and kind=='seating' else page.locator('#session-'+str(i+1)) if kind=='seating' else page.locator('.service-guide' if main else '#cinema-session')
      if kind=='seating':root.locator('summary').first.click();assert 'للجلسة' not in root.locator('summary').first.inner_text()
      img=root.locator('img').first;expect(img).to_be_visible();img.evaluate('e=>e.decode()');assert img.evaluate('e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-e.naturalWidth/e.naturalHeight)<0.001}');assert img.evaluate('e=>!e.closest("button,a,[role=button],[data-package-photo]")&&getComputedStyle(e).cursor!=="zoom-in"');img.click();assert page.locator('dialog[open]').count()==0
      if kind=='seating' and w==390 and h==844:
       root.locator('[data-service-portal]' if main else '[data-request-key]').click()
       if main:expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');send=f.locator('.resort-direct-send')
       else:f=page;send=page.locator('.arrangement-request .arrangement-send')
       f.locator('#arrangement-name').fill('ضيف الفحص');f.locator('#arrangement-cabin').select_option('بيت الدوم 1');f.locator('#arrangement-notes').fill('فحص محلي');send.click();expect(page.locator('#native-order-dialog' if main else '.arrangement-request')).to_be_hidden();url=page.evaluate('opened.at(-1)');assert urlparse(url).path=='/966537009217';text=parse_qs(urlparse(url).query)['text'][0];price=int(re.search(r'\d+',DATA['arrangements']['seating']['sessions'][i]['price'])[0]);assert 'إجمالي الطلب: '+str(price)+' ريال' in text;drafts[(mode,i)]=url
      if kind=='seating':root.locator('summary').first.click()
    if kind=='coordination':
     root=page.locator('.service-guide-packages>.package').first if main else page.locator('#package-1');root.locator('summary').first.click();assert root.locator('.package-gallery img').count()==3
     if main:root.locator('[data-package-photo]').first.click();expect(page.locator('#viewer')).to_be_visible();page.keyboard.press('Escape')
     else:expect(page.locator('#coordination .coordination-help-description')).to_have_text('تواصل معنا لاختيار التنسيق المناسب لكم')
    if kind=='seating':
     if main:assert page.locator('.coordination-help-description').count()==0
     else:expect(page.locator('#seating .coordination-help-description')).to_have_text('تواصل معنا لاختيار الجلسة المناسبة لكم')
    if w==390 and h==844:
     if kind=='coordination':root.locator('summary').first.click()
     page.screenshot(path=str(D/(mode+'-'+kind+('-live' if BASE.startswith('https:') else '')+'.png')),full_page=True)
  if w==390 and h==844:
   for i in range(6):assert drafts[('main',i)]==drafts[('portal',i)]
  page.goto(BASE+'/services-guide/');page.locator('#guide-content.is-ready').wait_for(state='attached');expect(page.locator('.cover-logo')).to_be_visible();icon=page.locator('.guide-tile[href="#seating"] .tile-icon');assert icon.locator('svg').count()==1
  if w==390 and h==844:page.screenshot(path=str(D/'source-home.png'),full_page=True);icon.screenshot(path=str(D/'floor-seating-icon.png'))
  out['profiles'].append({'width':w,'height':h,'sharedPreviewDescriptions':True,'staticCompleteSeatingAndCinemaPhotos':True,'seatingPriceNoRedundantUnit':True,'currencyBesideEveryPrice':True,'headerFontsPreserved':True,'coordinationGalleryPreserved':True,'helpUnchanged':True,'noHorizontalOverflow':True});c.close();print(w,h,'PASS',flush=True)
 b.close()
assert not out['errors'],out['errors'];report=Path('/tmp/reviewed-services-v103-live.json') if BASE.startswith('https:') else R/'site/audits/reviewed-services-batch-v103.json';report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

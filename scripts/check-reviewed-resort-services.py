"""Verify approved cinema/coordination/dining flows. Capture WhatsApp drafts; never send."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import json,os,re,sys
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150'
SOURCE=json.loads((R/'data/services.json').read_text());COPY=json.loads((R/'site/guide-copy.json').read_text())['serviceCopy'];A=SOURCE['arrangements']
out={'version':'20261126-live-v82','profiles':[],'messagesSent':False,'errors':[]}
init="window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})"
paths={'coordination':'/services/coordination/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
def expected(entry,name,price,qty=1,cinema=False):
 label={'coordination':'تنسيق','dining':'تجهيز طاولة طعام','cinema':'جلسة سينما'}[entry]
 title={'coordination':'التنسيقات','dining':'طاولات الطعام','cinema':'جلسة السينما'}[entry]
 parts=['السلام عليكم، أرغب بطلب '+label+':','','الاسم: ضيف المراجعة','اسم الكوخ: البيت اليوناني 2','رقم الكوخ: 11','','الطلبات:','',title+':',name+' × '+str(qty)+' = '+str(price*qty)+' ريال']
 if cinema:parts+=['مدة الجلسة: 3 ساعات','وقت بداية الجلسة: 12:00 ص (منتصف الليل)']
 return '\n'.join(parts+['','إجمالي الطلب: '+str(price*qty)+' ريال','','ملاحظات: مراجعة بدون إرسال'])
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568),(430,932),(390,430)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init)
  main=c.new_page();portal=c.new_page()
  for page in [main,portal]:page.on('pageerror',lambda e:out['errors'].append(str(e)))
  def mainVisit(kind):
   main.goto(BASE+paths[kind]);main.locator('#main h1').wait_for();assert not main.evaluate('document.documentElement.scrollWidth>innerWidth')
  def portalVisit(kind):
   portal.goto(BASE+'/services-guide/#'+kind);portal.locator('#guide-content.is-ready').wait_for(state='attached');assert not portal.evaluate('document.documentElement.scrollWidth>innerWidth')
  def share(page,selector,kind):
   page.locator(selector).click();target='/services-guide/'+kind+'/' if selector.startswith('.topbar') else paths[kind];assert page.evaluate('shares.at(-1)')=={'text':BASE+target}
  def send(page,f,mode,kind,name,price,qty=1):
   send=f.locator('.resort-direct-send' if mode=='main' else '.arrangement-request .arrangement-send')
   f.locator('#arrangement-name').fill('');f.locator('#arrangement-cabin').select_option('');before=page.evaluate('opened.length')
   if kind=='cinema':expect(send).to_be_disabled()
   else:send.click()
   assert page.evaluate('opened.length')==before
   f.locator('#arrangement-name').fill('ضيف المراجعة');f.locator('#arrangement-cabin').select_option('البيت اليوناني 2');f.locator('#arrangement-notes').fill('مراجعة بدون إرسال');assert f.locator('#arrangement-cabin-number').inner_text()=='رقم الكوخ: 11'
   if kind=='cinema':f.locator('#cinema-time').select_option('24')
   if qty==2:f.locator('.resort-entry-selection [data-step="1"]' if mode=='main' else '.arrangement-request-quantity [data-step="1"]').click()
   if mode=='main':
    assert not f.locator('html').evaluate('e=>e.scrollWidth>innerWidth');assert page.locator('.native-order-share').count()==0
    rect=send.bounding_box();assert rect and rect['y']>=0 and rect['y']+rect['height']<=height
   send.click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden()
   u=urlparse(page.evaluate('opened.at(-1)'));assert u.path=='/'+'966537009217'
   text=parse_qs(u.query)['text'][0];assert text==expected(kind,name,price,qty,kind=='cinema'),text
   return page.evaluate('opened.at(-1)')
  # Cards and internal descriptions have distinct, shared wording.
  main.goto(BASE+'/services/');main.locator('.svcs-card').first.wait_for();portal.goto(BASE+'/services-guide/');portal.locator('#guide-content.is-ready').wait_for(state='attached')
  for kind in paths:
   assert main.locator('a.svcs-card[href="'+paths[kind]+'"] .svcs-description').inner_text()==portal.locator('.guide-tile[href="#'+kind+'"] .tile-description').inner_text()==COPY[kind]['cardIntro']
  # All coordination content and photos remain in their collapsed cards; each request starts with only its own package.
  mainVisit('coordination');portalVisit('coordination')
  for page,selector in [(main,'.page-heading p'),(portal,'#coordination .section-heading p')]:
   if page.locator(selector).count():assert page.locator(selector).inner_text()==COPY['coordination']['pageIntro']
  packs=A['coordination']['packages'] if width==390 and height==844 else A['coordination']['packages'][:1]
  for i,pack in enumerate(packs):
   suffix=pack['id'].replace('hd-coordination-package-','');key='package-complete' if suffix=='resort' else 'package-'+suffix
   m=main.locator('.service-guide-packages>.package').nth(i);s=portal.locator('#'+key)
   m.locator('summary').click();s.locator('summary').first.click()
   assert m.locator('.inclusions li span').all_text_contents()==s.locator('.inclusions li').all_text_contents()==pack['items']
   positions=m.locator('.inclusions li').evaluate_all('xs=>xs.map(x=>({left:x.offsetLeft,top:x.offsetTop,width:x.offsetWidth}))');assert len({round(x['left']) for x in positions})==1
   assert m.locator('.package-gallery img').count()==s.locator('.package-gallery img').count()==len(pack['images'])
   share(main,'.header [data-share]','coordination');share(portal,'.topbar [data-share]','coordination')
   m.locator('[data-service-portal]').click();expect(main.locator('.native-order-loading')).to_be_hidden();f=main.frame_locator('.native-order-frame');expect(main.locator('#native-order-title')).to_have_text('طلب '+pack['name']);assert f.locator('.guide-section:visible').count()==0
   price=int(re.search(r'\d+',pack['price'])[0]);qty=2 if i==0 else 1;draft=send(main,f,'main','coordination',pack['name'],price,qty)
   s.locator('[data-request-key]').click();assert send(portal,portal,'portal','coordination',pack['name'],price,qty)==draft
   m.locator('summary').click();s.locator('summary').first.click()
  print(width,'coordination checked',flush=True)
  # Price clicks select exactly one setup and never open a request. Only the button under the table opens the selected setup.
  mainVisit('dining');portalVisit('dining');expect(main.locator('.dining-guide-link')).to_be_disabled();expect(portal.locator('[data-dining-request]')).to_be_disabled()
  assert main.locator('.dining-guide-details li span').all_text_contents()==portal.locator('#dining .fd-dining-inclusions li').all_text_contents()==A['dining']['items']
  choices=[(size,option,price) for size,prices in A['dining']['prices'].items() for option,price in prices.items()] if width==390 and height==844 else [('6','plain',199),('32','tansiq',1199)]
  for size,option,price in choices:
   main.locator('[data-dining-size="'+size+'"][data-dining-option="'+option+'"]').click();portal.locator('.fd-dining-option[data-size="'+size+'"][data-option="'+option+'"]').click()
   assert main.locator('#native-order-dialog').is_hidden() and portal.locator('.arrangement-request').is_hidden()
   assert main.locator('[data-dining-size][aria-pressed="true"]').count()==portal.locator('#dining [aria-pressed="true"]').count()==1
   share(main,'.header [data-share]','dining');share(portal,'.topbar [data-share]','dining')
   name='طاولة طعام لـ'+size+' '+('أشخاص' if int(size)<=10 else 'شخصًا')+' — '+('تجهيز أساسي' if option=='plain' else 'تجهيز مع تنسيق')
   main.locator('.dining-guide-link').click();expect(main.locator('.native-order-loading')).to_be_hidden();f=main.frame_locator('.native-order-frame');expect(main.locator('#native-order-title')).to_have_text('طلب '+name);assert f.locator('.guide-section:visible,.arrangement-quantity:visible').count()==0
   draft=send(main,f,'main','dining',name,price);portal.locator('[data-dining-request]').click();assert portal.locator('.arrangement-request-quantity').is_hidden();assert send(portal,portal,'portal','dining',name,price)==draft
  print(width,'dining checked',flush=True)
  # Cinema shows the contents heading and uses a single header share.
  mainVisit('cinema');portalVisit('cinema');assert portal.locator('#cinema h3.cinema-contents-title').inner_text()=='محتويات الجلسة'
  assert portal.locator('[data-share]:visible,[data-share-path]:visible').count()==1
  assert portal.locator('#cinema .guide-usage').get_attribute('open') is None
  assert main.locator('.cinema-contents li span').all_text_contents()==portal.locator('#cinema .inclusions').first.locator('li').all_text_contents()==SOURCE['guest']['cinema']['contents']
  share(main,'.header [data-share]','cinema');share(portal,'.topbar [data-share]','cinema')
  main.locator('#main [data-service-portal]').click();expect(main.locator('.native-order-loading')).to_be_hidden();draft=send(main,main.frame_locator('.native-order-frame'),'main','cinema','جلسة السينما',150)
  portal.locator('#cinema-session [data-request-key]').click();assert send(portal,portal,'portal','cinema','جلسة السينما',150)==draft
  # Cancel/back forgets the table selection and customer details.
  mainVisit('dining');main.locator('[data-dining-size="6"][data-dining-option="plain"]').click();main.locator('.dining-guide-link').click();expect(main.locator('.native-order-loading')).to_be_hidden();f=main.frame_locator('.native-order-frame');f.locator('#arrangement-notes').fill('لا يستمر');main.go_back();expect(main.locator('#native-order-dialog')).to_be_hidden();expect(main.locator('.dining-guide-link')).to_be_disabled();main.locator('[data-dining-size="6"][data-dining-option="plain"]').click();main.locator('.dining-guide-link').click();expect(main.locator('.native-order-loading')).to_be_hidden();assert main.frame_locator('.native-order-frame').locator('#arrangement-notes').input_value()=='';main.locator('.native-order-close').click();expect(main.locator('#native-order-dialog')).to_be_hidden()
  out['profiles'].append({'width':width,'height':height,'coordinationPackages':len(packs),'diningChoices':len(choices),'exactWhatsAppParity':True,'oneHeaderShare':True,'selectionBeforeRequest':True,'backAndCancel':True});print(width,height,'PASS',flush=True)
  if width==390 and height==844:
   folder=Path('/tmp/resort-service-unification-v80');folder.mkdir(exist_ok=True)
   for kind in paths:
    mainVisit(kind);portalVisit(kind)
    if kind=='coordination':main.locator('.service-guide-packages>.package summary').first.click();portal.locator('#package-1 summary').first.click()
    if kind=='dining':main.locator('[data-dining-size="6"][data-dining-option="plain"]').click();portal.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click()
    main.screenshot(path=str(folder/(kind+'-main.png')),full_page=True);portal.screenshot(path=str(folder/(kind+'-portal.png')),full_page=True)
  c.close()
 b.close()
assert not out['errors'],out['errors'];(R/'site/audits/reviewed-resort-services-v82.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

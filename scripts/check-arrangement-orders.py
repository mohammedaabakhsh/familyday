"""Exercise real arrangements selection, text-only sharing and coordinator drafts; never send messages."""
import json,sys,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
SOURCE=json.loads((R/'data/services.json').read_text());A=SOURCE['arrangements'];out={'version':'20261125-arrangements-v63','viewports':[],'messagesSent':False,'errors':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,768,1440]:
  context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce');page=context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.add_init_script("window.opened=[];window.shares=[];window.open=(url)=>{opened.push(url);return null};Object.defineProperty(navigator,'share',{value:async data=>{shares.push(data)},configurable:true});")
  def visit(path):
   page.goto(BASE+path);page.locator('#guide-content.is-ready').wait_for(state='attached');page.evaluate('document.fonts.ready')
  def expand(card):
   root=page.locator('#'+card);details=root.locator('details').first
   if details.get_attribute('open') is None:details.locator('summary').first.click()
   return root
  def step(card,value=1):
   root=expand(card)
   for _ in range(value):root.locator('.arrangement-controls [data-step="1"]').click()
  visit('/services-guide/')
  assert page.locator('.portal-branch').inner_text()=='فرع خليج سلمان'
  assert page.locator('.portal-branch').evaluate('e=>e.previousElementSibling.textContent')=='منتجع يوم العائلة'
  assert page.locator('.cover-logo').evaluate('e=>getComputedStyle(e).backgroundImage').endswith('logo-original.png")')
  original=subprocess.check_output(['git','show','pre-arrangements-ordering-20261125:services-guide/index.html']).decode()
  page.route('**/services-guide/?baseline=1',lambda r:r.fulfill(body=original.replace('guide.js?v=20261125-live-v54','guide-original.js'),content_type='text/html'))
  old_js=subprocess.check_output(['git','show','pre-arrangements-ordering-20261125:services-guide/guide.js']).decode()
  page.route('**/services-guide/guide-original.js',lambda r:r.fulfill(body=old_js,content_type='text/javascript'))
  metrics="()=>[...document.querySelectorAll('.contents .guide-tile')].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return [r.width,r.height,s.padding,s.borderRadius,s.backgroundColor]})"
  current=page.evaluate(metrics);visit('/services-guide/?baseline=1');assert page.evaluate(metrics)==current, (width,current,page.evaluate(metrics))
  visit('/services-guide/#coordination');step('package-1',2)
  assert page.locator('#arrangement-total').inner_text()=='240'
  assert page.locator('#package-1').evaluate('e=>getComputedStyle(e).borderColor')=='rgb(147, 75, 101)'
  # Share each package using the exact public URL already used by the main guide.
  for pack in A['coordination']['packages']:
   suffix=pack['id'].replace('hd-coordination-package-','');card='package-complete' if suffix=='resort' else 'package-'+suffix
   root=expand(card);root.locator('[data-share-path]').click()
   assert page.evaluate('shares.at(-1)')=={'text':BASE+pack['path']}
  visit('/services-guide/#dining');page.locator('.fd-dining-option[data-size="12"][data-option="tansiq"]').click()
  assert page.locator('#arrangement-total').inner_text()=='839'
  page.locator('#dining [data-share-path]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+A['dining']['path']}
  visit('/services-guide/#seating');step('session-1');page.locator('.seating-extra [data-step="1"]').click()
  assert page.locator('#arrangement-total').inner_text()=='1309'
  assert page.locator('#session-1').evaluate('e=>getComputedStyle(e).borderColor')=='rgb(60, 107, 80)'
  for i in range(1,7):
   root=expand('session-'+str(i));root.locator('[data-share-path]').click()
   assert page.evaluate('shares.at(-1)')=={'text':BASE+A['seating']['path']+'?session='+str(i)}
  page.locator('#arrangement-order [type="submit"]').click();assert not page.evaluate('opened')
  page.locator('#arrangement-name').fill('ضيف التجربة');page.locator('#arrangement-cabin').select_option('بيت الدوم 1');page.locator('#arrangement-notes').fill('تنسيق الورد على شكل قلب')
  page.locator('#arrangement-order [type="submit"]').click();draft=page.evaluate('opened.at(-1)');url=urlparse(draft);message=parse_qs(url.query)['text'][0]
  assert url.netloc=='wa.me' and url.path=='/966537009217'
  expected='\n'.join(['السلام عليكم، أرغب بطلب التنسيقات والتجهيزات التالية:','','الاسم: ضيف التجربة','اسم الكوخ: بيت الدوم 1','رقم الكوخ: 15','','الطلبات:','باقة الورد × 2 = 240 ريال','طاولة طعام لـ12 شخصًا — تجهيز مع تنسيق × 1 = 599 ريال','جلسة بإطار مثلث × 1 = 300 ريال','شخصين','كيك وعصير × 1 = 170 ريال','','إجمالي الطلب: 1309 ريال','','ملاحظات: تنسيق الورد على شكل قلب'])
  assert message==expected,message
  assert 'http' not in message and '/imgs/' not in message
  page.reload();page.locator('#guide-content.is-ready').wait_for(state='attached');assert page.locator('#arrangement-total').inner_text()=='1309'
  assert page.locator('#arrangement-name').input_value()=='ضيف التجربة' and page.locator('#arrangement-cabin').input_value()=='بيت الدوم 1'
  page.locator('[data-remove="session-1"]').click();expect(page.locator('#arrangement-warning')).to_be_visible();assert page.locator('#arrangement-order [type="submit"]').is_disabled()
  page.locator('[data-remove="seating-extra"]').click();assert page.locator('#arrangement-total').inner_text()=='839';assert page.locator('#arrangement-order [type="submit"]').is_enabled()
  visit('/services-guide/#contents');assert page.locator('.contents .is-selected').count()==2
  colors=page.locator('.contents .is-selected').evaluate_all('es=>es.map(e=>getComputedStyle(e).borderColor)');assert len(set(colors))==2
  page.screenshot(path=f'/tmp/arrangements-v63/home-{width}.png',full_page=True)
  visit('/arrangements/#session-4');assert page.locator('#session-4 details').get_attribute('open') is not None
  assert page.locator('#seating').is_visible()
  for section in ['coordination','dining','seating']:
   visit('/services-guide/#'+section);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  page.screenshot(path=f'/tmp/arrangements-v63/order-{width}.png',full_page=True)
  # The native guide and the portal publish identical canonical links, including all six new session links.
  for i in range(1,7):
   page.goto(BASE+A['seating']['path']+'?session='+str(i));native=page.locator('.service-guide-packages');native.wait_for()
   assert native.locator('details.package').nth(i-1).get_attribute('open') is not None
   assert native.locator('[data-share]').nth(i-1).get_attribute('data-share')==A['seating']['path']+'?session='+str(i)
   assert page.locator('[data-service-portal]').get_attribute('href').endswith('/arrangements/#session-'+str(i))
   native.locator('details.package').nth(i-1).locator('[data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+A['seating']['path']+'?session='+str(i)}
  for pack in A['coordination']['packages']:
   page.goto(BASE+pack['path']);button=page.locator('.share-text[data-share="'+pack['path']+'"]');button.wait_for(state='attached');assert button.count()==1
  for path in ['/services/coordination/?package=1','/services/dining-tables/','/services/outdoor-seating/?session=1','/arrangements/']:
   response=page.request.get(BASE+path);html=response.text();assert response.status==200
   assert 'og:image' not in html and 'twitter:image' not in html and '<img ' not in html
   assert 'max-image-preview:none' in html
  out['viewports'].append({'width':width,'cardGeometryPreserved':True,'exactCoordinatorDraft':True,'selectionAndPersistence':True,'packageLinksMatch':6,'sessionLinksMatch':6,'textOnlyShare':True});print(width,'PASS',flush=True);context.close()
 # Changes in catalogue prices must drive totals; malformed drafts and unavailable storage cannot break ordering.
 context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
 changed=json.loads(json.dumps(SOURCE));changed['arrangements']['coordination']['packages'][0]['price']='121 ريال للباقة'
 page.route('**/data/services.json?*',lambda r:r.fulfill(body=json.dumps(changed),content_type='application/json'))
 page.add_init_script("sessionStorage.setItem('familyday.arrangements-orders.v1',JSON.stringify({quantities:{'package-1':2,'session-1':-4,'unknown':99},name:'اختبار',cabin:'غير صالح'}))")
 page.goto(BASE+'/services-guide/#package-1');page.locator('#guide-content.is-ready').wait_for(state='attached');assert page.locator('#arrangement-total').inner_text()=='242';assert page.locator('#arrangement-cabin').input_value()=='';context.close()
 context=browser.new_context();page=context.new_page();page.add_init_script("Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}")
 page.goto(BASE+'/services-guide/#package-1');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('#package-1 [data-step="1"]').click();assert page.locator('#arrangement-total').inner_text()=='120';context.close();browser.close()
assert not out['errors'],out['errors']
(R/'site/audits/arrangements-v63.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))

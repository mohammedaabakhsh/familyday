"""Chalet/resort guest-order parity. All WhatsApp and share actions are intercepted."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
import sys,json
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8059'
PATH='/chalet/guest-services/'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(1440,900)]:
  ctx=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  ctx.add_init_script("window.open=url=>{window.capturedURL=url;return null};Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async url=>{window.copiedURL=url}},configurable:true})")
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+PATH,wait_until='networkidle')
  assert page.title()=='خدمات إقامتك | شاليه يوم العائلة'
  assert page.locator('link[rel="canonical"]').get_attribute('href')=='https://familydaystay.com'+PATH
  assert page.locator('meta[property^="og:image"],meta[name^="twitter:image"]').count()==0
  assert page.locator('[data-service]').evaluate_all('els=>els.map(e=>e.dataset.service)')==['water','games']
  assert page.locator('#restaurant-order,#guest-cabin,#cinema-service,#extras-service,#hospitality-service').count()==0
  assert page.locator('[name="games-package"]').evaluate_all('els=>els.map(e=>e.value)')==['box']
  assert page.locator('.footer-bottom').count()==0
  assert page.locator('.help a[href="https://wa.me/966556156693"]').count()==1
  def click(selector,n=1):
   for _ in range(n):page.locator(selector).click()
  def open_(key):
   click('#'+key+'-card');assert page.locator('#service-dialog').is_visible()
   assert page.evaluate('getComputedStyle(document.body).overflow')=='hidden'
  def apply():click('#apply-selection');assert page.locator('#service-dialog').is_hidden()
  click('#share-page');page.wait_for_function('window.copiedURL')
  assert page.evaluate('window.copiedURL')==BASE+PATH
  assert page.locator('#share-status').evaluate('e=>e.classList.contains("visible")')
  open_('games');assert page.locator('.game-options .is-selected').count()==0
  page.keyboard.press('Escape');assert page.locator('#games-card').evaluate('e=>document.activeElement===e')
  open_('water');click('[data-water-packages][data-step="1"]')
  assert page.locator('#water-offer').inner_text()=='6 ألعاب بـ100 ريال'
  assert page.locator('#dialog-total').inner_text()=='100'
  assert page.locator('#apply-selection').is_disabled()
  click('[data-water="adults"][data-step="1"]',4);click('[data-water="children"][data-step="1"]',2)
  assert page.locator('#water-count').inner_text()=='✓ اكتمل اختيار الألعاب'
  assert page.locator('#water-service').evaluate('e=>e.classList.contains("is-complete")')
  if width==390:page.screenshot(path='/tmp/fd-chalet-parity-water.png')
  click('[data-water-packages][data-step="-1"]')
  assert page.locator('#water-adults').inner_text()=='0' and page.locator('#water-children').inner_text()=='0'
  assert page.locator('#apply-selection').is_disabled()
  click('[data-water-packages][data-step="1"]');click('[data-water="adults"][data-step="1"]',4);click('[data-water="children"][data-step="1"]',2);apply()
  open_('games');page.locator('[name="games-package"][value="box"]').check();apply()
  assert page.locator('#order-total').inner_text()=='150'
  assert page.locator('#order-items .order-group-heading strong').all_text_contents()==['100 ريال','50 ريال']
  assert page.locator('#order-items .order-item-copy strong').all_text_contents()==['باقة ألعاب مائية × 2','بوكس الألعاب']
  click('#extras-order .send-order');assert page.evaluate('window.capturedURL') is None
  page.locator('#guest-name').fill('ضيف التجربة');page.locator('#guest-notes').fill('ملاحظة للشاليه')
  click('#extras-order .send-order');url=urlparse(page.evaluate('window.capturedURL'))
  assert url.hostname=='wa.me' and url.path=='/966556156693'
  expected='السلام عليكم، أرغب بطلب الخدمات التالية:\n\nالاسم: ضيف التجربة\nالمكان: شاليه يوم العائلة\n\nالطلبات:\n\nالألعاب المائية:\nباقة ألعاب مائية × 2 = 100 ريال\nللكبار: 4\nللصغار: 2\n\nالألعاب الترفيهية:\nبوكس الألعاب × 1 = 50 ريال\n\nإجمالي الطلب: 150 ريال\n\nملاحظات: ملاحظة للشاليه'
  assert parse_qs(url.query)['text'][0]==expected
  open_('water');click('[data-water-packages][data-step="1"]');click('.dialog-cancel');assert page.locator('#order-total').inner_text()=='150'
  page.reload(wait_until='networkidle');assert page.locator('#order-total').inner_text()=='150'
  assert page.locator('#guest-name').input_value()=='ضيف التجربة' and page.locator('#guest-notes').input_value()=='ملاحظة للشاليه'
  # The resort in the same tab must not reuse chalet orders, names or notes.
  page.goto(BASE+'/guest-services/',wait_until='networkidle');assert page.locator('#orders-summary').is_hidden()
  open_('games');page.locator('[name="games-package"][value="table"]').check();apply()
  page.locator('#guest-name').fill('ضيف المنتجع');page.locator('#guest-cabin').select_option(label='بيت الدوم 1')
  page.goto(BASE+PATH,wait_until='networkidle');assert page.locator('#order-total').inner_text()=='150'
  assert page.locator('#guest-name').input_value()=='ضيف التجربة'
  page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(150)
  if not page.locator('#order-shortcut').is_hidden():
   click('#order-shortcut');assert page.locator('#orders-summary').evaluate('e=>e===document.activeElement')
  open_('water');page.locator('.dialog-body').evaluate('e=>e.scrollTop=e.scrollHeight')
  box=page.locator('#apply-selection').bounding_box();assert box['y']>=0 and box['y']+box['height']<=height
  for _ in range(16):
   page.keyboard.press('Tab');assert page.evaluate('document.getElementById("service-dialog").contains(document.activeElement)')
  page.keyboard.press('Escape');assert page.evaluate('getComputedStyle(document.body).overflow')!='hidden'
  page.get_by_role('button',name='حذف باقة ألعاب مائية',exact=True).click();assert page.locator('#order-total').inner_text()=='50'
  page.get_by_role('button',name='حذف بوكس الألعاب',exact=True).click()
  assert page.locator('#orders-summary').is_hidden()
  if width==390:page.screenshot(path='/tmp/fd-chalet-parity-home.png',full_page=True)
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  ctx.close();print(width,'PASS fixed URL, two services, quantities, reset, bill, exact WhatsApp, sharing, persistence, venue isolation, cancel/remove and mobile focus/scroll',flush=True)
 # Native sharing and clipboard failures keep the chalet URL, never the resort URL.
 for mode in ['native','fallback']:
  ctx=b.new_context();ctx.add_init_script("Object.defineProperty(navigator,'share',{value:"+("async data=>{window.sharedData=data}" if mode=='native' else 'undefined')+",configurable:true});Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
  page=ctx.new_page();page.goto(BASE+PATH,wait_until='networkidle');page.locator('#share-page').click()
  if mode=='native':
   page.wait_for_function('window.sharedData');assert page.evaluate('window.sharedData.url')==BASE+PATH
  else:
   assert page.locator('#share-dialog').is_visible();assert page.locator('#share-link').input_value()==BASE+PATH
  ctx.close()
 # Missing source is retryable; unsupported services and malformed saved orders cannot be restored.
 ctx=b.new_context();ctx.route('**/index.html',lambda r:r.fulfill(status=503,body='Unavailable'))
 page=ctx.new_page();page.goto(BASE+PATH,wait_until='networkidle')
 assert page.locator('#services-error').is_visible() and page.locator('#reload-services').is_visible()
 assert page.locator('#water-card').is_disabled();ctx.close()
 ctx=b.new_context();bad={'games':'table','cinema':'18','hospitality':{'الضيافة السعودية':2},'water':{'packages':2,'adults':3,'children':0},'menu':{'ساندويتش دجاج زنجر':{'qty':2}},'quantities':{'bed':2}}
 ctx.add_init_script('sessionStorage.setItem("familyday.chalet-guest-orders.v1",'+json.dumps(json.dumps(bad))+')')
 page=ctx.new_page();page.goto(BASE+PATH,wait_until='networkidle');assert page.locator('#orders-summary').is_hidden();ctx.close()
 print('PASS native/copy/fallback sharing, source errors, unsupported and invalid saved selections',flush=True)
 b.close()

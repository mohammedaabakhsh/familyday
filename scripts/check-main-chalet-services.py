"""Exercise chalet services in the main site; capture WhatsApp without sending."""
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8059'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(1440,900)]:
  ctx=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
  ctx.add_init_script('window.open=url=>{window.orderURL=url;return null}')
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def visit(path):page.goto(BASE+path,wait_until='networkidle')
  def click(sel,n=1):
   for _ in range(n):page.locator(sel).click()
  def route(path):page.wait_for_url(BASE+path)
  def send(expected):
   page.evaluate('window.orderURL=null')
   click('.fd-order-submit');assert page.evaluate('window.orderURL') is None
   assert page.locator('#order-name').get_attribute('aria-invalid')=='true'
   assert page.locator('#order-villa').is_hidden()
   assert page.locator('#order-cabin-num-wrap').is_hidden()
   page.locator('#order-name').fill('ضيف الشاليه');page.locator('#order-notes').fill('عند الوصول')
   click('.fd-order-submit')
   url=urlparse(page.evaluate('window.orderURL'));assert url.path=='/966556156693'
   text=parse_qs(url.query)['text'][0];assert text==expected,(text,expected)
   page.wait_for_selector('#order-popup',state='hidden')
  prefix='السلام عليكم، أرغب بطلب الخدمات التالية:\n\nالاسم: ضيف الشاليه\nالمكان: شاليه يوم العائلة\n\nالطلبات:\n\n'
  visit('/chalet/')
  titles=page.locator('#landing3 .rh-menu .rh-map-title').all_text_contents()
  assert titles[:2]==['استكشف الشاليه من الداخل','خدمات الشاليه']
  if width==390:page.screenshot(path='/tmp/main-chalet-home.png',full_page=True)
  click('#landing3 a[href="/chalet/services/"]');route('/chalet/services/')
  assert page.locator('#services-overlay .svcs-title').inner_text()=='خدمات الشاليه'
  assert page.locator('#services-overlay .svcs-card:visible .svcs-name').all_text_contents()==['الألعاب الترفيهية','الألعاب المائية']
  if width==390:page.screenshot(path='/tmp/main-chalet-services.png')
  click('#services-overlay button[onclick="showTarfihi()"]');route('/chalet/services/games/')
  assert page.locator('#tarfihi-opt-table').is_hidden()
  assert page.locator('#tg-games-title').inner_text()=='الألعاب المشمولة في الباقة'
  assert page.locator('.tg-games li').count()==7
  page.evaluate("selectTarfihiOpt('table')")
  assert page.locator('.tg-order-button').is_disabled()
  assert page.evaluate("serviceOrderDetails({type:'games',option:'table'},false)") is None
  click('#tarfihi-opt-box');click('.tg-order-button')
  page.reload(wait_until='networkidle')
  assert page.locator('#order-popup').is_visible()
  assert '50 ريال' in page.locator('#order-item-name').inner_text()
  send(prefix+'الألعاب الترفيهية:\nبوكس الألعاب × 1 = 50 ريال\n\nإجمالي الطلب: 50 ريال\n\nملاحظات: عند الوصول')
  click('.tg-back');route('/chalet/services/')
  click('#services-overlay button[onclick="showMaiya()"]');route('/chalet/services/water-games/')
  assert page.locator('#maiya-order-btn').is_disabled()
  click('[data-water-packages][data-step="1"]')
  click('[data-water-group="adults"][data-step="1"]',4);click('[data-water-group="children"][data-step="1"]',2)
  assert page.locator('#wm-total').inner_text()=='100 ريال'
  click('[data-water-packages][data-step="-1"]')
  assert page.locator('#wm-adults').inner_text()=='0' and page.locator('#wm-children').inner_text()=='0'
  assert page.locator('#maiya-order-btn').is_disabled()
  click('[data-water-packages][data-step="1"]')
  click('[data-water-group="adults"][data-step="1"]',4);click('[data-water-group="children"][data-step="1"]',2)
  click('#maiya-order-btn');page.reload(wait_until='networkidle')
  assert page.locator('#order-popup').is_visible()
  assert '6 ألعاب بـ100 ريال' in page.locator('#order-item-name').inner_text()
  send(prefix+'الألعاب المائية:\nباقة ألعاب مائية × 2 = 100 ريال\nللكبار: 4\nللصغار: 2\n\nإجمالي الطلب: 100 ريال\n\nملاحظات: عند الوصول')
  click('.wm-back');route('/chalet/services/')
  click('.svcs-back');route('/chalet/')
  assert page.locator('#landing3').is_visible() and page.locator('#landing').is_hidden()
  # Switching venue restores its own selections and its full list of services.
  page.evaluate("showServices()")
  route('/services/')
  assert page.locator('#services-overlay .svcs-card:visible').count()==8
  page.evaluate('showTarfihi()');route('/services/games/')
  assert page.locator('#tarfihi-opt-table').is_visible()
  click('#tarfihi-opt-table');click('.tg-order-button')
  assert page.locator('#order-villa').is_visible()
  assert page.locator('#order-name').input_value()==''
  assert '150 ريال' in page.locator('#order-item-name').inner_text()
  page.locator('#order-name').fill('ضيف المنتجع')
  click('.fd-order-cancel');page.evaluate("showServices('chalet')");route('/chalet/services/')
  page.evaluate('showTarfihi()');route('/chalet/services/games/')
  assert page.locator('#tarfihi-opt-table').is_hidden()
  assert page.evaluate('_tarfihiOpt')!='table'
  click('#tarfihi-opt-box');click('.tg-order-button')
  assert page.locator('#order-name').input_value()==''
  assert page.locator('#order-villa').is_hidden()
  click('.fd-order-cancel');click('.tg-back');route('/chalet/services/')
  page.reload(wait_until='networkidle');assert page.locator('#services-overlay .svcs-title').inner_text()=='خدمات الشاليه'
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  print(width,'PASS two services, box only, exact prices and WhatsApp, reload, navigation and venue isolation',flush=True)
  ctx.close()
 b.close()

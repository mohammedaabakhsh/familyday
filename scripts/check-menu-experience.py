"""Exercise menu persistence, sticky navigation and checkout without contacting WhatsApp.
Requires Python Playwright and Chromium. Serve the repository locally first.
"""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8018'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for w,h in [(390,844),(320,740),(1440,1000)]:
  context=b.new_context(viewport={'width':w,'height':h});page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/menu/',wait_until='networkidle')
  page.locator('#menu-items button[aria-label="إضافة ساندويتش دجاج زنجر"]').click()
  page.locator('.menu-extra').first.click()
  page.locator('#menu-items button[aria-label="زيادة كمية ساندويتش دجاج زنجر"]').click()
  page.locator('#menu-cats button').filter(has_text='مشروبات باردة').click()
  page.locator('#menu-items button[aria-label="إضافة بيبسي"]').click()
  assert page.locator('.menu-order-button').inner_text()=='متابعة الطلب'
  page.locator('#menu-detail').evaluate('(e)=>e.scrollTop=e.scrollHeight')
  box=page.locator('#menu-cats').bounding_box();assert 0<=box['y']<=2,box
  page.screenshot(path=f'/tmp/menu-improved-{w}-sticky.png')
  page.locator('#menu-cats button').filter(has_text='وجبات خفيفة').click()
  cats=page.locator('#menu-cats').bounding_box();first=page.locator('#menu-items article').first.bounding_box()
  assert first['y']>=cats['y']+cats['height']-1,(first,cats)
  assert first['y']+first['height']<h-100,(first,h)
  page.reload(wait_until='networkidle')
  assert page.evaluate('_menuCartTotals()')=={'qty':3,'price':29}
  assert page.locator('#menu-cats .is-active').inner_text()=='وجبات خفيفة'
  size=page.locator('.menu-qty-button').first.bounding_box();assert size['width']>=44 and size['height']>=44,size
  page.locator('.menu-cart-trigger').click()
  assert page.locator('#menu-cart-review-total').inner_text()=='29 ريال'
  page.locator('button[onclick="continueMenuOrder()"]').click()
  assert page.locator('.menu-checkout-total strong').inner_text()=='29 ريال'
  summary=page.locator('.menu-checkout-summary').inner_text()
  assert 'ساندويتش دجاج زنجر × 2' in summary and 'جبنة — ساندويتش دجاج زنجر × 2' in summary and 'بيبسي × 1' in summary
  send=page.locator('button[onclick="sendOrderWhatsapp()"]')
  assert send.inner_text()=='الانتقال إلى واتساب'
  action=send.bounding_box();assert action['y']>=0 and action['y']+action['height']<=h,action
  page.screenshot(path=f'/tmp/menu-improved-{w}-checkout.png')
  # Required-field feedback remains usable; this cannot open WhatsApp.
  send.click();assert page.locator('#order-name').get_attribute('aria-invalid')=='true'
  page.locator('#order-name').fill('تجربة محلية')
  page.locator('#order-villa').select_option(label='بيت الدوم 1')
  # Capture the intended URL locally, suppressing any external navigation/message.
  page.evaluate('window.open=(url)=>{window.capturedOrderURL=url;return null}')
  send.click()
  from urllib.parse import unquote
  url=unquote(page.evaluate('window.capturedOrderURL'))
  assert 'الإجمالي: 29 ريال' in url and 'رقم 15' in url
  page.wait_for_function('history.state.route.name==="menu"')
  # Remove an extra and a base item; deleted rows must not reappear on reload.
  page.locator('.menu-cart-trigger').click()
  page.locator('#menu-cart-review button[data-cart-key="جبنة|ساندويتش دجاج زنجر"][data-cart-action="remove"]').click()
  page.locator('#menu-cart-review button[aria-label="حذف بيبسي"]').click()
  page.reload(wait_until='networkidle')
  assert page.evaluate('_menuCartTotals()')=={'qty':2,'price':22}
  # Both BBQ variants survive reload and use menu prices.
  if page.locator('#menu-cart-review').is_visible(): page.evaluate('closeMenuCartReview()')
  page.wait_for_function('history.state.route.name==="menu"')
  page.locator('#menu-cats button').filter(has_text='بوكسات الشواء').click()
  card=page.locator('#menu-items article').first
  card.locator('button').filter(has_text='لحم').click()
  card.locator('.menu-qty-button').last.click()
  card.locator('button').filter(has_text='دجاج').click()
  card.locator('.menu-qty-button').last.click()
  page.reload(wait_until='networkidle')
  assert page.evaluate('_menuCartTotals()')=={'qty':4,'price':192}
  assert page.locator('#menu-items article').first.locator('.menu-extra.is-selected').inner_text()=='دجاج'
  # A new page in this browser also restores the cart, but no personal data was stored.
  saved=page.evaluate('localStorage.getItem("familyday.menu-cart.v1")')
  assert 'تجربة محلية' not in saved and 'price' not in saved
  other=context.new_page();other.goto(BASE+'/menu/',wait_until='networkidle')
  assert other.evaluate('_menuCartTotals().price')==192
  other.close()
  # Emptying the cart removes its saved copy; unrelated services keep their original form.
  page.evaluate('Object.keys(_menuCart).forEach(k=>{delete _menuCart[k]});_updateMenuCartBar()')
  assert page.evaluate('localStorage.getItem("familyday.menu-cart.v1")') is None
  page.reload(wait_until='networkidle');assert page.evaluate('_menuCartTotals().qty')==0
  page.goto(BASE+'/services/cinema/',wait_until='networkidle')
  page.evaluate('openOrderPopup("جلسة السينما",true)')
  assert page.locator('.menu-checkout-summary').count()==0
  assert page.locator('#order-popup button[onclick="sendOrderWhatsapp()"]').inner_text()=='إكمال الطلب عبر واتساب'
  assert not errors,errors
  print(w,'PASS persistence, extras, BBQ, sticky categories, touch targets, summary and captured checkout',flush=True)
  context.close()
 # Invalid drafts and blocked storage must never stop ordering or introduce unknown items/prices.
 for saved in ['broken JSON','{"version":1,"items":[{"name":"unknown","qty":3},{"name":"بيبسي","qty":-1}]}','{"version":1,"items":[{"name":"بيبسي","qty":2,"price":0}]}']:
  context=b.new_context();context.add_init_script('(value=>localStorage.setItem("familyday.menu-cart.v1",value))('+__import__('json').dumps(saved)+')')
  page=context.new_page();page.goto(BASE+'/menu/',wait_until='networkidle')
  expected=10 if '"price":0' in saved else 0
  assert page.evaluate('_menuCartTotals().price')==expected
  context.close()
 context=b.new_context();context.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked")}})')
 page=context.new_page();page.goto(BASE+'/menu/',wait_until='networkidle')
 page.locator('.menu-qty-button').first.click();assert page.evaluate('_menuCartTotals().qty')==1
 assert page.locator('#menu-cart-bar').is_visible()
 print('PASS malformed/obsolete drafts, current prices and storage unavailable',flush=True)
 context.close();b.close()

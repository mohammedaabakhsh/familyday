"""Verify combined seating totals, partial add-ons, persistence and exact WhatsApp drafts."""
from playwright.sync_api import sync_playwright
from urllib.parse import urlparse,parse_qs
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=browser.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/services/outdoor-seating/',wait_until='networkidle')
  assert page.locator('.jl-card').count()==6
  assert not page.locator('#jalsat-cart').is_visible()
  card=page.locator('#jalsat-card-0')
  card.locator('summary').focus();page.keyboard.press('Enter')
  page.locator('#jalsat-card-1 summary').click()
  assert page.locator('.jl-card[open]').count()==2
  card.locator('.jl-session-quantity [data-change="1"]').click()
  card.locator('.jl-addon-option').click()
  assert card.locator('.jl-total strong').inner_text()=='770 ريال'
  assert card.locator('.jl-cake-quantity output').inner_text()=='1'
  card.locator('.jl-cake-quantity [data-change="1"]').click()
  assert card.locator('.jl-total strong').inner_text()=='940 ريال'
  card.locator('.jl-session-quantity [data-change="-1"]').click()
  assert card.locator('.jl-total strong').inner_text()=='470 ريال'
  assert not card.locator('.jl-cake-quantity').is_visible()
  card.locator('.jl-session-quantity [data-change="1"]').click()
  card.locator('.jl-order-button').click()
  page.locator('#jalsat-card-1 .jl-order-button').click()
  assert page.locator('#jalsat-cart-total').inner_text()=='1070 ريال'
  assert page.locator('#jalsat-cart-items .jl-cart-item').count()==2
  assert page.locator('#jalsat-card-1 .jl-addon-option').get_attribute('aria-pressed')=='false'
  # Repeated additions merge quantities, without losing the count of cake additions.
  page.locator('#jalsat-card-1 .jl-order-button').click()
  assert page.locator('#jalsat-cart-total').inner_text()=='1370 ريال'
  assert page.locator('#jalsat-cart-items .jl-cart-item').count()==2
  page.reload(wait_until='networkidle')
  assert page.locator('#jalsat-cart-total').inner_text()=='1370 ريال'
  page.locator('#setups-tab-cinema').click();page.locator('#setups-tab-seating').click()
  assert page.locator('#jalsat-cart-total').inner_text()=='1370 ريال'
  page.locator('#jalsat-checkout').click()
  page.evaluate('closeOrderPopup()')
  page.wait_for_selector('#order-popup',state='hidden')
  assert page.locator('#jalsat-cart-total').inner_text()=='1370 ريال'
  page.locator('#jalsat-checkout').click();page.reload(wait_until='networkidle')
  expected=['الجلسات الخارجية','جلسة بإطار مثلث','الجلسات: 2 × 300 ريال = 600 ريال','كيك وعصير: 1 × 170 ريال = 170 ريال','المجموع: 770 ريال','','الخيمة الهرمية','الجلسات: 2 × 300 ريال = 600 ريال','المجموع: 600 ريال','','إجمالي الطلب: 1370 ريال']
  assert page.locator('#order-item-name div').all_text_contents()==expected
  page.evaluate('window.orderURL=null;window.open=(url)=>{window.orderURL=url;return null}')
  page.locator('button[onclick="sendOrderWhatsapp()"]').click()
  assert page.evaluate('window.orderURL') is None
  page.locator('#order-name').fill('محمد');page.locator('#order-villa').select_option('بيت الدوم 1')
  page.locator('#order-notes').fill('الجلسات بجانب المسبح')
  page.locator('button[onclick="sendOrderWhatsapp()"]').click()
  url=urlparse(page.evaluate('window.orderURL'));assert url.path=='/966556156693'
  message='السلام عليكم، أرغب بطلب الجلسات الخارجية.\n\nالاسم: محمد\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\n'+'\n'.join(expected[1:])+'\n\nملاحظات: الجلسات بجانب المسبح'
  assert parse_qs(url.query)['text'][0]==message
  page.wait_for_selector('#order-popup',state='hidden')
  # Remove rows and the final item: empty cart cannot be submitted or resurrected on refresh.
  page.locator('#jalsat-cart-items button').first.click()
  assert page.locator('#jalsat-cart-total').inner_text()=='600 ريال'
  page.locator('#jalsat-cart-items button').first.click()
  assert not page.locator('#jalsat-cart').is_visible()
  page.reload(wait_until='networkidle');assert not page.locator('#jalsat-cart').is_visible()
  # All catalog entries, 1 and 3 sessions, with no / partial / all additions.
  for i,price in enumerate([300,300,200,300,550,650]):
   for qty,cakes in [(1,0),(1,1),(3,0),(3,1),(3,3)]:
    result=page.evaluate('(s)=>getJalsatCartDetails(s,false)',{'items':[{'index':i,'quantity':qty,'cakes':cakes,'price':1}]})
    assert result['price']==qty*price+cakes*170
  for item in [{'index':8,'quantity':1,'cakes':0},{'index':0,'quantity':0,'cakes':0},{'index':0,'quantity':1.5,'cakes':0},{'index':0,'quantity':1,'cakes':2},{'index':0,'quantity':1,'cakes':-1}]:
   assert page.evaluate('(item)=>getJalsatCartDetails({items:[item]},false)',item) is None
  assert page.evaluate('getJalsatCartDetails({items:[]},false)') is None
  assert page.evaluate('getJalsatCartDetails({items:[{index:0,quantity:1,cakes:0},{index:0,quantity:1,cakes:0}]},false)') is None
  page.evaluate('sessionStorage.setItem(JALSAT_CART_KEY,"broken");restoreJalsatCart()')
  assert not page.locator('#jalsat-cart').is_visible()
  page.locator('#jalsat-card-0 summary').click()
  page.locator('#jalsat-card-0 .jl-session-quantity [data-change="1"]').click()
  page.locator('#jalsat-card-0 .jl-addon-option').click()
  page.locator('#jalsat-card-0 .jl-order-button').click()
  assert page.evaluate('document.getElementById("setups-detail").scrollWidth<=innerWidth')
  if width==390:
   page.locator('#setups-detail').evaluate('(el)=>el.scrollTop=0')
   page.screenshot(path='/tmp/seating-cart-open.png')
   page.locator('#jalsat-cart').scroll_into_view_if_needed()
   page.screenshot(path='/tmp/seating-cart-summary.png')
  assert not errors,errors
  print(width,'PASS mixed/repeated sessions, partial add-ons, exact invoice and WhatsApp, removal, refresh, back, validation, 30 catalog totals and layout',flush=True)
  page.close()
 browser.close()

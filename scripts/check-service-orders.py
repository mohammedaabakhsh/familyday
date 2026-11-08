"""Verify service prices, prepared messages and checkout restoration without sending."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import os, sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
FONT=Path(os.environ.get('FD_TEST_FONT_CSS','/nonexistent'))
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(390,844),(1440,1000)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  if FONT.exists():page.route('https://fonts.googleapis.com/**',lambda r:r.fulfill(path=str(FONT),content_type='text/css'))
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def visit(path):
   page.goto(BASE+path,wait_until='networkidle');page.evaluate('document.fonts.ready')
  def checkout(button,request,details,time=None,reload=False):
   page.locator(button).click()
   if reload:page.reload(wait_until='networkidle')
   assert page.locator('#order-popup').is_visible()
   assert page.locator('#order-villa option[value="not-booked"]').count()==0
   assert page.locator('.fd-order-help').inner_text()=='تابع طلبك عبر واتساب'
   page.evaluate('window.open=(url)=>{window.orderURL=url;return null}')
   send=page.locator('button[onclick="sendOrderWhatsapp()"]')
   send.click();assert not page.evaluate('window.orderURL')
   page.locator('#order-name').fill('محمد');page.locator('#order-villa').select_option('بيت الدوم 1')
   assert page.locator('#order-cabin-num').inner_text()=='15'
   if time is not None:
    send.click();assert not page.evaluate('window.orderURL')
    assert page.locator('#order-time').get_attribute('aria-invalid')=='true'
    page.locator('#order-time').select_option(time)
   send.click()
   url=urlparse(page.evaluate('window.orderURL'));assert url.path=='/966556156693'
   expected='السلام عليكم، أرغب بطلب '+request+'.\n\nالاسم: محمد\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\n'+details
   actual=parse_qs(url.query)['text'][0];assert actual==expected,(actual,expected)
   page.wait_for_selector('#order-popup',state='hidden')
  visit('/services/games/')
  assert page.locator('.tg-games li').count()==7
  for option,label,price in [('box','بوكس الألعاب',50),('table','طاولة مع بوكس الألعاب',150)]:
   page.locator('#tarfihi-opt-'+option).click()
   checkout('.tg-order-button','الألعاب الترفيهية',f'الباقة: {label}\nالإجمالي: {price} ريال',reload=True)
   assert page.locator('#tarfihi-opt-'+option).get_attribute('aria-pressed')=='true'
  visit('/services/cinema/')
  assert page.locator('#cn-inclusions-title').inner_text()=='محتويات الجلسة'
  for hour,text in [('20','8:00 مساءً'),('24','12:00 صباحًا'),('26','2:00 صباحًا')]:
   checkout('.cn-order-button','جلسة السينما',f'وقت بداية الجلسة: {text}\nمدة الجلسة: 3 ساعات\nالإجمالي: 150 ريال',time=hour,reload=True)
  visit('/services/dining-tables/')
  for size,plain,decorated in [(6,199,399),(12,399,599),(18,599,799),(24,799,999),(32,999,1199)]:
   for option,price,label in [('plain',plain,'بدون تنسيق'),('tansiq',decorated,'مع تنسيق')]:
    page.locator('#ts-'+str(size)).click();page.locator('#tawilat-opt-'+option).click()
    checkout('.tw-contact','طاولات الطعام',f'عدد الأشخاص: {size}\nالتجهيز: {label}\nإجمالي الطلب: {price} ريال',reload=size==32)
    assert page.locator('#ts-'+str(size)).get_attribute('aria-pressed')=='true'
  visit('/services/outdoor-seating/')
  for i,name,people,price in [(0,'جلسة بإطار مثلث',2,300),(1,'الخيمة الهرمية',2,300),(2,'الجلسة الأرضية',4,200),(3,'جلسة أرضية بإطار خشبي لـ4 أشخاص',4,300),(4,'جلسة أرضية بإطار خشبي لـ8 أشخاص',8,550),(5,'جلسة أرضية بإطار خشبي لـ12 شخصًا',12,650)]:
   page.evaluate('(i)=>jalsatGoTo(i)',i)
   for cake in [False,True]:
    card=page.locator('#jalsat-card-'+str(i))
    if cake:card.locator('.jl-addon-option').click()
    details=f'الجلسة: {name}\nعدد الأشخاص: {people}\nسعر الجلسة: {price} ريال'
    if cake:details+='\nالإضافة: كيك وعصير — 170 ريال'
    details+=f'\nإجمالي الطلب: {price+(170 if cake else 0)} ريال'
    checkout('#jalsat-card-'+str(i)+' .jl-order-button','جلسة خارجية',details,reload=True)
    assert card.locator('.jl-card-title').inner_text()==name
    assert card.get_attribute('open') is not None
    assert card.locator('.jl-addon-option').get_attribute('aria-pressed')==str(cake).lower()
  visit('/services/hospitality/')
  assert page.locator('#hospitality-detail a[href*="wa.me"]').count()==0
  assert page.locator('#hospitality-detail .hd-package-note').count()==7
  assert page.locator('#hospitality-detail .hd-package').count()==9
  assert 'شاي' not in page.locator('#hospitality-detail').text_content()
  assert 'شاهي' in page.locator('#hospitality-detail').text_content()
  visit('/services/share-and-win/')
  body=parse_qs(urlparse(page.locator('#sharik-email-link').get_attribute('href')).query)['body'][0]
  assert all(t in body for t in ['الاسم:','تاريخ الزيارة:','رقم الجوال:'])
  visit('/#contest')
  link=page.locator('#contest-detail a[href*="wa.me"]').get_attribute('href')
  assert urlparse(link).path=='/966556615018'
  assert all(t in parse_qs(urlparse(link).query)['text'][0] for t in ['الاسم:','المنصة:','رابط الفيديو:','تاريخ نشر الفيديو:'])
  assert '14 يومًا' in page.locator('#contest-detail').inner_text()
  assert not errors,errors
  print(width,'PASS all service prices, exact messages, required fields, selections after reload, display-only packages and contest drafts',flush=True)
  page.close()
 browser.close()

"""Compare restaurant WhatsApp drafts across both UIs; never open/send WhatsApp."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import os, sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
FONT=Path(os.environ.get('FD_TEST_FONT_CSS','/nonexistent'))
EXPECTED='''السلام عليكم، أرغب بطلب من المطعم.

الاسم: ضيف التجربة
الكوخ: بيت الدوم 1
رقم الكوخ: 15

الطلب:

ساندويتشات:
برجر لحم × 1 = 9 ريال

الأطباق:
دجاج مسحب مع البطاطس × 1 = 22 ريال

وجبات خفيفة:
بطاطس صغيرة × 1 = 5 ريال
فشار صغير × 1 = 5 ريال

مشروبات باردة:
سفن أب × 1 = 5 ريال

إجمالي الطلب: 46 ريال'''
# Deliberately select in a different order; the message must follow the catalogue.
ORDER=[('مشروبات باردة','سفن أب'),('وجبات خفيفة','فشار صغير'),('الأطباق','دجاج مسحب مع البطاطس'),('ساندويتشات','برجر لحم'),('وجبات خفيفة','بطاطس صغيرة')]

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 messages=[]
 for guest in [False,True]:
  context=browser.new_context(viewport={'width':390,'height':844})
  if FONT.exists():context.route('https://fonts.googleapis.com/**',lambda r:r.fulfill(path=str(FONT),content_type='text/css'))
  context.add_init_script('window.open=(url)=>{window.orderURL=url;return null}')
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+('/guest-services/' if guest else '/menu/'),wait_until='networkidle')
  if guest:page.locator('#restaurant-card').click()
  def category(name):
   if guest:
    section=page.locator('[data-category="'+name+'"]')
    if not section.evaluate('(e)=>e.open'):section.locator('summary').click()
   else:page.locator('#menu-cats button').filter(has_text=name).click()
  def row(name):
   return page.locator('[data-menu-name="'+name+'"]') if guest else page.get_by_role('article',name=name,exact=True)
  for cat,name in ORDER:
   category(cat)
   row(name).locator('[data-step="1"]' if guest else '.menu-qty-button').last.click()
  def send(notes=''):
   if guest:
    page.locator('#apply-selection').click()
    page.locator('#restaurant-name').fill('ضيف التجربة')
    page.locator('#restaurant-cabin').select_option('بيت الدوم 1')
    page.locator('#restaurant-notes').fill(notes)
    page.locator('#restaurant-order .send-order').click()
   else:
    page.locator('.menu-order-button').click()
    page.locator('#order-name').fill('ضيف التجربة');page.locator('#order-villa').select_option('بيت الدوم 1')
    page.locator('#order-notes').fill(notes);page.locator('button[onclick="sendOrderWhatsapp()"]').click()
   url=urlparse(page.evaluate('window.orderURL'))
   assert url.hostname=='wa.me' and url.path=='/966537006531'
   return parse_qs(url.query)['text'][0]
  message=send();assert message==EXPECTED,message
  # Extra quantities and both BBQ variants must not be omitted or charged twice.
  if guest:page.locator('#restaurant-card').click()
  category('ساندويتشات');burger=row('برجر لحم')
  burger.locator('[data-step="1"]' if guest else '.menu-qty-button').last.click()
  if guest:burger.locator('[type=checkbox]').check()
  else:burger.locator('.menu-extra').click()
  category('بوكسات الشواء');bbq=row('بوكس الشواء بدون فحم')
  for meat in ['لحم','دجاج']:
   if guest:bbq.locator('select').select_option(label=meat)
   else:bbq.get_by_role('button',name=meat,exact=True).click()
   # Main menu re-renders after every choice; the locator resolves the new row.
   bbq.locator('[data-step="1"]' if guest else '.menu-qty-button').last.click()
  message=send('بدون بصل')
  assert 'برجر لحم × 2 = 18 ريال\n  إضافة جبنة × 2 = 2 ريال' in message
  assert 'بوكسات الشواء:\nبوكس الشواء بدون فحم — لحم × 1 = 85 ريال\nبوكس الشواء بدون فحم — دجاج × 1 = 85 ريال' in message
  assert message.endswith('إجمالي الطلب: 227 ريال\n\nملاحظات: بدون بصل')
  assert not errors,errors
  messages.append(message);context.close()
 assert messages[0]==messages[1]
 browser.close()
print('PASS identical restaurant messages: catalogue order, single total, quantities, cheese, both BBQ variants, notes and recipient')

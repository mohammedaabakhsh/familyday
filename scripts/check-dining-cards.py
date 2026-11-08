"""Dining card parity, all prices/messages, independent expansion and source updates."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
prices={6:(199,399),12:(399,599),18:(599,799),24:(799,999),32:(999,1199)}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=b.new_page(viewport={'width':width,'height':900},reduced_motion='reduce');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  snapshots=[]
  for path in ['/services/dining-tables/','/services-guide/#dining']:
   main='dining-tables' in path
   page.goto(BASE+path,wait_until='networkidle');page.wait_for_selector('.fd-dining-card',state='attached')
   assert page.locator('.fd-dining-card').count()==5
   assert page.locator('.fd-dining-card[open]').count()==0
   panel=page.locator('#tawilat-detail' if main else '#dining')
   assert panel.locator('img').count()==1
   hero=panel.locator('.dining-shared-photo')
   assert hero.is_visible()
   assert hero.bounding_box()['y']+hero.bounding_box()['height']<=page.locator('.fd-dining-card').first.bounding_box()['y']
   snapshot=[]
   for size,(plain,tansiq) in prices.items():
    card=page.locator('#dining-card-'+str(size))
    assert card.locator('.fd-dining-price').all_text_contents()==[str(plain)+' ريال',str(tansiq)+' ريال']
    assert card.locator('.fd-dining-option-desc').all_text_contents()==['طاولات وكراسي فقط','طاولات وكراسي مع تجهيز الطاولة']
    assert card.locator('.fd-dining-body').is_hidden()
    card.locator('summary').click()
    photo=hero
    assert photo.locator('.fd-dining-caption').inner_text()=='الصورة توضح التجهيز مع التنسيق'
    assert card.locator('img').count()==0
    assert card.locator('.fd-dining-hint').inner_text()=='تفاصيل التجهيز'
    image=photo.locator('img').first;image.scroll_into_view_if_needed()
    page.wait_for_function('(e)=>e.complete && e.naturalWidth>0',arg=image.element_handle())
    assert card.locator('.fd-dining-inclusions li').all_text_contents()==page.evaluate('_tawilatInclusions')
    snapshot.append([card.locator('.fd-dining-capacity').inner_text(),card.locator('.fd-dining-prices').inner_text(),card.locator('.fd-dining-inclusions').inner_text()])
    if main:
     assert card.locator('.fd-dining-checkout').is_disabled()
     for option,price,label in [('plain',plain,'بدون تنسيق'),('tansiq',tansiq,'مع تنسيق')]:
      card.locator('.fd-dining-option[data-option='+option+']').click()
      assert card.locator('.fd-dining-total strong').inner_text()==str(price)+' ريال'
      card.locator('.fd-dining-checkout').click()
      assert page.locator('#order-item-name').inner_text()==f'طاولات الطعام\nعدد الأشخاص: {size}\nالتجهيز: {label}\nإجمالي الطلب: {price} ريال'
      page.locator('#order-name').fill('اختبار');page.locator('#order-villa').select_option('بيت الدوم 1')
      page.evaluate('window.open=url=>{window.testURL=url;return null}')
      page.locator('.fd-order-submit').click()
      url=urlparse(page.evaluate('window.testURL'));assert url.path=='/966556156693'
      assert parse_qs(url.query)['text'][0]==f'السلام عليكم، أرغب بطلب طاولات الطعام.\n\nالاسم: اختبار\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\nعدد الأشخاص: {size}\nالتجهيز: {label}\nإجمالي الطلب: {price} ريال'
    else:
     assert card.locator('button,input,select,.fd-dining-order,a[href*="wa.me"]').count()==0
   assert page.locator('.fd-dining-card[open]').count()==5
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   snapshots.append(snapshot)
   page.locator('.fd-dining-card').evaluate_all('(cards)=>cards.forEach(c=>c.open=false)')
   page.locator('.fd-dining-card').first.locator('summary').focus();page.keyboard.press('Enter')
   assert page.locator('.fd-dining-card[open]').count()==1
   if width==390:
    page.locator('.fd-dining-card').first.scroll_into_view_if_needed()
    page.screenshot(path='/tmp/dining-'+('main' if main else 'guide')+'-new.png',full_page=True)
   if not main:
    page.emulate_media(media='print')
    assert page.locator('#dining-card-32 .fd-dining-body').is_visible()
    page.emulate_media(media='screen')
  assert snapshots[0]==snapshots[1]
  assert not errors,errors
  page.close();print(width,'PASS both layouts, 10 totals/messages, photos, multiple open, keyboard, print and overflow',flush=True)
 # The guide reads copy from the inert main template and prices from the shared catalogue.
 page=b.new_page()
 source=Path('index.html').read_text().replace('طاولات وكراسي فقط','طاولات وكراسي للاختبار')
 page.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
 data=Path('service-data.js').read_text().replace('tansiq:399,  plain:199','tansiq:400,  plain:200')
 page.route('**/service-data.js*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
 page.goto(BASE+'/services-guide/#dining',wait_until='networkidle')
 assert page.locator('#dining-card-6 .fd-dining-price').all_text_contents()==['200 ريال','400 ريال']
 assert page.locator('#dining-card-6 .fd-dining-option-desc').first.inner_text()=='طاولات وكراسي للاختبار'
 print('PASS shared template copy and price updates',flush=True)
 b.close()

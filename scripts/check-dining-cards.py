"""Compact dining parity, exclusive price selection, invoices and WhatsApp drafts."""
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
   page.goto(BASE+path,wait_until='networkidle');page.wait_for_selector('.fd-dining-table')
   panel=page.locator('#tawilat-detail' if main else '#dining')
   assert panel.locator('img').count()==1
   assert panel.locator('details,summary').count()==0
   assert panel.locator('.fd-dining-table').count()==1
   assert panel.locator('.fd-dining-row').count()==5
   assert panel.locator('.fd-dining-info').count()==1
   assert panel.locator('.fd-dining-inclusions li').all_text_contents()==page.evaluate('_tawilatInclusions')
   assert panel.locator('.fd-dining-option-desc').all_text_contents()==['طاولات وكراسي فقط','طاولات وكراسي مع تجهيز الطاولة']
   hero=panel.locator('.dining-shared-photo');table=panel.locator('.fd-dining-table');info=panel.locator('.fd-dining-info')
   assert hero.bounding_box()['y']+hero.bounding_box()['height']<=table.bounding_box()['y']
   assert table.bounding_box()['y']+table.bounding_box()['height']<=info.bounding_box()['y']
   assert table.bounding_box()['height']<410
   assert hero.locator('.fd-dining-caption').inner_text()=='الصورة توضح التجهيز مع التنسيق'
   image=hero.locator('img');image.scroll_into_view_if_needed()
   page.wait_for_function('(e)=>e.complete && e.naturalWidth>0',arg=image.element_handle())
   assert table.locator('thead th').all_text_contents()==['الأشخاص','بدون تنسيق','مع تنسيق']
   if main:
    assert panel.locator('.fd-dining-option').count()==10
    assert panel.locator('.fd-dining-option[aria-pressed=true]').count()==0
    assert panel.locator('.fd-dining-checkout').is_disabled()
   else:assert panel.locator('button,input,select,a[href*="wa.me"],.fd-dining-order').count()==0
   snapshot=[]
   for size,(plain,tansiq) in prices.items():
    row=page.locator('#dining-card-'+str(size))
    assert row.locator('.fd-dining-price').all_text_contents()==[str(plain),str(tansiq)]
    assert row.locator('th').get_attribute('scope')=='row'
    assert row.locator('.fd-dining-capacity').inner_text()==str(size)
    snapshot.append(row.inner_text())
    if main:
     for option,price,label in [('plain',plain,'بدون تنسيق'),('tansiq',tansiq,'مع تنسيق')]:
      button=row.locator('.fd-dining-option[data-option='+option+']')
      button.click()
      assert panel.locator('.fd-dining-option[aria-pressed=true]').count()==1
      assert button.get_attribute('aria-pressed')=='true'
      assert panel.locator('.fd-dining-total strong').inner_text()==str(price)+' ريال'
      assert str(size) in page.locator('#dining-selection').inner_text() and label in page.locator('#dining-selection').inner_text()
      panel.locator('.fd-dining-checkout').click()
      if size==32:
       page.reload(wait_until='networkidle')
       assert button.get_attribute('aria-pressed')=='true'
       assert panel.locator('.fd-dining-option[aria-pressed=true]').count()==1
      assert page.locator('#order-item-name').inner_text()==f'طاولات الطعام\nعدد الأشخاص: {size}\nالتجهيز: {label}\nإجمالي الطلب: {price} ريال'
      page.locator('#order-name').fill('اختبار');page.locator('#order-villa').select_option('بيت الدوم 1')
      page.evaluate('window.open=url=>{window.testURL=url;return null}')
      page.locator('.fd-order-submit').click()
      url=urlparse(page.evaluate('window.testURL'));assert url.path=='/966556156693'
      assert parse_qs(url.query)['text'][0]==f'السلام عليكم، أرغب بطلب طاولات الطعام.\n\nالاسم: اختبار\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\nعدد الأشخاص: {size}\nالتجهيز: {label}\nإجمالي الطلب: {price} ريال'
   snapshots.append(snapshot)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if main:
    target=page.locator('#dining-card-6 .fd-dining-option[data-option=plain]');target.focus();page.keyboard.press('Enter')
    assert target.get_attribute('aria-pressed')=='true'
    assert panel.locator('.fd-dining-option[aria-pressed=true]').count()==1
   else:
    page.emulate_media(media='print');assert table.is_visible() and info.is_visible();page.emulate_media(media='screen')
   if width==390:
    table.scroll_into_view_if_needed()
    page.screenshot(path='/tmp/dining-'+('main' if main else 'guide')+'-compact.png',full_page=True)
  assert snapshots[0]==snapshots[1]
  assert not errors,errors
  page.close();print(width,'PASS compact shared rows, single photo/details, 10 totals/messages, exclusive selection, restoration, keyboard and print',flush=True)
 page=b.new_page()
 source=Path('index.html').read_text().replace('طاولات وكراسي فقط','طاولات وكراسي للاختبار')
 page.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
 data=Path('service-data.js').read_text().replace('tansiq:399,  plain:199','tansiq:400,  plain:200')
 page.route('**/service-data.js*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
 page.goto(BASE+'/services-guide/#dining',wait_until='networkidle')
 assert page.locator('#dining-card-6 .fd-dining-price').all_text_contents()==['200','400']
 assert page.locator('#dining .fd-dining-option-desc').first.inner_text()=='طاولات وكراسي للاختبار'
 print('PASS shared template copy and price updates',flush=True)
 b.close()

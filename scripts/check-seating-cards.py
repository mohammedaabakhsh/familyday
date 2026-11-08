"""Exercise independent seating cards, checkout restoration and exact WhatsApp drafts."""
from playwright.sync_api import sync_playwright
from urllib.parse import urlparse,parse_qs
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/services/outdoor-seating/',wait_until='networkidle')
  cards=page.locator('.jl-card')
  assert cards.count()==6
  assert page.locator('.jl-card[open]').count()==0
  assert page.locator('#jalsat-filter-title').count()==0
  sessions=page.evaluate('_jalsatAllSessions')
  # Keyboard disclosure and comparison: opening another does not close the first.
  cards.nth(0).locator('summary').focus();page.keyboard.press('Enter')
  cards.nth(1).locator('summary').click()
  assert page.locator('.jl-card[open]').count()==2
  cards.nth(0).locator('.jl-addon-option').click()
  assert cards.nth(0).locator('.jl-total strong').inner_text()=='470 ريال'
  assert cards.nth(1).locator('.jl-total strong').inner_text()=='300 ريال'
  cards.nth(0).locator('summary').click();cards.nth(0).locator('summary').click()
  assert cards.nth(0).locator('.jl-addon-option').get_attribute('aria-pressed')=='true'
  cards.nth(0).locator('.jl-addon-option').click()
  for index,session in enumerate(sessions):
   for cake in [False,True]:
    card=page.locator('#jalsat-card-'+str(index))
    if card.get_attribute('open') is None:card.locator('summary').click()
    toggle=card.locator('.jl-addon-option')
    if (toggle.get_attribute('aria-pressed')=='true')!=cake:toggle.click()
    price=int(session['price'].split()[0]);total=price+(170 if cake else 0)
    assert card.locator('.jl-total strong').inner_text()==f'{total} ريال'
    card.locator('.jl-card-image').scroll_into_view_if_needed()
    page.wait_for_function('(id)=>{const img=document.querySelector(id+" .jl-card-image");return img.complete && img.naturalWidth>0}',arg='#jalsat-card-'+str(index))
    card.locator('.jl-order-button').click()
    if cake:page.reload(wait_until='networkidle')
    expected=[session['name'],'عدد الأشخاص: '+session['personsCat'],'سعر الجلسة: '+session['price']]
    if cake:expected+=['كيك وعصير: 170 ريال']
    expected+=[f'إجمالي الطلب: {total} ريال']
    assert page.locator('#order-item-name div').all_text_contents()==expected
    page.evaluate('window.orderURL=null;window.open=(url)=>{window.orderURL=url;return null}')
    page.locator('#order-name').fill('');page.locator('#order-villa').select_option('')
    page.locator('button[onclick="sendOrderWhatsapp()"]').click()
    assert page.evaluate('window.orderURL') is None
    page.locator('#order-name').fill('محمد')
    page.locator('#order-villa').select_option('بيت الدوم 1')
    page.locator('button[onclick="sendOrderWhatsapp()"]').click()
    url=urlparse(page.evaluate('window.orderURL'))
    assert url.path=='/966556156693'
    text=parse_qs(url.query)['text'][0]
    message='السلام عليكم، أرغب بطلب جلسة خارجية.\n\nالاسم: محمد\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\nالجلسة: '+session['name']+'\nعدد الأشخاص: '+session['personsCat']+'\nسعر الجلسة: '+session['price']
    if cake:message+='\nالإضافة: كيك وعصير — 170 ريال'
    message+=f'\nإجمالي الطلب: {total} ريال'
    assert text==message,(text,message)
    page.wait_for_selector('#order-popup',state='hidden')
    assert card.get_attribute('open') is not None
    assert toggle.get_attribute('aria-pressed')==str(cake).lower()
  # Tab navigation retains independent card selections.
  page.locator('#setups-tab-cinema').click();page.locator('#setups-tab-seating').click()
  assert page.locator('#jalsat-card-5 .jl-addon-option').get_attribute('aria-pressed')=='true'
  assert page.evaluate('document.getElementById("setups-detail").scrollWidth<=innerWidth')
  for card in cards.all():
   bounds=card.bounding_box();assert bounds['x']>=0 and bounds['x']+bounds['width']<=width+1
  assert not errors,errors
  if width==390:
   page.goto(BASE+'/services/outdoor-seating/',wait_until='networkidle')
   page.screenshot(path='/tmp/seating-cards-closed.png')
   page.locator('#jalsat-card-0 summary').click()
   page.screenshot(path='/tmp/seating-cards-open.png')
  print(width,'PASS: six cards, 12 exact WhatsApp drafts/totals, required fields, reload, independent add-ons, comparison, keyboard and layout',flush=True)
  page.close()
 browser.close()

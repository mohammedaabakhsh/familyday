"""Standalone service invoices/drafts stay isolated; native main and chalet policies remain intact."""
import json,os,sys
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from html.parser import HTMLParser
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8163';OUT=Path(sys.argv[2]) if len(sys.argv)>2 else R/'site/audits/guest-independent-v113.json'
SERVICES=['restaurant','hospitality','extras','water','games'];errors=[];checks=[]
BODY={'restaurant':'الطلب:\nساندويتش دجاج زنجر — الكمية: 2 — 22 ريال\nبيبسي — الكمية: 1 — 5 ريال\n\nإجمالي الطلب: 27 ريال','hospitality':'الباقة: الضيافة السعودية\nالكمية: 1\nإجمالي الطلب: 59 ريال','extras':'الصنف: روب ومناشف لشخص واحد\nالكمية: 1\nإجمالي الطلب: 20 ريال','water':'الباقة: باقة ألعاب مائية\nالكمية: 1\nألعاب للكبار: 2\nألعاب للأطفال: 1\nإجمالي الطلب: 50 ريال','games':'الباقة: بوكس الألعاب\nالكمية: 1\nإجمالي الطلب: 50 ريال'}
GREETING={'restaurant':'من المطعم','hospitality':'ضيافة','extras':'مستلزمات إضافية','water':'ألعاب مائية','games':'ألعاب ترفيهية'}
TITLE={'restaurant':'المطعم','hospitality':'الضيافة','extras':'طلبات إضافية','water':'الألعاب المائية','games':'الألعاب الترفيهية'}
FOLLOW={'restaurant':'تابع طلبك مع المطعم على واتساب','hospitality':'تابع طلب الضيافة مع خدمات المنتجع على واتساب','extras':'تابع طلب المستلزمات الإضافية مع خدمات المنتجع على واتساب','water':'تابع طلب الألعاب المائية مع خدمات المنتجع على واتساب','games':'تابع طلب الألعاب الترفيهية مع خدمات المنتجع على واتساب'}
class Preview(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content')
  if tag=='img' or tag=='link' and a.get('href') and ('icon' in a.get('rel','') or a.get('as')=='image'):self.images.append(a)
def increment(page,selector,n=1):
 for _ in range(n):page.locator(selector).first.click()
def choose(page,kind):
 page.locator('#'+kind+'-card').click();expect(page.locator('#service-dialog')).to_be_visible();assert page.url==BASE+'/guest-services/'+kind+'/'
 if kind=='restaurant':
  page.locator('[data-category="ساندويتشات"]>summary').click();increment(page,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]',2)
  page.locator('[data-category="مشروبات باردة"]>summary').click();expect(page.locator('#dialog-total')).to_have_text('22');increment(page,'[data-menu-name="بيبسي"] [data-step="1"]')
 elif kind=='hospitality':increment(page,'.hospitality-quantity [data-step="1"]')
 elif kind=='extras':increment(page,'[data-extra="robe"] [data-step="1"]')
 elif kind=='water':
  increment(page,'[data-water="adults"][data-step="1"]',2);expect(page.locator('#apply-selection')).to_be_disabled();increment(page,'[data-water="children"][data-step="1"]')
 else:page.locator('[name="games-package"][value="box"]').check()
def invoice(page):
 page.locator('#apply-selection').click();expect(page.locator('#service-request-dialog')).to_be_visible();expect(page.locator('#service-dialog')).to_be_hidden();expect(page.locator('#orders-summary')).to_be_hidden();assert page.locator('#service-request-dialog [data-share],#service-request-dialog .resort-service-share').count()==0
 assert page.locator('#service-request-dialog').inner_text().count('إجمالي الطلب')==1
 expect(page.locator('#service-request-dialog .send-order')).to_have_text('إرسال الطلب')
def fill(page,notes=''):
 page.locator('#service-request-name').fill('محمد');page.locator('#service-request-cabin').select_option('بيت الدوم 1');page.locator('#service-request-notes').fill(notes);expect(page.locator('#service-request-dialog .cabin-number')).to_contain_text('15')
def draft(page):
 page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_hidden();expect(page.locator('#orders-summary')).to_be_hidden();assert page.url==BASE+'/guest-services/';u=page.evaluate('opened.at(-1)');return u,parse_qs(urlparse(u).query)['text'][0]
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568),(390,430)]):
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+'/guest-services/');page.locator('body.guest-independent-orders').wait_for()
  for kind in SERVICES:
   choose(page,kind);share=page.locator('#service-dialog .resort-service-share');expect(share).to_be_enabled();share.click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/guest-services/'+kind+'/'}
   assert page.title()==TITLE[kind]+' | منتجع يوم العائلة';assert 'منتجع يوم العائلة' not in page.locator('meta[name="description"]').get_attribute('content')
   invoice(page);expect(page.locator('#service-request-name')).to_have_value('');expect(page.locator('#service-request-cabin')).to_have_value('');expect(page.locator('#service-request-dialog .confirmation-note')).to_have_text(FOLLOW[kind])
   page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_visible();assert page.evaluate('opened.length')==SERVICES.index(kind)
   fill(page,'بدون إرسال فعلي' if kind=='water' else '')
   assert page.locator('#service-request-name').evaluate('e=>getComputedStyle(e).fontSize')=='16px';assert page.locator('#service-request-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth+1');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if width==390 and height==844:
    d=Path('/tmp/guest-independent-v113');d.mkdir(exist_ok=True);page.screenshot(path=str(d/(kind+('-live' if BASE.startswith('https:') else '')+'.png')))
   u,text=draft(page);assert urlparse(u).path=='/'+('966537006531' if kind=='restaurant' else '966556156693')
   expected='السلام عليكم، أرغب بطلب '+GREETING[kind]+'.\n\nالاسم: محمد\nاسم الكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\n'+BODY[kind]+('\n\nملاحظات: بدون إرسال فعلي' if kind=='water' else '')
   assert text==expected,(kind,text,expected);assert page.locator('#service-request-name').input_value()=='';checks.append({'width':width,'height':height,'service':kind,'exactApprovedDraft':True,'oneIndependentInvoice':True,'correctOwnURLAndPreview':True,'clearsAfterDraft':True});print(width,height,kind,'PASS',flush=True)
  # Explicit edit is within the active order; closing, browser return, refresh and background are exits.
  choose(page,'hospitality');invoice(page);fill(page,'طلب مؤقت');page.locator('.request-edit').click();expect(page.locator('#service-dialog')).to_be_visible();expect(page.locator('.hospitality-quantity output').first).to_have_text('1');increment(page,'.hospitality-quantity [data-step="1"]');invoice(page);expect(page.locator('#service-request-total')).to_have_text('118');expect(page.locator('#service-request-name')).to_have_value('محمد');page.locator('#service-request-dialog .dialog-close').click();expect(page.locator('#service-request-dialog')).to_be_hidden();page.go_forward();expect(page.locator('#service-request-dialog')).to_be_hidden();expect(page.locator('#service-dialog')).to_be_visible();expect(page.locator('.hospitality-quantity output').first).to_have_text('0');page.locator('#service-dialog .dialog-close').click()
  choose(page,'games');invoice(page);fill(page);page.go_back();expect(page.locator('#service-request-dialog')).to_be_hidden();choose(page,'games');invoice(page);expect(page.locator('#service-request-name')).to_have_value('');fill(page);background(page);expect(page.locator('#service-request-dialog')).to_be_hidden();choose(page,'games');invoice(page);expect(page.locator('#service-request-name')).to_have_value('');page.reload();page.locator('body.guest-independent-orders').wait_for();expect(page.locator('#service-request-dialog')).to_be_hidden();expect(page.locator('[name="games-package"]:checked')).to_have_count(0);page.locator('#service-dialog .dialog-close').click()
  # Cancelling after an internal edit must also erase the invoice customer details.
  choose(page,'hospitality');invoice(page);fill(page,'تفاصيل مؤقتة');page.locator('.request-edit').click();expect(page.locator('#service-dialog')).to_be_visible();page.locator('#service-dialog .dialog-close').click();choose(page,'extras');invoice(page);expect(page.locator('#service-request-name')).to_have_value('');expect(page.locator('#service-request-notes')).to_have_value('');page.keyboard.press('Escape');expect(page.locator('#service-request-dialog')).to_be_hidden()
  choose(page,'games');invoice(page);fill(page);page.mouse.click(2,2);expect(page.locator('#service-request-dialog')).to_be_hidden();expect(page.locator('#service-request-name')).to_have_value('')
  choose(page,'hospitality');invoice(page);fill(page);page.evaluate("location.hash='water'");expect(page.locator('#service-request-dialog')).to_be_hidden();expect(page.locator('#service-dialog')).to_have_attribute('data-tone','water');expect(page.locator('#water-adults')).to_have_text('0');expect(page.locator('#service-request-name')).to_have_value('');page.locator('#service-dialog .dialog-close').click()
  if width==390 and height==844:
   # Multiple packages/items and options retain their own prices and exact quantities.
   choose(page,'hospitality');increment(page,'.hospitality-quantity [data-step="1"]');increment(page,'.hospitality-package:nth-child(2) .hospitality-quantity [data-step="1"]');invoice(page);expect(page.locator('#service-request-total')).to_have_text('193');fill(page);_,text=draft(page);assert 'الضيافة السعودية — الكمية: 2 — 118 ريال' in text and 'ضيافة الاسترخاء — الكمية: 1 — 75 ريال' in text
   choose(page,'extras');increment(page,'[data-extra="bath"] [data-step="1"]',2);invoice(page);expect(page.locator('#service-request-total')).to_have_text('50');fill(page);_,text=draft(page);assert 'الأصناف:' in text and 'مجموعة مستلزمات الاستحمام — الكمية: 2 — 30 ريال' in text
   choose(page,'water');page.locator('#service-dialog .dialog-close').click();page.locator('#water-card').click();increment(page,'[data-water-packages][data-step="1"]');increment(page,'[data-water="adults"][data-step="1"]',4);increment(page,'[data-water="children"][data-step="1"]',2);invoice(page);expect(page.locator('#service-request-total')).to_have_text('100');fill(page);_,text=draft(page);assert 'الكمية: 2\nألعاب للكبار: 4\nألعاب للأطفال: 2' in text
   page.locator('#restaurant-card').click();page.locator('[data-category="ساندويتشات"]>summary').click();increment(page,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]',2);page.locator('[data-menu-name="ساندويتش دجاج زنجر"] input[type="checkbox"]').check();page.locator('[data-category="بوكسات الشواء"]>summary').click();box=page.locator('[data-menu-name="بوكس الشواء مع الفحم"]');box.locator('select').select_option('بوكس الشواء مع الفحم — دجاج');box.locator('[data-step="1"]').click();invoice(page);expect(page.locator('#service-request-total')).to_have_text('144');fill(page);_,text=draft(page);assert 'ساندويتش دجاج زنجر — مع جبنة — الكمية: 2 — 24 ريال' in text and 'بوكس الشواء مع الفحم — دجاج — الكمية: 1 — 120 ريال' in text
  # Actual crawler HTML must identify each service without images or duplicated venue in description.
  for kind in SERVICES:
   raw=c.request.get(BASE+'/guest-services/'+kind+'/').text();preview=Preview();preview.feed(raw);assert preview.meta['og:title']==TITLE[kind]+' | منتجع يوم العائلة';assert 'منتجع يوم العائلة' not in preview.meta['og:description'];assert not preview.images and 'og:image' not in preview.meta and 'twitter:image' not in preview.meta
  c.close()
 # Main retains its own checkout and uses the approved standalone wording.
 c=b.new_context(viewport={'width':390,'height':844},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.open=u=>{top.opened.push(u);return null}");page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 for kind,path in [('games','/services/games/'),('hospitality','/services/hospitality/packages/'),('water','/services/water-games/')]:
  page.goto(BASE+path);page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();frame=page.frame_locator('.native-order-frame');assert frame.locator('#service-request-dialog').count()==0;assert frame.locator('body.guest-independent-orders').count()==0
  if kind=='games':frame.locator('[name="games-package"][value="box"]').check()
  elif kind=='hospitality':frame.locator('.hospitality-quantity [data-step="1"]').first.click()
  else:
   for _ in range(3):frame.locator('[data-water="adults"][data-step="1"]').click()
  frame.locator('#guest-name').fill('فحص الرئيسي');frame.locator('#guest-cabin').select_option('بيت الدوم 1');frame.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();u=page.evaluate('opened.at(-1)');assert urlparse(u).path=='/966556156693';assert parse_qs(urlparse(u).query)['text'][0].startswith('السلام عليكم، أرغب بطلب '+GREETING[kind]+'.')
 c.close()
 c=b.new_context(viewport={'width':390,'height':844},ignore_https_errors=True);c.add_init_script("Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:undefined})");page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 for kind in SERVICES:
  page.goto(BASE+'/guest-services/#'+kind);page.locator('body.guest-independent-orders').wait_for();expect(page.locator('#service-dialog')).to_be_visible();assert page.url==BASE+'/guest-services/'+kind+'/'
 page.locator('#service-dialog .resort-service-share').click();expect(page.locator('#share-dialog')).to_be_visible();expect(page.locator('#share-dialog h2')).to_have_text('رابط الألعاب الترفيهية');expect(page.locator('#share-link')).to_have_value(BASE+'/guest-services/games/')
 c.close();b.close()
assert not errors,errors
OUT.write_text(json.dumps({'version':'20261127-guest-independent-v113','cases':checks,'mainNativeUnchanged':True,'multiItemsAndOptions':True,'editAndExitPrivacy':True,'errors':errors,'messagesSent':False},ensure_ascii=False,indent=2)+'\n')

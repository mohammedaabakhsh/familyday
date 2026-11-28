"""Exercise main/source resort parity with intercepted drafts; never send a message."""
import json,os,sys
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8168'
R=Path(__file__).resolve().parents[1];out={'version':'20261127-main-guest-v114','checks':[],'errors':[],'messagesSent':False}
PATHS={'restaurant':'/menu/','hospitality':'/services/hospitality/packages/','extras':'/services/extras/','water':'/services/water-games/','games':'/services/games/'}
LABELS={'hospitality':'اطلب الضيافة','extras':'اطلب هذه المستلزمات','water':'اطلب الألعاب المائية','games':'اطلب الألعاب الترفيهية'}
CARDS=['اختاروا باقة الضيافة المناسبة لكم','مستلزمات تحتاجونها أثناء الإقامة','ألعاب مائية للكبار والأطفال','بوكس ألعاب أو طاولة مع البوكس']
FOLLOW={'restaurant':'تابع طلبك مع المطعم على واتساب','hospitality':'تابع طلب الضيافة مع خدمات المنتجع على واتساب','extras':'تابع طلب المستلزمات الإضافية مع خدمات المنتجع على واتساب','water':'تابع طلب الألعاب المائية مع خدمات المنتجع على واتساب','games':'تابع طلب الألعاب الترفيهية مع خدمات المنتجع على واتساب'}
def inc(p,selector,n=1):
 for _ in range(n):p.locator(selector).first.click()
def choose(p,kind,advanced=False,main=False):
 if kind=='restaurant':
  if not main:p.locator('[data-category="ساندويتشات"]>summary').click()
  row=p.locator('[data-menu-name="ساندويتش دجاج زنجر"]');row.locator('[data-step="1"]').click();row.locator('[data-step="1"]').click()
  if advanced:
   row.locator('input[type="checkbox"]').check()
   if main:p.locator('.restaurant-menu-tabs button').get_by_text('بوكسات الشواء',exact=True).click()
   else:p.locator('[data-category="بوكسات الشواء"]>summary').click()
   row=p.locator('[data-menu-name="بوكس الشواء مع الفحم"]');row.locator('select').select_option('دجاج' if main else 'بوكس الشواء مع الفحم — دجاج');row.locator('[data-step="1"]').click()
 elif kind=='hospitality':
  inc(p,'.hospitality-quantity [data-step="1"]',2 if advanced else 1)
  if advanced:inc(p,'.hospitality-package:nth-child(2) .hospitality-quantity [data-step="1"]')
 elif kind=='extras':
  inc(p,'[data-extra="robe"] [data-step="1"]')
  if advanced:inc(p,'[data-extra="bath"] [data-step="1"]',2)
 elif kind=='water':
  inc(p,'[data-water-packages][data-step="1"]',2 if advanced else 1)
  inc(p,'[data-water="adults"][data-step="1"]',4 if advanced else 2);inc(p,'[data-water="children"][data-step="1"]',2 if advanced else 1)
 else:p.locator('[name="games-package"][value="'+('table' if advanced else 'box')+'"]').check()
def fill(p,prefix):
 p.locator('#'+prefix+'-name').fill('محمد');p.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1');p.locator('#'+prefix+'-notes').fill('تجربة بدون إرسال')
def draft(page):
 u=page.evaluate('opened.at(-1)');return urlparse(u).path,parse_qs(urlparse(u).query)['text'][0]
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.goto(BASE+'/services/');page.locator('.service-categories button').get_by_text('الإقامة',exact=True).click();expect(page.locator('.svcs-card:visible')).to_have_count(4);assert page.locator('.svcs-description:visible').all_text_contents()==CARDS
  assert page.locator('.svcs-card:visible').evaluate_all('es=>es.map(e=>e.pathname)')==[PATHS[k] for k in LABELS]
  if width==390:
   page.screenshot(path='/tmp/main-guest-v114-directory.png')
  for advanced in ([False,True] if width==390 else [False]):
   for kind,path in PATHS.items():
    page.goto(BASE+path);page.locator('#main h1').wait_for();page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
    expect(page.locator('#main [data-package-photo]')).to_have_count(0)
    if kind=='restaurant':
     expect(page.locator('.restaurant-menu-tabs button')).to_have_count(6);choose(page,kind,advanced,True);fill(page,'inline-restaurant');expect(page.locator('.inline-restaurant-confirmation')).to_have_text(FOLLOW[kind]);expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#inline-restaurant-order .button.primary').click();expect(page.locator('#inline-restaurant-summary')).to_be_hidden()
    else:
     expect(page.locator('#main [data-service-portal]')).to_have_text(LABELS[kind]);page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');expect(f.locator('#guest-name')).to_have_value('');expect(f.locator('#guest-cabin')).to_have_value('');choose(f,kind,advanced);fill(f,'guest');expect(f.locator('.resort-direct-confirmation')).to_have_text(FOLLOW[kind]);expect(page.locator('#native-order-title')).to_contain_text('طلب');f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
    mainDraft=draft(page);assert mainDraft[0]=='/'+('966537006531' if kind=='restaurant' else '966556156693')
    # Compare the real controllers for identical choices, including notes, cheese, variant and water allocation.
    page.goto(BASE+'/guest-services/'+kind+'/');page.locator('body.guest-independent-orders').wait_for();expect(page.locator('#service-dialog')).to_be_visible();share=page.locator('#service-dialog .resort-service-share');expect(share).to_be_enabled();share.click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/guest-services/'+kind+'/'};choose(page,kind,advanced);page.locator('#apply-selection').click();fill(page,'service-request');page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_hidden();assert draft(page)==mainDraft,(kind,advanced,draft(page),mainDraft)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');out['checks'].append({'width':width,'service':kind,'advanced':advanced,'exactDraftAndRecipientParity':True,'ownInterfaceShare':True});print(width,kind,advanced,'PASS',flush=True)
  # The newly added native service must discard identity/selections on every actual exit.
  for exit in ['close','back','background','reload']:
   page.goto(BASE+PATHS['extras']);page.reload();page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');choose(f,'extras');fill(f,'guest')
   if exit=='close':page.locator('.native-order-close').click()
   elif exit=='back':page.go_back()
   elif exit=='background':background(page)
   else:page.reload()
   expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame')
   for key,value in [('name','محمد'),('cabin','بيت الدوم 1'),('notes','تجربة بدون إرسال')]:expect(f.locator('#guest-'+key)).to_have_value(value if exit in ['close','back'] else '')
   expect(f.locator('[data-extra="robe"] output')).to_have_text('1' if exit in ['close','back'] else '0');page.locator('.native-order-close').click()
  for kind,path in PATHS.items():
   source=c.request.get(BASE+'/guest-services/'+kind+'/').text();native=c.request.get(BASE+path).text();assert 'og:image' not in native and 'twitter:image' not in native
   import re
   desc=lambda html:re.search(r'<meta property="og:description" content="([^"]+)"',html)[1]
   assert desc(source)==desc(native),(kind,desc(source),desc(native));assert 'منتجع يوم العائلة' not in desc(native)
  c.close()
 b.close()
assert not out['errors'],out['errors'];report=Path('/tmp/main-guest-parity-v114-live.json') if BASE.startswith('https:') else R/'site/audits/main-guest-parity-v114.json';report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Main/source exact parity, independent links, static photos, privacy and previews PASS')

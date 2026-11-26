"""Standalone order details expire on leave/return; WhatsApp drafts are intercepted."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import json,os,sys
from playwright.sync_api import sync_playwright,expect

R=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150'
KEYS=['familyday.resort-direct-identity.v1','familyday.guest-orders.v2','familyday.arrangements-orders.v1','familyday.chalet-guest-orders.v1','familyday.guest-extras.v1','familyday.menu-cart.v1']
out={'version':'20261126-live-v101','profiles':[],'errors':[],'messagesSent':False}
seed="""window.opened=[];window.open=url=>{opened.push(url);return null};
if(!sessionStorage.getItem('privacy-seeded')){
 for(const storage of [localStorage,sessionStorage]){
  for(const key of %s)storage.setItem(key,JSON.stringify({name:'قديم',cabin:'بيت الدوم 1',notes:'قديم',games:'box',quantities:{'package-1':3}}));
  storage.setItem('unrelated-preference','keep');
 }
 sessionStorage.setItem('privacy-seeded','yes');
}"""%json.dumps(KEYS)

def clean(page):
 assert page.evaluate('(keys)=>[localStorage,sessionStorage].every(s=>keys.every(k=>s.getItem(k)===null)&&s.getItem("unrelated-preference")==="keep")',KEYS)

def blank(page,prefix):
 for field in ['name','notes']+(['cabin'] if page.locator('#'+prefix+'-cabin').count() else []):
  expect(page.locator('#'+prefix+'-'+field)).to_have_value('')

def fill(page,prefix):
 if prefix=='arrangement' and not page.locator('.arrangement-request').is_visible():page.locator('#package-1 [data-request-key]').click()
 page.locator('#'+prefix+'-name').fill('ضيف مؤقت')
 if page.locator('#'+prefix+'-cabin').count():page.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1')
 page.locator('#'+prefix+'-notes').fill('تفاصيل الطلب')

def return_event(page,event):
 if event=='background':
  page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
 elif event=='bfcache':page.evaluate("dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))")
 else:page.evaluate("dispatchEvent(new PageTransitionEvent('pagehide'))")

with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(seed)
  page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.set_default_timeout(45000)
  def visit(path,guest=False):
   page.goto(BASE+path)
   page.locator('#guest-name' if guest else '#guide-content.is-ready').wait_for(state='attached')
   clean(page)
  def request():
   card=page.locator('#package-1');details=card.locator('details').first
   if details.get_attribute('open') is None:details.locator('summary').click()
   card.locator('[data-request-key]').click();expect(page.locator('.arrangement-request')).to_be_visible()
  visit('/services-guide/coordination/');request();blank(page,'arrangement');fill(page,'arrangement')
  # Editing and quantity changes do not discard an active request.
  page.locator('.arrangement-request-quantity [data-step="1"]').click();expect(page.locator('#arrangement-name')).to_have_value('ضيف مؤقت');clean(page)
  page.locator('.arrangement-request [data-close-request]').click();expect(page.locator('.arrangement-request')).to_be_hidden();request();blank(page,'arrangement')
  fill(page,'arrangement');page.go_back();expect(page.locator('.arrangement-request')).to_be_hidden();request();blank(page,'arrangement')
  for event in ['background','bfcache','pagehide']:
   fill(page,'arrangement');return_event(page,event);blank(page,'arrangement');clean(page)
  fill(page,'arrangement');page.locator('.arrangement-send').click();expect(page.locator('.arrangement-request')).to_be_hidden()
  url=urlparse(page.evaluate('opened.at(-1)'));assert url.path=='/966537009217'
  message=parse_qs(url.query)['text'][0];assert 'الاسم: ضيف مؤقت' in message and 'باقة الورد × 1 = 120 ريال' in message and 'ملاحظات: تفاصيل الطلب' in message
  request();blank(page,'arrangement');fill(page,'arrangement');page.reload();page.locator('#guide-content.is-ready').wait_for(state='attached');request();blank(page,'arrangement');clean(page)
  # Selected dining choices and optional cinema time also expire on return.
  visit('/services-guide/dining/');page.locator('.fd-dining-option').first.click();expect(page.locator('[data-dining-request]')).to_be_enabled();return_event(page,'background');expect(page.locator('[data-dining-request]')).to_be_disabled();assert page.locator('.fd-dining-option[aria-pressed="true"]').count()==0
  visit('/services-guide/cinema/');page.locator('#cinema-session [data-request-key]').click();page.locator('#cinema-time').select_option(index=1);fill(page,'arrangement');return_event(page,'background');blank(page,'arrangement');expect(page.locator('#cinema-time')).to_have_value('')
  for path in ['/guest-services/','/chalet/guest-services/']:
   visit(path,True);blank(page,'guest');expect(page.locator('#orders-summary')).to_be_hidden()
   def games():
    page.locator('#games-card').click();page.locator('[name="games-package"][value="box"]').check();page.locator('#apply-selection').click();expect(page.locator('#orders-summary')).to_be_visible()
   games();fill(page,'guest');clean(page)
   for event in ['background','bfcache','pagehide']:
    return_event(page,event);blank(page,'guest');expect(page.locator('#orders-summary')).to_be_hidden();clean(page);games();fill(page,'guest')
   if path=='/guest-services/':
    page.locator('#restaurant-card').click();page.locator('[data-category="ساندويتشات"] summary').click();page.locator('[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]').click();page.locator('#apply-selection').click();page.locator('#restaurant-name').fill('طلب مطعم');page.locator('#restaurant-notes').fill('ملاحظة مطعم');return_event(page,'background');blank(page,'restaurant');games();fill(page,'guest')
   page.reload();page.locator('#guest-name').wait_for(state='attached');blank(page,'guest');expect(page.locator('#orders-summary')).to_be_hidden();clean(page)
   games();fill(page,'guest');page.goto(BASE+'/');page.go_back();page.locator('#guest-name').wait_for(state='attached');blank(page,'guest');expect(page.locator('#orders-summary')).to_be_hidden();clean(page)
   assert page.locator('form:not([autocomplete="off"]),input:not([autocomplete="off"]),select:not([autocomplete="off"]),textarea:not([autocomplete="off"])').count()==0
  out['profiles'].append({'width':width,'height':height,'oldStorageRemoved':True,'noStorageWrites':True,'unrelatedStoragePreserved':True,'activeEditingPreserved':True,'cancelAndBackBlank':True,'backgroundAndBFCacheBlank':True,'reloadBlank':True,'realNavigationBackBlank':True,'guestAndChaletCartsBlank':True,'validWhatsAppDraft':True})
  c.close();print(width,height,'PASS',flush=True)
 # Storage being blocked must not prevent a standalone request.
 c=b.new_context(ignore_https_errors=True);c.add_init_script("for(const key of ['sessionStorage','localStorage'])Object.defineProperty(window,key,{get(){throw Error('blocked storage')}})")
 page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.goto(BASE+'/services-guide/coordination/');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('#package-1 summary').click();page.locator('#package-1 [data-request-key]').click();blank(page,'arrangement');fill(page,'arrangement');expect(page.locator('.arrangement-send')).to_be_enabled();c.close();b.close()
assert not out['errors'],out['errors']
report=Path('/tmp/portal-order-privacy-v101-live.json') if BASE.startswith('https:') else R/'site/audits/portal-order-privacy-v101.json'
report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

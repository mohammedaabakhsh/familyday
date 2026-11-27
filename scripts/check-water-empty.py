"""All four water order surfaces start empty; explicit package choices alone create selections."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import os,sys,json
from playwright.sync_api import sync_playwright,expect
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8172';R=Path(__file__).resolve().parents[1]
out={'version':'20261127-water-empty-v118','cases':[],'errors':[],'messagesSent':False}
def step(p,s,n=1):
 for _ in range(n):p.locator(s).click()
def packages(p,n):step(p,'[data-water-packages][data-step="1"]',n)
def allocation(p,n):step(p,'[data-water="adults"][data-step="1"]',2*n);step(p,'[data-water="children"][data-step="1"]',n)
def empty(p,send,main=False):
 expect(p.locator('#water-packages-count')).to_have_text('0');expect(p.locator('#water-adults')).to_have_text('0');expect(p.locator('#water-children')).to_have_text('0');expect(p.locator('#dialog-total')).to_have_text('0');expect(p.locator(send)).to_be_disabled();expect(p.locator('[data-water-packages][data-step="-1"]')).to_be_disabled();expect(p.locator('[data-water="adults"][data-step="1"]')).to_be_disabled();expect(p.locator('[data-water="children"][data-step="1"]')).to_be_disabled();expect(p.locator('#water-count')).to_have_text('اختر عدد الباقات أولًا');assert 'is-complete' not in p.locator('#water-service').get_attribute('class')
 if main:expect(p.locator('#order-items li:not(.request-recovery)')).to_have_count(0)
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568),(390,430)]):
  for venue in ['resort','chalet']:
   for mode in ['main','source']:
    c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script('window.opened=[];window.open=u=>{top.opened.push(u);return null}');page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));main=mode=='main';path=('/chalet/services/water-games/' if venue=='chalet' else '/services/water-games/') if main else ('/chalet/guest-services/water/' if venue=='chalet' else '/guest-services/water/');page.goto(BASE+path)
    def open_():
     if main:
      page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');return page.frame_locator('.native-order-frame')
     page.locator('body.guest-independent-orders').wait_for()
     if not page.locator('#service-dialog').is_visible():page.locator('#water-card').click()
     return page
    send='.resort-direct-send' if main else '#apply-selection';scope=open_();empty(scope,send,main);assert page.evaluate('opened.length')==0
    if width==390 and height==844:page.screenshot(path='/tmp/water-empty-v118-'+venue+'-'+mode+'.png')
    # Choosing, completing and then reducing the last package removes it completely.
    packages(scope,1);expect(scope.locator('#dialog-total')).to_have_text('50');expect(scope.locator(send)).to_be_disabled();allocation(scope,1);expect(scope.locator(send)).to_be_enabled();step(scope,'[data-water-packages][data-step="-1"]');empty(scope,send,main)
    # Reducing two complete packages to one resets an over-capacity allocation.
    packages(scope,2);allocation(scope,2);expect(scope.locator('#dialog-total')).to_have_text('100');step(scope,'[data-water-packages][data-step="-1"]');expect(scope.locator('#water-adults')).to_have_text('0');expect(scope.locator('#water-children')).to_have_text('0');expect(scope.locator(send)).to_be_disabled();step(scope,'[data-water-packages][data-step="-1"]');empty(scope,send,main)
    for n in [1,2]:
     packages(scope,n);allocation(scope,n)
     if not main:page.locator('#apply-selection').click();expect(page.locator('#service-request-dialog')).to_be_visible()
     prefix='guest' if main else 'service-request';scope.locator('#'+prefix+'-name').fill('فحص المياه')
     if venue=='resort':scope.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1')
     else:expect(scope.locator('#'+prefix+'-cabin')).to_have_count(0)
     scope.locator('.resort-direct-send' if main else '#service-request-dialog .send-order').click();expect(page.locator('#native-order-dialog' if main else '#service-request-dialog')).to_be_hidden();u=urlparse(page.evaluate('opened.at(-1)'));assert u.path=='/966556156693';text=parse_qs(u.query)['text'][0];identity='المكان: شاليه يوم العائلة' if venue=='chalet' else 'اسم الكوخ: بيت الدوم 1\nرقم الكوخ: 15';expected='السلام عليكم، أرغب بطلب ألعاب مائية.\n\nالاسم: فحص المياه\n'+identity+'\n\nالباقة: باقة ألعاب مائية\nالكمية: '+str(n)+'\nألعاب للكبار: '+str(2*n)+'\nألعاب للأطفال: '+str(n)+'\nإجمالي الطلب: '+str(n*50)+' ريال';assert text==expected,(venue,mode,text);scope=open_();empty(scope,send,main)
    # Explicit deletion also returns the editor to the real empty state.
    packages(scope,1);allocation(scope,1)
    if main:scope.locator('.resort-direct-form .remove-item').click()
    else:page.locator('#apply-selection').click();page.locator('.request-invoice .remove-item').click();expect(page.locator('#service-request-dialog .send-order')).to_be_disabled();page.locator('.request-edit').click()
    empty(scope,send,main);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');out['cases'].append({'width':width,'height':height,'venue':venue,'surface':mode,'initialEmptyNoPhantomInvoice':True,'zeroAfterDecrementDeletionAndSend':True,'exactOneAndTwoPackageDrafts':True});print(width,height,venue,mode,'PASS',flush=True);c.close()
 b.close()
assert not out['errors'],out['errors'];dest=Path('/tmp/water-empty-v118-live.json') if BASE.startswith('https:') else R/'site/audits/water-empty-v118.json';dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Four water surfaces start empty and only explicit choices produce orders PASS')

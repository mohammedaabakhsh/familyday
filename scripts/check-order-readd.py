"""Delete and explicitly re-add requests inside each invoice. All WhatsApp drafts are intercepted."""
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import os,sys,json
from playwright.sync_api import sync_playwright,expect
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8173';R=Path(__file__).resolve().parents[1]
PATH={'restaurant':'/menu/','hospitality':'/services/hospitality/packages/','extras':'/services/extras/','water':'/services/water-games/','games':'/services/games/','coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
errors=[];checks=[]
def inc(p,s,n=1):
 for _ in range(n):p.locator(s).first.click()
def guest_choice(p,key,main=False):
 if key=='restaurant':
  if not main:p.locator('[data-category="ساندويتشات"]>summary').click()
  row=p.locator('[data-menu-name="ساندويتش دجاج زنجر"]');inc(row,'[data-step="1"]',2);row.locator('input[type="checkbox"]').check()
 elif key=='hospitality':inc(p,'.hospitality-quantity [data-step="1"]',2);inc(p,'.hospitality-package:nth-child(2) .hospitality-quantity [data-step="1"]')
 elif key=='extras':inc(p,'[data-extra="robe"] [data-step="1"]',2);inc(p,'[data-extra="bath"] [data-step="1"]')
 elif key=='water':inc(p,'[data-water-packages][data-step="1"]',2);inc(p,'[data-water="adults"][data-step="1"]',4);inc(p,'[data-water="children"][data-step="1"]',2)
 else:p.locator('[name="games-package"][value="box"]').check()
def fill(p,prefix,chalet=False):
 p.locator('#'+prefix+'-name').fill('ضيف الفحص');p.locator('#'+prefix+'-notes').fill('تبقى الملاحظات بعد الحذف')
 if not chalet:p.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1')
def identity(p,prefix):expect(p.locator('#'+prefix+'-name')).to_have_value('ضيف الفحص');expect(p.locator('#'+prefix+'-notes')).to_have_value('تبقى الملاحظات بعد الحذف')
def outgoing(page):
 u=urlparse(page.evaluate('opened.at(-1)'));return (u.path,parse_qs(u.query)['text'][0])
def reopen(page):
 page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#main [data-service-portal]').first.click();page.locator('.native-order-loading').wait_for(state='hidden')
def recover(p,remove,total,send,closed=None):
 before=p.locator(total).inner_text();count=p.locator(remove).count();assert count>0
 while p.locator(remove).count():p.locator(remove).first.click()
 expect(p.locator(total)).to_have_text('0');expect(p.locator(send)).to_be_disabled();expect(p.locator('.restore-item')).to_have_count(count)
 if closed:closed();expect(p.locator(total)).to_have_text('0');expect(p.locator(send)).to_be_disabled();expect(p.locator('.restore-item')).to_have_count(count)
 assert p.locator('.restore-item').first.evaluate('e=>e.getBoundingClientRect().height>=44')
 while p.locator('.restore-item').count():p.locator('.restore-item').first.click()
 expect(p.locator(total)).to_have_text(before);expect(p.locator(remove)).to_have_count(count);expect(p.locator(send)).to_be_enabled()
def native(page,key):
 if key in ['coordination','seating']:page.locator('.service-guide-packages>.package').first.locator('summary').click()
 if key=='dining':page.locator('[data-dining-size="6"][data-dining-option="plain"]').click()
 page.locator('#main [data-service-portal]').first.click();page.locator('.native-order-loading').wait_for(state='hidden');return page.frame_locator('.native-order-frame')
def arrangement_choice(p,key):
 if key in ['coordination','seating']:inc(p,'[data-order-key][data-step="1"]:visible')
 if key=='seating':p.locator('[data-request-extra]').check()
 if key=='cinema':p.locator('#cinema-time').select_option('18')
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568)]):
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async()=>{}})");page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  for venue in ['resort','chalet']:
   chalet=venue=='chalet';base='/chalet/guest-services/' if chalet else '/guest-services/'
   for key in (['water','games'] if chalet else ['restaurant','hospitality','extras','water','games']):
    page.goto(BASE+base+key+'/');page.locator('body.guest-independent-orders').wait_for();guest_choice(page,key);page.locator('#apply-selection').click();fill(page,'service-request',chalet);recover(page,'.request-invoice .remove-item','#service-request-total','#service-request-dialog .send-order');identity(page,'service-request');page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_hidden();source=outgoing(page)
    path=('/chalet/services/'+('water-games' if key=='water' else 'games')+'/') if chalet else PATH[key];page.goto(BASE+path);page.locator('#main h1').wait_for()
    if key=='restaurant':
     guest_choice(page,key,True);fill(page,'inline-restaurant');page.locator('.inline-restaurant-remove').click();expect(page.locator('#inline-restaurant-summary')).to_be_hidden();guest_choice(page,key,True);identity(page,'inline-restaurant');page.locator('#inline-restaurant-order .button.primary').click()
    else:
     f=native(page,key);guest_choice(f,key);fill(f,'guest',chalet);recover(f,'.resort-direct-form .remove-item','#dialog-total','.resort-direct-send',lambda:reopen(page));identity(f,'guest')
     # The selection itself and water distribution are restored, rather than only its invoice.
     if key=='water':expect(f.locator('#water-packages-count')).to_have_text('2');expect(f.locator('#water-adults')).to_have_text('4');expect(f.locator('#water-children')).to_have_text('2')
     f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
    assert outgoing(page)==source,(venue,key,outgoing(page),source);checks.append([width,venue,key,'source+native recover/message parity']);print(width,venue,key,'PASS',flush=True)
  for key in ['coordination','seating','dining','cinema']:
   page.goto(BASE+'/services-guide/'+key+'/');page.locator('#guide-content.is-ready').wait_for(state='attached')
   if key=='dining':page.locator('[data-size="6"][data-option="plain"]').click();page.locator('[data-dining-request]').click()
   elif key=='cinema':page.locator('#cinema [data-request-key]').click()
   else:
    host=page.locator('#'+('package-1' if key=='coordination' else 'session-1'));host.locator('details>summary').click();host.locator('[data-request-key]').click()
   arrangement_choice(page,key);fill(page,'arrangement');recover(page,'.arrangement-request [data-remove]','#arrangement-total','.arrangement-send');identity(page,'arrangement');page.locator('.arrangement-send').click();expect(page.locator('.arrangement-request')).to_be_hidden();source=outgoing(page)
   page.goto(BASE+PATH[key]);page.locator('#main h1').wait_for();f=native(page,key);arrangement_choice(f,key);fill(f,'arrangement');recover(f,'.resort-direct-form [data-remove]','#arrangement-total','.resort-direct-send',lambda:reopen(page));identity(f,'arrangement');f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();assert outgoing(page)==source,(key,outgoing(page),source);checks.append([width,key,'source+native recover/message parity']);print(width,key,'PASS',flush=True)
  for mode in ['source','native']:
   page.goto(BASE+('/stay/guest-services/' if mode=='source' else '/stay/services/'))
   if mode=='source':page.locator('body.stay-services-ready').wait_for();page.locator('#slide-card').click();page.locator('#request-slide').click();scope=page
   else:page.locator('#main h1').wait_for();scope=native(page,'slide')
   fill(scope,'stay',True)
   for _ in range(2):
    scope.locator('#stay-invoice .remove-item').click();expect(scope.locator('#stay-total')).to_have_text('0');expect(scope.locator('#send-stay')).to_be_disabled();scope.locator('#stay-invoice .restore-item').click();expect(scope.locator('#stay-total')).to_have_text('450');expect(scope.locator('#send-stay')).to_be_enabled();expect(scope.locator('#stay-invoice .restore-item')).to_have_count(0);identity(scope,'stay')
   if mode=='native':
    scope.locator('#stay-invoice .remove-item').click();page.go_back();scope=native(page,'slide');expect(scope.locator('#stay-total')).to_have_text('0');scope.locator('.restore-item').click();identity(scope,'stay')
   if width==390:page.screenshot(path='/tmp/order-readd-v123-stay-'+mode+'.png')
   scope.locator('#send-stay').click();expect(page.locator('#stay-request-dialog' if mode=='source' else '#native-order-dialog')).to_be_hidden();assert 'الكمية: 1' in outgoing(page)[1] and 'إجمالي الطلب: 450 ريال' in outgoing(page)[1];checks.append([width,'stay',mode,'limited to one game after repeated re-add']);print(width,'stay',mode,'PASS',flush=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');c.close()
 b.close()
assert not errors,errors
dest=Path('/tmp/order-readd-v123-live.json') if BASE.startswith('https:') else R/'site/audits/order-readd-v123.json'
dest.write_text(json.dumps({'version':'20261127-order-readd-v123','checks':checks,'errors':errors,'messagesSent':False},ensure_ascii=False,indent=2)+'\n')

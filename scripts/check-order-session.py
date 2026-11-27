"""Preserve internal edits/navigation, remove invoice items, clear real exits; intercept all drafts."""
import os,json,sys
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8169';R=Path(__file__).resolve().parents[1]
PATHS={'restaurant':'/menu/','hospitality':'/services/hospitality/packages/','extras':'/services/extras/','water':'/services/water-games/','games':'/services/games/','coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
out={'version':'20261127-order-session-v115','checks':[],'errors':[],'messagesSent':False}
def inc(p,s,n=1):
 for _ in range(n):p.locator(s).first.click()
def fill(p,prefix):
 p.locator('#'+prefix+'-name').fill('ضيف تجريبي');p.locator('#'+prefix+'-cabin').select_option('الكوخ الكلاسيكي');p.locator('#'+prefix+'-notes').fill('ملاحظات الزيارة فقط')
def identity(p,prefix):
 expect(p.locator('#'+prefix+'-name')).to_have_value('ضيف تجريبي');expect(p.locator('#'+prefix+'-cabin')).to_have_value('الكوخ الكلاسيكي');expect(p.locator('#'+prefix+'-notes')).to_have_value('ملاحظات الزيارة فقط')
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
def choices(p,kind):
 if kind=='restaurant':
  p.locator('[data-category="ساندويتشات"]>summary').click();inc(p,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]',2);p.locator('[data-category="مشروبات باردة"]>summary').click();inc(p,'[data-menu-name="بيبسي"] [data-step="1"]')
 elif kind=='hospitality':inc(p,'.hospitality-quantity [data-step="1"]',2);inc(p,'.hospitality-package:nth-child(2) .hospitality-quantity [data-step="1"]')
 elif kind=='extras':inc(p,'[data-extra="robe"] [data-step="1"]');inc(p,'[data-extra="bath"] [data-step="1"]',2)
 elif kind=='water':inc(p,'[data-water-packages][data-step="1"]');inc(p,'[data-water="adults"][data-step="1"]',2);inc(p,'[data-water="children"][data-step="1"]')
 elif kind=='games':p.locator('[name="games-package"][value="table"]').check()
 elif kind=='cinema':p.locator('#cinema-time').select_option('18')
 elif kind in ['coordination','seating']:
  inc(p,'[data-order-key][data-step="1"]:visible')
  if kind=='seating':
   p.locator('[data-request-extra]').check();p.locator('[data-remove="seating-extra"]').click();expect(p.locator('[data-request-extra]')).not_to_be_checked()
def sourceGuest(page,kind):
 page.goto(BASE+'/guest-services/'+kind+'/');page.locator('body.guest-independent-orders').wait_for();choices(page,kind);page.locator('#apply-selection').click();fill(page,'service-request')
def sourceArrange(page,kind):
 page.goto(BASE+'/services-guide/'+kind+'/');page.locator('#guide-content.is-ready').wait_for(state='attached')
 if kind=='dining':page.locator('[data-size="6"][data-option="plain"]').click();page.locator('[data-dining-request]').click()
 elif kind=='cinema':page.locator('#cinema [data-request-key]').click()
 else:
  host=page.locator('#'+('package-1' if kind=='coordination' else 'session-1'));host.locator('details>summary').click();host.locator('[data-request-key]').click()
 choices(page,kind);fill(page,'arrangement')
def mainOpen(page,kind):
 if kind in ['coordination','seating']:
  d=page.locator('.service-guide-packages>.package').first
  if d.get_attribute('open') is None:d.locator('summary').click()
 if kind=='dining' and page.locator('[data-service-portal]').is_disabled():page.locator('[data-dining-size="6"][data-dining-option="plain"]').click()
 page.locator('#main [data-service-portal]').first.click();page.locator('.native-order-loading').wait_for(state='hidden');return page.frame_locator('.native-order-frame')
def leaveInternal(page,path):
 page.evaluate("path=>{const a=document.createElement('a');a.id='test-internal-navigation';a.href=path;a.textContent='الانتقال داخل الموقع';a.style='position:fixed;inset:0 auto auto 0;z-index:9999;background:white';document.body.append(a)}",path);page.locator('#test-internal-navigation').click()
def noStorage(page):
 assert page.evaluate("[localStorage,sessionStorage].every(s=>Object.keys(s).every(k=>!String(s.getItem(k)).includes('ضيف تجريبي')&&!String(s.getItem(k)).includes('ملاحظات الزيارة فقط')))")
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568)]):
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async()=>{}})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  for kind in ['restaurant','hospitality','extras','water','games']:
   sourceGuest(page,kind);number=page.locator('#service-request-dialog .cabin-number');expect(number).to_contain_text('18');assert number.evaluate('e=>getComputedStyle(e).borderWidth')=='0px';assert number.locator('output').evaluate('e=>getComputedStyle(e).fontSize')=='13px';before=page.locator('#service-request-total').inner_text();count=page.locator('.request-invoice .remove-item').count()
   page.go_back();expect(page.locator('#service-dialog')).to_be_visible();page.locator('#apply-selection').click();identity(page,'service-request');expect(page.locator('#service-request-total')).to_have_text(before)
   page.locator('#service-request-dialog .dialog-close').click();page.locator('#'+kind+'-card').click();page.locator('#apply-selection').click();identity(page,'service-request');expect(page.locator('#service-request-total')).to_have_text(before);noStorage(page)
   page.locator('.request-invoice .remove-item').first.click();assert int(page.locator('#service-request-total').inner_text())<int(before)
   if count>1:
    page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_hidden();text=parse_qs(urlparse(page.evaluate('opened.at(-1)')).query)['text'][0];assert 'إجمالي الطلب: '+str(int(before)-(22 if kind=='restaurant' else 118 if kind=='hospitality' else 20))+' ريال' in text
    assert {'restaurant':'ساندويتش دجاج زنجر','hospitality':'الضيافة السعودية','extras':'روب ومناشف لشخص واحد'}[kind] not in text
   else:expect(page.locator('#service-request-dialog .send-order')).to_be_disabled();expect(page.locator('#service-request-total')).to_have_text('0')
   out['checks'].append([width,'source-guest',kind,'back-close-preserve-delete-total-and-draft']);print(width,'source',kind,'PASS',flush=True)
  for kind in ['coordination','seating','dining','cinema']:
   sourceArrange(page,kind);before=page.locator('#arrangement-total').inner_text();page.locator('[data-close-request]').click()
   if kind=='dining':page.locator('[data-dining-request]').click()
   else:page.locator('#'+('package-1' if kind=='coordination' else 'session-1' if kind=='seating' else 'cinema')+' [data-request-key]').click()
   identity(page,'arrangement');expect(page.locator('#arrangement-total')).to_have_text(before)
   if kind=='cinema':expect(page.locator('#cinema-time')).to_have_value('18')
   page.locator('.arrangement-request [data-remove]').first.click();expect(page.locator('#arrangement-total')).to_have_text('0');expect(page.locator('.arrangement-send')).to_be_disabled();identity(page,'arrangement');noStorage(page)
   out['checks'].append([width,'source-arrangement',kind,'close-preserve-delete']);print(width,'source',kind,'PASS',flush=True)
  # Native requests retain isolated drafts when closed, on Back, and after visiting other main routes.
  for kind in list(PATHS)[1:]:
   page.goto(BASE+PATHS[kind]);f=mainOpen(page,kind);prefix='guest' if kind in ['hospitality','extras','water','games'] else 'arrangement';choices(f,kind);fill(f,prefix)
   remove='.resort-direct-form .remove-item' if prefix=='guest' else '.resort-direct-form [data-remove]';expect(f.locator(remove).first).to_be_visible();page.go_back();expect(page.locator('#native-order-dialog')).to_be_hidden();f=mainOpen(page,kind);identity(f,prefix)
   if kind=='cinema':expect(f.locator('#cinema-time')).to_have_value('18')
   page.locator('.native-order-close').click();page.locator('.header .context-back').click();expect(page.locator('.service-categories')).to_be_visible();page.locator('.service-categories button').get_by_text('التنسيقات والجلسات' if prefix=='arrangement' else 'الإقامة',exact=True).click();page.locator('.svcs-card[href="'+PATHS[kind]+'"]').click();f=mainOpen(page,kind);identity(f,prefix)
   while f.locator(remove).count():f.locator(remove).first.click()
   expect(f.locator('.resort-direct-send')).to_be_disabled();noStorage(page);page.locator('.native-order-close').click();out['checks'].append([width,'main',kind,'browser-back-route-return-preserve-delete']);print(width,'main',kind,'PASS',flush=True)
  # Main restaurant keeps its basket and identity while switching sections and pages.
  page.goto(BASE+'/menu/');inc(page,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]',2);fill(page,'inline-restaurant');page.locator('.header .context-back').click();page.locator('.service-categories button').get_by_text('الإقامة',exact=True).click();page.locator('.svcs-card[href="'+PATHS['games']+'"]').click();page.locator('.header .context-back').click();page.locator('.service-categories button').get_by_text('المطعم',exact=True).click();expect(page.locator('[data-menu-name="ساندويتش دجاج زنجر"] output')).to_have_text('2');identity(page,'inline-restaurant');noStorage(page)
  # Internal full-document transitions carry only a one-use handoff, not a saved order.
  leaveInternal(page,'/guest-services/');page.locator('body.guest-independent-orders').wait_for();noStorage(page);page.go_back();page.locator('#main h1').wait_for();expect(page.locator('[data-menu-name="ساندويتش دجاج زنجر"] output')).to_have_text('2');identity(page,'inline-restaurant');noStorage(page)
  background(page);expect(page.locator('#inline-restaurant-summary')).to_be_hidden();inc(page,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]');fill(page,'inline-restaurant');page.reload();page.locator('#main h1').wait_for();expect(page.locator('#inline-restaurant-summary')).to_be_hidden()
  sourceGuest(page,'hospitality');background(page);expect(page.locator('#service-request-dialog')).to_be_hidden();page.locator('#hospitality-card').click();expect(page.locator('.hospitality-quantity output').first).to_have_text('0');page.reload();page.locator('body.guest-independent-orders').wait_for();expect(page.locator('.hospitality-quantity output').first).to_have_text('0')
  # A true website exit/return must not restore old drafts through bfcache.
  page.goto(BASE+'/menu/');inc(page,'[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]');fill(page,'inline-restaurant');page.goto('about:blank');page.go_back();page.locator('#main h1').wait_for();expect(page.locator('#inline-restaurant-summary')).to_be_hidden();noStorage(page)
  out['checks'].append([width,'visit','internal-handoff-and-external-background-reload-clearing']);c.close()
 b.close()
assert not out['errors'],out['errors'];dest=Path('/tmp/order-session-v115-live.json') if BASE.startswith('https:') else R/'site/audits/order-session-v115.json';dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Order visit, deletion and cabin-reference PASS',flush=True)

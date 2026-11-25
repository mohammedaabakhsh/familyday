"""Native/standalone resort order parity. All WhatsApp and shares are captured, never sent."""
import json,sys,subprocess,hashlib
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8126'
FIX={r['venue']:r for r in json.loads((R/'scripts/fixtures/resort-order-messages-v69.json').read_text())}
SOURCE=json.loads((R/'data/services.json').read_text());out={'version':'20261125-live-v70','profiles':[],'messagesSent':False,'errors':[],'badResponses':[]}
for path in ['data/services.json','guest-services/guest-services.js','services-guide/guide-orders.js','js/menu-order-message.js','chalet/guest-services/index.html','site/catalog.json','site/share-metadata.json','share-pages.json','share-extras.json']:
 assert (R/path).read_bytes()==subprocess.check_output(['git','show','pre-resort-inline-orders-20261125:'+path]),path
out['unchangedCatalogueAndBuilders']=True
links=json.loads((R/'site/orders/service-links.json').read_text())['services']
for service in json.loads((R/'site/catalog.json').read_text())['services']:
 key='restaurant' if service['id']=='menu' else service['id']
 if key in links:assert links[key]['path']==service['path']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})")
  page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.on('response',lambda r:out['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
  def visit(path):
   page.goto(BASE+path);page.locator('#main h1').wait_for();assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  def frame(kind='guest'):return page.frame_locator('iframe[src^="'+('/guest-services/' if kind=='guest' else '/services-guide/')+'"]')
  def launch(path,kind='guest'):
   visit(path);page.locator('#main [data-service-portal]').click();expect(page.locator('#native-order-dialog')).to_be_visible();expect(page.locator('.native-order-loading')).to_be_hidden();expect(page.locator('.native-order-error')).to_be_hidden();assert page.url==BASE+path
   return frame(kind)
  def added():expect(page.locator('#native-order-dialog')).to_be_hidden();expect(page.locator('.native-order-shortcut')).to_be_visible()
  def summary(kind='guest'):
   page.locator('.native-order-shortcut').click();expect(page.locator('.native-order-loading')).to_be_hidden()
   if page.locator('.native-order-tabs').is_visible():page.locator('.native-order-tabs button').filter(has_text='الخدمات والمطعم' if kind=='guest' else 'التنسيقات والجلسات').click();expect(page.locator('.native-order-loading')).to_be_hidden()
   return frame(kind)
  def close():page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
  def message(f,selector,expected,restaurant=False):
   f.locator(selector).click();url=urlparse(f.locator('body').evaluate('()=>opened.at(-1)'));text=parse_qs(url.query)['text'][0];key='restaurantMessage' if restaurant else 'message';recipient='restaurantRecipient' if restaurant else 'recipient';assert url.path[1:]==expected[recipient] and text==expected[key],(url.path,text,expected[key]);return text
  f=launch('/services/cinema/');assert page.locator('.cinema-contents .inclusions').is_visible();assert not f.locator('.service-facts').is_visible()
  page.locator('.native-order-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services/cinema/'}
  f.locator('#cinema-time').select_option('18');page.go_back();expect(page.locator('#native-order-dialog')).to_be_hidden();assert page.url==BASE+'/services/cinema/' and page.locator('.native-order-shortcut').is_hidden()
  page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();assert f.locator('#cinema-time').input_value()=='';f.locator('#cinema-time').select_option('18');f.locator('#apply-selection').click();added()
  # The native page is retained, including decoded image; normal section navigation remains local.
  page.evaluate('window.savedOrderFrame=document.querySelector(".native-order-frame")');page.locator('.context-back').click();page.locator('.svcs-card[href="/services/water-games/"]').click();assert page.evaluate('savedOrderFrame===document.querySelector(".native-order-frame")')
  page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden()
  assert f.locator('#apply-selection').is_disabled()
  for _ in range(3):f.locator('[data-water="adults"][data-step="1"]').click()
  f.locator('#apply-selection').click();added()
  f=launch('/services/games/');f.locator('[name="games-package"][value="box"]').check();f.locator('#apply-selection').click();added()
  f=summary();f.locator('.remove-item[aria-label="حذف جلسة السينما"]').click()
  f.locator('#guest-name').fill('ضيف المراجعة');f.locator('#guest-notes').fill('مراجعة محلية فقط')
  for name in ['البيت اليوناني 1','البيت اليوناني 2']:
   f.locator('#guest-cabin').select_option(name);assert f.locator('.cabin-number output').first.inner_text()==str(SOURCE['guest']['cabins'][name])
  f.locator('#guest-cabin').select_option('البيت اليوناني 1');message(f,'#extras-order .send-order',FIX['resort'])
  f.locator('.resort-edit-order').filter(has_text='تعديل').first.click();expect(f.locator('#service-dialog')).to_be_visible();f.locator('.dialog-close').evaluate('e=>e.click()');expect(f.locator('#service-dialog')).to_be_hidden();assert page.locator('#native-order-dialog').is_visible();close()
  f=launch('/menu/');category=f.locator('#guest-menu details').first;category.locator('summary').click();category.locator('[data-step="1"]').first.click();f.locator('#apply-selection').click();added();f=summary();message(f,'#restaurant-order .send-order',FIX['resort'],True);close()
  f=launch('/services/coordination/?package=1','arrangements');f.locator('#package-1 [data-step="1"]').click();f.locator('.arrangement-dialog-footer [data-close-arrangements]').click();added()
  f=launch('/services/dining-tables/','arrangements');f.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click();f.locator('.fd-dining-option[data-size="12"][data-option="tansiq"]').click();f.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click();assert f.locator('.fd-dining-option[aria-pressed="true"]').count()==1;f.locator('.arrangement-dialog-footer [data-close-arrangements]').click();added()
  f=launch('/services/outdoor-seating/?session=1','arrangements');f.locator('#session-1 [data-step="1"]').click();f.locator('#session-1 [data-share-path]').click();page.wait_for_function('shares.length>0');assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services/outdoor-seating/?session=1'};f.locator('.arrangement-dialog-footer [data-close-arrangements]').click();added()
  f=summary('arrangements');f.locator('#arrangement-name').fill('ضيف المراجعة');f.locator('#arrangement-cabin').select_option('البيت اليوناني 1');assert f.locator('#arrangement-cabin-number').inner_text()=='رقم الكوخ: '+str(SOURCE['guest']['cabins']['البيت اليوناني 1']);f.locator('#arrangement-notes').fill('مراجعة محلية فقط');message(f,'#arrangement-order [type="submit"]',FIX['arrangements'])
  if width==390:page.screenshot(path='/tmp/resort-orders-v70/native-arrangements-summary-checked.png')
  close();page.reload();expect(page.locator('.native-order-shortcut')).to_be_visible()
  # Full-page entry restores the exact same native selections and fields.
  page.goto(BASE+'/guest-services/');page.locator('#games-card:not([disabled])').wait_for();expect(page.locator('#order-total')).to_have_text('100');assert page.locator('#guest-cabin').input_value()=='البيت اليوناني 1';message(page,'#extras-order .send-order',FIX['resort']);message(page,'#restaurant-order .send-order',FIX['resort'],True)
  page.locator('#cinema-card').click();expect(page.locator('.resort-service-share')).to_be_enabled();page.locator('.resort-service-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services/cinema/'};assert page.locator('#cinema-service .resort-service-photo img').is_visible();page.locator('.dialog-close').click()
  page.goto(BASE+'/services-guide/');page.locator('#guide-content.is-ready').wait_for(state='attached');expect(page.locator('#arrangement-total')).to_have_text('619');message(page,'#arrangement-order [type="submit"]',FIX['arrangements'])
  out['profiles'].append({'width':width,'height':height,'sameResortWhatsAppDrafts':True,'sameCabinNumbers':True,'nativeBackAndCancel':True,'draftSurvivesNavigationAndReload':True,'sameExistingServiceAndSessionShareLinks':True,'singleDiningChoice':True})
  c.close();print(width,'PASS',flush=True)
 # Every guest service shares its original canonical service URL, with no image payload.
 c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})")
 page=c.new_page();page.goto(BASE+'/guest-services/');page.locator('#water-card:not([disabled])').wait_for()
 out['serviceShareLinks']={}
 for key in ['restaurant','hospitality','water','games','cinema','extras']:
  page.locator('#'+key+'-card').click();expect(page.locator('.resort-service-share')).to_be_enabled();page.locator('.resort-service-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+links[key]['path']};out['serviceShareLinks'][key]=links[key]['path'];page.locator('.dialog-close').click()
 c.close()
 # A source failure is recoverable in place and offers the unchanged standalone URL.
 c=b.new_context(viewport={'width':390,'height':430});page=c.new_page();page.route('**/data/services.json?*',lambda r:r.fulfill(status=503,body='Unavailable'))
 page.goto(BASE+'/services/cinema/');page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-error')).to_be_visible(timeout=10000);assert page.locator('.native-order-external').get_attribute('data-url')=='/guest-services/#cinema'
 page.unroute('**/data/services.json?*');page.locator('.native-order-retry').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');expect(f.locator('#cinema-time')).to_be_visible();assert page.url==BASE+'/services/cinema/'
 out['sourceRetryInPlace']=True;c.close();b.close()
assert not out['errors'] and not out['badResponses'],out
(R/'site/audits/resort-native-orders-v70.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))

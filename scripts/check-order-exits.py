"""Every order forgets data on exit; active menu/category and checkout steps remain usable."""
import json,os,sys
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';out={'version':'20261126-live-v101','profiles':[],'errors':[],'messagesSent':False}
paths={'coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/','games':'/services/games/','water':'/services/water-games/','hospitality':'/services/hospitality/packages/'}
init="window.opened=[];window.open=url=>{top.opened.push(url);return null}"
def blank(f,prefix):
 for key in ['name','cabin','notes']:
  field=f.locator('#'+prefix+'-'+key)
  if field.count():expect(field).to_have_value('')
def fill(f,prefix):
 f.locator('#'+prefix+'-name').fill('ضيف مؤقت')
 if f.locator('#'+prefix+'-cabin').count():f.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1')
 f.locator('#'+prefix+'-notes').fill('تفاصيل مؤقتة')
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
def mainOpen(page,kind):
 if kind in ['coordination','seating']:
  d=page.locator('.service-guide-packages>.package').first
  if d.get_attribute('open') is None:d.locator('summary').click()
 if kind=='dining':page.locator('[data-dining-size="6"][data-dining-option="plain"]').click()
 page.locator('#main [data-service-portal]').first.click();expect(page.locator('.native-order-loading')).to_be_hidden()
 return page.frame_locator('.native-order-frame')
def configure(f,kind):
 if kind in ['coordination','seating']:f.locator('.resort-entry-selection [data-step="1"]').first.click()
 if kind=='cinema':f.locator('#cinema-time').select_option('18')
 if kind=='games':f.locator('[name="games-package"][value="box"]').check()
 if kind=='water':
  for _ in range(3):f.locator('[data-water="adults"][data-step="1"]').click()
 if kind=='hospitality':f.locator('.hospitality-quantity [data-step="1"]').first.click()
def assertDefaults(f,kind):
 if kind in ['coordination','seating']:expect(f.locator('.resort-entry-selection .arrangement-quantity output').first).to_have_text('1')
 if kind=='cinema':expect(f.locator('#cinema-time')).to_have_value('')
 if kind=='games':assert f.locator('[name="games-package"]:checked').count()==0
 if kind=='water':expect(f.locator('#water-adults')).to_have_text('0')
 if kind=='hospitality':assert set(f.locator('.hospitality-quantity output').all_text_contents())=={'0'}
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:out['errors'].append(str(e)))
  for kind in (paths if width==390 else ['dining','games']):
   print('main',width,kind,flush=True);page.goto(BASE+paths[kind]);page.locator('#main h1').wait_for();f=mainOpen(page,kind);prefix='guest' if kind in ['games','water','hospitality'] else 'arrangement';fill(f,prefix);configure(f,kind);page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
   if kind=='dining':expect(page.locator('.dining-guide-link')).to_be_disabled();assert page.locator('[data-dining-size][aria-pressed="true"]').count()==0
   # Browser Forward must not resurrect a closed request descriptor or table choice.
   page.go_forward();expect(page.locator('#native-order-dialog')).to_be_hidden();f=mainOpen(page,kind);blank(f,prefix);assertDefaults(f,kind);fill(f,prefix);configure(f,kind);background(page);expect(page.locator('#native-order-dialog')).to_be_hidden();f=mainOpen(page,kind);blank(f,prefix);assertDefaults(f,kind)
   fill(f,prefix);configure(f,kind);f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();url=page.evaluate('opened.at(-1)');recipient='966556156693' if prefix=='guest' else '966537009217';assert urlparse(url).path=='/'+recipient;assert 'ضيف مؤقت' in parse_qs(urlparse(url).query)['text'][0]
   if kind=='dining':expect(page.locator('.dining-guide-link')).to_be_disabled()
  # Main restaurant: categories build one order; service-group and route exits discard it.
  page.goto(BASE+'/services/');page.locator('.inline-menu-quantity').first.wait_for()
  def meal():
   page.locator('.restaurant-menu-tabs button').get_by_text('ساندويتشات',exact=True).click();row=page.locator('.restaurant-menu-category').first.locator('.menu-row').first;row.locator('[data-step="1"]').click();row.locator('input[type=checkbox]').check();fill(page,'inline-restaurant')
  meal();page.locator('.restaurant-menu-tabs button').get_by_text('مشروبات باردة',exact=True).click();expect(page.locator('.inline-restaurant-total strong')).to_have_text('12 ريال')
  page.locator('[data-service-group="1"]').click();page.locator('[data-service-group="0"]').click();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();blank(page,'inline-restaurant')
  meal();page.locator('.bottom-nav a[href="/resort/"]').click();page.locator('.bottom-nav a[href="/services/"]').click();page.locator('.inline-menu-quantity').first.wait_for();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();blank(page,'inline-restaurant')
  meal();background(page);expect(page.locator('.inline-restaurant-summary')).to_be_hidden();blank(page,'inline-restaurant');meal();page.locator('#inline-restaurant-order button[type=submit]').click();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();blank(page,'inline-restaurant');assert urlparse(page.evaluate('opened.at(-1)')).path=='/966537006531'
  # Standalone arrangement requests clear on cancel/back/lifecycle return, for all four types.
  for kind in ['coordination','seating','dining','cinema']:
   page.goto(BASE+'/services-guide/'+kind+'/');page.locator('#guide-content.is-ready').wait_for(state='attached')
   def sourceRequest():
    if kind in ['coordination','seating']:
     card=page.locator('#package-1' if kind=='coordination' else '#session-1');d=card.locator('details').first
     if d.get_attribute('open') is None:d.locator('summary').click()
     card.locator('[data-request-key]').click()
    elif kind=='dining':page.locator('.fd-dining-option').first.click();page.locator('[data-dining-request]').click()
    else:page.locator('#cinema-session [data-request-key]').click()
    expect(page.locator('.arrangement-request')).to_be_visible()
   sourceRequest();fill(page,'arrangement');page.locator('.arrangement-request [data-close-request]').click();expect(page.locator('.arrangement-request')).to_be_hidden()
   if kind=='dining':expect(page.locator('[data-dining-request]')).to_be_disabled()
   sourceRequest();blank(page,'arrangement');fill(page,'arrangement');page.go_back();expect(page.locator('.arrangement-request')).to_be_hidden();sourceRequest();blank(page,'arrangement');fill(page,'arrangement');background(page);expect(page.locator('.arrangement-request')).to_be_hidden();sourceRequest();blank(page,'arrangement')
  # Guest/chalet explicit apply advances to checkout; cancellation is an exit, not a saved draft.
  for path in ['/guest-services/','/chalet/guest-services/']:
   page.goto(BASE+path);page.locator('#games-card:not([disabled])').wait_for()
   def game():page.locator('#games-card').click();page.locator('[name="games-package"][value="box"]').check();page.locator('#apply-selection').click()
   game();expect(page.locator('#orders-summary')).to_be_visible();fill(page,'guest');page.locator('#water-card').click();
   for _ in range(3):page.locator('[data-water="adults"][data-step="1"]').click()
   page.locator('#apply-selection').click();expect(page.locator('#order-total')).to_have_text('100');page.locator('#games-card').click();page.locator('.dialog-cancel').click();expect(page.locator('#orders-summary')).to_be_hidden();blank(page,'guest')
   page.locator('#games-card').click();assert page.locator('[name="games-package"]:checked').count()==0;page.keyboard.press('Escape');game();fill(page,'guest');page.locator('#extras-order .send-order').click();expect(page.locator('#orders-summary')).to_be_hidden();blank(page,'guest');assert urlparse(page.evaluate('opened.at(-1)')).path=='/966556156693'
   game();fill(page,'guest');page.evaluate("location.hash='games'");expect(page.locator('#service-dialog')).to_be_visible();assert page.locator('[name="games-package"]:checked').count()==0;blank(page,'guest');page.locator('.dialog-close').click();game();fill(page,'guest');page.goto(BASE+'/');page.go_back();page.locator('#games-card:not([disabled])').wait_for();expect(page.locator('#orders-summary')).to_be_hidden();blank(page,'guest')
  # Source restaurant checkout is cleared after edit-cancel, draft preparation and leaving the page.
  page.goto(BASE+'/guest-services/');page.locator('#restaurant-card:not([disabled])').wait_for()
  def sourceMeal():
   page.locator('#restaurant-card').click();page.locator('[data-category="ساندويتشات"] summary').click();page.locator('[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]').click();page.locator('[data-category="مشروبات باردة"] summary').click();expect(page.locator('#dialog-total')).to_have_text('11');page.locator('#apply-selection').click();fill(page,'restaurant')
  sourceMeal();page.locator('#restaurant-card').click();page.locator('.dialog-close').click();expect(page.locator('#restaurant-summary')).to_be_hidden();blank(page,'restaurant');sourceMeal();page.locator('#restaurant-order .send-order').click();expect(page.locator('#restaurant-summary')).to_be_hidden();blank(page,'restaurant');assert urlparse(page.evaluate('opened.at(-1)')).path=='/966537006531'
  sourceMeal();page.reload();page.locator('#restaurant-card:not([disabled])').wait_for();expect(page.locator('#restaurant-summary')).to_be_hidden();blank(page,'restaurant')
  out['profiles'].append({'width':width,'height':height,'mainServiceCancelBackAndReturn':True,'diningChoiceCleared':True,'forwardCannotReviveClosedOrder':True,'restaurantGroupAndRouteExitCleared':True,'categoryBrowsingPreserved':True,'guestAndChaletCancelCleared':True,'applyToCheckoutPreserved':True,'submittedDraftCleared':True,'standaloneArrangementExitsCleared':True});c.close();print(width,height,'PASS',flush=True)
 b.close()
assert not out['errors'],out['errors'];report=Path('/tmp/order-exits-v101-live.json') if BASE.startswith('https:') else R/'site/audits/order-exits-v101.json';report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

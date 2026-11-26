"""Independent native requests; compare every draft to the original standalone flow. Never send."""
import json,sys,subprocess,os
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8127'
SOURCE=json.loads((R/'data/services.json').read_text());links=json.loads((R/'site/orders/service-links.json').read_text())['services'];out={'version':'20261126-live-v79','profiles':[],'messagesSent':False,'errors':[]}
TAG='pre-resort-direct-orders-20261125'
for name in ['data/services.json','js/menu-order-message.js','chalet/guest-services/index.html','site/catalog.json','site/share-metadata.json','share-pages.json','share-extras.json']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show',TAG+':'+name]),name
# Guest message assembly remains unchanged. The coordinator's v74 greeting and inline capacity are owner-approved; compare its two request surfaces at runtime below.
for name,start,end in [('guest-services/guest-services.js','    var message;','\n  function renderOrders')]:
 old=subprocess.check_output(['git','show',TAG+':'+name]).decode();new=(R/name).read_text();a=old[old.index(start):old.index(end)];b=new[new.index(start):new.index(end)]
 if name.startswith('guest'):b=b.replace('    return true;\n','')
 else:b=b[:b.index('    return true;')]+ '  });\n'
 assert a==b,name+' message builder changed'
keys=['familyday.guest-orders.v2','familyday.arrangements-orders.v1'];cases=[('cinema','/services/cinema/'),('games','/services/games/'),('water','/services/water-games/'),('hospitality','/services/hospitality/packages/'),('restaurant','/menu/'),('coordination','/services/coordination/'),('dining','/services/dining-tables/'),('seating','/services/outdoor-seating/'),('extras','/services/')]
init="window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})"
def select(f,key):
 if key=='cinema':f.locator('#cinema-time').select_option('18')
 elif key=='games':f.locator('[name="games-package"][value="box"]').check()
 elif key=='water':
  for _ in range(3):f.locator('[data-water="adults"][data-step="1"]').click()
 elif key=='hospitality':f.locator('.hospitality-package [data-step="1"]').first.click()
 elif key=='restaurant':
  cat=f.locator('#guest-menu details').first;cat.locator('summary').click();cat.locator('[data-step="1"]').first.click()
 elif key in ['coordination','seating']:
  root=f.locator('#'+('package-1' if key=='coordination' else 'session-1'));details=root.locator('details').first
  if details.get_attribute('open') is None:details.locator('summary').click()
  root.locator('.arrangement-controls [data-step="1"]').click()
 elif key=='dining':
  f.locator('.fd-dining-option[data-size="12"][data-option="tansiq"]').click();f.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click();assert f.locator('.fd-dining-option[aria-pressed="true"]').count()==1
 else:f.locator('[data-extra="bed"] [data-step="1"]').click()
def identity(f,key,notes=True):
 prefix='arrangement' if key in ['coordination','dining','seating','cinema'] else 'restaurant' if key=='restaurant' else 'guest'
 f.locator('#'+prefix+'-name').fill('ضيف المراجعة');f.locator('#'+prefix+'-cabin').select_option('البيت اليوناني 1')
 if notes:f.locator('#'+prefix+'-notes').fill('مراجعة محلية فقط')
 return prefix
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 baseline={}
 for key,path in cases:
  c=b.new_context(viewport={'width':390,'height':844},ignore_https_errors=True);c.add_init_script(init);page=c.new_page();guest=key not in ['coordination','dining','seating','cinema']
  page.goto(BASE+('/guest-services/' if guest else '/services-guide/'))
  if guest:page.locator('#water-card:not([disabled])').wait_for();page.locator('#'+key+'-card').click()
  else:page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.guide-tile[href="#'+key+'"]').click()
  if guest:
   select(page,key);page.locator('#apply-selection').click()
  elif key=='cinema':
   page.locator('#cinema-session [data-request-key]').click();page.locator('#cinema-time').select_option('18')
  elif key=='dining':
   page.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click()
  else:
   root=page.locator('#'+('package-1' if key=='coordination' else 'session-1'));root.locator('summary').first.click();root.locator('[data-request-key]').click()
  prefix=identity(page,key);page.locator('#'+('restaurant-order .send-order' if key=='restaurant' else 'extras-order .send-order' if guest else 'arrangement-order .arrangement-send')).click();baseline[key]=page.evaluate('opened.at(-1)');assert baseline[key];c.close()
 print('Standalone reference drafts captured',flush=True)
 for width,height in [(320,568),(390,844),(430,932),(390,430)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',ignore_https_errors=True);c.add_init_script(init);page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.goto(BASE+'/services/');page.evaluate('(keys)=>keys.forEach(k=>sessionStorage.setItem(k,JSON.stringify({name:"OLD",cabin:"البيت اليوناني 2",games:"table",notes:"OLD",quantities:{"package-1":5}})))',keys);saved=page.evaluate('(keys)=>keys.map(k=>sessionStorage.getItem(k))',keys)
  for key,path in cases:
   page.goto(BASE+path);page.locator('#main [data-service-portal]').click();expect(page.locator('#native-order-dialog')).to_be_visible();expect(page.locator('.native-order-loading')).to_be_hidden();expect(page.locator('.native-order-error')).to_be_hidden();assert page.url==BASE+path
   f=page.frame_locator('.native-order-frame');expect(f.locator('.resort-direct-send')).to_be_visible();assert page.locator('.native-order-shortcut,.native-order-tabs').count()==0
   assert f.locator('.resort-direct-form').count()==1;assert not f.locator('.resort-direct-form .order-items,.resort-direct-form #arrangement-items').first.is_visible();assert not f.locator('#apply-selection').is_visible() if key not in ['coordination','dining','seating','cinema'] else not f.locator('.arrangement-dialog-footer [data-close-arrangements]').is_visible()
   expect(f.locator('.resort-direct-send')).to_be_disabled();prefix='arrangement' if key in ['coordination','dining','seating','cinema'] else 'restaurant' if key=='restaurant' else 'guest';assert f.locator('#'+prefix+'-notes').input_value()==''
   if key!='cinema':assert f.locator('#'+prefix+'-name').input_value()=='ضيف المراجعة'
   select(f,key);expect(f.locator('.resort-direct-send')).to_be_enabled()
   if key=='cinema':
    f.locator('.resort-direct-send').click();assert page.evaluate('opened.length')==0
   identity(f,key)
   # Both Greek mappings update immediately from the original catalogue.
   for name in ['البيت اليوناني 2','البيت اليوناني 1']:
    f.locator('#'+prefix+'-cabin').select_option(name)
    number=f.locator('#arrangement-cabin-number') if prefix=='arrangement' else f.locator('.resort-direct-form .cabin-number output')
    assert str(SOURCE['guest']['cabins'][name]) in number.inner_text()
   page.locator('.native-order-share').click();expected=links[key]['path'] if key=='extras' else urlparse(path).path;assert page.evaluate('shares.at(-1)')=={'text':BASE+expected}
   rect=f.locator('.resort-direct-send').bounding_box();assert rect['y']>=0 and rect['y']+rect['height']<=height,rect
   assert not f.locator('html').evaluate('e=>e.scrollWidth>innerWidth')
   if width==390 and height==844:
    Path('/tmp/resort-direct-orders-v71').mkdir(exist_ok=True);page.screenshot(path='/tmp/resort-direct-orders-v71/'+key+'.png')
   f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();assert page.evaluate('opened.at(-1)')==baseline[key],(key,page.evaluate('opened.at(-1)'),baseline[key]);assert page.evaluate('(keys)=>keys.map(k=>sessionStorage.getItem(k))',keys)==saved
  # Cancel/back/reopen discards selection and notes, retaining name/cabin only.
  page.goto(BASE+'/services/cinema/');page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');assert f.locator('#cinema-time').input_value()=='';f.locator('#cinema-time').select_option('18');f.locator('#arrangement-notes').fill('لا يستمر');page.go_back();expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();assert f.locator('#cinema-time').input_value()=='' and f.locator('#arrangement-notes').input_value()=='';page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
  page.reload();assert page.locator('.native-order-shortcut').count()==0
  out['profiles'].append({'width':width,'height':height,'independentServices':len(cases),'exactOriginalDraftsAndRecipients':True,'standaloneDraftsUntouched':True,'identityOnlyRemembered':True,'noSummaryOrCart':True,'backAndCancel':True});c.close();print(width,height,'PASS',flush=True)
 c=b.new_context(viewport={'width':390,'height':430});page=c.new_page();page.route('**/data/services.json?*',lambda r:r.fulfill(status=503,body='Unavailable'));page.goto(BASE+'/services/cinema/');page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-error')).to_be_visible(timeout=10000);assert page.locator('.native-order-external').get_attribute('data-url')=='/services-guide/#cinema';page.unroute('**/data/services.json?*');page.locator('.native-order-retry').click();expect(page.locator('.native-order-loading')).to_be_hidden();expect(page.frame_locator('.native-order-frame').locator('#cinema-time')).to_be_visible();out['sourceRetryInPlace']=True;c.close();b.close()
assert not out['errors'],out
(R/'site/audits/resort-direct-orders-v79.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

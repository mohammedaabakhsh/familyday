"""Main-site requests forget previous customer data; pointer returns leave no gold ring."""
from pathlib import Path
import json,os,sys
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';KEYS=['familyday.resort-direct-identity.v1','familyday.guest-orders.v2','familyday.arrangements-orders.v1','familyday.chalet-guest-orders.v1','familyday.guest-extras.v1','familyday.menu-cart.v1'];out={'version':'20261126-live-v98','profiles':[],'errors':[],'messagesSent':False}
seed='''window.opened=[];window.open=u=>{top.opened.push(u);return null};if(!sessionStorage.getItem('privacy-seeded')){for(const storage of [localStorage,sessionStorage])for(const key of %s)storage.setItem(key,JSON.stringify({name:'اسم قديم',cabin:'بيت الدوم 1',notes:'ملاحظة قديمة'}));sessionStorage.setItem('privacy-seeded','yes');}'''%json.dumps(KEYS)
def background(page):
 page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
def assertNoStoredOrder(page):
 assert page.evaluate('(keys)=>[localStorage,sessionStorage].every(s=>keys.every(k=>s.getItem(k)===null))',KEYS)
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(seed);page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  for kind,path in [('coordination','/services/coordination/'),('seating','/services/outdoor-seating/'),('games','/services/games/')]:
   page.goto(BASE+path);page.locator('#main h1').wait_for();assertNoStoredOrder(page)
   if kind!='games':page.locator('.service-guide-packages>.package summary').first.click()
   trigger=page.locator('#main [data-service-portal]').first;trigger.click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');prefix='guest' if kind=='games' else 'arrangement'
   for field in ['name','cabin','notes']:expect(f.locator('#'+prefix+'-'+field)).to_have_value('')
   assert f.locator('.resort-direct-form').get_attribute('autocomplete')=='off'
   f.locator('#'+prefix+'-name').fill('ضيف جديد');f.locator('#'+prefix+'-cabin').select_option('بيت الدوم 1');f.locator('#'+prefix+'-notes').fill('تفاصيل مؤقتة');assertNoStoredOrder(page)
   page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden();assert trigger.evaluate('e=>document.activeElement!==e');assert trigger.evaluate("e=>getComputedStyle(e).outlineStyle==='none'||getComputedStyle(e).outlineWidth==='0px'")
   trigger.click();expect(page.locator('.native-order-loading')).to_be_hidden()
   for field in ['name','cabin','notes']:expect(f.locator('#'+prefix+'-'+field)).to_have_value('')
   f.locator('#'+prefix+'-name').fill('عاد من الجوال');f.locator('#'+prefix+'-cabin').select_option('البيت اليوناني 2');f.locator('#'+prefix+'-notes').fill('لا تحفظ هذه الملاحظة');background(page);expect(page.locator('.native-order-loading')).to_be_hidden()
   for field in ['name','cabin','notes']:expect(f.locator('#'+prefix+'-'+field)).to_have_value('')
   f.locator('#'+prefix+'-name').fill('بيانات قبل الرجوع');page.evaluate("dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))");expect(f.locator('#'+prefix+'-name')).to_have_value('');assertNoStoredOrder(page)
   page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
   # Keyboard users still regain their place, with teal rather than gold focus.
   trigger.focus();trigger.press('Enter');expect(page.locator('.native-order-loading')).to_be_hidden();page.locator('.native-order-close').focus();page.locator('.native-order-close').press('Enter');expect(page.locator('#native-order-dialog')).to_be_hidden();expect(trigger).to_be_focused();assert trigger.evaluate("e=>getComputedStyle(e).outlineColor===getComputedStyle(document.documentElement).getPropertyValue('--teal').trim()||getComputedStyle(e).outlineColor==='rgb(109, 206, 210)'")
  page.goto(BASE+'/services/');page.locator('.inline-menu-quantity').first.wait_for();row=page.locator('.menu-row').first;row.locator('[data-step="1"]').click();row.locator('input[type=checkbox]').check();page.locator('#inline-restaurant-name').fill('اسم المطعم المؤقت');page.locator('#inline-restaurant-cabin').select_option('بيت الدوم 1');page.locator('#inline-restaurant-notes').fill('تفاصيل لا تحفظ');assertNoStoredOrder(page);assert page.locator('#inline-restaurant-name').get_attribute('autocomplete')=='off'
  background(page);expect(page.locator('.inline-restaurant-summary')).to_be_hidden();row.locator('[data-step="1"]').click();expect(page.locator('.inline-restaurant-total strong')).to_have_text('11 ريال')
  for field in ['name','cabin','notes']:expect(page.locator('#inline-restaurant-'+field)).to_have_value('')
  page.locator('#inline-restaurant-name').fill('باقي قبل التحديث');page.reload();page.locator('.inline-menu-quantity').first.wait_for();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();assertNoStoredOrder(page);assert page.evaluate('opened.length')==0
  out['profiles'].append({'width':width,'height':height,'oldStoredOrdersRemoved':True,'newFormsBlank':True,'noStorageWrites':True,'backgroundAndBackCacheReset':True,'restaurantReset':True,'pointerReturnHasNoRing':True,'keyboardFocusTeal':True});c.close()
 # The standalone portal now follows the same no-save policy.
 c=b.new_context(ignore_https_errors=True);page=c.new_page();page.goto(BASE+'/services-guide/#coordination');page.locator('#package-1 summary').click();page.locator('#package-1 [data-request-key]').click();page.locator('#arrangement-name').fill('زائر الفرعي');page.locator('#arrangement-cabin').select_option('بيت الدوم 1');page.reload();page.locator('#package-1 summary').click();page.locator('#package-1 [data-request-key]').click();expect(page.locator('#arrangement-name')).to_have_value('');out['standaloneWorkflowForgetsIdentity']=True;c.close();b.close()
assert not out['errors'],out['errors'];report=Path('/tmp/order-privacy-v98-live.json') if BASE.startswith('https:') else R/'site/audits/order-privacy-v98.json';report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

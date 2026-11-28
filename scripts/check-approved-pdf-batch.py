"""Approved measurement, presentation and order-copy checks; no real messages are sent."""
import asyncio,json,os,re,sys
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];D=Path('/tmp/familyday-approved-pdf-v134');D.mkdir(parents=True,exist_ok=True);BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8140';out={'measurements':[],'facts':[],'cabinOptions':[],'portals':[],'errors':[],'messagesSent':False}
GEOMETRY='''es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,value:e.querySelector('bdi').getBoundingClientRect().toJSON(),unit:e.querySelector('.spec-unit').getBoundingClientRect().toJSON()}))'''
async def main():
 async with async_playwright() as p:
  args={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
  if BASE.startswith('https:'):args['proxy']={'server':os.environ['HTTPS_PROXY']}
  b=await p.chromium.launch(**args);c=await b.new_context(viewport={'width':430,'height':932},ignore_https_errors=True,reduced_motion='reduce');await c.add_init_script('window.opened=[];window.open=u=>{window.opened.push(u);return null}');page=await c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  async def measures(root,label):
   data=await root.locator('.spec-measurement').evaluate_all(GEOMETRY);assert data,label;assert all(x['value']['left']-x['unit']['right']>=2 and abs(x['value']['top']-x['unit']['top'])<3 for x in data),(label,data);out['measurements'].append({'page':label,'count':len(data),'unitsAfterValuesWithGap':True})
  catalog=json.loads((R/'site/catalog.json').read_text())
  for u in catalog['units']:
   if not any('مسبح' in item for s in u['sections'] for item in s['items']):continue
   await page.goto(BASE+u['path']);await page.locator('#main h1').wait_for();await page.evaluate('document.fonts.ready');await page.locator('.spec').evaluate_all('es=>es.forEach(e=>e.open=true)');await measures(page,u['path'])
  for u in catalog['units']:
   if not u.get('tour') or not u['tour'].startswith('/') or u['venue']!='resort':continue
   await page.goto(BASE+u['tour']);f=page.frame_locator('#tour-frame');await f.locator('.dt-label[data-part="pool"]').first.click();await f.locator('body').evaluate('document.fonts.ready');await measures(f,u['tour'])
  await page.goto(BASE+'/chalet-map/');f=page.frame_locator('#tour-frame');await f.locator('.cm-cards').wait_for();await f.locator('body').evaluate('document.fonts.ready');await measures(f,'/chalet-map/');await page.screenshot(path=str(D/'chalet-pool-v134.png'))
  for w,h in [(375,812),(390,844),(430,932)]:
   await page.set_viewport_size({'width':w,'height':h});await page.goto(BASE+'/stay/');await page.locator('.facts-strip').wait_for();await page.evaluate('document.fonts.ready');facts=await page.locator('.facts-strip span').evaluate_all('es=>es.map(e=>{const r=document.createRange();r.selectNodeContents(e);return {text:e.textContent,font:getComputedStyle(e).fontSize,lines:new Set([...r.getClientRects()].map(b=>Math.round(b.top))).size}})');assert all(x['lines']==1 for x in facts),(w,facts);assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth');assert await page.locator('.venue-footnotes p').inner_text()=='يمكن استقبال حتى 70 ضيفًا لكل قسم برسوم إضافية';out['facts'].append({'width':w,'facts':facts});
   if w==390:await page.screenshot(path=str(D/'stay-home-v134.png'))
  await page.set_viewport_size({'width':430,'height':932})
  for path,branch in [('/guest-services/','فرع خليج سلمان'),('/services-guide/','فرع خليج سلمان'),('/chalet/guest-services/','حي المروج'),('/stay/guest-services/','فرع خليج سلمان')]:
   await page.goto(BASE+path);await page.locator('.portal-branch').wait_for();await page.evaluate('document.fonts.ready');assert await page.locator('.portal-branch').inner_text()==branch;head=page.locator('.hero h1,#guide-title');assert await head.evaluate('e=>getComputedStyle(e).fontSize')=='28px';card=page.locator('#slide-title');
   if path=='/stay/guest-services/':assert await card.evaluate('e=>getComputedStyle(e).fontSize')=='16px';await page.screenshot(path=str(D/'stay-portal-v134.png'),full_page=True)
   if path=='/services-guide/':assert await head.inner_text()=='التنسيقات والجلسات'
   for href in await page.locator('.help-actions a[href*="wa.me"],.contact-actions a[href*="wa.me"]').evaluate_all('es=>es.map(e=>e.href)'):assert '?text=' not in href
   out['portals'].append({'path':path,'branchUnchanged':True,'mainTitleFontUnchanged':True,'generalWhatsAppStillEmpty':True})
  # Both inline and independent/embedded controllers keep option values stable while labels gain numbers.
  for path,selector in [('/menu/','#inline-restaurant-cabin'),('/guest-services/restaurant/','#service-request-cabin'),('/services-guide/coordination/','#arrangement-cabin')]:
   await page.goto(BASE+path)
   if path=='/menu/':
    await page.locator('#main h1').wait_for();await page.locator('[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]').click()
   elif path=='/guest-services/restaurant/':
    await page.locator('body.guest-independent-orders').wait_for();await page.locator('[data-category="ساندويتشات"]>summary').click();await page.locator('[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]').click();await page.locator('#apply-selection').click()
   else:
    await page.locator('#guide-content.is-ready').wait_for(state='attached');host=page.locator('#package-1');await host.locator('details>summary').click();await host.locator('[data-request-key]').click()
   await page.locator(selector).wait_for();options=await page.locator(selector+' option').evaluate_all('es=>es.filter(e=>e.value).map(e=>({value:e.value,label:e.textContent}))');expected=[{'value':name,'label':name+' ('+str(number)+')'} for name,number in catalog['source']['guestCatalog']['cabins'].items()];assert options==expected,path;await page.locator(selector).select_option('البيت اليوناني 1');assert await page.locator(selector+' option:checked').inner_text()=='البيت اليوناني 1 (10)';assert await page.locator('.cabin-number,#arrangement-cabin-number,.inline-restaurant-cabin-number').count()==0;out['cabinOptions'].append({'path':path,'all12LabelsAndValuesCorrect':True,'noDuplicatedNumberBelow':True})
  # Exercise the shared message API and assert approved formatting without opening WhatsApp.
  await page.goto(BASE+'/guest-services/');await page.locator('body.guest-independent-orders').wait_for();messages=await page.evaluate('''()=>{const c={name:'اختبار',cabin:'البيت اليوناني 1',number:10,notes:''},m=FD_GUEST_ORDER_MESSAGE;return {restaurant:m.build({service:'restaurant',items:[{name:'اختبار صنف',qty:2,price:24,details:[]}]},c),water:m.build({service:'water',items:[{name:'باقة ألعاب مائية',qty:1,price:50}],water:{adults:2,children:1}},c)}}''');assert 'الكمية: 2 — الإجمالي: 24 ريال' in messages['restaurant'];assert 'الباقة: باقة ألعاب مائية' in messages['water'];assert all('\n\nإجمالي الطلب:' in t and '\n\n\nإجمالي الطلب:' not in t and 'المكان: منتجع' not in t for t in messages.values());out['messageFormat']=messages
  await b.close()
 assert not out['errors'],out['errors'];(D/('approved-features'+('-live' if BASE.startswith('https:') else '')+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2));print('Approved features PASS',len(out['measurements']),'measurement views',flush=True)
asyncio.run(main())

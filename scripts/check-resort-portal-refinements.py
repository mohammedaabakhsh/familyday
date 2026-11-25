"""Guard the user's retained header/card layout and the accepted resort-only changes."""
import asyncio,hashlib,json,subprocess,sys
from pathlib import Path
from playwright.async_api import async_playwright,expect
R=Path(__file__).resolve().parents[1];B=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
METRICS='''()=>{const hero=document.querySelector('.hero').getBoundingClientRect();return [...document.querySelectorAll('.service-tile')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,yFromHero:r.y-hero.bottom,width:r.width,height:r.height,padding:s.padding,radius:s.borderRadius,font:getComputedStyle(e.querySelector('.tile-title')).font}})}'''
async def main():
 manifest=json.loads((R/'site/cleanup-manifest.json').read_text())['approvedPortalRefinements']
 for path,digest in manifest['unchangedFiles'].items():assert hashlib.sha256((R/path).read_bytes()).hexdigest()==digest,path
 original=subprocess.check_output(['git','show',manifest['rollbackCommit']+':guest-services/index.html']).decode()
 baseline=json.loads((R/'site/audits/resort-refinements-layout-v61.json').read_text())
 out={'version':manifest['version'],'unchangedProtectedFiles':len(manifest['unchangedFiles']),'returnLinkDeferred':True,'viewports':[],'errors':[],'messagesSent':False}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width in [320,390,768,1024,1440]:
   context=await browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce');page=await context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
   await page.route('**/guest-services/?baseline=1',lambda r:r.fulfill(body=original,content_type='text/html'))
   async def ready():await page.locator('#games-card:not([disabled])').wait_for();await page.evaluate('document.fonts.ready')
   await page.goto(B+'/guest-services/');await ready()
   before=next(r for r in baseline if r['width']==width and r['before']);assert await page.evaluate(METRICS)==before['cards']
   title=await page.locator('.hero h1').evaluate('e=>getComputedStyle(e).font');assert title==before['heading']['font']
   logo=await page.locator('.logo-frame').bounding_box();assert 149<=logo['width']<=164.5
   assert 'logo-original.png' in await page.locator('.logo').evaluate('e=>getComputedStyle(e).backgroundImage')
   if width<1024:
    assert abs(logo['x']+logo['width']/2-width/2)<1
    assert await page.locator('.hero').evaluate('e=>getComputedStyle(e).textAlign')=='center'
   assert await page.locator('.portal-branch').inner_text()=='فرع خليج سلمان'
   assert await page.locator('.portal-branch').evaluate('e=>e.previousElementSibling.textContent')=='منتجع يوم العائلة'
   assert await page.locator('.portal-branch').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)<parseFloat(getComputedStyle(e.previousElementSibling).fontSize)')
   assert await page.locator('a[href="/"],a[href="/resort/"],a[href="/services/"]').count()==0
   assert await page.locator('.help p').inner_text()==before['helpText']
   help_box=await page.locator('.help').bounding_box();assert help_box['height']==before['helpHeight']
   assert await page.locator('.help-actions a').evaluate_all('es=>es.map(e=>({href:e.getAttribute("href"),text:e.textContent}))')==before['contactLinks']
   if width<640:
    first,second=await page.locator('.help-contact').evaluate_all('es=>es.map(e=>e.getBoundingClientRect().y)');assert second>first
   await page.screenshot(path=f'/tmp/portal-refinements/empty-{width}.png',full_page=True)
   async def open_service(key):await page.locator('#'+key+'-card').click();await page.locator('#service-dialog').wait_for()
   async def apply():await page.locator('#apply-selection').click();await expect(page.locator('#service-dialog')).not_to_be_visible()
   await open_service('restaurant');await page.locator('[data-category="ساندويتشات"] summary').click();row=page.locator('[data-menu-name="ساندويتش دجاج زنجر"]');await row.locator('[data-step="1"]').click();await row.locator('[type="checkbox"]').check();await apply()
   await open_service('water');await page.locator('[data-water="adults"][data-step="1"]').click();await page.locator('[data-water="children"][data-step="1"]').click(click_count=2);await apply()
   await open_service('games');await page.locator('input[name="games-package"][value="box"]').check();await apply()
   await open_service('hospitality');await page.locator('#hospitality-packages .quantity [data-step="1"]').first.click();await apply()
   await open_service('cinema');await page.locator('#cinema-time').select_option('20');await apply()
   await open_service('extras');await page.locator('[data-extra="robe"] [data-step="1"]').click();await apply()
   assert await page.locator('.service-tile.is-selected').count()==6
   colors=await page.locator('.service-tile.is-selected').evaluate_all('es=>es.map(e=>({border:getComputedStyle(e).borderColor,icon:getComputedStyle(e.querySelector(".tile-icon")).backgroundColor}))');assert len({r['border'] for r in colors})==6;assert all(r['border']==r['icon'] for r in colors)
   assert await page.locator('#restaurant-summary').is_visible() and await page.locator('#resort-summary').is_visible()
   extra=page.locator('#restaurant-items .order-line-details').first;await extra.wait_for(state='attached');assert await extra.get_attribute('open') is None;await extra.locator('summary').click();await expect(extra).to_have_attribute('open','');assert 'إضافة جبنة' in await extra.inner_text()
   water=page.locator('#order-items [data-group="water"] .order-line-details');assert await water.get_attribute('open') is None;await water.locator('summary').click();await expect(water).to_have_attribute('open','');assert 'للكبار: 1' in await water.inner_text() and 'للأطفال: 2' in await water.inner_text()
   await page.evaluate('new Promise(r=>requestAnimationFrame(r))');await page.get_by_role('button',name='حذف روب ومناشف لشخص واحد',exact=True).click();await expect(page.locator('#order-items [data-group="water"] .order-line-details')).to_have_attribute('open','')
   await page.locator('#restaurant-name').fill('ضيف التجربة');await page.locator('#restaurant-cabin').select_option(label='بيت الدوم 1');totals=[await page.locator('#restaurant-total').text_content(),await page.locator('#order-total').text_content()]
   await page.reload();await ready();assert [await page.locator('#restaurant-total').text_content(),await page.locator('#order-total').text_content()]==totals
   assert await page.locator('#restaurant-name').input_value()=='ضيف التجربة' and await page.locator('#restaurant-cabin').input_value()=='بيت الدوم 1'
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   selected=await page.evaluate(METRICS);await page.screenshot(path=f'/tmp/portal-refinements/selected-{width}.png',full_page=True)
   # Same saved choices in the untouched prior HTML: prove that tile geometry also stays unchanged after selection.
   await page.goto(B+'/guest-services/?baseline=1');await ready();assert await page.evaluate(METRICS)==selected
   out['viewports'].append({'width':width,'logoWidth':logo['width'],'idleAndSelectedCardGeometryPreserved':True,'helpHeightBefore':before['helpHeight'],'helpHeightAfter':help_box['height'],'helpCopyAndLinksPreserved':True,'originalHelpDesignRestored':True,'distinctSelectionColors':6,'supplementaryDetails':True,'ordersPersist':True})
   await context.close()
  await browser.close()
 assert not out['errors'],out['errors'];(R/'site/audits/resort-refinements-v62.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
asyncio.run(main())

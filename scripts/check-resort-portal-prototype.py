"""Verify the approved resort-only presentation and the saved-order return journey."""
import asyncio,json,sys,hashlib
from pathlib import Path
from playwright.async_api import async_playwright,expect
R=Path(__file__).resolve().parents[1];B=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
async def main():
 out={'version':'20261125-resort-portal-v59','viewports':[],'ordersSent':False,'errors':[]};baseline=json.loads((R/'site/cleanup-manifest.json').read_text())['approvedPortalRefresh']
 for path,digest in baseline['unchangedFiles'].items():
  assert hashlib.sha256((R/path).read_bytes()).hexdigest()==digest,path
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for w in [320,390,768,1024,1440]:
   context=await browser.new_context(viewport={'width':w,'height':844},reduced_motion='reduce');page=await context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
   await page.goto(B+'/guest-services/');await page.locator('#games-card:not([disabled])').wait_for();await page.evaluate('document.fonts.ready')
   assert await page.locator('.portal-branch').inner_text()=='فرع خليج سلمان'
   assert await page.locator('.portal-branch').evaluate('e=>e.previousElementSibling.textContent')=='منتجع يوم العائلة'
   assert await page.locator('.portal-return').get_attribute('href')=='/services/'
   assert not await page.locator('meta[property^="og:image"],meta[name^="twitter:image"],img').count()
   logo=await page.locator('.logo-frame').bounding_box();assert 149<=logo['width']<=164.5,logo
   assert 'logo-original.png' in await page.locator('.logo').evaluate('e=>getComputedStyle(e).backgroundImage')
   sizes=await page.locator('.service-tile').evaluate_all('es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,radius:getComputedStyle(e).borderRadius}})')
   assert len(sizes)==6 and max(s['width'] for s in sizes)-min(s['width'] for s in sizes)<1 and max(s['height'] for s in sizes)-min(s['height'] for s in sizes)<1,sizes
   assert {s['radius'] for s in sizes}=={'16px'}
   async def open_service(key):await page.locator('#'+key+'-card').click();await page.locator('#service-dialog').wait_for()
   async def apply():await page.locator('#apply-selection').click();await expect(page.locator('#service-dialog')).not_to_be_visible()
   await open_service('restaurant');await page.locator('[data-category="ساندويتشات"] summary').click();row=page.locator('[data-menu-name="ساندويتش دجاج زنجر"]');await row.locator('[data-step="1"]').click();await row.locator('[type="checkbox"]').check();await apply()
   await open_service('water');await page.locator('[data-water="adults"][data-step="1"]').click();await page.locator('[data-water="children"][data-step="1"]').click(click_count=2);await apply()
   await open_service('games');await page.locator('input[name="games-package"][value="box"]').check();await apply()
   await open_service('hospitality');await page.locator('#hospitality-packages .quantity [data-step="1"]').first.click();await apply()
   await open_service('cinema');await page.locator('#cinema-time').select_option('20');await apply()
   await open_service('extras');await page.locator('[data-extra="robe"] [data-step="1"]').click();await apply()
   assert await page.locator('.service-tile.is-selected').count()==6
   colors=await page.locator('.service-tile.is-selected').evaluate_all('es=>es.map(e=>({border:getComputedStyle(e).borderColor,icon:getComputedStyle(e.querySelector(".tile-icon")).backgroundColor,bg:getComputedStyle(e).backgroundColor}))')
   assert len({s['border'] for s in colors})==6,colors
   assert all(s['border']==s['icon'] for s in colors)
   assert await page.locator('#restaurant-summary').is_visible() and await page.locator('#resort-summary').is_visible()
   name=await page.locator('#restaurant-items .order-item-copy>strong').first.inner_text();assert 'زنجر' in name and '× 1' in name
   extra=page.locator('#restaurant-items .order-line-details').first;await extra.wait_for(state='attached');assert await extra.get_attribute('open') is None
   await extra.locator('summary').click();await expect(extra).to_have_attribute('open','');assert 'إضافة جبنة' in await extra.inner_text()
   water=page.locator('#order-items [data-group="water"] .order-line-details');await water.locator('summary').click();await expect(water).to_have_attribute('open','');assert 'للكبار: 1' in await water.inner_text() and 'للأطفال: 2' in await water.inner_text()
   await page.evaluate('new Promise(r=>requestAnimationFrame(r))')
   await page.get_by_role('button',name='حذف روب ومناشف لشخص واحد',exact=True).click()
   await expect(page.locator('#order-items [data-group="water"] .order-line-details')).to_have_attribute('open','')
   totals=[await page.locator('#restaurant-total').text_content(),await page.locator('#order-total').text_content()]
   await page.locator('#restaurant-name').fill('ضيف التجربة');await page.locator('#restaurant-cabin').select_option(label='بيت الدوم 1')
   await page.screenshot(path=f'/tmp/portal-ideas/prototype-final-{w}.png',full_page=True)
   await page.locator('.portal-return').click();await page.wait_for_url(B+'/services/');await page.locator('#resort-service-directory a[href="/menu/"]').click();await page.wait_for_url(B+'/menu/')
   portal=page.locator('[data-service-portal]');await portal.evaluate('e=>{const u=new URL(e.href);e.href=location.origin+u.pathname+u.hash}');target=await portal.get_attribute('href');await portal.click();await page.wait_for_url(target);await page.locator('#games-card:not([disabled])').wait_for();await page.locator('.dialog-close').click()
   assert [await page.locator('#restaurant-total').text_content(),await page.locator('#order-total').text_content()]==totals
   assert await page.locator('#restaurant-name').input_value()=='ضيف التجربة' and await page.locator('#restaurant-cabin').input_value()=='بيت الدوم 1'
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   out['viewports'].append({'width':w,'logoWidth':logo['width'],'equalTiles':True,'distinctSelectionColors':len(colors),'summaryDetails':True,'returnPreservesOrders':True})
   await context.close()
  await browser.close()
 assert not out['errors'],out['errors'];(R/'site/audits/resort-portal-prototype-v59.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
asyncio.run(main())

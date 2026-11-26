"""Check the approved mobile PDF batch and preserve deferred choices and source facts."""
import asyncio,json,re,sys,subprocess,hashlib
from pathlib import Path
from playwright.async_api import async_playwright,expect
R=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8123'
OLD='pre-approved-pdf-batch-20261125'
def old(path):return subprocess.check_output(['git','show',OLD+':'+path],cwd=R,text=True)
async def main():
 catalog=json.loads((R/'site/catalog.json').read_text());before=json.loads(old('site/catalog.json'))
 assert catalog['units']==before['units'] # No facts, gallery changes, image copies or rejected introductions.
 source=json.loads((R/'data/services.json').read_text());previous=json.loads(old('data/services.json'))
 for session in previous['arrangements']['seating']['sessions']:
  if session['persons']=='شخصين':session['persons']='لشخصين'
 assert source==previous # All prices, names, recipients and remaining catalogue content preserved.
 for path in ['guest-services/index.html','chalet/guest-services/index.html','services-guide/index.html']:
  assert (R/path).read_text()==old(path).replace('إنستجرام','إنستقرام')
 copy=json.loads((R/'site/guide-copy.json').read_text())
 for v,data in copy['faqs'].items():
  previous_faq=json.loads(old('site/guide-copy.json'))['faqs'][v]
  assert sum(len(g['items']) for g in data['groups'])==sum(len(g['items']) for g in previous_faq['groups'])
  assert next(g for g in data['groups'] if g['label']=='التعليمات')['title']=='تعليمات الإقامة والسلامة'
  assert next(g for g in data['groups'] if g['label']=='الحجز')['title']=='الحجز والتطبيقات'
  assert all(l['text']=='الحجز والتطبيقات' for g in data['groups'] for q in g['items'] if q['id'] in ['booking','chalet-booking','stay-booking'] for l in q['links'])
 output={'version':'20261125-live-v69','profiles':[],'errors':[],'badResponses':[],'sourceFactsAndPricesUnchanged':True,'deferredChoicesPreserved':True}
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height in [(320,568),(390,844),(430,932)]:
   c=await b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');page=await c.new_page()
   page.on('pageerror',lambda e:output['errors'].append(str(e)))
   page.on('response',lambda r:output['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
   await page.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async data=>shares.push(data)})")
   async def visit(path):
    await page.goto(BASE+path);await page.locator('#main h1').wait_for(state='attached');await page.evaluate('document.fonts.ready')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),path
   async def measurement(locator,expected):
    await expect(locator).to_have_text(expected)
    data=await locator.evaluate('''e=>{const t=e.firstChild,first=document.createRange(),last=document.createRange();first.setStart(t,0);first.setEnd(t,1);const j=t.textContent.lastIndexOf('4');last.setStart(t,j);last.setEnd(t,j+1);const a=first.getBoundingClientRect(),b=last.getBoundingClientRect();return {direction:getComputedStyle(e).direction,nowrap:getComputedStyle(e).whiteSpace,rows:e.getClientRects().length,ordered:a.x<b.x,sameLine:Math.abs(a.y-b.y)<1}}''')
    assert data=={'direction':'ltr','nowrap':'nowrap','rows':1,'ordered':True,'sameLine':True},data
   await visit('/');chalet=next(u for u in catalog['units'] if u['id']==30)
   assert await page.locator('a.destination-card[href="/chalet/"] img').get_attribute('src')==chalet['images'][0]
   for venue in ['resort','chalet','stay']:
    await visit('/'+venue+'/');assert await page.locator('.hero h2').count()==0
    assert (await page.locator('.resort-intro h1').inner_text()).startswith('دليلكم ل')
    assert await page.locator('.hero a,.hero button').count()==0
    assert await page.locator('#bottom-nav a').count()==5
    assert await page.locator('#bottom-nav a').first.evaluate('e=>getComputedStyle(e).fontSize')==('10px' if width<361 else '11px')
    if venue=='chalet':assert await page.locator('.hero img').get_attribute('src')==chalet['images'][0]
    if width==390:
     await page.locator('.hero img').evaluate('e=>e.decode()');await page.screenshot(path=f'/tmp/familyday-v69/{venue}-home.png',full_page=True)
   await visit('/chalet/details/');assert await page.locator('#gallery-image').get_attribute('src')==chalet['images'][0]
   await visit('/cabins/')
   for u in catalog['units']:
    if u['venue']=='resort' and u['guests']==10:
     await expect(page.locator(f'[data-unit-id="{u["id"]}"] .card-facts')).to_contain_text('حتى 10 ضيوف')
   for path,count in [('/cabins/dome-1/','1 من 12 + الحديقة المشتركة'),('/cabins/dome-2/','2 من 12 + الحديقة المشتركة')]:
    await visit(path);await expect(page.locator('.cabin-browse-summary')).to_have_text(count)
    assert await page.locator('.cabin-browse-summary p').count()==1
   last=next(u for u in catalog['units'] if u['id']==10)
   await visit(last['path']);await page.locator('a.cabin-switch[rel="next"]').click()
   await expect(page.locator('.cabin-browse-summary')).to_have_text('الحديقة المشتركة')
   await page.locator('a.cabin-switch[rel="prev"]').click();await expect(page.locator('.detail-copy h1')).to_contain_text(last['name'])
   # A filtered catalogue must retain its own count and Garden navigation.
   await visit('/cabins/');await page.locator('[data-filter="2"]').click();await page.locator('.resort-unit-card .card-details').first.click()
   count=sum(u['venue']=='resort' and u['rooms']==2 for u in catalog['units'])
   await expect(page.locator('.cabin-browse-summary')).to_have_text(f'1 من {count} + الحديقة المشتركة')
   await visit('/cabins/dome-1/');await page.locator('.spec').evaluate_all('es=>es.forEach(e=>e.open=true)')
   await measurement(page.locator('.spec-item .measurement').first,'7 × 4 م')
   await visit('/resort/compare/');await page.locator('[data-compare="1"]').check();await page.locator('[data-compare="12"]').check()
   await measurement(page.locator('.resort-comparison-table .measurement').first,'7 × 4 م')
   await visit('/dome-tour/');frame=page.frame_locator('#tour-frame');await frame.locator('.dt-label[data-part="pool"]').click()
   await expect(frame.locator('.dt-label[data-part="bathroom"]')).to_have_text('الحمام')
   await measurement(frame.locator('.dt-card').filter(has_text='المقاس').locator('.fd-measurement'),'7 × 4 م')
   if width==390:await page.screenshot(path='/tmp/familyday-v69/dome-pool.png',full_page=True)
   for path in ['/services/cinema/','/services/games/','/services/dining-tables/','/chalet/services/games/']:
    await visit(path);photo=page.locator('.service-main-photo img');await expect(photo).to_be_visible();await photo.evaluate('e=>e.decode()')
    assert await photo.evaluate('e=>!e.closest("details")&&e.naturalWidth>0')
    assert await page.locator('#main img').count()==1
    assert await photo.evaluate('e=>Math.abs(e.width/e.height-e.naturalWidth/e.naturalHeight)<0.01')
    details=page.locator('.dining-guide-details' if 'dining' in path else '.service-guide-details')
    if 'dining' not in path:
     assert not await details.evaluate('e=>e.open');await details.locator('summary').click()
    await expect(details.locator('.inclusions')).to_be_visible()
    # Zoom and sharing are still attached to the same image/link, with no image attachments.
    if 'dining' in path:
     assert await page.locator('.service-main-photo button,[data-package-photo]').count()==0
     await photo.click();await expect(page.locator('#viewer')).to_be_hidden()
    else:
     await page.locator('.service-main-photo button').click();await expect(page.locator('#viewer')).to_be_visible();await page.keyboard.press('Escape')
    await page.locator('#header-actions [data-share]').click();assert list((await page.evaluate('shares.at(-1)')))==['text']
    if width==390:
     if 'dining' not in path:await details.locator('summary').click()
     await page.screenshot(path='/tmp/familyday-v69/'+path.strip('/').replace('/','-')+'.png',full_page=True)
   await visit('/stay/compare/');row=page.locator('tbody tr').filter(has=page.locator('th',has_text='سعة الضيوف'))
   assert await row.locator('td').all_text_contents()==['25 ضيفًا، وحتى 70 برسوم إضافية']*2
   assert await page.locator('thead small').count()==0
   if width==390:await page.screenshot(path='/tmp/familyday-v69/stay-compare.png',full_page=True)
   await visit('/services/outdoor-seating/');assert (await page.locator('.service-guide-capacity').all_text_contents())[:2]==['لشخصين']*2
   assert (await page.locator('.package summary span').first.inner_text()).startswith(source['arrangements']['seating']['sessions'][0]['name'])
   await page.goto(BASE+'/services-guide/#seating');await page.locator('#guide-content.is-ready').wait_for(state='attached')
   assert await page.locator('#seating .package-card').count()==6
   await expect(page.locator('#seating')).to_contain_text('لشخصين')
   output['profiles'].append({'width':width,'height':height,'coverConsistency':True,'singleCounterAndGarden':True,'rtlMeasurements':True,'visibleServicePhotosAndZoom':True,'capacityRow':True,'textOnlySharing':True})
   await c.close();print(width,'PASS',flush=True)
  await b.close()
 assert not output['errors'] and not output['badResponses'],output
 (R/'site/audits/approved-mobile-review-v69.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(output,ensure_ascii=False))
asyncio.run(main())

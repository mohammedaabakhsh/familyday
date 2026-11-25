"""Validate retained photos and exercise illustrations after unused-asset cleanup."""
import asyncio,json,re,sys
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];S=R/'site';BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
async def main():
 catalog=json.loads((S/'catalog.json').read_text());refs=set()
 for file in ['site/catalog.json','site/guide-copy.json','site/structured-data.json','site/media-manifest.json','data/services.json']:
  refs.update(re.findall(r'/((?:imgs|site/media)/[\w./-]+\.(?:webp|png|jpg|jpeg))', (R/file).read_text()))
 out={'retainedImages':len(refs),'illustrations':[],'badResponses':[],'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=await browser.new_context(viewport={'width':390,'height':844},ignore_https_errors=True)
  # All catalogue originals, optimized display images, zoom images and schema images exist.
  limit=asyncio.Semaphore(8)
  async def check(ref):
   assert (R/ref).is_file(),ref
   async with limit:
    response=await context.request.get(BASE+'/'+ref);assert response.status==200,(ref,response.status)
    assert response.headers.get('content-type','').startswith('image/'),ref
  await asyncio.gather(*(check(ref) for ref in sorted(refs)))
  page=await context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.on('response',lambda r:out['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
  for unit in catalog['units']:
   if not unit.get('tour') or unit['id']==11:continue
   path=unit['tour'];await page.goto(BASE+path);await page.locator('#tour-frame').wait_for();frame=page.frame_locator('#tour-frame')
   selector='.cm-image' if 'chalet-map' in path else '.dt-image'
   image=frame.locator(selector);await image.wait_for(state='attached');await image.evaluate('async img=>{img.loading="eager";await img.decode();if(!img.naturalWidth)throw new Error("Image empty")}')
   info=await image.evaluate('img=>({src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight})');out['illustrations'].append({'unit':unit['id'],**info})
  await page.goto(BASE+'/resort-map/');await page.locator('#tour-frame').wait_for();frame=page.frame_locator('#tour-frame');image=frame.locator('.fd-map-image');await image.wait_for(state='attached');await image.evaluate('async img=>{await img.decode()}');out['mapImage']=await image.get_attribute('src')
  for button in await frame.locator('.fd-map-label').all():await button.click(force=True)
  await page.screenshot(path='/tmp/cleanup/map.png',full_page=True)
  await browser.close()
 assert not out['errors'] and not out['badResponses'],out
 (S/'audits/live-assets-v55.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))
asyncio.run(main())

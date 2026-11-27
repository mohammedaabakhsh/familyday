"""Back navigation paints content at full opacity from the first rendered frame."""
import asyncio,json,sys,os,io
from PIL import Image,ImageChops
from pathlib import Path
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
R=Path(__file__).resolve().parents[1]
async def main():
 results=[]
 async with async_playwright() as p:
  launch={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
  if BASE.startswith('https://') and os.environ.get('HTTPS_PROXY'):launch['proxy']={'server':os.environ['HTTPS_PROXY']}
  b=await p.chromium.launch(**launch)
  for width,motion in [(320,'no-preference'),(390,'no-preference'),(1440,'no-preference'),(390,'reduce')]:
   page=await b.new_page(viewport={'width':width,'height':844},reduced_motion=motion,ignore_https_errors=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'/');await page.locator('a.destination-card[href="/resort/"]').click();await page.wait_for_url(BASE+'/resort/')
   await page.locator('.hero img').evaluate('async img=>{await img.decode()}');await page.evaluate('document.fonts.ready')
   await page.evaluate("window.originalHero=document.querySelector('.hero img')")
   hero=page.locator('.hero');hero_before=await hero.screenshot()
   # A return must not depend on fetching/decoding the already displayed photo again.
   await page.route('**/imgs/panorama_2.webp',lambda request:request.abort())
   await page.evaluate('''window.backSamples=[];window.sampleBack=()=>{const v=document.querySelector('#main>.view'),s=getComputedStyle(v);const hero=document.querySelector('.hero img');window.backSamples.push({url:location.pathname,opacity:Number(s.opacity),transform:s.transform,heroReady:location.pathname!=='/resort/'||hero===window.originalHero&&hero.complete&&hero.naturalWidth>0});};window.sampleFrames=()=>{let n=0;const frame=()=>{window.sampleBack();if(++n<12)requestAnimationFrame(frame);};window.sampleBack();requestAnimationFrame(frame);};window.addEventListener('popstate',()=>window.sampleFrames());''')
   async def services():
    await page.locator('#bottom-nav a[href="/services/"]').click();await page.locator('#resort-service-directory').wait_for();await page.locator('.service-categories [data-service-group="1"]').click();await page.locator('#resort-service-directory .svcs-card:visible').first.wait_for();assert await page.locator('#services-frame').count()==0
   async def stable(action,target):
    await page.evaluate('window.backSamples=[]')
    await action();await page.wait_for_url(BASE+target);await page.wait_for_function('window.backSamples.length>=13')
    samples=await page.evaluate('window.backSamples');assert all(s['url']==target and s['opacity']==1 and s['heroReady'] and s['transform'] in ['none','matrix(1, 0, 0, 1, 0, 0)'] for s in samples),samples
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    results.append({'width':width,'motion':motion,'target':target,'frames':len(samples),'minimumOpacity':min(s['opacity'] for s in samples),'heroReadyEveryFrame':all(s['heroReady'] for s in samples)})
   await services();assert await page.locator('.svcs-card').count()==10
   directory_top=await page.locator('#resort-service-directory').evaluate('e=>{e.scrollTop=125;return e.scrollTop}');await page.evaluate('scrollTo(0,125)');page_top=await page.evaluate('scrollY')
   await stable(lambda:page.locator('.context-back').evaluate('a=>{a.click();window.sampleFrames()}'),'/resort/')
   hero_after=await hero.screenshot();assert ImageChops.difference(Image.open(io.BytesIO(hero_before)).convert('RGB'),Image.open(io.BytesIO(hero_after)).convert('RGB')).getbbox() is None;results[-1]['heroPixelsUnchanged']=True
   # Returning from a service uses the existing browser history entry.
   await services();assert await page.locator('#resort-service-directory').evaluate('e=>e.scrollTop')==directory_top;assert await page.evaluate('scrollY')==page_top;await page.locator('#resort-service-directory a[href="/services/cinema/"]').click();await page.wait_for_url(BASE+'/services/cinema/')
   await stable(lambda:page.locator('.context-back').click(),'/services/');await page.locator('#resort-service-directory').wait_for();await page.locator('.service-categories [data-service-group="1"]').click();await page.locator('#resort-service-directory .svcs-card:visible').first.wait_for();assert await page.locator('#services-frame').count()==0
   # Bottom tabs replace the section entry: browser Back returns to destinations.
   await stable(lambda:page.evaluate('history.back()'),'/')
   assert not errors,errors
   await page.close()
  await b.close()
 out={'checks':results,'errors':[]};(R/'site/audits'/('back-navigation-'+json.loads((R/'site/routes.json').read_text())['version'].rsplit('-',1)[-1]+'.json')).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
asyncio.run(main())

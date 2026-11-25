"""Back navigation paints content at full opacity from the first rendered frame."""
import asyncio,json,sys,os
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
   if motion=='no-preference':assert await page.locator('#main>.view').evaluate('e=>getComputedStyle(e).animationName')=='enter'
   await page.evaluate('''window.backSamples=[];window.sampleBack=()=>{const v=document.querySelector('#main>.view'),s=getComputedStyle(v);window.backSamples.push({url:location.pathname,opacity:Number(s.opacity),transform:s.transform});};window.sampleFrames=()=>{let n=0;const frame=()=>{window.sampleBack();if(++n<12)requestAnimationFrame(frame);};window.sampleBack();requestAnimationFrame(frame);};window.addEventListener('popstate',()=>window.sampleFrames());''')
   async def services():
    await page.locator('#bottom-nav a[href="/services/"]').click();await page.frame_locator('#services-frame').locator('.svcs-card').first.wait_for()
   async def stable(action,target):
    await page.evaluate('window.backSamples=[]')
    await action();await page.wait_for_url(BASE+target);await page.wait_for_function('window.backSamples.length>=12')
    samples=await page.evaluate('window.backSamples');assert all(s['url']==target and s['opacity']==1 and s['transform'] in ['none','matrix(1, 0, 0, 1, 0, 0)'] for s in samples),samples
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    results.append({'width':width,'motion':motion,'target':target,'frames':len(samples),'minimumOpacity':min(s['opacity'] for s in samples)})
   await services()
   await stable(lambda:page.locator('.context-back').evaluate('a=>{a.click();window.sampleFrames()}'),'/resort/')
   # Returning from a service uses the existing browser history entry.
   await services();await page.frame_locator('#services-frame').locator('a[href="/services/cinema/"]').click();await page.wait_for_url(BASE+'/services/cinema/')
   await stable(lambda:page.locator('.context-back').click(),'/services/');await page.frame_locator('#services-frame').locator('.svcs-card').first.wait_for()
   # Bottom tabs replace the section entry: browser Back returns to destinations.
   await stable(lambda:page.evaluate('history.back()'),'/')
   assert not errors,errors
   await page.close()
  await b.close()
 out={'checks':results,'errors':[]};(R/'site/audits/back-navigation-v56.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
asyncio.run(main())

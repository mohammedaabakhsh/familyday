"""Check every resort cabin control, arrow, hotspot and unchanged source facts."""
import asyncio,hashlib,json,re,sys,subprocess
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8116'
NAMES=['dome','pyramid','classic','greek','palm','bohemian','french','rustic','royal','panoramic']
CASES=[(n,'') for n in NAMES]+[('dome','?cabin=12'),('greek','?cabin=13')]
PLANS={'dome':[['living','kitchen'],['bathroom','tub'],['bedroom']],'pyramid':[['bedroom','living'],['tub','kitchen'],['bathroom']],'classic':[['bedroom','living'],['bathroom','kitchen']],'greek':[['twin','bedroom'],['living','kitchen'],['bathroom']],'palm':[['twin','bedroom'],['kitchen','living'],['bathroom']],'bohemian':[['bedroom','twin'],['living','kitchen'],['bathroom']],'french':[['bedroom','twin'],['living','kitchen'],['bathroom']],'rustic':[['bedroom','twin'],['living','kitchen'],['bathroom']],'royal':[['bedroom','twin'],['living','kitchen'],['bathroom']],'panoramic':[['bedroom','twin'],['living','bathroom'],['kitchen','tub']]}
POINTS={}
for n in NAMES:
 path='site/visuals/assets/'+n+'-tour.js';data=(R/path).read_bytes();expected=subprocess.check_output(['git','show','pre-cabin-order-20261125:'+path])
 if n=='dome':expected=expected.replace("ar:'حمام'".encode(),"ar:'الحمام'".encode()) # Approved v69 label only.
 assert data==expected,path
 POINTS[n]={i:(float(x),float(y)) for i,x,y in re.findall(r"\{id:'([^']+)', ar:'[^']*', x:([.\d]+), y:([.\d]+)",data.decode()) if i!='dining'}
FACTS='site/visuals/assets/resort-data.js'
expected=subprocess.check_output(['git','show','pre-cabin-order-20261125:'+FACTS]).decode()
expected=expected.replace('''var digits='<bdi dir="ltr">'+number+'</bdi>';
    return unit ? '<span class="fd-measurement" style="white-space:nowrap">'+digits+unit+'</span>' : digits;''','''return '<bdi class="fd-measurement" dir="ltr" style="display:inline-block;white-space:nowrap">'+number+(unit||'')+'</bdi>';''')
assert (R/FACTS).read_text()==expected # No factual dimension or hotspot changes.
MEASURE='''(body,{id,x,y})=>{
 const root=document.querySelector('.dt-tour'),stage=root.querySelector('.dt-stage'),image=root.querySelector('.dt-image'),path=root.querySelector('[data-line="'+id+'"]'),box=stage.getBoundingClientRect(),im=image.getBoundingClientRect();
 const buttons=[...root.querySelectorAll('.dt-label')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.part,x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height}});
 const length=path.getTotalLength(),end=path.getPointAtLength(length),hits=[],outside=[];
 for(let i=1;i<=240;i++){
  const p=path.getPointAtLength(length*i/240);
  if(p.x<-.5||p.x>box.width+.5||p.y<-.5||p.y>box.height+.5)outside.push([p.x,p.y]);
  for(const b of buttons)if(b.id!==id&&p.x>b.x+1&&p.x<b.x+b.w-1&&p.y>b.y+1&&p.y<b.y+b.h-1){hits.push(b.id);break;}
 }
 const expected={x:im.left-box.left+im.width*x,y:im.top-box.top+im.height*y};
 const visible=[...root.querySelectorAll('.dt-lines path')].filter(e=>Number(getComputedStyle(e).opacity)>.01).map(e=>e.dataset.line);
 return {id,hits:[...new Set(hits)],outside:outside.slice(0,2),error:Math.hypot(end.x-expected.x,end.y-expected.y),visible,exit:root.querySelector('.dt-label[data-part="'+id+'"]').dataset.arrowExit,bodyOverflow:document.documentElement.scrollWidth>innerWidth+1};
}'''
async def main():
 out={'version':'20261125-live-v69','sourceFactsUnchanged':True,'cases':[],'errors':[],'badResponses':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height in [(320,844),(390,844),(430,932),(768,1024),(1024,900),(1440,900)]:
   context=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');page=await context.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.on('response',lambda r:out['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
   for name,query in CASES:
    await page.goto(BASE+'/'+name+'-tour/'+query);frame=page.frame_locator('#tour-frame');await frame.locator('.dt-label').first.wait_for();await frame.locator('.dt-image').evaluate('async e=>{e.loading="eager";await e.decode()}');await frame.locator('body').evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    fw=await frame.locator('body').evaluate('()=>innerWidth');buttons=frame.locator('.dt-label')
    assert await buttons.count()==len(POINTS[name]),(name,'missing controls')
    if fw<900:
     for row,ids in enumerate(PLANS[name],1):
      for col,key in enumerate(ids,1):
       button=frame.locator('.dt-label[data-part="'+key+'"]');assert await button.evaluate('(e)=>e.style.getPropertyValue("--tour-row")')==str(row),(name,key,'row')
       assert await button.evaluate('(e)=>e.style.getPropertyValue("--tour-column")')==str(col),(name,key,'column')
     if 'twin' in POINTS[name]:assert await frame.locator('.dt-label[data-part="bedroom"]').evaluate('e=>e.style.getPropertyValue("--tour-row")')=='1' and await frame.locator('.dt-label[data-part="twin"]').evaluate('e=>e.style.getPropertyValue("--tour-row")')=='1'
    checks=[]
    for key,(x,y) in POINTS[name].items():
     await frame.locator('.dt-label[data-part="'+key+'"]').click(force=True);await frame.locator('body').evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
     m=await frame.locator('body').evaluate(MEASURE,{'id':key,'x':x,'y':y});checks.append(m)
     assert m['error']<.8,(name,width,key,'hotspot moved',m)
     assert not m['hits'] and not m['outside'],(name,width,key,'arrow collision',m)
     assert m['visible']==[key],(name,width,key,'crossing visible lines',m)
     assert not m['bodyOverflow'],(name,width,key,'overflow')
     assert await frame.locator('.dt-label[aria-pressed="true"]').get_attribute('data-part')==key
     assert (await frame.locator('.dt-selected-title').inner_text()).strip()==(await frame.locator('.dt-label[data-part="'+key+'"]').inner_text()).strip()
     if fw<900 and name=='pyramid' and key=='kitchen':assert m['exit']=='bottom',m
    case={'tour':name,'query':query,'width':width,'height':height,'controls':len(checks),'checks':checks};out['cases'].append(case)
    if width in [390,1440]:
     await frame.locator('.dt-label[data-part="living"]').click(force=True);await page.screenshot(path=f'/tmp/tours-v66/{name}-{query.replace("?","").replace("=","-") or "main"}-{width}.png',full_page=True)
    print(name,query,width,'PASS',flush=True)
   await context.close()
  await browser.close()
 assert not out['errors'] and not out['badResponses'],out
 (R/'site/audits/cabin-tour-order-v69.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'cases':len(out['cases']),'controls':sum(c['controls'] for c in out['cases']),'errors':out['errors'],'badResponses':out['badResponses']}))
asyncio.run(main())

"""Measure the common heading, navigation and detail styles across all three venues."""
import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];B=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
async def main():
 out={'headings':[],'detailComponents':[],'errors':[]};paths={v:{'home':'/'+v+'/','contact':'/'+v+'/contact/','faq':'/'+v+'/faq/','services':'/services/' if v=='resort' else '/'+v+'/services/','detail':'/cabins/classic/' if v=='resort' else '/chalet/details/' if v=='chalet' else '/stay/ground-floor/'} for v in ['resort','chalet','stay']}
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=await b.new_page(reduced_motion='reduce');page.on('pageerror',lambda e:out['errors'].append(str(e)))
  for w,h in [(320,568),(390,844),(430,932),(768,1024),(1440,900)]:
   await page.set_viewport_size({'width':w,'height':h});peer={}
   for v,pages in paths.items():
    for kind,path in pages.items():
     await page.goto(B+path);await page.locator('#main h1').wait_for(state='attached');await page.evaluate('document.fonts.ready')
     title=await page.locator('#main h1').evaluate('e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {text:e.textContent.trim(),size:parseFloat(s.fontSize),weight:s.fontWeight,lineHeight:parseFloat(s.lineHeight),font:s.fontFamily,color:s.color,top:r.top,right:r.right}}')
     expected=(26 if w>=1000 else 21 if h<=740 else 22) if kind=='home' else 22 if w>=1000 else 20
     assert title['size']==expected and title['weight']=='800' and title['font']=='Tajawal, Arial, sans-serif' and title['color']=='rgb(241, 247, 248)',(w,v,kind,title)
     if kind in ['services','contact','faq']:
      assert title['top']==76,(w,v,kind,title)
      if w<600:assert title['right']==w-(15 if w<=360 else 20),(w,v,kind,title)
     widths=await page.locator('#bottom-nav a').evaluate_all('es=>es.map(e=>e.getBoundingClientRect().width)');assert len(widths)==5 and max(widths)-min(widths)<1,(v,widths)
     nav=await page.locator('#bottom-nav .nav-label').evaluate_all('es=>es.map(e=>({size:parseFloat(getComputedStyle(e).fontSize),text:e.textContent.trim()}))');assert {n['size'] for n in nav}=={10 if w<=360 else 11},(w,v,nav)
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     out['headings'].append({'width':w,'height':h,'venue':v,'kind':kind,'path':path,**title})
     if kind=='detail':
      await page.locator('.spec').first.evaluate('e=>e.open=true')
      metrics=await page.evaluate('''()=>{const selectors=['.fact-box small','.fact-box strong','.spec summary','.spec-item','.explore-link'];return Object.fromEntries(selectors.map(key=>{const e=document.querySelector(key),s=e&&getComputedStyle(e);return [key,s?{size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,font:s.fontFamily}:null]}))}''')
      peer[v]=metrics;out['detailComponents'].append({'width':w,'venue':v,'metrics':metrics})
   shared=[key for key in peer['resort'] if all(peer[v][key] is not None for v in peer)]
   for key in shared:assert peer['resort'][key]==peer['chalet'][key]==peer['stay'][key],(w,key,peer)
  await b.close()
 assert not out['errors'],out['errors'];version=json.loads((R/'site/routes.json').read_text())['version'].rsplit('-',1)[-1];(R/'site/audits'/('shared-format-'+version+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'headingChecks':len(out['headings']),'detailComponentGroups':len(out['detailComponents']),'errors':out['errors']}))
asyncio.run(main())

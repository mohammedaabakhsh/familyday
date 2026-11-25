"""Verify canonical URLs, preview redirects, content, sharing and protected order portals.
All outgoing messages are intercepted; no booking or message is submitted.
"""
import asyncio,json,re,sys,hashlib
from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];S=R/'site';BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
class Head(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content')
  if tag in ['img','source'] and a.get('src'):self.images.append(a)
  if tag=='link' and a.get('rel') in ['icon','image_src'] and a.get('href'):self.images.append(a)
def clean(value,copy):
 s=str(value or '').translate(str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789'))
 for a,b in copy['roomWording']:s=s.replace(a,b)
 return re.sub(r'[\s\W_]+','',s)
async def main():
 routes=json.loads((S/'routes.json').read_text());catalog=json.loads((S/'catalog.json').read_text());copy=json.loads((S/'guide-copy.json').read_text());shared=json.loads((R/'data/services.json').read_text());out={'routes':[],'previewAliases':[],'legacyHashes':[],'units':[],'viewports':[],'errors':[],'badResponses':[],'badLinks':[]}
 assert shared['guest']==catalog['source']['guestCatalog']
 manifest=json.loads((S/'cleanup-manifest.json').read_text())
 for item in manifest['removed']:assert not (R/item['path']).exists(),item['path']
 for path,digest in manifest['protectedFiles'].items():assert hashlib.sha256((R/path).read_bytes()).hexdigest()==digest,path
 out['cleanupVerified']={'removedFiles':manifest['removedFileCount'],'removedBytes':manifest['removedBytes'],'protectedFiles':len(manifest['protectedFiles'])}
 originals=json.loads((R/'share-pages.json').read_text())+json.loads((R/'share-extras.json').read_text())
 for item in originals:
  h=Head();h.feed((R/item['path'].lstrip('/')/'index.html').read_text());assert h.meta['og:title']==item['title'] and h.meta['og:description']==item['description'],item['path'];assert h.meta['og:url']=='https://familydaystay.com'+item['path'];assert not h.images,item['path'];assert not any(k and k.startswith(('og:image','twitter:image')) for k in h.meta),item['path']
 structured=json.loads((S/'structured-data.json').read_text())
 for path,refs in structured['routes'].items():
  page=(R/path.lstrip('/')/'index.html').read_text()
  actual=[json.loads(text) for text in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',page,re.S)]
  assert actual==[structured['schemas'][key]['data'] for key in refs],path
 out['structuredMetadataRoutes']=len(structured['routes'])
 out['originalMetadataRoutes']=len(originals)
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=await b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce',ignore_https_errors=True);page.on('pageerror',lambda e:out['errors'].append({'page':page.url,'error':str(e)}));page.on('response',lambda r:out['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
  await page.add_init_script("window.__shares=[];Object.defineProperty(navigator,'share',{configurable:true,value:async v=>window.__shares.push(v)});window.open=url=>{window.__outgoing=url;return null};")
  async def visit(path):
   await page.goto(BASE+path)
   if '/services-guide/' in page.url:await page.locator('#guide-content.is-ready').wait_for(state='attached')
   elif '/guest-services/' in page.url:await page.locator('#games-card:not([disabled])').wait_for()
   else:await page.locator('#main h1').wait_for(state='attached')
  for path in routes['routes']:
   await visit(path);assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),path
   if path in routes['nativeRoutes']:
    if path!='/':
     await page.locator('.header [data-share]').click();payload=await page.evaluate('window.__shares.at(-1)');assert set(payload)=={'text'},(path,payload);assert '/preview/' not in payload['text'] and '/site/' not in payload['text'] and 'share=text-v50' not in payload['text'],payload
    if await page.locator('#tour-frame').count():await page.frame_locator('#tour-frame').locator('button').first.wait_for(state='attached')
   for frame in page.frames:
    for href in await frame.locator('a[href]').evaluate_all('es=>es.map(e=>e.href)'):
     url=urlparse(href)
     if url.netloc!=urlparse(BASE).netloc:continue
     file=R/url.path.lstrip('/');file=file/'index.html' if url.path.endswith('/') else file
     if not file.exists():out['badLinks'].append({'from':path,'href':href})
   out['routes'].append({'path':path,'finalPath':urlparse(page.url).path})
  print('canonical routes verified',len(out['routes']),flush=True)
  for path in routes['routes']:
   await page.goto(BASE+'/preview'+path+'?campaign=cutover#retained')
   expected='/services-guide/' if path=='/arrangements/' else routes['redirectRoutes'].get(path,path)
   await page.wait_for_url(lambda u:u.pathname==expected if hasattr(u,'pathname') else urlparse(str(u)).path==expected)
   assert 'campaign=cutover' in page.url and '#retained' in page.url,(path,page.url);out['previewAliases'].append(path)
  for key,target in json.loads((S/'runtime-config.json').read_text())['legacyRoutes'].items():
   await page.goto(BASE+'/#'+key);await page.wait_for_url(BASE+target);out['legacyHashes'].append({'hash':key,'target':target})
  print('preview aliases and legacy hashes verified',flush=True)
  for unit in catalog['units']:
   await visit(unit['path']);assert await page.locator('.thumbnails img').evaluate_all('es=>es.map(e=>e.getAttribute("src"))')==unit['images'];await page.locator('details').evaluate_all('es=>es.forEach(e=>e.open=true)');body=clean(await page.locator('#main').inner_text(),copy)
   values=[v for section in unit['sections'] for v in [section['title'],*section['items'],*section['notes'],*[t['value'] for t in section['times']]]]+[v for e in unit['extras'] for v in [e['title'],e['text']]]+unit['gardenFeatures']
   for value in values:assert clean(value,copy) in body,(unit['id'],value)
   out['units'].append({'id':unit['id'],'photos':len(unit['images']),'facts':len(values)})
  for venue in ['resort','chalet','stay']:
   await visit('/'+venue+'/contact/');expected=catalog['source']['resortContact'] if venue=='resort' else copy['venueContacts'][venue]
   links=await page.locator('#main a').evaluate_all('es=>es.map(e=>e.getAttribute("href"))')
   for link in [*expected.values(),catalog['venues'][venue]['map'],*catalog['venues'][venue]['social']]:assert link in links,(venue,link)
   await visit('/'+venue+'/faq/');assert await page.locator('.faq').count()==sum(len(g['items']) for g in copy['faqs'][venue]['groups'])
  # The directory is native; its approved links open service guides without another document.
  await visit('/services/');f=page.locator('#resort-service-directory');assert await page.locator('#services-frame').count()==0;await f.locator('a[href="/services/cinema/"]').click();await page.wait_for_url(BASE+'/services/cinema/');assert await page.locator('.service-guide').count()==1
  await page.locator('.context-back').click();await page.wait_for_url(BASE+'/services/');await page.locator('#resort-service-directory a[href="/services/dining-tables/"]').click();await page.wait_for_url(BASE+'/services/dining-tables/')
  # Resort selection stays on the guide and reuses the original order document.
  await page.locator('[data-service-portal]').click();await page.locator('#native-order-dialog').wait_for();await page.locator('.native-order-loading').wait_for(state='hidden')
  assert page.url==BASE+'/services/dining-tables/' and await page.locator('#main').count()==1
  await page.frame_locator('.native-order-frame').locator('.fd-dining-option').first.wait_for()
  await page.locator('.native-order-close').click();await page.locator('#native-order-dialog').wait_for(state='hidden');out['nativeOrderReusesOriginalPortal']=True
  # Distributed standalone links still work as full document entries.
  await page.goto(BASE+'/services-guide/#dining');await page.locator('#guide-content.is-ready').wait_for(state='attached')
  assert not await page.locator('#main').count();out['standaloneOrderEntryPreserved']=True
  for w,h in [(320,568),(1440,900)]:
   await page.set_viewport_size({'width':w,'height':h})
   for path in ['/', '/resort/','/cabins/','/resort/contact/','/resort-map/','/chalet/','/chalet/details/','/chalet-map/','/stay/','/stay/sections/','/stay/compare/','/stay/services/','/stay/contact/']:
    await visit(path);assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(path,w)
    if path!='/' and not await page.locator('body.focused-view').count():
     widths=await page.locator('#bottom-nav a').evaluate_all('es=>es.map(e=>e.getBoundingClientRect().width)');assert len(widths)==5 and max(widths)-min(widths)<1
    out['viewports'].append({'path':path,'width':w})
  # Older preview queries must survive the redirect and still select the correct unit/package.
  await page.goto(BASE+'/preview/dome-tour/?cabin=12&from=details');await page.wait_for_url(BASE+'/dome-tour/?cabin=12&from=details');await page.locator('#main h1').wait_for();await page.frame_locator('#tour-frame').locator('.dt-image').wait_for(state='attached');assert '/dome-tour-16-' in await page.frame_locator('#tour-frame').locator('.dt-image').get_attribute('src')
  await page.goto(BASE+'/preview/services/coordination/?package=resort');await page.wait_for_url(BASE+'/services/coordination/?package=resort');await page.locator('.package[open]').wait_for();out['semanticQueryPreserved']=True
  await b.close()
 assert not out['errors'] and not out['badResponses'] and not out['badLinks'],out
 (S/'audits'/('live-cutover-'+routes['version'].rsplit('-',1)[-1]+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'routes':len(out['routes']),'aliases':len(out['previewAliases']),'hashes':len(out['legacyHashes']),'photos':sum(u['photos'] for u in out['units']),'errors':out['errors']}))
asyncio.run(main())

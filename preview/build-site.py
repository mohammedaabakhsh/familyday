"""Build removable preview routes and snapshot the existing illustrated tours.
Only preview/ is written. Original public routes, sources, photos and fonts stay intact.
"""
from pathlib import Path
import json,re,hashlib,html
from urllib.parse import urlparse,urljoin
ROOT=Path(__file__).resolve().parents[1];PREVIEW=ROOT/'preview'
data=json.loads((PREVIEW/'catalog.json').read_text())
TEMPLATE=(PREVIEW/'index.html').read_text()
TEMPLATE=re.sub(r'<link rel="canonical"[^>]*>','',TEMPLATE)
TEMPLATE=re.sub(r'<meta property="og:(?:url|image)"[^>]*>','',TEMPLATE)
TEMPLATE=re.sub(r'<link rel="stylesheet" href="\./style.css\?[^\"]+">','<link rel="stylesheet" href="/preview/style.css?v=20261123-complete-v3">',TEMPLATE)
TEMPLATE=re.sub(r'<script type="module" src="\./app.js\?[^\"]+"></script>','<script type="module" src="/preview/app.js?v=20261123-complete-v3"></script>',TEMPLATE)
TEMPLATE=TEMPLATE.replace('href="#destinations"','href="/preview/"')
TEMPLATE=TEMPLATE.replace('<meta property="og:description" content="تصوّر مستقل لواجهة يوم العائلة">','<meta property="og:description" content="اكتشف وجهات يوم العائلة وخدماتها">')
(PREVIEW/'index.html').write_text(TEMPLATE)
sharepages=json.loads((ROOT/'share-pages.json').read_text());extras=json.loads((ROOT/'share-extras.json').read_text())
paths={p['path'] for p in sharepages}
paths.update(p['path'] for p in json.loads((ROOT/'share-extras.json').read_text()))
paths.update(['/cabins/','/resort-map/','/chalet-map/','/guest-services/','/chalet/guest-services/','/services-guide/','/arrangements/','/resort/compare/','/stay/compare/','/stay/services/'])
for v in ['resort','stay','chalet']:
 paths.update([f'/{v}/order/',f'/{v}/checkout/'])
manifest=[]
for path in sorted(paths):
 if not path.endswith('/'):continue
 dest=PREVIEW/path.lstrip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True)
 info=next((p for p in sharepages+extras if p['path']==path),{});unit=next((u for u in data['units'] if u['path']==path),None)
 title=info.get('title',unit['name'] if unit else 'يوم العائلة | معاينة');description=info.get('description',unit['short'] if unit else 'اكتشف وجهات يوم العائلة وخدماتها')
 page=re.sub(r'<title>[^<]*</title>','<title>'+title+'</title>',TEMPLATE)
 page=re.sub(r'<meta property="og:title"[^>]*>','<meta property="og:title" content="'+html.escape(title,quote=True)+'">',page)
 page=re.sub(r'<meta property="og:description"[^>]*>','<meta property="og:description" content="'+html.escape(description,quote=True)+'">',page)
 page=page.replace('</head>','<meta property="og:url" content="https://familydaystay.com/preview'+path+'">'+('<meta property="og:image" content="https://familydaystay.com'+unit['images'][0]+'">' if unit else '')+'</head>')
 page=page.replace('</head>','<link rel="canonical" href="https://familydaystay.com/preview'+path+'">\n</head>')
 dest.write_text(page);manifest.append('/preview'+path)
assets=PREVIEW/'visuals/assets';assets.mkdir(parents=True,exist_ok=True);copied=set()
def copyasset(path):
 path=path.lstrip('/').split('?')[0]
 if path in copied:return '/preview/visuals/assets/'+path
 copied.add(path);src=ROOT/path;dst=assets/path;dst.parent.mkdir(parents=True,exist_ok=True)
 text=src.read_text()
 if path=='chalet-map.js':text=text.replace("'imgs/chalet-tour-clarity-v1.png'","'/imgs/chalet-tour-clarity-v1.png'")
 if path.endswith('.css'):
  def rewriteurl(m):
   val=m.group(1).strip(' \'"')
   if val.startswith(('data:','http','#','/')):return m.group(0)
   return 'url('+urljoin('/'+path,val)+')'
  text=re.sub(r'url\(([^)]+)\)',rewriteurl,text)
 if path.endswith('exploration-share.js'):
  a=text.index('  function url(kind)');b=text.index('  async function copy',a)
  text=text[:a]+'''  function url(kind){ return new URL('/preview/'+(kind==='chalet'?'chalet-map/':location.pathname.split('/visuals/')[1])+location.search.replace(/([?&])from=[^&]*/g,'$1').replace(/[?&]$/,''),location.origin).href; }\n'''+text[b:]
 dst.write_text(text)
 return '/preview/visuals/assets/'+path
for name in ['dome','pyramid','classic','greek','palm','bohemian','french','rustic','royal','panoramic']:
 src=ROOT/(name+'-tour/index.html');html=src.read_text()
 html=re.sub(r'(<(?:script|link)\b[^>]*?\b(?:src|href)=")(/[^\"]+\.(?:js|css)(?:\?[^\"]*)?)(")',lambda m:m[1]+copyasset(m[2])+m[3],html)
 html=re.sub(r'<link rel="canonical"[^>]*>','',html)
 html=html.replace('content="https://familydaystay.com/'+name+'-tour/"','content="https://familydaystay.com/preview/'+name+'-tour/"')
 html=re.sub(r'<meta name="robots"[^>]*>','',html)
 html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/preview/visuals/frame.css"></head>')
 html=html.replace('</body>','<script src="/preview/visuals/bridge.js"></script></body>')
 out=PREVIEW/'visuals'/(name+'-tour')/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(html)
# The chalet's original illustration is a dialog module; use it in a dedicated
# preview document rather than its original redirect-to-home entry.
chaletdata=assets/'chalet-preview-data.js';chaletdata.write_text('var PRIVATE_CHALET='+json.dumps(data['source']['chalet'],ensure_ascii=False)+';')
chaletassets=['resort-data.js','tour-common.js','js/exploration-share.js','chalet-map.js']
chaletcss=['css/tajawal.css','chalet-map.css','css/exploration-share.css','css/image-feedback.css']
chalethtml='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>استكشف الشاليه من الداخل</title>'+''.join('<link rel="stylesheet" href="'+copyasset(p)+'">' for p in chaletcss)+'<link rel="stylesheet" href="/preview/visuals/frame.css"></head><body><script src="/preview/visuals/assets/chalet-preview-data.js"></script>'+''.join('<script src="'+copyasset(p)+'"></script>' for p in chaletassets)+'<script>FD_CHALET_MAP.show();document.addEventListener("fd-chalet-map-dismiss",()=>parent.postMessage({type:"familyday-preview-navigate",path:"/chalet/details/"},location.origin));</script><script src="/preview/visuals/bridge.js"></script></body></html>'
out=PREVIEW/'visuals/chalet-map/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(chalethtml)
(PREVIEW/'guest-services.html').write_text(TEMPLATE.replace('</head>','<meta http-equiv="refresh" content="0;url=/preview/guest-services/"></head>'))
(PREVIEW/'routes.json').write_text(json.dumps({'version':'20261123-complete-v3','routes':manifest,'unitCount':len(data['units']),'sources':[{'path':'/'+p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()} for p in sorted(copied)]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'entryRoutes':len(manifest),'visualDocuments':11,'visualAssets':len(copied)}))

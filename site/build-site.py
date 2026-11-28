"""Build the canonical guide at its original URLs, plus temporary preview redirects.
Visual modules are maintained under site/visuals; this builder never reads the old home page.
"""
from pathlib import Path
import html,json,re
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
CONFIG=json.loads((SITE/'cutover-config.json').read_text())
VERSION=CONFIG['version']
app=SITE/'app.js'
app.write_text(re.sub(r"VERSION\s*=\s*'[^']+'","VERSION = '"+VERSION+"'",app.read_text(),count=1))
# Refresh only static native ES-module imports when releasing a new asset version.
for module in [app,*sorted((SITE/'venues').glob('*.js')),*sorted((SITE/'shared').glob('*.js'))]:
 text=module.read_text()
 text=re.sub(r"((?:\.\.?/)[^'\"]+\.js\?v=)[^'\"]+",lambda m:m[1]+VERSION,text)
 module.write_text(text)
PORTALS=set(CONFIG['protectedPortals'])
REDIRECTS={p:('/chalet/services/' if p.startswith('/chalet/') else '/stay/services/' if p.startswith('/stay/') else '/services/') for p in CONFIG['rootRoutes'] if p.endswith(('/order/','/checkout/'))}
REDIRECTS.update(CONFIG.get('retiredServiceItemRoutes',{}))
CATALOG=json.loads((SITE/'catalog.json').read_text())
# data/services.json is authoritative for service prices/content on both ordering and guide surfaces.
SERVICES=json.loads((ROOT/'data/services.json').read_text())
CATALOG['source']['guestCatalog']=SERVICES['guest']
for service in CATALOG['services']:
 key=service['id']
 if key in SERVICES['arrangements']:
  data=SERVICES['arrangements'][key]
  service.update({k:data[k] for k in list(service) if k in data})
 elif key=='menu':service['menu']=SERVICES['guest']['menu']
 elif key in ['games','water','cinema','hospitality']:
  data=SERVICES['guest'][key]
  if key=='games':
   service['items']=data['contents']
   for package,name in zip(service['packages'],['box','table']):
    source=data['packages'][name];package.update(name=source['name'],note=source['description']);package['price']=re.sub(r'\d+(?:\.\d+)?',str(source['price']),package['price'],count=1)
  elif key=='water':service['notes']=data['notes'];service['offer']='باقة '+str(data['size'])+' ألعاب بـ'+str(data['price'])+' ريال'
  elif key=='cinema':
   service['items']=data['contents'];service['stats'][0]['value']=data['duration'];service['stats'][1]['value']=str(data['price'])+' ريال'
  else:
   for package,source in zip(service['packages'],data['packages']):
    package.update(name=source['name'],description=source['description'],items=source['contents'],note=source['note']);package['price']=re.sub(r'\d+(?:\.\d+)?',str(source['price']),package['price'],count=1)
(SITE/'catalog.json').write_text(json.dumps(CATALOG,ensure_ascii=False,indent=2)+'\n')
COPY=json.loads((SITE/'guide-copy.json').read_text())
COPY['stayService']=SERVICES['stay']['slide']
(SITE/'guide-copy.json').write_text(json.dumps(COPY,ensure_ascii=False,indent=2)+'\n')

# A generated index of existing public service links and photo references; no second price catalogue.
RUNTIME=json.loads((SITE/'runtime-config.json').read_text())
order_links={}
for service in CATALOG['services']:
 if service['id'] not in ['menu','water','games','cinema','hospitality','coordination','dining','seating','extras']:continue
 key='restaurant' if service['id']=='menu' else service['id']
 data=SERVICES['guest'].get(key,{})
 image=service.get('image')
 copy=COPY.get('serviceCopy',{}).get(service['id'],{})
 order_links[key]={'path':service['path'],'title':service['name'],'intro':copy.get('pageIntro',data.get('intro',service.get('intro','')))}
 if copy.get('cardIntro'):order_links[key]['cardIntro']=copy['cardIntro']
 for field in ['advanceNote','help','orderLabel','orderHint','shareDescription']:
  if copy.get(field):order_links[key][field]=copy[field]
 if image:
  raw=image.split('?')[0]
  order_links[key].update(image=RUNTIME.get('serviceImages',{}).get(raw,image),originalImage=image,size=COPY.get('serviceImageSizes',{}).get(raw))
for key,path in CONFIG.get('portalShareSections',{}).items():
 assert path=='/services-guide/'+key+'/' and key in order_links
 order_links[key]['portalSharePath']=path
for key,path in CONFIG.get('guestPortalShareSections',{}).items():
 assert path=='/guest-services/'+key+'/' and key in order_links
 order_links[key]['portalSharePath']=path
chalet_links={}
for key,path in CONFIG.get('chaletPortalShareSections',{}).items():
 assert key in ['water','games'] and path=='/chalet/guest-services/'+key+'/'
 chalet_links[key]={**order_links[key],'path':'/chalet/services/'+('water-games' if key=='water' else 'games')+'/','portalSharePath':path,**COPY['chaletServiceCopy'][key]}
(SITE/'orders/service-links.json').write_text(json.dumps({'services':order_links,'chaletServices':chalet_links},ensure_ascii=False,indent=2)+'\n')

SHARES=json.loads((SITE/'share-metadata.json').read_text())
STRUCTURED=json.loads((SITE/'structured-data.json').read_text())
for venue,faq in COPY['faqs'].items():
 questions=[q for g in faq['groups'] for i in g['items'] for q in i['sources']]
 assert sorted(questions)==sorted(q['question'] for q in CATALOG['venues'][venue]['faqs']),venue+' FAQ coverage'

def metadata(page,path,info,redirect=False):
 def remove(match):
  tag=match[0];m=re.search(r'(?:name|property)=["\']([^"\']+)',tag,re.I);key=m[1].lower() if m else ''
  return '' if key.startswith(('og:','twitter:')) or key in ['description','robots'] else tag
 page=re.sub(r'<meta\b[^>]*>\n?',remove,page,flags=re.I)
 page=re.sub(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>\n?','',page,flags=re.I)
 page=re.sub(r'<title>.*?</title>','<title>'+html.escape(info['title'])+'</title>',page,flags=re.S)
 url='https://familydaystay.com'+path
 values=[('name','description',info['description']),('property','og:type','website'),('property','og:site_name','يوم العائلة'),('property','og:locale','ar_SA'),('property','og:title',info['title']),('property','og:description',info['description']),('property','og:url',url),('name','twitter:card','summary'),('name','twitter:title',info['title']),('name','twitter:description',info['description']),('name','robots',('noindex,nofollow,noarchive' if redirect else 'index,follow')+',max-image-preview:none')]
 tags='\n'.join('<meta '+attr+'="'+key+'" content="'+html.escape(value,quote=True)+'">' for attr,key,value in values)+'\n<link rel="canonical" href="'+url+'">\n'
 if not redirect:
  for key in STRUCTURED['routes'].get(path,[]):
   schema=STRUCTURED['schemas'][key]
   content=json.dumps(schema['data'],ensure_ascii=False).replace('<','\\u003c')
   tags+='<script type="application/ld+json"'+(' id="'+html.escape(schema['id'],quote=True)+'"' if schema['id'] else '')+'>'+content+'</script>\n'
 return page.replace('</head>',tags+'</head>')

def redirect_page(target):
 assert target.startswith('/') and not target.startswith('//')
 literal=json.dumps(target,ensure_ascii=False)
 page='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>يوم العائلة</title><meta http-equiv="refresh" content="0;url='+html.escape(target,quote=True)+'"><script>const destination=new URL('+literal+',location.origin);destination.search=location.search;destination.hash=location.hash;location.replace(destination.href);</script></head><body><a href="'+html.escape(target,quote=True)+'">فتح الصفحة</a></body></html>'
 info=SHARES.get(target,SHARES['/'])
 return metadata(page,target,info,True)

def write(path,page):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(page)

template=(SITE/'template.html').read_text()
template=re.sub(r'(/site/[^"?]+\.(?:js|css)[?]v=)[^\"]+',lambda m:m[1]+VERSION,template)
template=re.sub(r'(/css/specification-measurements\.css[?]v=)[^\"]+',lambda m:m[1]+VERSION,template)
# Start the existing code and JSON downloads together. No photo strategy or quality changes.
boot_modules=['/js/specification-measurements.js','/site/venues/resort.js','/site/venues/stay.js','/site/venues/chalet.js','/site/shared/views.js','/js/order-visit.js','/site/orders/native-orders.js','/site/orders/restaurant-inline.js','/js/guest-order-message.js']
boot_data=['/site/catalog.json','/site/share-metadata.json','/site/guide-copy.json','/site/runtime-config.json']
preloads='\n'.join('<link rel="modulepreload" href="'+path+'?v='+VERSION+'">' for path in boot_modules)
preloads+='\n'+'\n'.join('<link rel="preload" as="fetch" crossorigin href="'+path+'?v='+VERSION+'">' for path in boot_data)
template=template.replace('</head>',preloads+'\n</head>')
native=[]
for path in CONFIG['rootRoutes']:
 if path in PORTALS:continue
 if path in REDIRECTS:
  write(ROOT/path.lstrip('/')/'index.html',redirect_page(REDIRECTS[path]));continue
 page=template
 page=re.sub(r'<body[^>]*>','<body class="'+('destination-flow' if path=='/' else 'complete-flow')+'">',page)
 write(ROOT/path.lstrip('/')/'index.html',metadata(page,path,SHARES[path]));native.append(path)
# Previously shared preview URLs are compatibility entries, not a second deployed guide.
for path in CONFIG['rootRoutes']:
 write(ROOT/'preview'/path.lstrip('/')/'index.html',redirect_page(REDIRECTS.get(path,path)))
write(ROOT/'preview/guest-services.html',redirect_page('/guest-services/'))
write(ROOT/'guest-services.html',redirect_page('/guest-services/'))
# A cached old preview shell can load this tiny shim and recover to the same canonical URL.
write(ROOT/'preview/app.js',"const destination=new URL(location.href);destination.pathname=destination.pathname.replace(/^\\/preview(?=\\/|$)/,'')||'/';location.replace(destination.href);\n")
for name in ['style.css','chalet.css','stay.css']:
 write(ROOT/'preview'/name,'@import url("/site/'+name+'?v='+VERSION+'");\n')
# Compatibility for preview visual documents that were occasionally opened directly.
for name in ['dome','pyramid','classic','greek','palm','bohemian','french','rustic','royal','panoramic']:
 write(ROOT/'preview/visuals'/(name+'-tour')/'index.html',redirect_page('/'+name+'-tour/'))
for name in ['resort-map','chalet-map']:
 write(ROOT/'preview/visuals'/name/'index.html',redirect_page('/'+name+'/'))
for name,target in [('directory','/services/'),('index','/services/'),('guest','/guest-services/'),('guide','/arrangements/')]:
 write(ROOT/'preview/visuals/services'/(name+'.html'),redirect_page(target))
# Crawler-readable section previews: no images, icons or stylesheet candidates.
share_sections=[(key,path,'/guest-services/' if key in CONFIG.get('guestPortalShareSections',{}) else '/services-guide/','منتجع يوم العائلة',order_links[key]) for key,path in {**CONFIG.get('portalShareSections',{}),**CONFIG.get('guestPortalShareSections',{})}.items()]
share_sections += [(key,path,'/chalet/guest-services/','شاليه يوم العائلة',chalet_links[key]) for key,path in CONFIG.get('chaletPortalShareSections',{}).items()]
share_sections += [(key,path,'/stay/guest-services/','استراحة يوم العائلة',{'title':SERVICES['stay']['slide']['name'],'intro':SERVICES['stay']['slide']['description']}) for key,path in CONFIG.get('stayPortalShareSections',{}).items()]
for key,path,portal_base,brand,info in share_sections:
 title=html.escape(info['title']+' | '+brand,quote=True);description=html.escape(info.get('shareDescription',info['intro']),quote=True);url='https://familydaystay.com'+path
 page=f'''<!doctype html>
<html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,follow,max-image-preview:none">
<title>{title}</title><meta name="description" content="{description}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:locale" content="ar_SA"><meta property="og:site_name" content="يوم العائلة">
<meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}">
<meta name="familyday:portal-section" content="{key}">
<meta name="familyday:portal-base" content="{portal_base}">
<script src="/services-guide/share-entry.js?v={VERSION}" defer></script>
</head><body><h1>{html.escape(info['title'])}</h1><p>{description}</p><a href="{portal_base}#{key}">فتح {html.escape(info['title'])}</a></body></html>
'''
 write(ROOT/path.lstrip('/')/'index.html',page)
manifest={'version':VERSION,'routes':CONFIG['rootRoutes'],'nativeRoutes':native,'redirectRoutes':REDIRECTS,'protectedPortals':sorted(PORTALS),'portalShareSections':CONFIG.get('portalShareSections',{}),'guestPortalShareSections':CONFIG.get('guestPortalShareSections',{}),'chaletPortalShareSections':CONFIG.get('chaletPortalShareSections',{}),'stayPortalShareSections':CONFIG.get('stayPortalShareSections',{}),'previewRedirectCount':len(CONFIG['rootRoutes']),'unitCount':len(CATALOG['units']),'rollbackTag':CONFIG['rollbackTag']}
(SITE/'routes.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# Same original sitemap destinations, with the additional approved guide pages.
urls=sorted(set(CONFIG['rootRoutes'])-set(REDIRECTS))
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>https://familydaystay.com'+html.escape(p)+'</loc></url>\n' for p in urls)+'</urlset>\n')
print(json.dumps({'nativePages':len(native),'protectedPortals':len(PORTALS),'previewRedirects':len(CONFIG['rootRoutes']),'portalShareEntries':len(share_sections)}))

# Shared measurement assets used by the native guide and independent visual documents.
for visual in (SITE/'visuals').rglob('index.html'):
 text=visual.read_text()
 text=re.sub(r'((?:/js/specification-measurements\.js|/css/specification-measurements\.css|/site/visuals/assets/resort-data\.js|/site/visuals/bridge\.js)\?v=)[^"\s]+',lambda m:m[1]+VERSION,text)
 visual.write_text(text)

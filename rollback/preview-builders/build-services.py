"""Snapshot original resort service markup and behavior; only the preview is written."""
from html.parser import HTMLParser
from pathlib import Path
import re

PANELS=['services-overlay','sinema-detail','hospitality-detail','maiya-detail','jalsat-detail','contest-detail','sharik-detail','order-popup','tarfihi-detail','tawilat-detail','walaa-detail','menu-detail','menu-cart-review','tag-tooltip','fsOverlay']
class SourceParts(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=False);self.text=text;self.stack=[];self.active=[];self.parts={};self.offsets=[0]+[m.end() for m in re.finditer('\n',text)]
 def at(self):line,col=self.getpos();return self.offsets[line-1]+col
 def handle_starttag(self,tag,attrs):
  name=dict(attrs).get('id')
  if name in PANELS:self.active.append((name,len(self.stack),self.at()))
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
 def handle_endtag(self,tag):
  if tag not in self.stack:return
  depth=len(self.stack)-1-self.stack[::-1].index(tag);self.stack=self.stack[:depth]
  for name,d,start in self.active[:]:
   if d>=depth:self.parts[name]=self.text[start:self.text.index('>',self.at())+1];self.active.remove((name,d,start))

def preview_links(text):
 def anchor(match):
  tag=match[0]
  def href(m):
   value=m[1]
   if value=='#contest':value='/preview/contest/'
   elif value.startswith('/') and not value.startswith(('/preview/','/imgs/','/fonts/')):value='/preview'+value
   elif value.startswith('https://familydaystay.com/') and not value.startswith('https://familydaystay.com/preview/'):value=value.replace('https://familydaystay.com/','https://familydaystay.com/preview/',1)
   return 'href="'+value+'"'
  return re.sub(r'href="([^\"]*)"',href,tag)
 return re.sub(r'<a\b[^>]*>',anchor,text)

def build_services(root,preview,copyasset,version):
 source=(root/'index.html').read_text();parser=SourceParts(source);parser.feed(source)
 assert set(PANELS)<=parser.parts.keys()
 # The original services overlay also encloses the cinema panel. Mount each once.
 directory=parser.parts['services-overlay'].replace(parser.parts['sinema-detail'],'')
 directory=re.sub(r'<style\b[^>]*>.*?</style>','',directory,flags=re.S)
 parts=[directory]+[parser.parts[name] for name in PANELS if name!='services-overlay']
 css=['css/tajawal.css','css/app-base.css','resort-ui.css','css/water-games.css','css/service-orders.css','css/service-mobile.css','css/seating-cards.css','css/services-index.css','css/rewards-layout.css','css/dining-cards.css','css/cinema-layout.css','css/games-layout.css','css/water-layout.css','service-sections.css','menu-experience.css','css/image-feedback.css','css/desktop-layout.css']
 scripts=['resort-features.js','service-data.js','js/cabin-numbers.js','js/water-games.js','js/menu-order-message.js','js/service-venue.js','site-enhancements.js','menu-experience.js','services-guide/guide-gallery.js','js/dining-cards.js','js/services.js','js/seating-cart.js','js/service-orders.js','service-sections.js','js/image-feedback.js']
 assets=preview/'visuals/assets';out=preview/'visuals/services';out.mkdir(exist_ok=True)
 # Games functions are the unchanged service-only tail of app-shell, without splash/navigation.
 games=(root/'js/app-shell.js').read_text().split("var _tarfihiOpt = '';",1)[1]
 (assets/'service-games.js').write_text("var _tarfihiOpt = '';"+games)
 styles=''.join('<link rel="stylesheet" href="'+copyasset(path)+'">' for path in css)
 inline=''.join(re.findall(r'<style\b[^>]*>.*?</style>',source,re.S))
 theme='<link rel="stylesheet" href="/preview/services-theme.css?v='+version+'">'
 html='<!doctype html><html lang="ar" dir="rtl"><head><base href="/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,max-image-preview:none"><title>خدمات المنتجع</title>'+styles+inline+theme+'</head><body class="original-service-ui">'+''.join(parts)
 html+='<script src="/preview/visuals/assets/service-games.js?v='+version+'"></script>'
 html+=''.join('<script src="'+copyasset(path)+'"></script>' for path in scripts)
 html+='<script src="/preview/services-bridge.js?v='+version+'"></script></body></html>'
 (out/'index.html').write_text(preview_links(html))
 # Keep the approved directory markup/theme, without mounting unused order panels/scripts.
 directory_styles=''.join('<link rel="stylesheet" href="'+copyasset(path)+'">' for path in ['css/tajawal.css','css/app-base.css','css/services-index.css'])
 directory_html='<!doctype html><html lang="ar" dir="rtl"><head><base href="/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,max-image-preview:none"><title>خدمات المنتجع</title>'+directory_styles+theme+'<style>#services-overlay .svcs-description{color:#b6cbd6!important}</style></head><body class="original-service-ui">'+directory+'<script src="/preview/services-directory.js?v='+version+'"></script></body></html>'
 (out/'directory.html').write_text(preview_links(directory_html))
 # Original independent guest and occasion guides retain their own controls/forms.
 for name,sourcepath in [('guest','guest-services/index.html'),('guide','services-guide/index.html')]:
  text=(root/sourcepath).read_text();base='/'+str(Path(sourcepath).parent)+'/'
  from urllib.parse import urljoin
  def asset_tag(m):
   path=urljoin(base,m[2]);return m[1]+copyasset(path)+m[3]
  text=re.sub(r'(<(?:script|link)\b[^>]*?\b(?:src|href)=")([^\"]+\.(?:js|css)(?:\?[^\"]*)?)(")',asset_tag,text)
  text=text.replace('<head>','<head><base href="/preview/visuals/services/'+name+'.html">')
  text=re.sub(r'<meta name="robots"[^>]*>','<meta name="robots" content="noindex,nofollow,max-image-preview:none">',text)
  text=text.replace('</head>',theme+'</head>').replace('<body>','<body class="original-'+name+'-ui">')
  text=text.replace('</body>','<script src="/preview/services-bridge.js?v='+version+'"></script></body>')
  text=text.replace('href="https://familydaystay.com/','href="https://familydaystay.com/preview/').replace('content="https://familydaystay.com/','content="https://familydaystay.com/preview/')
  (out/(name+'.html')).write_text(preview_links(text))

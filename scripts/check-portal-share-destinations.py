"""Shares reopen their own interface; requests still use the unchanged WhatsApp builder."""
import json,os,sys,subprocess,re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';out={'version':'20261126-live-v103','services':[],'guestServices':[],'errors':[],'messagesSent':False}
sections={'coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
class Preview(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[];self.canonical=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content','')
  if tag in ['img','picture','source'] or tag=='link' and a.get('rel') in ['icon','apple-touch-icon','stylesheet','image_src']:self.images.append(a)
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
portal=lambda key:'/services-guide/'+key+'/'

# The correction must not alter how an order is assembled or who receives it.
for name in ['data/services.json']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show','pre-portal-share-destinations-20261126:'+name]),name
old=subprocess.check_output(['git','show','HEAD:guest-services/guest-services.js']).decode();new=(R/'guest-services/guest-services.js').read_text();start='    var message;';end='\n  function renderOrders';assert re.sub(r'\s+','',old[old.index(start):old.index(end)].replace('save();',''))==re.sub(r'\s+','',new[new.index(start):new.index(end)])
with sync_playwright() as p:
 options={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):options['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**options);c=b.new_context(viewport={'width':390,'height':844},ignore_https_errors=True);c.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})")
 page=c.new_page();receiver=c.new_page()
 for x in [page,receiver]:x.on('pageerror',lambda e:out['errors'].append(str(e)))
 for key,path in sections.items():
  page.goto(BASE+'/services-guide/#'+key);page.locator('#guide-content.is-ready').wait_for(state='attached');assert page.url==BASE+portal(key);page.locator('.topbar [data-share]').click();shared=page.evaluate('shares.at(-1)');assert shared=={'text':BASE+portal(key)}
  # A scraper never receives the URL fragment: verify server HTML without running JavaScript.
  html=c.request.get(BASE+portal(key),headers={'User-Agent':'WhatsApp/2.24'}).text();preview=Preview();preview.feed(html);label={'coordination':'التنسيقات','seating':'الجلسات الخارجية','dining':'طاولات الطعام','cinema':'جلسة السينما'}[key]
  assert preview.meta['og:title']==label+' | منتجع يوم العائلة';assert preview.meta['twitter:title']==preview.meta['og:title'];assert preview.meta['og:url']==preview.canonical=='https://familydaystay.com'+portal(key);assert preview.meta['familyday:portal-section']==key;assert preview.meta['og:description'];assert not preview.images and not any(k and k.startswith(('og:image','twitter:image')) for k in preview.meta);assert 'تنسيقات وجلسات' not in preview.meta['og:title']
  receiver.goto(shared['text']);receiver.locator('#guide-content.is-ready').wait_for(state='attached');expect(receiver.locator('#'+key+'.is-active')).to_be_visible();assert receiver.url==shared['text'];receiver.reload();receiver.locator('#guide-content.is-ready').wait_for(state='attached');expect(receiver.locator('#'+key+'.is-active')).to_be_visible();assert receiver.url==shared['text']
  assert page.locator('[data-share]:visible,[data-share-path]:visible').count()==1
  page.goto(BASE+path);page.locator('#main h1').wait_for();page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
  out['services'].append({'id':key,'portalURL':portal(key),'mainURL':path,'receivedPortalLinkStaysInPortal':True,'serverPreviewHasOwnTitle':True,'previewHasNoImages':True,'addressBarHasOwnURL':True})
 for suffix,key in [('package-1','coordination'),('package-complete','coordination'),('session-2','seating')]:
  page.goto(BASE+'/services-guide/#'+suffix);page.locator('#guide-content.is-ready').wait_for(state='attached');expect(page.locator('#'+suffix+' details')).to_have_attribute('open','');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+portal(key)}
 # New-entry parameters, direct back to the portal home, and native Back/Forward all work.
 receiver.goto(BASE+portal('coordination')+'?source=qr');receiver.locator('#guide-content.is-ready').wait_for(state='attached');assert receiver.url==BASE+portal('coordination')+'?source=qr';receiver.locator('#guide-back').click();expect(receiver.locator('body')).to_have_attribute('data-guide-view','home');assert receiver.url==BASE+'/services-guide/?source=qr';receiver.locator('.guide-tile[href="#seating"]').click();expect(receiver.locator('#seating')).to_be_visible();assert receiver.url==BASE+portal('seating')+'?source=qr';receiver.go_back();expect(receiver.locator('body')).to_have_attribute('data-guide-view','home');receiver.go_forward();expect(receiver.locator('#seating')).to_be_visible();assert receiver.url==BASE+portal('seating')+'?source=qr'
 # Main service sharing remains on its page, with no duplicate share action inside its request.
 page.goto(BASE+'/services/coordination/');page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services/coordination/'};page.locator('.service-guide-packages>.package summary').first.click();page.locator('[data-service-portal]').first.click();expect(page.locator('.native-order-loading')).to_be_hidden();assert page.locator('.native-order-share').count()==0;assert page.locator('.native-order-header button').count()==1;page.locator('.native-order-close').click();expect(page.locator('#native-order-dialog')).to_be_hidden()
 # The other resort portal has the same own-interface rule.
 page.goto(BASE+'/guest-services/');page.locator('#water-card:not([disabled])').wait_for();page.locator('#share-page').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/guest-services/'}
 for key in ['water','games','hospitality','restaurant']:
  page.locator('#'+key+'-card').click();share=page.locator('#service-dialog .resort-service-share');expect(share).to_be_enabled();share.click();expected=BASE+('/guest-services/restaurant/' if key=='restaurant' else '/guest-services/#'+key);assert page.evaluate('shares.at(-1)')=={'text':expected}
  receiver.goto(expected);receiver.locator('#water-card:not([disabled])').wait_for();expect(receiver.locator('#service-dialog')).to_be_visible();expect(receiver.locator('#service-dialog')).to_have_attribute('data-tone',key)
  page.locator('#service-dialog .dialog-close').click();expect(page.locator('#service-dialog')).to_be_hidden();out['guestServices'].append(key)
 # The chalet portal already shares its own public URL; leave its design and controller alone.
 page.goto(BASE+'/chalet/guest-services/');page.locator('#share-page').click();payload=page.evaluate('shares.at(-1)');assert urlparse(payload.get('url',payload.get('text'))).path=='/chalet/guest-services/';out['chaletOwnURLPreserved']=True
 # Receiver previews use their own portal's text-only metadata.
 for path in ['/services-guide/','/guest-services/']:
  html=c.request.get(BASE+path).text();assert 'og:image' not in html and 'twitter:image' not in html
 c.close()
 # Copy fallback uses the same portal destination, including its active section.
 c=b.new_context();c.add_init_script("window.copied=[];Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async u=>copied.push(u)}})");page=c.new_page();page.goto(BASE+'/services-guide/#coordination');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('copied.at(-1)')==BASE+portal('coordination');out['clipboardOwnPortalURL']=True;c.close()
 # The manual copy dialog also identifies the section and offers its dedicated URL.
 c=b.new_context();c.add_init_script("Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:undefined})");page=c.new_page();page.goto(BASE+portal('seating'));page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();expect(page.locator('#share-dialog')).to_be_visible();expect(page.locator('#share-dialog h2')).to_have_text('رابط الجلسات الخارجية');expect(page.locator('#share-link')).to_have_value(BASE+portal('seating'));out['manualCopySectionTitle']=True;c.close();b.close()
assert not out['errors'],out;(R/'site/audits/portal-share-destinations-v103.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

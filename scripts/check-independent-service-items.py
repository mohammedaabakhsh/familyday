"""Real item documents, old-link compatibility, exact item content and isolated WhatsApp requests."""
import json,re,sys,html,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8142';SOURCE=json.loads((R/'data/services.json').read_text());A=SOURCE['arrangements'];items=[];out={'version':'20261126-live-v78','profiles':[],'messagesSent':False,'errors':[]}
for pack in A['coordination']['packages']:
 key=pack['id'].replace('hd-coordination-package-','');items.append({'service':'coordination','key':key,'card':'package-complete' if key=='resort' else 'package-'+key,'path':'/services/coordination/package-'+key+'/','legacy':pack['path'],'data':pack})
for i,session in enumerate(A['seating']['sessions'],1):items.append({'service':'seating','key':str(i),'card':'session-'+str(i),'path':'/services/outdoor-seating/session-'+str(i)+'/','legacy':'/services/outdoor-seating/?session='+str(i),'data':session})
for name in ['data/services.json','site/catalog.json','site/share-metadata.json','share-pages.json','share-extras.json']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show','pre-independent-service-items-20261126:'+name]),name
for item in items:
 text=(R/item['path'].lstrip('/')/'index.html').read_text();assert '<title>'+html.escape(item['data']['name']+' | منتجع يوم العائلة')+'</title>' in text;assert 'rel="canonical" href="https://familydaystay.com'+item['path']+'"' in text;assert 'og:image' not in text and 'twitter:image' not in text;assert 'https://familydaystay.com'+item['path'] in (R/'sitemap.xml').read_text()
seating_names=['جلسة بإطار مثلث — لشخصين','الخيمة الهرمية — لشخصين','الجلسة الأرضية — لـ4 أشخاص','جلسة أرضية بإطار خشبي — لـ4 أشخاص','جلسة أرضية بإطار خشبي — لـ8 أشخاص','جلسة أرضية بإطار خشبي — لـ12 شخصًا']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  for item in items:
   path=item['path'];data=item['data'];page.goto(BASE+path);expect(page.locator('#main h1')).to_have_text(data['name']);assert page.locator('#main [data-service-item]').count()==1;assert page.locator('#main .service-guide-packages').count()==0;assert page.locator('#main img').count()==len(data['images'] if item['service']=='coordination' else [data['img']]);assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');assert page.locator('.context-back').get_attribute('href')==BASE+('/services/coordination/' if item['service']=='coordination' else '/services/outdoor-seating/')
   for button in [page.locator('.header [data-share]'),page.locator('#main .share-text')]:button.click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
   page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();expect(page.locator('.native-order-error')).to_be_hidden();f=page.frame_locator('.native-order-frame');assert 'item='+item['key'] in page.locator('.native-order-frame').get_attribute('src');assert f.locator('#'+item['service']+' .package-card:visible').count()==1;expect(f.locator('.resort-direct-send')).to_be_enabled();assert f.locator('#'+item['card']+' output').inner_text()=='1'
   f.locator('#arrangement-name').fill('ضيف المراجعة');f.locator('#arrangement-cabin').select_option('البيت اليوناني 1');f.locator('#arrangement-notes').fill('مراجعة محلية فقط');page.locator('.native-order-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
   f.locator('#'+item['card']+' [data-share-path]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path};f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();u=urlparse(page.evaluate('opened.at(-1)'));msg=parse_qs(u.query)['text'][0];amount=int(re.search(r'\d+',data['price'])[0]);label='تنسيق' if item['service']=='coordination' else 'جلسة خارجية';group='التنسيقات' if item['service']=='coordination' else 'الجلسات الخارجية';name=data['name'] if item['service']=='coordination' else seating_names[int(item['key'])-1]
   expected='\n'.join(['السلام عليكم، أرغب بطلب '+label+':','','الاسم: ضيف المراجعة','اسم الكوخ: البيت اليوناني 1','رقم الكوخ: 10','','الطلبات:','',group+':',name+' × 1 = '+str(amount)+' ريال','','إجمالي الطلب: '+str(amount)+' ريال','','ملاحظات: مراجعة محلية فقط']);assert u.path=='/966537009217' and msg==expected,(item,msg)
   page.goto(BASE+item['legacy']+'&from=qr');page.wait_for_url(BASE+path+'?from=qr');expect(page.locator('#main h1')).to_have_text(data['name']);assert page.locator('#main [data-service-item]').count()==1
   # The existing independent portal shares this same dedicated item document.
   page.goto(BASE+'/services-guide/#'+item['card']);page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('#'+item['card']+' [data-share-path]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
  out['profiles'].append({'width':width,'height':height,'twelveStandaloneDocuments':True,'uniqueItemOnly':True,'exactItemWhatsApp':True,'itemPreselected':True,'oldQueriesPreserved':True,'samePortalAndPageShares':True});c.close();print(width,'PASS',flush=True)
 b.close()
assert not out['errors'],out
(R/'site/audits/independent-service-items-v78.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

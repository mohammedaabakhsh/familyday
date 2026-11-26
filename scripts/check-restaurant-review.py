"""Four approved restaurant refinements; intercept drafts and sharing, never send."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,parse_qs
import json,os,sys,subprocess
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';PORTAL='/guest-services/restaurant/'
out={'version':'20261126-live-v100','profiles':[],'errors':[],'messagesSent':False}
for name in ['data/services.json','js/menu-order-message.js','js/order-privacy.js']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show','pre-dining-cinema-layout-20261126:'+name]),name
class Preview(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[];self.canonical=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content','')
  if tag in ['img','picture','source'] or tag=='link' and a.get('rel') in ['icon','stylesheet','image_src','apple-touch-icon']:self.images.append(a)
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
init="window.opened=[];window.shares=[];window.open=url=>{opened.push(url);return null};Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})"
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']};request_opts={'ignore_https_errors':True}
 if BASE.startswith('https:'):opts['proxy']=request_opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 api=p.request.new_context(**request_opts);response=api.get(BASE+PORTAL,headers={'User-Agent':'WhatsApp/2.24'});assert response.status==200
 preview=Preview();preview.feed(response.text());assert preview.meta['og:title']=='المطعم | منتجع يوم العائلة';assert preview.meta['og:description']=='تصفّح قائمة الطعام والمشروبات';assert preview.meta['og:url']==preview.canonical=='https://familydaystay.com'+PORTAL;assert not preview.images;assert not any(k and k.startswith(('og:image','twitter:image')) for k in preview.meta);api.dispose();out['serverReadableTextOnlyRestaurantPreview']=True
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568),(390,430)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init);page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:out['errors'].append(str(e)));drafts={}
  for mode,path in [('main','/menu/'),('portal','/guest-services/')]:
   page.goto(BASE+path)
   if mode=='main':
    page.locator('.inline-menu-quantity').first.wait_for();page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/menu/'}
    row=page.locator('.restaurant-menu-category').first.locator('.menu-row').first
   else:
    page.locator('#restaurant-card:not([disabled])').wait_for();expect(page.locator('#restaurant-card .tile-action')).to_have_text('عرض المنيو ←');expect(page.locator('#restaurant-default')).to_have_text('اختر وجبتك ومشروبك');page.locator('#restaurant-card').click();assert page.url==BASE+PORTAL;expect(page).to_have_title('المطعم | منتجع يوم العائلة');expect(page.locator('#restaurant-service .section-note')).to_have_text('تصفّح قائمة الطعام والمشروبات');page.locator('.resort-service-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PORTAL};assert page.locator('#service-dialog header .resort-service-share').count()==1
    page.locator('[data-category="ساندويتشات"] summary').click();row=page.locator('[data-menu-name="ساندويتش دجاج زنجر"]')
   row.locator('[data-step="1"]').click();row.locator('[data-step="1"]').click();row.locator('[type=checkbox]').check();expect(row.locator('.inline-menu-cheese' if mode=='main' else '.menu-cheese')).to_have_text('إضافة جبنة · 1 ريال لكل قطعة')
   if mode=='portal':page.locator('#apply-selection').click();expect(page.locator('#service-dialog')).to_be_hidden();assert page.url==BASE+'/guest-services/';expect(page).to_have_title('خدمات إقامتك | منتجع يوم العائلة');page.locator('#restaurant-items .order-line-details summary').click()
   summary=page.locator('.inline-restaurant-summary' if mode=='main' else '#restaurant-summary');expect(summary).to_contain_text('إضافة جبنة × 2 = 2 ريال');expect(summary).to_contain_text('ملاحظات الطلب (اختياري)');expect(summary.locator('.inline-restaurant-confirmation' if mode=='main' else '.confirmation-note')).to_have_text('تابع طلبك مع المطعم على واتساب')
   send=summary.locator('button[type=submit]');expect(send).to_have_text('إرسال الطلب');prefix='inline-restaurant' if mode=='main' else 'restaurant';page.locator('#'+prefix+'-name').fill('ضيف المطعم');page.locator('#'+prefix+'-cabin').select_option('البيت اليوناني 2');page.locator('#'+prefix+'-notes').fill('ملاحظة التجربة');send.click();url=page.evaluate('opened.at(-1)');assert urlparse(url).path=='/966537006531';message=parse_qs(urlparse(url).query)['text'][0];assert 'إجمالي الطلب: 24 ريال' in message and 'إضافة جبنة × 2 = 2 ريال' in message;drafts[mode]=url
  assert drafts['main']==drafts['portal']
  # Both old distributed links and the new preview link reopen the source menu.
  for path in ['/guest-services/#restaurant','/guest-services/#restaurant-service',PORTAL,PORTAL+'?source=qr']:
   page.goto(BASE+path);page.locator('#restaurant-card:not([disabled])').wait_for();expect(page.locator('#service-dialog')).to_be_visible();expect(page.locator('#service-dialog')).to_have_attribute('data-tone','restaurant');assert page.url==BASE+PORTAL+('?source=qr' if '?' in path else '')
   page.reload();page.locator('#restaurant-card:not([disabled])').wait_for();expect(page.locator('#service-dialog')).to_be_visible();page.locator('.dialog-close').click();expect(page.locator('#service-dialog')).to_be_hidden();assert page.url==BASE+'/guest-services/'+('?source=qr' if '?' in path else '');page.locator('#share-page').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/guest-services/'}
  page.goto(BASE+PORTAL);page.locator('#restaurant-card:not([disabled])').wait_for();page.locator('[data-category="ساندويتشات"] summary').click();page.locator('[data-menu-name="ساندويتش دجاج زنجر"] [data-step="1"]').click();page.locator('#apply-selection').click();page.locator('#restaurant-name').fill('لا تحفظ الاسم');page.reload();page.locator('#restaurant-card:not([disabled])').wait_for();expect(page.locator('#restaurant-summary')).to_be_hidden();expect(page.locator('#restaurant-name')).to_have_value('')
  out['profiles'].append({'width':width,'height':height,'approvedCopyMatches':True,'perPieceCheeseAndInvoice':True,'sameWhatsAppDraftAndRecipient':True,'oldAndNewLinksStayInPortal':True,'canonicalURLAndReload':True,'homeSharePreserved':True,'noRememberedOrder':True});c.close();print(width,height,'PASS',flush=True)
 for fallback in ['clipboard','manual']:
  c=b.new_context(ignore_https_errors=True);c.add_init_script("Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:"+("{writeText:async url=>window.copied=url}" if fallback=='clipboard' else 'undefined')+"})");page=c.new_page();page.set_default_timeout(45000);page.on('pageerror',lambda e:out['errors'].append(str(e)));page.goto(BASE+PORTAL);page.locator('#restaurant-card:not([disabled])').wait_for();page.locator('.resort-service-share').click()
  if fallback=='clipboard':assert page.evaluate('copied')==BASE+PORTAL
  else:expect(page.locator('#share-dialog')).to_be_visible();expect(page.locator('#share-dialog h2')).to_have_text('رابط المطعم');expect(page.locator('#share-link')).to_have_value(BASE+PORTAL)
  c.close()
 out['clipboardAndManualCopyUseOwnRestaurantURL']=True;b.close()
assert not out['errors'],out['errors'];report=Path('/tmp/restaurant-review-v100-live.json') if BASE.startswith('https:') else R/'site/audits/restaurant-review-v100.json';report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

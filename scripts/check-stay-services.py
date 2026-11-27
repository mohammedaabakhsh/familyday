"""Stay slide: matching native/source requests, correct links, deletion and visit privacy. Never send."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import os, sys, json
from playwright.sync_api import sync_playwright, expect

R=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8173'
PORTAL='/stay/guest-services/'
NATIVE='/stay/services/'
EXPECTED='السلام عليكم، أرغب بطلب الزحليقة الهوائية الكبيرة.\n\nالاسم: ضيف الاستراحة\nالمكان: استراحة يوم العائلة\nالقسم: القسم الثاني – الدور العلوي\n\nالخدمة: الزحليقة الهوائية الكبيرة\nالكمية: 1\nإجمالي الطلب: 450 ريال\n\nملاحظات: تجهيز اللعبة'
def ready(page): page.locator('body.stay-services-ready').wait_for()
def fill(scope): scope.locator('#stay-name').fill('ضيف الاستراحة');scope.locator('#stay-notes').fill('تجهيز اللعبة')
def draft(page):
 u=urlparse(page.evaluate('opened.at(-1)'));assert u.hostname=='wa.me' and u.path=='/966556156693';return parse_qs(u.query)['text'][0]
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
def source_request(page):
 if not page.locator('#stay-detail-dialog').is_visible():page.locator('#slide-card').click()
 page.locator('#request-slide').click();expect(page.locator('#stay-request-dialog')).to_be_visible()
def native_request(page):page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');return page.frame_locator('.native-order-frame')
profiles=[];errors=[]
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 browser=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568),(390,430),(1440,900)]):
  c=browser.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce')
  c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})")
  page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+PORTAL);ready(page);page.evaluate('document.fonts.ready');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');expect(page.locator('.hero .eyebrow')).to_have_text('استراحة يوم العائلة');expect(page.locator('.help h2')).to_have_css('font-size','18px');assert page.locator('.logo').evaluate('e=>getComputedStyle(e).backgroundImage').find('logo-booking-original.png')>=0
  page.locator('#share-page').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PORTAL}
  source_request(page);expect(page.locator('#stay-total')).to_have_text('450');expect(page.locator('#stay-order select')).to_have_count(0);expect(page.locator('#stay-followup')).to_have_text('تابع طلبك مع خدمات الاستراحة على واتساب');fill(page)
  page.go_back();expect(page.locator('#stay-detail-dialog')).to_be_visible();page.locator('#share-slide').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PORTAL+'slide/'};page.locator('#request-slide').click();expect(page.locator('#stay-name')).to_have_value('ضيف الاستراحة');page.locator('#stay-invoice .remove-item').click();expect(page.locator('#stay-total')).to_have_text('0');expect(page.locator('#send-stay')).to_be_disabled();page.go_back();page.locator('#request-slide').click();expect(page.locator('#stay-total')).to_have_text('450')
  if (width,height)==(390,844):page.screenshot(path='/tmp/stay-v122-source-invoice.png')
  page.locator('#send-stay').click();expect(page.locator('#stay-request-dialog')).to_be_hidden();expect(page).to_have_url(BASE+PORTAL);assert draft(page)==EXPECTED
  source_request(page);expect(page.locator('#stay-name')).to_have_value('');page.reload();ready(page);source_request(page);expect(page.locator('#stay-name')).to_have_value('');fill(page);background(page);expect(page.locator('#stay-request-dialog')).to_be_hidden();source_request(page);expect(page.locator('#stay-name')).to_have_value('')
  if (width,height)==(390,844):
   fill(page);page.go_back();page.go_back();expect(page).to_have_url(BASE+PORTAL)
   page.evaluate("path=>{const a=document.createElement('a');a.href=path;document.body.append(a);a.click();a.remove()}",'/stay/contact/');page.locator('#main h1').wait_for()
   page.evaluate("path=>{const a=document.createElement('a');a.href=path;document.body.append(a);a.click();a.remove()}",PORTAL);ready(page);source_request(page);expect(page.locator('#stay-name')).to_have_value('ضيف الاستراحة')
  page.goto(BASE+PORTAL+'slide/');ready(page);expect(page.locator('#stay-detail-dialog')).to_be_visible();expect(page.locator('#slide-price')).to_have_text('450 ريال');page.locator('#slide-photo').evaluate('async e=>{await e.decode();if(!e.naturalWidth)throw Error("Missing slide photo")}');expect(page.locator('#slide-location')).to_have_text('القسم الثاني – الدور العلوي');expect(page.locator('#slide-photo')).to_have_attribute('src','/imgs/sec2_3-enhanced-20261122.webp?v=20261002b');assert page.locator('#stay-detail-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  page.goto(BASE+NATIVE);page.locator('#main h1').wait_for();expect(page.locator('#main [data-package-photo]')).to_have_count(0);expect(page.locator('#main .fact-box').last).to_contain_text('450 ريال');expect(page.locator('#main [data-service-portal]')).to_have_text('اطلب هذه اللعبة');page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+NATIVE}
  if (width,height)==(390,844):page.screenshot(path='/tmp/stay-v122-main-service.png')
  frame=native_request(page);expect(frame.locator('#stay-total')).to_have_text('450');fill(frame);page.go_back();expect(page.locator('#native-order-dialog')).to_be_hidden();frame=native_request(page);expect(frame.locator('#stay-name')).to_have_value('ضيف الاستراحة');frame.locator('#stay-invoice .remove-item').click();expect(frame.locator('#stay-total')).to_have_text('0');expect(frame.locator('#send-stay')).to_be_disabled();page.go_back();frame=native_request(page);expect(frame.locator('#stay-total')).to_have_text('0');page.go_back()
  page.reload();page.locator('#main h1').wait_for();frame=native_request(page);expect(frame.locator('#stay-name')).to_have_value('');fill(frame)
  if (width,height)==(390,844):page.screenshot(path='/tmp/stay-v122-main-invoice.png')
  frame.locator('#send-stay').click();expect(page.locator('#native-order-dialog')).to_be_hidden();assert draft(page)==EXPECTED;assert page.url==BASE+NATIVE;frame=native_request(page);expect(frame.locator('#stay-name')).to_have_value('');background(page);expect(page.locator('#native-order-dialog')).to_be_hidden();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');profiles.append({'width':width,'height':height,'matchingMessages':True,'deletionAndVisitPrivacy':True});print(width,height,'source/native/copy/links/privacy PASS',flush=True);c.close()
 browser.close()
assert not errors,errors
data=json.loads((R/'data/services.json').read_text());copy=json.loads((R/'site/guide-copy.json').read_text());assert data['stay']['slide']==copy['stayService']
entry=(R/'stay/guest-services/slide/index.html').read_text();assert 'og:image' not in entry and '<img' not in entry and 'rel="stylesheet"' not in entry;assert 'استراحة يوم العائلة' not in entry.split('property="og:description" content="')[1].split('"')[0]
(Path('/tmp/stay-services-v122-live.json') if BASE.startswith('https:') else R/'site/audits/stay-services-v122.json').write_text(json.dumps({'version':'20261127-stay-services-v122','profiles':profiles,'messagesSent':False,'errors':errors},ensure_ascii=False,indent=2)+'\n')

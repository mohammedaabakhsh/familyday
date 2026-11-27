"""Independent chalet requests, own-interface sharing, exact copy, prices and visit privacy. Never send."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,parse_qs
import os,sys,json
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8171';PORTAL='/chalet/guest-services/'
PATH={'water':'/chalet/services/water-games/','games':'/chalet/services/games/'}
TITLE={'water':'الألعاب المائية','games':'الألعاب الترفيهية'}
INTRO={'water':'استمتع بألعاب مائية للكبار والأطفال','games':'استمتع بوقتك مع ألعابنا الترفيهية'}
CARD={'water':'ألعاب مائية للكبار والأطفال','games':'بوكس الألعاب الترفيهية'}
LABEL={'water':'اطلب الألعاب المائية','games':'اطلب الألعاب الترفيهية'}
EXPECTED={'water':'السلام عليكم، أرغب بطلب ألعاب مائية.\n\nالاسم: ضيف الشاليه\nالمكان: شاليه يوم العائلة\n\nالباقة: باقة ألعاب مائية\nالكمية: 2\nألعاب للكبار: 4\nألعاب للأطفال: 2\nإجمالي الطلب: 100 ريال\n\nملاحظات: ملاحظة الشاليه','games':'السلام عليكم، أرغب بطلب ألعاب ترفيهية.\n\nالاسم: ضيف الشاليه\nالمكان: شاليه يوم العائلة\n\nالباقة: بوكس الألعاب\nالكمية: 1\nإجمالي الطلب: 50 ريال\n\nملاحظات: ملاحظة الشاليه'}
FOLLOW={key:'تابع طلب '+TITLE[key]+' مع خدمات الشاليه على واتساب' for key in PATH}
class Head(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.images=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='meta':self.meta[a.get('property',a.get('name'))]=a.get('content')
  if t in ['img','picture','source'] or t=='link' and a.get('rel') in ['stylesheet','icon','apple-touch-icon']:self.images.append(a)
def inc(p,s,n=1):
 for _ in range(n):p.locator(s).first.click()
def choose(p,key):
 if key=='games':
  expect(p.locator('[name="games-package"]')).to_have_count(1);expect(p.locator('[name="games-package"]')).to_have_attribute('value','box');p.locator('[name="games-package"]').check()
 else:
  inc(p,'[data-water-packages][data-step="1"]');inc(p,'[data-water="adults"][data-step="1"]',4);inc(p,'[data-water="children"][data-step="1"]',2)
def fill(p,prefix):p.locator('#'+prefix+'-name').fill('ضيف الشاليه');p.locator('#'+prefix+'-notes').fill('ملاحظة الشاليه')
def identity(p,prefix):expect(p.locator('#'+prefix+'-name')).to_have_value('ضيف الشاليه');expect(p.locator('#'+prefix+'-notes')).to_have_value('ملاحظة الشاليه')
def draft(page):
 u=urlparse(page.evaluate('opened.at(-1)'));assert u.hostname=='wa.me' and u.path=='/966556156693';return parse_qs(u.query)['text'][0]
def internal(page,path):
 page.evaluate("path=>{const a=document.createElement('a');a.id='internal-portal-link';a.href=path;a.textContent='انتقال داخلي';document.body.append(a)}",path);page.locator('#internal-portal-link').click()
def background(page):page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))")
out={'version':'20261127-chalet-services-v117','profiles':[],'errors':[],'messagesSent':False}
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in ([(390,844)] if BASE.startswith('https:') else [(390,844),(320,568),(390,430),(1440,900)]):
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.goto(BASE+PORTAL);page.locator('body.guest-independent-orders').wait_for();assert page.locator('[data-service]').evaluate_all('es=>es.map(e=>e.dataset.service)')==['water','games'];expect(page.locator('#orders-summary')).to_be_hidden();expect(page.locator('#guest-cabin,#restaurant-order,#hospitality-service,#extras-service')).to_have_count(0);page.locator('#share-page').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PORTAL}
  for key in PATH:
   expect(page.locator('#'+key+'-default')).to_have_text(CARD[key]);page.locator('#'+key+'-card').click();assert page.url==BASE+PORTAL+key+'/';assert page.title()==TITLE[key]+' | شاليه يوم العائلة';expect(page.locator('#'+key+'-service>.section-note').first).to_have_text(INTRO[key]);share=page.locator('#service-dialog .resort-service-share');expect(share).to_be_enabled();share.click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PORTAL+key+'/'}
   choose(page,key);expect(page.locator('#apply-selection')).to_have_text(LABEL[key]);page.locator('#apply-selection').click();expect(page.locator('#service-request-dialog')).to_be_visible();expect(page.locator('#orders-summary')).to_be_hidden();expect(page.locator('#service-request-cabin,.cabin-number')).to_have_count(0);expect(page.locator('#service-request-dialog .confirmation-note')).to_have_text(FOLLOW[key]);assert page.locator('#service-request-dialog').inner_text().count('إجمالي الطلب')==1
   before=page.evaluate('opened.length');page.locator('#service-request-dialog .send-order').click();assert page.evaluate('opened.length')==before;fill(page,'service-request');page.go_back();expect(page.locator('#service-dialog')).to_be_visible();page.locator('#apply-selection').click();identity(page,'service-request');page.locator('#service-request-dialog .dialog-close').click();page.locator('#'+key+'-card').click();page.locator('#apply-selection').click();identity(page,'service-request');assert page.locator('#service-request-dialog').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
   if width==390 and height==844:page.screenshot(path='/tmp/chalet-v117-'+key+'-source.png')
   page.locator('#service-request-dialog .send-order').click();expect(page.locator('#service-request-dialog')).to_be_hidden();sourceDraft=draft(page);assert sourceDraft==EXPECTED[key],sourceDraft;assert page.url==BASE+PORTAL
   # Main stays on its native service page and matches the exact same draft.
   page.goto(BASE+PATH[key]);page.locator('#main h1').wait_for();expect(page.locator('#main .page-heading p')).to_have_text(INTRO[key]);expect(page.locator('#main [data-package-photo]')).to_have_count(0);expect(page.locator('#main [data-service-portal]')).to_have_text(LABEL[key]);assert 'طاولة مع بوكس' not in page.locator('#main').inner_text();page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+PATH[key]};page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');assert page.url==BASE+PATH[key];f=page.frame_locator('.native-order-frame');choose(f,key);fill(f,'guest');expect(f.locator('#guest-cabin')).to_have_count(0);expect(f.locator('.resort-direct-confirmation')).to_have_text(FOLLOW[key]);expect(f.locator('[data-for="notes"]')).to_have_text('ملاحظات الطلب (اختياري)');page.go_back();expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');f=page.frame_locator('.native-order-frame');identity(f,'guest')
   if width==390 and height==844:page.screenshot(path='/tmp/chalet-v117-'+key+'-main.png')
   f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();assert draft(page)==sourceDraft;page.goto(BASE+PORTAL);page.locator('body.guest-independent-orders').wait_for();out['profiles'].append({'width':width,'height':height,'service':key,'independentMainAndSourceOrders':True,'exactSameApprovedDraftAndRecipient':True,'ownInterfaceLinksAndCopy':True});print(width,height,key,'drafts/copy/links PASS',flush=True)
  # Source deletion changes the actual selection and prevents an empty draft.
  page.locator('#games-card').click();choose(page,'games');page.locator('#apply-selection').click();fill(page,'service-request');page.locator('.request-invoice .remove-item').click();expect(page.locator('#service-request-total')).to_have_text('0');expect(page.locator('#service-request-dialog .send-order')).to_be_disabled();page.locator('.request-edit').click();expect(page.locator('[name="games-package"]:checked')).to_have_count(0);choose(page,'games');page.locator('#apply-selection').click();identity(page,'service-request');background(page);expect(page.locator('#service-request-dialog')).to_be_hidden();page.locator('#games-card').click();expect(page.locator('[name="games-package"]:checked')).to_have_count(0);page.reload();page.locator('body.guest-independent-orders').wait_for();expect(page.locator('[name="games-package"]:checked')).to_have_count(0)
  # Main removal/return, lifecycle and route browsing preserve only the active visit.
  page.goto(BASE+PATH['games']);page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');f=page.frame_locator('.native-order-frame');choose(f,'games');fill(f,'guest');f.locator('.resort-direct-form .remove-item').click();expect(f.locator('.resort-direct-send')).to_be_disabled();choose(f,'games');page.locator('.native-order-close').click();page.locator('.context-back').click();expect(page.locator('.service-card p')).to_have_text([CARD['games'],CARD['water']]);page.locator('.service-card[href="'+PATH['games']+'"]').click();page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');f=page.frame_locator('.native-order-frame');identity(f,'guest');background(page);expect(page.locator('#native-order-dialog')).to_be_hidden();page.locator('#main [data-service-portal]').click();page.locator('.native-order-loading').wait_for(state='hidden');f=page.frame_locator('.native-order-frame');expect(f.locator('#guest-name')).to_have_value('');expect(f.locator('[name="games-package"]:checked')).to_have_count(0);page.reload();page.locator('#main h1').wait_for();expect(page.locator('#native-order-dialog')).to_be_hidden()
  # Main and source previews expose the venue once in the title, never the description.
  for key,path in PATH.items():
   previews=[]
   for url in [path,PORTAL+key+'/']:
    response=c.request.get(BASE+url,headers={'User-Agent':'WhatsApp/2.24'});assert response.status==200;h=Head();h.feed(response.text());assert h.meta['og:title']==TITLE[key]+' | شاليه يوم العائلة';assert h.meta['og:description']==INTRO[key];assert h.meta['twitter:description']==INTRO[key];assert 'يوم العائلة' not in h.meta['og:description'];assert 'og:image' not in h.meta and 'twitter:image' not in h.meta
    if url.startswith(PORTAL):assert not h.images and h.meta['familyday:portal-base']==PORTAL
   for suffix in ['', '-service']:
    page.goto(BASE+PORTAL+'#'+key+suffix);page.locator('body.guest-independent-orders').wait_for();expect(page.locator('#service-dialog')).to_have_attribute('data-tone',key);assert page.url==BASE+PORTAL+key+'/';page.reload();page.locator('body.guest-independent-orders').wait_for();expect(page.locator('#service-dialog')).to_have_attribute('data-tone',key)
  # Shared visit handoff must preserve each venue's own draft without copying names or cabin data.
  if width==390 and height==844:
   page.goto(BASE+PORTAL+'games/');page.locator('body.guest-independent-orders').wait_for();choose(page,'games');page.locator('#apply-selection').click();fill(page,'service-request')
   page.locator('#service-request-dialog .dialog-close').click();internal(page,'/guest-services/');page.locator('body.guest-independent-orders').wait_for();page.locator('#games-card').click();expect(page.locator('[name="games-package"]')).to_have_count(2);page.locator('[name="games-package"][value="table"]').check();page.locator('#apply-selection').click();expect(page.locator('#service-request-name')).to_have_value('');expect(page.locator('#service-request-cabin')).to_have_value('');page.locator('#service-request-name').fill('ضيف المنتجع')
   page.locator('#service-request-dialog .dialog-close').click();internal(page,PORTAL);page.locator('body.guest-independent-orders').wait_for();page.locator('#games-card').click();expect(page.locator('[name="games-package"]')).to_have_count(1);page.locator('#apply-selection').click();identity(page,'service-request');expect(page.locator('#service-request-cabin')).to_have_count(0)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');c.close()
 # Manual and clipboard fallback also retain the dedicated chalet service URL.
 for manual in [False,True]:
  c=b.new_context(ignore_https_errors=True);c.add_init_script("Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:"+('undefined' if manual else '{writeText:async u=>window.copied=u}')+"})");page=c.new_page();page.goto(BASE+PORTAL+'games/');page.locator('body.guest-independent-orders').wait_for();share=page.locator('.resort-service-share');expect(share).to_be_enabled();share.click()
  if manual:expect(page.locator('#share-link')).to_have_value(BASE+PORTAL+'games/');expect(page.locator('#share-dialog h2')).to_have_text('رابط الألعاب الترفيهية')
  else:page.wait_for_function('window.copied');assert page.evaluate('copied')==BASE+PORTAL+'games/'
  c.close()
 b.close()
assert not out['errors'],out['errors'];dest=Path('/tmp/chalet-services-v117-live.json') if BASE.startswith('https:') else R/'site/audits/chalet-services-v117.json';dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Chalet independent ordering, prices, own-interface sharing, copy and privacy PASS')

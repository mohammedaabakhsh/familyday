"""Owner-approved help/layout and exact four-service drafts; never send messages."""
import json,os,sys
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150'
OUT=Path(sys.argv[2]) if len(sys.argv)>2 else R/'site/audits/service-copy-batch-v104.json'
copy=json.loads((R/'site/guide-copy.json').read_text())['serviceCopy'];errors=[];results=[]
paths={'coordination':('/services/coordination/','/services-guide/coordination/'),'seating':('/services/outdoor-seating/','/services-guide/seating/'),'dining':('/services/dining-tables/','/services-guide/dining/'),'cinema':('/services/cinema/','/services-guide/cinema/')}
prefix=lambda kind:'السلام عليكم، أرغب بطلب '+{'coordination':'تنسيق','seating':'جلسة خارجية','dining':'طاولة طعام','cinema':'جلسة سينما'}[kind]+'.\n\nالاسم: محمد\nاسم الكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\n'
expected={'coordination':'الباقة: باقة الورد\nالكمية: 2\nإجمالي الطلب: 240 ريال','seating':'الجلسة: جلسة بإطار مثلث — لشخصين\nالكمية: 2\nإضافة اختيارية: كيك وعصير — 170 ريال\nإجمالي الطلب: 770 ريال','dining':'عدد الأشخاص: 18\nنوع التجهيز: تجهيز مع تنسيق\nإجمالي الطلب: 799 ريال','cinema':'موعد الجلسة: من 11 مساءً إلى 2 صباحًا (اليوم التالي)\nمدة الجلسة: 3 ساعات\nإجمالي الطلب: 150 ريال'}
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})")
  for kind,urls in paths.items():
   drafts=[]
   for mode,url in zip(['main','portal'],urls):
    page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+url)
    root=page.locator('#main' if mode=='main' else '#'+kind);expect(root.locator('.coordination-help')).to_be_visible()
    expect(root.locator('.coordination-order-note')).to_have_text(copy[kind]['advanceNote'])
    assert root.locator('.coordination-help').inner_text().count('منسّق المناسبات')==0
    desc=copy[kind]['help']['description'] if not(kind=='seating' and mode=='portal') else 'تواصل معنا لاختيار الجلسة المناسبة لكم'
    expect(root.locator('.coordination-help-description')).to_have_text(desc)
    assert root.locator('.coordination-help-actions a').evaluate_all("es=>es.map(e=>e.getAttribute('href'))")==['https://wa.me/966537009217','tel:+966537009217']
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(kind,mode,width)
    if kind in ['coordination','seating'] and mode=='main':assert root.locator('.page-heading p').evaluate("e=>getComputedStyle(e).textAlign")== 'center'
    # Whole-section sharing retains the current interface and has one header action.
    page.locator('.header [data-share]' if mode=='main' else '.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+url}
    if kind=='dining':
     assert 'الصورة توضح' not in root.inner_text()
     details=root.locator('.dining-guide-details' if mode=='main' else 'details.fd-dining-contents');assert details.evaluate('e=>!e.open')
     expect(details.locator('summary')).to_have_text('محتويات التجهيز مع التنسيق');details.locator('summary').click();expect(details.locator('li')).to_have_count(6);details.locator('summary').click()
     hint=root.locator('#dining-selection-help' if mode=='main' else '#dining-price-help');expect(hint).to_have_text(copy[kind]['orderHint'])
     table=root.locator('table');assert table.evaluate('(e,sel)=>!!(e.compareDocumentPosition(document.querySelector(sel))&Node.DOCUMENT_POSITION_FOLLOWING)','#dining-selection-help' if mode=='main' else '#dining-price-help')
     btn=root.locator('[data-service-portal]' if mode=='main' else '[data-dining-request]');expect(btn).to_be_disabled()
     root.locator('[data-dining-size="18"][data-dining-option="tansiq"]' if mode=='main' else '[data-size="18"][data-option="tansiq"]').click();expect(btn).to_be_enabled();assert page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request').is_hidden()
    else:
     if kind in ['coordination','seating']:
      root.locator('.service-guide-packages>.package>summary' if mode=='main' else ('#package-1>details>summary' if kind=='coordination' else '#session-1>details>summary')).first.click()
     btn=root.locator('[data-resort-order-key="'+('package-1' if kind=='coordination' else 'session-1')+'"]' if mode=='main' and kind!='cinema' else '[data-service-portal]' if mode=='main' else ('#package-1 [data-request-key]' if kind=='coordination' else '#session-1 [data-request-key]' if kind=='seating' else '#cinema-session [data-request-key]'))
    if kind in ['dining','cinema']:assert btn.evaluate('(e,sel)=>!!(e.compareDocumentPosition(document.querySelector(sel))&Node.DOCUMENT_POSITION_FOLLOWING)','#main .coordination-help' if mode=='main' else '#'+kind+' .coordination-help')
    btn.click()
    if mode=='main':
     expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');send=f.locator('.resort-direct-send')
    else:f=page;send=f.locator('.arrangement-request .arrangement-send')
    if kind in ['coordination','seating']:
     counter=f.locator('.resort-entry-selection .arrangement-quantity' if mode=='main' else '.arrangement-request-quantity .arrangement-quantity');counter.locator('[data-step="1"]').click()
    if kind=='seating':f.locator('[data-request-extra]').check()
    f.locator('#arrangement-name').fill('محمد');f.locator('#arrangement-cabin').select_option('بيت الدوم 1');expect(f.locator('#arrangement-cabin-number')).to_have_text('رقم الكوخ: 15')
    f.locator('#arrangement-notes').fill('تجهيز للمناسبة')
    if kind=='cinema':f.locator('#cinema-time').select_option('23')
    expect(send).to_have_text('إرسال الطلب');send.click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden()
    draft=page.evaluate('opened.at(-1)');assert urlparse(draft).path=='/966537009217';message=parse_qs(urlparse(draft).query)['text'][0];assert message==prefix(kind)+expected[kind]+'\n\nملاحظات: تجهيز للمناسبة',(mode,kind,message)
    drafts.append(draft)
    if kind=='dining':expect(hint).to_have_text(copy[kind]['orderHint']);expect(btn).to_be_disabled()
    if width==390:
     page.evaluate('scrollTo(0,0)');folder=Path('/tmp/service-copy-v104');folder.mkdir(exist_ok=True);page.screenshot(path=str(folder/(kind+'-'+mode+'.png')),full_page=kind in ['cinema','dining'])
    page.close()
   assert drafts[0]==drafts[1]
   results.append({'width':width,'service':kind,'draftParity':True,'layoutAndHelp':True,'ownShareURLs':True});print(width,kind,'PASS',flush=True)
  page=c.new_page();page.goto(BASE+'/services-guide/');expect(page.locator('#guide-content.is-ready')).to_be_attached();assert 'منسّق المناسبات' not in page.locator('.footer').inner_text();expect(page.locator('.footer-help')).to_contain_text('تواصل معنا لاختيار التنسيق أو الجلسة المناسبة لكم');assert page.locator('.footer-contact .contact-actions a').count()==2
  if width==390:page.locator('.footer-help').scroll_into_view_if_needed();page.screenshot(path='/tmp/service-copy-v104/portal-home-help.png')
  page.close();c.close()
 b.close()
assert not errors,errors
OUT.write_text(json.dumps({'version':'20261126-live-v104','profiles':results,'errors':errors,'messagesSent':False},ensure_ascii=False,indent=2)+'\n')

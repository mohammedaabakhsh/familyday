"""Inline restaurant basket, exact parity with the unchanged portal, no actual messages."""
import json,os,sys,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';SOURCE=json.loads((R/'data/services.json').read_text())['guest'];MENU=SOURCE['menu'];out={'version':'20261126-live-v92','profiles':[],'errors':[],'messagesSent':False}
for name in ['data/services.json','js/menu-order-message.js','guest-services/index.html','guest-services/guest-services.js']:
 assert (R/name).read_bytes()==subprocess.check_output(['git','show','pre-inline-restaurant-order-20261126:'+name]),name
scenario=[('ساندويتشات','ساندويتش دجاج زنجر',2,True,''),('ساندويتشات','برجر لحم',1,False,''),('بوكسات الشواء','بوكس الشواء بدون فحم',1,False,'لحم'),('بوكسات الشواء','بوكس الشواء بدون فحم',2,False,'دجاج'),('مشروبات باردة','عبوة ماء صغيرة',3,False,''),('مشروبات ساخنة','شاهي عدني',1,False,'')]
expectedTotal=2*11+2+9+85+2*85+3*2+8
init="window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})"
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568),(390,430)]:
  drafts={}
  for mode,path in [('directory','/services/'),('menu','/menu/'),('portal','/guest-services/#restaurant')]:
   c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init);page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.goto(BASE+path)
   main=mode!='portal';prefix='inline-restaurant' if main else 'restaurant'
   if main:
    page.locator('.inline-menu-quantity').first.wait_for();assert not page.locator('dialog[open],iframe').count();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();assert page.locator('.restaurant-order-link,[data-resort-service="restaurant"]').count()==0
    assert page.locator('.restaurant-menu-category').count()==6;assert page.locator('.restaurant-menu-category .menu-row').count()==47
    assert page.locator('.restaurant-menu-tabs button').all_text_contents()==list(MENU);assert page.locator('.restaurant-menu-category:visible').count()==1;assert page.locator('.restaurant-guide details').count()==0
    for i,(category,items) in enumerate(MENU.items()):
     cat=page.locator('.restaurant-menu-category').nth(i);assert cat.get_attribute('aria-label')==category
     assert cat.locator('.menu-row h3').all_text_contents()==[x['name'] for x in items]
     assert cat.locator('.inline-menu-info>strong').all_text_contents()==[str(x['price'])+' ريال' for x in items]
    # Category controls stay usable after scrolling a long drinks list.
    page.locator('.restaurant-menu-tabs button').get_by_text('مشروبات باردة',exact=True).click();page.locator('.restaurant-menu-category:visible .menu-row').last.scroll_into_view_if_needed();page.locator('.restaurant-menu-tabs button').get_by_text('مشروبات ساخنة',exact=True).click();expect(page.locator('.restaurant-menu-category:visible .menu-row').first).to_be_in_viewport();page.locator('.restaurant-menu-tabs button').get_by_text('ساندويتشات',exact=True).click()
    first=page.locator('.menu-row').first;expect(first.locator('[type=checkbox]')).to_be_disabled();first.locator('[data-step="1"]').click();first.locator('[type=checkbox]').check();expect(page.locator('.inline-restaurant-total strong')).to_have_text('12 ريال');page.locator('.inline-restaurant-remove').click();expect(page.locator('.inline-restaurant-summary')).to_be_hidden();expect(first.locator('output')).to_have_text('0');expect(first.locator('[type=checkbox]')).not_to_be_checked()
   else:
    page.locator('#water-card:not([disabled])').wait_for();expect(page.locator('#service-dialog')).to_be_visible()
   for category,name,qty,cheese,variant in scenario:
    if main:
     page.locator('.restaurant-menu-tabs button').get_by_text(category,exact=True).click();cat=page.locator('.restaurant-menu-category').nth(list(MENU).index(category))
    else:
     cat=page.locator('#guest-menu .menu-category').filter(has=page.locator('summary>span').filter(has_text=category)).first
     if cat.get_attribute('open') is None:cat.locator('summary').click()
    row=cat.locator('.menu-row').filter(has=page.locator('h3').get_by_text(name,exact=True))
    if variant:row.locator('select').select_option(label=variant)
    for _ in range(qty):row.locator('[data-step="1"]').click()
    if cheese:row.locator('[type=checkbox]').check()
   if main:
    assert not page.locator('dialog[open],iframe').count();expect(page.locator('.inline-restaurant-total strong')).to_have_text(str(expectedTotal)+' ريال');assert page.locator('.inline-restaurant-items>article').count()==6
    # Edit quantities in the menu; the receipt contains only itemized prices and removal.
    assert page.locator('.inline-restaurant-summary .inline-menu-quantity,.inline-restaurant-jump,.inline-restaurant-summary header button').count()==0
    expect(page.locator('.inline-restaurant-confirmation')).to_have_text('تابع طلبك مع المطعم')
    page.locator('.restaurant-menu-tabs button').get_by_text('ساندويتشات',exact=True).click();counter=page.locator('.menu-row').first.locator('.inline-menu-quantity');plus=counter.locator('[data-step="1"]');plus.focus();page.keyboard.press('Enter');expect(plus).to_be_focused();expect(page.locator('.inline-restaurant-total strong')).to_have_text(str(expectedTotal+12)+' ريال');counter.locator('[data-step="-1"]').click();expect(page.locator('.inline-restaurant-total strong')).to_have_text(str(expectedTotal)+' ريال')
    if mode=='directory':
     page.locator('[data-service-group="1"]').last.click();page.locator('[data-service-group="0"]').last.click();expect(page.locator('.inline-restaurant-total strong')).to_have_text(str(expectedTotal)+' ريال')
    # Navigation preserves the restaurant basket and picks up the shared guest identity.
    if mode=='directory':
     page.evaluate("sessionStorage.setItem('familyday.resort-direct-identity.v1',JSON.stringify({name:'اسم محفوظ',cabin:'البيت اليوناني 1'}))")
     page.locator('.bottom-nav a[href="/resort/"]').click();page.locator('.bottom-nav a[href="/services/"]').click();page.locator('.inline-restaurant-total strong').wait_for();expect(page.locator('.inline-restaurant-total strong')).to_have_text(str(expectedTotal)+' ريال');expect(page.locator('#inline-restaurant-name')).to_have_value('اسم محفوظ');expect(page.locator('#inline-restaurant-cabin')).to_have_value('البيت اليوناني 1')
    page.locator('.inline-restaurant-summary').evaluate("e=>e.scrollIntoView({block:'start'})");expect(page.locator('.inline-restaurant-summary h2')).to_be_in_viewport()
    assert page.locator('.menu-categories').evaluate("e=>!!(e.compareDocumentPosition(document.querySelector('.inline-restaurant-summary')) & Node.DOCUMENT_POSITION_FOLLOWING)")
   else:
    page.locator('#apply-selection').click();expect(page.locator('#service-dialog')).to_be_hidden();expect(page.locator('#restaurant-total')).to_have_text(str(expectedTotal))
   send=page.locator('#'+('inline-restaurant-order button[type=submit]' if main else 'restaurant-order .send-order'));page.locator('#'+prefix+'-name').fill('');page.locator('#'+prefix+'-cabin').select_option('');send.click();assert page.evaluate('opened.length')==0
   page.locator('#'+prefix+'-name').fill('ضيف مراجعة المطعم');page.locator('#'+prefix+'-cabin').select_option('البيت اليوناني 2');page.locator('#'+prefix+'-notes').fill('بدون بصل')
   number=page.locator('.inline-restaurant-cabin-number' if main else '#restaurant-order .cabin-number');assert '11' in number.inner_text()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');assert not page.locator('.inline-restaurant-summary').evaluate('e=>e.scrollWidth>e.clientWidth') if main else True
   if main and width==390 and height==844:
    page.locator('.inline-restaurant-summary').scroll_into_view_if_needed();page.screenshot(path='/tmp/inline-restaurant-v92-'+mode+'.png',full_page=True)
   send.click();assert page.locator('dialog[open]').count()==0;url=page.evaluate('opened.at(-1)');assert urlparse(url).path=='/966537006531';text=parse_qs(urlparse(url).query)['text'][0];assert text.startswith('السلام عليكم، أرغب بطلب من المطعم.');assert 'إجمالي الطلب: '+str(expectedTotal)+' ريال' in text;assert 'إضافة جبنة × 2 = 2 ريال' in text;assert 'بوكس الشواء بدون فحم — دجاج × 2 = 170 ريال' in text;drafts[mode]=url;c.close()
  assert drafts['directory']==drafts['menu']==drafts['portal'];out['profiles'].append({'width':width,'height':height,'mainHasNoDialogOrIframe':True,'all47MenuItemsAndPrices':True,'inlineQuantityCheeseAndBbq':True,'summaryRemovalAndTotals':True,'menuKeyboardFocus':True,'sixCategoryButtons':True,'invoiceBelowItems':True,'noTopSummaryOrInvoiceShare':True,'identityValidation':True,'exactPortalMessageParity':True,'restaurantRecipient':'966537006531'})
 b.close()
assert not out['errors'],out
report=R/'site/audits/inline-restaurant-v92.json' if not BASE.startswith('https:') else Path('/tmp/inline-restaurant-v92-live.json');report.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

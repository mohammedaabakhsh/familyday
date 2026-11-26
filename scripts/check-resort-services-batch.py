"""Exercise approved service tabs, independent seating requests and cinema routing; intercept drafts."""
import json,os,sys,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150'
SOURCE=json.loads((R/'data/services.json').read_text());out={'version':'20261126-live-v88','errors':[],'profiles':[],'drafts':[],'messagesSent':False}
assert (R/'data/services.json').read_bytes()==subprocess.check_output(['git','show','pre-resort-services-batch-20261126:data/services.json'])
init="window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})"
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for w,h in [(390,844),(390,740),(375,667),(320,568)]:
  c=b.new_context(viewport={'width':w,'height':h},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script(init)
  page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.goto(BASE+'/services/');root=page.locator('#resort-service-directory');expect(root).to_be_visible()
  assert root.locator('.service-categories button').all_text_contents()==['المطعم','التنسيقات والجلسات','الإقامة','شارك']
  for i,keys in enumerate([['menu'],['coordination','seating','dining','cinema'],['hospitality','games','water'],['competition','video']]):
   root.locator(f'button[data-service-group="{i}"]').click();assert root.locator('.svcs-card:visible').count()==(0 if i==0 else len(keys))
   if i==0:assert root.locator('.restaurant-menu-category').count()==len(SOURCE['guest']['menu'])
  assert root.locator('a[href="/services/loyalty/"],[data-resort-service="extras"]').count()==0
  root.locator('button[data-service-group="1"]').click();root.locator('a[href="/services/outdoor-seating/"]').click();page.locator('.context-back').click();expect(root.locator('button[data-service-group="1"]')).to_have_attribute('aria-pressed','true');assert root.locator('.svcs-card:visible').count()==4
  page.reload();expect(root.locator('button[data-service-group="1"]')).to_have_attribute('aria-pressed','true')
  page.goto(BASE+'/resort/contact/');expect(page.locator('.resort-loyalty-link')).to_be_visible();page.locator('.resort-loyalty-link').click();expect(page.locator('#main h1')).to_have_text('بطاقة الولاء')
  geometry={}
  for mode,path in [('main','/services/outdoor-seating/'),('portal','/services-guide/#seating')]:
   page.goto(BASE+path);page.locator('.service-guide-seating' if mode=='main' else '#guide-content.is-ready').wait_for(state='attached')
   scope=page.locator('.service-guide-seating' if mode=='main' else '#seating')
   expect(scope.locator('.coordination-help-actions')).to_be_visible()
   assert scope.locator('.service-guide-extra,.seating-extra,.guide-usage,.seating-detail-hint').count()==0
   assert 'يُرجى طلب الجلسة مسبقًا لإتاحة الوقت الكافي لتجهيزها لكم' in scope.inner_text()
   assert scope.locator('.coordination-help a').evaluate_all('(a)=>a.map(x=>x.href)')==['https://wa.me/966537009217','tel:+966537009217']
   box=scope.locator('.coordination-help-actions').bounding_box();nav=page.locator('.bottom-nav')
   limit=nav.bounding_box()['y'] if mode=='main' and nav.count() else h
   geometry[mode]={'helpBottom':round(box['y']+box['height']),'availableBottom':round(limit),'documentHeight':page.evaluate('document.documentElement.scrollHeight')}
   if h>=740:assert box['y']+box['height']<=limit,(w,h,mode,geometry)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if w==390 and h==844:page.screenshot(path='/tmp/v88-reviewed-'+mode+'.png',full_page=True)
  out['profiles'].append({'width':w,'height':h,'geometry':geometry,'directoryStatePreserved':True})
  if (w,h)!=(390,844):page.close();c.close();continue
  # Compare every session with/without add-on and quantity changes on both interfaces.
  for i,session in enumerate(SOURCE['arrangements']['seating']['sessions']):
   drafts={}
   for mode in ['main','portal']:
    page.goto(BASE+('/services/outdoor-seating/' if mode=='main' else '/services-guide/#seating'))
    if mode=='main':
     page.locator('.service-guide-packages>.package').nth(i).locator('summary').click();button=page.locator(f'[data-resort-order-key="session-{i+1}"]');expect(button).to_have_text('اطلب هذه الجلسة');button.click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');send=f.locator('.resort-direct-send');counter=f.locator('.resort-entry-selection .arrangement-quantity');extra=f.locator('.resort-entry-selection [data-request-extra]')
     expect(page.locator('#native-order-title')).to_have_text('طلب '+session['name']);page.locator('.native-order-share').click();assert page.evaluate('shares.at(-1).text')==BASE+'/services/outdoor-seating/'
    else:
     page.locator('#guide-content.is-ready').wait_for(state='attached');card=page.locator(f'#session-{i+1}');card.locator('summary').click();button=card.locator('[data-request-key]');expect(button).to_have_text('اطلب هذه الجلسة');button.click();f=page;send=page.locator('.arrangement-request .arrangement-send');counter=page.locator('.arrangement-request-quantity .arrangement-quantity');extra=page.locator('.arrangement-request [data-request-extra]');expect(page.locator('#arrangement-request-title')).to_have_text('طلب '+session['name'])
    expect(f.locator('#arrangement-total')).to_have_text(str(int(session['price'].split()[0])))
    counter.locator('[data-step="1"]').click();extra.check();price=int(session['price'].split()[0])*2+170;expect(f.locator('#arrangement-total')).to_have_text(str(price))
    f.locator('#arrangement-name').fill('ضيف الفحص');f.locator('#arrangement-cabin').select_option('الكوخ الكلاسيكي');expect(f.locator('#arrangement-cabin-number')).to_have_text('رقم الكوخ: 18');f.locator('#arrangement-notes').fill('مراجعة دون إرسال');expect(send).to_have_text('إرسال الطلب');send.click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden();url=page.evaluate('opened.at(-1)');assert urlparse(url).path=='/966537009217';text=parse_qs(urlparse(url).query)['text'][0];assert text.startswith('السلام عليكم، أرغب بطلب جلسة خارجية:');assert 'إجمالي الطلب: '+str(price)+' ريال' in text;assert 'كيك وعصير × 1 = 170 ريال' in text;assert ' — ' in text;drafts[mode]=url
    # A fresh request contains no prior quantity/add-on/notes.
    if mode=='main':button.click();expect(page.locator('.native-order-loading')).to_be_hidden()
    else:button.click()
    expect(extra).not_to_be_checked();expect(counter.locator('output')).to_have_text('1');expect(f.locator('#arrangement-notes')).to_have_value('');page.locator('.native-order-close' if mode=='main' else '[data-close-request]').click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden()
   assert drafts['main']==drafts['portal'];out['drafts'].append({'session':session['name'],'exactParity':True,'addOnAndQuantity':True})
  # Cinema both interfaces route to the sole coordinator, with the same draft.
  drafts={}
  for mode in ['main','portal']:
   page.goto(BASE+('/services/cinema/' if mode=='main' else '/services-guide/#cinema'))
   if mode=='main':
    page.locator('#main [data-service-portal]').click();expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');send=f.locator('.resort-direct-send');note=f.locator('.resort-direct-confirmation')
   else:
    page.locator('#cinema-session [data-request-key]').click();f=page;send=page.locator('.arrangement-request .arrangement-send');note=page.locator('.arrangement-request .arrangement-confirmation')
   assert 'منسّق المناسبات' in note.inner_text();f.locator('#arrangement-name').fill('ضيف الفحص');f.locator('#arrangement-cabin').select_option('بيت الدوم 1');f.locator('#cinema-time').select_option('18');send.click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden();drafts[mode]=page.evaluate('opened.at(-1)');assert urlparse(drafts[mode]).path=='/966537009217'
  assert drafts['main']==drafts['portal'];out['cinemaDraftParity']=True
  page.goto(BASE+'/services-guide/');expect(page.locator('.footer-contact')).to_have_count(1);assert page.locator('footer a[href*="966556156693"]').count()==0;assert page.locator('.footer-contact a').evaluate_all('(a)=>a.map(x=>x.href)')==['https://wa.me/966537009217','tel:+966537009217']
  page.close();c.close()
 b.close()
assert not out['errors'],out['errors'];(R/'site/audits/resort-services-batch-v88.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

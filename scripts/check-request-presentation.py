"""One total and the original confirmation below إرسال الطلب; capture drafts, never send."""
import json,os,sys,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';out={'version':'20261126-live-v82','profiles':[],'errors':[],'messagesSent':False}
# The presentation correction must leave public destinations and request assembly alone.
assert (R/'data/services.json').read_bytes()==subprocess.check_output(['git','show','pre-request-presentation-20261126:data/services.json'])
old=subprocess.check_output(['git','show','pre-request-presentation-20261126:services-guide/guide-orders.js']).decode();new=(R/'services-guide/guide-orders.js').read_text();start='  function submitOrder(event){';end="  form.addEventListener('submit'";assert old[old.index(start):old.index(end)].replace("(cinemaChosen()?'966556156693':'966537009217')","'966537009217'").replace("'https://wa.me/'+'966537009217'+'?text='", "'https://wa.me/966537009217?text='").replace('save();','')==new[new.index(start):new.index(end)]
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for width,height in [(390,844),(320,568),(390,430)]:
  c=b.new_context(viewport={'width':width,'height':height},ignore_https_errors=True,reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})")
  for kind,path,price in [('coordination','/services/coordination/',350),('dining','/services/dining-tables/',199),('cinema','/services/cinema/',150)]:
   observations={};drafts={}
   for mode in ['main','portal']:
    page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.goto(BASE+(path if mode=='main' else '/services-guide/#'+kind))
    if mode=='main':
     page.locator('#main h1').wait_for();page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path}
     if kind=='coordination':page.locator('.service-guide-packages>.package').nth(1).locator('summary').click();page.locator('[data-resort-order-key="package-2"]').click()
     elif kind=='dining':
      expect(page.locator('.dining-guide-link')).to_have_text('اطلب هذه الطاولة');page.locator('.dining-guide-details summary').click();assert page.locator('.dining-guide-details').evaluate("e=>!!(e.compareDocumentPosition(document.querySelector('.dining-guide-prices')) & Node.DOCUMENT_POSITION_FOLLOWING)");assert page.locator('.dining-guide-details').evaluate("e=>!!(e.compareDocumentPosition(document.querySelector('.dining-guide-link')) & Node.DOCUMENT_POSITION_FOLLOWING)");page.locator('[data-dining-size="6"][data-dining-option="plain"]').click();page.locator('.dining-guide-link').click()
     else:expect(page.locator('#main [data-service-portal]')).to_have_text('اطلب هذه الجلسة');page.locator('#main [data-service-portal]').click()
     expect(page.locator('.native-order-loading')).to_be_hidden();f=page.frame_locator('.native-order-frame');send=f.locator('.resort-direct-send');note=f.locator('.resort-direct-confirmation');title=page.locator('#native-order-title').inner_text()
     assert f.locator('.arrangement-total:visible').count()==1;assert f.locator('.resort-entry-total:visible,#arrangement-dialog-status:visible').count()==0
     assert f.locator('body').inner_text().count('إجمالي')==1
     if kind=='coordination':assert f.locator('.resort-entry-selection').inner_text().startswith('الكمية')
     assert page.locator('.native-order-share').count()==0;assert page.locator('.native-order-header button').count()==1
    else:
     page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services-guide/'+kind+'/'}
     if kind=='coordination':page.locator('#package-2 summary').first.click();page.locator('#package-2 [data-request-key]').click()
     elif kind=='dining':
      expect(page.locator('[data-dining-request]')).to_have_text('اطلب هذه الطاولة');assert page.locator('#dining .fd-dining-info').evaluate("e=>!!(e.compareDocumentPosition(document.querySelector('#dining .fd-dining-table')) & Node.DOCUMENT_POSITION_FOLLOWING)");assert page.locator('#dining .fd-dining-info').evaluate("e=>!!(e.compareDocumentPosition(document.querySelector('[data-dining-request]')) & Node.DOCUMENT_POSITION_FOLLOWING)");page.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click();assert page.locator('.arrangement-request').is_hidden();page.locator('[data-dining-request]').click()
     else:expect(page.locator('#cinema-session [data-request-key]')).to_have_text('اطلب هذه الجلسة');page.locator('#cinema-session [data-request-key]').click()
     f=page;send=f.locator('.arrangement-request .arrangement-send');note=f.locator('.arrangement-request .arrangement-confirmation');title=page.locator('#arrangement-request-title').inner_text()
    expect(send).to_have_text('إرسال الطلب');expect(note).to_be_visible();assert note.inner_text().startswith('تابع طلبك')
    if kind=='coordination':
     counter=f.locator('.resort-entry-selection .arrangement-quantity' if mode=='main' else '.arrangement-request-quantity .arrangement-quantity')
     counter.locator('[data-step="1"]').click();expect(f.locator('#arrangement-total')).to_have_text('700')
     counter.locator('[data-step="-1"]').click();expect(f.locator('#arrangement-total')).to_have_text('350')
    expect(f.locator('#arrangement-total')).to_have_text(str(price));observations[mode]={'title':title,'note':note.inner_text()}
    f.locator('#arrangement-name').fill('ضيف الفحص');f.locator('#arrangement-cabin').select_option('بيت الدوم 1');expect(f.locator('#arrangement-cabin-number')).to_have_text('رقم الكوخ: 15');f.locator('#arrangement-notes').fill('بدون إرسال')
    if kind=='cinema':f.locator('#cinema-time').select_option('18')
    if mode=='main':
     r=send.bounding_box();n=note.bounding_box();assert r and n and n['y']>=r['y']+r['height']-1;assert n['y']+n['height']<=height,(height,n)
    if width==390 and height==844:
     send.scroll_into_view_if_needed();folder=Path('/tmp/request-presentation-v82');folder.mkdir(exist_ok=True);page.screenshot(path=str(folder/(kind+'-'+mode+'.png')))
    send.click();expect(page.locator('#native-order-dialog' if mode=='main' else '.arrangement-request')).to_be_hidden();u=page.evaluate('opened.at(-1)');assert urlparse(u).path=='/'+'966537009217';assert ('إجمالي الطلب: '+str(price)+' ريال') in parse_qs(urlparse(u).query)['text'][0];drafts[mode]=u;page.close()
   assert observations['main']==observations['portal'],observations;assert drafts['main']==drafts['portal']
  out['profiles'].append({'width':width,'height':height,'sameRequestTitleAndConfirmation':True,'oneTotal':True,'quantityTotalUpdates':True,'sendLabel':'إرسال الطلب','confirmationBelowSend':True,'exactWhatsAppParity':True,'distinctShareDestinations':True});print(width,height,'PASS',flush=True);c.close()
 b.close()
assert not out['errors'],out;(R/'site/audits/request-presentation-v82.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

"""Verify restored standalone catalogue geometry and independent WhatsApp requests; never send."""
import json,sys,subprocess,re
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8132'
SOURCE=json.loads((R/'data/services.json').read_text());A=SOURCE['arrangements'];out={'version':'20261126-live-v83','viewports':[],'messagesSent':False,'errors':[]}
old_html=subprocess.check_output(['git','show','pre-arrangements-ordering-20261125:services-guide/index.html']).decode().replace('guide.js?v=20261125-live-v54','guide-baseline.js')
old_css=subprocess.check_output(['git','show','pre-compact-coordination-cards-20261126:services-guide/guide.css']).decode()
old_html=old_html.replace('href="guide.css?', 'href="guide-baseline.css?')
old_js=subprocess.check_output(['git','show','pre-arrangements-ordering-20261125:services-guide/guide.js']).decode()
metrics="(selector)=>[...document.querySelectorAll(selector)].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return [r.width,r.height,s.padding,s.borderRadius,s.backgroundColor,s.fontSize]})"
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in ([(int(sys.argv[2]),844)] if len(sys.argv)>2 else [(320,568),(390,844),(430,932),(390,430),(1440,900)]):
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.route('**/services-guide/?baseline=old',lambda r:r.fulfill(body=old_html,content_type='text/html'));page.route('**/services-guide/guide-baseline.js',lambda r:r.fulfill(body=old_js,content_type='text/javascript'));page.route('**/services-guide/guide-baseline.css*',lambda r:r.fulfill(body=old_css,content_type='text/css'))
  def visit(path):page.goto(BASE+path);page.locator('#guide-content.is-ready').wait_for(state='attached');page.evaluate('document.fonts.ready')
  for section in ['coordination','seating']:
   visit('/services-guide/?baseline=old#'+section);baseline=page.evaluate(metrics,'#'+section+' .seating-collapsed-summary');card_baseline=page.evaluate(metrics,'#'+section+' .package-card')
   visit('/services-guide/#'+section)
   current=page.evaluate(metrics,'#'+section+' .seating-collapsed-summary');cards=page.evaluate(metrics,'#'+section+' .package-card')
   if section=='coordination':
    assert len(current)==len(baseline)==6
    assert all(abs(a[0]-b[0])<1 and a[1]<b[1] for a,b in zip(current,baseline))
    assert all(abs(a[0]-b[0])<1 and a[1]<b[1] for a,b in zip(cards,card_baseline))
   else:assert current==baseline and cards==card_baseline
   expect(page.locator('#arrangement-dialog')).to_be_hidden();assert page.locator('#guide-content').evaluate('e=>e.parentElement.tagName')=='MAIN';assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  def request(card):
   root=page.locator('#'+card);details=root.locator('details').first
   if details.get_attribute('open') is None:details.locator('summary').first.click()
   expect(root.locator('.package-gallery img').first).to_be_visible();assert root.locator('.package-details-body').inner_text();root.locator('[data-request-key]').click();expect(page.locator('.arrangement-request')).to_be_visible();assert page.locator('#arrangement-notes').input_value()==''
  def fields():
   page.locator('#arrangement-name').fill('ضيف المراجعة');page.locator('#arrangement-cabin').select_option('البيت اليوناني 1');page.locator('#arrangement-notes').fill('مراجعة محلية فقط');assert page.locator('#arrangement-cabin-number').inner_text()=='رقم الكوخ: 10'
  def send(group,items,total):
   fields();page.locator('.arrangement-request .arrangement-send').click();expect(page.locator('.arrangement-request')).to_be_hidden();u=urlparse(page.evaluate('opened.at(-1)'));assert u.path=='/966537009217';text=parse_qs(u.query)['text'][0]
   greeting={'التنسيقات':'تنسيق','طاولات الطعام':'تجهيز طاولة طعام','الجلسات الخارجية':'جلسة خارجية'}[group]
   parts=['السلام عليكم، أرغب بطلب '+greeting+':','','الاسم: ضيف المراجعة','اسم الكوخ: البيت اليوناني 1','رقم الكوخ: 10','','الطلبات:','',group+':',*items,'','إجمالي الطلب: '+str(total)+' ريال','','ملاحظات: مراجعة محلية فقط'];assert text=='\n'.join(parts),(text,parts)
   assert not page.locator('#arrangement-shortcut').is_visible()
  visit('/services-guide/');page.locator('.guide-tile[href="#coordination"]').click();assert page.locator('body').get_attribute('data-guide-view')=='section'
  for i,pack in enumerate(A['coordination']['packages']):
   suffix=pack['id'].replace('hd-coordination-package-','');card='package-complete' if suffix=='resort' else 'package-'+suffix;request(card)
   if i==0:
    page.locator('.arrangement-request .arrangement-send').click();assert page.evaluate('opened.length')==0;page.locator('.arrangement-request [data-close-request]').click();expect(page.locator('.arrangement-request')).to_be_hidden();request(card);page.go_back();expect(page.locator('.arrangement-request')).to_be_hidden();assert page.url==BASE+'/services-guide/#coordination';request(card)
   amount=int(re.search(r'\d+',pack['price'])[0]);send('التنسيقات',[pack['name']+' × 1 = '+str(amount)+' ريال'],amount)
   page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services-guide/#coordination'}
  page.locator('#guide-back').click();page.locator('.guide-tile[href="#seating"]').click()
  for i,session in enumerate(A['seating']['sessions'],1):
   request('session-'+str(i));amount=int(re.search(r'\d+',session['price'])[0]);send('الجلسات الخارجية',[re.sub(r'\s+لـ\d+\s+(?:أشخاص|شخصًا)$','',session['name'])+' — '+(session['persons'] if session['persons'].startswith('ل') else 'لـ'+session['persons'])+' × 1 = '+str(amount)+' ريال'],amount);page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services-guide/#seating'}
  request('session-1');page.locator('.arrangement-request [data-request-extra]').check();fields();page.locator('.arrangement-request .arrangement-send').click();expect(page.locator('.arrangement-request')).to_be_hidden();msg=parse_qs(urlparse(page.evaluate('opened.at(-1)')).query)['text'][0];assert msg.startswith('السلام عليكم، أرغب بطلب جلسة خارجية:') and '\nإضافة اختيارية:\nكيك وعصير × 1 = 170 ريال' in msg and 'إجمالي الطلب: 470 ريال' in msg
  page.locator('#guide-back').click();page.locator('.guide-tile[href="#dining"]').click();page.locator('.fd-dining-option[data-size="6"][data-option="plain"]').click();expect(page.locator('.arrangement-request')).to_be_hidden();page.locator('[data-dining-request]').click();expect(page.locator('.arrangement-request')).to_be_visible();assert page.locator('.arrangement-request-quantity').is_hidden();assert page.locator('.fd-dining-option[aria-pressed="true"]').count()==1;send('طاولات الطعام',['طاولة طعام لـ6 أشخاص — تجهيز أساسي × 1 = 199 ريال'],199)
  # Refresh recalls identity only, and deep links keep the original package/session expansions.
  visit('/services-guide/#session-2');assert page.locator('#session-2 details').get_attribute('open') is not None;page.locator('#session-2 [data-request-key]').click();assert page.locator('#arrangement-name').input_value()=='ضيف المراجعة';assert page.locator('#arrangement-notes').input_value()=='';page.reload();page.locator('#guide-content.is-ready').wait_for(state='attached');expect(page.locator('.arrangement-request')).to_be_hidden();assert not page.evaluate('!!history.state?.arrangementRequest');page.locator('#session-2 [data-request-key]').click();page.locator('.arrangement-request [data-close-request]').click();expect(page.locator('.arrangement-request')).to_be_hidden()
  out['viewports'].append({'width':width,'height':height,'compactCoordinationCards':True,'originalSeatingCardGeometry':True,'fullPageBrowse':True,'packages':6,'sessions':6,'exactIndependentWhatsAppDrafts':True,'originalTextOnlyShares':True,'optionalSeatingExtra':True,'singleDiningChoice':True,'backAndCancel':True});c.close();print(width,height,'PASS',flush=True)
 b.close()
assert not out['errors'],out
(R/'site/audits/arrangements-browse-v83.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

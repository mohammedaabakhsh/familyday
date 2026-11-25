"""Compare the simplified single-page selection flow with the guest service pattern."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8112'
out={'version':'20261125-arrangements-v64','viewports':[],'errors':[],'messagesSent':False}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,844),(390,844),(768,844),(1440,900),(390,430)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.add_init_script("window.opens=[];window.open=url=>{opens.push(url);return null}")
  page.goto(BASE+'/services-guide/');page.locator('#guide-content.is-ready').wait_for(state='attached');initial_url=page.url;dialog=page.locator('#arrangement-dialog')
  def open_section(key):
   page.locator('.contents a[href="#'+key+'"]').click();expect(dialog).to_be_visible();assert page.locator('.cover').is_visible();assert page.locator('body').get_attribute('data-guide-view')=='dialog';assert page.locator('.contents').is_visible()
   assert page.locator('#'+key).is_visible()
  def done():
   page.locator('.arrangement-dialog-footer button').click();expect(dialog).not_to_be_visible();assert page.url==initial_url
  open_section('coordination')
  # Counters are accessible while photo/details accordions remain collapsed.
  assert page.locator('#package-1 details').get_attribute('open') is None
  page.locator('#package-1 [data-step="1"]').click();assert page.locator('#arrangement-total').inner_text()=='120';assert page.locator('#arrangement-dialog-status').inner_text()=='إجمالي الطلب: 120 ريال'
  assert page.locator('#package-1 details').get_attribute('open') is None
  assert page.locator('.arrangement-request,[data-order-now]').count()==0
  # Tab stays within the modal, and its footer remains visible after inner scrolling.
  for _ in range(20):page.keyboard.press('Tab');assert page.evaluate('document.getElementById("arrangement-dialog").contains(document.activeElement)')
  page.locator('#guide-content').evaluate('e=>e.scrollTop=e.scrollHeight');rect=page.locator('.arrangement-dialog-footer button').bounding_box();assert rect['y']>=0 and rect['y']+rect['height']<=height
  done();assert page.locator('#arrangement-summary').is_visible();assert page.locator('[data-remove="package-1"]').count()==1
  open_section('dining');target=page.locator('.fd-dining-option[data-size="6"][data-option="plain"]');target.click();expect(target).to_have_attribute('aria-pressed','true');expect(target).to_have_css('color','rgb(255, 255, 255)');expect(target).to_have_css('background-color','rgb(23, 97, 116)')
  contrast=target.evaluate('''e=>{const s=getComputedStyle(e),lum=c=>{let a=c.match(/\\d+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]},a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}''');assert contrast>=4.5
  page.locator('#guide-content').screenshot(path=f'/tmp/arrangements-v64/dining-{width}-{height}.png');done();assert page.locator('#arrangement-total').inner_text()=='319'
  open_section('seating');assert page.locator('#session-1 details').get_attribute('open') is None;page.locator('#session-1 [data-step="1"]').click();page.keyboard.press('Escape');expect(dialog).not_to_be_visible();assert page.url==initial_url;assert page.locator('#arrangement-total').inner_text()=='619'
  # Closing and reopening preserves choices without navigating through separate service pages.
  open_section('coordination');assert page.locator('#package-1 .arrangement-quantity output').inner_text()=='1';page.go_back();expect(dialog).not_to_be_visible();assert page.locator('#arrangement-total').inner_text()=='619';assert page.url==initial_url
  page.locator('#arrangement-name').fill('ضيف التجربة');page.locator('#arrangement-cabin').select_option('بيت الدوم 1');page.locator('#arrangement-order [type="submit"]').click();assert len(page.evaluate('opens'))==1
  assert 'wa.me/966537009217?text=' in page.evaluate('opens[0]')
  page.locator('.cover').click();page.screenshot(path=f'/tmp/arrangements-v64/home-{width}-{height}.png',full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  out['viewports'].append({'width':width,'height':height,'singlePageModalFlow':True,'alwaysVisibleCounters':True,'noPerItemWhatsApp':True,'diningContrast':round(contrast,2),'keyboardAndBack':True,'sameOrderDraft':True});print(width,height,'PASS',flush=True);c.close()
 b.close()
assert not out['errors'],out['errors'];(R/'site/audits/arrangements-flow-v64.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))

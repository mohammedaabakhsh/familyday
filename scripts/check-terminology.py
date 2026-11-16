"""Check agreed terminology and the cabin → services → cabin navigation flow."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from urllib.parse import urlparse,parse_qs
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
OUT=Path('/tmp/familyday-terminology');OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(390,844),(1440,900)]:
  page=b.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def visit(path):page.goto(BASE+path,wait_until='networkidle')
  for cabin in ['dome-1','pyramid','classic','royal','panoramic']:
   visit('/cabins/'+cabin+'/')
   content=page.locator('#mBody')
   name=page.locator('#fd-cabin-detail-title').inner_text()
   heading=content.locator('.fd-cabin-section').filter(has=page.get_by_role('heading',name='مميزات الإقامة',exact=True))
   assert 'غرفة سائق متاحة حسب التوفر' in heading.inner_text()
   assert content.locator('h3',has_text='خدمات متاحة').count()==0
   assert content.locator('h3',has_text='خدمات إضافية').count()==0
   shortcut=content.get_by_role('link',name='تصفّح خدمات المنتجع')
   assert shortcut.get_attribute('href')=='/services/'
   assert content.locator('a[href^="/services/"]').count()==1
   if cabin in ['dome-1','pyramid']:assert 'مناسب للأزواج' in content.inner_text()
   shortcut.scroll_into_view_if_needed()
   scroll=page.locator('#mBody').evaluate('e=>e.scrollTop')
   shortcut.click();page.wait_for_url(BASE+'/services/')
   assert page.locator('#services-overlay').is_visible()
   assert page.locator('.svcs-back').get_attribute('aria-label')=='العودة إلى تفاصيل الكوخ'
   assert not page.locator('#services-overlay').evaluate('e=>!!e.closest("[inert]")')
   assert page.locator('.svcs-card[href="/services/cinema/"] .svcs-name').inner_text()=='جلسة السينما'
   # Modified clicks remain native links; normal Back returns to the exact caller.
   page.locator('.svcs-back').click();page.wait_for_url(BASE+'/cabins/'+cabin+'/')
   assert page.locator('#fd-cabin-detail-title').inner_text()==name
   assert abs(page.locator('#mBody').evaluate('e=>e.scrollTop')-scroll)<2
   shortcut.click();page.wait_for_url(BASE+'/services/')
   page.reload(wait_until='networkidle')
   assert page.evaluate('history.state.route.parent.name')=='cabin'
   page.go_back(wait_until='networkidle');page.wait_for_url(BASE+'/cabins/'+cabin+'/')
   assert page.locator('#fd-cabin-detail-title').inner_text()==name
  # Service selection and checkout keep the cabin as the final return destination.
  page.locator('.fd-cabin-services-link').click();page.wait_for_url(BASE+'/services/')
  page.locator('.svcs-card[href="/services/cinema/"]').click();page.wait_for_url('**/services/cinema/')
  assert page.locator('#setups-title').inner_text()=='جلسة السينما'
  page.locator('.setups-back').click();page.wait_for_url(BASE+'/services/')
  page.locator('button[onclick="openMenuDetail()"]').click();page.wait_for_url(BASE+'/menu/')
  page.locator('#menu-items button[aria-label="إضافة ساندويتش دجاج زنجر"]').click()
  page.locator('.menu-cart-trigger').click();page.locator('button[onclick="continueMenuOrder()"]').click()
  page.locator('#order-name').fill('تجربة محلية');page.locator('#order-villa').select_option(label='البيت البانورامي')
  page.evaluate('window.open=url=>{window.capturedURL=url;return null}')
  page.locator('button[onclick="sendOrderWhatsapp()"]').click()
  link=urlparse(page.evaluate('window.capturedURL'))
  assert link.path=='/966537006531'
  assert 'ساندويتش دجاج زنجر' in parse_qs(link.query)['text'][0]
  page.wait_for_selector('#order-popup',state='hidden')
  page.locator('.menu-back').click();page.wait_for_url(BASE+'/services/')
  page.locator('.svcs-back').click();page.wait_for_url(BASE+'/cabins/panoramic/')
  page.locator('.fd-cabin-services-link').scroll_into_view_if_needed()
  page.wait_for_function('getComputedStyle(document.getElementById("services-overlay")).display==="none"')
  page.screenshot(path=str(OUT/f'cabin-{width}.png'))
  # Verify public map naming and return context after visiting services.
  visit('/resort-map/#map=10')
  assert page.locator('#fd-map-title').inner_text()=='خريطة الأكواخ التفاعلية'
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  page.locator('.fd-map-details-button:not(.fd-map-tour-button)').click();page.wait_for_url('**/cabins/panoramic/?from=map')
  page.locator('.fd-cabin-services-link').click();page.wait_for_url('**/services/')
  page.locator('.svcs-back').click();page.wait_for_url('**/cabins/panoramic/?from=map')
  page.locator('.fd-cabin-nav-back').click();page.wait_for_url('**/resort-map/#map=10')
  assert page.locator('[data-location-key="panoramic"]').get_attribute('aria-pressed')=='true'
  # Labels are updated at their sources; route identity and destinations remain intact.
  visit('/resort/faq/')
  assert 'منسّق المناسبات' in page.locator('#faq-overlay').text_content()
  assert 'منسق التنسيقات' not in page.locator('#faq-overlay').text_content()
  for path,place in [('/resort/contact/','جدة — خليج سلمان'),('/stay/contact/','جدة — خليج سلمان'),('/chalet/contact/','جدة — حي المروج')]:
   visit(path);assert page.locator('.cp-map-sub:visible').inner_text()==place
  for path,place in [('/guest-services/','جدة — خليج سلمان'),('/chalet/guest-services/','جدة — حي المروج'),('/services-guide/','جدة — خليج سلمان')]:
   visit(path);assert place in page.locator('body').inner_text()
  visit('/panoramic-tour/?from=map')
  assert page.locator('.tour-back').get_attribute('aria-label')=='خريطة الأكواخ التفاعلية'
  assert not errors,errors
  print(width,'PASS agreed copy, cabin shortcut/reload/Back/map return, checkout and public locations',flush=True)
  page.close()
 b.close()

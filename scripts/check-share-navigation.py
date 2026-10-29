"""Check sharing navigation, reloads and map return. Requires Python Playwright/Chromium."""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8015'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(1440,1000),(390,844)]:
  page=b.new_page(viewport={'width':width,'height':height});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/services/',wait_until='networkidle')
  for fn,path,close in [('openMenuDetail','/menu/','closeMenuDetail'),('showSinema','/services/setups/','closeSinemaDetail'),('showMaiya','/services/water-games/','closeMaiyaDetail'),('showTansidat','/services/hospitality/','closeHospitalityDetail'),('showJalsat','/services/setups/?tab=seating','closeJalsatDetail'),('showTawilat','/services/setups/?tab=dining','closeTawilatDetail'),('showTarfihi','/services/games/','closeTarfihiDetail')]:
   page.evaluate(fn+'()');page.wait_for_url('**'+path)
   title=page.title();page.reload(wait_until='networkidle')
   assert page.title()==title
   page.evaluate(close+'()');page.wait_for_url('**/services/')
   assert page.title()=='خدمات المنتجع | يوم العائلة'
  page.evaluate('openMenuDetail()');page.wait_for_url('**/menu/')
  page.locator('#menu-cats button').nth(1).click()
  page.locator('#menu-items button[aria-label^="إضافة"]').first.click()
  page.locator('.menu-cart-trigger').click()
  assert page.title()=='منيو المطعم | يوم العائلة'
  page.go_back(wait_until='networkidle')
  assert page.locator('#menu-cart-review').is_hidden()
  assert page.locator('#menu-cart-bar').is_visible()
  page.evaluate('closeMenuDetail()');page.wait_for_url('**/services/')
  page.go_back(wait_until='networkidle');page.go_forward(wait_until='networkidle')
  page.goto(BASE+'/resort/faq/',wait_until='networkidle')
  page.evaluate('closeFaq()');page.wait_for_url('**/resort/')
  assert page.title()=='منتجع يوم العائلة'
  # Preserve selected map cabin through details, reload, browser Back, and tour Back.
  page.goto(BASE+'/resort-map/#map=10',wait_until='networkidle')
  page.locator('.fd-map-details-button:not(.fd-map-tour-button)').click()
  page.wait_for_url('**/cabins/panoramic/?from=map')
  assert page.title()=='البيت البانورامي | يوم العائلة'
  assert page.evaluate('cabinShareURL(10)')==BASE+'/cabins/panoramic/'
  page.reload(wait_until='networkidle')
  assert page.evaluate('history.state.route.parent.name')=='map'
  page.evaluate('closeM()')
  page.wait_for_url('**/resort-map/#map=10')
  assert page.locator('[data-location-key=panoramic]').get_attribute('aria-pressed')=='true'
  page.locator('.fd-map-tour-button').click()
  page.wait_for_selector('.tour-back');page.locator('.tour-back').click()
  page.wait_for_selector('#fd-map-dialog[open]')
  assert page.locator('[data-location-key=panoramic]').get_attribute('aria-pressed')=='true'
  # Copies and WhatsApp links share the cabin's canonical URL, not the map context.
  page.goto(BASE+'/cabins/greek-2/?fbclid=test',wait_until='networkidle')
  assert 'fbclid' not in page.url
  link=page.locator('#fd-cabin-sharing a').get_attribute('href')
  from urllib.parse import unquote
  assert BASE+'/cabins/greek-2/' in unquote(link)
  assert not errors,errors
  page.screenshot(path=f'/tmp/share-navigation-{width}.png')
  print(width,'PASS service entry/reload/Back, cart, FAQ, map/details/tour return, cabin sharing',flush=True)
  page.close()
 b.close()

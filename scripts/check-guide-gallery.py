"""Keep open package photos within a section; reset on collapse or section departure."""
from playwright.sync_api import sync_playwright,expect
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=b.new_page(viewport={'width':width,'height':844},reduced_motion='reduce' if width!=390 else 'no-preference')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for path,selector in [('/services/coordination/','#hd-coordination-panel .hd-package:has(.package-gallery)'),('/services-guide/#coordination','#coordination .seating-collapsed-card:has(.package-gallery)')]:
   page.goto(BASE+path,wait_until='networkidle')
   cards=page.locator(selector);assert cards.count()==5
   first=cards.nth(1);second=cards.nth(2)
   first.locator('summary').click()
   gallery=first.locator('.package-gallery');track=gallery.locator('.gallery-track');count=gallery.locator('.gallery-count')
   def expect_first():
    expect(count).to_have_text('1 / 5')
    expect(gallery.locator('.gallery-previous')).to_be_disabled()
    expect(gallery.locator('.gallery-next')).to_be_enabled()
    page.wait_for_function('e=>Math.abs(e.scrollLeft)<1',arg=track.element_handle())
   def last_photo():
    track.focus();page.keyboard.press('End');expect(count).to_have_text('5 / 5')
    expect(gallery.locator('.gallery-next')).to_be_disabled()
   # Arrows remain usable throughout the same visit.
   for i in range(2,6):
    gallery.locator('.gallery-next').click();expect(count).to_have_text(f'{i} / 5')
   first.locator('summary').click();first.locator('summary').click();expect_first()
   last_photo()
   second.locator('summary').click()
   assert first.locator('details').evaluate('e=>e.open') and second.locator('details').evaluate('e=>e.open')
   expect(count).to_have_text('5 / 5')
   other=second.locator('.gallery-track');other.focus();page.keyboard.press('End')
   expect(second.locator('.gallery-count')).to_have_text('5 / 5')
   track.focus();expect(count).to_have_text('5 / 5')
   expect(second.locator('.gallery-count')).to_have_text('5 / 5')
   # Scrolling and focusing another open card must preserve both positions.
   second.evaluate('e=>e.scrollIntoView({block:"start",behavior:"instant"})')
   page.wait_for_timeout(150)
   expect(count).to_have_text('5 / 5')
   track.scroll_into_view_if_needed();expect(count).to_have_text('5 / 5')
   # Closing one card resets only that card; another open card is untouched.
   first.locator('summary').click();expect(count).to_have_text('1 / 5')
   expect(second.locator('.gallery-count')).to_have_text('5 / 5')
   first.locator('summary').click();track.scroll_into_view_if_needed();expect_first()
   # Native track scrolling (used by touch swiping) updates the counter normally.
   track.evaluate('e=>e.scrollTo({left:-2*e.clientWidth,behavior:"instant"})')
   expect(count).to_have_text('3 / 5')
   if 'services-guide' in path:
    page.locator('#guide-back').click();page.locator('.contents a[href="#coordination"]').click()
   else:
    page.locator('#hd-tab-hospitality').click();page.locator('#hd-tab-coordination').click()
   track.scroll_into_view_if_needed();expect_first()
   expect(second.locator('.gallery-count')).to_have_text('1 / 5')
   assert first.locator('details').evaluate('e=>e.open') and second.locator('details').evaluate('e=>e.open')
   last_photo()
   if 'services-guide' in path:
    # An anchor within the same section does not count as leaving it.
    page.evaluate("location.hash='package-complete'")
    page.wait_for_timeout(150)
    expect(count).to_have_text('5 / 5')
    page.go_back();track.scroll_into_view_if_needed()
    expect(count).to_have_text('5 / 5')
    page.locator('#guide-back').click()
    page.wait_for_url('**/#contents')
    page.go_forward()
   else:
    page.evaluate('closeHospitalityDetail()')
    page.wait_for_url('**/services/')
    page.evaluate("showTansidat('coordination')")
    page.wait_for_url('**/services/coordination/')
   track.scroll_into_view_if_needed();expect_first()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  print(width,'PASS main/guide arrows, keyboard, scroll/focus preservation, independent closing and section/Back resets; multiple packages stay open',flush=True)
  page.close()
 b.close()

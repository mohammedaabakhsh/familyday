"""Shared galleries restart on return while retaining normal browsing within a package."""
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
    assert abs(track.evaluate('e=>e.scrollLeft'))<1
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
   expect(count).to_have_text('1 / 5')
   other=second.locator('.gallery-track');other.focus();page.keyboard.press('End')
   expect(second.locator('.gallery-count')).to_have_text('5 / 5')
   track.focus();expect_first()
   expect(second.locator('.gallery-count')).to_have_text('1 / 5')
   gallery.locator('.gallery-next').click();expect(count).to_have_text('2 / 5')
   gallery.locator('.gallery-next').click();expect(count).to_have_text('3 / 5')
   # Returning by scrolling alone also starts on the first photo.
   last_photo()
   second.evaluate('e=>e.scrollIntoView({block:"start",behavior:"instant"})')
   expect(count).to_have_text('1 / 5')
   track.scroll_into_view_if_needed();expect_first()
   # Native track scrolling (used by touch swiping) updates the counter normally.
   track.evaluate('e=>e.scrollTo({left:-2*e.clientWidth,behavior:"instant"})')
   expect(count).to_have_text('3 / 5')
   if 'services-guide' in path:
    page.locator('#guide-back').click();page.locator('.contents a[href="#coordination"]').click()
   else:
    page.locator('#hd-tab-hospitality').click();page.locator('#hd-tab-coordination').click()
   track.scroll_into_view_if_needed();expect_first()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  print(width,'PASS main/guide arrows, keyboard, scrolling, reopening, package switching and section return; multiple packages stay open',flush=True)
  page.close()
 b.close()

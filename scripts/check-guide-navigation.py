"""Guide section pages: history, direct links, focus, sharing, print and gallery state."""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(1440,1000)]:
        page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE+'/services-guide/#contents',wait_until='networkidle')
        page.wait_for_selector('#guide-content.is-ready',state='attached')
        assert page.locator('.guide-section:visible').count()==0
        assert page.locator('.contents a').count()==3
        for tile in page.locator('.contents a').all():
            tile.scroll_into_view_if_needed()
            home_y=page.evaluate('scrollY');target=tile.get_attribute('href')
            tile.click();page.wait_for_selector(target+':visible')
            assert page.locator('.guide-section:visible').count()==1
            assert not page.locator('.cover').is_visible()
            assert not page.locator('.contents').is_visible()
            assert not page.locator('.footer').is_visible()
            assert page.locator(target+' h2').evaluate('e=>e===document.activeElement')
            assert page.evaluate('scrollY')==0
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
            page.locator('#guide-back').click();page.wait_for_selector('.contents:visible')
            page.wait_for_function('(y)=>Math.abs(scrollY-y)<2',arg=home_y)
            assert tile.evaluate('e=>e===document.activeElement')
            page.go_forward();page.wait_for_selector(target+':visible')
            page.go_back();page.wait_for_selector('.contents:visible')
        page.locator('.contents a[href="#coordination"]').click()
        page.locator('#coordination .seating-collapsed-summary').first.click()
        gallery=page.locator('#coordination .package-gallery').first
        photo_count=gallery.locator('img').count()
        gallery.locator('.gallery-next').click()
        page.wait_for_function('(count)=>document.querySelector("#coordination .gallery-count").textContent==="2 / "+count',arg=photo_count)
        page.locator('#guide-back').click();page.wait_for_selector('.contents:visible')
        page.locator('.contents a[href="#coordination"]').click()
        page.wait_for_timeout(150)
        assert gallery.locator('.gallery-count').inner_text()==f'1 / {photo_count}'
        assert abs(gallery.locator('.gallery-track').evaluate('e=>e.scrollLeft'))<1
        page.goto(BASE+'/services-guide/#dining',wait_until='networkidle')
        page.wait_for_selector('#dining:visible')
        page.reload(wait_until='networkidle');page.wait_for_selector('#dining:visible')
        page.locator('#guide-back').click();page.wait_for_selector('.contents:visible')
        assert page.url.endswith('#contents')
        page.locator('.contents a[href="#seating"]').focus();page.keyboard.press('Enter')
        page.wait_for_selector('#seating:visible')
        page.emulate_media(media='print')
        assert page.locator('.guide-section:visible').count()==3
        assert page.locator('.cover').is_visible()
        assert all(e.is_visible() for e in page.locator('.package-details-body').all())
        assert page.locator('#hospitality,#cinema').count()==0
        page.emulate_media(media='screen')
        page.screenshot(path=f'/tmp/guide-pages-seating-{width}.png')
        page.locator('#guide-back').click();page.wait_for_selector('.contents:visible')
        page.locator('#contents').scroll_into_view_if_needed()
        page.screenshot(path=f'/tmp/guide-pages-home-{width}.png')
        assert not errors,errors
        print(width,'PASS section pages, browser history, restored scroll/focus, deep-link refresh, gallery state and complete print',flush=True)
        page.close()
    page=browser.new_page()
    page.route('**/index.html',lambda route:route.fulfill(status=503,body='unavailable'))
    page.goto(BASE+'/services-guide/#dining',wait_until='networkidle')
    assert page.locator('#retry-guide').is_visible()
    assert not page.locator('.cover').is_visible()
    page.unroute('**/index.html');page.locator('#retry-guide').click()
    page.wait_for_selector('#dining:visible')
    assert page.locator('.guide-section:visible').count()==1
    print('PASS direct section load failure and retry keep the correct page',flush=True)
    browser.close()

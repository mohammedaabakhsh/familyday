"""Check the chalet tour's return destination and retained detail state."""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8051'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 1440]:
        page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + '/chalet/details/', wait_until='networkidle')
        page.locator('.fd-dome-next').click()
        page.wait_for_function('document.querySelector(".fd-dome-count").textContent.startsWith("2")')
        link = page.locator('#ov .fd-chalet-map-open')
        link.scroll_into_view_if_needed()
        before = page.locator('#mBody').evaluate('e=>e.scrollTop')
        link.click()
        page.locator('#fd-chalet-map').wait_for(state='visible')
        assert 'from=chalet-details' in page.url
        page.locator('.cm-marker[data-room="upper"]').click()
        assert page.locator('.cm-detail-heading h3').inner_text() == 'غرفة النوم الرئيسية'
        assert page.locator('.cm-detail-heading p').inner_text() == 'الدور العلوي'
        assert page.locator('.cm-detail-heading p').is_visible()
        page.locator('.cm-close').click()
        page.locator('#fd-chalet-map').wait_for(state='hidden')
        assert page.url.endswith('/chalet/details/')
        assert page.locator('.fd-dome-count').inner_text().startswith('2')
        assert abs(page.locator('#mBody').evaluate('e=>e.scrollTop') - before) < 2
        link.click()
        page.go_back()
        page.locator('#fd-chalet-map').wait_for(state='hidden')
        assert page.locator('#fd-chalet-detail-title').is_visible()
        # Direct entry and reload also retain a usable details parent.
        page.goto(BASE + '/chalet-map/?from=chalet-details', wait_until='networkidle')
        page.locator('#fd-chalet-map').wait_for(state='visible')
        page.reload(wait_until='networkidle')
        page.locator('.cm-close').click()
        page.locator('#fd-chalet-map').wait_for(state='hidden')
        assert page.url.endswith('/chalet/details/')
        page.locator('.fd-cabin-nav-back').click()
        page.locator('#landing3').wait_for(state='visible')
        page.locator('#landing3 .fd-chalet-map-open').first.click()
        page.locator('#fd-chalet-map').wait_for(state='visible')
        assert 'from=' not in page.url
        page.keyboard.press('Escape')
        page.locator('#fd-chalet-map').wait_for(state='hidden')
        page.locator('#landing3').wait_for(state='visible')
        assert not errors, errors
        print(width, 'PASS tour return, photo/scroll preservation, direct entry, reload and home return', flush=True)
        page.close()
    browser.close()

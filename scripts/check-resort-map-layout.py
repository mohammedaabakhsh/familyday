"""Check map label spacing, selection, fixed short-screen layout and return navigation."""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8051'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320, 568), (390, 844), (430, 932), (844, 390), (1440, 1000)]:
        context = browser.new_context(viewport={'width': width, 'height': height}, has_touch=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + '/resort-map/', wait_until='networkidle')
        dialog = page.locator('#fd-map-dialog')
        page.wait_for_selector('#fd-map-dialog[open]')
        assert not page.locator('.fd-map-panel').is_visible()
        assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth')
        keys = page.locator('.fd-map-hotspot').evaluate_all('(els)=>els.map(e=>e.dataset.locationKey)')
        for key in keys:
            marker = page.locator('[data-location-key="' + key + '"]')
            marker.locator('span').tap()
            assert marker.get_attribute('aria-pressed') == 'true', (width, key)
            assert page.locator('.fd-map-card h3').inner_text()
            boxes = [page.locator('[data-location-key="' + k + '"] span').bounding_box()
                     for k in ['greek-one', 'greek-two', 'palm-beach']]
            assert all(b['y'] - (a['y'] + a['height']) >= 7 for a, b in zip(boxes, boxes[1:])), (width, boxes)
            workspace = page.locator('.fd-map-workspace')
            if width < 820:
                assert page.locator('.fd-map-info').evaluate('e=>e.scrollHeight<=e.clientHeight+1')
                assert workspace.evaluate('e=>e.scrollHeight<=e.clientHeight+1'), (width, key)
                workspace.evaluate('e=>e.scrollTop=100')
                assert workspace.evaluate('e=>e.scrollTop') == 0
                tour = page.locator('.fd-map-tour-button').bounding_box()
                assert tour['y'] + tour['height'] <= height, (width, key, tour)
                workspace.evaluate('e=>e.scrollTop=0')
            page.locator('.fd-map-clear').click()
            assert not page.locator('.fd-map-panel').is_visible()
        page.locator('[data-location-key="dome-lower"] span').tap()
        page.locator('.fd-map-details-button').first.click()
        assert '/cabins/dome-1/' in page.url
        page.go_back(wait_until='networkidle')
        assert dialog.evaluate('e=>e.open')
        assert page.locator('[data-location-key="dome-lower"]').get_attribute('aria-pressed') == 'true'
        viewport = page.locator('.fd-map-viewport')
        viewport.focus()
        viewport.press('+')
        assert page.locator('.fd-map-fit').is_visible()
        page.locator('.fd-map-fit').click()
        assert not page.locator('.fd-map-fit').is_visible()
        assert not errors, errors
        print(width, height, 'PASS all labels, readable details, return and zoom reset', flush=True)
        context.close()
    browser.close()

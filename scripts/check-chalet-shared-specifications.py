"""Verify chalet shared facts propagate without changing view-specific details."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8051'
source = (Path(__file__).resolve().parents[1] / 'chalet-design.js').read_text()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, fixture in [(320, False), (390, False), (1440, False), (390, True)]:
        page = browser.new_page(viewport={'width': width, 'height': 740}, reduced_motion='reduce')
        if fixture:
            # Change only the shared fact declaration in a browser-only response.
            edited = source.replace("'يتسع لـ10 أشخاص'", "'يتسع لـ11 شخصًا'").replace("'حمام خاص بالمجلس المستقل'", "'حمام خاص بالمجلس المستقل — تحقق'")
            page.route('**/chalet-design.js*', lambda route: route.fulfill(body=edited, content_type='application/javascript'))
        capacity = 'يتسع لـ11 شخصًا' if fixture else 'يتسع لـ10 أشخاص'
        bathroom = 'حمام خاص بالمجلس المستقل' + (' — تحقق' if fixture else '')
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE + '/chalet/details/', wait_until='networkidle')
        details = page.locator('#mBody').inner_text()
        assert capacity in details and bathroom in details
        assert 'إطلالة' not in details and '8 أشخاص' not in details
        kitchen = page.locator('.fd-cabin-section').filter(has=page.locator('h3', has_text='تجهيزات المطبخ')).locator('.fd-cabin-feature').all_text_contents()
        assert kitchen == ['موقد كهربائي', 'موقد غاز', 'فرن', 'ميكروويف', 'ثلاجة', 'غلاية', 'أدوات مطبخ أساسية']
        page.locator('#ov .fd-chalet-map-open').click()
        for key, expected in [('living', 'تتسع لـ15 شخصًا'), ('majlis', capacity)]:
            page.locator('.cm-marker[data-room="' + key + '"]').click()
            assert page.locator('.cm-card span').count() == 0
            assert page.locator('.cm-card strong').first.inner_text() == expected
        assert bathroom in page.locator('.cm-details').inner_text()
        for key in ['upper', 'living', 'majlis']:
            page.locator('.cm-marker[data-room="' + key + '"]').click()
            assert 'تلفزيون ذكي' in page.locator('.cm-details').inner_text()
        page.locator('.cm-marker[data-room="kitchen"]').click()
        assert page.locator('.cm-card strong').all_text_contents() == kitchen
        assert page.locator('.cm-card svg path').first.get_attribute('d') == page.locator('.cm-card svg path').nth(1).get_attribute('d')
        nav = page.locator('.cm-spec-navigation:visible')
        if nav.count():
            next_button = nav.locator('[data-spec-direction=next]')
            for _ in range(10):
                if next_button.is_disabled(): break
                next_button.click()
                page.wait_for_timeout(80)
            assert next_button.is_disabled()
            last = page.locator('.cm-card').last.bounding_box()
            strip = page.locator('.cm-cards').bounding_box()
            assert last['x'] >= strip['x'] - 1
        assert page.locator('.cm-details').evaluate('e=>e.scrollHeight<=e.clientHeight+1')
        page.locator('.cm-close').click()
        page.locator('.fd-cabin-faq-link').click()
        page.locator('#chalet-faq .fd-faq-shortcuts button').nth(1).click()
        page.locator('#chalet-faq summary', has_text='ما الصالات والمجالس').click()
        answer = page.locator('#chalet-faq details[open]').inner_text()
        assert capacity in answer and bathroom in answer
        page.locator('#chalet-faq summary', has_text='ما تجهيزات المطبخ').click()
        answer = page.locator('#chalet-faq details[open]').inner_text()
        for word in ['موقدًا كهربائيًا', 'موقد غاز', 'فرنًا', 'ميكروويف', 'ثلاجة', 'غلاية', 'أدوات مطبخ أساسية']:
            assert word in answer
        assert not errors, errors
        print(width, 'shared-source fixture' if fixture else 'approved content', 'PASS map/details/FAQ, icons, navigation and exclusions', flush=True)
        page.close()
    browser.close()

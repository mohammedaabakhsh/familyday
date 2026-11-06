"""Check the water-game bundle and prepared WhatsApp messages without sending."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import os
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8028'
FONT = Path(os.environ.get('FD_TEST_FONT_CSS', '/nonexistent-font.css'))
OUT = Path(os.environ.get('FD_WATER_SCREENSHOTS', '/tmp/familyday-water-games'))
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320,568),(360,640),(390,844),(430,932),(768,900),(1440,900)]:
        context = browser.new_context(viewport={'width':width, 'height':height})
        if FONT.exists():
            context.route('https://fonts.googleapis.com/**', lambda r:r.fulfill(path=str(FONT),content_type='text/css'))
        page = context.new_page()
        errors, image_requests = [], []
        page.on('pageerror', lambda e:errors.append(str(e)))
        page.on('request', lambda r:image_requests.append(r.url) if 'maiya_' in r.url else None)
        page.goto(BASE + '/services/water-games/', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        panel = page.locator('#maiya-detail')
        assert panel.is_visible()
        assert panel.locator('img').count() == 0
        assert not panel.evaluate('(el)=>el.scrollWidth>el.clientWidth')
        if width < 600:
            if height >= 640:
                assert panel.evaluate('(el)=>el.scrollHeight<=el.clientHeight+1'), (width, panel.evaluate('(el)=>[el.scrollHeight,el.clientHeight]'))
            order_box = panel.locator('.wm-order').bounding_box()
            notes_box = panel.locator('.wm-notes').bounding_box()
            assert 12 <= order_box['y']-notes_box['y']-notes_box['height'] <= 22
            count_box = panel.locator('.wm-selection-count').bounding_box()
            category_box = panel.locator('.wm-category').first.bounding_box()
            assert count_box['y']+count_box['height'] <= category_box['y']
        title, back = panel.locator('.wm-title').bounding_box(), panel.locator('.wm-back').bounding_box()
        assert abs(back['x']-(title['x']+title['width'])-8) <= 1
        assert 'حسب التوفر' not in panel.inner_text()
        assert 'حسب المتوفر' not in panel.inner_text()
        assert panel.locator('#maiya-order-btn').inner_text() == 'متابعة الطلب'
        for button in panel.locator('.wm-quantity button').all():
            box=button.bounding_box()
            assert box['width']>=44 and box['height']>=44
        assert page.locator('#maiya-order-btn').is_disabled()
        page.evaluate('maiyaOrderNow()')
        assert not page.locator('#order-popup').is_visible()
        for group in ['adults','children']:
            assert page.locator(f'[data-water-group="{group}"][data-step="-1"]').is_disabled()
        for adults in range(4):
            # Remove the previous selection using the real controls.
            for group in ['adults','children']:
                minus = page.locator(f'[data-water-group="{group}"][data-step="-1"]')
                while minus.is_enabled():
                    minus.click()
            for group, quantity in [('adults', adults), ('children', 3-adults)]:
                plus = page.locator(f'[data-water-group="{group}"][data-step="1"]')
                for _ in range(quantity):
                    plus.click()
            assert page.locator('#wm-adults').inner_text() == str(adults)
            assert page.locator('#wm-children').inner_text() == str(3-adults)
            assert page.locator('[data-water-group][data-step="1"]:disabled').count() == 2
            # Even a direct call cannot add a fourth game or subtract below zero.
            page.evaluate("changeMaiyaQuantity('adults',1);changeMaiyaQuantity('children',1)")
            assert page.locator('#wm-adults').inner_text() == str(adults)
            assert page.locator('#wm-children').inner_text() == str(3-adults)
            page.locator('#maiya-order-btn').click()
            assert page.locator('#order-popup').is_visible()
            assert not page.locator('#order-time-wrap').is_visible()
            assert page.locator('#order-villa option[value="not-booked"]').count() == 0
            assert page.locator('#order-item-name>div').all_text_contents() == [
                'باقة ألعاب مائية', '3 ألعاب بـ50 ريال', f'للكبار: {adults}', f'للصغار: {3-adults}']
            assert page.locator('.fd-order-help').inner_text() == 'تابع طلبك عبر واتساب'
            assert page.locator('#order-notes').get_attribute('placeholder') == 'مثل أعمار الأطفال أو أي تفاصيل تساعدنا في تجهيز طلبك'
            page.evaluate('window.open=(url)=>{window.capturedURL=url;return null}')
            page.locator('#order-name').fill('')
            page.locator('#order-villa').select_option('')
            page.evaluate('window.capturedURL=null')
            page.locator('button[onclick="sendOrderWhatsapp()"]').click()
            assert page.evaluate('window.capturedURL') is None
            page.locator('#order-name').fill('ضيف التجربة')
            page.locator('#order-villa').select_option(label='بيت الدوم 1')
            note='أعمار الأطفال 5 و7 سنوات' if adults==1 else ''
            page.locator('#order-notes').fill(note)
            if adults==1:
                page.evaluate('closeOrderPopup()')
                page.locator('#maiya-order-btn').click()
                assert page.locator('#order-notes').input_value()==note
                page.reload(wait_until='networkidle')
                assert page.locator('#order-popup').is_visible()
                assert page.locator('#order-item-name>div').all_text_contents()[-2:] == ['للكبار: 1','للصغار: 2']
                page.locator('#order-name').fill('ضيف التجربة')
                page.locator('#order-villa').select_option(label='بيت الدوم 1')
                page.locator('#order-notes').fill(note)
                page.screenshot(path=str(OUT / f'water-checkout-{width}.png'),full_page=True)
            page.evaluate('window.open=(url)=>{window.capturedURL=url;return null}')
            page.locator('button[onclick="sendOrderWhatsapp()"]').click()
            url = urlparse(page.evaluate('window.capturedURL'))
            assert url.path == '/966556156693'
            text = parse_qs(url.query)['text'][0]
            expected = ('السلام عليكم، أرغب بطلب باقة ألعاب مائية.\n\n'
                        'الاسم: ضيف التجربة\nالكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\n'
                        f'عدد ألعاب الكبار: {adults}\nعدد ألعاب الصغار: {3-adults}\n'
                        'الإجمالي: 3 ألعاب بـ50 ريال')
            if note: expected+='\n\nملاحظات: '+note
            assert text==expected, text
            # Returning from checkout must retain the chosen distribution.
            if page.locator('#order-popup').is_visible():
                page.evaluate('closeOrderPopup()')
            assert panel.is_visible()
            assert page.locator('#wm-adults').inner_text() == str(adults)
        page.locator('[data-water-group="adults"][data-step="-1"]').click()
        assert page.locator('#maiya-order-btn').is_disabled()
        page.locator('[data-water-group="children"][data-step="1"]').click()
        page.locator('#maiya-detail').evaluate('(el)=>el.scrollTop=0')
        page.screenshot(path=str(OUT / f'water-games-{width}.png'),full_page=True)
        assert not errors, errors
        assert not image_requests, image_requests
        print(width, 'PASS all bundle distributions, limits, checkout and WhatsApp',flush=True)
        context.close()
    browser.close()

"""Check guest extras, WhatsApp routing and service return without sending messages."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import os
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8025'
FONT = Path(os.environ.get('FD_TEST_FONT_CSS', '/nonexistent-font.css'))
OUT = Path(os.environ.get('FD_GUEST_SCREENSHOTS', '/tmp/familyday-guest-services'))
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 768, 1440]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        if FONT.exists():
            context.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(path=str(FONT), content_type='text/css'))
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE + '/guest-services/', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        assert page.locator('.service-card').count() == 4
        assert page.locator('[data-extra]').count() == 5
        assert page.locator('.extra-price').all_text_contents() == ['20 ر.س', '20 ر.س', '15 ر.س', '25 ر.س', '30 ر.س']
        assert 'سنضيف بقية' not in page.locator('body').inner_text()
        assert 'خدمة إضافية' not in page.locator('body').inner_text()
        assert page.locator('.send-order').is_disabled()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        for button in page.locator('.quantity button').all():
            box = button.bounding_box()
            assert box['width'] >= 44 and box['height'] >= 44
        page.screenshot(path=str(OUT / f'guest-empty-{width}.png'), full_page=True)

        robe = page.locator('[data-extra="robe"]')
        robe.locator('[data-step="1"]').click(click_count=2)
        page.locator('[data-extra="incense"] [data-step="1"]').click()
        assert page.locator('#order-total').inner_text() == '60'
        page.evaluate('window.open=(url)=>{window.capturedGuestURL=url;return null}')
        page.locator('.send-order').click()
        assert page.evaluate('window.capturedGuestURL') is None
        assert page.locator('#guest-name').evaluate('(e)=>!e.validity.valid')
        page.locator('#guest-name').fill('   ')
        page.locator('.send-order').click()
        assert page.evaluate('window.capturedGuestURL') is None
        page.locator('#guest-name').fill('ضيف الاختبار')
        page.locator('.send-order').click()
        assert page.evaluate('window.capturedGuestURL') is None
        assert page.locator('#guest-cabin').evaluate('(e)=>!e.validity.valid')
        expected_cabins = {'البيت اليوناني 1':10,'البيت اليوناني 2':11,'كوخ بالم بيتش':12,
                           'الكوخ الفرنسي':13,'الكوخ الريفي':14,'بيت الدوم 1':15,'بيت الدوم 2':16,
                           'الكوخ الهرمي':17,'الكوخ الكلاسيكي':18,'كوخ رويال':19,
                           'الكوخ البوهيمي':20,'البيت البانورامي':21}
        assert page.locator('#guest-cabin option').count() == 13
        for cabin_name, number in expected_cabins.items():
            page.locator('#guest-cabin').select_option(label=cabin_name)
            assert page.locator('#cabin-number').inner_text() == str(number)
        page.locator('#guest-cabin').select_option('')
        assert not page.locator('#cabin-number-row').is_visible()
        page.locator('#guest-cabin').select_option(label='بيت الدوم 1')
        page.locator('.send-order').click()
        url = urlparse(page.evaluate('window.capturedGuestURL'))
        assert url.netloc == 'wa.me' and url.path == '/966556156693'
        message = parse_qs(url.query)['text'][0]
        for text in ['الاسم: ضيف الاختبار', 'الكوخ: بيت الدوم 1 (رقم 15)', 'روب ومناشف لشخص واحد × 2 — 40 ر.س', 'بخور × 1 — 20 ر.س', 'الإجمالي: 60 ر.س', 'يرجى تأكيد التوفر والطلب.']:
            assert text in message, message
        assert 'سرير إضافي' not in message
        page.reload(wait_until='networkidle')
        assert page.locator('#order-total').inner_text() == '60'
        assert page.locator('#cabin-number').inner_text() == '15'
        assert page.locator('#guest-name').input_value() == 'ضيف الاختبار'
        assert page.locator('#guest-cabin').input_value() == 'بيت الدوم 1'
        page.screenshot(path=str(OUT / f'guest-selected-{width}.png'), full_page=True)

        # Every service returns here through its own Back button, including cinema.
        for path, back in [('/menu/', '#menu-detail .menu-back'),
                           ('/services/cinema/', '.setups-back'),
                           ('/services/water-games/', '#maiya-detail button[onclick="closeMaiyaDetail()"]'),
                           ('/services/games/', '#tarfihi-detail button[onclick="closeTarfihiDetail()"]')]:
            page.locator(f'.service-card[href="{path}?from=guest"]').click()
            page.wait_for_url(BASE + path + '?from=guest')
            page.reload(wait_until='networkidle')
            page.locator(back).click()
            page.wait_for_url(BASE + '/guest-services/')
            assert page.locator('#order-total').inner_text() == '60'
            assert page.locator('#guest-name').input_value() == 'ضيف الاختبار'
            assert page.locator('#guest-cabin').input_value() == 'بيت الدوم 1'
        page.goto(BASE + '/guest-services.html?review=1', wait_until='networkidle')
        page.wait_for_url(BASE + '/guest-services/?review=1')
        assert page.locator('#order-total').inner_text() == '60'

        # Removing the last selections disables checkout, including after reload.
        page.locator('[data-extra="robe"] [data-step="-1"]').click(click_count=2)
        page.locator('[data-extra="incense"] [data-step="-1"]').click()
        assert page.locator('.send-order').is_disabled()
        page.reload(wait_until='networkidle')
        assert page.locator('#order-total').inner_text() == '0'
        assert not errors, errors
        print(width, 'PASS prices, quantities, totals, cabin validation, guest phone, draft and service return', flush=True)
        context.close()

    # The existing restaurant checkout must continue using its separate phone.
    context = browser.new_context()
    if FONT.exists():
        context.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(path=str(FONT), content_type='text/css'))
    page = context.new_page()
    page.goto(BASE + '/menu/?from=guest', wait_until='networkidle')
    page.locator('#menu-items button[aria-label="إضافة ساندويتش دجاج زنجر"]').click()
    page.locator('.menu-cart-trigger').click()
    page.locator('button[onclick="continueMenuOrder()"]').click()
    page.locator('#order-name').fill('فحص محلي')
    page.locator('#order-villa').select_option(label='بيت الدوم 1')
    assert page.locator('#order-cabin-num').inner_text() == '15'
    page.evaluate('window.open=(url)=>{window.capturedRestaurantURL=url;return null}')
    page.locator('button[onclick="sendOrderWhatsapp()"]').click()
    assert urlparse(page.evaluate('window.capturedRestaurantURL')).path == '/966537006531'
    print('PASS restaurant orders retain their separate WhatsApp number', flush=True)
    context.close()

    # Existing number-only drafts keep their selections when the form changes.
    context = browser.new_context()
    context.add_init_script("sessionStorage.setItem('familyday.guest-extras.v1',JSON.stringify({cabin:'15',quantities:{bed:2}}))")
    page = context.new_page()
    page.goto(BASE + '/guest-services/', wait_until='networkidle')
    assert page.locator('#guest-cabin').input_value() == 'بيت الدوم 1'
    assert page.locator('#cabin-number').inner_text() == '15'
    assert page.locator('#order-total').inner_text() == '60'
    assert page.locator('#guest-name').input_value() == ''
    print('PASS migration of previous number-only drafts', flush=True)
    context.close()

    # Storage is optional: a blocked browser storage API cannot break ordering.
    context = browser.new_context()
    context.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Blocked storage')}})")
    page = context.new_page()
    page.goto(BASE + '/guest-services/', wait_until='networkidle')
    page.locator('[data-extra="bed"] [data-step="1"]').click()
    assert page.locator('#order-total').inner_text() == '30'
    print('PASS ordering with unavailable storage', flush=True)
    browser.close()

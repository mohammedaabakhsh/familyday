"""Exercise in-page guest orders, edits, persistence and separate WhatsApp recipients.
All outgoing links are captured locally; no messages are sent.
"""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import json
import os
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8025'
FONT = Path(os.environ.get('FD_TEST_FONT_CSS', '/nonexistent-font.css'))
OUT = Path(os.environ.get('FD_GUEST_SCREENSHOTS', '/tmp/familyday-guest-services'))
OUT.mkdir(parents=True, exist_ok=True)


def context(browser, width=390):
    ctx = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
    if FONT.exists():
        ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(path=str(FONT), content_type='text/css'))
    ctx.add_init_script('window.open=(url)=>{window.capturedURL=url;return null}')
    return ctx


def captured(page, phone):
    url = urlparse(page.evaluate('window.capturedURL'))
    assert url.hostname == 'wa.me' and url.path == '/' + phone, url
    return parse_qs(url.query)['text'][0]


def menu_row(page, name):
    return page.locator('[data-menu-name="' + name + '"]')


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 768, 1440]:
        ctx = context(browser, width)
        page = ctx.new_page()
        errors, documents = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: documents.append(r.url) if r.resource_type == 'document' else None)
        page.goto(BASE + '/guest-services/', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        assert page.locator('img').count() == 1  # Brand logo only, no service photos.
        assert page.locator('.service-card').count() == 0
        assert page.locator('[data-extra] .extra-price bdi').all_text_contents() == ['20', '20', '15', '25', '30']
        assert page.locator('.menu-row').count() == page.evaluate('Object.values(_menuData).flat().length')
        assert page.locator('#extras-order .send-order').is_disabled()
        assert page.locator('#restaurant-order').is_hidden()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        page.screenshot(path=str(OUT / f'guest-empty-{width}.png'), full_page=True)
        # Water allocation is capped at three; an incomplete bundle cannot be added.
        assert page.locator('#add-water').is_disabled()
        page.locator('[data-water="adults"][data-step="1"]').click()
        page.locator('[data-water="children"][data-step="1"]').click(click_count=2)
        assert page.locator('[data-water][data-step="1"]:disabled').count() == 2
        page.locator('#add-water').click()
        assert page.locator('#order-total').inner_text() == '50'
        assert page.locator('#add-water').is_disabled()
        # Cinema and games are added once; table includes the box, not an extra fee.
        assert page.locator('#add-cinema').is_disabled()
        page.locator('#cinema-time').select_option('24')
        page.locator('#add-cinema').click()
        page.locator('[name="games-package"][value="table"]').check()
        page.locator('#add-games').click()
        page.locator('[data-extra="robe"] [data-step="1"]').click(click_count=2)
        page.locator('[data-extra="incense"] [data-step="1"]').click()
        assert page.locator('#order-total').inner_text() == '410'
        assert len(documents) == 1, documents  # No page hops while selecting services.
        if width < 640:
            assert page.locator('#order-shortcut').is_visible()
            page.locator('#order-shortcut').click()
            assert page.locator('#extras-order').evaluate('(e)=>e===document.activeElement')
        # Required fields must prevent creating a WhatsApp link.
        send = page.locator('#extras-order .send-order')
        send.click()
        assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-name').fill('   ')
        send.click()
        assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-name').fill('ضيف الاختبار')
        send.click()
        assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-cabin').select_option('بيت الدوم 1')
        assert page.locator('#extras-order .cabin-number output').inner_text() == '15'
        page.locator('#guest-notes').fill('أعمار الأطفال 5 و7 سنوات')
        send.click()
        assert captured(page, '966556156693') == '\n'.join([
            'السلام عليكم، أرغب بطلب الخدمات التالية أثناء إقامتي:', '',
            'الاسم: ضيف الاختبار', 'اسم الكوخ: بيت الدوم 1', 'رقم الكوخ: 15', '', 'الطلبات:',
            '• باقة ألعاب مائية — 50 ريال', 'للكبار: 1', 'للصغار: 2',
            '• جلسة السينما — 150 ريال', 'مدة الجلسة: 3 ساعات', 'وقت البداية: 12:00 ص (منتصف الليل)',
            '• طاولة الألعاب مع بوكس الألعاب — 150 ريال',
            '• روب ومناشف لشخص واحد × 2 — 40 ريال', '• بخور × 1 — 20 ريال',
            '', 'الإجمالي: 410 ريال', '', 'ملاحظات: أعمار الأطفال 5 و7 سنوات'])
        # Editing a selection updates rather than appends/charges it twice.
        page.locator('[name="games-package"][value="box"]').check()
        page.locator('#add-games').click()
        assert page.locator('#order-total').inner_text() == '310'
        page.locator('#cinema-time').select_option('26')
        page.locator('#add-cinema').click()
        page.locator('[data-water="children"][data-step="-1"]').click(click_count=2)
        assert page.locator('#add-water').is_disabled()
        assert 'تحديث الطلب' in page.locator('#water-status').inner_text()
        page.locator('[data-water="adults"][data-step="1"]').click(click_count=2)
        page.locator('#add-water').click()
        send.click()
        message = captured(page, '966556156693')
        assert 'للكبار: 3\nللصغار: 0' in message and 'وقت البداية: 2:00 ص' in message
        page.get_by_role('button', name='حذف روب ومناشف لشخص واحد', exact=True).click()
        assert page.locator('[data-extra="robe"] output').inner_text() == '0'
        assert page.locator('#order-total').inner_text() == '270'
        # Inline restaurant uses the live menu, including cheese and both BBQ choices.
        page.locator('[data-category="ساندويتشات"] summary').click()
        sandwich = menu_row(page, 'ساندويتش دجاج زنجر')
        sandwich.locator('[data-step="1"]').click(click_count=2)
        sandwich.locator('[type="checkbox"]').check()
        assert page.locator('#restaurant-total').inner_text() == '24'
        page.locator('[data-category="بوكسات الشواء"] summary').click()
        bbq = menu_row(page, 'بوكس الشواء بدون فحم')
        bbq.locator('[data-step="1"]').click()
        bbq.locator('select').select_option(label='دجاج')
        bbq.locator('[data-step="1"]').click()
        page.locator('[data-category="مشروبات باردة"] summary').click()
        menu_row(page, 'عبوة ماء صغيرة').locator('[data-step="1"]').click(click_count=3)
        assert page.locator('#restaurant-total').inner_text() == '200'
        assert page.locator('#order-total').inner_text() == '270'
        assert page.locator('#restaurant-name').input_value() == 'ضيف الاختبار'
        page.locator('#restaurant-notes').fill('بدون بصل')
        page.locator('#restaurant-order .send-order').click()
        assert captured(page, '966537006531') == '\n'.join([
            'السلام عليكم، أرغب بطلب التالي من المطعم:', '', 'الاسم: ضيف الاختبار',
            'اسم الكوخ: بيت الدوم 1', 'رقم الكوخ: 15', '', 'الطلبات:',
            '• ساندويتش دجاج زنجر × 2 — 24 ريال', 'إضافة جبنة: 2 × 1 ريال',
            '• بوكس الشواء بدون فحم — لحم × 1 — 85 ريال',
            '• بوكس الشواء بدون فحم — دجاج × 1 — 85 ريال', '• عبوة ماء صغيرة × 3 — 6 ريال',
            '', 'الإجمالي: 200 ريال', '', 'ملاحظات: بدون بصل'])
        page.screenshot(path=str(OUT / f'guest-selected-{width}.png'), full_page=True)
        # Reload and old links retain both baskets and the independent notes.
        page.goto(BASE + '/guest-services.html?review=1', wait_until='networkidle')
        page.wait_for_url(BASE + '/guest-services/?review=1')
        assert page.locator('#order-total').inner_text() == '270'
        assert page.locator('#restaurant-total').inner_text() == '200'
        assert page.locator('#guest-notes').input_value() == 'أعمار الأطفال 5 و7 سنوات'
        assert page.locator('#restaurant-notes').input_value() == 'بدون بصل'
        assert page.locator('#cinema-time').input_value() == '26'
        assert page.locator('#water-adults').inner_text() == '3'
        assert page.locator('[name="games-package"][value="box"]').is_checked()
        # Delete all choices; optional notes are omitted when empty.
        page.locator('#guest-notes').fill('')
        page.locator('#extras-order .send-order').click()
        assert 'ملاحظات:' not in captured(page, '966556156693')
        while page.locator('#order-items button').count():
            page.locator('#order-items button').first.click()
        assert page.locator('#order-total').inner_text() == '0'
        assert page.locator('#extras-order .send-order').is_disabled()
        assert page.locator('#order-shortcut').is_hidden()
        assert page.locator('#restaurant-total').inner_text() == '200'
        # Removing the parent item also removes its cheese and its cost.
        page.get_by_role('button', name='حذف ساندويتش دجاج زنجر', exact=True).click()
        assert page.locator('#restaurant-total').inner_text() == '176'
        while page.locator('#restaurant-items button').count():
            page.locator('#restaurant-items button').first.click()
        assert page.locator('#restaurant-order').is_hidden()
        page.reload(wait_until='networkidle')
        assert page.locator('#order-total').inner_text() == '0'
        assert page.locator('#restaurant-order').is_hidden()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        assert not errors, errors
        print(width, 'PASS in-page selection, edits/removal, exact messages, independent recipients/totals, reload and mobile layout', flush=True)
        ctx.close()

    # In-page package contents and cinema slots match the full service pages.
    ctx = context(browser)
    page = ctx.new_page()
    page.goto(BASE+'/services/games/',wait_until='networkidle')
    games = page.locator('.tg-games li').all_text_contents()
    cinema = page.locator('.cn-inclusions li').all_text_contents()
    slots = page.locator('#order-time option[value]:not([value=""])').all_text_contents()
    page.goto(BASE+'/guest-services/',wait_until='networkidle')
    assert page.locator('.games-contents li').all_text_contents() == games
    assert page.locator('#cinema-service .contents-list li').all_text_contents() == cinema
    assert page.locator('#cinema-time option[value]:not([value=""])').all_text_contents() == slots
    ctx.close()
    print('PASS package contents and cinema slots match existing services', flush=True)

    # Earlier drafts migrate; invalid or injected quantities/prices are not trusted.
    drafts = [
        ('familyday.guest-extras.v1', {'cabin':'15','quantities':{'bed':2}}, '60'),
        ('familyday.guest-orders.v2', {'cabin':'unknown','quantities':{'robe':-2,'bath':100,'incense':1},'water':{'adults':5,'children':-2},'cinema':'17','games':'other','menu':{'fake':{'qty':1,'price':1}}}, '20'),
        ('familyday.guest-orders.v2', {'quantities':{},'menu':{'برجر لحم':{'qty':2,'price':0,'cheese':True}}}, '0'),
    ]
    for key, draft, total in drafts:
        ctx = context(browser)
        ctx.add_init_script('sessionStorage.setItem('+json.dumps(key)+','+json.dumps(json.dumps(draft))+')')
        page = ctx.new_page();page.goto(BASE+'/guest-services/',wait_until='networkidle')
        assert page.locator('#order-total').inner_text() == total
        if key.endswith('v1'):
            assert page.locator('#guest-cabin').input_value() == 'بيت الدوم 1'
        if 'برجر لحم' in draft.get('menu', {}):
            assert page.locator('#restaurant-total').inner_text() == '20'
        ctx.close()
    ctx = context(browser)
    ctx.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}})")
    page=ctx.new_page();page.goto(BASE+'/guest-services/',wait_until='networkidle')
    page.locator('[data-extra="bed"] [data-step="1"]').click()
    assert page.locator('#order-total').inner_text()=='30'
    ctx.close()
    print('PASS old drafts, invalid selections, current catalog prices and blocked storage',flush=True)
    browser.close()

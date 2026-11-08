"""Check multi-package guest water orders; intercept WhatsApp without sending."""
import sys
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8059'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320,568), (390,844), (1440,900)]:
        page = browser.new_page(viewport={'width':width,'height':height}, reduced_motion='reduce')
        page.add_init_script('window.open=(url)=>{window.capturedURL=url;return null}')
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE+'/guest-services/', wait_until='networkidle')
        def clicks(selector, n=1):
            for _ in range(n): page.locator(selector).click()
        def packages(step, n=1): clicks(f'[data-water-packages][data-step="{step}"]', n)
        def games(group, step, n=1): clicks(f'[data-water="{group}"][data-step="{step}"]', n)
        def check(pack, adults, children):
            required=pack*3
            assert page.locator('#water-offer').inner_text()==f'{required} ألعاب بـ{pack*50} ريال'
            assert page.locator('#water-packages-count').inner_text()==str(pack)
            assert page.locator('#water-adults').inner_text()==str(adults)
            assert page.locator('#water-children').inner_text()==str(children)
            assert page.locator('#dialog-total').inner_text()==str(pack*50)
            complete=adults+children==required
            assert page.locator('#water-count').inner_text()==('✓ اكتمل اختيار الألعاب' if complete else f'اخترت {adults+children} من {required}')
            assert page.locator('#apply-selection').is_disabled()==(not complete)
            assert page.locator('#water-service .section-note').inner_text()=='وزّع الألعاب بين الكبار والصغار'
        clicks('#water-card');check(1,0,0)
        assert page.locator('[data-water-packages][data-step="-1"]').is_disabled()
        packages(1);check(2,0,0)
        games('adults',1,4);games('children',1,2);check(2,4,2)
        assert page.locator('[data-water][data-step="1"]:disabled').count()==2
        clicks('#apply-selection')
        assert page.locator('#order-total').inner_text()=='100'
        assert 'باقة ألعاب مائية × 2' in page.locator('#order-items').inner_text()
        page.locator('#guest-name').fill('ضيف التجربة')
        page.locator('#guest-cabin').select_option(label='بيت الدوم 1')
        page.locator('#guest-notes').fill('ألعاب مناسبة للأطفال')
        def message(pack, adults, children):
            clicks('#extras-order .send-order')
            url=urlparse(page.evaluate('window.capturedURL'))
            assert url.hostname=='wa.me' and url.path=='/966556156693'
            text=parse_qs(url.query)['text'][0]
            expected=('السلام عليكم، أرغب بطلب الخدمات التالية:\n\nالاسم: ضيف التجربة\nاسم الكوخ: بيت الدوم 1\nرقم الكوخ: 15\n\nالطلبات:\n\nالألعاب المائية:\n'
                      f'باقة ألعاب مائية × {pack} = {pack*50} ريال\nللكبار: {adults}\nللصغار: {children}\n\nإجمالي الطلب: {pack*50} ريال\n\nملاحظات: ألعاب مناسبة للأطفال')
            assert text==expected, text
        message(2,4,2)
        page.reload(wait_until='networkidle');clicks('#water-card');check(2,4,2)
        packages(1);check(3,4,2);games('children',1,3);check(3,4,5)
        clicks('#apply-selection');message(3,4,5)
        clicks('#water-card');packages(-1);check(2,0,0)
        assert page.locator('#order-total').inner_text()=='150'  # Draft has not replaced the bill.
        clicks('.dialog-cancel');clicks('#water-card');check(3,4,5)
        packages(-1);games('adults',1);games('children',1);check(2,1,1)
        packages(-1);check(1,1,1)  # Within the new capacity: retain both choices.
        games('children',1);check(1,1,2);clicks('#apply-selection');message(1,1,2)
        clicks('#water-card');packages(1)
        games('adults',-1);games('children',-1,2);check(2,0,0)  # Zero never resets package count.
        games('children',1,6);check(2,0,6);clicks('#apply-selection');message(2,0,6)
        clicks('#water-card');packages(1,18);check(20,0,6)
        assert page.locator('[data-water-packages][data-step="1"]').is_disabled()
        games('children',1,54);check(20,0,60);clicks('#apply-selection');message(20,0,60)
        clicks('#water-card');packages(-1,18);check(2,0,0);games('adults',1,6);check(2,6,0)
        page.locator('.dialog-body').evaluate('e=>e.scrollTop=e.scrollHeight')
        box=page.locator('#apply-selection').bounding_box()
        assert 0<=box['y'] and box['y']+box['height']<=height
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        if width==390: page.screenshot(path='/tmp/fd-water-packages-v6.png')
        clicks('#apply-selection');message(2,6,0)
        page.get_by_role('button',name='حذف باقة ألعاب مائية',exact=True).click()
        assert page.locator('#resort-summary').is_hidden()
        assert page.locator('#order-total').inner_text()=='0'
        page.reload(wait_until='networkidle');clicks('#water-card');check(1,0,0)
        assert not errors, errors
        page.close()
        print(width,'PASS package prices, distribution/reset/limits, draft cancel, bills, reload, removal and exact WhatsApp messages',flush=True)
    browser.close()

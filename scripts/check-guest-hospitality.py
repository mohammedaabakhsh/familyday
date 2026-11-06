"""Hospitality catalogue, draft/apply ordering and WhatsApp draft routing. No messages sent."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import sys
from playwright.sync_api import sync_playwright, expect
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width in [320,390,1440]:
        ctx=browser.new_context(viewport={'width':width,'height':800},reduced_motion='reduce')
        ctx.add_init_script('window.open=url=>{window.capturedURL=url;return null}')
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE+'/guest-services/',wait_until='networkidle')
        expect(page.locator('#hospitality-card')).to_be_enabled()
        page.screenshot(path=f'/tmp/guest-hospitality-home-{width}.png',full_page=True)
        page.locator('#hospitality-card').click()
        cards=page.locator('.hospitality-package')
        expected=page.evaluate("""async()=>{const doc=new DOMParser().parseFromString(await(await fetch('/index.html')).text(),'text/html');return [...doc.querySelectorAll('#hd-hospitality-panel .hd-package')].map(c=>({name:c.querySelector('.hd-package-name').textContent.trim(),price:c.querySelector('.hd-package-price').textContent.trim(),items:[...c.querySelectorAll('.hd-item span:last-child')].map(e=>e.textContent.trim())}))}""")
        assert cards.count()==len(expected)==3
        for card,item in zip(cards.all(),expected):
            assert card.locator('h3').inner_text()==item['name']
            assert card.locator('.hospitality-price').inner_text()==item['price']
            card.locator('summary').click()
            assert card.locator('.contents-list li').all_text_contents()==item['items']
            card.locator('summary').click()
        first,second=cards.nth(0),cards.nth(1)
        first.locator('[data-step="1"]').click()
        assert page.locator('#dialog-total').inner_text()=='59'
        assert page.locator('#order-total').inner_text()=='0'
        page.keyboard.press('Escape')
        assert page.locator('#hospitality-card').evaluate('e=>e===document.activeElement')
        page.locator('#hospitality-card').click()
        assert first.locator('output').inner_text()=='0'
        first.locator('[data-step="1"]').click(click_count=2)
        second.locator('[data-step="1"]').click()
        assert page.locator('#dialog-total').inner_text()=='193'
        first.locator('summary').click()
        page.locator('.dialog-body').evaluate('e=>e.scrollTop=0')
        page.screenshot(path=f'/tmp/guest-hospitality-dialog-{width}.png')
        page.locator('#apply-selection').click()
        expect(page.locator('#service-dialog')).to_be_hidden()
        assert page.locator('#order-total').inner_text()=='193'
        assert page.locator('[data-group="hospitality"] .order-item-copy strong').all_text_contents()==['الضيافة السعودية × 2','ضيافة الاسترخاء × 1']
        page.locator('#cinema-card').click();page.locator('#cinema-time').select_option('18');page.locator('#apply-selection').click()
        assert page.locator('#order-total').inner_text()=='343'
        page.locator('#guest-name').fill('ضيف الاختبار');page.locator('#guest-cabin').select_option('بيت الدوم 1')
        page.locator('#extras-order .send-order').click()
        link=urlparse(page.evaluate('window.capturedURL'))
        assert link.hostname=='wa.me' and link.path=='/966556156693'
        message=parse_qs(link.query)['text'][0]
        for text in ['الضيافة:', 'الضيافة السعودية × 2 = 118 ريال', 'ضيافة الاسترخاء × 1 = 75 ريال', 'جلسة السينما × 1 = 150 ريال', 'إجمالي الطلب: 343 ريال','رقم الكوخ: 15']:
            assert text in message
        page.reload(wait_until='networkidle')
        assert page.locator('#order-total').inner_text()=='343'
        page.locator('#hospitality-card').click()
        first.locator('[data-step="-1"]').click(click_count=2)
        assert page.locator('#dialog-total').inner_text()=='75'
        page.locator('.dialog-cancel').click()
        assert page.locator('#order-total').inner_text()=='343'
        page.get_by_role('button',name='حذف الضيافة السعودية',exact=True).click()
        assert page.locator('#order-total').inner_text()=='225'
        page.locator('#hospitality-card').click()
        second.locator('[data-step="-1"]').click()
        assert page.locator('#apply-selection').inner_text()=='حذف من الطلب'
        page.locator('#apply-selection').click()
        assert page.locator('#order-total').inner_text()=='150'
        assert page.locator('[data-group="hospitality"]').count()==0
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        assert not errors,errors
        ctx.close();print(width,'PASS complete source content, quantities, cancel/apply, totals, cinema coexistence, WhatsApp draft, reload and removal',flush=True)
    # Restored drafts never supply prices or unknown products; names and contents stay source-backed.
    ctx=browser.new_context()
    modified=(ROOT/'index.html').read_text().replace('59 <span>ريال</span>','63 <span>ريال</span>').replace('تبخير المكان بالعود','تفصيل ضيافة محدث')
    ctx.route('**/index.html',lambda r:r.fulfill(body=modified,content_type='text/html'))
    draft={'hospitality':{'الضيافة السعودية':2,'ضيافة الاسترخاء':-1,'الضيافة العائلية':100,'غير موجودة':1},'price':1}
    ctx.add_init_script('sessionStorage.setItem("familyday.guest-orders.v2",'+json.dumps(json.dumps(draft))+')')
    page=ctx.new_page();page.goto(BASE+'/guest-services/#hospitality',wait_until='networkidle')
    expect(page.locator('#hospitality-service')).to_be_visible()
    assert page.locator('#order-total').inner_text()=='126'
    assert 'تفصيل ضيافة محدث' in page.locator('.hospitality-package').first.text_content()
    ctx.close()
    for key in ['hospitality','cinema']:
        page=browser.new_page()
        page.goto(BASE+'/services-guide/#'+key,wait_until='networkidle')
        page.wait_for_url('**/guest-services/#'+key)
        expect(page.locator('#'+key+'-service')).to_be_visible()
        page.close()
    print('PASS live source updates, invalid draft rejection and old guide links to ordering',flush=True)
    browser.close()

"""Exercise dialog guest selection, grouped bills, source sync and fixed previews.
Outgoing WhatsApp links are captured locally; no messages are sent.
"""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect
import json
import os
import re
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8025'
FONT = Path(os.environ.get('FD_TEST_FONT_CSS', '/nonexistent-font.css'))
OUT = Path(os.environ.get('FD_GUEST_SCREENSHOTS', '/tmp/familyday-guest-services'))
OUT.mkdir(parents=True, exist_ok=True)
TITLE = 'خدمات إقامتك | منتجع يوم العائلة'
DESCRIPTION = 'اختر خدمات المنتجع وطلبات المطعم من مكان واحد أثناء إقامتك.'
URL = 'https://familydaystay.com/guest-services/'


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


def open_service(page, key):
    page.locator('#'+key+'-card').click()
    expect(page.locator('#service-dialog')).to_be_visible()
    expect(page.locator('#'+key+'-service')).to_be_visible()
    assert page.locator('.service-panel:visible').count()==1


def apply_service(page):
    page.locator('#apply-selection').click()
    expect(page.locator('#service-dialog')).to_be_hidden()
    assert not page.evaluate('document.body.classList.contains("dialog-open")')


def preview(page):
    assert page.title() == TITLE
    for selector, value in [('meta[name="description"]', DESCRIPTION), ('meta[property="og:title"]', TITLE),
                            ('meta[property="og:description"]', DESCRIPTION), ('meta[property="og:url"]', URL),
                            ('meta[name="twitter:title"]', TITLE), ('meta[name="twitter:description"]', DESCRIPTION)]:
        assert page.locator(selector).get_attribute('content') == value
    assert page.locator('link[rel="canonical"]').get_attribute('href') == URL


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 768, 1440]:
        ctx=context(browser,width);page=ctx.new_page();errors=[];documents=[];images=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:documents.append(r.url) if r.resource_type=='document' else images.append(r.url) if r.resource_type=='image' else None)
        page.goto(BASE+'/guest-services/',wait_until='networkidle');page.evaluate('document.fonts.ready');preview(page)
        assert page.locator('#services-error').is_hidden()
        assert page.locator('img').count()==0 and page.get_by_role('img',name='يوم العائلة',exact=True).is_visible()
        assert all('/imgs/img01.webp' in url for url in images)
        assert page.locator('[data-service]').evaluate_all('(els)=>els.map(e=>e.dataset.service)')==['restaurant','hospitality','water','games','cinema','extras']
        assert page.locator('.guest-service-fold,.service-nav').count()==0
        assert page.locator('.menu-row').count()==page.evaluate('Object.values(_menuData).flat().length')
        assert page.locator('[data-extra] .extra-price bdi').all_text_contents()==['20','20','15','25','30']
        assert page.locator('#service-dialog').is_hidden()
        assert page.locator('#orders-summary').is_hidden()
        assert page.locator('#selection-feedback,#shortcut-total').count()==0
        for label,href in [('واتساب خدمات المنتجع','https://wa.me/966556156693'),('اتصال بخدمات المنتجع','tel:+966556156693'),('واتساب المطعم','https://wa.me/966537006531'),('اتصال بالمطعم','tel:+966537006531')]:
            assert page.get_by_role('link',name=label,exact=True).get_attribute('href')==href
        page.screenshot(path=str(OUT/f'tiles-empty-{width}.png'),full_page=True)
        # Keyboard activation, modal focus containment and cancel leave the bill untouched.
        page.locator('#water-card').focus();page.keyboard.press('Enter')
        expect(page.locator('#service-dialog')).to_be_visible()
        for _ in range(12):
            page.keyboard.press('Tab')
            assert page.evaluate("document.getElementById('service-dialog').contains(document.activeElement)")
        assert page.locator('#water-count').text_content()=='اخترت 0 من 3'
        page.locator('[data-water="adults"][data-step="1"]').click()
        assert page.locator('#water-count').text_content()=='اخترت 1 من 3'
        assert page.locator('#apply-selection').is_disabled()
        assert page.locator('#dialog-status').is_visible()
        assert page.locator('#order-total').text_content()=='0'
        page.keyboard.press('Escape')
        expect(page.locator('#service-dialog')).to_be_hidden()
        assert page.locator('#water-card').evaluate('(e)=>e===document.activeElement')
        open_service(page,'water');assert page.locator('#water-adults').text_content()=='0'
        page.locator('[data-water="adults"][data-step="1"]').click()
        page.locator('[data-water="children"][data-step="1"]').click(click_count=2)
        assert page.locator('#dialog-total').text_content()=='50'
        assert page.locator('#water-count').text_content()=='✓ اكتمل اختيار الألعاب'
        assert page.locator('#order-total').text_content()=='0'
        assert page.locator('[data-water][data-step="1"]:disabled').count()==2
        page.screenshot(path=str(OUT/f'dialog-water-{width}.png'))
        apply_service(page)
        assert page.locator('#order-total').text_content()=='50'
        assert page.get_by_role('heading',name='ملخص طلب الخدمات',exact=True).is_visible()
        assert page.locator('#restaurant-summary').is_hidden()
        assert '✓' in page.locator('#water-card .tile-selection').text_content()
        open_service(page,'water');page.locator('[data-water="children"][data-step="-1"]').click()
        page.locator('.dialog-cancel').click()
        open_service(page,'water');assert page.locator('#water-children').text_content()=='2'
        page.mouse.click(1,1);expect(page.locator('#service-dialog')).to_be_hidden()
        open_service(page,'games');page.locator('[name="games-package"][value="table"]').check();apply_service(page)
        open_service(page,'cinema')
        assert page.locator('#cinema-time option[value=""]').text_content()=='اختر وقت بداية الجلسة'
        for slot,expected in [('20','من ٨ مساءً إلى ١١ مساءً'),('21','من ٩ مساءً إلى ١٢ منتصف الليل (اليوم التالي)'),('23','من ١١ مساءً إلى ٢ صباحًا (اليوم التالي)'),('26','من ٢ صباحًا إلى ٥ صباحًا'),('24','من ١٢ منتصف الليل إلى ٣ صباحًا')]:
            page.locator('#cinema-time').select_option(slot)
            assert page.locator('#cinema-status').text_content()==expected
        apply_service(page)
        open_service(page,'extras')
        page.locator('[data-extra="robe"] [data-step="1"]').click(click_count=2)
        page.locator('[data-extra="incense"] [data-step="1"]').click();apply_service(page)
        assert page.locator('#order-total').text_content()=='410'
        assert page.locator('.service-tile.is-selected').count()==4
        assert page.locator('#order-items>.order-group').evaluate_all('(els)=>els.map(e=>e.dataset.group)')==['water','games','cinema','extras']
        assert page.locator('#order-items .order-group-heading>strong').all_text_contents()==['50 ريال','150 ريال','150 ريال','60 ريال']
        assert len(documents)==1 and page.url==BASE+'/guest-services/'
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        if width<640:
            page.set_viewport_size({'width':width,'height':700})
            page.evaluate('window.scrollTo(0,0)');expect(page.locator('#order-shortcut')).to_be_visible()
            assert ' '.join(page.locator('#order-shortcut').inner_text().split())=='مراجعة طلباتك ↓'
            page.locator('#order-shortcut').click()
            assert page.locator('#orders-summary').evaluate('(e)=>e===document.activeElement')
            expect(page.locator('#order-shortcut')).to_be_hidden()
            page.set_viewport_size({'width':width,'height':900})
        send=page.get_by_role('button',name='إكمال طلب الخدمات عبر واتساب',exact=True);send.click()
        assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-name').fill('   ');send.click();assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-name').fill('ضيف الاختبار');send.click();assert page.evaluate('window.capturedURL') is None
        page.locator('#guest-cabin').select_option('بيت الدوم 1')
        assert page.locator('#extras-order .cabin-number output').text_content()=='15'
        page.locator('#guest-notes').fill('أعمار الأطفال 5 و7 سنوات');send.click()
        assert captured(page,'966556156693')=='\n'.join([
            'السلام عليكم، أرغب بطلب الخدمات التالية:', '',
            'الاسم: ضيف الاختبار', 'اسم الكوخ: بيت الدوم 1', 'رقم الكوخ: 15', '', 'الطلبات:', '',
            'الألعاب المائية:', 'باقة ألعاب مائية × 1 = 50 ريال', 'للكبار: 1', 'للصغار: 2', '',
            'الألعاب الترفيهية:', 'طاولة مع بوكس الألعاب × 1 = 150 ريال', '',
            'جلسة السينما:', 'جلسة السينما × 1 = 150 ريال', 'مدة الجلسة: 3 ساعات', 'وقت بداية الجلسة: 12:00 ص (منتصف الليل)', '',
            'طلبات إضافية:', 'روب ومناشف لشخص واحد × 2 = 40 ريال', 'تبخير الكوخ × 1 = 20 ريال',
            '', 'إجمالي الطلب: 410 ريال', '', 'ملاحظات: أعمار الأطفال 5 و7 سنوات'])
        open_service(page,'games');page.locator('[name="games-package"][value="box"]').check();apply_service(page)
        assert page.locator('#order-total').text_content()=='310'
        open_service(page,'cinema');page.locator('#cinema-time').select_option('26');apply_service(page)
        open_service(page,'water');page.locator('[data-water="children"][data-step="-1"]').click(click_count=2)
        assert page.locator('#apply-selection').is_disabled()
        assert page.locator('#order-total').text_content()=='310'
        page.locator('[data-water="adults"][data-step="1"]').click(click_count=2);apply_service(page)
        send.click();message=captured(page,'966556156693')
        assert 'للكبار: 3\nللصغار: 0' in message and 'وقت بداية الجلسة: 2:00 ص' in message
        page.get_by_role('button',name='حذف روب ومناشف لشخص واحد',exact=True).click()
        assert page.locator('#order-total').text_content()=='270'
        open_service(page,'extras');assert page.locator('[data-extra="robe"] output').text_content()=='0';page.locator('.dialog-close').click()
        # The restaurant also commits from the dialog, with its own recipient and bill.
        open_service(page,'restaurant');page.locator('[data-category="ساندويتشات"] summary').click()
        sandwich=menu_row(page,'ساندويتش دجاج زنجر')
        sandwich.locator('[data-step="1"]').click(click_count=2);sandwich.locator('[type="checkbox"]').check()
        page.locator('[data-category="بوكسات الشواء"] summary').click();bbq=menu_row(page,'بوكس الشواء بدون فحم')
        bbq.locator('[data-step="1"]').click();bbq.locator('select').select_option(label='دجاج');bbq.locator('[data-step="1"]').click()
        page.locator('[data-category="مشروبات باردة"] summary').click();menu_row(page,'عبوة ماء صغيرة').locator('[data-step="1"]').click(click_count=3)
        assert page.locator('#dialog-total').text_content()=='200'
        assert page.locator('#restaurant-order').is_hidden()
        assert page.locator('.menu-category[open]').count()==1
        page.screenshot(path=str(OUT/f'dialog-restaurant-{width}.png'));apply_service(page)
        assert page.locator('#restaurant-total').text_content()=='200'
        assert page.get_by_role('heading',name='ملخص طلب المطعم',exact=True).is_visible()
        assert page.get_by_role('heading',name='ملخص طلب الخدمات',exact=True).is_visible()
        assert page.locator('#order-total').text_content()=='270'
        assert page.locator('#restaurant-items .order-group-heading h4').all_text_contents()==['ساندويتشات','بوكسات الشواء','مشروبات باردة']
        page.locator('#restaurant-notes').fill('بدون بصل');page.locator('#restaurant-order .send-order').click();message=captured(page,'966537006531')
        assert 'ساندويتشات:\nساندويتش دجاج زنجر × 2 = 22 ريال' in message and 'إضافة جبنة × 2 = 2 ريال' in message
        assert 'بوكسات الشواء:' in message and 'بوكس الشواء بدون فحم — دجاج × 1 = 85 ريال' in message
        assert 'مشروبات باردة:\nعبوة ماء صغيرة × 3 = 6 ريال' in message and 'إجمالي الطلب: 200 ريال' in message
        assert 'ملاحظات: بدون بصل' in message and 'ألعاب' not in message
        page.screenshot(path=str(OUT/f'tiles-selected-{width}.png'),full_page=True)
        page.goto(BASE+'/guest-services.html?review=1',wait_until='networkidle');page.wait_for_url(BASE+'/guest-services/?review=1');preview(page)
        assert page.locator('#service-dialog').is_hidden()
        assert page.locator('.service-tile.is-selected').count()==5
        assert page.locator('#order-total').text_content()=='270' and page.locator('#restaurant-total').text_content()=='200'
        assert page.locator('#guest-notes').input_value()=='أعمار الأطفال 5 و7 سنوات'
        assert page.locator('#restaurant-notes').input_value()=='بدون بصل'
        page.locator('#guest-notes').fill('');page.locator('#extras-order .send-order').click()
        assert 'ملاحظات:' not in captured(page,'966556156693')
        # Remove games directly from the order summary.
        page.get_by_role('button',name='حذف بوكس الألعاب',exact=True).click()
        assert page.locator('#order-total').text_content()=='220'
        open_service(page,'cinema');page.locator('#cinema-time').select_option('');apply_service(page)
        assert page.locator('#order-total').text_content()=='70'
        while page.locator('#order-items button').count():page.locator('#order-items button').first.click()
        assert page.locator('#order-total').text_content()=='0' and page.locator('#extras-order .order-details').is_hidden()
        assert page.locator('#resort-summary').is_hidden() and page.locator('#restaurant-summary').is_visible()
        page.get_by_role('button',name='حذف ساندويتش دجاج زنجر',exact=True).click()
        assert page.locator('#restaurant-total').text_content()=='176'
        while page.locator('#restaurant-items button').count():page.locator('#restaurant-items button').first.click()
        assert page.locator('#orders-summary').is_hidden() and page.locator('#order-shortcut').is_hidden()
        page.reload(wait_until='networkidle');assert page.locator('.service-tile.is-selected').count()==0
        assert not errors,errors
        print(width,'PASS modal selection/apply/cancel, keyboard, grouped bills/messages, recipients, persistence and removals',flush=True)
        ctx.close()

    # Small phone height: scroll only the editor body; actions remain reachable.
    ctx=context(browser,320);page=ctx.new_page();page.set_viewport_size({'width':320,'height':568})
    page.goto(BASE+'/guest-services/',wait_until='networkidle')
    for key in ['hospitality','water','games','cinema','extras','restaurant']:
        open_service(page,key)
        if key=='restaurant':page.locator('[data-category="ساندويتشات"] summary').click()
        page.locator('.dialog-body').evaluate('(e)=>e.scrollTop=e.scrollHeight')
        rect=page.locator('#apply-selection').bounding_box()
        assert 0<=rect['y'] and rect['y']+rect['height']<=568
        assert not page.locator('#service-dialog').evaluate('(e)=>e.scrollWidth>e.clientWidth')
        page.locator('.dialog-close').click()
    ctx.close();print('PASS short-screen dialog scroll and visible actions',flush=True)

    # Change only the ORIGINAL page/menu response: the guest page must update itself.
    ctx=context(browser);page=ctx.new_page()
    source=ctx.request.get(BASE+'/index.html').text()
    menu_source=ctx.request.get(BASE+'/service-data.js').text()
    modified=source.replace('<dd class="cn-price">150 ريال</dd>','<dd class="cn-price">175 ريال</dd>')
    modified=modified.replace('<dd>3 ساعات</dd>','<dd>4 ساعات</dd>').replace('كوبان من الفشار','بوكس فشار كبير')
    modified=modified.replace('<span class="tg-package-price">50 ريال</span>','<span class="tg-package-price">65 ريال</span>')
    modified=modified.replace('ورق بلوت','بلوت جديد').replace('<strong>50</strong>','<strong>60</strong>')
    modified=re.sub(r'service-data\.js\?v=[^\"]+', 'service-data.js?v=source-sync-proof', modified)
    modified=re.sub(r'js/cabin-numbers\.js\?v=[^\"]+', 'js/cabin-numbers.js?v=cabin-sync-proof', modified)
    cabins_source=ctx.request.get(BASE+'/js/cabin-numbers.js').text().replace("'بيت الدوم 1':15","'بيت الدوم 1':29")
    ctx.route('**/index.html',lambda r:r.fulfill(body=modified,content_type='text/html'))
    ctx.route('**/js/cabin-numbers.js?*',lambda r:r.fulfill(body=cabins_source,content_type='application/javascript'))
    ctx.route('**/service-data.js?*',lambda r:r.fulfill(body=menu_source+"\n_menuData['ساندويتشات'][1].price=19;_menuData['ساندويتشات'][1].cheesePrice=3;",content_type='application/javascript'))
    requests=[];page.on('request',lambda r:requests.append(r.url))
    page.goto(BASE+'/guest-services/',wait_until='networkidle');preview(page)
    assert 'بوكس فشار كبير' in page.locator('#cinema-service .contents-list').text_content()
    assert 'بلوت جديد' in page.locator('.games-contents').text_content()
    open_service(page, 'water')
    assert page.locator('#water-offer').text_content()=='3 ألعاب بـ60 ريال'
    page.locator('[data-water="adults"][data-step="1"]').click(click_count=3);apply_service(page)
    open_service(page, 'games')
    page.locator('[name="games-package"][value="box"]').check();apply_service(page)
    open_service(page, 'cinema')
    assert page.locator('#cinema-duration').text_content()=='4 ساعات'
    page.locator('#cinema-time').select_option('23')
    assert page.locator('#cinema-status').text_content()=='من ١١ مساءً إلى ٣ صباحًا (اليوم التالي)'
    assert page.locator('#cinema-price').text_content()=='175 ريال'
    page.locator('#cinema-time').select_option('18');apply_service(page)
    assert page.locator('#order-total').text_content()=='300'  # 60 + 65 + 175.
    open_service(page, 'restaurant')
    page.locator('[data-category="ساندويتشات"] summary').click();menu_row(page,'برجر لحم').locator('[data-step="1"]').click()
    menu_row(page,'برجر لحم').locator('[type=checkbox]').check();apply_service(page)
    assert page.locator('#restaurant-total').text_content()=='22'
    page.locator('#guest-cabin').select_option('بيت الدوم 1')
    assert page.locator('#extras-order .cabin-number output').text_content()=='29'
    assert any(url.endswith('/service-data.js?v=source-sync-proof') for url in requests)
    ctx.close();print('PASS original-source price/content/menu-version changes propagate while preview remains fixed',flush=True)

    # A missing source fails visibly rather than offering stale prices.
    ctx=context(browser);ctx.route('**/index.html',lambda r:r.fulfill(status=503,body='Unavailable'))
    page=ctx.new_page();page.goto(BASE+'/guest-services/',wait_until='networkidle')
    assert page.locator('#services-error').is_visible()
    assert page.locator('#cinema-time').is_disabled()
    assert page.locator('#extras-order .send-order').is_disabled()
    preview(page);ctx.close()
    drafts=[('familyday.guest-extras.v1',{'cabin':'15','quantities':{'bed':2}},'60'),
            ('familyday.guest-orders.v2',{'quantities':{'robe':-2,'bath':100,'incense':1},'water':{'adults':5,'children':-2},'cinema':'17','games':'other','menu':{'fake':{'qty':1,'price':1}}},'20')]
    for key,draft,total in drafts:
        ctx=context(browser);ctx.add_init_script('sessionStorage.setItem('+json.dumps(key)+','+json.dumps(json.dumps(draft))+')')
        page=ctx.new_page();page.goto(BASE+'/guest-services/',wait_until='networkidle')
        assert page.locator('#order-total').text_content()==total
        if key.endswith('v1'):assert page.locator('#guest-cabin').input_value()=='بيت الدوم 1'
        ctx.close()
    ctx=context(browser);ctx.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}})")
    page=ctx.new_page();page.goto(BASE+'/guest-services/',wait_until='networkidle')
    open_service(page, 'extras')
    page.locator('[data-extra="bed"] [data-step="1"]').click();apply_service(page);assert page.locator('#order-total').text_content()=='30'
    ctx.close();print('PASS source failure, legacy drafts, invalid quantities and blocked storage',flush=True)
    browser.close()

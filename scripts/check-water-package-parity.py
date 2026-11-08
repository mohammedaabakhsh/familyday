"""Compare main-site multi-package checkout with guest-service billing and WhatsApp.
Only capture outgoing URLs; never navigate to WhatsApp or send messages.
"""
import sys
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8059'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    ctx.add_init_script('window.open=url=>{window.capturedURL=url;return null}')
    main,guest=ctx.new_page(),ctx.new_page()
    errors=[]
    for page in [main,guest]:page.on('pageerror',lambda e:errors.append(str(e)))
    main.goto(BASE+'/services/water-games/',wait_until='networkidle')
    guest.goto(BASE+'/guest-services/',wait_until='networkidle')
    def clicks(page,selector,n=1):
        for _ in range(n):page.locator(selector).click()
    def packages(step,n=1):clicks(main,f'[data-water-packages][data-step="{step}"]',n)
    def games(group,step,n=1):clicks(main,f'[data-water-group="{group}"][data-step="{step}"]',n)
    def check(pack,adults,children):
        assert main.locator('#wm-packages').inner_text()==str(pack)
        assert main.locator('#wm-adults').inner_text()==str(adults)
        assert main.locator('#wm-children').inner_text()==str(children)
        assert main.locator('.wm-offer').inner_text()==f'{pack*3} ألعاب بـ{pack*50} ريال'
        assert main.locator('#wm-total').inner_text()==f'{pack*50} ريال'
        complete=adults+children==pack*3
        assert main.locator('#maiya-selection-count').inner_text()==('✓ اكتمل اختيار الألعاب' if complete else f'اخترت {adults+children} من {pack*3}')
        assert main.locator('#maiya-order-btn').is_disabled()==(not complete)
        assert main.locator('#maiya-detail').evaluate('e=>e.classList.contains("is-complete")')==complete
    def captured(page):
        url=urlparse(page.evaluate('window.capturedURL'))
        assert url.hostname=='wa.me' and url.path=='/966556156693'
        return parse_qs(url.query)['text'][0]
    check(1,0,0);packages(1);check(2,0,0)
    games('adults',1,4);games('children',1,2);check(2,4,2)
    main.screenshot(path='/tmp/fd-main-water-packages.png')
    for count,adults,children in [(2,4,2),(3,4,5)]:
        if count==3:packages(1);games('children',1,3);check(count,adults,children)
        main.locator('#maiya-order-btn').click()
        expected=[f'باقة ألعاب مائية × {count}',f'{count*3} ألعاب بـ{count*50} ريال',f'للكبار: {adults}',f'للصغار: {children}']
        assert main.locator('#order-item-name>div').all_text_contents()==expected
        main.locator('#order-name').fill('ضيف التجربة');main.locator('#order-villa').select_option(label='بيت الدوم 1');main.locator('#order-notes').fill('ملاحظة التجربة')
        main.reload(wait_until='networkidle')
        assert main.locator('#order-popup').is_visible()
        assert main.locator('#order-item-name>div').all_text_contents()==expected
        main.locator('#order-name').fill('ضيف التجربة');main.locator('#order-villa').select_option(label='بيت الدوم 1');main.locator('#order-notes').fill('ملاحظة التجربة')
        main.locator('button[onclick="sendOrderWhatsapp()"]').click()
        main.locator('#order-popup').wait_for(state='hidden')
        assert main.locator('#maiya-detail').is_visible();check(count,adults,children)
        guest.locator('#water-card').click()
        clicks(guest,'[data-water-packages][data-step="1"]')
        clicks(guest,'[data-water="adults"][data-step="1"]',4 if count==2 else 0)
        clicks(guest,'[data-water="children"][data-step="1"]',2 if count==2 else 3)
        guest.locator('#apply-selection').click()
        assert guest.locator('#order-total').inner_text()==str(count*50)
        assert guest.locator('#order-items .order-item-copy strong').inner_text()==expected[0]
        assert guest.locator('#order-items .order-item-copy span').all_text_contents()==expected[2:]
        guest.locator('#guest-name').fill('ضيف التجربة');guest.locator('#guest-cabin').select_option(label='بيت الدوم 1');guest.locator('#guest-notes').fill('ملاحظة التجربة')
        guest.locator('#extras-order .send-order').click()
        assert captured(main)==captured(guest)
        print(count,'PASS identical main/guest WhatsApp draft, bill quantities and price, plus main checkout reload/back',flush=True)
    packages(-1);check(2,0,0)
    games('adults',1);games('children',1);packages(-1);check(1,1,1)
    packages(1);games('adults',-1);games('children',-1);check(2,0,0)
    main.evaluate('for(let i=0;i<18;i++)changeMaiyaPackages(1)');check(20,0,0)
    assert main.locator('[data-water-packages][data-step="1"]').is_disabled()
    main.evaluate('changeMaiyaPackages(1);changeMaiyaPackages(100)');check(20,0,0)
    main.evaluate("for(let i=0;i<60;i++)changeMaiyaQuantity('children',1)");check(20,0,60)
    assert main.locator('[data-water-group][data-step="1"]:disabled').count()==2
    main.locator('#maiya-order-btn').click()
    assert main.locator('#order-item-name>div').all_text_contents()==['باقة ألعاب مائية × 20','60 ألعاب بـ1000 ريال','للكبار: 0','للصغار: 60']
    main.evaluate('closeOrderPopup()');main.locator('#order-popup').wait_for(state='hidden');main.evaluate('for(let i=0;i<19;i++)changeMaiyaPackages(-1)');check(1,0,0)
    assert main.locator('[data-water-packages][data-step="-1"]').is_disabled()
    assert main.evaluate("getMaiyaOrderDetails('باقة ألعاب مائية\\n3 ألعاب بـ50 ريال\\nللكبار: 1 — للصغار: 2').packages")==1
    for order in [{'type':'water','packages':1.5,'adults':1,'children':2},{'type':'water','packages':2,'adults':3,'children':0},{'type':'water','packages':0,'adults':0,'children':0},{'type':'water','packages':21,'adults':63,'children':0},{'type':'water','packages':1,'adults':4,'children':-1}]:
        assert main.evaluate('order=>getMaiyaOrderDetails(order)',order) is None
    assert main.evaluate("getMaiyaOrderDetails({type:'water',packages:2,adults:6,children:0,price:1}).price")==100
    assert not errors,errors
    print('PASS conditional reset, preserved zero, limits, legacy checkout and invalid stored selections',flush=True)
    ctx.close()
    # Both surfaces derive prices from the same source rather than a stored total.
    ctx=browser.new_context()
    source=ctx.request.get(BASE+'/services/water-games/').text().replace('<strong>50</strong>','<strong>60</strong>')
    ctx.route('**/services/water-games/',lambda r:r.fulfill(body=source,content_type='text/html'))
    page=ctx.new_page();page.goto(BASE+'/services/water-games/',wait_until='networkidle')
    page.locator('[data-water-packages][data-step="1"]').click()
    assert page.locator('#wm-total').inner_text()=='120 ريال'
    assert page.evaluate("getMaiyaOrderDetails({type:'water',packages:2,adults:6,children:0}).price")==120
    print('PASS original base price propagates to multi-package UI and checkout',flush=True)
    ctx.close();browser.close()

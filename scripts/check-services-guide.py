"""Check the brochure, shared source updates and sharing without orders."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8023'
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=['coordination','dining','seating']
def visit(page, section):
    page.evaluate('(id)=>{location.hash=id}', section)
    page.wait_for_selector('#'+section+':visible')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(430,932),(1440,1000)]:
        context=browser.new_context(viewport={'width':width,'height':height},permissions=['clipboard-read','clipboard-write'],reduced_motion='reduce')
        page=context.new_page();errors=[];broken=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('response',lambda r:broken.append(r.url) if r.status>=400 and r.url.startswith(BASE) else None)
        page.goto(BASE+'/services-guide/',wait_until='networkidle')
        page.wait_for_selector('#guide-content.is-ready',state='attached')
        assert page.locator('.guide-section').evaluate_all('(els)=>els.map(e=>e.id)')==SECTIONS
        assert page.locator('.intro p').count()==1
        assert page.locator('#guide-title').inner_text()=='تنسيقات وجلسات'
        assert page.locator('.footer img,.section-number').count()==0
        assert page.locator('.contents>p').count()==0
        assert len(set(page.locator('.section-heading').evaluate_all('(els)=>els.map(e=>getComputedStyle(e).backgroundColor)')))==1
        expected_contacts=['https://wa.me/966556156693','tel:+966556156693','https://maps.app.goo.gl/FLmawLadNaa3uYpJ8?g_st=ic','https://instagram.com/FAMILYDAYRESORT','https://www.snapchat.com/add/familyday5']
        assert sorted(page.locator('.footer-links a').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))'))==sorted(expected_contacts)
        assert page.locator('#hospitality,#cinema').count()==0
        for name in SECTIONS:
            visit(page,name)
            heading=page.locator('#'+name+' .section-heading')
            assert heading.locator('h2').is_visible()
            if name=='coordination':
                assert heading.locator('h2').inner_text()=='التنسيقات'
                assert heading.locator('p').inner_text()=='تجهيزات متكاملة لمناسباتكم'
                assert page.locator('#guide-context').is_hidden()
            else:
                assert heading.locator('h2').inner_text()!=page.locator('#'+name).get_attribute('data-title')
            assert heading.evaluate('e=>getComputedStyle(e).textAlign')=='center'
        assert page.locator('.contents a').count()==3
        page.locator('#guide-back').click()
        page.wait_for_selector('.contents:visible')
        assert page.locator('#guide-back').get_attribute('href')==BASE+'/resort/'
        assert page.locator('.guest-services-link').get_attribute('href')=='/guest-services/'
        assert context.request.get(BASE+'/guest-services/').ok
        assert page.locator('#restaurant,#games,#water-games').count()==0
        assert page.locator('.hd-package-order').count()==0
        # Content must match the main site, including ordering and every inclusion.
        source=page.evaluate("async()=>new DOMParser().parseFromString(await (await fetch('/index.html')).text(),'text/html').documentElement.outerHTML")
        catalogue=page.evaluate("""html=>{
          const doc=new DOMParser().parseFromString(html,'text/html');
          return ['coordination'].map(key=>Array.from(doc.querySelectorAll('#hd-'+key+'-panel .hd-package'),c=>({
            name:c.querySelector('.hd-package-name').textContent.trim(),
            price:c.querySelector('.hd-package-price').textContent.trim(),
            items:Array.from(c.querySelectorAll('.hd-item span:last-child'),i=>i.textContent.trim())
          })));
        }""",source)
        for key,expected in zip(SECTIONS[:1],catalogue):
            cards=page.locator('#'+key+' .package-card')
            assert cards.count()==6
            for card,item in zip(cards.all(),expected):
                assert card.locator('h3').text_content()==item['name']
                assert card.locator('.price').text_content()==item['price']
                assert card.locator('.inclusions li').all_text_contents()==item['items']
        usage_notes=page.evaluate("""html=>Array.from(new DOMParser().parseFromString(html,'text/html').querySelectorAll('.hd-package-note,.cn-notes-list li'),e=>e.textContent.trim())""",source)
        guide_text=page.locator('#guide-content').text_content()
        assert 'تعليمات الاستخدام' not in guide_text
        assert all(note not in guide_text for note in usage_notes)
        assert not page.locator('#guide-content').evaluate('(e)=>/[٠-٩]/.test(e.textContent)')
        assert page.locator('#seating .photo-card').count()==6
        assert page.locator('#dining tbody tr').count()==5
        assert page.locator('#guide-content details').count()==12
        assert page.locator('#guide-content details[open]').count()==0
        assert not page.locator('#package-complete details').evaluate('e=>e.open')
        assert page.locator('.package-card > .package-photo img').count()==43
        assert page.locator('.gallery-controls').count()==6
        assert page.locator('#resort-map').count()==0
        for name in SECTIONS:
            page.locator('.contents a[href="#'+name+'"]').click()
            page.wait_for_timeout(100)
            assert page.url==BASE+'/services-guide/#'+name
            y=page.locator('#title-'+name).bounding_box()['y']
            assert 40<=y<height,(width,name,y)
            if name=='coordination': assert not page.locator('#'+name+' .inclusions').first.is_visible()
            page.locator('#guide-back').click()
            page.wait_for_selector('.contents:visible')
            page.wait_for_timeout(100)
        page.locator('.contents a[href="#coordination"]').click()
        package=page.locator('#coordination .package-card').first
        package.locator('summary').click()
        assert package.locator('.inclusions').is_visible()
        package.locator('summary').click()
        # All service cards retain the approved size and visible title/price.
        for card in page.locator('.package-card').all():
            visit(page,card.evaluate('e=>e.closest(".guide-section").id'))
            assert card.locator('.package-heading h3').is_visible()
            assert card.locator('.package-heading .price').is_visible()
            if card.locator('.gallery-track').count():
                track=card.locator('.gallery-track').bounding_box()
                assert abs(track['width']/track['height']-4/3)<.01
            if card.locator('summary').count():
                card.locator('summary').click()
                assert card.locator('.package-details-body').is_visible()
                card.locator('summary').click()
            else:
                assert card.locator('.package-details-body').is_visible()
        visit(page,'dining')
        dining=page.locator('#dining .package-card')
        assert dining.locator('summary,details').count()==0
        assert dining.locator('table').is_visible()
        expected_prices=page.evaluate('Object.entries(_tawilatPrices).map(([n,p])=>[n,p.plain+" ر.س",p.tansiq+" ر.س"])')
        assert dining.locator('tbody tr').evaluate_all('(els)=>els.map(e=>Array.from(e.children,c=>c.textContent))')==expected_prices
        assert dining.locator('.price').text_content()=='تبدأ من '+str(page.evaluate('Math.min(...Object.values(_tawilatPrices).flatMap(p=>[p.plain,p.tansiq]))'))+' ريال'
        visit(page,'seating')
        for card,session in zip(page.locator('#seating .package-card').all(),page.evaluate('_jalsatAllSessions')):
            assert card.locator('h3').text_content()==session['name']
            assert card.locator('.price').text_content()==session['price']
            assert card.locator('.service-capacity').text_content()==session['persons']
            assert card.locator('.service-capacity').is_visible()
            assert not card.locator('details').evaluate('e=>e.open')
            assert card.locator('.session-description').text_content()==session['desc']
            assert card.locator('img').get_attribute('src')=='/'+session['img']
        page.emulate_media(media='print')
        assert all(card.locator('.package-details-body').is_visible() for card in page.locator('.package-card').all())
        page.emulate_media(media='screen')
        page.locator('img').evaluate_all('(els)=>els.forEach(el=>el.loading="eager")')
        page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true})")
        page.locator('[data-share]').click()
        page.wait_for_function('document.querySelector("#share-status").textContent==="تم نسخ رابط القسم"')
        copied=page.evaluate('navigator.clipboard.readText()')
        assert copied==BASE+'/services-guide/#seating',(copied,page.url)
        assert not errors,errors
        assert not broken,broken
        print(width,'PASS unified service cards with complete content, visible dining prices, section links, images and sharing',flush=True)
        context.close()
    context=browser.new_context();page=context.new_page()
    source=(ROOT/'index.html').read_text().replace('تبخير المكان بالعود','تفصيل ضيافة تجريبي').replace('تزيين السرير بالورد الطبيعي على شكل قلب أو حرف من اختيارك','تفصيل تنسيق تجريبي').replace('<dd class="cn-price">150 ريال</dd>','<dd class="cn-price">173 ريال</dd>').replace('3 ساعات','5 ساعات').replace('أبلغنا فورًا عند هبوب رياح قوية.','تعليمات سينما تجريبية')
    data=(ROOT/'service-data.js').read_text().replace("price:'300 ريال'","price:'333 ريال'",1).replace("img:'imgs/jalsat_1.webp'","img:'imgs/jalsat_2.webp'",1)
    context.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
    context.route('**/service-data.js?*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
    page.goto(BASE+'/services-guide/#dining',wait_until='networkidle')
    assert 40<=page.locator('#title-dining').bounding_box()['y']<260
    assert page.locator('#hospitality,#cinema').count()==0
    assert 'تفصيل تنسيق تجريبي' in page.locator('#coordination').text_content()
    assert '333 ريال' in page.locator('#seating .photo-card').first.text_content()
    assert page.locator('#seating .photo-card img').first.get_attribute('src')=='/imgs/jalsat_2.webp'
    context.close()
    context=browser.new_context();page=context.new_page()
    context.route('**/index.html',lambda r:r.fulfill(status=503,body='unavailable'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert page.locator('#retry-guide').is_visible()
    context.unroute('**/index.html');page.locator('#retry-guide').click();page.wait_for_selector('#guide-content.is-ready',state='attached')
    page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
    page.locator('[data-share]').click()
    assert page.locator('#share-dialog').is_visible()
    assert page.locator('#share-link').input_value()==BASE+'/services-guide/'
    page.locator('#close-share').click();assert page.locator('#share-dialog').is_hidden()
    context.close()
    page=browser.new_page()
    page.goto(BASE+'/services/',wait_until='networkidle')
    page.locator('a[href="/services-guide/"]').click()
    page.wait_for_selector('#guide-back')
    assert page.locator('#guide-back').get_attribute('href')==BASE+'/services/'
    page.locator('#guide-back').click()
    page.wait_for_url('**/services/')
    print('PASS guide return to source and direct-entry fallback',flush=True)
    browser.close()
    print('PASS direct anchor, automatic content/price/photo updates, retry and share fallback')

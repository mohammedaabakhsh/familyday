"""Check the brochure, shared source updates, inline map and sharing without orders."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8023'
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=['hospitality','coordination','dining','cinema','seating','resort-map']
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
        page.wait_for_selector('#resort-map',state='attached')
        assert page.locator('.guide-section').evaluate_all('(els)=>els.map(e=>e.id)')==SECTIONS
        assert page.locator('.intro p').count()==2
        assert page.locator('.contents>p').count()==0
        assert len(set(page.locator('.section-heading').evaluate_all('(els)=>els.map(e=>getComputedStyle(e).backgroundColor)')))==1
        expected_contacts=['https://wa.me/966556156693','tel:+966556156693','https://maps.app.goo.gl/FLmawLadNaa3uYpJ8?g_st=ic','https://instagram.com/FAMILYDAYRESORT','https://www.snapchat.com/add/familyday5','https://tiktok.com/@familydayresort']
        assert page.locator('.footer-links a').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))')==expected_contacts
        assert page.locator('#hospitality img,#hospitality .package-gallery').count()==0
        assert page.locator('#hospitality .package-card--text').count()==3
        for name in SECTIONS:
            visit(page,name)
            heading=page.locator('#'+name+' .section-heading')
            number=heading.locator('.section-number').bounding_box()
            title=heading.locator('h2').bounding_box()
            description=heading.locator('p').bounding_box()
            assert abs((number['x']+number['width']/2)-(title['x']+title['width']/2))<1
            assert number['y']+number['height']<=title['y']
            assert title['y']+title['height']<=description['y']
            assert heading.evaluate('e=>getComputedStyle(e).textAlign')=='center'
        assert page.locator('.contents a').count()==6
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
          return ['hospitality','coordination'].map(key=>Array.from(doc.querySelectorAll('#hd-'+key+'-panel .hd-package'),c=>({
            name:c.querySelector('.hd-package-name').textContent.trim(),
            price:c.querySelector('.hd-package-price').textContent.trim(),
            items:Array.from(c.querySelectorAll('.hd-item span:last-child'),i=>i.textContent.trim())
          })));
        }""",source)
        for key,expected in zip(SECTIONS[:2],catalogue):
            cards=page.locator('#'+key+' .package-card')
            assert cards.count()==(3 if key=='hospitality' else 6)
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
        assert page.locator('#guide-content details').count()==18
        assert page.locator('#guide-content details[open]').count()==0
        assert not page.locator('#package-complete details').evaluate('e=>e.open')
        assert page.locator('.package-card > .package-photo img').count()==44
        assert page.locator('.gallery-controls').count()==6
        assert page.locator('#resort-map details').count()==1
        assert not page.locator('.map-scroll').is_visible()
        visit(page,'resort-map')
        page.locator('.guide-map-fold>summary').click()
        assert page.locator('.map-scroll').is_visible()
        rect=page.locator('.map-scroll').bounding_box()
        canvas=page.locator('.map-canvas').bounding_box()
        assert rect['width']<=600 and canvas['width']<rect['width']-12
        assert canvas['x']>0 and canvas['x']+canvas['width']<width
        page.locator('#guide-back').click()
        page.wait_for_selector('.contents:visible')
        for name in SECTIONS:
            page.locator('.contents a[href="#'+name+'"]').click()
            page.wait_for_timeout(100)
            assert page.url==BASE+'/services-guide/#'+name
            y=page.locator('#title-'+name).bounding_box()['y']
            assert 40<=y<height,(width,name,y)
            if name in SECTIONS[:2]: assert not page.locator('#'+name+' .inclusions').first.is_visible()
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
            card.locator('summary').click()
            assert card.locator('.package-details-body').is_visible()
            card.locator('summary').click()
        visit(page,'cinema')
        cinema=page.locator('#cinema .package-card')
        cinema.locator('summary').click()
        expected_cinema=page.evaluate("""html=>{const d=new DOMParser().parseFromString(html,'text/html');return {
            title:d.querySelector('.cn-title').textContent.trim(),price:d.querySelector('.cn-price').textContent.trim(),
            intro:d.querySelector('.cn-intro').textContent.trim(),
            items:Array.from(d.querySelectorAll('.cn-inclusions li'),e=>e.textContent.trim()),
            facts:Array.from(d.querySelectorAll('.cn-stat:not(:has(.cn-price))'),e=>[e.querySelector('dt').textContent.trim(),e.querySelector('dd').textContent.trim()])};} """,source)
        assert cinema.locator('h3').inner_text()==expected_cinema['title']
        assert cinema.locator('.price').inner_text()==expected_cinema['price']
        assert cinema.locator('.package-description').inner_text()==expected_cinema['intro']
        assert cinema.locator('.inclusions li').all_text_contents()==expected_cinema['items']
        assert cinema.locator('.service-facts>div').evaluate_all('(els)=>els.map(e=>[e.querySelector("dt").textContent,e.querySelector("dd").textContent])')==expected_cinema['facts']
        cinema.evaluate('e=>e.scrollIntoView({block:"start"})')
        page.screenshot(path=f'/tmp/review-guide-cinema-{width}.png')
        cinema.locator('summary').click()
        visit(page,'dining')
        dining=page.locator('#dining .package-card');dining.locator('summary').click()
        expected_prices=page.evaluate('Object.entries(_tawilatPrices).map(([n,p])=>[n,p.plain+" ر.س",p.tansiq+" ر.س"])')
        assert dining.locator('tbody tr').evaluate_all('(els)=>els.map(e=>Array.from(e.children,c=>c.textContent))')==expected_prices
        assert dining.locator('.price').text_content()=='تبدأ من '+str(page.evaluate('Math.min(...Object.values(_tawilatPrices).flatMap(p=>[p.plain,p.tansiq]))'))+' ريال'
        dining.locator('summary').click()
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
        visit(page,'resort-map')
        cabins=page.evaluate('data.resort.items');plotted=page.evaluate('FD_RESORT_MAP_DATA.locations')
        assert len(plotted)==13
        for location in plotted:
            cid=location['cabinId'];cabin=next(c for c in cabins if c['id']==cid)
            marker=page.locator(f'svg [data-map-cabin="{cid}"]')
            marker.locator('.map-label').click()
            assert page.locator('#guide-cabin-title').inner_text()==cabin['name']
            assert marker.get_attribute('aria-pressed')=='true'
            assert page.locator('svg .is-selected').count()==1
            if cid!=11:
                photo=page.locator('#guide-cabin-card .cabin-photo');photo.evaluate('(el)=>el.decode()')
                rect=photo.bounding_box();assert abs(rect['width']-rect['height'])<1
                link=page.locator('.cabin-explore-link')
                assert link.text_content()=='استكشف الكوخ من الداخل ←'
                href=link.get_attribute('href')
                assert 'from=guide' in href and 'cabin='+str(cid) in href
                assert context.request.get(BASE+href).ok
            page.locator('#close-cabin').click()
            assert page.locator('#guide-cabin-card').is_hidden()
        for key in ['Enter',' ']:
            page.locator('svg [data-map-cabin="1"]').focus();page.keyboard.press(key)
            assert page.locator('#guide-cabin-title').inner_text()=='بيت الدوم 1'
            assert page.url.endswith('#resort-map')
            page.locator('#close-cabin').click()
        # Closing the map keeps it compact and reopening preserves all cabin navigation.
        page.locator('.guide-map-fold>summary').click()
        assert not page.locator('.map-scroll').is_visible()
        page.locator('.guide-map-fold>summary').focus();page.keyboard.press('Enter')
        assert page.locator('.map-scroll').is_visible()
        page.locator('#resort-map').scroll_into_view_if_needed()
        page.screenshot(path=f'/tmp/review-guide-map-{width}.png')
        page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true})")
        page.locator('[data-share]').click()
        page.wait_for_function('document.querySelector("#share-status").textContent==="تم نسخ رابط القسم"')
        copied=page.evaluate('navigator.clipboard.readText()')
        assert copied==BASE+'/services-guide/#resort-map',(copied,page.url)
        assert not errors,errors
        assert not broken,broken
        print(width,'PASS unified service cards with complete content, inline map, all 13 markers, section links, images and sharing',flush=True)
        context.close()
    context=browser.new_context();page=context.new_page()
    source=(ROOT/'index.html').read_text().replace('تبخير المكان بالعود','تفصيل ضيافة تجريبي').replace('تزيين السرير بالورد الطبيعي على شكل قلب أو حرف من اختيارك','تفصيل تنسيق تجريبي').replace('<dd class="cn-price">150 ريال</dd>','<dd class="cn-price">173 ريال</dd>').replace('3 ساعات','5 ساعات').replace('أبلغنا فورًا عند هبوب رياح قوية.','تعليمات سينما تجريبية')
    data=(ROOT/'service-data.js').read_text().replace("price:'300 ريال'","price:'333 ريال'",1).replace("img:'imgs/jalsat_1.webp'","img:'imgs/jalsat_2.webp'",1)
    context.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
    context.route('**/service-data.js?*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
    page.goto(BASE+'/services-guide/#cinema',wait_until='networkidle')
    assert 40<=page.locator('#title-cinema').bounding_box()['y']<260
    assert 'تفصيل ضيافة تجريبي' in page.locator('#hospitality').text_content()
    assert 'تفصيل تنسيق تجريبي' in page.locator('#coordination').text_content()
    assert '173 ريال' in page.locator('#cinema').text_content()
    assert '5 ساعات' in page.locator('#cinema').text_content()
    assert 'تعليمات سينما تجريبية' not in page.locator('#cinema').text_content()
    assert '333 ريال' in page.locator('#seating .photo-card').first.text_content()
    assert page.locator('#seating .photo-card img').first.get_attribute('src')=='/imgs/jalsat_2.webp'
    context.close()
    context=browser.new_context();page=context.new_page()
    context.route('**/index.html',lambda r:r.fulfill(status=503,body='unavailable'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert page.locator('#retry-guide').is_visible()
    context.unroute('**/index.html');page.locator('#retry-guide').click();page.wait_for_selector('#resort-map',state='attached')
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

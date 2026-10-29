"""Check the mobile-first, self-contained services guide using local Chromium.
Source-change tests intercept requests; no production data or orders are changed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8023'
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=['coordination','dining','cinema','seating','packages','resort-map']
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(430,932),(1440,1000)]:
        context=browser.new_context(viewport={'width':width,'height':height},permissions=['clipboard-read','clipboard-write'],reduced_motion='reduce')
        page=context.new_page();errors=[];broken=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('response',lambda r:broken.append(r.url) if r.status>=400 and r.url.startswith(BASE) else None)
        page.goto(BASE+'/services-guide/',wait_until='networkidle')
        page.wait_for_selector('#packages')
        assert page.locator('.guide-section').evaluate_all('(els)=>els.map(e=>e.id)')==SECTIONS
        assert page.locator('.contents a').count()==6
        bounds=page.locator('.contents').bounding_box()
        assert bounds['y']+bounds['height']<height,('Index must fit opening screen',width,bounds)
        assert page.locator('#hospitality,#restaurant,#games,#water-games').count()==0
        assert page.locator('a').evaluate_all('(els)=>els.every(a=>a.getAttribute("href").startsWith("#"))')
        assert page.locator('#coordination .package-card').count()==6
        expected_names=['باقة الورد','باقة الورد المتكاملة','باقة الأمسية','باقة الاحتفال','باقة VIP','باقة منتجع يوم العائلة']
        assert page.locator('#coordination h3').all_text_contents()==expected_names
        assert page.locator('#coordination .price').all_text_contents()==['120 ريال','350 ريال','650 ريال','850 ريال','1150 ريال','1850 ريال']
        inclusions=[c.locator('.inclusions li').all_text_contents() for c in page.locator('#coordination .package-card').all()]
        for left in inclusions:
            for right in inclusions:
                shared=set(left)&set(right)
                assert [v for v in left if v in shared]==[v for v in right if v in shared]
        assert not any('بوكيه' in v for v in inclusions[4])
        assert any('بوكيه' in v for v in inclusions[5])
        assert all(v in inclusions[5] for v in inclusions[4])
        assert page.locator('#packages .package-card').count()==2
        celebration=page.locator('#coordination .package-card').filter(has_text='باقة الاحتفال')
        assert celebration.locator('.inclusions li').count()==9
        assert 'باقة يوم العائلة المتكاملة' not in page.locator('#coordination').text_content()
        assert 'باقة يوم العائلة المتكاملة' not in page.locator('#packages').inner_text()
        assert 'ملاحظات' not in page.locator('#guide-content').text_content()
        assert page.locator('#seating .photo-card').count()==6
        assert page.locator('#dining tbody tr').count()==5
        # Every index entry and the sticky return stay in this document.
        for name in SECTIONS:
            page.locator('.contents a[href="#'+name+'"]').click()
            page.wait_for_timeout(100)
            assert page.url==BASE+'/services-guide/#'+name
            y=page.locator('#title-'+name).bounding_box()['y']
            assert 50<=y<height,(width,name,y)
            page.locator('.reading-bar a').click()
            page.wait_for_timeout(100)
            assert page.locator('.contents').is_visible()
            assert page.locator('.contents').bounding_box()['y']<height
        page.locator('.contents a[href="#coordination"]').click()
        celebration.locator('summary').click()
        assert celebration.get_attribute('open') is not None
        assert celebration.locator('.inclusions').is_visible()
        assert page.url.endswith('#coordination')
        page.locator('details').evaluate_all('(els)=>els.forEach(el=>el.open=true)')
        page.locator('img').evaluate_all('(els)=>els.forEach(el=>el.loading="eager")')
        page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        # Every map label selects its cabin, showing only a name and square photo.
        cabins=page.evaluate('data.resort.items')
        plotted=page.evaluate('FD_RESORT_MAP_DATA.locations')
        assert len(plotted)==13
        assert page.locator('.map-choices').count()==0
        for location in plotted:
            cid=location['cabinId'];cabin=next(c for c in cabins if c['id']==cid)
            page.locator(f'svg [data-map-cabin="{cid}"] .map-label').click()
            assert page.locator('#guide-cabin-title').inner_text()==cabin['name']
            assert page.locator(f'svg [data-map-cabin="{cid}"]').get_attribute('aria-pressed')=='true'
            assert page.locator('svg .is-selected').count()==1
            assert page.locator('#guide-cabin-card dl, #guide-cabin-card details, #guide-cabin-card p').count()==0
            if cid!=11:
                photo=page.locator('#guide-cabin-card .cabin-photo')
                photo.evaluate('(el)=>el.decode()')
                rect=photo.bounding_box()
                assert abs(rect['width']-rect['height'])<1,(width,cid,rect)
            assert '/services-guide/' in page.url
            page.locator('#close-cabin').click()
            assert page.locator('#guide-cabin-card').is_hidden()
        # Map labels support touch and keyboard.
        page.locator('svg [data-map-cabin="13"] .map-label').click()
        assert page.locator('#guide-cabin-title').inner_text()==next(c['name'] for c in cabins if c['id']==13)
        page.locator('#close-cabin').click()
        page.locator('svg [data-map-cabin="1"]').focus()
        page.keyboard.press('Enter')
        assert page.locator('#guide-cabin-title').inner_text()==next(c['name'] for c in cabins if c['id']==1)
        page.locator('#close-cabin').click()
        page.locator('#map-zoom').click()
        assert page.locator('#map-zoom').get_attribute('aria-pressed')=='true'
        assert page.locator('.map-scroll').evaluate('(el)=>el.scrollWidth>el.clientWidth')
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        page.locator('#map-zoom').click()
        assert page.locator('#map-zoom').get_attribute('aria-pressed')=='false'
        # Force clipboard path, without invoking any external share destination.
        page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true})")
        page.locator('[data-share]').click()
        assert page.evaluate('navigator.clipboard.readText()')==BASE+'/services-guide/'
        assert not errors,errors
        assert not broken,broken
        print(width,'PASS opening index, five services and inline map, in-page navigation/details, images, sharing and no overflow',flush=True)
        context.close()
    # A direct link resolves after source content arrives.
    page=browser.new_page(viewport={'width':390,'height':844})
    page.goto(BASE+'/services-guide/#cinema',wait_until='networkidle')
    assert 50<=page.locator('#title-cinema').bounding_box()['y']<150
    page.close()
    # Changes to the existing copy, shared price data, and images appear automatically.
    context=browser.new_context();page=context.new_page()
    source=(ROOT/'index.html').read_text().replace('قلب أو حرف من الورد الطبيعي على السرير، حسب اختيارك.','تفصيل تجريبي للتحقق').replace('<dd class="cn-price">150 ريال</dd>','<dd class="cn-price">173 ريال</dd>')
    data=(ROOT/'service-data.js').read_text().replace("price:'300 ريال'","price:'333 ريال'",1).replace("img:'imgs/jalsat_1.webp'","img:'imgs/jalsat_2.webp'",1)
    context.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
    context.route('**/service-data.js?*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert 'تفصيل تجريبي للتحقق' in page.locator('#coordination').text_content()
    assert '173 ريال' in page.locator('#cinema').inner_text()
    assert '333 ريال' in page.locator('#seating .photo-card').first.inner_text()
    assert page.locator('#seating .photo-card img').first.get_attribute('src')=='/imgs/jalsat_2.webp'
    context.close()
    context=browser.new_context();page=context.new_page()
    context.route('**/index.html',lambda r:r.fulfill(status=503,body='unavailable'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert page.locator('#retry-guide').is_visible()
    assert page.locator('.load-error a').count()==0
    context.unroute('**/index.html')
    page.locator('#retry-guide').click();page.wait_for_selector('#packages')
    page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
    page.locator('[data-share]').click()
    assert page.locator('#share-dialog').is_visible()
    assert page.locator('#share-link').input_value()==BASE+'/services-guide/'
    page.locator('#close-share').click()
    assert page.locator('#share-dialog').is_hidden()
    context.close();browser.close()
    print('PASS direct anchor, automatic content/price/photo updates, retry and share fallback')

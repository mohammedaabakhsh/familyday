"""Catalogue regressions: source parity, responsive content, links, sharing and recovery.
Run against a local server. Source-update tests intercept requests; no live data is modified.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE = sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8022'
ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width, height in [(1440,1000),(390,844),(320,740)]:
        context = browser.new_context(viewport={'width':width,'height':height},permissions=['clipboard-read','clipboard-write'],reduced_motion='reduce')
        page = context.new_page(); errors=[]; broken=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.on('response',lambda r: broken.append(r.url) if r.status>=400 and r.url.startswith(BASE) else None)
        page.goto(BASE+'/services-guide/',wait_until='networkidle')
        page.wait_for_selector('#restaurant')
        assert page.title()=='دليل خدمات منتجع يوم العائلة'
        assert page.locator('.guide-section').count()==9
        for name,count in [('hospitality',3),('coordination',4),('packages',2)]:
            assert page.locator(f'#{name} .package-card').count()==count
        complete = page.locator('#coordination .package-card').filter(has_text='باقة يوم العائلة المتكاملة')
        assert complete.locator('.inclusions li').count()==28
        assert 'باقة يوم العائلة المتكاملة' not in page.locator('#packages').inner_text()
        assert page.locator('#seating .photo-card').count()==6
        assert page.locator('#dining tbody tr').count()==5
        assert page.locator('#water-games figure').count()==14
        assert page.locator('#restaurant .menu-list li').count()==47
        assert '9 صباحًا' in page.locator('#restaurant').inner_text()
        # Every section anchor lands below the sticky navigation.
        for anchor in page.locator('.category-nav a').evaluate_all('(els)=>els.map(a=>a.hash)'):
            page.evaluate('(hash)=>location.hash=hash',anchor)
            page.wait_for_timeout(60)
            pos=page.locator(anchor).bounding_box()['y']
            assert 65<=pos<=110,(width,anchor,pos)
        # Expand all details, load all lazy images, and check narrow viewport sizing.
        page.locator('details').evaluate_all('(els)=>els.forEach(el=>el.open=true)')
        page.locator('img').evaluate_all('(els)=>els.forEach(el=>el.loading="eager")')
        page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
        page.locator('#coordination [data-share]').click()
        assert page.evaluate('navigator.clipboard.readText()')==BASE+'/services-guide/#coordination'
        page.locator('#coordination').scroll_into_view_if_needed()
        page.screenshot(path=f'/tmp/guide-coordination-{width}.png')
        assert not errors,errors
        assert not broken,broken
        print(width,'PASS sections, current contents/prices, images, overflow, anchors and copying',flush=True)
        context.close()
    # Direct sharing must work before asynchronous content has arrived.
    page=browser.new_page()
    page.goto(BASE+'/services-guide/#seating',wait_until='networkidle')
    assert 65<=page.locator('#seating').bounding_box()['y']<=110
    page.locator('#coordination .service-link').click()
    page.wait_for_selector('#hd-coordination-panel:not(.hide)')
    assert page.locator('#hd-hospitality-panel').is_hidden()
    assert page.locator('#hd-packages-panel').is_hidden()
    page.close()
    # Updates to both kinds of source must be reflected without editing guide content.
    context=browser.new_context();page=context.new_page()
    source=(ROOT/'index.html').read_text().replace('تبخير الكوخ بالعود','ضيافة تجريبية للتحقق').replace('<dd class="cn-price">150 ريال</dd>','<dd class="cn-price">173 ريال</dd>')
    data=(ROOT/'service-data.js').read_text().replace("name:'ساندويتش دجاج زنجر',price:11","name:'ساندويتش دجاج زنجر',price:13")
    context.route('**/index.html',lambda r:r.fulfill(body=source,content_type='text/html'))
    context.route('**/service-data.js?*',lambda r:r.fulfill(body=data,content_type='text/javascript'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert 'ضيافة تجريبية للتحقق' in page.locator('#hospitality').inner_text()
    assert '173 ريال' in page.locator('#cinema').inner_text()
    assert '13 ريال' in page.locator('#restaurant li').filter(has_text='ساندويتش دجاج زنجر').text_content()
    context.close()
    # Source failure, retry, and manual-copy fallback stay usable.
    context=browser.new_context();page=context.new_page()
    context.route('**/index.html',lambda r:r.fulfill(status=503,body='unavailable'))
    page.goto(BASE+'/services-guide/',wait_until='networkidle')
    assert page.locator('#retry-guide').is_visible()
    context.unroute('**/index.html')
    page.locator('#retry-guide').click();page.wait_for_selector('#restaurant')
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
    page.locator('#games [data-share]').click()
    assert page.locator('#share-dialog').is_visible()
    assert page.locator('#share-link').input_value()==BASE+'/services-guide/#games'
    page.locator('#close-share').click()
    assert not page.locator('#share-dialog').is_visible()
    context.close();browser.close()
    print('PASS direct links, correct service tab, automatic source updates, failure/retry and copy fallback')

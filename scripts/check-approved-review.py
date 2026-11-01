"""Check the approved wording, facts and responsive UI without sending orders."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
import os
import sys
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8023'
FONT = Path(os.environ.get('FD_TEST_FONT_CSS', '/nonexistent-font.css'))  # Optional offline font fixture.
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320,740),(390,844),(1440,1000)]:
        context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce')
        if FONT.exists():
            context.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body=FONT.read_text(),content_type='text/css'))
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE+'/',wait_until='networkidle')
        page.wait_for_selector('#dest:not(.hide)')
        page.evaluate('document.fonts.ready')
        boxes = [c.bounding_box() for c in page.locator('.dest-card').all()]
        assert len(boxes)==3 and all(b for b in boxes)
        if width>=1024:
            assert max(b['y'] for b in boxes)-min(b['y'] for b in boxes)<1
        else:
            assert all(boxes[i+1]['y']>=boxes[i]['y']+boxes[i]['height'] for i in range(2))
        assert all(0<=b['x'] and b['x']+b['width']<=width for b in boxes)
        page.screenshot(path=f'/tmp/review-destinations-{width}.png')
        page.goto(BASE+'/cabins/',wait_until='networkidle')
        assert page.locator('#grid .card-img-wrap img').evaluate_all('(els)=>els.length===13&&els.every(e=>!!e.alt)')
        assert page.locator('#grid .fd-dome-tour-link').all_text_contents()[:12]==['استكشف الكوخ من الداخل ←']*12
        # Lounge availability must survive descriptive copy changes.
        page.evaluate("data.resort.items.find(c=>c.id===2).features.indoor=[];FD_CABIN_COMPARE.show([2,4])")
        row=page.locator('.fd-compare-table tr').filter(has=page.locator('th',has_text='صالة داخلية'))
        assert row.locator('td').all_text_contents()==['متوفرة','متوفرة']
        page.evaluate('FD_CABIN_COMPARE.show([12,13])')
        assert row.locator('td').all_text_contents()==['مدمجة مع غرفة النوم','متوفرة']
        assert not page.locator('.fd-compare-table').evaluate('(e)=>/\\b(?:cm|m)\\b/.test(e.innerText)')
        for path in ['/cabins/dome-1/','/cabins/dome-2/','/stay/ground-floor/','/chalet/details/']:
            page.goto(BASE+path,wait_until='networkidle')
            assert page.locator('#modalBookBtn').inner_text()=='الأسعار والتوفر'
            assert page.locator('#modalBookBtn').get_attribute('href').startswith('https://familyday-sa.com/')
            if 'dome' in path:
                assert 'صالة جلوس مدمجة مع غرفة النوم' in page.locator('#mBody').text_content()
                assert not page.locator('#mBody').evaluate('(e)=>/\\b(?:cm|m)\\b/.test(e.innerText)')
        page.goto(BASE+'/services/hospitality/',wait_until='networkidle')
        for card in page.locator('#hospitality-detail .hd-package').all():
            name=card.locator('.hd-package-name').text_content().strip()
            link=card.locator('.hd-package-order');url=urlparse(link.get_attribute('href'))
            assert link.text_content()=='اطلب الباقة عبر واتساب'
            assert url.netloc=='wa.me' and url.path=='/966556156693'
            assert name in parse_qs(url.query)['text'][0]
        assert page.locator('.hd-package-order').count()==9
        page.screenshot(path=f'/tmp/review-hospitality-{width}.png')
        # Legacy saved cart names retain the same quantities and current price.
        page.evaluate("localStorage.setItem('familyday.menu-cart.v1',JSON.stringify({version:1,items:[{name:'كوبين ثلج',qty:3}]}))")
        page.goto(BASE+'/menu/',wait_until='networkidle')
        assert page.evaluate('_menuCart')=={'كوبان من الثلج':{'price':5,'qty':3}}
        page.reload(wait_until='networkidle')
        assert page.evaluate('_menuCartTotals()')=={'qty':3,'price':15}
        assert not errors, errors
        print(width,'PASS destination layout, comparison, dome details, price links, package links and saved ice quantities',flush=True)
        context.close()
    routes=['dome-tour/?cabin=1','dome-tour/?cabin=12','greek-tour/?cabin=4','greek-tour/?cabin=13','pyramid-tour/','classic-tour/','palm-tour/','french-tour/','rustic-tour/','royal-tour/','bohemian-tour/','panoramic-tour/']
    for width in [320,390,800,1440]:
        page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
        tour_errors=[]
        page.on('pageerror',lambda error:tour_errors.append(str(error)))
        for route in routes:
            page.goto(BASE+'/'+route,wait_until='networkidle')
            assert page.locator('.dt-title').inner_text().startswith('استكشف ')
            for button in page.locator('.dt-label').all():
                button.click()
                text=page.locator('#dt-details').inner_text()
                assert text.strip(), (route,button.inner_text())
                assert 'كنبتان' not in text and 'الصالة الداخلية' not in text
                assert not page.locator('#dt-details').evaluate('(e)=>/\\b(?:cm|m)\\b/.test(e.innerText)')
                if button.inner_text()=='طاولة الطعام': assert 'طاولة الطعام' in text
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
            page.locator('.dt-image').evaluate('(el)=>el.decode()')
            page.wait_for_timeout(50)
            geometry=page.locator('.dt-tour').evaluate('''root=>{
              const image=root.querySelector('.dt-image').getBoundingClientRect();
              return Array.from(root.querySelectorAll('.dt-point'),point=>{
                const r=point.getBoundingClientRect();
                const path=root.querySelector('[data-line="'+point.dataset.part+'"]').getAttribute('d');
                return {inside:r.x+r.width/2>=image.x-1&&r.x+r.width/2<=image.right+1&&r.y+r.height/2>=image.y-1&&r.y+r.height/2<=image.bottom+1,path};
              });
            }''')
            assert geometry and all(point['inside'] and point['path'] and 'NaN' not in point['path'] for point in geometry),(width,route,geometry)
            assert page.locator('.dt-label[aria-pressed="true"]').count()==1
            assert page.locator('.dt-point.is-selected').count()==1
            assert page.locator('.dt-lines .is-selected').count()==1
        assert not tour_errors,tour_errors
        print(width,'PASS all 12 cabin explorations, panel content and responsive marker geometry',flush=True)
        page.close()
    page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
    page.goto(BASE+'/chalet-map/',wait_until='networkidle')
    assert page.locator('#cm-title').inner_text()=='استكشف الشاليه من الداخل'
    for button in page.locator('.cm-label').all():
        button.click()
        assert not page.locator('.cm-cards').evaluate('(e)=>/\\bcm\\b/.test(e.innerText)')
    print('PASS all 12 cabin explorations and chalet exploration',flush=True)
    browser.close()

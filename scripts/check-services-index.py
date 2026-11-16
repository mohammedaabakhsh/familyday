"""Check the independent occasion links, responsive index and retired entries."""
from pathlib import Path
import json
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8056'
catalog = json.loads((ROOT / 'share-pages.json').read_text())
expected = {
    '/services/hospitality/packages/': ('الضيافة', '#hd-hospitality-panel'),
    '/services/coordination/': ('التنسيقات', '#hd-coordination-panel'),
    '/services/cinema/': ('جلسة السينما', '#sinema-detail'),
    '/services/dining-tables/': ('طاولات الطعام', '#tawilat-detail'),
    '/services/outdoor-seating/': ('الجلسات الخارجية', '#jalsat-detail'),
}
approved_descriptions={
    'التنسيقات':'نجهّز مناسباتكم بكل تفاصيلها',
    'جلسة السينما':'استمتع بتجربة سينما في مساحتك الخاصة',
    'الجلسات الخارجية':'جلسات تجمعكم في مساحتكم الخارجية الخاصة',
    'شارك بفيديو… ويومك الجاي علينا':'انشر الفيديو ونافس بالمشاهدات',
    'شارك واربح':'صوّر تجربتك وأرسلها لنا',
}
for path in ['/services/hospitality/', '/services/setups/']:
    assert not (ROOT / path.strip('/') / 'index.html').exists(), path
    assert not any(entry['path'] == path for entry in catalog), path

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320,568), (375,667), (390,709), (390,741), (390,844),
                          (393,852), (768,1024), (1024,768), (1366,768), (1440,900)]:
        page = browser.new_page(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + '/services/', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        overlay = page.locator('#services-overlay')
        metrics = overlay.evaluate('(el)=>({visible:el.clientHeight,total:el.scrollHeight})')
        if width < 1024:
            boxes=page.locator('.svcs-card').evaluate_all('(els)=>els.map(e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})')
            full=boxes[0]['w']
            assert all(abs(box['w']-full)<1 for box in boxes)
            assert all(boxes[i]['y']>=boxes[i-1]['y']+boxes[i-1]['h'] for i in range(1,len(boxes)))
            name_size=page.locator('.svcs-name').first.evaluate('(e)=>parseFloat(getComputedStyle(e).fontSize)')
            assert name_size>=17
            assert min(box['h'] for box in boxes)>=50
            last=page.locator('.svcs-card').last
            last.scroll_into_view_if_needed()
            assert last.is_visible() and last.bounding_box()['y']+last.bounding_box()['height']<=height+1
            overlay.evaluate('el=>el.scrollTop=0')
        assert page.locator('.svcs-card').count()==11
        assert page.locator('.svcs-card').evaluate_all('(els)=>els.every(el=>el.getBoundingClientRect().height>=44)')
        assert page.locator('.svcs-description').count()==5
        for card in page.locator('.svcs-card').all():
            label=card.locator('.svcs-name').inner_text()
            description=card.locator('.svcs-description')
            copy=approved_descriptions.get(label)
            assert description.count()==(1 if copy else 0),label
            if copy:assert description.inner_text()==copy,label
            describedby=card.get_attribute('aria-describedby')
            if describedby:assert page.locator('[id="'+describedby+'"]').count()==1
        for path, (label, panel) in expected.items():
            entry = next(entry for entry in catalog if entry['path'] == path)
            card = page.locator('.svcs-card[href="' + path + '"]')
            assert card.locator('.svcs-name').inner_text() == label
            # Modified clicks retain native browser link behavior.
            assert card.evaluate("el=>openPreparationService({button:0,ctrlKey:true},el.getAttribute('onclick').split(\"'\")[1])") is True
            card.click()
            page.wait_for_url(BASE + path)
            assert page.locator(panel).is_visible()
            assert page.title() == entry['title']
            assert page.locator('#hospitality-detail [role=tab],#setups-detail [role=tab]').count() == 0
            for _, other_panel in expected.values():
                if other_panel != panel: assert page.locator(other_panel).is_hidden()
            page.go_back(wait_until='networkidle')
            page.wait_for_url(BASE + '/services/')
        if width in [390, 1440]:
            page.screenshot(path=f'/tmp/services-index-{width}x{height}.png')
        assert not errors, errors
        print(width, height, 'PASS five links, descriptions, Back, responsive layout and touch targets', metrics, flush=True)
        page.close()
    browser.close()

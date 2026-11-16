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
    '/services/cinema/': ('السينما', '#sinema-detail'),
    '/services/dining-tables/': ('طاولات الطعام', '#tawilat-detail'),
    '/services/outdoor-seating/': ('الجلسات الخارجية', '#jalsat-detail'),
}
for path in ['/services/hospitality/', '/services/setups/']:
    assert not (ROOT / path.strip('/') / 'index.html').exists(), path
    assert not any(entry['path'] == path for entry in catalog), path

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(320,568), (375,667), (390,741), (390,844),
                          (393,852), (768,1024), (1024,768), (1366,768), (1440,900)]:
        page = browser.new_page(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + '/services/', wait_until='networkidle')
        page.evaluate('document.fonts.ready')
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        overlay = page.locator('#services-overlay')
        metrics = overlay.evaluate('(el)=>({visible:el.clientHeight,total:el.scrollHeight})')
        if height >= 667:
            assert metrics['total'] <= metrics['visible'] + 1, (width, height, metrics)
        if width < 600:
            assert page.locator('.svcs-card').evaluate_all('(els)=>els.every(el=>Math.abs(el.getBoundingClientRect().width-els[0].getBoundingClientRect().width)<1)')
        assert page.locator('.svcs-card').count() == 11
        assert page.locator('.svcs-card').evaluate_all('(els)=>els.every(el=>el.getBoundingClientRect().height>=44)')
        assert page.locator('.svcs-description').count() == 11
        for path, (label, panel) in expected.items():
            entry = next(entry for entry in catalog if entry['path'] == path)
            card = page.locator('.svcs-card[href="' + path + '"]')
            assert card.locator('.svcs-name').inner_text() == label
            assert card.locator('.svcs-description').inner_text() == entry['description']
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

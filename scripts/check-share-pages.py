"""Integration checks against a local server. Requires Python Playwright and Chromium.
Run: python3 -m http.server 8015; python3 scripts/check-share-pages.py http://127.0.0.1:8015
"""
from pathlib import Path
from urllib.request import urlopen
from html.parser import HTMLParser
import json
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8015'
pages = json.loads((ROOT / 'share-pages.json').read_text())

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__(); self.values = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta': self.values[attrs.get('property', attrs.get('name'))] = attrs.get('content')

for entry in pages:
    parser = Metadata(); parser.feed(urlopen(BASE + entry['path']).read().decode())
    assert parser.values.get('og:title'), entry['path']
    assert parser.values.get('og:description'), entry['path']
    assert parser.values.get('og:url') == 'https://familydaystay.com' + entry['path'], entry['path']
    if entry['entry']:
        assert parser.values['og:title'] == entry['title'], entry['path']
        assert 'og:image' not in parser.values, entry['path']
for path in ROOT.glob('*-tour/index.html'):
    parser=Metadata(); parser.feed(path.read_text())
    assert parser.values.get('og:title') and parser.values.get('og:description'), str(path)
print(f'PASS first-response metadata: {len(pages)} routes and illustrated tour pages', flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width,height in [(1440,1000),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height});errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        for entry in pages:
            if entry['route']=='contest': continue # Already a standalone page, audited above.
            page.goto(BASE+entry['path'],wait_until='networkidle')
            aliases={'sinema':'cinema','tawilat':'dining','jalsat':'seating'}
            tab=aliases.get(entry['route'])
            expected_path='/services/setups/'+(('?tab='+tab) if tab and tab!='cinema' else '') if tab else entry['path']
            expected_title='الجلسات والتجهيزات | يوم العائلة' if tab else entry['title']
            assert page.title()==expected_title, (entry['path'],page.title())
            assert page.url==BASE+expected_path, (entry['path'],page.url)
            route=page.evaluate('history.state.route')
            key=route['name']+('='+str(route['args'][0]) if route['name'] in ['home','contact','cabin'] else '')
            assert key==('setups' if tab else entry['route']), (entry['path'],key)
            if tab: assert route['args']==[tab]
            if route['name']=='cabin':
                assert page.locator('#ov').evaluate('(e)=>e.classList.contains("open")')
                if route['args'][0]<20: assert page.locator('#fd-cabin-detail-title').inner_text() in entry['title']
                else: assert ('القسم الأول' if route['args'][0]==20 else 'القسم الثاني') in page.locator('#mBody').inner_text()
                assert page.evaluate(f'cabinShareURL({route["args"][0]})')==BASE+entry['path']
            elif route['name'] in ['menu','hospitality','setups','maiya','tarfihi','sharik','walaa']:
                assert page.locator('#'+route['name']+'-detail').is_visible(), entry['path']
            assert not errors, (entry['path'],errors)
            print(width, entry['path'], 'PASS direct open, title, canonical route', flush=True)
        page.close()
    browser.close()

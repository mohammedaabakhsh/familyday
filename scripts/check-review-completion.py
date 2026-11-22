"""Exercise approved covers, single sharing action, minibar cards and Western digits.

Shares and clipboard writes are intercepted locally; no message/order is sent.
"""
from pathlib import Path
from html import unescape
from urllib.parse import urlparse
import json,re,subprocess,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
BASELINE='1d716affc4b0634a6a9ce94fd62a1dfa010ca5a5'
# The selected source image moves first without disturbing the other photos.
covers={1:'dome_6.webp',12:'dome_7.webp',2:'harami_3.webp',3:'classic_5.webp',4:'greek_2.webp',5:'palm_3.webp',6:'boho_3.webp',9:'royal_6.webp',10:'panorama_2.webp',30:'chalet_2.webp'}
baseline_source=subprocess.check_output(['git','show',BASELINE+':js/gallery-data.js'],cwd=ROOT,text=True)
baseline_source+='\nGALLERY[30]=Array.from({length:18},(_,i)=>"imgs/chalet_"+(i+1)+".webp");\nJSON.stringify(GALLERY);'
script='const vm=require("vm");process.stdout.write(vm.runInNewContext('+json.dumps(baseline_source)+'));'
baseline=json.loads(subprocess.check_output(['node','-e',script],text=True))
for source in ROOT.rglob('*'):
    if '.git' in source.parts or 'scripts' in source.parts or source.suffix not in ['.html','.js','.json']:continue
    content=source.read_text()
    assert not re.search('[٠-٩۰-۹]',unescape(content)),source
print('PASS no Arabic/Persian numeric glyphs in website text sources',flush=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(1440,900)]:
        page=browser.new_page(viewport={'width':width,'height':height},locale='ar-SA',reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE+'/cabins/',wait_until='networkidle');page.evaluate('document.fonts.ready')
        title=page.locator('#headerTitle');count=title.locator('.fd-cabin-total')
        assert ' '.join(title.text_content().split())=='الأكواخ (12 كوخ خاص + حديقة مشتركة)'
        a=title.bounding_box();b=count.bounding_box();m=page.locator('#fd-map-open').bounding_box()
        assert a['y']<=b['y'] and b['y']+b['height']<=a['y']+a['height']
        assert width>=900 or m['x']+m['width']<a['x']
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        galleries=page.evaluate('GALLERY')
        for key,original in baseline.items():
            clean=lambda src:urlparse(src).path.rsplit('/',1)[-1]
            expected=[clean(src) for src in original]
            if int(key) in covers:
                name=covers[int(key)];expected=[name]+[src for src in expected if src!=name]
            actual=[clean(src) for src in galleries[key]]
            if key=='21':expected=[src.replace('sec2_3.webp','sec2_3-enhanced-20261122.webp') for src in expected]
            assert actual==expected,(key,actual,expected)
        for path in ['/cabins/dome-1/','/cabins/greek-2/','/stay/ground-floor/','/stay/upper-floor/','/chalet/details/']:
            page.goto(BASE+path+'?fbclid=test'+('&from=map' if path.startswith('/cabins/') else ''),wait_until='networkidle')
            share=page.locator('#fd-cabin-share');back=page.locator('.fd-cabin-nav-back')
            assert share.is_visible() and share.bounding_box()['x']<back.bounding_box()['x'],(width,path)
            assert page.locator('#fd-cabin-sharing').count()==0
            assert page.locator('#modalBookBtn').is_visible() and page.locator('.fd-cabin-inquiry').is_visible()
            assert 'wa.me/966556156693' in page.locator('.fd-cabin-inquiry').get_attribute('href')
            page.evaluate("Object.defineProperty(navigator,'share',{value:async v=>window.shareResult=v,configurable:true})")
            share.click();assert page.evaluate('window.shareResult.url')==BASE+path
            # Dismissing native sharing must not copy a link or show an error.
            page.evaluate("Object.defineProperty(navigator,'share',{value:async()=>{throw new DOMException('cancelled','AbortError')},configurable:true});Object.defineProperty(navigator,'clipboard',{value:{writeText:async v=>window.copied=v},configurable:true});window.copied=null")
            share.click();assert page.evaluate('window.copied') is None
            assert page.locator('#fd-cabin-share-status').inner_text()=='' and share.is_enabled()
            # Clipboard fallback; lack of the Clipboard API still uses the one button.
            page.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true})")
            share.click();assert page.evaluate('window.copied')==BASE+path
            page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true});document.execCommand=cmd=>{window.copyCommand=cmd;return true}")
            share.click();assert page.evaluate('window.copyCommand')=='copy'
            assert page.locator('#fd-cabin-share-status').inner_text()=='تم نسخ الرابط'
            assert page.locator('.fd-copy-buffer').count()==0
        # No stale share target when moving from a cabin to the shared garden.
        page.goto(BASE+'/cabins/dome-1/',wait_until='networkidle');page.evaluate("openM(11,'resort')")
        assert page.locator('#fd-cabin-share').is_hidden()
        page.evaluate("openM(12,'resort')");assert page.locator('#fd-cabin-share').is_visible()
        assert page.locator('#fd-cabin-share').get_attribute('data-cabin-id')=='12'
        assert not errors,errors
        print(width,'PASS title fit, complete gallery order, native share/cancel/fallback and garden reset',flush=True)
        page.close()
    page=browser.new_page(viewport={'width':320,'height':740},locale='ar-SA',reduced_motion='reduce')
    tours=['dome-tour/?cabin=1','dome-tour/?cabin=12','pyramid-tour/','classic-tour/','greek-tour/?cabin=4','greek-tour/?cabin=13','palm-tour/','bohemian-tour/','french-tour/','rustic-tour/','royal-tour/','panoramic-tour/']
    for path in tours:
        page.goto(BASE+'/'+path,wait_until='networkidle');page.locator('.dt-label[data-part="kitchen"]').click()
        minibar=page.locator('.dt-card--minibar');assert minibar.count()==1
        assert minibar.inner_text().splitlines()==['ميني بار','مشروبات وسناكس','برسوم إضافية']
        assert minibar.locator('svg').count()==0
        assert page.locator('.dt-card:not(.dt-card--minibar) svg').count()>0
        assert minibar.evaluate('e=>e.scrollHeight<=e.clientHeight+1 && e.scrollWidth<=e.clientWidth+1')
    print('PASS all 12 tours retain other kitchen icons and fit the three minibar lines',flush=True)
    entries=json.loads((ROOT/'share-pages.json').read_text())
    for entry in entries:
        page.goto(BASE+entry['path'],wait_until='networkidle')
        assert not re.search('[٠-٩۰-۹]',page.locator('body').text_content()),entry['path']
    print('PASS all public entry pages display Western digits in Arabic browser locale',flush=True)
    browser.close()

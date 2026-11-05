"""Check shared accommodation galleries, fullscreen return and instance isolation."""
import sys
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(1440,1000)]:
        page=browser.new_page(viewport={'width':width,'height':height},is_mobile=width<900,has_touch=width<900,reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        routes=[('cabins/dome-1',1),('cabins/dome-2',12),('cabins/pyramid',2),('cabins/classic',3),('cabins/greek-1',4),('cabins/greek-2',13),('cabins/palm-beach',5),('cabins/bohemian',6),('cabins/french',7),('cabins/rustic',8),('cabins/royal',9),('cabins/panoramic',10),('cabins/shared-garden',11),('stay/ground-floor',20),('stay/upper-floor',21),('chalet/details',30)]
        if width==320: routes=[routes[0],routes[-3],routes[-1]]
        for route,cabin_id in routes:
            page.goto(BASE+'/'+route+'/',wait_until='networkidle')
            page.locator('#ov.open').wait_for();page.wait_for_timeout(600)
            gallery=page.locator('#galWrap');track=gallery.locator('.fd-dome-track');count=gallery.locator('.fd-dome-count')
            sources=page.evaluate('id=>GALLERY[id]',cabin_id);total=len(sources)
            assert gallery.locator('.fd-dome-slide img').evaluate_all('(els)=>els.map(e=>e.getAttribute("src"))')==sources
            assert gallery.locator('.fd-dome-gallery-trigger,#gal-counter,.gal-img').count()==0
            assert gallery.locator('.fd-dome-controls').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
            assert count.inner_text()==f'1 / {total}'
            gallery.locator('.fd-dome-next').click()
            page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'2 / {total}')
            gallery.locator('.fd-dome-slide').nth(1).focus();page.keyboard.press('End')
            page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'{total} / {total}')
            assert gallery.locator('.fd-dome-next').is_disabled()
            gallery.locator('.fd-dome-slide').last.focus();page.keyboard.press('Home')
            page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'1 / {total}')
            if width<900:
                gallery.evaluate('e=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(100)
                r=track.bounding_box();y=max(80,r['y']+r['height']/3)
                client=page.context.new_cdp_session(page)
                client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x']+55,'y':y}]})
                for x in range(75,int(r['width'])-20,25):
                    client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':r['x']+x,'y':y}]});page.wait_for_timeout(16)
                client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent!==s',arg=f'1 / {total}')
                assert not page.locator('#fsOverlay').evaluate('e=>e.classList.contains("open")')
            # The existing fullscreen viewer still returns to its current photo.
            page.evaluate('galIdx=2;updGal(GALLERY[curId].length)')
            gallery.locator('.fd-dome-slide').nth(2).click();page.locator('#fsOverlay.open').wait_for()
            page.evaluate('goFS(4)');page.keyboard.press('Escape')
            page.wait_for_function('!document.querySelector("#fsOverlay").classList.contains("open")')
            page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'5 / {total}')
            assert page.locator('#ov').evaluate('e=>e.classList.contains("open")')
            gallery.locator('.fd-dome-slide').nth(4).click();page.locator('#fsOverlay.open').wait_for();page.go_back()
            page.wait_for_function('!document.querySelector("#fsOverlay").classList.contains("open")')
            page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'5 / {total}')
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
            if cabin_id in [1,20,21,30]:
                gallery.locator('.fd-dome-slide img').nth(4).evaluate('e=>e.decode()')
                page.screenshot(path=f'/tmp/accommodation-gallery-{cabin_id}-{width}.png')
        # Switching destinations must replace, rather than accumulate, gallery state.
        for action,expected in [("openM(2,'resort')",2),("showSection2();openMDirect(_chaletItems2.find(c=>c.id===20))",20),("openPrivateChalet()",30),("openM(1,'resort')",1)]:
            page.evaluate(action)
            page.locator('.fd-dome-track').wait_for();page.wait_for_timeout(150)
            total=len(page.evaluate('id=>GALLERY[id]',expected))
            assert page.locator('.fd-dome-count').inner_text()==f'1 / {total}'
            assert page.locator('.fd-dome-controls').count()==1
            page.locator('.fd-dome-next').click();page.wait_for_function('document.querySelector(".fd-dome-count").textContent.startsWith("2 /")')
        assert not errors,errors
        print(width,'PASS',len(routes),'accommodations: sources, native swipe, arrows, fullscreen/Escape/Back and destination switching',flush=True)
        page.close()
    browser.close()

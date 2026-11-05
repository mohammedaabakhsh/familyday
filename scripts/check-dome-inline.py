"""Check Dome native galleries, fullscreen return and other-cabin isolation."""
import sys
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(1440,1000)]:
        page=browser.new_page(viewport={'width':width,'height':height},is_mobile=width<900,has_touch=width<900,reduced_motion='reduce')
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        for route,cabin_id in [('dome-1',1),('dome-2',12)]:
            page.goto(BASE+'/cabins/'+route+'/',wait_until='networkidle')
            page.locator('#ov.open').wait_for();page.wait_for_timeout(600)
            gallery=page.locator('#galWrap');track=gallery.locator('.fd-dome-track');count=gallery.locator('.fd-dome-count')
            sources=page.evaluate('id=>GALLERY[id]',cabin_id);total=len(sources)
            assert gallery.locator('.fd-dome-slide img').evaluate_all('(els)=>els.map(e=>e.getAttribute("src"))')==sources
            assert gallery.locator('.fd-dome-gallery-trigger,#gal-counter,.gal-img').count()==0
            assert gallery.locator('.fd-dome-controls').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
            assert count.inner_text()==f'1 / {total}'
            for i in range(2,total+1):
                gallery.locator('.fd-dome-next').click()
                page.wait_for_function('(s)=>document.querySelector(".fd-dome-count").textContent===s',arg=f'{i} / {total}')
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
        # Reusing the same detail wrapper must discard the Dome gallery and old observers.
        page.evaluate("openM(2,'resort')")
        page.locator('#gal-counter').wait_for();assert gallery.locator('.fd-dome-track').count()==0
        assert gallery.locator('.fd-dome-gallery-trigger').is_visible()
        page.evaluate("openM(1,'resort')")
        page.locator('.fd-dome-track').wait_for();page.wait_for_timeout(150)
        assert page.locator('.fd-dome-count').inner_text()==f'1 / {len(page.evaluate("GALLERY[1]"))}'
        assert page.locator('.fd-dome-controls').count()==1
        page.locator('.fd-dome-next').click();page.wait_for_function('document.querySelector(".fd-dome-count").textContent.startsWith("2 /")')
        page.locator('.fd-dome-slide img').nth(1).evaluate('e=>e.decode()')
        page.screenshot(path=f'/tmp/dome-inline-{width}.png')
        assert not errors,errors
        print(width,'PASS both Dome units: native swipe, arrows, boundaries, fullscreen/Escape/Back, isolated from other cabins',flush=True)
        page.close()
    browser.close()

"""Verify all cabin specifications remain reachable with swipe and arrow navigation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8051'
TOURS=['dome','pyramid','greek','bohemian','french','classic','royal','rustic','panoramic','palm']
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for width,height,tours in [(390,844,TOURS),(320,568,['french','pyramid','dome']),(390,700,['french']),(768,1024,['french','pyramid']),(1440,1000,['french','pyramid'])]:
        page.set_viewport_size({'width':width,'height':height})
        for tour in tours:
            page.goto(BASE+'/'+tour+'-tour/',wait_until='networkidle')
            page.wait_for_function("document.querySelector('.dt-image')?.naturalWidth>0")
            parts=page.locator('.dt-label').evaluate_all('(es)=>es.map(e=>e.dataset.part)')
            for part in parts:
                label=page.locator('.dt-label[data-part="'+part+'"]')
                if tour=='pyramid' and width<600:
                    bounds=label.bounding_box()
                    assert bounds['x']>=0 and bounds['x']+bounds['width']<=width+1,(width,part,bounds)
                label.click()
                assert label.get_attribute('aria-pressed')=='true'
                assert page.locator('.dt-image').evaluate('e=>e.naturalWidth>0')
                strip=page.locator('.dt-cards')
                if not strip.count():continue
                values=strip.locator('strong').all_text_contents()
                if not values:continue
                maximum=strip.evaluate('e=>e.scrollWidth-e.clientWidth')
                nav=page.locator('.dt-spec-navigation')
                if maximum>1 and nav.count():
                    page.wait_for_function("!document.querySelector('.dt-spec-navigation').hidden")
                    previous=page.locator('[data-spec-direction="previous"]')
                    following=page.locator('[data-spec-direction="next"]')
                    assert previous.is_disabled()
                    for _ in range(len(values)+1):
                        if following.is_disabled():break
                        following.click()
                        page.evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))")
                        page.wait_for_function("(()=>{const s=document.querySelector('.dt-cards');return Math.abs(s.scrollLeft)>0})()")
                    assert following.is_disabled(),(tour,width,part,'cannot reach last card')
                    assert strip.locator('strong').all_text_contents()==values
                    for _ in range(len(values)+1):
                        if previous.is_disabled():break
                        previous.click()
                        page.evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))")
                    assert previous.is_disabled(),(tour,width,part,'cannot return to first card')
                    # Native scrolling remains active; controls follow its position.
                    strip.evaluate('e=>e.scrollLeft=-e.scrollWidth')
                    page.wait_for_function("document.querySelector('[data-spec-direction=next]').disabled")
                    assert label.get_attribute('aria-pressed')=='true'
                elif nav.count():
                    assert not nav.is_visible(),(tour,width,part,'unnecessary navigation')
            assert not errors,errors
            print(width,height,tour,'PASS facilities, arrow boundaries and native scroll',flush=True)
    browser.close()

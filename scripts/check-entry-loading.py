"""Check splash timing and first-click navigation under delayed script loading."""
import asyncio
import sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8023'


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for delayed in [None, 'js/stay-navigation.js', 'js/router.js']:
            for path, manual in [('/', False), ('/', True), ('/cabins/dome-1/', False)]:
                page = await browser.new_page(viewport={'width':390, 'height':844})
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                # Font availability must not decide the navigation loading state.
                await page.route('https://fonts.googleapis.com/**', lambda route: route.fulfill(body='', content_type='text/css'))
                release = asyncio.Event()
                if delayed:
                    async def hold(route):
                        await release.wait()
                        await route.continue_()
                    await page.route('**/' + delayed + '*', hold)
                await page.goto(BASE + path, wait_until='commit')
                await page.wait_for_function('typeof enterMain === "function"')
                if manual:
                    await page.locator('#splashBtn').click()
                if delayed:
                    # Beyond both the original auto-entry delay and fade duration.
                    await page.wait_for_timeout(3000)
                    assert await page.locator('#splash').is_visible()
                    assert await page.locator('#splash').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
                    assert await page.locator('#dest').is_hidden()
                    release.set()
                await page.wait_for_load_state('load')
                if path == '/':
                    await page.wait_for_selector('#dest:not(.hide)', timeout=4000)
                    await page.locator('.dest-card').first.click()
                    await page.wait_for_url(BASE + '/resort/')
                    assert await page.locator('#landing').is_visible()
                    await page.go_back()
                    assert await page.locator('#dest').is_visible()
                    assert await page.locator('#splash').is_hidden()
                else:
                    await page.wait_for_selector('#ov.open')
                    await page.wait_for_timeout(700)
                    assert await page.locator('#splash').is_hidden()
                    assert await page.locator('#dest').is_hidden()
                    assert page.url == BASE + path
                    assert await page.locator('#mBody').is_visible()
                assert not errors, errors
                print(delayed or 'normal', path, 'manual' if manual else 'auto', 'PASS', flush=True)
                await page.close()
        await browser.close()


asyncio.run(main())

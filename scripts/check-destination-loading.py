"""Destination images start early; slow media must not block usable navigation."""
import asyncio
import re
import sys
from collections import Counter
from urllib.parse import urlsplit
from playwright.async_api import async_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8023'
PHOTOS = {'dome_1.webp', 'sec1_1.webp', 'chalet_1.webp'}
PATTERN = re.compile(r'/imgs/(dome_1|sec1_1|chalet_1)\.webp(?:\?|$)')


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for width in [390, 1440]:
            page = await browser.new_page(viewport={'width': width, 'height': 900})
            errors, requested = [], Counter()
            page.on('pageerror', lambda error: errors.append(str(error)))
            await page.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
            release = asyncio.Event()

            async def hold_photo(route):
                requested[urlsplit(route.request.url).path.rsplit('/', 1)[1]] += 1
                await release.wait()
                await route.continue_()

            await page.route(PATTERN, hold_photo)
            await page.goto(BASE + '/', wait_until='domcontentloaded')
            assert set(requested) == PHOTOS, requested
            assert await page.evaluate('_mainNavigationReady')
            assert await page.evaluate('document.readyState') != 'complete'
            await expect(page.locator('#dest')).to_be_hidden()
            await page.locator('#splashBtn').click()
            await expect(page.locator('#dest')).to_be_visible()
            # A stalled photo must not make the first destination click inert.
            await page.locator('[data-dest-photo="chalet"]').click()
            await page.wait_for_url(BASE + '/chalet/', wait_until='domcontentloaded')
            await expect(page.locator('#landing3')).to_be_visible()
            release.set()
            await page.wait_for_load_state('load')
            await page.go_back()
            await expect(page.locator('#dest')).to_be_visible()
            for destination, target in [('resort', '#landing'), ('stay', '#landing2')]:
                await page.locator('[data-dest-photo="' + destination + '"]').click()
                await page.wait_for_url(BASE + '/' + destination + '/')
                await expect(page.locator(target)).to_be_visible()
                await page.go_back()
                await expect(page.locator('#dest')).to_be_visible()
            assert requested == Counter({name: 1 for name in PHOTOS}), requested
            assert not errors, errors
            print(width, 'PASS: all photos requested before entry, one request each, usable navigation with stalled media', flush=True)
            await page.close()

        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        for path, view in [('/chalet/', '#landing3'), ('/resort/', '#landing'), ('/cabins/panoramic/', '#ov.open')]:
            await page.goto(BASE + path, wait_until='domcontentloaded')
            assert await page.locator('[data-destination-preload]').count() == 0
            await expect(page.locator(view)).to_be_visible()
        await page.goto(BASE + '/', wait_until='domcontentloaded')
        await expect(page.locator('[data-destination-preload]')).to_have_count(3)
        print('PASS: direct entries keep their own media priorities and correct views', flush=True)
        await browser.close()


asyncio.run(main())

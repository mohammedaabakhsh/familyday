"""Keyboard quantity focus in both restaurant UIs; never send an order."""
from playwright.sync_api import sync_playwright, expect
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8042'


def activate(page, control, key='Enter'):
    control.focus()
    page.keyboard.press(key)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [390, 1440]:
        for guest in [False, True]:
            context = browser.new_context(viewport={'width': width, 'height': 900})
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(BASE + ('/guest-services/' if guest else '/menu/'), wait_until='networkidle')
            if guest:
                activate(page, page.locator('#restaurant-card'))
                activate(page, page.locator('[data-category="ساندويتشات"] summary'))
                row = page.locator('[data-menu-name="ساندويتش دجاج زنجر"]')
                plus = row.locator('[data-step="1"]')
                minus = row.locator('[data-step="-1"]')
                qty = row.locator('output')
                cheese = row.locator('input[type="checkbox"]')
            else:
                row = page.get_by_role('article', name='ساندويتش دجاج زنجر', exact=True)
                plus = row.locator('.menu-qty-button:not(.menu-qty-button--minus)')
                minus = row.locator('.menu-qty-button--minus')
                qty = row.locator('.menu-qty')
                cheese = row.locator('.menu-extra')
            activate(page, plus)
            expect(plus).to_be_focused()
            expect(qty).to_have_text('1')
            # Press again without re-focusing: catches the original lost-focus bug.
            page.keyboard.press('Space')
            expect(plus).to_be_focused()
            expect(qty).to_have_text('2')
            activate(page, cheese, 'Space')
            expect(cheese).to_be_focused()
            activate(page, minus)
            expect(minus).to_be_focused()
            expect(qty).to_have_text('1')
            page.keyboard.press('Enter')
            expect(plus).to_be_focused()
            activate(page, plus)
            expect(qty).to_have_text('1')
            # A change initiated elsewhere must not steal focus back into the list.
            if not guest:
                category = page.locator('#menu-cats .is-active')
                category.focus()
                page.evaluate('menuQty("ساندويتش دجاج زنجر",11,1)')
                expect(category).to_be_focused()
                activate(page, page.locator('#menu-cats button').filter(has_text='بوكسات الشواء'))
                bbq = page.get_by_role('article', name='بوكس الشواء بدون فحم', exact=True)
                meat = bbq.get_by_role('button', name='لحم', exact=True)
                activate(page, meat)
                expect(meat).to_be_focused()
                add_bbq = bbq.locator('.menu-qty-button:not(.menu-qty-button--minus)')
                activate(page, add_bbq)
                expect(add_bbq).to_be_focused()
                activate(page, bbq.locator('.menu-qty-button--minus'))
                expect(add_bbq).to_be_focused()
            else:
                # The maximum also disables its active button; keep focus in the row.
                for _ in range(98):
                    page.keyboard.press('Enter')
                expect(qty).to_have_text('99')
                expect(minus).to_be_focused()
                page.keyboard.press('Enter')
                expect(qty).to_have_text('98')
                expect(minus).to_be_focused()
            assert not errors, errors
            print(width, 'guest' if guest else 'site', 'PASS keyboard add/repeat/extras/remove and focus boundaries', flush=True)
            context.close()
        page = browser.new_page(viewport={'width': width, 'height': 900})
        page.goto(BASE + '/services/', wait_until='networkidle')
        card = page.get_by_role('button', name='الجلسات والتجهيزات', exact=True)
        expect(card.locator('.svcs-description')).to_have_text('سينما، طاولات طعام، جلسات خارجية')
        assert card.get_attribute('aria-describedby') == 'svcs-setups-description'
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        page.screenshot(path=f'/tmp/services-description-{width}.png', full_page=True)
        page.close()
    browser.close()

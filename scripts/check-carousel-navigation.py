"""Check that arrow requests survive layout changes in both RTL carousels."""
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8051'

# Keep real observers, but allow a late layout notification to be replayed
# immediately after a click, before the debounced scroll handler runs.
OBSERVE = '''
window.auditResize = {};
const Native = ResizeObserver;
window.ResizeObserver = class extends Native {
  constructor(callback) { super(callback); this.callback = callback; }
  observe(target, ...args) {
    if (['grid', 'grid2'].includes(target.id)) {
      window.auditResize[target.id] = () => this.callback([{target}], this);
    }
    return super.observe(target, ...args);
  }
};
'''


def centered(page, grid_id, index):
    page.wait_for_function('''([id,index]) => {
      const grid = document.getElementById(id);
      const card = grid.querySelectorAll('.card:not(.hidden)')[index];
      const g = grid.getBoundingClientRect(), c = card.getBoundingClientRect();
      return Math.abs(g.left + g.width/2 - c.left - c.width/2) < 2;
    }''', arg=[grid_id, index])


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 768]:
        for motion in ['reduce', 'no-preference']:
            page = browser.new_page(
                viewport={'width': width, 'height': 740}, reduced_motion=motion)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.add_init_script(OBSERVE)
            for path, grid_id in [('/stay/sections/', 'grid2'), ('/cabins/', 'grid')]:
                page.goto(BASE + path, wait_until='networkidle')
                grid = page.locator('#' + grid_id)
                controls = page.locator('#' + grid_id + ' + .fd-carousel-controls')
                total = grid.locator('.card:not(.hidden)').count()
                page.wait_for_function('(id)=>!!window.auditResize[id]', arg=grid_id)
                page.evaluate('''id => {
                  const controls = document.getElementById(id).nextElementSibling;
                  controls.lastElementChild.click();
                  window.auditResize[id]();
                }''', grid_id)
                centered(page, grid_id, 1)
                assert controls.locator('.fd-carousel-count').inner_text() == f'2 من {total}'

                # Consecutive reverse/forward commands must retain the last request.
                page.evaluate('''id => {
                  const controls = document.getElementById(id).nextElementSibling;
                  controls.firstElementChild.click();
                  controls.lastElementChild.click();
                  window.auditResize[id]();
                }''', grid_id)
                centered(page, grid_id, 1)
                controls.locator('button').first.click()
                centered(page, grid_id, 0)
                assert controls.locator('button').first.is_disabled()
                grid.press('ArrowLeft')
                centered(page, grid_id, 1)
                if total == 2:
                    assert controls.locator('button').last.is_disabled()

                # Native scrolling still updates the counter, without an arrow click.
                grid.evaluate("e=>e.scrollTo({left:0,behavior:'instant'})")
                centered(page, grid_id, 0)
                page.wait_for_function('''([id,total]) =>
                  document.getElementById(id).nextElementSibling
                    .querySelector('.fd-carousel-count').textContent === '1 من ' + total
                ''', arg=[grid_id, total])
                if grid_id == 'grid':
                    page.locator('.fbtn[data-f="2"]').click()
                    centered(page, grid_id, 0)
                    assert controls.locator('.fd-carousel-count').inner_text() == '1 من 8'
            assert not errors, errors
            print(width, motion, 'PASS delayed layout, rapid arrows, keyboard, native scroll and filters', flush=True)
            page.close()
    browser.close()

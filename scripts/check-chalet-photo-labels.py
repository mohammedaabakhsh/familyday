"""Verify chalet photo names follow images in inline and fullscreen galleries."""
from playwright.sync_api import sync_playwright, expect
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8042'
LABELS = ['المسبح والمنطقة الخارجية', 'مسبح الأطفال', 'زحليقة المسبح', 'الدش الخارجي',
          'الصالة الداخلية', 'الصالة الداخلية', 'الصالة الداخلية', 'طاولة الطعام',
          'غرفة ألعاب الأطفال', 'غرفة ألعاب الأطفال', 'مدخل الغرف والدرج',
          'غرفة النوم الرئيسية', 'غرفة النوم الرئيسية', 'حمام غرفة النوم الرئيسية',
          'غرفة النوم الثانية', 'المطبخ', 'الحمام المشترك', 'المجلس المستقل']

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width in [320, 390, 1440]:
        page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE + '/chalet/details/', wait_until='networkidle')
        caption = page.locator('#galWrap .fd-gallery-caption')
        count = page.locator('#galWrap .fd-dome-count')
        for index, label in enumerate(LABELS):
            expect(caption).to_have_text(label)
            expect(count).to_have_text(f'{index + 1} / 18')
            image = page.locator('.fd-dome-slide img').nth(index)
            assert label in image.get_attribute('alt')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
            if index in [0, 13, 17]:
                image.evaluate('(e)=>e.decode()')
                page.screenshot(path=f'/tmp/chalet-caption-{width}-{index + 1}.png')
                page.locator('.fd-dome-slide').nth(index).click()
                expect(page.locator('#fsPhotoLabel')).to_have_text(label)
                expect(page.locator('#fsPhotoLabel')).to_be_visible()
                assert page.locator('#fsTrack img').nth(index).get_attribute('alt') == label
                page.screenshot(path=f'/tmp/chalet-fullscreen-caption-{width}-{index + 1}.png')
                page.keyboard.press('Escape')
                expect(caption).to_have_text(label)
            if index < len(LABELS) - 1:
                page.locator('.fd-dome-next').click()
        # Keyboard navigation and return from another fullscreen photo stay in sync.
        page.locator('.fd-dome-slide').last.focus()
        page.keyboard.press('Home')
        expect(caption).to_have_text(LABELS[0])
        page.locator('.fd-dome-slide').first.click()
        page.locator('#fsOverlay button[onclick="moveFS(1)"]').click()
        expect(page.locator('#fsPhotoLabel')).to_have_text(LABELS[1])
        page.keyboard.press('Escape')
        expect(caption).to_have_text(LABELS[1])
        # Caption lookup uses source identity, not its position or cache query.
        assert page.evaluate('galleryPhotoLabel(30,"/imgs/chalet_18.webp?v=new")') == LABELS[17]
        page.evaluate('GALLERY[30].reverse();openGalDirect(PRIVATE_CHALET)')
        expect(caption).to_have_text(LABELS[17])
        for source_id in [1]:
            page.evaluate('id=>openGalDirect({id:id,name:"اختبار"})', source_id)
            expect(caption).to_have_count(0)
            page.locator('.fd-dome-slide').first.click()
            expect(page.locator('#fsPhotoLabel')).to_be_hidden()
            page.keyboard.press('Escape')
        assert not errors, errors
        page.close()
        print(width, 'PASS 18 photo names, fullscreen, keyboard, source reorder and unlabelled cabin scope', flush=True)
    browser.close()

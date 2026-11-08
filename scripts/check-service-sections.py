"""Verify service grouping, deep links, form state and navigation without sending orders."""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8040'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(320,740),(390,844),(1440,1000)]:
        page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
        errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
        page.goto(BASE+'/services/',wait_until='networkidle')
        assert page.locator('.svcs-card',has_text='الضيافة والتنسيقات').count()==1
        assert page.locator('.svcs-card',has_text='الجلسات والتجهيزات').count()==1
        assert page.locator('.svcs-card',has_text='جلسة السينما').count()==0
        page.locator('.svcs-card',has_text='الضيافة والتنسيقات').click()
        assert page.url==BASE+'/services/hospitality/'
        assert page.title()=='الضيافة والتنسيقات | منتجع يوم العائلة'
        page.locator('#hd-tab-hospitality').click()
        page.wait_for_url('**/services/hospitality/packages/')
        assert page.title()=='الضيافة | منتجع يوم العائلة'
        assert page.locator('#hospitality-detail [role=tab]').all_text_contents()==['الضيافة','التنسيقات']
        assert page.locator('#hd-hospitality-panel .hd-package-price').all_text_contents()==['59 ريال للباقة','75 ريال للباقة','85 ريال للباقة']
        page.locator('#hd-tab-coordination').click()
        page.wait_for_url('**/services/coordination/')
        assert page.locator('#hd-coordination-panel .hd-package').count()==6
        page.reload(wait_until='networkidle')
        assert page.locator('#hd-coordination-panel').is_visible()
        page.locator('.hd-back').click();page.wait_for_url('**/services/')
        page.locator('.svcs-card',has_text='الجلسات والتجهيزات').click()
        assert page.url==BASE+'/services/setups/'
        assert page.title()=='الجلسات والتجهيزات | منتجع يوم العائلة'
        page.reload(wait_until='networkidle')
        assert page.url==BASE+'/services/setups/'
        assert page.title()=='الجلسات والتجهيزات | منتجع يوم العائلة'
        assert page.locator('#setups-title').inner_text()=='الجلسات والتجهيزات'
        assert page.locator('#setups-detail [role=tab]').count()==3
        assert page.locator('#sinema-detail').is_visible()
        assert page.locator('#cn-inclusions-title').inner_text()=='محتويات الجلسة'
        assert page.locator('.cn-price').inner_text()=='150 ريال'
        assert not page.locator('#setups-tab-dining').evaluate('(el)=>!!el.closest("[inert]")')
        # Native RTL keyboard switching.
        page.locator('#setups-tab-cinema').focus();page.keyboard.press('ArrowLeft')
        page.wait_for_url('**/services/dining-tables/')
        assert page.locator('#setups-tab-dining').evaluate('(el)=>el===document.activeElement')
        page.locator('#ts-12').click();page.locator('#tawilat-opt-tansiq').click()
        assert page.evaluate('_tawilatSize')==12
        assert page.evaluate('_tawilatOpt')=='tansiq'
        page.locator('#setups-tab-seating').click()
        page.locator('#jalsat-card-2 summary').click()
        assert page.locator('#jalsat-card-2 .jl-order').is_visible()
        assert page.locator('#jalsat-card-2 .jl-total strong').inner_text()=='200 ريال'
        page.locator('#jalsat-card-2 .jl-addon-option').click()
        page.locator('#jalsat-card-2 .jl-order-button').click()
        selected=page.evaluate('_jalsatCart')
        page.locator('#setups-tab-dining').click()
        assert page.evaluate('[_tawilatSize,_tawilatOpt]')==[12,'tansiq']
        page.locator('#setups-tab-seating').click()
        assert page.evaluate('_jalsatCart')==selected
        page.locator('#jalsat-checkout').click()
        assert page.locator('#order-popup').is_visible()
        assert page.evaluate('_orderResortScope') is True
        page.evaluate('closeOrderPopup()')
        page.wait_for_selector('#order-popup',state='hidden')
        assert page.locator('#jalsat-detail').is_visible()
        assert page.evaluate('_jalsatCart')==selected
        assert not page.locator('#setups-tab-cinema').evaluate('(el)=>!!el.closest("[inert]")')
        # Browser Back leaves the page instead of walking through every tab.
        page.go_back(wait_until='networkidle');page.wait_for_url('**/services/')
        page.go_forward(wait_until='networkidle');page.wait_for_url('**/services/outdoor-seating/')
        page.reload(wait_until='networkidle');assert page.locator('#jalsat-detail').is_visible()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        assert page.locator('#setups-detail').evaluate('(el)=>el.scrollWidth<=el.clientWidth')
        page.locator('.setups-back').click();page.wait_for_url('**/services/')
        # Existing URLs still land on the appropriate grouped tab.
        for path,tab in [('cinema','cinema'),('dining-tables','dining'),('outdoor-seating','seating')]:
            page.goto(BASE+'/services/'+path+'/',wait_until='networkidle')
            assert page.locator('#setups-tab-'+tab).get_attribute('aria-selected')=='true'
        page.goto(BASE+'/services/hospitality/?tab=packages',wait_until='networkidle')
        assert page.url==BASE+'/services/cinema/'
        # Legacy query links still select the requested tab, preserving return context.
        for old,new in [
            ('/services/setups/?tab=cinema','/services/cinema/'),
            ('/services/setups/?tab=dining','/services/dining-tables/'),
            ('/services/setups/?tab=seating','/services/outdoor-seating/'),
            ('/services/hospitality/?tab=hospitality','/services/hospitality/packages/'),
            ('/services/hospitality/?tab=coordination','/services/coordination/')]:
            page.goto(BASE+old+'&from=guest',wait_until='networkidle')
            assert page.url==BASE+new+'?from=guest', (old,page.url)
        for old in ['/#sinema','/#tawilat','/#jalsat']:
            page.goto(BASE+old,wait_until='networkidle')
            assert page.url==BASE+{'/#sinema':'/services/cinema/','/#tawilat':'/services/dining-tables/','/#jalsat':'/services/outdoor-seating/'}[old]
        # Cabin-origin service links preserve the cabin as return destination.
        page.goto(BASE+'/cabins/panoramic/',wait_until='networkidle')
        page.locator('#mBody a[href="/services/dining-tables/"]').click()
        assert page.locator('#tawilat-detail').is_visible()
        page.locator('.setups-back').click();page.wait_for_url('**/cabins/panoramic/')
        assert page.locator('#ov').is_visible()
        page.locator('#mBody a[href="/services/hospitality/"]').click()
        page.wait_for_url('**/services/hospitality/')
        page.locator('#hd-tab-coordination').click()
        page.wait_for_url('**/services/coordination/')
        page.reload(wait_until='networkidle')
        page.locator('#hospitality-detail .hd-back').click()
        page.wait_for_url('**/cabins/panoramic/')
        for link in page.locator('#mBody .fd-cabin-addon-links a').all():
            assert page.request.get(BASE+link.get_attribute('href')).ok
        assert not errors,errors
        page.goto(BASE+'/services/setups/?tab=seating',wait_until='networkidle')
        page.screenshot(path=f'/tmp/service-sections-{width}.png',full_page=True)
        print(width,'PASS tabs/deep links, keyboard, selections, order return, browser Back, legacy links and cabin return',flush=True)
        page.close()
    browser.close()

"""Verify separate detail pages, reloads, checkout restoration and caller navigation."""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
services=[
 ('hospitality/packages','الضيافة','#hd-hospitality-panel','.hd-back'),
 ('coordination','التنسيقات','#hd-coordination-panel','.hd-back'),
 ('cinema','جلسة السينما','#sinema-detail','.setups-back'),
 ('dining-tables','طاولات الطعام','#tawilat-detail','.setups-back'),
 ('outdoor-seating','الجلسات الخارجية','#jalsat-detail','.setups-back')]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,740),(390,741),(1440,900)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def visit(path):page.goto(BASE+path,wait_until='networkidle')
  def enter(path):
   page.locator('.svcs-card[href="/services/'+path+'/"]').click()
   page.wait_for_url(BASE+'/services/'+path+'/')
  def back(button):
   page.locator(button).click();page.wait_for_url(BASE+'/services/')
  visit('/services/')
  for path,label,panel,button in services:
   # Enter using the keyboard, reload the shareable URL, and leave via browser Back.
   card=page.locator('.svcs-card[href="/services/'+path+'/"]')
   card.focus();page.keyboard.press('Enter');page.wait_for_url(BASE+'/services/'+path+'/')
   page.reload(wait_until='networkidle')
   assert page.locator(panel).is_visible()
   heading='#hospitality-title' if 'hd-' in panel else '#setups-title'
   assert page.locator(heading).inner_text()==label
   assert page.locator('#hospitality-detail [role=tab],#setups-detail [role=tab]').count()==0
   for other,_,other_panel,_ in services:
    if other!=path:assert page.locator(other_panel).is_hidden(),(path,other)
   page.go_back(wait_until='networkidle');page.wait_for_url(BASE+'/services/')
  enter('hospitality/packages')
  assert page.locator('#hd-hospitality-panel .hd-package-price').all_text_contents()==['59 ريال للباقة','75 ريال للباقة','85 ريال للباقة']
  back('.hd-back');enter('coordination')
  assert page.locator('#hd-coordination-panel .hd-package').count()==6
  back('.hd-back');enter('cinema')
  assert page.locator('.cn-price').inner_text()=='150 ريال'
  back('.setups-back');enter('dining-tables')
  page.locator('#dining-card-12 .fd-dining-option[data-option=tansiq]').click()
  back('.setups-back');enter('outdoor-seating')
  page.locator('#jalsat-card-2 summary').click()
  page.locator('#jalsat-card-2 .jl-addon-option').click()
  page.locator('#jalsat-card-2 .jl-order-button').click()
  selected=page.evaluate('_jalsatCart')
  page.locator('#jalsat-checkout').click()
  assert page.locator('#order-popup').is_visible()
  assert page.evaluate('_orderResortScope') is True
  page.evaluate('closeOrderPopup()');page.wait_for_selector('#order-popup',state='hidden')
  assert page.locator('#jalsat-detail').is_visible()
  assert page.evaluate('_jalsatCart')==selected
  back('.setups-back');enter('dining-tables')
  assert page.evaluate('[_tawilatSize,_tawilatOpt]')==[12,'tansiq']
  back('.setups-back');enter('outdoor-seating')
  assert page.evaluate('_jalsatCart')==selected
  page.reload(wait_until='networkidle')
  assert page.evaluate('_jalsatCart')==selected
  page.go_back(wait_until='networkidle');page.wait_for_url(BASE+'/services/')
  page.go_forward(wait_until='networkidle');page.wait_for_url(BASE+'/services/outdoor-seating/')
  assert page.locator('#jalsat-detail').is_visible()
  assert page.locator('#setups-detail').evaluate('(el)=>el.scrollWidth<=el.clientWidth')
  for old,new in [('/#sinema','cinema'),('/#tawilat','dining-tables'),('/#jalsat','outdoor-seating')]:
   visit(old);page.wait_for_url(BASE+'/services/'+new+'/')
  for path,_,panel,button in services:
   visit('/cabins/panoramic/')
   page.locator('.fd-cabin-services-link').click();page.wait_for_url(BASE+'/services/')
   page.locator('.svcs-card[href="/services/'+path+'/"]').click()
   page.wait_for_url(BASE+'/services/'+path+'/');page.reload(wait_until='networkidle')
   assert page.locator(panel).is_visible()
   page.locator(button).click();page.wait_for_url(BASE+'/services/')
   page.locator('.svcs-back').click();page.wait_for_url(BASE+'/cabins/panoramic/')
   assert page.locator('#ov').is_visible()
  assert not errors,errors
  print(width,'PASS five isolated pages, keyboard, reload, selections, checkout, Back/Forward and cabin return',flush=True)
  page.close()
 browser.close()

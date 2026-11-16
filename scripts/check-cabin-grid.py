"""Verify mobile cabin browsing, the independent garden and preserved actions/state."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import sys

BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
OUT=Path('/tmp/familyday-cabin-grid');OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,741),(430,932),(768,1024),(1024,768),(1440,900)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/cabins/',wait_until='networkidle');page.evaluate('document.fonts.ready')
  mobile=width<900
  grid=page.locator('#grid');garden=page.locator('#sharedGarden')
  expect(grid).to_have_class('grid fd-carousel')
  assert page.locator('.fbtn').all_text_contents()==['الكل','غرفة واحدة','غرفتان','الحديقة المشتركة']
  assert grid.locator('.card:not(.hidden)').count()==(12 if mobile else 13)
  assert page.locator('#app .card-img-wrap img').evaluate_all('els=>els.length===13&&els.every(e=>e.alt)')
  assert grid.locator('.fd-card-compare').count()==12
  assert grid.locator('.fd-dome-tour-link').count()==(12 if mobile else 13)
  assert page.locator('#grid + .fd-carousel-controls').is_hidden()
  assert grid.evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  boxes=grid.locator('.card:not(.hidden)').evaluate_all('es=>es.map(e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})')
  columns=2 if width<1100 else 3
  assert all(abs(boxes[i]['y']-boxes[0]['y'])<1 for i in range(columns))
  assert boxes[columns]['y']>=boxes[0]['y']+boxes[0]['h']
  if mobile:
   assert garden.is_visible()
   assert garden.bounding_box()['y']>=grid.bounding_box()['y']+grid.bounding_box()['height']
   assert abs(garden.bounding_box()['width']-grid.bounding_box()['width'])<1
   assert garden.locator('.card-name').inner_text()=='الحديقة المشتركة لجميع ضيوف المنتجع'
  else:assert garden.is_hidden()
  page.screenshot(path=str(OUT/f'listing-{width}.png'))
  grid.locator('.card-btn').first.click();page.wait_for_url('**/cabins/dome-1/')
  assert page.locator('#fd-cabin-nav-count').inner_text()==('1 من 12' if mobile else '1 من 13')
  page.locator('.fd-cabin-nav-back').click();page.wait_for_url(BASE+'/cabins/')
  for rooms,count in [('1',4),('2',8)]:
   page.locator('.fbtn[data-f="'+rooms+'"]').click()
   assert grid.locator('.card:not(.hidden)').count()==count
   ids=grid.locator('.card:not(.hidden) .card-img-wrap').evaluate_all('es=>es.map(e=>Number(e.dataset.cid))')
   assert page.evaluate('(ids)=>ids.every(id=>data.resort.items.find(c=>c.id===id).rooms===Number(_curFilter))',ids)
   assert garden.is_visible()==mobile
  # Opening a later cabin preserves both the room filter and vertical position.
  card=grid.locator('.card').filter(has=page.locator('[data-cid="9"]'))
  button=card.locator('.card-btn');button.scroll_into_view_if_needed()
  scroller=page.locator('#app .grid-section')
  before=scroller.evaluate('e=>e.scrollTop') if mobile else page.evaluate('scrollY')
  button.click();page.wait_for_url('**/cabins/royal/')
  assert page.locator('#fd-cabin-detail-title').inner_text()=='كوخ رويال'
  assert page.locator('#modalBookBtn').get_attribute('href').startswith('https://familyday-sa.com/')
  page.locator('.fd-cabin-nav-back').click();page.wait_for_url(BASE+'/cabins/')
  assert page.locator('.fbtn.active').get_attribute('data-f')=='2'
  after=scroller.evaluate('e=>e.scrollTop') if mobile else page.evaluate('scrollY')
  assert abs(after-before)<2,(width,before,after)
  button.click();page.wait_for_url('**/cabins/royal/')
  page.go_back(wait_until='networkidle');page.wait_for_url(BASE+'/cabins/')
  assert page.locator('.fbtn.active').get_attribute('data-f')=='2'
  after=scroller.evaluate('e=>e.scrollTop') if mobile else page.evaluate('scrollY')
  assert abs(after-before)<2,(width,before,after)
  # Comparison keeps its selections through filters and does not open cabin details.
  for cid in [9,10]:page.locator('[data-compare-cabin="'+str(cid)+'"]').click()
  page.locator('.fd-compare-open').click()
  expect(page.locator('#fd-compare-dialog')).to_be_visible()
  assert page.locator('.fd-compare-table thead strong').all_text_contents()==['كوخ رويال','البيت البانورامي']
  page.locator('.fd-compare-close').click()
  expect(page.locator('#fd-compare-dialog')).to_be_hidden()
  page.locator('.fd-compare-clear').click()
  if mobile:
   page.locator('.fbtn[data-f="shared"]').click()
   assert page.locator('.fbtn.active').get_attribute('data-f')=='2'
   assert grid.locator('.card:not(.hidden)').count()==8
   page.wait_for_function('document.querySelector("#sharedGarden").getBoundingClientRect().top<innerHeight')
   garden.locator('.card-btn').click();page.wait_for_url('**/cabins/shared-garden/')
   assert page.locator('#mBody .fd-cabin-title').inner_text()=='الحديقة المشتركة'
   assert page.locator('#fd-cabin-nav-count').inner_text()=='1 من 1'
   page.locator('.fd-cabin-nav-back').click();page.wait_for_url(BASE+'/cabins/')
   assert page.locator('.fbtn.active').get_attribute('data-f')=='2'
   page.wait_for_function('getComputedStyle(document.getElementById("ov")).opacity==="0"')
   garden.scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'garden-{width}.png'))
  else:
   page.locator('.fbtn[data-f="shared"]').click()
   assert grid.locator('.card:not(.hidden)').count()==1
   assert grid.locator('.card:not(.hidden) .card-name').inner_text()=='الحديقة المشتركة'
  assert not errors,errors
  print(width,'PASS layout, original filters/cards/actions, garden, details/Back position and comparison',flush=True)
  page.close()
 # Responsive transitions preserve room filtering and one garden card.
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 page.goto(BASE+'/cabins/',wait_until='networkidle');page.locator('.fbtn[data-f="1"]').click()
 for w in [1440,390,1024,430]:
  page.set_viewport_size({'width':w,'height':900})
  expect(page.locator('#sharedGarden')).to_be_visible() if w<900 else expect(page.locator('#sharedGarden')).to_be_hidden()
  assert page.locator('#app .card-img-wrap[data-cid="11"]').count()==(1 if w<900 else 0)
  assert page.locator('#grid .card:not(.hidden)').count()==4
  assert page.locator('.fbtn.active').get_attribute('data-f')=='1'
 print('PASS mobile/desktop resize keeps rooms and independent garden',flush=True)
 browser.close()

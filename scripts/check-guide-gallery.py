"""Exercise independent service galleries and expanding details on mobile/desktop."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8044'
out=Path('/tmp/fd-gallery-pilot');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w,h in [(320,740),(390,844),(1440,1000)]:
  page=b.new_page(viewport={'width':w,'height':h},is_mobile=w<900,has_touch=w<900,reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/services-guide/#package-complete',wait_until='domcontentloaded');card=page.locator('#package-complete');card.wait_for();page.evaluate('document.fonts.ready')
  gallery=card.locator('.package-gallery');track=gallery.locator('.gallery-track');count=gallery.locator('.gallery-count')
  # Each package gallery keeps its own position when other galleries change.
  galleries=page.locator('.package-gallery:has(.gallery-controls)')
  assert galleries.count()==9
  for current in galleries.all():
   current.locator('.gallery-next').click()
   page.wait_for_function('(el)=>el.textContent==="2 / 6"',arg=current.locator('.gallery-count').element_handle())
  assert all(g.locator('.gallery-count').inner_text()=='2 / 6' for g in galleries.all())
  for current in galleries.all():
   current.locator('.gallery-previous').click()
   page.wait_for_function('(el)=>el.textContent==="1 / 6"',arg=current.locator('.gallery-count').element_handle())
  card.evaluate('e=>e.scrollIntoView({block:"start"})')
  page.wait_for_function('document.querySelector("#package-complete").getBoundingClientRect().top<200')
  card.locator('img').evaluate_all('els=>Promise.all(els.map(e=>{e.loading="eager";return e.decode()}))')
  assert card.locator('.price').inner_text()=='1850 ريال'
  assert card.locator('.gallery-slide').count()==6 and count.inner_text()=='1 / 6'
  assert not card.locator('details').evaluate('e=>e.open')
  photo=gallery.bounding_box();before=page.locator('#dining').bounding_box()['y']
  card.locator('summary').click();assert card.locator('.inclusions').is_visible()
  assert page.locator('#dining').bounding_box()['y']>before+500
  assert gallery.bounding_box()['height']==photo['height']
  card.locator('summary').click();assert abs(page.locator('#dining').bounding_box()['y']-before)<1
  for i in range(2,7):
   gallery.locator('.gallery-next').click();page.wait_for_function('(n)=>document.querySelector("#package-complete .gallery-count").textContent===n',arg=str(i)+' / 6')
  assert gallery.locator('.gallery-next').is_disabled()
  track.focus();page.keyboard.press('Home');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="1 / 6"')
  page.keyboard.press('ArrowLeft');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="2 / 6"')
  track.focus();page.keyboard.press('Home');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="1 / 6"')
  assert abs(track.bounding_box()['width']/track.bounding_box()['height']-4/3)<.01
  assert gallery.locator('button').count()==2
  controls=gallery.locator('.gallery-controls').bounding_box()
  assert abs(controls['x']+controls['width']-photo['x']-photo['width'])<1
  assert abs(controls['y']+controls['height']-photo['y']-photo['height'])<1
  if w<900:
   card.evaluate('e=>e.scrollIntoView({block:"start"})');page.wait_for_timeout(100)
   bounds=track.bounding_box();client=page.context.new_cdp_session(page);y=bounds['y']+bounds['height']/3
   client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':bounds['x']+40,'y':y}]})
   for x in range(60,int(bounds['width'])-10,25):
    client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':bounds['x']+x,'y':y}]});page.wait_for_timeout(16)
   client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(350)
   assert count.inner_text()!='1 / 6',count.inner_text();assert page.locator('.guide-photo-dialog').count()==0
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  card.evaluate('e=>e.scrollIntoView()');page.screenshot(path=str(out/f'inline-{w}.png'))
  assert not errors,errors
  print(w,'PASS six photos, arrows/keyboard/swipe, 4:3 inline gallery, inline disclosure and no overflow',flush=True)
  page.close()
 b.close()

"""Exercise the one-package gallery, modal and expanding details on mobile/desktop."""
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
  page.wait_for_function('document.querySelector("#package-complete").getBoundingClientRect().top<200')
  card.locator('img').evaluate_all('els=>Promise.all(els.map(e=>{e.loading="eager";return e.decode()}))')
  assert card.locator('.price').inner_text()=='1850 ريال'
  assert card.locator('.gallery-slide').count()==6 and count.inner_text()=='1 من 6'
  assert not card.locator('details').evaluate('e=>e.open')
  photo=gallery.bounding_box();before=page.locator('#dining').bounding_box()['y']
  card.locator('summary').click();assert card.locator('.inclusions').is_visible()
  assert page.locator('#dining').bounding_box()['y']>before+500
  assert gallery.bounding_box()['height']==photo['height']
  card.locator('summary').click();assert abs(page.locator('#dining').bounding_box()['y']-before)<1
  for i in range(2,7):
   gallery.locator('.gallery-next').click();page.wait_for_function('(n)=>document.querySelector("#package-complete .gallery-count").textContent===n',arg=str(i)+' من 6')
  assert gallery.locator('.gallery-next').is_disabled()
  track.focus();page.keyboard.press('Home');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="1 من 6"')
  page.keyboard.press('ArrowLeft');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="2 من 6"')
  gallery.locator('.gallery-zoom').click();dialog=page.locator('.guide-photo-dialog');dialog.wait_for(state='visible')
  assert dialog.locator('.gallery-count').inner_text()=='2 من 6'
  dialog.locator('.gallery-next').click();page.wait_for_function('document.querySelector(".guide-photo-dialog .gallery-count").textContent==="3 من 6"')
  dialog.locator('img').nth(2).evaluate('e=>e.decode()');page.screenshot(path=str(out/f'large-{w}.png'))
  page.keyboard.press('Escape');dialog.wait_for(state='hidden');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="3 من 6"')
  assert page.locator('html.guide-gallery-open').count()==0
  track.focus();page.keyboard.press('Home');page.wait_for_function('document.querySelector("#package-complete .gallery-count").textContent==="1 من 6"')
  if w<900:
   card.evaluate('e=>e.scrollIntoView({block:"start"})');page.wait_for_timeout(100)
   bounds=track.bounding_box();client=page.context.new_cdp_session(page);y=bounds['y']+bounds['height']/3
   client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':bounds['x']+40,'y':y}]})
   for x in range(60,int(bounds['width'])-10,25):
    client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':bounds['x']+x,'y':y}]});page.wait_for_timeout(16)
   client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(350)
   assert count.inner_text()!='1 من 6',count.inner_text();assert not dialog.is_visible()
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  card.evaluate('e=>e.scrollIntoView()');page.screenshot(path=str(out/f'inline-{w}.png'))
  assert not errors,errors
  print(w,'PASS six photos, arrows/keyboard/swipe, enlarge/Escape, counter sync, inline disclosure and no overflow',flush=True)
  page.close()
 b.close()

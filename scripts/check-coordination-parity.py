"""Keep the coordination guide aligned with main-site content and real photo galleries."""
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=browser.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/services/coordination/',wait_until='networkidle')
  source=page.locator('#hd-coordination-panel .hd-package').evaluate_all('els=>els.map(c=>({name:c.querySelector(".hd-package-name").textContent.trim(),price:c.querySelector(".hd-package-price").textContent.trim(),items:[...c.querySelectorAll(".hd-item span:last-child")].map(x=>x.textContent.trim()),images:[...c.querySelectorAll(".gallery-slide img")].map(x=>new URL(x.src).pathname),note:c.querySelector(".hd-package-note")?.textContent.trim()||"",label:c.querySelector("summary span").textContent.trim()}))')
  assert len(source)==6
  assert all(x=='•' for x in page.locator('#hd-coordination-panel .hd-check').all_text_contents())
  assert source[3]['name']=='باقة الاحتفال' and len(source[3]['images'])==6
  assert source[3]['images'][0]=='/imgs/coordination/complete/10-v3.webp'
  assert len(source[4]['images'])==6 and '/imgs/coordination/vip/03-birthday-lounge-v2.webp' not in source[4]['images']
  assert source[4]['images'][3]=='/imgs/coordination/vip/04-silver-balloons-v3.webp'
  assert '/imgs/coordination/complete/03-v3.webp' not in source[5]['images']
  assert source[5]['images'][-1]=='/imgs/coordination/vip/03-birthday-lounge-v2.webp'
  assert len(source[5]['images'])==12 and '/imgs/coordination/complete/10-v3.webp' not in source[5]['images']
  page.goto(BASE+'/services-guide/#coordination',wait_until='networkidle')
  page.wait_for_selector('#guide-content.is-ready',state='attached')
  cards=page.locator('#coordination .package-card')
  assert cards.count()==6 and page.locator('#coordination details[open]').count()==0
  for i,original in enumerate(source):
   card=cards.nth(i)
   assert card.locator('.seating-collapsed-title').inner_text()==original['name']
   assert card.locator('.price').text_content().strip()==original['price']
   assert card.locator('.inclusions li').all_text_contents()==original['items']
   assert card.locator('img').evaluate_all('els=>els.map(x=>new URL(x.src).pathname)')==original['images']
   assert card.locator('.seating-detail-hint').inner_text()==original['label']
   assert card.locator('.package-usage-note').all_text_contents()==([original['note']] if original['note'] else [])
   card.locator('summary').click()
   assert card.locator('.inclusions').is_visible()
   if original['images']:
    gallery=card.locator('.package-gallery');count=len(original['images'])
    gallery.locator('.gallery-next').click()
    page.wait_for_function('(i)=>document.querySelectorAll("#coordination .package-card")[i].querySelector(".gallery-count").textContent.startsWith("2 / ")',arg=i)
    gallery.locator('.gallery-previous').click()
   else:
    assert card.locator('.package-gallery,.gallery-controls').count()==0
    assert card.locator('.seating-detail-hint').inner_text()=='الصور وتفاصيل الباقة'
   # Longer disclosure labels must fit inside the card even on small phones.
   assert card.locator('.seating-detail-footer').evaluate('(el)=>{const r=el.getBoundingClientRect(),c=el.closest("article").getBoundingClientRect();return r.left>=c.left && r.right<=c.right}')
  assert page.locator('#coordination details[open]').count()==6
  assert page.locator('.load-error').count()==0
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  if width==390:
   cards.nth(3).locator('summary').scroll_into_view_if_needed()
   page.screenshot(path='/tmp/coordination-celebration-approved.png')
  page.emulate_media(media='print')
  assert all(note.is_visible() for note in page.locator('#coordination .package-usage-note').all())
  assert not errors,errors
  print(width,'PASS six catalogues, photos, usage notes, disclosure labels, galleries, comparison, small-screen fit and print',flush=True)
  page.close()
 browser.close()

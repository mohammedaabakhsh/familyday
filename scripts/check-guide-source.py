"""Guard the guide's read-only catalogue against changes in main-site card templates."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8042'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [390,1440]:
  page=browser.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' and 'Error:' in msg.text else None)
  for path in ['/services-guide/','/arrangements/#seating']:
   page.goto(BASE+path,wait_until='networkidle')
   page.wait_for_selector('#guide-content.is-ready',state='attached')
   assert page.locator('.load-error').count()==0
   assert page.locator('#coordination .package-card').count()==6
   assert page.locator('#dining .dining-price-card').count()==5
   assert page.locator('#seating .package-card').count()==6
   assert page.locator('.seating-extra-offer strong').all_text_contents()==['كيك وعصير','170 ريال']
   for section in ['coordination','dining','seating']:
    page.goto(BASE+'/services-guide/#'+section,wait_until='networkidle')
    assert page.locator('#'+section).is_visible()
    if section!='dining':
     first=page.locator('#'+section+' .seating-collapsed-details').first
     first.locator('summary').click()
     assert first.locator('img').first.is_visible()
     assert first.locator('.package-details-body').inner_text()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  # Add-on copy must come from the shared source, even though it is inside <template>.
  source=Path('index.html').read_text().replace('class="jl-addon-price">170 ريال','class="jl-addon-price">171 ريال')
  page.route('**/index.html',lambda route:route.fulfill(body=source,content_type='text/html'))
  page.goto(BASE+'/services-guide/#seating',wait_until='networkidle')
  page.reload(wait_until='networkidle')
  assert page.locator('.seating-extra-price').inner_text()=='171 ريال'
  assert not errors,errors
  print(width,'PASS main/WhatsApp links, all three sections, package expansion, template source and overflow',flush=True)
  page.close()
 browser.close()

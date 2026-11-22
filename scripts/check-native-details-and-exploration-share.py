"""Native detail links for all venues and exact exploration sharing, without sending messages."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
TOURS=['dome','pyramid','classic','greek','palm','bohemian','french','rustic','royal','panoramic']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,1440]:
  page=b.new_page(viewport={'width':width,'height':844 if width<900 else 1000},reduced_motion='reduce');errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  for path,selector,count in [('/cabins/','#grid a.card-btn',13),('/stay/sections/','#grid2 a.card-btn',2),('/chalet/','#landing3 a.rh-cabins',1)]:
   page.goto(BASE+path,wait_until='networkidle')
   assert page.locator(selector).count()==count
   for index in range(count):
    link=page.locator(selector).nth(index)
    href=link.get_attribute('href');assert href.startswith(('/cabins/','/stay/','/chalet/details/'))
    link.evaluate('e=>e.addEventListener("click",ev=>{window.modifiedDefault=ev.defaultPrevented;ev.preventDefault()},{once:true})')
    before=page.url;link.dispatch_event('click',{'button':0,'ctrlKey':True})
    assert page.evaluate('window.modifiedDefault') is False and page.url==before
    # Scroll the existing carousel to the actual card before an ordinary pointer click.
    link.scroll_into_view_if_needed();link.click();page.wait_for_url('**'+href)
    assert page.locator('#ov').is_visible()
    page.reload(wait_until='networkidle');assert page.locator('#ov').is_visible()
    page.evaluate('closeM()');page.wait_for_url('**'+path)
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  print(width,'PASS all 16 native entries, modifier clicks, ordinary navigation, reload and return',flush=True)
  tours=[('/'+name+'-tour/','/'+name+'-tour/') for name in TOURS]
  tours += [('/dome-tour/?cabin=12&from=details&return=map&fbclid=test#part','/dome-tour/?cabin=12'),('/greek-tour/?cabin=13&from=guide&fbclid=test','/greek-tour/?cabin=13'),('/chalet-map/?from=chalet-details&fbclid=test','/chalet-map/')]
  for entry,shared in tours:
   page.goto(BASE+entry,wait_until='networkidle')
   header=page.locator('.cm-heading' if entry.startswith('/chalet-map') else '.dt-heading')
   share=header.locator('.fd-exploration-share');share.wait_for(state='visible')
   assert share.count()==1
   back=header.locator('.cm-close' if entry.startswith('/chalet-map') else '.tour-back')
   assert share.bounding_box()['x']+share.bounding_box()['width']<=back.bounding_box()['x']
   title=header.locator('h1,h2');a=title.bounding_box();c=share.bounding_box()
   assert c['x']+c['width']<=a['x']+1,(width,entry,a,c)
   page.evaluate('Object.defineProperty(navigator,"share",{configurable:true,value:async data=>{window.shared=data}})')
   url_before=page.url;share.click();assert page.evaluate('window.shared.url')==BASE+shared
   assert page.url==url_before
   page.evaluate('Object.defineProperty(navigator,"share",{configurable:true,value:undefined});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async value=>{window.copied=value}}})')
   share.click();assert page.evaluate('window.copied')==BASE+shared
   assert header.locator('[role=status]').inner_text()=='تم نسخ الرابط'
   page.evaluate('window.copied=null;Object.defineProperty(navigator,"share",{configurable:true,value:async()=>{throw new DOMException("cancelled","AbortError")}})')
   share.click();assert page.evaluate('window.copied') is None
   assert header.locator('[role=status]').inner_text()==''
   # A rejected native share or denied clipboard retains the existing copy fallback.
   page.evaluate('Object.defineProperty(navigator,"share",{configurable:true,value:async()=>{throw new Error("unavailable")}});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw new Error("denied")}}});document.execCommand=cmd=>{window.fallbackCopy=document.querySelector(".fd-exploration-copy-buffer").value;return cmd==="copy"};void 0')
   share.click();assert page.evaluate('window.fallbackCopy')==BASE+shared
   assert page.locator('.fd-exploration-copy-buffer').count()==0
   assert not share.is_disabled()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if entry.startswith('/chalet-map'):
    page.locator('.cm-marker[data-room="upper"]').click();assert page.locator('.cm-detail-heading h3').inner_text()=='غرفة النوم الرئيسية'
    assert page.locator('.fd-exploration-share').count()==1
    page.locator('.cm-close').click();page.wait_for_url('**/chalet/details/')
   else:
    point=page.locator('.dt-label').last;point.click()
    assert page.locator('.fd-exploration-share').count()==1
  assert not errors,errors
  print(width,'PASS 12 cabin explorations + chalet: exact URLs, header geometry, native share/cancel/copy/fallback, working selections and return',flush=True)
  page.close()
 b.close()

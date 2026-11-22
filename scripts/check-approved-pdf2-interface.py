"""Regression checks for approved PDF2 navigation, local fonts and numeric display.
Uses a local server and never submits orders or opens external services.
"""
from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8056'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,390,768,1440]:
  context=browser.new_context(viewport={'width':width,'height':900},reduced_motion='reduce')
  page=context.new_page();errors=[];font_requests=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('request',lambda req:font_requests.append(req.url) if 'fonts.googleapis.com' in req.url or 'fonts.gstatic.com' in req.url else None)
  page.goto(BASE+'/stay/',wait_until='networkidle')
  shortcut=page.get_by_role('link',name='قارن بين القسمين',exact=True)
  contact=page.get_by_role('link',name='الموقع والتواصل احجز إقامتك وتواصل معنا')
  assert shortcut.get_attribute('class')==contact.get_attribute('class')=='rh-home-shortcut'
  assert abs(shortcut.bounding_box()['height']-contact.bounding_box()['height'])<1
  assert shortcut.bounding_box()['width']==contact.bounding_box()['width']
  for prop in ['backgroundColor','borderRadius','minHeight','padding']:
   value=lambda el:el.evaluate('(e,p)=>getComputedStyle(e)[p]',prop)
   assert value(shortcut)==value(contact),(width,prop)
  # Normal activation, UI Back, direct entry, reload and browser Back all keep the same table.
  shortcut.click();page.wait_for_url('**/stay/sections/?compare=1')
  assert page.locator('.fd-stay-comparison').count()==1
  assert page.locator('#fd-stay-comparison-panel').is_visible()
  assert page.locator('.fd-stay-comparison-toggle').get_attribute('aria-expanded')=='true'
  page.locator('#backBtn2').click();assert shortcut.is_visible()
  before=page.url
  shortcut.dispatch_event('click',{'button':0,'ctrlKey':True})
  assert page.url==before
  tab=context.new_page();tab.goto(BASE+shortcut.get_attribute('href'),wait_until='networkidle')
  assert tab.locator('#fd-stay-comparison-panel').is_visible();tab.close()
  page.goto(BASE+'/stay/sections/?compare=1',wait_until='networkidle')
  page.reload(wait_until='networkidle');assert page.locator('#fd-stay-comparison-panel').is_visible()
  page.goto(BASE+'/cabins/classic/',wait_until='networkidle')
  page.locator('.fd-cabin-accordion').filter(has=page.locator('summary',has_text='المنطقة الخارجية والمسبح')).locator('summary').click()
  feature=page.locator('.fd-cabin-feature').filter(has_text='مسبح خاص للكبار').first
  measure=feature.locator('bdi').last
  assert measure.inner_text()=='140'
  positions=measure.evaluate('''e=>{
    const n=e.nextSibling,i=n.textContent.indexOf('سم'),r=document.createRange();
    r.setStart(n,i);r.setEnd(n,i+2);
    return {number:e.getBoundingClientRect().toJSON(),unit:r.getBoundingClientRect().toJSON()};
  }''')
  assert positions['unit']['x']<positions['number']['x'],(width,positions)
  assert not any('سم' in v or 'م' in v for v in feature.locator('bdi').all_text_contents())
  # Native gallery navigation works; mobile dimensions are preserved.
  arrow=page.locator('.fd-dome-next');arrow.scroll_into_view_if_needed();box=arrow.bounding_box()
  assert box['width']==(56 if width>=900 else 44)
  if width>=900:
   gallery=page.locator('#galWrap').bounding_box()
   assert abs(box['y']+box['height']/2-gallery['y']-gallery['height']/2)<2
   assert abs(box['x']-gallery['x']-16)<2
  arrow.click();page.wait_for_function('galIdx===1')
  assert page.locator('.fd-dome-count').inner_text().startswith('2 /')
  page.locator('.fd-dome-previous').click();page.wait_for_function('galIdx===0')
  services=page.locator('.fd-cabin-services-link')
  assert services.evaluate('e=>getComputedStyle(e).backgroundColor')==('rgba(0, 0, 0, 0)' if width>=900 else 'rgb(20, 122, 140)')
  # Load the actual Arabic/Latin files for every approved weight; no external font requests.
  fonts=page.evaluate('''async()=>{
    for(const w of [400,500,700,800]) await document.fonts.load(w+' 16px Tajawal','العائلة Family 123');
    return Array.from(document.fonts).filter(f=>f.family.replace(/["']/g,'')==='Tajawal').map(f=>({weight:f.weight,status:f.status}));
  }''')
  assert len(fonts)==8 and all(f['status']=='loaded' for f in fonts),fonts
  assert not font_requests,font_requests
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  assert not errors,errors
  context.close();print(width,'PASS comparison/new-tab/Back, numeric unit order, gallery controls and 8 local font faces',flush=True)
 browser.close()

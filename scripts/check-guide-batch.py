"""Verify approved copy, consistent share titles and the five equal navigation tabs."""
import asyncio,hashlib,json,re,sys,subprocess
from pathlib import Path
from playwright.async_api import async_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8117'
EXPECTED={'dome-1': 'تجربة إقامة مختلفة داخل قبة تجمع غرفة النوم والصالة في مساحة واحدة.\nويتميّز ببانيو داخل غرفة النوم وجاكوزي داخل المسبح الخاص.',
 'dome-2': 'تجربة إقامة مختلفة داخل قبة تجمع غرفة النوم والصالة في مساحة واحدة.\nويتميّز ببانيو داخل غرفة النوم وجاكوزي داخل المسبح الخاص.',
 'pyramid': 'إقامة بطابع خشبي داخل كوخ بتصميم هرمي.\nويتميّز ببانيو خارجي بخصوصية كاملة.',
 'classic': 'يتميّز بصالة داخلية واسعة لجمعتكم، بطابع كلاسيكي هادئ وأجواء مريحة.\n'
            'ويمكن ربطه بكوخ رويال عبر باب داخلي عند حجزهما معًا، بسعة إجمالية تصل إلى 35 ضيفًا.',
 'greek-1': 'يتميّز بطابع يوناني يجمع اللمسات التراثية والبساطة الحديثة.',
 'greek-2': 'يتميّز بطابع يوناني يجمع اللمسات التراثية والبساطة الحديثة.',
 'palm-beach': 'يتميّز بطابع أفريقي يجمع الخشب والبامبو والقش.',
 'bohemian': 'يتميّز بطابع بوهيمي بسيط، بلمسات مستوحاة من الطبيعة.',
 'french': 'يتميّز بطابع فرنسي ولمسات أنيقة.',
 'rustic': 'يتميّز بأجواء ريفية مستوحاة من الطراز الأوروبي.',
 'royal': 'أكبر أكواخ المنتجع، بطابع خشبي أنيق ومساحات واسعة لجمعتكم.\n'
          'ويمكن ربطه بالكوخ الكلاسيكي عبر باب داخلي عند حجزهما معًا، بسعة إجمالية تصل إلى 35 ضيفًا.',
 'panoramic': 'يتميّز بواجهات زجاجية بانورامية تطل على حديقتكم الخاصة، وبانيو مع جاكوزي داخل غرفة النوم.'}
NAV={'resort':['المنتجع','الخريطة','الأكواخ','الخدمات','التواصل'],'stay':['الاستراحة','المقارنة','القسمان','الخدمات','التواصل'],'chalet':['الشاليه','استكشف','التفاصيل','الخدمات','التواصل']}
async def main():
 catalog=json.loads((R/'site/catalog.json').read_text());old=json.loads(subprocess.check_output(['git','show','pre-guide-batch-20261125:site/catalog.json']));out={'version':'20261125-live-v67','navigation':[],'cabins':[],'homeShares':[],'errors':[],'badResponses':[]}
 for u,before in zip(catalog['units'],old['units']):
  permitted={'description'} if u['venue']=='resort' and u['key'] in EXPECTED else set()
  assert {k:v for k,v in u.items() if k not in permitted}=={k:v for k,v in before.items() if k not in permitted},u['key']
  if permitted:assert u['description']==EXPECTED[u['key']]
 manifest=json.loads((R/'site/cleanup-manifest.json').read_text())
 for path,h in manifest['protectedFiles'].items():assert hashlib.sha256((R/path).read_bytes()).hexdigest()==h,path
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height in [(320,568),(390,844),(430,932),(768,1024),(1440,900)]:
   c=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');page=await c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));page.on('response',lambda r:out['badResponses'].append({'url':r.url,'status':r.status}) if r.status>=400 and r.url.startswith(BASE) else None)
   await page.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async data=>{shares.push(data)},configurable:true})")
   async def visit(path):
    await page.goto(BASE+path);await page.locator('#main h1').wait_for(state='attached');await page.evaluate('document.fonts.ready')
   await visit('/');share=page.locator('.destination-share');await expect(share).to_be_visible();rect=await share.bounding_box();assert rect['x']+rect['width']<width/2 and rect['y']<60 and rect['height']>=44
   await share.click();assert await page.evaluate('shares.at(-1)')=={'text':BASE+'/'}
   assert await page.locator('.destination-card').count()==3
   out['homeShares'].append({'width':width,'left':rect['x'],'top':rect['y'],'textOnly':True})
   if width in [390,1440]:await page.screenshot(path=f'/tmp/guide-v67/home-{width}.png',full_page=True)
   for venue,labels in NAV.items():
    await visit('/'+venue+'/');nav=page.locator('#bottom-nav');assert await nav.locator('.nav-label').all_text_contents()==labels
    links=nav.locator('a');boxes=await links.evaluate_all('es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,width:r.width,height:r.height,center:r.x+r.width/2}})')
    assert len(boxes)==5 and max(b['width'] for b in boxes)-min(b['width'] for b in boxes)<1
    assert abs(boxes[2]['center']-width/2)<1 and all(b['height']>=44 for b in boxes)
    assert all(boxes[i]['x']>boxes[i+1]['x'] for i in range(4))
    assert await nav.locator('.nav-featured .nav-label').inner_text()==labels[2]
    assert await nav.locator('.nav-featured .nav-icon').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(225, 196, 149)'
    assert await nav.locator('a').nth(3).evaluate('e=>getComputedStyle(e.querySelector(".nav-icon")).backgroundColor')=='rgba(0, 0, 0, 0)'
    assert await nav.locator('.nav-location,a[target="_blank"]').count()==0
    if width in [390,1440]:await page.screenshot(path=f'/tmp/guide-v67/{venue}-nav-{width}.png',full_page=True)
    await links.nth(4).click();assert page.url.endswith('/'+venue+'/contact/');assert await page.locator('#bottom-nav [aria-current="page"] .nav-label').inner_text()=='التواصل'
    assert await page.locator('a[href^="https://maps."]').count()>0
    await page.locator('a[href="/'+venue+'/faq/"]').click();assert page.url.endswith('/'+venue+'/faq/');assert await page.locator('#bottom-nav [aria-current="page"] .nav-label').inner_text()=='التواصل'
    await page.locator('#bottom-nav a').nth(2).click();expected='/cabins/' if venue=='resort' else '/stay/sections/' if venue=='stay' else '/chalet/details/';assert page.url.endswith(expected)
    assert await page.locator('#bottom-nav [aria-current="page"]').get_attribute('class')=='nav-featured'
    await page.locator('#bottom-nav a').nth(3).click();assert page.url.endswith('/services/' if venue=='resort' else '/'+venue+'/services/')
    assert await page.locator('#bottom-nav [aria-current="page"] .nav-label').inner_text()=='الخدمات'
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    out['navigation'].append({'width':width,'venue':venue,'labels':labels,'equalWidths':True,'centerGoldAccommodation':True,'linksAndActiveStates':True})
   # The outer catalogue cards are the primary entry, including the longest Panoramic label.
   await visit('/cabins/')
   for u in catalog['units']:
    if u['venue']!='resort' or u['key'] not in EXPECTED:continue
    card=page.locator('.resort-unit-card[data-unit-id="'+str(u['id'])+'"]');cta=card.locator('.card-explore');await cta.scroll_into_view_if_needed()
    expected='استكشف مرافق '+re.sub(r'\s+[12]$','',u['name'])+' من الداخل'
    assert (await cta.inner_text()).strip()==expected
    assert await cta.evaluate('e=>e.scrollWidth<=e.clientWidth+1&&e.querySelector("span").scrollWidth<=e.querySelector("span").clientWidth+1')
    assert await cta.evaluate('e=>{const a=e.getBoundingClientRect(),c=e.closest(".unit-card").getBoundingClientRect();return a.bottom<=c.bottom+1&&a.left>=c.left&&a.right<=c.right}')
    if u['key']=='panoramic' and width in [320,390,1440]:
     await card.evaluate('e=>{const g=e.closest(".units-grid");g.style.scrollSnapType="none";g.style.scrollBehavior="auto";e.scrollIntoView({behavior:"instant",inline:"start",block:"nearest"})}')
     await page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
     await page.screenshot(path=f'/tmp/guide-v67/panoramic-card-{width}.png',full_page=True)
   if width in [320,390,1440]:
    for u in catalog['units']:
     if u['venue']!='resort' or u['key'] not in EXPECTED:continue
     await visit(u['path']);description=page.locator('.description');assert await description.locator('p').all_text_contents()==EXPECTED[u['key']].split('\n')
     assert await description.locator('p').first.evaluate('e=>getComputedStyle(e).textWrap')=='balance'
     assert await page.locator('.suitability-inline').inner_text()=='('+u['suitable']+')'
     assert await page.locator('.fact-box').count()==3
     title='استكشف مرافق '+re.sub(r'\s+[12]$','',u['name'])+' من الداخل';cta=page.locator('.cabin-explore-primary');assert (await cta.inner_text()).strip()==title
     assert await cta.get_attribute('href')==u['tour']
     assert await cta.evaluate('e=>e.scrollWidth<=e.clientWidth+1&&e.querySelector("span").scrollWidth<=e.querySelector("span").clientWidth+1')
     if width==390 and u['key'] in ['dome-1','classic','panoramic']:await page.screenshot(path='/tmp/guide-v67/'+u['key']+'-copy.png',full_page=True)
     # Follow the real card CTA to its original URL; share metadata must say the same thing.
     await cta.click();await page.locator('#tour-frame').wait_for();assert await page.locator('.resort-visual-title').inner_text()==title
     assert await page.locator('meta[property="og:title"]').get_attribute('content')==title
     response=await page.request.get(BASE+u['tour']);markup=await response.text();assert '<meta property="og:title" content="'+title+'">' in markup
     assert 'og:image' not in markup and 'twitter:image' not in markup and '<img ' not in markup
     frame=page.frame_locator('#tour-frame');await frame.locator('.dt-label').first.wait_for();await frame.locator('.dt-image').evaluate('async e=>{e.loading="eager";await e.decode()}');await frame.locator('body').evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
     assert await frame.locator('.dt-title').inner_text()==title
     await page.locator('#header-actions [data-share]').click();payload=await page.evaluate('shares.at(-1)');assert list(payload)==['text']
     shared=await page.request.get(payload['text']);assert '<meta property="og:title" content="'+title+'">' in await shared.text()
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     out['cabins'].append({'width':width,'key':u['key'],'approvedCopy':True,'explorationTitle':title,'fullTitleFits':True,'staticShareMatches':True})
    await visit('/chalet/details/');title='استكشف مرافق الشاليه من الداخل';assert (await page.locator('.cabin-explore-primary').inner_text()).strip()==title
    await page.locator('.cabin-explore-primary').click();assert await page.locator('.resort-visual-title').inner_text()==title
   await c.close();print(width,'PASS',flush=True)
  # Native share fallback still copies only the public link.
  c=await browser.new_context();page=await c.new_page();await page.add_init_script("Object.defineProperty(navigator,'share',{value:undefined});window.copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>copied.push(text)}})")
  await page.goto(BASE+'/');await page.locator('.destination-share').click();assert await page.evaluate('copied')==[BASE+'/'];await c.close();await browser.close()
 assert not out['errors'] and not out['badResponses'],out
 (R/'site/audits/guide-batch-v67.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'cabins':len(out['cabins']),'navigation':len(out['navigation']),'homeShares':len(out['homeShares']),'errors':out['errors'],'badResponses':out['badResponses']}))
asyncio.run(main())

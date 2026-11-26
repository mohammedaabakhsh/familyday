"""Verify the full menu and native ordering from both main-site entries; never send messages."""
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from urllib.parse import urlparse,parse_qs
import os,json,sys,subprocess
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8150';catalog=json.load(open(R/'data/services.json'))['guest'];out={'version':'20261126-live-v89','profiles':[],'errors':[],'messagesSent':False}
assert (R/'data/services.json').read_bytes()==subprocess.check_output(['git','show','pre-direct-menu-tabs-20261126:data/services.json'],cwd=R)
with sync_playwright() as p:
 opts={'executable_path':'/usr/bin/chromium','args':['--no-sandbox']}
 if BASE.startswith('https:'):opts['proxy']={'server':os.environ['HTTPS_PROXY']}
 b=p.chromium.launch(**opts)
 for w,h in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce',ignore_https_errors=True);c.add_init_script("window.opened=[];window.shares=[];window.open=u=>{top.opened.push(u);return null};Object.defineProperty(navigator,'share',{value:async d=>top.shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));drafts={}
  for path in ['/services/','/menu/']:
   page.goto(BASE+path);menu=page.locator('.restaurant-guide');expect(menu).to_be_visible();assert page.locator('.restaurant-overview').count()==0
   categories=menu.locator('.restaurant-menu-category');assert categories.count()==len(catalog['menu']);assert categories.first.get_attribute('open') is not None
   for i,(name,items) in enumerate(catalog['menu'].items()):
    cat=categories.nth(i);assert cat.locator('summary span').inner_text()==name
    if cat.get_attribute('open') is None:cat.locator('summary').click()
    assert cat.locator('.menu-row h3').all_text_contents()==[x['name'] for x in items]
    assert cat.locator('.menu-row>strong').all_text_contents()==[str(x['price'])+' ريال' for x in items]
    for j,item in enumerate(items):
     row=cat.locator('.menu-row').nth(j)
     if item.get('desc'):assert item['desc'] in row.inner_text()
     if item.get('cheesePrice'):assert 'إضافة جبن '+str(item['cheesePrice'])+' ريال' in row.inner_text()
   assert catalog['restaurantHours'] in menu.inner_text();assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if path=='/services/':
    root=page.locator('#resort-service-directory');buttons=root.locator('.service-categories button');assert buttons.all_text_contents()==['المطعم','التنسيقات','الإقامة','هدايا'];dims=buttons.evaluate_all('(es)=>es.map(e=>{let r=document.createRange();r.selectNodeContents(e);return {lines:r.getClientRects().length,overflow:e.scrollWidth>e.clientWidth}})');assert all(d['lines']==1 and not d['overflow'] for d in dims),dims
    for i,count in [(1,4),(2,3),(3,2)]:buttons.nth(i).click();assert root.locator('.svcs-card:visible').count()==count
    buttons.first.click();assert menu.is_visible()
   button=menu.locator('[data-service-portal]');button.click();expect(page.locator('.native-order-loading')).to_be_hidden(timeout=45000);expect(page.locator('#native-order-title')).to_have_text('المطعم');page.locator('.native-order-share').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/menu/'}
   f=page.frame_locator('.native-order-frame');cat=f.locator('#guest-menu details').first;cat.locator('summary').click();cat.locator('[data-step="1"]').first.click();f.locator('#restaurant-name').fill('فحص المينيو');f.locator('#restaurant-cabin').select_option('بيت الدوم 1');f.locator('.resort-direct-send').click();expect(page.locator('#native-order-dialog')).to_be_hidden();u=page.evaluate('opened.at(-1)');drafts[path]=u;assert 'ساندويتش دجاج زنجر' in parse_qs(urlparse(u).query)['text'][0]
   if path=='/services/':
    assert page.url==BASE+'/services/';expect(menu).to_be_visible();page.evaluate("document.querySelector('#resort-service-directory').scrollTop=0")
    if w==390:page.screenshot(path='/tmp/direct-menu-v89.png')
  assert drafts['/services/']==drafts['/menu/'];out['profiles'].append({'width':w,'height':h,'fullMenuItems':sum(map(len,catalog['menu'].values())),'oneLineTabs':True,'menuEntryDraftParity':True,'sharePath':'/menu/'})
  c.close()
 b.close()
assert not out['errors'],out;Path('/tmp/direct-menu-v89'+('-live' if BASE.startswith('https:') else '')+'.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

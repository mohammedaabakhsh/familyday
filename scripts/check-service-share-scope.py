"""Share whole service sections; retain independent orders and compatibility for retired item URLs."""
from pathlib import Path
from urllib.parse import urlparse
import json,sys
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8144';cfg=json.loads((R/'site/cutover-config.json').read_text());out={'version':'20261126-live-v81','viewports':[],'messagesSent':False,'errors':[]}
sections={'coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
assert not (R/'js/service-item-routes.js').exists()
for path,parent in cfg['retiredServiceItemRoutes'].items():
 text=(R/path.lstrip('/')/'index.html').read_text();assert 'location.replace' in text and parent in text and 'service-item-routes.js' not in text
 assert 'https://familydaystay.com'+path+'</loc>' not in (R/'sitemap.xml').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  page.goto(BASE+'/services-guide/');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services-guide/'}
  for section,path in sections.items():
   page.goto(BASE+'/services-guide/#'+section);page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+'/services-guide/#'+section}
   if section in ['coordination','seating']:
    assert page.locator('#'+section+' .package-card').count()==6
    assert page.locator('#'+section+' [data-share-path],#'+section+' .arrangement-share').count()==0
    for button in page.locator('#'+section+' .seating-collapsed-summary').all():button.click()
    assert page.locator('#'+section+' [data-request-key]:visible').count()==6
  for section in ['coordination','seating']:
   page.goto(BASE+sections[section]);page.locator('#main h1').wait_for();assert page.locator('.service-guide-packages>.package').count()==6;assert page.locator('.service-guide-packages [data-share]').count()==0;page.locator('.header [data-share]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+sections[section]}
  # Previously distributed individual URLs still lead to the complete section.
  for path,parent in cfg['retiredServiceItemRoutes'].items():
   page.goto(BASE+path);page.wait_for_url(BASE+parent);page.locator('#main h1').wait_for();assert page.locator('.service-guide-packages>.package').count()==6;assert page.locator('.service-guide-packages>.package[open]').count()==0;assert page.locator('.service-item-guide').count()==0
  for path in ['/services/coordination/?package=1&from=qr','/services/outdoor-seating/?session=2&from=qr']:
   page.goto(BASE+path);page.wait_for_url(BASE+urlparse(path).path+'?from=qr');assert page.locator('.service-guide-packages>.package').count()==6
  out['viewports'].append({'width':width,'height':height,'wholeSectionSharesOnly':True,'noItemShareButtons':True,'individualOrderButtonsRetained':True,'twelveRetiredLinksWork':True,'oldQueriesOpenCompleteSection':True});c.close();print(width,'PASS',flush=True)
 c=b.new_context();c.add_init_script("window.copied=[];Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async u=>copied.push(u)}})");page=c.new_page();page.goto(BASE+'/services-guide/#seating');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('copied.at(-1)')==BASE+'/services-guide/#seating';out['clipboardFallback']=True;c.close();b.close()
assert not out['errors'],out
(R/'site/audits/service-share-scope-v81.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

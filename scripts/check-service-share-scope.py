"""General section sharing and dedicated item-page sharing, including clipboard and Back."""
from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8142';data=json.loads((R/'data/services.json').read_text())['arrangements'];out={'version':'20261126-live-v78','viewports':[],'messagesSent':False,'errors':[]}
sections={'coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})");page=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)))
  def visit(path):page.goto(BASE+path);page.locator('#guide-content.is-ready').wait_for(state='attached')
  def header(expected):
   before=page.evaluate('shares.length');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.length')==before+1;assert page.evaluate('shares.at(-1)')=={'text':BASE+expected}
  visit('/services-guide/');header('/services-guide/')
  for section,path in sections.items():visit('/services-guide/#'+section);header(path)
  targets=[]
  for pck in data['coordination']['packages']:
   key=pck['id'].replace('hd-coordination-package-','');targets.append(('coordination','package-complete' if key=='resort' else 'package-'+key,sections['coordination']+'package-'+key+'/'))
  for i in range(1,7):targets.append(('seating','session-'+str(i),sections['seating']+'session-'+str(i)+'/'))
  for section,card,path in targets:
   visit('/services-guide/#'+card);page.locator('#'+card+' [data-share-path]').click();assert page.evaluate('shares.at(-1)')=={'text':BASE+path};header(sections[section])
  page.goto(BASE+sections['seating']+'session-5/');page.locator('.service-item-guide').wait_for();saved_y=page.evaluate('()=>{window.scrollTo({top:120,behavior:"instant"});return scrollY}');page.goto(BASE+'/services/');page.go_back();expect(page.locator('.service-item-guide')).to_be_visible();page.wait_for_timeout(50);assert abs(page.evaluate('scrollY')-saved_y)<2,(width,saved_y,page.evaluate('scrollY'))
  out['viewports'].append({'width':width,'height':height,'homeAndFourSectionHeaders':True,'twelveStandaloneItemShares':True,'backPositionRestored':True});c.close();print(width,'PASS',flush=True)
 c=b.new_context();c.add_init_script("window.copied=[];Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async u=>copied.push(u)}})");page=c.new_page();page.goto(BASE+'/services-guide/#session-2');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('copied.at(-1)')==BASE+sections['seating'];page.locator('#session-2 [data-share-path]').click();assert page.evaluate('copied.at(-1)')==BASE+sections['seating']+'session-2/';out['clipboardFallback']=True;c.close();b.close()
assert not out['errors'],out
(R/'site/audits/service-share-scope-v78.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

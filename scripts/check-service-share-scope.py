"""Section headers share the section; cards share and reveal the exact existing item URL."""
from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parents[1];BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8140';data=json.loads((R/'data/services.json').read_text())['arrangements'];out={'version':'20261126-live-v77','viewports':[],'messagesSent':False,'errors':[]}
sections={'coordination':'/services/coordination/','seating':'/services/outdoor-seating/','dining':'/services/dining-tables/','cinema':'/services/cinema/'}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,568),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("window.shares=[];Object.defineProperty(navigator,'share',{value:async d=>shares.push(d)})");page=c.new_page();shared=c.new_page();page.on('pageerror',lambda e:out['errors'].append(str(e)));shared.on('pageerror',lambda e:out['errors'].append(str(e)))
  def visit(path):page.goto(BASE+path);page.locator('#guide-content.is-ready').wait_for(state='attached')
  def header(expected):
   before=page.evaluate('shares.length');page.locator('.topbar [data-share]').click();assert page.evaluate('shares.length')==before+1;assert page.evaluate('shares.at(-1)')=={'text':BASE+expected}
  visit('/services-guide/');header('/services-guide/')
  for section,path in sections.items():visit('/services-guide/#'+section);header(path)
  # Specific hashes must not narrow the header share down to the item.
  for hash_,path in [('session-6',sections['seating']),('package-vip',sections['coordination'])]:visit('/services-guide/#'+hash_);header(path)
  targets=[]
  for pck in data['coordination']['packages']:
   key=pck['id'].replace('hd-coordination-package-','');targets.append(('coordination','package-complete' if key=='resort' else 'package-'+key,pck['path'],key,pck['name']))
  for i,seat in enumerate(data['seating']['sessions'],1):targets.append(('seating','session-'+str(i),sections['seating']+'?session='+str(i),str(i),seat['name']))
  for section,card,url,key,name in targets:
   visit('/services-guide/#'+card);button=page.locator('#'+card+' [data-share-path]');button.click();assert page.evaluate('shares.at(-1)')=={'text':BASE+url};header(sections[section])
   shared.goto(BASE+url);item=shared.locator('[data-service-item="'+key+'"][open]');expect(item).to_be_visible();expect(item.locator('summary')).to_be_in_viewport();shared.wait_for_function('(key)=>{const e=[...document.querySelectorAll("[data-service-item]")].find(e=>e.dataset.serviceItem===key);return e&&e.getBoundingClientRect().top<innerHeight*.6}',arg=key);summary=item.locator('summary');rect=summary.bounding_box();header_h=shared.locator('.header').bounding_box()['height'];assert rect['y']>=header_h-1,(url,width,rect,header_h);assert name in summary.inner_text();assert shared.locator('[data-service-item][open]').count()==1
   shared.locator('.header [data-share]').click();assert shared.evaluate('shares.at(-1)')=={'text':BASE+sections[section]};item.locator('[data-share]').click();assert shared.evaluate('shares.at(-1)')=={'text':BASE+url}
  # Returning to a visited item restores the guest's position instead of jumping again.
  shared.goto(BASE+sections['seating']+'?session=5');shared.locator('[data-service-item="5"][open]').wait_for();shared.wait_for_function('scrollY>0');shared.evaluate('window.scrollTo({top:120,behavior:"instant"})');shared.goto(BASE+'/services/');shared.go_back();expect(shared.locator('[data-service-item="5"][open]')).to_be_visible();shared.wait_for_timeout(50);assert abs(shared.evaluate('scrollY')-120)<2
  out['viewports'].append({'width':width,'height':height,'homeAndFourSectionHeaders':True,'twelveSpecificCardLinks':True,'targetRevealed':True,'mainHeaderAndCardConsistent':True,'backPositionRestored':True});c.close();print(width,'PASS',flush=True)
 # Clipboard fallback follows the same scope, with no native-share dependency.
 c=b.new_context();c.add_init_script("window.copied=[];Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async u=>copied.push(u)}})");page=c.new_page();page.goto(BASE+'/services-guide/#session-2');page.locator('#guide-content.is-ready').wait_for(state='attached');page.locator('.topbar [data-share]').click();assert page.evaluate('copied.at(-1)')==BASE+sections['seating'];page.locator('#session-2 [data-share-path]').click();assert page.evaluate('copied.at(-1)')==BASE+sections['seating']+'?session=2';out['clipboardFallback']=True;c.close();b.close()
assert not out['errors'],out
(R/'site/audits/service-share-scope-v77.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))

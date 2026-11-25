/* Adapt original service screens to preview navigation; service calculations/messages stay original. */
(function(){
 'use strict';
 const params=new URLSearchParams(location.search),view=params.get('view')||'directory';
 const routes={directory:'/services/',menu:'/menu/',water:'/services/water-games/',games:'/services/games/',cinema:'/services/cinema/',dining:'/services/dining-tables/',seating:'/services/outdoor-seating/',hospitality:'/services/hospitality/packages/',coordination:'/services/coordination/',competition:'/contest/',video:'/services/share-and-win/',loyalty:'/services/loyalty/'};
 const post=(type,data={})=>parent.postMessage({type,...data},location.origin);
 const navigate=path=>post('familyday-preview-service-navigate',{path});
 let lastLayer='',restoring=false;
 const fields=['order-name','order-villa','order-notes','order-time'];
 const key='familyday.preview.original-service.'+view;
 let saved={};try{saved=JSON.parse(sessionStorage.getItem(key)||'{}');}catch(_){}
 const visible=id=>{const e=document.getElementById(id);return e&&!e.classList.contains('hide')&&(e.classList.contains('open')||getComputedStyle(e).display!=='none');};
 function layer(){if(document.body.dataset.guideView==='section')return 'guide';if(document.querySelector('#service-dialog[open]'))return 'guest';return visible('fsOverlay')?'photo':visible('order-popup')?'order':visible('menu-cart-review')?'menu-cart':'';}
 function notify(){const next=layer();if(next!==lastLayer){lastLayer=next;post('familyday-preview-service-layer',{layer:next});}}
 function persist(){
  if(restoring||!document.body.classList.contains('original-service-ui'))return;
  const value={water:{packages:window._maiyaPackages,quantities:window._maiyaQuantities},games:window._tarfihiOpt,dining:{size:window._tawilatSize,option:window._tawilatOpt},seating:window._jalsatDrafts,open:[...document.querySelectorAll('details[open][id]')].map(e=>e.id),order:window._orderItemName,menu:window._isMenuOrder,orderOpen:visible('order-popup'),showTime:document.getElementById('order-time-wrap').style.display!=='none',fields:Object.fromEntries(fields.map(id=>[id,document.getElementById(id).value]))};
  saved=value;try{sessionStorage.setItem(key,JSON.stringify(value));}catch(_){}
  notify();
 }
 function back(){
  if(document.body.dataset.guideView==='section'){document.getElementById('guide-back').click();return;}
  const guestDialog=document.querySelector('#service-dialog[open]');if(guestDialog){guestDialog.querySelector('.dialog-close').click();notify();return;}
  if(visible('fsOverlay')){window.closeFS();notify();return;}
  if(visible('order-popup')){persist();window.closeOrderPopup();persist();return;}
  if(visible('menu-cart-review')){window.closeMenuCartReview();persist();return;}
  navigate(view==='directory'?'/resort/':'/services/');
 }
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='familyday-preview-service-back')back();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();back();}},true);
 // Every document link stays in the new preview. Existing in-page disclosures keep their behavior.
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a)return;
  const raw=a.getAttribute('href'),url=new URL(a.href,location.href);
  if(url.origin!==location.origin)return;
  if(raw.startsWith('#')){
   if(document.body.classList.contains('original-guide-ui')&&['#hospitality','#cinema'].includes(raw)){e.preventDefault();e.stopImmediatePropagation();navigate(routes[raw.slice(1)]);}
   return;
  }
  e.preventDefault();e.stopImmediatePropagation();
  let path=url.pathname.replace(/^\/(?:site|preview)\/(?:visuals\/services\/)?/,'/');
  if(path==='/index.html')path='/services/';
  navigate(path+url.search+url.hash);
 },true);
 if(!document.body.classList.contains('original-service-ui')){new MutationObserver(notify).observe(document.body,{attributes:true,attributeFilter:['open','data-guide-view'],subtree:true});notify();post('familyday-preview-service-ready');return;}
 const opens={directory:()=>document.getElementById('services-overlay').classList.remove('hide'),menu:window.openMenuDetail,water:window.openMaiyaDetail,games:window.openTarfihiDetail,cinema:()=>originalSetups('cinema'),dining:()=>originalSetups('dining'),seating:()=>originalSetups('seating'),hospitality:()=>originalHospitality('hospitality'),coordination:()=>originalHospitality('coordination'),competition:window.showContest,video:window.showSharik,loyalty:window.showWalaa};
 const originalSetups=window.openSetupsDetail,originalHospitality=window.showTansidat;
 const links={openMenuDetail:'menu',showMaiya:'water',openMaiyaDetail:'water',showTarfihi:'games',openTarfihiDetail:'games',showContest:'competition',showSharik:'video',showWalaa:'loyalty'};
 Object.entries(links).forEach(([name,target])=>window[name]=()=>navigate(routes[target]));
 window.showTansidat=tab=>navigate(routes[tab==='coordination'?'coordination':'hospitality']);
 window.openSetupsDetail=tab=>navigate(routes[tab]||routes.cinema);
 window.openPreparationService=(e,tab)=>{e.preventDefault();navigate(routes[tab]);return false;};
 ['closeMenuDetail','closeMaiyaDetail','closeTarfihiDetail','closeSinemaDetail','closeTawilatDetail','closeJalsatDetail','closeHospitalityDetail','closeSetupsDetail','closeContestDetail','closeSharikDetail','closeWalaaDetail'].forEach(name=>window[name]=()=>navigate('/services/'));
 window.closeServices=()=>navigate('/resort/');
 window.fdReturnToGuestServices=()=>false;
 // Separate preview storage never changes the original site's saved choices.
 restoring=true;
 if(saved.water&&Number.isInteger(saved.water.packages)&&saved.water.packages>=1&&saved.water.packages<=20){window._maiyaPackages=saved.water.packages;window._maiyaQuantities=saved.water.quantities||{adults:0,children:0};}
 if(['box','table',''].includes(saved.games))window._tarfihiOpt=saved.games;
 if(saved.dining&&Object.hasOwn(window._tawilatPrices,saved.dining.size)){window._tawilatSize=saved.dining.size;window._tawilatOpt=['plain','tansiq'].includes(saved.dining.option)?saved.dining.option:'';}
 if(saved.seating&&typeof saved.seating==='object')window._jalsatDrafts=saved.seating;
 (opens[view]||opens.directory)();
 if(view==='coordination'&&params.get('package'))window.openCoordinationPackage(params.get('package'));
 (saved.open||[]).forEach(id=>{const e=document.getElementById(id);if(e?.tagName==='DETAILS')e.open=true;});
 const originalOrder=window.openOrderPopup;
 window.openOrderPopup=function(selection,time){originalOrder(selection,time);if(JSON.stringify(saved.order)===JSON.stringify(selection))fields.forEach(id=>{if(typeof saved.fields?.[id]==='string')document.getElementById(id).value=saved.fields[id];});window.updateCabinNum();window.updateCinemaTimeRange();notify();};
 const originalSend=window.sendOrderWhatsapp;window.sendOrderWhatsapp=function(){const wasOpen=visible('order-popup');originalSend();if(wasOpen&&!visible('order-popup')){fields.forEach(id=>document.getElementById(id).value='');saved.fields={};persist();}};
 if(saved.orderOpen&&saved.order&&window.serviceOrderDetails(saved.order,false)){window._isMenuOrder=!!saved.menu;window.openOrderPopup(saved.order,!!saved.showTime);}
 restoring=false;
 document.addEventListener('input',persist);document.addEventListener('change',persist);document.addEventListener('click',()=>setTimeout(persist,0));
 window.addEventListener('pagehide',persist);
 new MutationObserver(()=>notify()).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
 notify();post('familyday-preview-service-ready');
})();

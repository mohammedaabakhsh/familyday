/* Same approved directory, without loading the unused order application. */
(function(){
 'use strict';
 var paths={menu:'/menu/',water:'/services/water-games/',games:'/services/games/',cinema:'/services/cinema/',dining:'/services/dining-tables/',seating:'/services/outdoor-seating/',hospitality:'/services/hospitality/packages/',coordination:'/services/coordination/',competition:'/contest/',video:'/services/share-and-win/',loyalty:'/services/loyalty/'};
 function navigate(path){parent.postMessage({type:'familyday-preview-service-navigate',path:path},location.origin);}
 [['openMenuDetail','menu'],['showMaiya','water'],['showTarfihi','games'],['showContest','competition'],['showSharik','video'],['showWalaa','loyalty']].forEach(function(pair){window[pair[0]]=function(){navigate(paths[pair[1]]);};});
 window.openPreparationService=function(event,key){event.preventDefault();navigate(paths[key]);return false;};
 window.closeServices=function(){navigate('/resort/');};
 document.addEventListener('click',function(event){
  var link=event.target.closest('a[href]');if(!link)return;
  var url=new URL(link.href,location.href);
  if(url.origin===location.origin&&!url.pathname.startsWith('/site/')){event.preventDefault();event.stopImmediatePropagation();navigate(url.pathname+url.search+url.hash);}
 },true);
 document.addEventListener('keydown',function(event){if(event.key==='Escape')window.closeServices();});
 var directory=document.getElementById('services-overlay'),scrollKey='familyday.preview.serviceDirectoryScroll',previousScroll=0;
 try{previousScroll=Number(sessionStorage.getItem(scrollKey))||0;}catch(_){}
 directory.classList.remove('hide');
 requestAnimationFrame(function(){directory.scrollTop=previousScroll;});
 directory.addEventListener('scroll',function(){try{sessionStorage.setItem(scrollKey,String(directory.scrollTop));}catch(_){}},{passive:true});
})();

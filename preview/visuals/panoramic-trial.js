/* Reversible preview-only card treatment; source drawings, facts and interactions stay original. */
(function(){
 'use strict';
 var enabled=true;
 var params=new URLSearchParams(location.search),previous=params.get('layout')==='previous';
 if(previous){
  document.addEventListener('click',function(event){
   var a=event.target.closest('a[href]');if(!a)return;
   var url=new URL(a.href,location.href);
   if(url.origin===location.origin&&/\/(?:panoramic-tour|resort-map)\//.test(url.pathname)){url.searchParams.set('layout','previous');a.href=url.href;}
  },true);
  return;
 }
 if(!enabled)return;
 if(location.pathname.includes('/panoramic-tour/'))document.documentElement.classList.add('panoramic-details-trial');
 if(location.pathname.includes('/resort-map/')){
  function select(id){document.documentElement.classList.toggle('panoramic-map-trial',Number(id)===10);}
  document.addEventListener('fd-map-selection-change',function(event){select(event.detail&&event.detail.cabinId);});
  var marker=document.querySelector('.fd-map-hotspot[aria-pressed="true"]');
  select(marker&&marker.dataset.locationKey==='panoramic'?10:null);
 }
})();

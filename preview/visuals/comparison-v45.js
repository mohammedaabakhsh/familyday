/* Reversible preview-only card treatment; source drawings, facts and interactions stay original. */
(function(){
 'use strict';
 if(new URLSearchParams(location.search).get('layout')!=='before')return;
 document.addEventListener('click',function(event){
  var a=event.target.closest('a[href]');if(!a)return;
  var url=new URL(a.href,location.href);
  if(url.origin===location.origin&&/\/(?:[a-z]+-tour|resort-map)\//.test(url.pathname)){url.searchParams.set('layout','before');a.href=url.href;}
 },true);
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
 if(location.pathname.includes('/panoramic-tour/')){
  document.documentElement.classList.add('panoramic-details-trial');
  var animation=null;
  function stopSliding(){
   if(!animation)return;
   var state=animation;animation=null;cancelAnimationFrame(state.frame);
   state.strip.style.scrollSnapType=state.snap;
   state.strip.style.scrollBehavior=state.behavior;
   ['pointerdown','touchstart','wheel'].forEach(function(type){state.strip.removeEventListener(type,stopSliding);});
   state.update();
  }
  window.FD_PANORAMIC_SCROLL=function(strip,direction,step,update){
   var max=Math.max(0,strip.scrollWidth-strip.clientWidth);
   var position=Math.max(0,Math.min(max,Math.abs(strip.scrollLeft)));
   var state=animation&&animation.strip===strip?animation:null;
   var target=Math.max(0,Math.min(max,(state?state.target:position)+step));
   if(state&&Math.abs(target-state.target)<.5)return;
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    stopSliding();strip.scrollTo({left:direction*target,behavior:'instant'});update();return;
   }
   if(!state){
    stopSliding();
    state={strip:strip,snap:strip.style.scrollSnapType,behavior:strip.style.scrollBehavior};
    ['pointerdown','touchstart','wheel'].forEach(function(type){strip.addEventListener(type,stopSliding,{passive:true});});
   } else cancelAnimationFrame(state.frame);
   state.target=target;state.update=update;animation=state;
   // Suspend snapping during the slide, then restore native finger scrolling.
   strip.style.scrollSnapType='none';strip.style.scrollBehavior='auto';
   var started=performance.now(),duration=280;
   function slide(now){
    if(animation!==state)return;
    if(!strip.isConnected){stopSliding();return;}
    var progress=Math.min(1,(now-started)/duration);
    var eased=progress*progress*(3-2*progress);
    strip.scrollTo({left:direction*(position+(target-position)*eased),behavior:'instant'});
    update();
    if(progress<1)state.frame=requestAnimationFrame(slide);
    else stopSliding();
   }
   state.frame=requestAnimationFrame(slide);
  };
  window.addEventListener('resize',stopSliding,{passive:true});
 }
 if(location.pathname.includes('/resort-map/')){
  function select(id){document.documentElement.classList.toggle('panoramic-map-trial',Number(id)===10);}
  document.addEventListener('fd-map-selection-change',function(event){select(event.detail&&event.detail.cabinId);});
  var marker=document.querySelector('.fd-map-hotspot[aria-pressed="true"]');
  select(marker&&marker.dataset.locationKey==='panoramic'?10:null);
 }
})();

/* Reversible preview-only card treatment; source drawings, facts and interactions stay original. */
(function(){
 'use strict';
 var enabled=true;
 var params=new URLSearchParams(location.search),previous=['previous','before'].includes(params.get('layout'));
 if(previous){
  document.addEventListener('click',function(event){
   var a=event.target.closest('a[href]');if(!a)return;
   var url=new URL(a.href,location.href);
   if(url.origin===location.origin&&/\/(?:[a-z]+-tour|resort-map)\//.test(url.pathname)){url.searchParams.set('layout',params.get('layout'));a.href=url.href;}
  },true);
  return;
 }
 if(!enabled)return;
 window.FD_RESORT_TOUR_LAYOUT=function(parts){
  var top=parts.filter(function(p){return !['pool','outdoor'].includes(p.id);});
  var bottom=parts.filter(function(p){return ['pool','outdoor'].includes(p.id);});
  var centered=null;
  if(top.length%2){
   centered=top.slice().sort(function(a,b){return Math.abs(a.x-.5)-Math.abs(b.x-.5);})[0];
  }
  var paired=top.filter(function(p){return p!==centered;}).sort(function(a,b){return a.x-b.x;});
  var half=paired.length/2;
  var left=paired.slice(0,half).sort(function(a,b){return a.y-b.y;});
  var right=paired.slice(half).sort(function(a,b){return a.y-b.y;});
  left.forEach(function(p,i){p.previewSlot={column:2,row:i+1,edge:'left'};});
  right.forEach(function(p,i){p.previewSlot={column:1,row:i+1,edge:'right'};});
  if(centered)centered.previewSlot={column:1,row:half+1,edge:'center',span:2};
  bottom.sort(function(a,b){return b.x-a.x;}).forEach(function(p,i){p.previewSlot={column:i+1,row:1,edge:'bottom'};});
  return {top:right.concat(left,centered?[centered]:[]).map(function(p){return p.id;}),bottom:bottom.map(function(p){return p.id;})};
 };
 window.FD_RESORT_DRAW_LINES=function(root,parts){
  if(!document.documentElement.classList.contains('resort-details-trial')||innerWidth>=600)return false;
  var stage=root.querySelector('.dt-stage'),image=root.querySelector('.dt-image');
  var box=stage.getBoundingClientRect(),im=image.getBoundingClientRect();
  if(!box.width||!im.height)return true;
  root.querySelector('.dt-lines').setAttribute('viewBox','0 0 '+box.width+' '+box.height);
  parts.forEach(function(p){
   var button=root.querySelector('.dt-label[data-part="'+p.id+'"]'),b=button.getBoundingClientRect();
   var tx=im.left-box.left+im.width*p.x,ty=im.top-box.top+im.height*p.y;
   var sx,sy,curve,edge=p.previewSlot.edge;
   if(edge==='bottom'){
    sx=b.left+b.width/2-box.left;sy=b.top-box.top;
    curve='C '+sx+' '+(sy-22)+' '+tx+' '+(ty+24)+' '+tx+' '+ty;
   } else if(edge==='center'){
    sx=b.left+b.width/2-box.left;sy=b.bottom-box.top;
    curve='C '+sx+' '+(sy+20)+' '+tx+' '+(ty-24)+' '+tx+' '+ty;
   } else {
    var left=edge==='left',lane=left?4:box.width-4,approach=im.top-box.top-8;
    sx=(left?b.left:b.right)-box.left;sy=b.top+b.height/2-box.top;
    curve='Q '+lane+' '+sy+' '+lane+' '+(sy+10)+' L '+lane+' '+approach+
     ' C '+lane+' '+(approach+24)+' '+tx+' '+(ty-28)+' '+tx+' '+ty;
   }
   root.querySelector('[data-line="'+p.id+'"]').setAttribute('d','M '+sx+' '+sy+' '+curve);
   var point=root.querySelector('.dt-point[data-part="'+p.id+'"]');point.style.left=tx+'px';point.style.top=ty+'px';
  });
  return true;
 };
 if(/\/(?:(?:dome|pyramid|classic|greek|palm|bohemian|french|rustic|royal|panoramic)-tour|chalet-map)\//.test(location.pathname)){
  document.documentElement.classList.add(location.pathname.includes('/chalet-map/')?'chalet-details-trial':'resort-details-trial');
  var animation=null;
  function stopSliding(){
   if(!animation)return;
   var state=animation;animation=null;cancelAnimationFrame(state.frame);
   state.strip.style.scrollSnapType=state.snap;
   state.strip.style.scrollBehavior=state.behavior;
   ['pointerdown','touchstart','wheel'].forEach(function(type){state.strip.removeEventListener(type,stopSliding);});
   state.update();
  }
  window.FD_RESORT_SCROLL=function(strip,direction,step,update){
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
})();

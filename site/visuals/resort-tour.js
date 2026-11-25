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
 // Explicit reading order for phones/tablets. Pairs are [right, left].
 var plans={
  dome:[['living','kitchen'],['bathroom','tub'],['bedroom']],
  pyramid:[['bedroom','living'],['tub','kitchen'],['bathroom']],
  classic:[['bedroom','living'],['bathroom','kitchen']],
  greek:[['twin','bedroom'],['living','kitchen'],['bathroom']],
  palm:[['twin','bedroom'],['kitchen','living'],['bathroom']],
  bohemian:[['bedroom','twin'],['living','kitchen'],['bathroom']],
  french:[['bedroom','twin'],['living','kitchen'],['bathroom']],
  rustic:[['bedroom','twin'],['living','kitchen'],['bathroom']],
  royal:[['bedroom','twin'],['living','kitchen'],['bathroom']],
  panoramic:[['bedroom','twin'],['living','bathroom'],['kitchen','tub']]
 };
 window.FD_RESORT_TOUR_LAYOUT=function(parts){
  var match=location.pathname.match(/\/([a-z]+)-tour\//),rows=plans[match&&match[1]],top=[];
  if(!rows){
   var indoors=parts.filter(function(p){return !['pool','outdoor'].includes(p.id);});
   rows=[];while(indoors.length)rows.push(indoors.splice(0,2).map(function(p){return p.id;}));
  }
  rows.forEach(function(ids,index){
   var row=ids.map(function(id){return parts.find(function(p){return p.id===id;});}).filter(Boolean);
   row.forEach(function(p,column){
    p.previewSlot={column:column+1,row:index+1,edge:row.length===1?'center':column===0?'right':'left',span:row.length===1?2:1};top.push(p.id);
   });
  });
  // Never invent a facility, and keep any future source-backed additions reachable.
  parts.filter(function(p){return !['pool','outdoor'].includes(p.id)&&!top.includes(p.id);}).forEach(function(p,index){
   p.previewSlot={column:index%2+1,row:rows.length+Math.floor(index/2)+1,edge:index%2?'left':'right'};top.push(p.id);
  });
  var bottom=parts.filter(function(p){return ['pool','outdoor'].includes(p.id);}).sort(function(a,b){return b.x-a.x;});
  bottom.forEach(function(p,i){p.previewSlot={column:i+1,row:1,edge:'bottom'};});
  return {top:top,bottom:bottom.map(function(p){return p.id;})};
 };
 window.FD_RESORT_DRAW_LINES=function(root,parts){
  if(!document.documentElement.classList.contains('resort-details-trial'))return false;
  var stage=root.querySelector('.dt-stage'),image=root.querySelector('.dt-image');
  var box=stage.getBoundingClientRect(),im=image.getBoundingClientRect();
  if(!box.width||!im.height)return true;
  var labels=parts.map(function(p){var b=root.querySelector('.dt-label[data-part="'+p.id+'"]').getBoundingClientRect();return {part:p,b:b};});
  var topLabels=labels.filter(function(label){return label.part.previewSlot.edge!=='bottom';});
  var lowest=Math.max.apply(null,topLabels.map(function(label){return label.b.bottom;}));
  var approach=Math.max(lowest+5,im.top-10)-box.top;
  root.querySelector('.dt-lines').setAttribute('viewBox','0 0 '+box.width+' '+box.height);
  labels.forEach(function(label){
   var p=label.part,b=label.b;
   var tx=im.left-box.left+im.width*p.x,ty=im.top-box.top+im.height*p.y;
   var sx,sy,curve,edge=p.previewSlot.edge;
   if(innerWidth>=900){
    // Wide layouts retain their rails; choose the exit from the actual measured position.
    var middle=b.left+b.width/2,imMiddle=im.left+im.width/2;
    if(b.bottom<=im.top+2){
     sx=middle-box.left;sy=b.bottom-box.top;
     curve='C '+sx+' '+(sy+24)+' '+tx+' '+Math.max(0,ty-28)+' '+tx+' '+ty;
    } else if(b.top>=im.bottom-2){
     sx=middle-box.left;sy=b.top-box.top;
     curve='C '+sx+' '+(sy-24)+' '+tx+' '+Math.min(box.height,ty+24)+' '+tx+' '+ty;
    } else {
     var fromLeft=middle<imMiddle;
     sx=(fromLeft?b.right:b.left)-box.left;sy=b.top+b.height/2-box.top;
     var bend=Math.max(2,Math.min(box.width-2,sx+(fromLeft?28:-28)));
     curve='C '+bend+' '+sy+' '+Math.max(2,Math.min(box.width-2,tx+(fromLeft?-24:24)))+' '+ty+' '+tx+' '+ty;
    }
   } else if(edge==='bottom'){
    sx=b.left+b.width/2-box.left;sy=b.top-box.top;
    curve='C '+sx+' '+(sy-22)+' '+tx+' '+(ty+24)+' '+tx+' '+ty;
   } else {
    var lower=topLabels.filter(function(other){return other!==label&&other.b.top>b.top+2;});
    var lastInColumn=!lower.some(function(other){return other.part.previewSlot.column===p.previewSlot.column&&other.part.previewSlot.edge!=='center';});
    var candidates=[b.left+b.width/2,b.left+b.width*.2,b.right-b.width*.2];
    var clear=candidates.find(function(x){return !lower.some(function(other){return x>other.b.left-3&&x<other.b.right+3;});});
    if((edge==='center'||lastInColumn)&&clear!==undefined){
     // Lower controls leave through their bottom edge, clearing any centered control below.
     sx=clear-box.left;sy=b.bottom-box.top;
     curve='L '+sx+' '+approach+' C '+sx+' '+(approach+20)+' '+tx+' '+(ty-24)+' '+tx+' '+ty;
     root.querySelector('.dt-label[data-part="'+p.id+'"]').dataset.arrowExit='bottom';
    } else {
     // Upper controls use the outside rail, never the face of another label.
     var left=edge==='left',lane=left?2:box.width-2;
     sx=(left?b.left:b.right)-box.left;sy=b.top+b.height/2-box.top;
     curve='Q '+lane+' '+sy+' '+lane+' '+(sy+8)+' L '+lane+' '+approach+
      ' C '+lane+' '+(approach+20)+' '+tx+' '+(ty-24)+' '+tx+' '+ty;
     root.querySelector('.dt-label[data-part="'+p.id+'"]').dataset.arrowExit=left?'left':'right';
    }
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

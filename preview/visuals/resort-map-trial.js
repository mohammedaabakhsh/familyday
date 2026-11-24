/* Preview-only map presentation. Physical plots, facts and the map engine stay authoritative. */
(function(){
 'use strict';
 var mode=new URLSearchParams(location.search).get('layout');
 if(mode==='before'||mode==='previous')return;
 document.documentElement.classList.add('resort-map-trial');
 var placements={
  'shared-garden':[36,8],classic:[80,22],royal:[84,36],pyramid:[11,35],
  'dome-upper':[11,45],'dome-lower':[11,56],bohemian:[11,68],panoramic:[13,81],
  rural:[31,94],french:[57,94],'palm-beach':[83,94],'greek-one':[89,64],'greek-two':[89,76]
 };
 function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
 function overlaps(a,b){return Math.abs(a.x-b.x)<(a.w+b.w)/2+5&&Math.abs(a.y-b.y)<(a.h+b.h)/2+5;}
 window.FD_RESORT_MAP_LAYOUT={
  prepare:function(data){
   data.locations.forEach(function(location){
    var position=placements[location.key];
    if(position){location.labelSide='offset';location.labelX=position[0];location.labelY=position[1];}
   });
  },
  render:function(view,viewport,plane,markers,locations,leaders,selected,syncToolbar){
   var size=view.size*view.scale;
   viewport.classList.toggle('has-selection',!!selected);
   view.x=size<=view.width?(view.width-size)/2:clamp(view.x,view.width-size,0);
   view.y=size<=view.height?(view.height-size)/2:clamp(view.y,view.height-size,0);
   plane.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';
   plane.style.setProperty('--fd-map-inverse',String(1/view.scale));
   plane.style.setProperty('--map-label-font',clamp(size/28,8.5,11.5)+'px');
   plane.style.setProperty('--map-label-height',(size<230?21:24)+'px');
   var boxes=locations.map(function(location,i){
    var label=markers[i].querySelector('span'),w=label.offsetWidth,h=label.offsetHeight;
    return {i:i,w:w,h:h,x:clamp(size*location.labelX/100,w/2+4,size-w/2-4),y:clamp(size*location.labelY/100,h/2+4,size-h/2-4)};
   });
   // Reserve the bottom road row before arranging the side labels around it.
   var road=boxes.filter(function(box){return ['rural','french','palm-beach'].includes(locations[box.i].key);});
   var roadRight=0;
   road.forEach(function(box){box.x=Math.max(box.x,roadRight+7+box.w/2);box.y=size-box.h/2-4;box.priority=0;roadRight=box.x+box.w/2;});
   var roadShift=Math.max(0,roadRight-(size-4));
   road.forEach(function(box){box.x-=roadShift;});
   // Resolve labels as actual measured text boxes, including short-phone selections.
   var placed=[],tools=viewport.querySelector('.resort-map-tools');
   if(tools&&tools.offsetWidth&&view.scale===1){
    var tr=tools.getBoundingClientRect(),vr=viewport.getBoundingClientRect();
    placed.push({x:tr.left-vr.left-view.x+tr.width/2,y:tr.top-vr.top-view.y+tr.height/2,w:tr.width,h:tr.height});
   }
   boxes.slice().sort(function(a,b){return (a.priority==null?1:0)-(b.priority==null?1:0)||a.y-b.y;}).forEach(function(box){
    if(placed.some(function(other){return overlaps(box,other);})){
     var best=null;
     for(var dy=-72;dy<=72;dy+=6)for(var dx=-72;dx<=72;dx+=6){
      var candidate={i:box.i,w:box.w,h:box.h,x:clamp(box.x+dx,box.w/2+4,size-box.w/2-4),y:clamp(box.y+dy,box.h/2+4,size-box.h/2-4)};
      var cost=(candidate.x-box.x)*(candidate.x-box.x)+(candidate.y-box.y)*(candidate.y-box.y);
      if((!best||cost<best.cost)&&!placed.some(function(other){return overlaps(candidate,other);})){candidate.cost=cost;best=candidate;}
     }
     if(best){box.x=best.x;box.y=best.y;}
    }
    placed.push(box);
   });
   boxes.forEach(function(box){
    var i=box.i,location=locations[i],marker=markers[i],px=size*location.x/100,py=size*location.y/100;
    marker.style.setProperty('--fd-map-label-x',box.x-px+'px');marker.style.setProperty('--fd-map-label-y',box.y-py+'px');
    if(leaders[i]){
     var dx=box.x-px,dy=box.y-py;
     var factor=Math.max(Math.abs(dx)/(box.w/2),Math.abs(dy)/(box.h/2),1);
     var end=[box.x-dx/factor,box.y-dy/factor];
     var bend=Math.abs(dx)>Math.abs(dy)?[end[0],py]:[px,end[1]];
     leaders[i].setAttribute('points',[[px,py],bend,end].map(function(point){return (point[0]*100/size)+','+(point[1]*100/size);}).join(' '));
     leaders[i].parentElement.classList.toggle('is-selected',location===selected);
    }
   });
   viewport.classList.toggle('is-zoomed',view.scale>1);
   viewport.classList.toggle('has-selection',!!selected);
   syncToolbar();
  }
 };
 function mountTools(){
  var viewport=document.querySelector('.fd-map-viewport');if(!viewport)return;
  var tools=document.createElement('div');tools.className='resort-map-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label','التحكم بالخريطة');
  [['+','تكبير الخريطة','+'],['−','تصغير الخريطة','-'],['','عرض الخريطة كاملة','Home']].forEach(function(item){
   var button=document.createElement('button');button.type='button';button.textContent=item[0];button.setAttribute('aria-label',item[1]);
   if(item[2]==='Home')button.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/></svg>';
   button.addEventListener('pointerdown',function(event){event.stopPropagation();});
   button.addEventListener('click',function(event){event.stopPropagation();viewport.dispatchEvent(new KeyboardEvent('keydown',{key:item[2],bubbles:true}));});tools.appendChild(button);
  });
  viewport.appendChild(tools);
  viewport.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));
  function updateCard(){
   var card=document.querySelector('#fd-map-card');if(!card||card.hidden)return;
   var garden=card.classList.contains('is-shared');
   card.querySelector('.fd-map-details-button').textContent='التفاصيل والصور';
   card.querySelector('.fd-map-tour-button').textContent=garden?'جولة الحديقة':'استكشف الكوخ';
  }
  document.addEventListener('fd-map-selection-change',updateCard);updateCard();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountTools);else mountTools();
})();

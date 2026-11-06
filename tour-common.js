/* Shared presentation for illustrated cabin explorations.
   Cabin facts, points, labels and layouts stay in each cabin module. */
var FD_TOUR_COMMON = (function () {
  'use strict';

  var icons = {
    tv:'M3 5h18v13H3ZM8 22h8m-4-4v4',
    speaker:'M3 9h18v7H3ZM7 11v3m10-3v3M10 12h4',
    wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01',
    sofa:'M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 15h14M3 11h2v8h14v-8h2v10H3Zm3 10v2m12-2v2',
    hob:'M3 3h18v18H3ZM6 6h4v4H6Zm8 0h4v4h-4ZM6 14h4v4H6Zm8 0h4v4h-4Z',
    microwave:'M2 5h20v14H2ZM5 8h10v8H5Zm13 0h1m-1 4h1m-1 4h1M5 19v2m14-2v2',
    fridge:'M5 2h14v20H5ZM5 9h14M8 5v2m0 5v4',
    kettle:'M7 8h9l2 11H5L7 8Zm1-3h7m-4-3v3M16 9h3a3 3 0 0 1 0 6h-2M7 10 3 8l3 7M4 22h15',
    coffee:'M5 3h14v5H5ZM6 8v13h13M15 8v3M9 12h8v5H9Zm8 1h2v3h-2M4 21h16',
    utensils:'M5 3v6m-3-6v6h6V3M5 9v12M17 3c-5 0-5 9 0 9s5-9 0-9Zm0 9v9',
    minibar:'M4 3h16v18H4ZM7 6h10v12H7ZM10 9h4v4h-4m2-4V7',
    dining:'M3 8h18v3H3Zm2 3v10m14-10v10M2 16h7m6 0h7',
    pool:'M3 18q2-2 4 0t4 0t4 0t4 0M3 22q2-2 4 0t4 0t4 0t4 0M8 15V5a2 2 0 0 1 4 0m3 10V5a2 2 0 0 1 4 0M8 8h7M8 12h7',
    size:'M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5M4 4l6 6m10-6-6 6M4 20l6-6m10 6-6-6',
    water:'M12 3c-2 4-6 7-6 11a6 6 0 0 0 12 0c0-4-4-7-6-11ZM9 15c0 2 1 3 3 3',
    tub:'M3 12h18l-2 7H5l-2-7ZM6 19v2m12-2v2M5 12V5a2 2 0 0 1 4 0',
    bed:'M3 20V8m18 12V8M3 16h18M3 10h18v6H3ZM6 6h5v4H6Zm7 0h5v4h-5Z',
    kitchen:'M3 10h18v11H3ZM12 10v11M6 14h2m8 0h2M5 10V5h6m-2 0v3',
    chair:'M4 5l6 10h11v3H7L2 7m6 11-2 3m12-3 2 3',
    shower:'M5 21V7a4 4 0 0 1 8 0M9 9h8m-7 4v1m3-1v1m3-1v1m-6 3v1m3-1v1m3-1v1',
    outdoor:'M3 10c3-9 15-9 18 0H3Zm9-6v17M8 21h8M4 14v6m0-3h4m12-3v6m0-3h-4'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+(icons[name]||icons.kitchen)+'"/></svg>';
  }
  function esc(text) { return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function kitchenIcon(text) {
    return {'موقد كهربائي':'hob','ميكروويف':'microwave','ثلاجة':'fridge','غلاية':'kettle','ماكينة قهوة':'coffee','أدوات مطبخ أساسية':'utensils','ميني بار':'minibar'}[text] || 'kitchen';
  }
  function cardValue(value) {
    if (value === 'سماعات داخلية (ساوند بار)') return '<span class="dt-soundbar-line">سماعات داخلية</span><span class="dt-soundbar-line">(ساوند بار)</span>';
    if (value === 'حمام خاص داخل غرفة النوم الرئيسية') return '<span class="dt-soundbar-line">حمام خاص</span><span class="dt-soundbar-line">داخل غرفة النوم الرئيسية</span>';
    return esc(value);
  }

  function markup(parts, topOrder, bottomOrder, image, loading, linkedCabins) {
    var labelButton=function(p){return '<button type="button" class="dt-label dt-label--'+p.id+'" data-part="'+p.id+'" aria-controls="dt-details"></button>';};
    var topParts=topOrder.map(function(id){return parts.find(function(p){return p.id===id;});});
    var bottomParts=bottomOrder.map(function(id){return parts.find(function(p){return p.id===id;});});
    return '<header class="dt-heading"><div class="dt-heading-copy"><h1 id="dt-title" class="dt-title"></h1><p class="dt-instruction">اضغط على المرفق لعرض تفاصيله</p></div></header><div class="dt-stage"><div class="dt-labels dt-labels--top">'+topParts.map(labelButton).join('')+'</div><div class="dt-image-space"><img class="dt-image" src="'+esc(image)+'" width="1536" height="1024" loading="'+loading+'" decoding="async" alt=""></div><div class="dt-labels dt-labels--bottom">'+bottomParts.map(labelButton).join('')+'</div><svg class="dt-lines" aria-hidden="true">'+parts.map(function(p){return '<path data-line="'+p.id+'"/>';}).join('')+'</svg>'+parts.map(function(p){return '<button type="button" class="dt-point" data-part="'+p.id+'" tabindex="-1" aria-controls="dt-details"><span></span></button>';}).join('')+'</div><div id="dt-details" class="dt-details" role="region" aria-live="polite" aria-atomic="true"></div>'+(linkedCabins?'<footer class="dt-tour-footer"><p class="dt-connection-note">يمكن ربط الكلاسيكي ورويال عبر باب داخلي بسعة تصل إلى 35 ضيفًا.</p><p class="dt-occupancy"></p></footer>':'<p class="dt-occupancy"></p>');
  }
  function renderDetails(root, cards, note, title, hideEmpty) {
    var details=root.querySelector('.dt-details'), scrollable=cards.length>3;
    if(hideEmpty) details.classList.toggle('is-empty',cards.length===0&&!note);
    var body='<div class="dt-cards'+(scrollable?' is-scrollable':'')+'">'+cards.map(function(card){return '<div class="dt-card">'+icon(card.icon)+'<div>'+(card.label?'<span>'+esc(card.label)+'</span>':'')+'<strong'+(card.numeric?' dir="ltr"':'')+'>'+cardValue(card.value)+'</strong></div></div>';}).join('')+'</div>';
    details.innerHTML=(!hideEmpty||cards.length?body:'')+(scrollable?'<div class="dt-spec-navigation" role="group" aria-label="التنقل بين المواصفات" hidden><button type="button" data-spec-direction="previous" aria-label="المواصفات السابقة"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button><span class="dt-spec-hint">اسحب لعرض المزيد</span><button type="button" data-spec-direction="next" aria-label="المواصفات التالية"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button></div>':'')+(note?'<p class="dt-note">'+esc(note)+'</p>':'');
    details.insertAdjacentHTML('afterbegin','<h2 class="dt-selected-title">'+esc(title)+'</h2>');
    if (scrollable) {
      var strip=details.querySelector('.dt-cards');
      strip.addEventListener('scroll',function(){updateSpecNavigation(details);},{passive:true});
      details.querySelectorAll('[data-spec-direction]').forEach(function(button){
        button.addEventListener('click',function(){
          var direction=getComputedStyle(strip).direction==='rtl'?-1:1;
          var forward=button.dataset.specDirection==='next'?1:-1;
          var card=strip.querySelector('.dt-card');
          var step=card.getBoundingClientRect().width+(parseFloat(getComputedStyle(strip).columnGap)||0);
          strip.scrollBy({left:direction*forward*step,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        });
      });
      requestAnimationFrame(function(){updateSpecNavigation(details);});
    }
  }
  function updateSpecNavigation(details) {
    var navigation=details.querySelector('.dt-spec-navigation');
    if(!navigation)return;
    var strip=details.querySelector('.dt-cards'), max=strip.scrollWidth-strip.clientWidth;
    navigation.hidden=max<=1;
    var position=Math.abs(strip.scrollLeft);
    navigation.querySelector('[data-spec-direction="previous"]').disabled=position<=1;
    navigation.querySelector('[data-spec-direction="next"]').disabled=position>=max-1;
  }
  window.addEventListener('resize',function(){
    requestAnimationFrame(function(){document.querySelectorAll('.dt-details').forEach(updateSpecNavigation);});
  },{passive:true});
  // Preserve each layout's label edges at mobile, tablet and desktop widths.
  function drawLines(root, parts, layout) {
    if(!root || !root.isConnected) return;
    var stage=root.querySelector('.dt-stage'), image=root.querySelector('.dt-image');
    var box=stage.getBoundingClientRect(), im=image.getBoundingClientRect();
    if(!box.width || !im.height) return;
    root.querySelector('.dt-lines').setAttribute('viewBox','0 0 '+box.width+' '+box.height);
    var mobile=window.matchMedia('(max-width:599px)').matches;
    var sideLayout=window.matchMedia('(min-width:'+layout.sideLayoutMinWidth+'px)').matches;
    parts.forEach(function(p){
      var b=root.querySelector('.dt-label[data-part="'+p.id+'"]').getBoundingClientRect();
      var tx=im.left-box.left+im.width*p.x, ty=im.top-box.top+im.height*p.y;
      var sx, sy, curve;
      if(sideLayout){
        var side=layout.sides[p.id];
        if(side==='top'){
          sx=b.left+b.width/2-box.left; sy=b.bottom-box.top;
          curve='C '+sx+' '+(sy+28)+' '+tx+' '+(ty-32)+' '+tx+' '+ty;
        } else {
          sx=(side==='left'?b.right:b.left)-box.left; sy=b.top+b.height/2-box.top;
          var bend=sx+(side==='left'?28:-28);
          curve='C '+bend+' '+sy+' '+(tx+(side==='left'?-28:28))+' '+ty+' '+tx+' '+ty;
        }
      } else if(mobile){
        sx=b.left+b.width/2-box.left; sy=b.bottom-box.top;
        curve='C '+sx+' '+(sy+35)+' '+tx+' '+(ty-45)+' '+tx+' '+ty;
        if(b.top>=im.bottom-4){
          sy=b.top-box.top;
          curve='C '+sx+' '+(sy-24)+' '+tx+' '+(ty+30)+' '+tx+' '+ty;
        } else if(b.bottom<=im.top+4){
          if(layout.mobileGutter){
            // Leave the inner edge into the column gutter, clear of every button.
            var rightColumn=b.left+b.width/2>box.left+box.width/2;
            sx=(rightColumn?b.left:b.right)-box.left; sy=b.top+b.height/2-box.top;
            var lane=box.width/2+(rightColumn?4:-4), approach=im.top-box.top-6;
            curve='Q '+lane+' '+sy+' '+lane+' '+(sy+8)+
              ' L '+lane+' '+approach+
              ' C '+lane+' '+(approach+16)+' '+tx+' '+(ty-24)+' '+tx+' '+ty;
          } else {
            curve='C '+sx+' '+(sy+24)+' '+tx+' '+(ty-30)+' '+tx+' '+ty;
          }
        }
      } else if(layout.tabletTop.includes(p.id)){
        sx=b.left+b.width/2-box.left; sy=b.bottom-box.top;
        curve='C '+sx+' '+(sy+35)+' '+tx+' '+(ty-45)+' '+tx+' '+ty;
      } else {
        var left=layout.tabletLeft.includes(p.id);
        sx=(left?b.right:b.left)-box.left; sy=b.top+b.height/2-box.top;
        curve='C '+(sx+(left?40:-40))+' '+sy+' '+tx+' '+sy+' '+tx+' '+ty;
      }
      root.querySelector('[data-line="'+p.id+'"]').setAttribute('d','M '+sx+' '+sy+' '+curve);
      var point=root.querySelector('.dt-point[data-part="'+p.id+'"]');
      point.style.left=tx+'px';point.style.top=ty+'px';
    });
  }
  return {kitchenIcon:kitchenIcon, markup:markup, renderDetails:renderDetails, drawLines:drawLines};
})();

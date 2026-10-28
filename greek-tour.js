/* Greek House: approved illustrated tour; shared specifications from resort-data.js. */
var FD_GREEK_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'pool', language = 'ar';
  var parts = [
    {id:'bedroom', ar:'غرفة نوم بسرير مزدوج', en:'Bedroom with a double bed', x:0.255,y:0.29},
    {id:'bathroom', ar:'حمامات', en:'Bathrooms', x:0.358,y:0.236},
    {id:'twin', ar:'غرفة نوم بسريرين مفردين', en:'Bedroom with two single beds', x:0.747,y:0.296},
    {id:'living', ar:'المنطقة الداخلية', en:'Indoor area', x:0.575,y:0.392},
    {id:'kitchen', ar:'ركن المطبخ', en:'Kitchenette', x:0.438,y:0.297},
    {id:'dining', ar:'طاولة الطعام', en:'Dining table', x:0.488,y:0.351},
    {id:'pool', ar:'المسبح', en:'Pool', x:0.255,y:0.606},
    {id:'outdoor', ar:'المنطقة الخارجية', en:'Outdoor area', x:0.735,y:0.632}
  ];
  var translations = {
    'موقد كهربائي':'Electric hob', 'ميكروويف':'Microwave', 'ثلاجة':'Refrigerator',
    'غلاية':'Kettle', 'ماكينة قهوة':'Coffee maker', 'أدوات مطبخ أساسية':'Kitchen essentials',
    'ميني بار':'Minibar', 'سرير تشميس داخل المسبح':'In-pool lounger',
    'كراسي تشميس':'Sun loungers', 'دش خارجي':'Outdoor shower',
    'الجلسة الخارجية':'Private outdoor seating', 'شواية':'Barbecue'
  };
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
  function tr(ar,en) { return language === 'ar' ? ar : en; }
  function feature(text) {
    if (text === 'جلسة خارجية' || text === 'الجلسة الخارجية') return tr('جلسات خارجية','Outdoor seating areas');
    return language === 'ar' ? text : (translations[text] || text);
  }
  function kitchenIcon(text) {
    return {'موقد كهربائي':'hob','ميكروويف':'microwave','ثلاجة':'fridge','غلاية':'kettle','ماكينة قهوة':'coffee','أدوات مطبخ أساسية':'utensils','ميني بار':'minibar'}[text] || 'kitchen';
  }
  function updateBackLink() {
    var back=document.querySelector('.tour-back');
    if(!back) return;
    if(!back.dataset.arLabel) back.dataset.arLabel=back.textContent.replace(/[→←]/g,'').trim();
    var ar=back.dataset.arLabel;
    var en={'العودة إلى الأكواخ':'Back to cabins','خريطة الأكواخ':'Cabin map','الكوخ الهرمي':'Pyramid Cottage','البيت اليوناني':'Greek House','بيت الدوم':'Dome House'}[ar] || ar;
    back.dir=language==='ar'?'rtl':'ltr';
    back.setAttribute('aria-label',tr(ar,en));
    back.title=tr(ar,en);
    back.innerHTML='<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.documentElement.lang=language;
  }
  function cardValue(value) {
    if (value === 'سماعات داخلية (ساوند بار)') return '<span class="dt-soundbar-line">سماعات داخلية</span><span class="dt-soundbar-line">(ساوند بار)</span>';
    return esc(value);
  }
  function details() {
    var part = parts.find(function(p){return p.id===selected;});
    var cards = [], note = '', subtitle = '';
    if (selected === 'pool') {
      subtitle = tr('مسبح خاص للكبار','Private adult pool');
      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);
      if (dimensions) cards.push({label:tr('المقاس','Size'), value:dimensions[1]+' × '+dimensions[2]+' m', icon:'size', numeric:true});
      cards.push({label:tr('العمق','Depth'),value:String(cabin.pool.depthCm)+' cm',icon:'water',numeric:true});
      if (/جاكوزي/.test(cabin.pool.label)) cards.push({value:tr('جاكوزي داخل المسبح','In-pool jacuzzi'),icon:'tub'});
      cabin.pool.facilities.forEach(function(t){cards.push({value:feature(t),icon:t==='دش خارجي'?'shower':'chair'});});
    } else if (selected === 'kitchen') {
      cabin.features.kitchen.forEach(function(t){cards.push({value:feature(t),icon:kitchenIcon(t)});});
      if(cabin.minibar) note=tr('الميني بار: مشروبات وسناكس برسوم إضافية.','Minibar drinks and snacks are available at an extra charge.');
    } else if (selected === 'dining') {
      cards.push({value:tr('طاولة الطعام','Dining table'),icon:'dining'});
    } else if (selected === 'living') {
      cards=[{value:tr('صالة داخلية','Indoor lounge'),icon:'sofa'},{value:tr('تلفزيون ذكي','Smart TV'),icon:'tv'},{value:tr('سماعات داخلية (ساوند بار)','Soundbar'),icon:'speaker'},{value:tr('واي فاي مجاني','Free Wi-Fi'),icon:'wifi'}];
    } else if (selected === 'bedroom') {
      cards=[{label:tr('السرير','Bed'),value:tr('سرير مزدوج','Double bed'),icon:'bed'}];
    } else if (selected === 'bathroom') {
      cards=[{value:tr('حمام خاص بغرفة نوم بسرير مزدوج','En-suite bathroom in the bedroom with a double bed'),icon:'shower'},{value:tr('حمام مشترك','Shared bathroom'),icon:'shower'}];
    } else if (selected === 'twin') {
      cards=[{value:tr('سريران مفردان','Two single beds'),icon:'bed'}];
      
    } else {
      cabin.features.outdoor.filter(function(t){return !/بانيو/.test(t);}).forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});
    }
    root.querySelector('.dt-details').innerHTML='<div class="dt-detail-heading"><h4>'+esc(part[language])+'</h4>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</div><div class="dt-cards">'+cards.map(function(card){return '<div class="dt-card">'+icon(card.icon)+'<div>'+(card.label?'<span>'+esc(card.label)+'</span>':'')+'<strong'+(card.numeric?' dir="ltr"':'')+'>'+cardValue(card.value)+'</strong></div></div>';}).join('')+'</div>'+(note?'<p class="dt-note">'+esc(note)+'</p>':'');
  }
  function update() {
    root.lang=language; root.dir=language==='ar'?'rtl':'ltr';
    root.querySelector('.dt-title').textContent=tr('جولة داخل البيت اليوناني','Explore the Greek House');
    root.querySelector('.dt-occupancy').textContent=tr('مناسب للعائلات · حتى '+cabin.guests+' ضيوف','Family friendly · Up to '+cabin.guests+' guests');
    root.querySelector('.dt-image').alt=tr('رسم توضيحي لتوزيع البيت اليوناني ومرافقه','Illustrated layout of the Greek House and its facilities');
    root.querySelector('.dt-labels').setAttribute('aria-label',tr('اختر المرفق لعرض تفاصيله','Choose a facility to view its details'));
    root.querySelector('.dt-languages').setAttribute('aria-label',tr('لغة الجولة','Tour language'));
    parts.forEach(function(p){
      var button=root.querySelector('.dt-label[data-part="'+p.id+'"]');
      button.textContent=p[language]; button.setAttribute('aria-pressed',String(p.id===selected));
      var point=root.querySelector('.dt-point[data-part="'+p.id+'"]');
      point.setAttribute('aria-label',p[language]); point.classList.toggle('is-selected',p.id===selected);
      root.querySelector('[data-line="'+p.id+'"]').classList.toggle('is-selected',p.id===selected);
    });
    root.querySelectorAll('[data-language]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.language===language));});
    updateBackLink(); details(); queueLines();
  }
  function queueLines() { cancelAnimationFrame(frame); frame=requestAnimationFrame(drawLines); }
  function drawLines() {
    if(!root || !root.isConnected) return;
    var stage=root.querySelector('.dt-stage'), image=root.querySelector('.dt-image');
    var box=stage.getBoundingClientRect(), im=image.getBoundingClientRect();
    if(!box.width || !im.height) return;
    var svg=root.querySelector('.dt-lines');
    svg.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
    var mobile=window.matchMedia('(max-width:599px)').matches;
    parts.forEach(function(p){
      var button=root.querySelector('.dt-label[data-part="'+p.id+'"]'), b=button.getBoundingClientRect();
      var tx=im.left-box.left+im.width*p.x, ty=im.top-box.top+im.height*p.y;
      var left=['kitchen','dining','pool'].includes(p.id);
      var sx=mobile?b.left+b.width/2-box.left:(left?b.right:b.left)-box.left;
      var sy=mobile?b.bottom-box.top:b.top+b.height/2-box.top;
      var desktop=window.matchMedia('(min-width:900px)').matches;
      var below=false;
      var above=!mobile && ['bedroom','bathroom','twin'].includes(p.id);
      if(below || above){
        sx=b.left+b.width/2-box.left;
        sy=(below?b.top:b.bottom)-box.top;
      }
      var curve;
      if(below) curve='C '+sx+' '+(sy-40)+' '+tx+' '+(ty+45)+' '+tx+' '+ty;
      else if(mobile || above) curve='C '+sx+' '+(sy+35)+' '+tx+' '+(ty-45)+' '+tx+' '+ty;
      else curve='C '+(sx+(left?40:-40))+' '+sy+' '+tx+' '+sy+' '+tx+' '+ty;
      if(desktop){
        var side={"dining":"left","bedroom":"left","bathroom":"top","twin":"top","kitchen":"top","living":"right","pool":"left","outdoor":"right"}[p.id];
        if(side==='top'){
          sx=b.left+b.width/2-box.left; sy=b.bottom-box.top;
          curve='C '+sx+' '+(sy+28)+' '+tx+' '+(ty-32)+' '+tx+' '+ty;
        } else {
          sx=(side==='left'?b.right:b.left)-box.left; sy=b.top+b.height/2-box.top;
          var bend=sx+(side==='left'?28:-28);
          curve='C '+bend+' '+sy+' '+(tx+(side==='left'?-28:28))+' '+ty+' '+tx+' '+ty;
        }
      }
      if(mobile){
        var labelsBox=root.querySelector('.dt-labels').getBoundingClientRect();
        var labelsBottom=labelsBox.bottom-box.top;
        if(sy<labelsBottom-4){
          // Route between rows and around the label grid, never through another button.
          var gutter=sx<box.width/2?2:box.width-2;
          var rowGap=sy+3, belowLabels=labelsBottom+4;
          curve='L '+sx+' '+rowGap+' L '+gutter+' '+rowGap+' L '+gutter+' '+belowLabels+
            ' C '+gutter+' '+(belowLabels+22)+' '+tx+' '+(ty-30)+' '+tx+' '+ty;
        }
      }
      root.querySelector('[data-line="'+p.id+'"]').setAttribute('d','M '+sx+' '+sy+' '+curve);
      var point=root.querySelector('.dt-point[data-part="'+p.id+'"]'); point.style.left=tx+'px'; point.style.top=ty+'px';
    });
  }
  function remove() {
    if(observer) observer.disconnect();
    cancelAnimationFrame(frame);
    if(root) root.remove();
    root=null; cabin=null;
    document.getElementById('ov').classList.remove('fd-has-dome-tour');
  }
  function mount(next) {
    if(root && cabin && cabin.id===next.id) return;
    remove(); cabin=next; selected='pool'; language='ar';
    root=document.createElement('section');root.id='greek-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    root.innerHTML='<header class="dt-heading"><h1 id="dt-title" class="dt-title"></h1></header><div class="dt-stage"><div class="dt-labels">'+parts.map(function(p){return '<button type="button" class="dt-label dt-label--'+p.id+'" data-part="'+p.id+'" aria-controls="dt-details"></button>';}).join('')+'</div><img class="dt-image" src="/imgs/greek-tour-10-clarity-v1.png" width="1536" height="1024" loading="lazy" decoding="async" alt=""><svg class="dt-lines" aria-hidden="true">'+parts.map(function(p){return '<path data-line="'+p.id+'"/>';}).join('')+'</svg>'+parts.map(function(p){return '<button type="button" class="dt-point" data-part="'+p.id+'" tabindex="-1" aria-controls="dt-details"><span></span></button>';}).join('')+'</div><div class="dt-languages" role="group"><button type="button" data-language="ar" lang="ar" aria-label="العربية">AR</button><button type="button" data-language="en" lang="en" aria-label="English">EN</button></div><div id="dt-details" class="dt-details" role="region" aria-live="polite" aria-atomic="true"></div><p class="dt-occupancy"></p>';
    root.querySelector('.dt-image').src='/imgs/greek-tour-'+(cabin.id===13?'11':'10')+'-clarity-v1.png';
    document.getElementById('greek-tour-host').appendChild(root);
    var back=document.querySelector('.tour-back');
    if(back){
      root.querySelector('.dt-heading').prepend(back);
      var nav=document.querySelector('.tour-nav');
      if(nav) nav.remove();
    }
    document.getElementById('ov').classList.add('fd-has-dome-tour');
    root.addEventListener('click',function(event){
      var button=event.target.closest('button');if(!button)return;
      if(button.dataset.part) selected=button.dataset.part;
      else if(button.dataset.language) language=button.dataset.language;
      else return;
      update();
    });
    root.querySelector('.dt-image').addEventListener('load',queueLines);
    observer=new ResizeObserver(queueLines);observer.observe(root);update();
  }
  function sync() {
    if(document.getElementById('greek-tour-host') && typeof data!=='undefined') {
      mount(data.resort.items.find(function(c){return c.id===(new URLSearchParams(location.search).get('cabin')==='13'?13:4);}));
    }
  }
  sync();
  window.addEventListener('resize',queueLines,{passive:true});
  return {sync:sync};
})();
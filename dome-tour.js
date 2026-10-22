/* Dome 1: a photo-informed illustrated tour. Specifications come from resort-data.js. */
var FD_DOME_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'pool', language = 'ar';
  var parts = [
    {id:'kitchen', ar:'ركن المطبخ', en:'Kitchenette', x:.425, y:.265},
    {id:'bathroom', ar:'الحمام', en:'Bathroom', x:.55, y:.21},
    {id:'bedroom', ar:'غرفة النوم', en:'Bedroom', x:.50, y:.31},
    {id:'tub', ar:'البانيو', en:'Bathtub', x:.39, y:.34},
    {id:'pool', ar:'المسبح', en:'Pool', x:.19, y:.53},
    {id:'outdoor', ar:'الجلسة الخارجية', en:'Outdoor seating', x:.82, y:.52}
  ];
  var translations = {
    'موقد كهربائي':'Electric hob', 'ميكروويف':'Microwave', 'ثلاجة':'Refrigerator',
    'غلاية':'Kettle', 'ماكينة قهوة':'Coffee maker', 'أدوات مطبخ أساسية':'Kitchen essentials',
    'ميني بار':'Minibar', 'سرير تشميس داخل المسبح':'In-pool lounger',
    'كراسي تشميس':'Sun loungers', 'دش خارجي':'Outdoor shower',
    'جلسة خارجية':'Private outdoor seating', 'شواية':'Barbecue'
  };
  var icons = {
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
  function feature(text) { return language === 'ar' ? text : (translations[text] || text); }
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
      cabin.features.kitchen.forEach(function(t){cards.push({value:feature(t),icon:'kitchen'});});
      if(cabin.minibar) note=tr('الميني بار: مشروبات وسناكس برسوم إضافية.','Minibar drinks and snacks are available at an extra charge.');
    } else if (selected === 'bedroom') {
      cards=[{label:tr('السرير','Bed'),value:tr('سرير مزدوج','Double bed'),icon:'bed'}];
    } else if (selected === 'bathroom') {
      cards=[{value:tr('حمام خاص','Private bathroom'),icon:'shower'}];
    } else if (selected === 'tub') {
      cards=[{value:tr('بانيو داخل غرفة النوم','Bathtub in the bedroom'),icon:'tub'}];
    } else {
      cabin.features.outdoor.forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});
    }
    root.querySelector('.dt-details').innerHTML='<div class="dt-detail-heading"><h4>'+esc(part[language])+'</h4>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</div><div class="dt-cards">'+cards.map(function(card){return '<div class="dt-card">'+icon(card.icon)+'<div>'+(card.label?'<span>'+esc(card.label)+'</span>':'')+'<strong'+(card.numeric?' dir="ltr"':'')+'>'+esc(card.value)+'</strong></div></div>';}).join('')+'</div>'+(note?'<p class="dt-note">'+esc(note)+'</p>':'');
  }
  function update() {
    root.lang=language; root.dir=language==='ar'?'rtl':'ltr';
    root.querySelector('.dt-title').textContent=tr('جولة داخل بيت الدوم','Explore the Dome House');
    root.querySelector('.dt-occupancy').textContent=tr('مثالي للأزواج · حتى ضيفين','Ideal for couples · Up to 2 guests');
    root.querySelector('.dt-image').alt=tr('رسم توضيحي لتوزيع بيت الدوم ومرافقه','Illustrated layout of the Dome House and its facilities');
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
    details(); queueLines();
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
      var left=['kitchen','tub','pool'].includes(p.id);
      var sx=mobile?b.left+b.width/2-box.left:(left?b.right:b.left)-box.left;
      var sy=mobile?b.bottom-box.top:b.top+b.height/2-box.top;
      var curve=mobile?'C '+sx+' '+(sy+35)+' '+tx+' '+(ty-45)+' '+tx+' '+ty:'C '+(sx+(left?40:-40))+' '+sy+' '+tx+' '+sy+' '+tx+' '+ty;
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
    root=document.createElement('section');root.id='dome-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    root.innerHTML='<h3 id="dt-title" class="dt-title"></h3><div class="dt-stage"><div class="dt-labels">'+parts.map(function(p){return '<button type="button" class="dt-label dt-label--'+p.id+'" data-part="'+p.id+'" aria-controls="dt-details"></button>';}).join('')+'</div><img class="dt-image" src="imgs/dome-tour-v1.webp" width="1536" height="1024" loading="lazy" decoding="async" alt=""><svg class="dt-lines" aria-hidden="true">'+parts.map(function(p){return '<path data-line="'+p.id+'"/>';}).join('')+'</svg>'+parts.map(function(p){return '<button type="button" class="dt-point" data-part="'+p.id+'" tabindex="-1" aria-controls="dt-details"><span></span></button>';}).join('')+'</div><div class="dt-languages" role="group"><button type="button" data-language="ar" lang="ar">عربي</button><button type="button" data-language="en" lang="en">English</button></div><div id="dt-details" class="dt-details" role="region" aria-live="polite" aria-atomic="true"></div><p class="dt-occupancy"></p>';
    document.getElementById('galWrap').after(root);
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
    // Only Dome 1 has had its physical layout reviewed. Other cabins remain unchanged.
    var content=document.querySelector('#mBody .fd-cabin-content[data-cabin-id="1"]');
    if(content && typeof data!=='undefined') mount(data.resort.items.find(function(c){return c.id===1;}));
    else if(root) remove();
  }
  var body=document.getElementById('mBody');
  if(body){new MutationObserver(sync).observe(body,{childList:true});sync();}
  window.addEventListener('resize',queueLines,{passive:true});
  return {sync:sync};
})();
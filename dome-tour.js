/* Dome 1: a photo-informed illustrated tour. Specifications come from resort-data.js. */
var FD_DOME_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'bedroom', language = 'ar';
  var parts = [
    {id:'bedroom', ar:'المنطقة الداخلية', en:'Indoor area', x:.50, y:.34},
    {id:'bathroom', ar:'حمام', en:'Bathroom', x:.55, y:.26},
    {id:'kitchen', ar:'ركن المطبخ', en:'Kitchenette', x:.44, y:.29},
    {id:'tub', ar:'البانيو الداخلي', en:'Indoor bathtub', x:.40, y:.37},
    {id:'pool', ar:'المسبح', en:'Pool', x:.24, y:.53},
    {id:'outdoor', ar:'المنطقة الخارجية', en:'Outdoor area', x:.82, y:.55}
  ];
  var lineLayout = {
    sideLayoutMinWidth:900,
    tabletLeft:['kitchen','tub','pool'],
    tabletTop:[],
    sides:{"kitchen":"top","bathroom":"top","bedroom":"right","tub":"left","pool":"left","outdoor":"right"},
    mobileGutter:false
  };
  var kitchenIcon=FD_TOUR_COMMON.kitchenIcon;

  function tr(ar,en) { return language === 'ar' ? ar : en; }
  function feature(text) { return FD_TOUR_COMMON.feature(text, language); }
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

  function details() {
    var cards = [], note = '';
    if (selected === 'pool') {
      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);
      if (dimensions) cards.push({label:tr('المقاس','Size'), value:dimensions[1]+' × '+dimensions[2]+tr(' م',' m'), icon:'size', numeric:true});
      cards.push({label:tr('العمق','Depth'),value:String(cabin.pool.depthCm)+tr(' سم',' cm'),icon:'water',numeric:true});
      if (/جاكوزي/.test(cabin.pool.label)) cards.push({value:tr('جاكوزي داخل المسبح','In-pool jacuzzi'),icon:'tub'});
      cabin.pool.facilities.forEach(function(t){cards.push({value:feature(t),icon:t==='دش خارجي'?'shower':'chair'});});
    } else if (selected === 'kitchen') {
      cabin.features.kitchen.forEach(function(t){cards.push({value:feature(t),icon:kitchenIcon(t)});});
      if(cabin.minibar) note=tr('الميني بار: مشروبات وسناكس برسوم إضافية.','Minibar drinks and snacks are available at an extra charge.');
    } else if (selected === 'bedroom') {
      cards=[{label:tr('السرير','Bed'),value:tr('سرير مزدوج','Double bed'),icon:'bed'},{value:tr('صالة جلوس مدمجة مع غرفة النوم','Living area integrated with the bedroom'),icon:'sofa'},{value:tr('تلفزيون ذكي','Smart TV'),icon:'tv'},{value:tr('سماعات داخلية (ساوند بار)','Soundbar'),icon:'speaker'},{value:tr('واي فاي مجاني','Free Wi-Fi'),icon:'wifi'}];
    } else if (selected === 'bathroom') {
      cards=[{value:tr('حمام خاص بغرفة نوم بسرير مزدوج','En-suite bathroom in the bedroom with a double bed'),icon:'shower'}];
    } else if (selected === 'tub') {
      cards=[{value:tr('بانيو داخلي بغرفة النوم','Indoor bathtub in the bedroom'),icon:'tub'}];
    } else {
      cabin.features.outdoor.forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});
    }
    var activePart=parts.find(function(part){return part.id===selected;});
    FD_TOUR_COMMON.renderDetails(root,cards,note,tr(activePart.ar,activePart.en),false);
  }
  function update() {
    root.lang=language; root.dir=language==='ar'?'rtl':'ltr';
    root.querySelector('.dt-title').textContent=tr('استكشف بيت الدوم','Explore the Dome House');
    root.querySelector('.dt-occupancy').textContent=tr('مثالي للأزواج · حتى ضيفين','Ideal for couples · Up to 2 guests');
    root.querySelector('.dt-image').alt=tr('رسم توضيحي لتوزيع بيت الدوم ومرافقه','Illustrated layout of the Dome House and its facilities');
    root.querySelectorAll('.dt-labels').forEach(function(group){group.setAttribute('aria-label','اختر المرفق لعرض تفاصيله');});
    parts.forEach(function(p){
      var button=root.querySelector('.dt-label[data-part="'+p.id+'"]');
      button.textContent=p[language]; button.setAttribute('aria-pressed',String(p.id===selected));
      var point=root.querySelector('.dt-point[data-part="'+p.id+'"]');
      point.setAttribute('aria-label',p[language]); point.classList.toggle('is-selected',p.id===selected);
      root.querySelector('[data-line="'+p.id+'"]').classList.toggle('is-selected',p.id===selected);
    });
    updateBackLink(); details(); queueLines();
  }
  function queueLines() { cancelAnimationFrame(frame); frame=requestAnimationFrame(drawLines); }
  function drawLines() { FD_TOUR_COMMON.drawLines(root, parts, lineLayout); }
  function remove() {
    if(observer) observer.disconnect();
    cancelAnimationFrame(frame);
    if(root) root.remove();
    root=null; cabin=null;
    document.getElementById('ov').classList.remove('fd-has-dome-tour');
  }
  function mount(next) {
    if(root && cabin && cabin.id===next.id) return;
    remove(); cabin=next; selected='bedroom'; language='ar';
    root=document.createElement('section');root.id='dome-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    var topOrder=['bedroom','bathroom','kitchen'];
    var bottomOrder=['outdoor','tub','pool'];
    root.innerHTML=FD_TOUR_COMMON.markup(parts,topOrder,bottomOrder,'/imgs/dome-tour-15-clarity-v1.png','lazy',false);
    root.querySelector('.dt-image').src='/imgs/dome-tour-'+(cabin.id===12?'16':'15')+'-clarity-v1.png';
    document.getElementById('dome-tour-host').appendChild(root);
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
      else return;
      update();
    });
    root.querySelector('.dt-image').addEventListener('load',queueLines);
    observer=new ResizeObserver(queueLines);observer.observe(root);update();
  }
  function sync() {
    if(document.getElementById('dome-tour-host') && typeof data!=='undefined') {
      mount(data.resort.items.find(function(c){return c.id===(new URLSearchParams(location.search).get('cabin')==='12'?12:1);}));
    }
  }
  sync();
  window.addEventListener('resize',queueLines,{passive:true});
  return {sync:sync};
})();
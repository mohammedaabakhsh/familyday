/* Classic Cottage: approved illustrated tour; shared specifications from resort-data.js. */

var FD_CLASSIC_TOUR = (function () {

  'use strict';

  var root, observer, frame, cabin, selected = 'bedroom', language = 'ar';

  var parts = [
 {id:'kitchen',ar:'ركن المطبخ',en:'Kitchenette',x:0.205,y:0.2},
 {id:'bathroom',ar:'حمام',en:'Bathroom',x:0.355,y:0.211},
 {id:'bedroom',ar:'غرفة النوم الرئيسية',en:'Main bedroom',x:0.437,y:0.216},
 {id:'dining',ar:'طاولة الطعام',en:'Dining table',x:0.204,y:0.282},
 {id:'living',ar:'المنطقة الداخلية',en:'Indoor area',x:0.35,y:0.314},
 {id:'pool',ar:'المسبح',en:'Pool',x:0.755,y:0.346},
 {id:'outdoor',ar:'المنطقة الخارجية',en:'Outdoor area',x:0.808,y:0.716}
 ];

  var lineLayout = {
    sideLayoutMinWidth:900,
    tabletLeft:['living','dining'],
    tabletTop:['kitchen','bathroom','bedroom'],
    sides:{"dining":"left","bedroom":"top","bathroom":"top","kitchen":"top","living":"left","pool":"right","outdoor":"right"},
    mobileGutter:true
  };
  var kitchenIcon=FD_TOUR_COMMON.kitchenIcon;

  function tr(ar,en) { return language === 'ar' ? ar : en; }

  function feature(text) { return FD_TOUR_COMMON.feature(text, language); }

  function updateBackLink() {

    var back=document.querySelector('.tour-back');

    if(!back) return;

    if(!back.dataset.arLabel) back.dataset.arLabel=back.textContent.replace(/[→←]/g,'').trim();

    var ar=back.dataset.arLabel;

    var en={'العودة إلى الأكواخ':'Back to cabins','خريطة الأكواخ':'Cabin map','الكوخ الهرمي':'Pyramid Cottage','الكوخ الكلاسيكي':'Classic Cottage','بيت الدوم':'Dome House'}[ar] || ar;

    back.dir=language==='ar'?'rtl':'ltr';

    back.setAttribute('aria-label',tr(ar,en));

    back.title=tr(ar,en);

    back.innerHTML='<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    document.documentElement.lang=language;

  }

  function details() {

    var cards = [], note = '';

    if (selected === 'pool') {

      note = tr('مسبح خاص للكبار','Private adult pool');

      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);

      if (dimensions) cards.push({label:tr('المقاس','Size'), value:dimensions[1]+' × '+dimensions[2]+tr(' م',' m'), icon:'size', numeric:true});

      cards.push({label:tr('العمق','Depth'),value:String(cabin.pool.depthCm)+tr(' سم',' cm'),icon:'water',numeric:true});

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

      cards=[{value:tr('حمام خاص بغرفة نوم بسرير مزدوج','En-suite bathroom in the bedroom with a double bed'),icon:'shower'}];

    } else {

      cabin.features.outdoor.filter(function(t){return !/بانيو/.test(t);}).forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});

    }

    var activePart=parts.find(function(part){return part.id===selected;});
    FD_TOUR_COMMON.renderDetails(root,cards,note,tr(activePart.ar,activePart.en),false);
  }
  function update() {

    root.lang=language; root.dir=language==='ar'?'rtl':'ltr';

    root.querySelector('.dt-title').textContent=tr('استكشف الكوخ الكلاسيكي من الداخل','Explore the Classic Cottage');

    root.querySelector('.dt-occupancy').textContent=tr('مناسب للعائلات · حتى '+cabin.guests+' ضيوف','Family friendly · Up to '+cabin.guests+' guests');

    root.querySelector('.dt-image').alt=tr('رسم توضيحي لتوزيع الكوخ الكلاسيكي ومرافقه','Illustrated layout of the Classic Cottage and its facilities');

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

    root=document.createElement('section');root.id='classic-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');

    var topOrder=['bedroom','living','bathroom','kitchen','dining'];
    var bottomOrder=['pool','outdoor'];
    root.innerHTML=FD_TOUR_COMMON.markup(parts,topOrder,bottomOrder,'/imgs/classic-tour-18-clarity-v1.png','eager',true);
    document.getElementById('classic-tour-host').appendChild(root);

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

    if(document.getElementById('classic-tour-host') && typeof data!=='undefined') {

      mount(data.resort.items.find(function(c){return c.id===3;}));

    }

  }

  sync();

  window.addEventListener('resize',queueLines,{passive:true});

  return {sync:sync};

})();
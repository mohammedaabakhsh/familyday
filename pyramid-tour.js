/* Dome 1: a photo-informed illustrated tour. Specifications come from resort-data.js. */
var FD_PYRAMID_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'bedroom';
  var parts = [
    {id:'bedroom', ar:'غرفة النوم الرئيسية', x:.553, y:.337},
    {id:'bathroom', ar:'حمام', x:.544, y:.230},
    {id:'living', ar:'صالة داخلية', x:.334, y:.356},
    {id:'kitchen', ar:'ركن المطبخ', x:.411, y:.235},
    {id:'dining', ar:'طاولة الطعام', x:.408, y:.290},
    {id:'tub', ar:'البانيو الخارجي', x:.664, y:.337},
    {id:'pool', ar:'المسبح', x:.814, y:.684},
    {id:'outdoor', ar:'المنطقة الخارجية', x:.750, y:.523}
  ];
  var lineLayout = {
    sideLayoutMinWidth:900,
    tabletLeft:['living','dining','outdoor'],
    tabletTop:[],
    sides:{"dining":"left","kitchen":"top","bathroom":"top","bedroom":"top","living":"left","tub":"right","outdoor":"right","pool":"right"},
    mobileGutter:true
  };
  var kitchenIcon=FD_TOUR_COMMON.kitchenIcon;

  function updateBackLink() {
    var back=document.querySelector('.tour-back');
    if(!back) return;
    if(!back.dataset.arLabel) back.dataset.arLabel=back.textContent.replace(/[→←]/g,'').trim();
    var ar=back.dataset.arLabel;

    back.dir='rtl';
    back.setAttribute('aria-label',ar);
    back.title=ar;
    back.innerHTML='<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.documentElement.lang='ar';
  }

  function details() {

    var cards = [], note = '';
    if (selected === 'pool') {
      note = '';
      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);
      if (dimensions) cards.push({label:'المقاس', value:dimensions[1]+' × '+dimensions[2]+' م', icon:'size', numeric:true});
      cards.push({label:'العمق',value:String(cabin.pool.depthCm)+' سم',icon:'water',numeric:true});
      if (/جاكوزي/.test(cabin.pool.label)) cards.push({value:'جاكوزي داخل المسبح',icon:'tub'});
      cabin.pool.facilities.filter(function(t){return t!=='دش خارجي';}).forEach(function(t){cards.push({value:t,icon:'chair'});});
    } else if (selected === 'kitchen') {
      cabin.features.kitchen.forEach(function(t){cards.push({value:t,icon:kitchenIcon(t)});});

    } else if (selected === 'dining') {
      cards.push({value:'طاولة الطعام',icon:'dining'});
    } else if (selected === 'living') {
      cards=[{value:'تلفزيون ذكي',icon:'tv'},{value:'سماعات داخلية (ساوند بار)',icon:'speaker'},{value:'واي فاي مجاني',icon:'wifi'}];
    } else if (selected === 'bedroom') {
      cards=[{value:'سرير مزدوج',icon:'bed'}];
    } else if (selected === 'bathroom') {
      cards=[{value:'حمام خاص داخل غرفة النوم الرئيسية',icon:'shower'}];
    } else if (selected === 'tub') {
      cards=[{value:'بانيو خارجي بخصوصية كاملة',icon:'tub'}];
    } else {
      cabin.features.outdoor.filter(function(t){return !/بانيو/.test(t);}).forEach(function(t){cards.push({value:t==='الجلسة الخارجية'?'جلسات خارجية':t,icon:'outdoor'});});
      if(cabin.pool.facilities.indexOf('دش خارجي')!==-1) cards.push({value:'دش خارجي',icon:'shower'});
    }
    var activePart=parts.find(function(part){return part.id===selected;});
    FD_TOUR_COMMON.renderDetails(root,cards,note,activePart.ar,true);
  }
  function update() {
    root.lang='ar'; root.dir='rtl';
    root.querySelector('.dt-title').textContent='استكشف الكوخ الهرمي';
    root.querySelector('.dt-occupancy').textContent='مثالي للأزواج · حتى ضيفين';
    root.querySelector('.dt-image').alt='رسم توضيحي لتوزيع الكوخ الهرمي ومرافقه';
    root.querySelectorAll('.dt-labels').forEach(function(group){group.setAttribute('aria-label','اختر المرفق لعرض تفاصيله');});

    parts.forEach(function(p){
      var button=root.querySelector('.dt-label[data-part="'+p.id+'"]');
      button.textContent=p.ar; button.setAttribute('aria-pressed',String(p.id===selected));
      var point=root.querySelector('.dt-point[data-part="'+p.id+'"]');
      point.setAttribute('aria-label',p.ar); point.classList.toggle('is-selected',p.id===selected);
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
    remove(); cabin=next; selected='bedroom';
    root=document.createElement('section');root.id='pyramid-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    var topOrder=['bedroom','living','bathroom','kitchen','dining'];
    var bottomOrder=['pool','tub','outdoor'];
    root.innerHTML=FD_TOUR_COMMON.markup(parts,topOrder,bottomOrder,'/imgs/pyramid-tour-17-clarity-v1.png','lazy',false);
    document.getElementById('pyramid-tour-host').appendChild(root);
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
    if(document.getElementById('pyramid-tour-host') && typeof data!=='undefined') {
      mount(data.resort.items.find(function(c){return c.id===2;}));
    }
  }
  sync();
  window.addEventListener('resize',queueLines,{passive:true});
  return {sync:sync};
})();

/* Greek House: approved illustrated tour; shared specifications from resort-data.js. */
var FD_GREEK_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'bedroom';
  var parts = [
    {id:'bedroom', ar:'غرفة النوم الرئيسية', x:0.255, y:0.29},
    {id:'bathroom', ar:'حمامات', x:0.358, y:0.236},
    {id:'twin', ar:'غرفة النوم الثانية', x:0.747, y:0.296},
    {id:'living', ar:'المنطقة الداخلية', x:0.575, y:0.392},
    {id:'kitchen', ar:'ركن المطبخ', x:0.438, y:0.297},
    {id:'dining', ar:'طاولة الطعام', x:0.488, y:0.351},
    {id:'pool', ar:'المسبح', x:0.255, y:0.606},
    {id:'outdoor', ar:'المنطقة الخارجية', x:0.735, y:0.632}
  ];
  var lineLayout = {
    sideLayoutMinWidth:900,
    tabletLeft:['kitchen','dining','pool'],
    tabletTop:['bedroom','bathroom','twin'],
    sides:{"dining":"left","bedroom":"left","bathroom":"top","twin":"top","kitchen":"top","living":"right","pool":"left","outdoor":"right"},
    mobileGutter:true
  };
  var kitchenIcon=FD_TOUR_COMMON.kitchenIcon;

  function feature(text) {
    if (text === 'جلسة خارجية' || text === 'الجلسة الخارجية') return 'جلسات خارجية';
    return text;
  }
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
      note = 'مسبح خاص للكبار';
      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);
      if (dimensions) cards.push({label:'المقاس', value:dimensions[1]+' × '+dimensions[2]+' م', icon:'size', numeric:true});
      cards.push({label:'العمق',value:String(cabin.pool.depthCm)+' سم',icon:'water',numeric:true});
      if (/جاكوزي/.test(cabin.pool.label)) cards.push({value:'جاكوزي داخل المسبح',icon:'tub'});
      cabin.pool.facilities.forEach(function(t){cards.push({value:feature(t),icon:t==='دش خارجي'?'shower':'chair'});});
    } else if (selected === 'kitchen') {
      cabin.features.kitchen.forEach(function(t){cards.push({value:feature(t),icon:kitchenIcon(t)});});
      if(cabin.minibar) note='الميني بار: مشروبات وسناكس برسوم إضافية.';
    } else if (selected === 'dining') {
      cards.push({value:'طاولة الطعام',icon:'dining'});
    } else if (selected === 'living') {
      cards=[{value:'صالة داخلية',icon:'sofa'},{value:'تلفزيون ذكي',icon:'tv'},{value:'سماعات داخلية (ساوند بار)',icon:'speaker'},{value:'واي فاي مجاني',icon:'wifi'}];
    } else if (selected === 'bedroom') {
      cards=[{label:'السرير',value:'سرير مزدوج',icon:'bed'}];
    } else if (selected === 'bathroom') {
      cards=[{value:'حمام خاص بغرفة نوم بسرير مزدوج',icon:'shower'},{value:'حمام مشترك',icon:'shower'}];
    } else if (selected === 'twin') {
      cards=[{value:'سريران مفردان',icon:'bed'}];

    } else {
      cabin.features.outdoor.filter(function(t){return !/بانيو/.test(t);}).forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});
    }
    var activePart=parts.find(function(part){return part.id===selected;});
    FD_TOUR_COMMON.renderDetails(root,cards,note,activePart.ar,false);
  }
  function update() {
    root.lang='ar'; root.dir='rtl';
    root.querySelector('.dt-title').textContent='استكشف البيت اليوناني';
    root.querySelector('.dt-occupancy').textContent=('مناسب للعائلات · حتى '+cabin.guests+' ضيوف');
    root.querySelector('.dt-image').alt='رسم توضيحي لتوزيع البيت اليوناني ومرافقه';
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
    root=document.createElement('section');root.id='greek-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    var topOrder=['bedroom','twin','living','bathroom','kitchen','dining'];
    var bottomOrder=['outdoor','pool'];
    root.innerHTML=FD_TOUR_COMMON.markup(parts,topOrder,bottomOrder,'/imgs/greek-tour-10-clarity-v1.png','lazy',false);
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

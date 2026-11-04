/* Royal Cottage: approved interactive tour; shared specifications from resort-data.js. */
var FD_ROYAL_TOUR = (function () {
  'use strict';
  var root, observer, frame, cabin, selected = 'bedroom';

  var parts = [
 {id:'bedroom', ar:'غرفة النوم الرئيسية', x:0.292, y:0.39},
 {id:'bathroom', ar:'حمامات', x:0.333, y:0.307},
 {id:'twin', ar:'غرفة النوم الثانية', x:0.285, y:0.178},
 {id:'kitchen', ar:'ركن المطبخ', x:0.383, y:0.16},
 {id:'dining', ar:'طاولة الطعام', x:0.5, y:0.23},
 {id:'living', ar:'صالة داخلية', x:0.53, y:0.397},
 {id:'pool', ar:'المسبح', x:0.792, y:0.355},
 {id:'outdoor', ar:'المنطقة الخارجية', x:0.792, y:0.725}
 ];

  var lineLayout = {
    sideLayoutMinWidth:600,
    tabletLeft:['living','pool'],
    tabletTop:['kitchen','dining','twin'],
    sides:{"bedroom":"left","bathroom":"left","twin":"top","kitchen":"top","dining":"right","living":"right","pool":"right","outdoor":"left"},
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
      note = '';
      var dimensions = cabin.pool.label.match(/(\d+)\s*×\s*(\d+)/);
      if (dimensions) cards.push({label:'المقاس', value:dimensions[1]+' × '+dimensions[2]+' م', icon:'size', numeric:true});
      cards.push({label:'العمق',value:String(cabin.pool.depthCm)+' سم',icon:'water',numeric:true});
      if (/جاكوزي/.test(cabin.pool.label)) cards.push({value:'جاكوزي داخل المسبح',icon:'tub'});
      cabin.pool.facilities.filter(function(t){return t!=='دش خارجي';}).forEach(function(t){cards.push({value:feature(t),icon:'chair'});});
    } else if (selected === 'kitchen') {
      cabin.features.kitchen.forEach(function(t){cards.push({value:feature(t),icon:kitchenIcon(t)});});

    } else if (selected === 'dining') {
      cards.push({value:'طاولة الطعام',icon:'dining'});
    } else if (selected === 'living') {
      cards=[{value:'تلفزيون ذكي',icon:'tv'},{value:'سماعات داخلية (ساوند بار)',icon:'speaker'},{value:'واي فاي مجاني',icon:'wifi'}];
    } else if (selected === 'bedroom') {
      cards=[{value:'سرير مزدوج',icon:'bed'}];
    } else if (selected === 'bathroom') {
      cards=[{value:'حمام خاص داخل غرفة النوم الرئيسية',icon:'shower'},{value:'حمام مشترك',icon:'shower'}];
    } else if (selected === 'tub') {
      cards=[{value:'بانيو مع جاكوزي بغرفة النوم',icon:'tub'}];
    } else if (selected === 'twin') {
      cards=[{value:'سريران مفردان',icon:'bed'}];
    } else {
      cabin.features.outdoor.filter(function(t){return !/بانيو/.test(t);}).forEach(function(t){cards.push({value:feature(t),icon:'outdoor'});});
      if(cabin.pool.facilities.indexOf('دش خارجي')!==-1) cards.push({value:'دش خارجي',icon:'shower'});
    }
    var activePart=parts.find(function(part){return part.id===selected;});
    FD_TOUR_COMMON.renderDetails(root,cards,note,activePart.ar,false);
  }

  function update() {
    root.lang='ar'; root.dir='rtl';
    root.querySelector('.dt-title').textContent='استكشف كوخ رويال';
    root.querySelector('.dt-occupancy').textContent=('مناسب للعائلات · حتى '+cabin.guests+' ضيفًا');
    root.querySelector('.dt-image').alt='رسم توضيحي لتوزيع كوخ رويال ومرافقه';
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
    root=document.createElement('section');root.id='royal-tour';root.className='dt-tour';root.setAttribute('aria-labelledby','dt-title');
    var topOrder=['bedroom','twin','living','bathroom','kitchen','dining'];
    var bottomOrder=['pool','outdoor'];
    root.innerHTML=FD_TOUR_COMMON.markup(parts,topOrder,bottomOrder,'/imgs/royal-tour-19-clarity-v1.png','eager',true);
    document.getElementById('royal-tour-host').appendChild(root);
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
    if(document.getElementById('royal-tour-host') && typeof data!=='undefined') {
      mount(data.resort.items.find(function(c){return c.id===9;}));
    }
  }
  sync();
  window.addEventListener('resize',queueLines,{passive:true});
  return {sync:sync};
})();

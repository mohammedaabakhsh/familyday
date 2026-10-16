/* Owner-approved chalet illustration. Room details open in place, in one selection. */
(function () {
  'use strict';
  var rooms = [
    {key:'upper',name:'غرفة النوم العلوية',floor:'الدور العلوي',x:35,y:14,shape:'24,8 42,8 42,18 23,18',label:[3,10,17,3],photos:['upper','upper-bath'],facts:['سرير مزدوج','حمام خاص','تلفزيون'],text:'غرفة النوم في الدور العلوي، يصل إليها السلم الداخلي. منطقة المغسلة مفتوحة على الغرفة، مع كابينة دش زجاجية ودورة مياه بفاصل زجاجي.'},
    {key:'ground',name:'غرفة النوم الأرضية',floor:'الدور الأرضي',x:28,y:24,shape:'23,20 34,20 34,29 22,29',label:[2,19,18,4],photos:['ground'],facts:['سريران مفردان'],text:'غرفة نوم في الدور الأرضي، مدخلها من داخل غرفة الألعاب بجانب الواجهة المطلة على المسبح.'},
    {key:'play',name:'غرفة الألعاب',floor:'الدور الأرضي',x:38,y:25,shape:'34,20 42,20 42,30 34,30',label:[7,25,13,4],photos:['play'],facts:['ألعاب أطفال','واجهة زجاجية على المسبح'],text:'غرفة مجهزة بألعاب الأطفال عند نهاية المسبح، وبجوارها السلم الداخلي المؤدي للدور العلوي.'},
    {key:'living',name:'الصالة الداخلية',floor:'الدور الأرضي',x:68,y:46,shape:'57,36 76,36 80,57 58,57',photos:['living'],facts:['مجلس يتسع لـ15 شخصًا','تلفزيون','باب إلى ممر المسبح'],text:'جلسة داخلية بواجهة زجاجية تطل على المسبح. خلف الجلسة منطقة الطعام والمطبخ، مع فتحة واسعة بإطار جبسي تفصل المساحتين.'},
    {key:'dining',name:'الطعام والمطبخ',floor:'الدور الأرضي',x:65,y:31,shape:'57,15 70,15 74,36 57,36',label:[80,28,20,6],photos:['dining','kitchen'],facts:['طاولة طعام','ثلاجة وفرن وميكروويف','موقد كهربائي وغاز','غلاية وأدوات مطبخ أساسية'],text:'طاولة الطعام خلف كنبة الصالة وبجوار المطبخ المجهز، مع ممر جانبي يصل إلى السلم وغرفة الألعاب.'},
    {key:'majlis',name:'المجلس المستقل',floor:'المنطقة الخارجية',x:72,y:65,shape:'61,58 80,58 83,72 62,72',label:[82,61,18,6],photos:['majlis'],facts:['يتسع لـ10 أشخاص','مدخل خاص','حمام'],text:'مجلس مستقل في مقدمة الشاليه، بجلسة ركنية وتلفزيون. له مدخل خاص من الشارع وباب داخلي يفتح على ساحة الشاليه.'},
    {key:'pool',name:'مسبح الأطفال',floor:'المنطقة الخارجية',x:39,y:51,shape:'28,31 49,35 50,66 24,66',label:[2,46,17,5],photos:['pool'],facts:['عمق 60 سم','ألعاب مائية وزحليقة مزدوجة','حاجز زجاجي'],text:'مسبح للأطفال بجوار الصالة، مع منصات ألعاب مائية وسلالم وزحليقة. يُسمح للأطفال باستخدامه تحت إشراف ذويهم.'},
    {key:'shower',name:'المروش والجلسة الخارجية',floor:'المنطقة الخارجية',x:29,y:68,shape:'20,64 25,64 25,66 48,66 48,72 20,72',photos:['shower'],facts:['مروش خارجي','كرسي استرخاء ومظلة'],text:'عند المدخل الرئيسي توجد مساحة للاستراحة بجوار المسبح، ومروش خارجي بحاجز زجاجي جانبي.'},
    {key:'stairs',name:'السلم والحمام الأرضي',floor:'الدور الأرضي',x:49,y:25,shape:'43,15 56,15 56,30 43,30',photos:['stairs'],facts:['سلم داخلي للدور العلوي','حمام ومغاسل'],text:'سلم داخلي بدرجات سوداء وحواجز زجاجية، بجوار غرفة الألعاب والمطبخ. الحمام الأرضي والمغاسل بجانب السلم.'}
  ];
  var dialog, viewport, plane, panel, selected, opener, previousOverflow;
  var view={w:0,h:0,size:0,scale:1,x:0,y:0}, pointers=new Map(), gesture;
  var photoIndex=0, markers=[], polygons=[], choices=[];
  var imagePath='imgs/chalet-map-v8.webp';
  function photoPath(key){return 'imgs/chalet-map-'+key+'.webp';}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function clear(){
    selected=null;
    markers.concat(choices).forEach(function(b){b.setAttribute('aria-pressed','false');});
    polygons.forEach(function(p){p.classList.remove('is-selected');});
    panel.innerHTML='<div class="cm-empty"><span aria-hidden="true">⌖</span><h3>تعرّف على الشاليه</h3><p>اختر الغرفة أو المرفق من الرسم أو من الأسماء بالأعلى، وستظهر صورته ومعلوماته هنا.</p></div>';
  }
  function renderPhoto(){
    if(!selected || !selected.photos.length)return;
    var img=panel.querySelector('.cm-photo img');
    var status=panel.querySelector('.cm-photo-status');
    img.hidden=true;
    status.textContent='جارٍ تحميل الصورة…';
    img.onload=function(){img.hidden=false;status.textContent='';};
    img.onerror=function(){img.hidden=true;status.textContent='تعذّر تحميل الصورة. معلومات المكان متاحة أدناه.';};
    img.alt=selected.name+' — '+(photoIndex+1);
    img.src=photoPath(selected.photos[photoIndex]);
    var count=panel.querySelector('.cm-photo-count');
    if(count)count.textContent=(photoIndex+1)+' / '+selected.photos.length;
  }
  function select(room){
    selected=room; photoIndex=0;
    var index=rooms.indexOf(room);
    markers.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===index));});
    choices.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===index));});
    polygons.forEach(function(p,i){p.classList.toggle('is-selected',i===index);});
    panel.innerHTML='<div class="cm-detail-heading"><div><span class="cm-floor">'+room.floor+'</span><h3>'+room.name+'</h3></div><button type="button" class="cm-icon cm-clear" aria-label="إلغاء اختيار المكان">×</button></div>'
      +(room.photos.length?'<div class="cm-photo"><img width="960" height="640" alt="" hidden><p class="cm-photo-status" role="status"></p></div>':'')
      +(room.photos.length>1?'<div class="cm-photo-nav"><button type="button" class="cm-photo-prev" aria-label="الصورة السابقة">→</button><span class="cm-photo-count" aria-live="polite"></span><button type="button" class="cm-photo-next" aria-label="الصورة التالية">←</button></div>':'')
      +'<ul class="cm-facts">'+room.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul><p class="cm-description">'+room.text+'</p>';
    panel.scrollTop=0;
    panel.querySelector('.cm-clear').onclick=function(){clear();markers[index].focus({preventScroll:true});};
    if(room.photos.length>1){
      panel.querySelector('.cm-photo-prev').onclick=function(){photoIndex=(photoIndex+room.photos.length-1)%room.photos.length;renderPhoto();};
      panel.querySelector('.cm-photo-next').onclick=function(){photoIndex=(photoIndex+1)%room.photos.length;renderPhoto();};
    }
    renderPhoto();
    dialog.querySelector('.cm-announcement').textContent='تم عرض معلومات '+room.name;
  }
  function renderView(){
    var size=view.size*view.scale;
    view.x=size<=view.w?(view.w-size)/2:clamp(view.x,view.w-size,0);
    view.y=size<=view.h?(view.h-size)/2:clamp(view.y,view.h-size,0);
    plane.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';
    plane.style.setProperty('--cm-inverse',1/view.scale);
    dialog.querySelector('.cm-zoom-in').disabled=view.scale>=3;
    dialog.querySelector('.cm-zoom-out').disabled=view.scale<=1;
  }
  function measure(reset){
    if(!dialog.open)return;
    var cx=view.size?(view.w/2-view.x)/(view.size*view.scale):.5;
    var cy=view.size?(view.h/2-view.y)/(view.size*view.scale):.5;
    view.w=viewport.clientWidth;view.h=viewport.clientHeight;view.size=Math.min(view.w,view.h);
    if(reset){view.scale=1;cx=cy=.5;}
    view.x=view.w/2-cx*view.size*view.scale;view.y=view.h/2-cy*view.size*view.scale;
    plane.style.width=plane.style.height=view.size+'px';renderView();
  }
  function zoom(scale,x,y){var next=clamp(scale,1,3),ratio=next/view.scale;view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.scale=next;renderView();}
  function point(e){var b=viewport.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top};}
  function resetGesture(){pointers.clear();gesture=null;}
  function pinch(){var p=Array.from(pointers.values());return{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};}
  function down(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    var p=point(e);pointers.set(e.pointerId,p);viewport.setPointerCapture(e.pointerId);
    if(pointers.size===1)gesture={start:p,last:p,moved:false,key:e.target.closest('[data-room]')?.dataset.room};
    else {gesture.moved=true;gesture.pinch=pinch();}
  }
  function move(e){
    if(!gesture||!pointers.has(e.pointerId))return;
    var p=point(e);pointers.set(e.pointerId,p);
    if(pointers.size>1){var n=pinch(),old=gesture.pinch;if(old){var next=clamp(view.scale*n.d/Math.max(old.d,1),1,3),ratio=next/view.scale;view.x=n.x-(old.x-view.x)*ratio;view.y=n.y-(old.y-view.y)*ratio;view.scale=next;renderView();}gesture.pinch=n;gesture.moved=true;}
    else{if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>6)gesture.moved=true;if(gesture.moved){view.x+=p.x-gesture.last.x;view.y+=p.y-gesture.last.y;renderView();}gesture.last=p;}
  }
  function up(e){
    if(!gesture||!pointers.has(e.pointerId))return;
    var tap=!gesture.moved&&e.type==='pointerup',key=gesture.key;
    pointers.delete(e.pointerId);
    if(pointers.size){gesture.start=gesture.last=Array.from(pointers.values())[0];gesture.pinch=null;gesture.moved=true;}
    else{resetGesture();if(tap&&key)select(rooms.find(function(r){return r.key===key;}));}
  }
  function dismiss(){document.dispatchEvent(new CustomEvent('fd-chalet-map-dismiss'));}
  function create(){
    dialog=document.createElement('dialog');dialog.id='fd-chalet-map';dialog.className='cm-dialog';dialog.setAttribute('aria-labelledby','cm-title');
    dialog.innerHTML='<header class="cm-header"><div><h2 id="cm-title">خريطة الشاليه</h2><p>اختر المكان لتظهر صورته ومعلوماته مباشرة</p></div><button type="button" class="cm-icon cm-close" aria-label="إغلاق خريطة الشاليه" autofocus>×</button></header>'
      +'<nav class="cm-choices" aria-label="غرف الشاليه ومرافقه"></nav><div class="cm-workspace"><div class="cm-map-side"><div class="cm-viewport" tabindex="0" aria-label="خريطة تفاعلية، استخدم أزرار التكبير أو إصبعين للتكبير والأسهم للتحريك"><div class="cm-plane"><img class="cm-image" width="1254" height="1254" alt="تصوّر توضيحي لتوزيع الشاليه من دورين والمسبح والمجلس المستقل" draggable="false"><svg class="cm-regions" viewBox="0 0 100 100" aria-hidden="true"></svg></div><div class="cm-error" hidden><p>تعذّر تحميل الرسم. يمكنك اختيار أي مكان من الأسماء بالأعلى.</p><button type="button" class="cm-retry">إعادة المحاولة</button></div></div><div class="cm-tools"><span>تصوّر توضيحي للمكان</span><div><button type="button" class="cm-zoom-in" aria-label="تكبير الخريطة">+</button><button type="button" class="cm-zoom-out" aria-label="تصغير الخريطة">−</button><button type="button" class="cm-fit">إظهار الكل</button></div></div></div><aside id="cm-details" class="cm-details" aria-label="معلومات المكان المختار"></aside></div><p class="cm-announcement" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    viewport=dialog.querySelector('.cm-viewport');plane=dialog.querySelector('.cm-plane');panel=dialog.querySelector('.cm-details');
    rooms.forEach(function(room,i){
      var polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon');polygon.setAttribute('points',room.shape);polygon.dataset.room=room.key;polygon.setAttribute('vector-effect','non-scaling-stroke');dialog.querySelector('svg').appendChild(polygon);polygons.push(polygon);
      if(room.label){var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');['x','y','width','height'].forEach(function(k,n){rect.setAttribute(k,room.label[n]);});rect.dataset.room=room.key;dialog.querySelector('svg').appendChild(rect);}
      var b=document.createElement('button');b.type='button';b.className='cm-marker';b.dataset.room=room.key;b.style.left=room.x+'%';b.style.top=room.y+'%';b.textContent=i+1;b.setAttribute('aria-label',room.name);b.setAttribute('aria-controls','cm-details');b.title=room.name;b.onclick=function(e){if(e.detail===0)select(room);};plane.appendChild(b);markers.push(b);
      var choice=document.createElement('button');choice.type='button';choice.textContent=room.name;choice.dataset.room=room.key;choice.setAttribute('aria-controls','cm-details');choice.onclick=function(){select(room);};dialog.querySelector('.cm-choices').appendChild(choice);choices.push(choice);
    });
    viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointermove',move);viewport.addEventListener('pointerup',up);viewport.addEventListener('pointercancel',up);
    viewport.addEventListener('lostpointercapture',function(e){if(pointers.has(e.pointerId))resetGesture();});
    viewport.addEventListener('keydown',function(e){
      if(e.target!==viewport)return;
      if(e.key==='+'||e.key==='=')zoom(view.scale+.5,view.w/2,view.h/2);
      else if(e.key==='-')zoom(view.scale-.5,view.w/2,view.h/2);
      else if(e.key==='Home')measure(true);
      else if(/^Arrow/.test(e.key)){view.x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;view.y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;renderView();}else return;e.preventDefault();
    });
    dialog.querySelector('.cm-close').onclick=dismiss;
    dialog.addEventListener('cancel',function(e){e.preventDefault();dismiss();});
    dialog.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}});
    dialog.querySelector('.cm-zoom-in').onclick=function(){zoom(view.scale+.5,view.w/2,view.h/2);};
    dialog.querySelector('.cm-zoom-out').onclick=function(){zoom(view.scale-.5,view.w/2,view.h/2);};
    dialog.querySelector('.cm-fit').onclick=function(){resetGesture();measure(true);};
    var img=dialog.querySelector('.cm-image'),error=dialog.querySelector('.cm-error');
    img.onload=function(){error.hidden=true;plane.hidden=false;viewport.setAttribute('aria-busy','false');};
    img.onerror=function(){error.hidden=false;plane.hidden=true;viewport.setAttribute('aria-busy','false');};
    function load(){error.hidden=true;viewport.setAttribute('aria-busy','true');img.src=imagePath;}
    dialog.querySelector('.cm-retry').onclick=load;
    new ResizeObserver(function(){measure(false);}).observe(viewport);
    window.addEventListener('blur',resetGesture);load();
  }
  window.FD_CHALET_MAP={
    show:function(){if(!dialog)create();if(dialog.open)return;opener=document.activeElement;previousOverflow=document.body.style.overflow;clear();dialog.showModal();document.body.style.overflow='hidden';measure(true);},
    hide:function(){if(!dialog||!dialog.open)return;dialog.close();resetGesture();document.body.style.overflow=previousOverflow;if(opener&&opener.isConnected)opener.focus({preventScroll:true});}
  };
  var grid=document.querySelector('#landing3 .rh-grid');
  if(grid){var launcher=document.createElement('div');launcher.className='fd-chalet-map-launcher';launcher.innerHTML='<button type="button" class="fd-chalet-map-open" aria-haspopup="dialog" aria-controls="fd-chalet-map">خريطة الشاليه</button>';grid.before(launcher);}
  document.addEventListener('click',function(e){if(e.target.closest('.fd-chalet-map-open'))document.dispatchEvent(new CustomEvent('fd-chalet-map-request'));});
})();

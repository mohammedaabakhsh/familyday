/* Owner-approved chalet illustration. Room details open in place, in one selection. */
(function () {
  'use strict';
  var rooms = [
  {
    "key": "upperBath",
    "name": "حمام داخلي بغرفة النوم",
    "floor": "الدور العلوي",
    "x": 27,
    "y": 13,
    "shape": "23,8 30,8 30,18 23,18",
    "label": [
      "top",
      24,
      6
    ],
    "facts": [
      "مغسلة",
      "دش زجاجي",
      "دورة مياه"
    ],
    "text": ""
  },
  {
    "key": "upper",
    "name": "غرفة النوم العلوية",
    "floor": "الدور العلوي",
    "x": 36,
    "y": 13,
    "shape": "30,8 42,8 42,18 30,18",
    "label": [
      "top",
      50,
      6
    ],
    "facts": [
      "سرير مزدوج",
      "تلفزيون",
      "حمام خاص"
    ],
    "text": ""
  },
  {
    "key": "stairs",
    "name": "السلم",
    "floor": "بين الدورين",
    "x": 48,
    "y": 22,
    "shape": "44,15 51,15 51,29 44,29",
    "label": [
      "top",
      76,
      6
    ],
    "facts": [],
    "text": "يربط الدور الأرضي بالدور العلوي"
  },
  {
    "key": "ground",
    "name": "غرفة النوم الأرضية",
    "floor": "الدور الأرضي",
    "x": 28,
    "y": 24,
    "shape": "23,20 34,20 34,29 22,29",
    "label": [
      "left",
      9,
      35
    ],
    "facts": [
      "سريران مفردان"
    ],
    "text": ""
  },
  {
    "key": "play",
    "name": "غرفة الأطفال",
    "floor": "الدور الأرضي",
    "x": 38,
    "y": 25,
    "shape": "34,20 42,20 42,30 34,30",
    "label": [
      "left",
      9,
      55
    ],
    "facts": [
      "مجهزة بألعاب للأطفال",
      "تطل على المسبح"
    ],
    "text": ""
  },
  {
    "key": "pool",
    "name": "مسبح للأطفال",
    "floor": "المنطقة الخارجية",
    "x": 42,
    "y": 62,
    "shape": "28,31 49,35 50,66 24,66",
    "label": [
      "bottom",
      50,
      101
    ],
    "facts": [
      "عمق 60 سم",
      "ألعاب مائية وزحليقة مزدوجة",
      "حاجز زجاجي"
    ],
    "text": "يُستخدم تحت إشراف الأهل."
  },
  {
    "key": "groundBath",
    "name": "حمام",
    "floor": "الدور الأرضي",
    "x": 54,
    "y": 24,
    "shape": "51,19 56,19 56,29 51,29",
    "label": [
      "right",
      91,
      33
    ],
    "facts": [
      "دورة مياه",
      "دش",
      "مغاسل"
    ],
    "text": ""
  },
  {
    "key": "kitchen",
    "name": "المطبخ وطاولة الطعام",
    "floor": "الدور الأرضي",
    "x": 65,
    "y": 24,
    "shape": "57,15 70,15 72,28 57,28",
    "label": [
      "right",
      91,
      53
    ],
    "facts": [
      "طاولة طعام",
      "ثلاجة",
      "فرن",
      "ميكروويف",
      "موقد غاز وكهرباء",
      "غلاية",
      "أدوات مطبخ أساسية"
    ],
    "text": "",
    "extraShapes": [
      "58,29 73,29 74,36 58,36"
    ]
  },
  {
    "key": "living",
    "name": "الصالة الداخلية",
    "floor": "الدور الأرضي",
    "x": 69,
    "y": 46,
    "shape": "57,37 76,37 80,57 58,57",
    "label": [
      "right",
      91,
      75
    ],
    "facts": [
      "تتسع لـ15 شخصًا",
      "تلفزيون",
      "تطل على المسبح",
      "باب مباشر إلى ساحة المسبح"
    ],
    "text": ""
  },
  {
    "key": "shower",
    "name": "كرسي التشميس والمروش",
    "floor": "المنطقة الخارجية",
    "x": 22,
    "y": 68,
    "shape": "20,64 25,64 25,72 20,72",
    "label": [
      "bottom",
      18,
      101
    ],
    "facts": [
      "كرسي تشميس",
      "مظلة",
      "دش خارجي"
    ],
    "text": "",
    "extraShapes": [
      "27,66 40,66 40,72 27,72"
    ]
  },
  {
    "key": "majlis",
    "name": "المجلس المستقل مع حمام",
    "floor": "المنطقة الخارجية",
    "x": 70,
    "y": 64,
    "shape": "61,58 80,58 83,72 62,72",
    "label": [
      "bottom",
      82,
      101
    ],
    "facts": [
      "يتسع لـ10 أشخاص",
      "تلفزيون",
      "مدخل خاص",
      "حمام خاص"
    ],
    "text": ""
  }
];
  var dialog, viewport, plane, panel, selected, opener, previousOverflow;
  var view={w:0,h:0,size:0,scale:1,x:0,y:0}, pointers=new Map(), gesture;
  var markers=[], polygons=[], leaders=[];
  var imagePath='imgs/chalet-map-clean-v2.webp';
  var labelLanguage='ar';
  var roomNamesEn={
    "upperBath": "En-suite Bathroom",
    "upper": "Upstairs Bedroom",
    "stairs": "Stairs",
    "ground": "Ground Floor Bedroom",
    "play": "Kids' Playroom",
    "pool": "Kids' Pool",
    "groundBath": "Bathroom",
    "kitchen": "Kitchen & Dining Table",
    "living": "Indoor Lounge",
    "shower": "Sun Lounger & Shower",
    "majlis": "Separate Majlis & Bathroom"
  };
  var roomDetailsEn={
    "upperBath": {
      "facts": [
        "Washbasin",
        "Glass-enclosed shower",
        "Toilet"
      ],
      "text": ""
    },
    "upper": {
      "facts": [
        "Double bed",
        "TV",
        "Private bathroom"
      ],
      "text": ""
    },
    "stairs": {
      "facts": [],
      "text": "Connects the ground and upper floors."
    },
    "ground": {
      "facts": [
        "Two single beds"
      ],
      "text": ""
    },
    "play": {
      "facts": [
        "Children's play equipment",
        "Overlooks the pool"
      ],
      "text": ""
    },
    "pool": {
      "facts": [
        "Depth: 60 cm",
        "Water play features and a double slide",
        "Glass barrier"
      ],
      "text": "Parental supervision required."
    },
    "groundBath": {
      "facts": [
        "Toilet",
        "Shower",
        "Washbasins"
      ],
      "text": ""
    },
    "kitchen": {
      "facts": [
        "Dining table",
        "Refrigerator",
        "Oven",
        "Microwave",
        "Gas and electric hob",
        "Kettle",
        "Basic kitchen utensils"
      ],
      "text": ""
    },
    "living": {
      "facts": [
        "Up to 15 guests",
        "TV",
        "Overlooks the pool",
        "Door opens onto the pool area"
      ],
      "text": ""
    },
    "shower": {
      "facts": [
        "Sun lounger",
        "Sun umbrella",
        "Outdoor shower"
      ],
      "text": ""
    },
    "majlis": {
      "facts": [
        "Up to 10 guests",
        "TV",
        "Private entrance",
        "Private bathroom"
      ],
      "text": ""
    }
  };
  var floorNamesEn={
    "الدور العلوي": "Upper Floor",
    "الدور الأرضي": "Ground Floor",
    "بين الدورين": "Between Floors",
    "المنطقة الخارجية": "Outdoor Area"
  };
  var tourCopy={
    "ar": {
      "title": "جولة داخل الشاليه",
      "close": "إغلاق الجولة",
      "subtitle": "تعرف على الغرف والمرافق",
      "languageLabel": "لغة الجولة",
      "empty": "اختر اسم الغرفة أو المرفق من الخريطة",
      "details": "مواصفات المكان المختار",
      "clear": "إلغاء اختيار المكان",
      "selected": "تم عرض مواصفات ",
      "language": "تم عرض الجولة بالعربية",
      "viewport": "خريطة تفاعلية، اختر اسم المكان. استخدم إصبعين أو مفتاحي + و- للتكبير والأسهم للتحريك",
      "image": "توزيع غرف الشاليه ومرافقه",
      "error": "تعذّر تحميل الرسم. الأسماء تظل متاحة للاختيار.",
      "retry": "إعادة المحاولة"
    },
    "en": {
      "title": "Chalet Tour",
      "close": "Close tour",
      "subtitle": "Explore the rooms and facilities",
      "languageLabel": "Tour language",
      "empty": "Select a room or facility on the map",
      "details": "Selected area details",
      "clear": "Clear selection",
      "selected": "Showing details for ",
      "language": "Tour shown in English.",
      "viewport": "Interactive map. Select a label. Pinch or use the + and - keys to zoom, and the arrow keys to pan.",
      "image": "Layout of the chalet's rooms and facilities",
      "error": "The map could not be loaded. You can still select the labels.",
      "retry": "Try again"
    }
  };
  function updateTourText(){
    var copy=tourCopy[labelLanguage], direction=labelLanguage==='en'?'ltr':'rtl';
    dialog.lang=labelLanguage;
    dialog.querySelector('.cm-header').dir=direction;
    dialog.querySelector('#cm-title').textContent=copy.title;
    dialog.querySelector('.cm-subtitle').textContent=copy.subtitle;
    dialog.querySelector('.cm-languages').setAttribute('aria-label',copy.languageLabel);
    dialog.querySelector('.cm-close').setAttribute('aria-label',copy.close);
    viewport.setAttribute('aria-label',copy.viewport);
    dialog.querySelector('.cm-image').alt=copy.image;
    panel.lang=labelLanguage;panel.dir=direction;panel.setAttribute('aria-label',copy.details);
    var error=dialog.querySelector('.cm-error');error.dir=direction;error.querySelector('p').textContent=copy.error;
    dialog.querySelector('.cm-retry').textContent=copy.retry;
  }
  function roomName(room){return labelLanguage==='en'?(roomNamesEn[room.key]||room.name):room.name;}
  function setLabelLanguage(language){
    labelLanguage=language;
    markers.forEach(function(button,i){
      var name=roomName(rooms[i]);
      button.textContent=name;button.setAttribute('aria-label',name);
      button.lang=labelLanguage;button.dir=labelLanguage==='en'?'ltr':'rtl';
    });
    dialog.querySelectorAll('.cm-language').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.lang===labelLanguage));});
    updateTourText();
    var previousScroll=panel.scrollTop;
    if(selected)renderDetails(selected);else clear();
    panel.scrollTop=previousScroll;
    dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].language;
  }
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function clear(){
    selected=null;
    markers.forEach(function(b){b.setAttribute('aria-pressed','false');});
    polygons.concat(leaders).forEach(function(p){p.classList.remove('is-selected');});
    panel.innerHTML='<p class="cm-empty">'+tourCopy[labelLanguage].empty+'</p>';
  }
  function renderDetails(room){
    var index=rooms.indexOf(room), details=labelLanguage==='en'?roomDetailsEn[room.key]:room;
    var floor=labelLanguage==='en'?floorNamesEn[room.floor]:room.floor, copy=tourCopy[labelLanguage];
    panel.innerHTML='<div class="cm-detail-heading"><div><span class="cm-floor">'+floor+'</span><h3 lang="'+labelLanguage+'">'+roomName(room)+'</h3></div><button type="button" class="cm-icon cm-clear" aria-label="'+copy.clear+'">×</button></div>'
      +(details.facts.length?'<ul class="cm-facts">'+details.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul>':'')
      +(details.text?'<p class="cm-description">'+details.text+'</p>':'');
    panel.querySelector('.cm-clear').onclick=function(){clear();markers[index].focus({preventScroll:true});};
  }
  function select(room){
    selected=room;
    var index=rooms.indexOf(room);
    markers.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===index));});
    polygons.forEach(function(p){p.classList.toggle('is-selected',p.dataset.room===room.key);});
    leaders.forEach(function(p,i){p.classList.toggle('is-selected',i===index);});
    renderDetails(room);panel.scrollTop=0;
    dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].selected+roomName(room);
  }
  function renderView(){
    var size=view.size*view.scale, height=size*1.10;
    view.x=size<=view.w?(view.w-size)/2:clamp(view.x,view.w-size,0);
    view.y=height<=view.h?(view.h-height)/2:clamp(view.y,view.h-height,0);
    plane.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';
    plane.style.setProperty('--cm-inverse',1/view.scale);
  }
  function measure(reset){
    if(!dialog.open)return;
    var cx=view.size?(view.w/2-view.x)/(view.size*view.scale):.5;
    var cy=view.size?(view.h/2-view.y)/(view.size*view.scale):.5;
    view.w=viewport.clientWidth;view.h=viewport.clientHeight;view.size=Math.min(view.w,view.h/1.10);
    if(reset){view.scale=1;cx=.5;cy=.55;}
    view.x=view.w/2-cx*view.size*view.scale;view.y=view.h/2-cy*view.size*view.scale;
    plane.style.width=view.size+'px';plane.style.height=(view.size*1.10)+'px';plane.style.setProperty('--cm-label-font',clamp(view.size*.025,11,14)+'px');renderView();
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
    dialog=document.createElement('dialog');dialog.id='fd-chalet-map';dialog.className='cm-dialog';dialog.setAttribute('aria-labelledby','cm-title');dialog.setAttribute('aria-describedby','cm-subtitle');
    dialog.innerHTML='<div class="cm-header"><div class="cm-heading"><div class="cm-title-row"><h2 id="cm-title">جولة داخل الشاليه</h2><div class="cm-languages" role="group" aria-label="لغة الجولة"><button type="button" class="cm-language" data-lang="ar" lang="ar" aria-label="عرض الجولة بالعربية" aria-pressed="true">AR</button><button type="button" class="cm-language" data-lang="en" lang="en" aria-label="Show tour in English" aria-pressed="false">EN</button></div></div><p id="cm-subtitle" class="cm-subtitle">تعرف على الغرف والمرافق</p></div><button type="button" class="cm-icon cm-close" aria-label="إغلاق الجولة" autofocus>×</button></div>'
      +'<div class="cm-workspace"><div class="cm-map-side"><div class="cm-viewport" tabindex="0" aria-label="خريطة تفاعلية، اختر اسم المكان. استخدم إصبعين أو مفتاحي + و- للتكبير والأسهم للتحريك"><div class="cm-plane"><img class="cm-image" width="1254" height="1254" alt="توزيع غرف الشاليه ومرافقه" draggable="false"><svg class="cm-regions" viewBox="0 0 100 110" aria-hidden="true"></svg><svg class="cm-leaders" viewBox="0 0 100 110" aria-hidden="true"></svg></div><div class="cm-error" hidden><p>تعذّر تحميل الرسم. الأسماء تظل متاحة للاختيار.</p><button type="button" class="cm-retry">إعادة المحاولة</button></div></div></div><section id="cm-details" class="cm-details" aria-label="مواصفات المكان المختار"></section></div><p class="cm-announcement" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    viewport=dialog.querySelector('.cm-viewport');plane=dialog.querySelector('.cm-plane');panel=dialog.querySelector('.cm-details');
    rooms.forEach(function(room,i){
      [room.shape].concat(room.extraShapes||[]).forEach(function(shape){
      var polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon');polygon.setAttribute('points',shape.split(' ').map(function(p){var xy=p.split(',');return xy[0]+','+(Number(xy[1])+10);}).join(' '));polygon.dataset.room=room.key;polygon.setAttribute('vector-effect','non-scaling-stroke');dialog.querySelector('svg').appendChild(polygon);polygons.push(polygon);
      });
      var side=room.label[0], x=room.label[1], y=room.label[2], ax=room.x, ay=room.y+10;
      var edgeX=side==='left'?18:side==='right'?82:x;
      var edgeY=side==='top'?y+4:side==='bottom'?y-4:y;
      var leader=document.createElementNS('http://www.w3.org/2000/svg','g');
      var line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('points',edgeX+','+edgeY+' '+ax+','+ay);line.setAttribute('vector-effect','non-scaling-stroke');
      var dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',ax);dot.setAttribute('cy',ay);dot.setAttribute('r','.45');
      leader.append(line,dot);dialog.querySelector('.cm-leaders').appendChild(leader);leaders.push(leader);
      var b=document.createElement('button');b.type='button';b.className='cm-marker cm-label-'+side;b.dataset.room=room.key;b.style.left=x+'%';b.style.top=(y/1.10)+'%';b.textContent=roomName(room);b.setAttribute('aria-label',roomName(room));b.lang=labelLanguage;b.dir=labelLanguage==='en'?'ltr':'rtl';b.setAttribute('aria-controls','cm-details');b.onclick=function(e){if(e.detail===0)select(room);};plane.appendChild(b);markers.push(b);
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
    dialog.querySelectorAll('.cm-language').forEach(function(button){button.onclick=function(){setLabelLanguage(button.dataset.lang);};});
    var img=dialog.querySelector('.cm-image'),error=dialog.querySelector('.cm-error');
    img.onload=function(){error.hidden=true;img.hidden=false;viewport.setAttribute('aria-busy','false');};
    img.onerror=function(){error.hidden=false;img.hidden=true;viewport.setAttribute('aria-busy','false');};
    function load(){error.hidden=true;viewport.setAttribute('aria-busy','true');img.src=imagePath;}
    dialog.querySelector('.cm-retry').onclick=load;
    new ResizeObserver(function(){measure(false);}).observe(viewport);
    window.addEventListener('blur',resetGesture);updateTourText();load();
  }
  window.FD_CHALET_MAP={
    show:function(){if(!dialog)create();if(dialog.open)return;opener=document.activeElement;previousOverflow=document.body.style.overflow;clear();dialog.showModal();document.body.style.overflow='hidden';measure(true);},
    hide:function(){if(!dialog||!dialog.open)return;dialog.close();resetGesture();document.body.style.overflow=previousOverflow;if(opener&&opener.isConnected)opener.focus({preventScroll:true});}
  };
  var grid=document.querySelector('#landing3 .rh-grid');
  if(grid){var launcher=document.createElement('div');launcher.className='fd-chalet-map-launcher';launcher.innerHTML='<button type="button" class="fd-chalet-map-open" aria-haspopup="dialog" aria-controls="fd-chalet-map"><span><strong>جولة داخل الشاليه</strong><small>تعرف على الغرف والمرافق</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>';grid.after(launcher);}
  document.addEventListener('click',function(e){if(e.target.closest('.fd-chalet-map-open'))document.dispatchEvent(new CustomEvent('fd-chalet-map-request'));});
})();

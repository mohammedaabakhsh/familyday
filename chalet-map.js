/* Owner-approved chalet illustration. Room details open in place, in one selection. */
(function () {
  'use strict';
  var rooms = [
  {
    "key": "upperBath",
    "name": "حمام غرفة النوم",
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
      "دش زجاجي",
      "مغسلة",
      "دورة مياه"
    ],
    "text": "",
    "primary": []
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
      "تلفزيون"
    ],
    "text": "",
    "primary": [
      [
        "السرير",
        "سرير مزدوج"
      ],
      [
        "الحمام",
        "حمام خاص"
      ]
    ]
  },
  {
    "key": "stairs",
    "name": "السلم",
    "floor": "",
    "x": 48,
    "y": 22,
    "shape": "44,15 51,15 51,29 44,29",
    "label": [
      "top",
      76,
      6
    ],
    "facts": [],
    "text": "يربط الدور الأرضي بالدور العلوي",
    "primary": []
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
    "facts": [],
    "text": "",
    "primary": [
      [
        "الأسرّة",
        "سريران مفردان"
      ]
    ]
  },
  {
    "key": "play",
    "name": "غرفة ألعاب الأطفال",
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
      "ألعاب للأطفال",
      "إطلالة على المسبح"
    ],
    "text": "",
    "primary": []
  },
  {
    "key": "pool",
    "name": "مسبح الأطفال",
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
      "ألعاب مائية",
      "زحليقة مزدوجة",
      "حاجز زجاجي"
    ],
    "text": "يجب الإشراف على الأطفال أثناء السباحة",
    "primary": [
      [
        "العمق",
        "60 سم"
      ]
    ],
    "note": true
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
    "facts": [],
    "text": "",
    "primary": []
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
    ],
    "primary": []
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
      "إطلالة على المسبح",
      "تلفزيون",
      "باب مباشر لساحة المسبح"
    ],
    "text": "",
    "primary": [
      [
        "السعة",
        "15 شخصًا"
      ]
    ]
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
      "مظلة"
    ],
    "text": "",
    "extraShapes": [
      "27,66 40,66 40,72 27,72"
    ],
    "primary": []
  },
  {
    "key": "majlis",
    "name": "المجلس المستقل",
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
      "تلفزيون",
      "مدخل خاص",
      "حمام خاص"
    ],
    "text": "",
    "primary": [
      [
        "السعة",
        "10 أشخاص"
      ]
    ]
  }
];
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
  "majlis": "Separate Majlis"
};
  var roomDetailsEn={
  "upperBath": {
    "primary": [],
    "facts": [
      "Glass-enclosed shower",
      "Washbasin",
      "Toilet"
    ],
    "text": ""
  },
  "upper": {
    "primary": [
      [
        "Bed",
        "Double bed"
      ],
      [
        "Bathroom",
        "Private bathroom"
      ]
    ],
    "facts": [
      "TV"
    ],
    "text": ""
  },
  "stairs": {
    "primary": [],
    "facts": [],
    "text": "Connects the ground floor to the upper floor"
  },
  "ground": {
    "primary": [
      [
        "Beds",
        "Two single beds"
      ]
    ],
    "facts": [],
    "text": ""
  },
  "play": {
    "primary": [],
    "facts": [
      "Children’s games",
      "Pool view"
    ],
    "text": ""
  },
  "pool": {
    "primary": [
      [
        "Depth",
        "60 cm"
      ]
    ],
    "facts": [
      "Water play features",
      "Double slide",
      "Glass barrier"
    ],
    "text": "Children must be supervised while swimming.",
    "note": true
  },
  "groundBath": {
    "primary": [],
    "facts": [],
    "text": ""
  },
  "kitchen": {
    "primary": [],
    "facts": [
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
    "primary": [
      [
        "Capacity",
        "15 people"
      ]
    ],
    "facts": [
      "Pool view",
      "TV",
      "Direct access to the pool area"
    ],
    "text": ""
  },
  "shower": {
    "primary": [],
    "facts": [
      "Umbrella"
    ],
    "text": ""
  },
  "majlis": {
    "primary": [
      [
        "Capacity",
        "10 people"
      ]
    ],
    "facts": [
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
  var detailTitles={ar:{upper:"غرفة النوم",ground:"غرفة النوم",groundBath:"الحمام"},en:{upper:"Bedroom",ground:"Bedroom",groundBath:"Bathroom"}};
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

  var dialog, viewport, plane, panel, opener, previousOverflow, selected=null;
  var labelLanguage='ar', markers=[], polygons=[], leaders=[];
  var imagePath='imgs/chalet-map-clean-v2.webp';
  var view={w:0,h:0,scale:1,x:0,y:0,imageSize:0,imageX:0,imageY:0};
  var pointers=new Map(),gesture;
  var ns='http://www.w3.org/2000/svg';
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function roomName(room){return labelLanguage==='en'?roomNamesEn[room.key]:room.name;}
  function isMobile(){return window.matchMedia('(max-width:899px)').matches;}
  function updateText(){
    var copy=tourCopy[labelLanguage],direction=labelLanguage==='en'?'ltr':'rtl';
    dialog.lang=labelLanguage;
    dialog.querySelector('#cm-title').textContent=copy.title;
    dialog.querySelector('.cm-heading').dir=direction;
    dialog.querySelector('.cm-close').setAttribute('aria-label',copy.close);
    dialog.querySelector('.cm-languages').setAttribute('aria-label',copy.languageLabel);
    dialog.querySelector('.cm-labels').dir=direction;
    dialog.querySelector('.cm-labels').setAttribute('aria-label',copy.empty);
    viewport.setAttribute('aria-label',copy.viewport);
    dialog.querySelector('.cm-image').alt=copy.image;
    panel.lang=labelLanguage;panel.dir=direction;panel.setAttribute('aria-label',copy.details);
    dialog.querySelector('.cm-error p').textContent=copy.error;
    dialog.querySelector('.cm-retry').textContent=copy.retry;
    var zoomCopy=labelLanguage==='en'?['Zoom in','Zoom out','Reset view']:['تكبير الرسم','تصغير الرسم','إعادة ضبط العرض'];
    dialog.querySelectorAll('.cm-zoom button').forEach(function(b,i){b.setAttribute('aria-label',zoomCopy[i]);});
    markers.forEach(function(b,i){b.textContent=roomName(rooms[i]);b.setAttribute('aria-label',roomName(rooms[i]));b.dir=direction;});
    dialog.querySelectorAll('.cm-language').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===labelLanguage));});
  }
  function renderDetails(room){
    var details=labelLanguage==='en'?roomDetailsEn[room.key]:room;
    var floor=room.floor?(labelLanguage==='en'?floorNamesEn[room.floor]:room.floor):'';
    var name=detailTitles[labelLanguage][room.key]||roomName(room);
    panel.innerHTML='<div class="cm-detail-heading"><div>'+(floor?'<span class="cm-floor">'+floor+'</span>':'')+'<h3>'+name+'</h3></div></div>'
      +((details.primary||[]).length?'<div class="cm-fact-grid">'+details.primary.map(function(f){return '<div class="cm-fact-card"><span class="cm-fact-label">'+f[0]+'</span><strong>'+f[1]+'</strong></div>';}).join('')+'</div>':'')
      +((details.facts||[]).length?'<ul class="cm-facts">'+details.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul>':'')
      +(details.text?'<p class="'+(details.note?'cm-note':'cm-description')+'">'+details.text+'</p>':'');
  }
  function select(room){
    selected=room;
    markers.forEach(function(b,i){b.setAttribute('aria-pressed',String(rooms[i]===room));});
    polygons.forEach(function(p){p.classList.toggle('is-selected',p.dataset.room===room.key);});
    leaders.forEach(function(g,i){g.classList.toggle('is-selected',rooms[i]===room);});
    renderDetails(room);panel.scrollTop=0;
    dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].selected+roomName(room);
  }
  function setLanguage(language){labelLanguage=language;updateText();renderDetails(selected);layoutLabels();renderView();dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].language;}
  // Labels stay outside the illustration even while the image is zoomed.
  var desktopLabels={
    upperBath:['top',.27],upper:['top',.50],stairs:['top',.73],
    ground:['left',.22],play:['left',.40],pool:['left',.62],shower:['left',.83],
    groundBath:['right',.22],kitchen:['right',.40],living:['right',.62],majlis:['right',.83]
  };
  function layoutLabels(){
    if(isMobile()){markers.forEach(function(b){b.style.left='';b.style.top='';b.style.width='';});return;}
    var rail=clamp(view.w*.18,108,150);
    markers.forEach(function(b,i){
      var p=desktopLabels[rooms[i].key],x=p[0]==='top'?view.w*p[1]:p[0]==='left'?rail/2+3:view.w-rail/2-3;
      b.style.left=x+'px';b.style.top=(p[0]==='top'?25:Math.max(90,view.h*p[1]))+'px';b.style.width=rail+'px';
    });
  }
  function drawLeaders(){
    var mobile=isMobile();
    rooms.forEach(function(room,i){
      var g=leaders[i],line=g.querySelector('path'),dot=g.querySelector('circle');
      var x=view.x+(view.imageX+view.imageSize*room.x/100)*view.scale;
      var y=view.y+(view.imageY+view.imageSize*room.y/100)*view.scale;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);
      if(mobile){line.setAttribute('d','');return;}
      var b=markers[i],side=desktopLabels[room.key][0];
      var bx=parseFloat(b.style.left),by=parseFloat(b.style.top);
      var sx=side==='left'?bx+b.offsetWidth/2:side==='right'?bx-b.offsetWidth/2:bx;
      var sy=side==='top'?by+b.offsetHeight/2:by;
      var cx=side==='top'?sx:sx+(x-sx)*.45,cy=side==='top'?sy+(y-sy)*.45:sy;
      line.setAttribute('d','M '+sx+' '+sy+' Q '+cx+' '+cy+' '+x+' '+y);
    });
  }
  function renderView(){
    view.x=view.scale===1?0:clamp(view.x,view.w*(1-view.scale),0);
    view.y=view.scale===1?0:clamp(view.y,view.h*(1-view.scale),0);
    plane.style.transform='translate('+view.x+'px,'+view.y+'px) scale('+view.scale+')';
    drawLeaders();
    dialog.querySelector('[data-zoom="out"]').disabled=view.scale<=1;
    dialog.querySelector('[data-zoom="in"]').disabled=view.scale>=3;
  }
  function measure(reset){
    if(!dialog.open)return;
    var changed=view.w!==viewport.clientWidth||view.h!==viewport.clientHeight;
    view.w=viewport.clientWidth;view.h=viewport.clientHeight;
    if(reset||changed){view.scale=1;view.x=0;view.y=0;}
    var mobile=isMobile(),rail=clamp(view.w*.18,108,150);
    // The approved square asset has transparent margins; fit its whole visible building.
    view.imageSize=mobile?Math.min((view.w-24)/.82,(view.h-20)/.78):Math.min((view.w-2*rail-24)/.82,(view.h-88)/.78);
    view.imageSize=Math.max(1,view.imageSize);
    view.imageX=(view.w-view.imageSize)/2;
    view.imageY=(mobile?10:68)-view.imageSize*.065;
    plane.style.width=view.w+'px';plane.style.height=view.h+'px';
    var frame=plane.querySelector('.cm-illustration');
    frame.style.cssText='left:'+view.imageX+'px;top:'+view.imageY+'px;width:'+view.imageSize+'px;height:'+view.imageSize+'px';
    dialog.querySelector('.cm-leaders').setAttribute('viewBox','0 0 '+view.w+' '+view.h);
    layoutLabels();renderView();
  }
  function zoom(scale,x,y){
    var next=clamp(scale,1,3),ratio=next/view.scale;
    view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.scale=next;renderView();
  }
  function point(e){var b=viewport.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top};}
  function resetGesture(){pointers.clear();gesture=null;}
  function pinch(){var p=Array.from(pointers.values());return{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};}
  function down(e){
    if(e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
    var p=point(e);pointers.set(e.pointerId,p);viewport.setPointerCapture(e.pointerId);
    if(pointers.size===1)gesture={start:p,last:p,moved:false,key:e.target.closest('[data-room]')?.dataset.room};
    else if(gesture){gesture.moved=true;gesture.pinch=pinch();}
  }
  function move(e){
    if(!gesture||!pointers.has(e.pointerId))return;
    var p=point(e);pointers.set(e.pointerId,p);
    if(pointers.size>1){var n=pinch(),old=gesture.pinch;if(old){var next=clamp(view.scale*n.d/Math.max(old.d,1),1,3),ratio=next/view.scale;view.x=n.x-(old.x-view.x)*ratio;view.y=n.y-(old.y-view.y)*ratio;view.scale=next;renderView();}gesture.pinch=n;gesture.moved=true;}
    else{if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>6)gesture.moved=true;if(gesture.moved&&view.scale>1){view.x+=p.x-gesture.last.x;view.y+=p.y-gesture.last.y;renderView();}gesture.last=p;}
  }
  function up(e){
    if(!gesture||!pointers.has(e.pointerId))return;
    var tap=!gesture.moved&&e.type==='pointerup',key=gesture.key;pointers.delete(e.pointerId);
    if(pointers.size){gesture.start=gesture.last=Array.from(pointers.values())[0];gesture.pinch=null;gesture.moved=true;}
    else{resetGesture();if(tap&&key)select(rooms.find(function(r){return r.key===key;}));}
  }
  function dismiss(){document.dispatchEvent(new CustomEvent('fd-chalet-map-dismiss'));}
  function create(){
    dialog=document.createElement('dialog');dialog.id='fd-chalet-map';dialog.className='cm-dialog';dialog.setAttribute('aria-labelledby','cm-title');
    dialog.innerHTML='<div class="cm-header"><div class="cm-heading"><h2 id="cm-title">جولة داخل الشاليه</h2></div><div class="cm-languages" role="group" aria-label="لغة الجولة"><button type="button" class="cm-language" data-lang="ar" lang="ar" aria-label="عرض الجولة بالعربية" aria-pressed="true">AR</button><button type="button" class="cm-language" data-lang="en" lang="en" aria-label="Show tour in English" aria-pressed="false">EN</button></div><button type="button" class="cm-icon cm-close" aria-label="إغلاق الجولة" autofocus>×</button></div>'
      +'<div class="cm-workspace"><div class="cm-map-side"><div class="cm-labels" role="group"></div><div class="cm-viewport" tabindex="0"><div class="cm-plane"><div class="cm-illustration"><img class="cm-image" width="1254" height="1254" alt="" draggable="false"><svg class="cm-regions" viewBox="0 0 100 100" aria-hidden="true"></svg></div></div><svg class="cm-leaders" aria-hidden="true"></svg><div class="cm-zoom"><button type="button" data-zoom="in">+</button><button type="button" data-zoom="out">−</button><button type="button" data-zoom="reset">↺</button></div><div class="cm-error" hidden><p></p><button type="button" class="cm-retry"></button></div></div></div><section id="cm-details" class="cm-details"></section></div><p class="cm-announcement" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    viewport=dialog.querySelector('.cm-viewport');plane=dialog.querySelector('.cm-plane');panel=dialog.querySelector('.cm-details');
    rooms.forEach(function(room){
      [room.shape].concat(room.extraShapes||[]).forEach(function(shape){
        var polygon=document.createElementNS(ns,'polygon');polygon.setAttribute('points',shape);polygon.dataset.room=room.key;polygon.setAttribute('vector-effect','non-scaling-stroke');dialog.querySelector('.cm-regions').appendChild(polygon);polygons.push(polygon);
      });
      var g=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path'),dot=document.createElementNS(ns,'circle');
      dot.setAttribute('r','4');g.append(path,dot);dialog.querySelector('.cm-leaders').appendChild(g);leaders.push(g);
      var b=document.createElement('button');b.type='button';b.className='cm-marker';b.dataset.room=room.key;b.setAttribute('aria-controls','cm-details');b.onclick=function(){select(room);};dialog.querySelector('.cm-labels').appendChild(b);markers.push(b);
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
    dialog.querySelectorAll('[data-zoom]').forEach(function(b){b.onclick=function(){if(b.dataset.zoom==='reset')measure(true);else zoom(view.scale+(b.dataset.zoom==='in'?.5:-.5),view.w/2,view.h/2);};});
    dialog.querySelector('.cm-close').onclick=dismiss;
    dialog.addEventListener('cancel',function(e){e.preventDefault();dismiss();});
    dialog.querySelectorAll('.cm-language').forEach(function(b){b.onclick=function(){setLanguage(b.dataset.lang);};});
    var img=dialog.querySelector('.cm-image'),error=dialog.querySelector('.cm-error');
    img.onload=function(){error.hidden=true;img.hidden=false;viewport.setAttribute('aria-busy','false');};
    img.onerror=function(){error.hidden=false;img.hidden=true;viewport.setAttribute('aria-busy','false');};
    function load(){error.hidden=true;viewport.setAttribute('aria-busy','true');img.src=imagePath;}
    dialog.querySelector('.cm-retry').onclick=load;
    new ResizeObserver(function(){measure(false);}).observe(viewport);
    window.addEventListener('blur',resetGesture);updateText();load();
    if(document.fonts)document.fonts.ready.then(function(){if(dialog.open)measure(false);});
  }
  window.FD_CHALET_MAP={
    show:function(){if(!dialog)create();if(dialog.open)return;opener=document.activeElement;previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';select(selected||rooms.find(function(r){return r.key==='pool';}));measure(true);},
    hide:function(){if(!dialog||!dialog.open)return;dialog.close();resetGesture();document.body.style.overflow=previousOverflow;if(opener&&opener.isConnected)opener.focus({preventScroll:true});}
  };
  var grid=document.querySelector('#landing3 .rh-grid');
  if(grid){var launcher=document.createElement('div');launcher.className='fd-chalet-map-launcher';launcher.innerHTML='<button type="button" class="fd-chalet-map-open" aria-haspopup="dialog" aria-controls="fd-chalet-map"><span><strong>جولة داخل الشاليه</strong><small>تعرف على الغرف والمرافق</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>';grid.after(launcher);}
  document.addEventListener('click',function(e){if(e.target.closest('.fd-chalet-map-open'))document.dispatchEvent(new CustomEvent('fd-chalet-map-request'));});
})();

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

  var dialog, viewport, plane, panel, opener, previousOverflow, selected=null, lineFrame;
  var labelLanguage='ar', markers=[], polygons=[], leaders=[];
  var imagePath='imgs/chalet-map-clean-v2.webp';
  var view={w:0,h:0,imageSize:0,imageX:0,imageY:0};
  var ns='http://www.w3.org/2000/svg';
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function roomName(room){return labelLanguage==='en'?roomNamesEn[room.key]:room.name;}
  function isMobile(){return window.matchMedia('(max-width:899px)').matches;}
  function esc(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function queueLines(){cancelAnimationFrame(lineFrame);lineFrame=requestAnimationFrame(drawLeaders);}
  function updateText(){
    var copy=tourCopy[labelLanguage],direction=labelLanguage==='en'?'ltr':'rtl';
    dialog.lang=labelLanguage;
    dialog.querySelector('#cm-title').textContent=copy.title;
    dialog.querySelector('.cm-heading').dir=direction;
    var back=dialog.querySelector('.cm-close'),backText=labelLanguage==='en'?'Back to chalet':'العودة إلى الشاليه';
    back.dir=direction;back.setAttribute('aria-label',backText);
    back.innerHTML='<span aria-hidden="true">'+(labelLanguage==='en'?'←':'→')+'</span> '+backText;
    dialog.querySelector('.cm-languages').setAttribute('aria-label',copy.languageLabel);
    dialog.querySelector('.cm-labels').dir=direction;
    dialog.querySelector('.cm-labels').setAttribute('aria-label',copy.empty);
    viewport.setAttribute('aria-label',labelLanguage==='en'?'Illustrated chalet layout. Select a room or facility.':'توزيع الشاليه، اختر الغرفة أو المرفق لعرض تفاصيله');
    dialog.querySelector('.cm-image').alt=copy.image;
    dialog.querySelector('.cm-occupancy').textContent=labelLanguage==='en'?'Family friendly · Up to 15 guests':'مناسب للعائلات · حتى 15 ضيفًا';
    panel.lang=labelLanguage;panel.dir=direction;panel.setAttribute('aria-label',copy.details);
    dialog.querySelector('.cm-error p').textContent=copy.error;
    dialog.querySelector('.cm-retry').textContent=copy.retry;
    markers.forEach(function(b,i){b.textContent=roomName(rooms[i]);b.setAttribute('aria-label',roomName(rooms[i]));b.dir=direction;});
    dialog.querySelectorAll('.cm-language').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===labelLanguage));});
  }
  // Reuse the cabin tours' line icons and card structure.
  icons.people='M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-1a2.5 2.5 0 1 0 0-5M2 21v-3a6 6 0 0 1 12 0v3m2-8a5 5 0 0 1 6 5v3';
  icons.door='M4 22V3h15v19M7 22V5l10-2v19M12 13h1';
  icons.window='M3 3h18v18H3ZM12 3v18M3 12h18';
  icons.toilet='M6 3h6v8H6ZM4 11h15v2a6 6 0 0 1-6 6H9l-1 3h8l-1-4M9 6h.01';
  icons.basin='M3 11h18l-2 6H5l-2-6Zm9 6v5M8 11V6a3 3 0 0 1 6 0M7 22h10';
  icons.toy='M4 9h16v11H4ZM4 9l8-6 8 6M12 3v17M4 9l8 5 8-5';
  icons.slide='M4 21V7h6c0 10 5 14 11 14M4 10h6M4 14h6M4 18h7M7 7V3h3v4';
  icons.barrier='M3 5v16m18-16v16M3 8h18M3 18h18M8 8v10m8-10v10';
  icons.oven='M4 3h16v18H4ZM4 8h16M7 11h10v7H7ZM8 5h.01M12 5h.01M16 5h.01';
  icons.stairs='M2 21h5v-5h5v-5h5V6h5M3 11l12-9';
  function factIcon(text){
    return {'تلفزيون':'tv','دش زجاجي':'shower','مغسلة':'basin','دورة مياه':'toilet','ألعاب للأطفال':'toy','إطلالة على المسبح':'window','ألعاب مائية':'pool','زحليقة مزدوجة':'slide','حاجز زجاجي':'barrier','ثلاجة':'fridge','فرن':'oven','ميكروويف':'microwave','موقد غاز وكهرباء':'hob','غلاية':'kettle','أدوات مطبخ أساسية':'utensils','باب مباشر لساحة المسبح':'door','مظلة':'outdoor','مدخل خاص':'door','حمام خاص':'shower'}[text]||'kitchen';
  }
  function renderDetails(room){
    var details=labelLanguage==='en'?roomDetailsEn[room.key]:room;
    var floor=room.floor?(labelLanguage==='en'?floorNamesEn[room.floor]:room.floor):'';
    var name=detailTitles[labelLanguage][room.key]||roomName(room),cards=[];
    (details.primary||[]).forEach(function(f,i){
      var ar=room.primary[i][0],value=f[1],numeric=ar==='العمق';
      if(numeric)value=value.replace('سم','cm');
      cards.push({label:f[0],value:value,numeric:numeric,icon:{'العمق':'water','السرير':'bed','الأسرّة':'bed','الحمام':'shower','السعة':'people'}[ar]||'size'});
    });
    (details.facts||[]).forEach(function(f,i){cards.push({value:f,icon:factIcon(room.facts[i])});});
    if(room.key==='groundBath')cards.push({value:labelLanguage==='en'?'Bathroom':'حمام',icon:'shower'});
    if(room.key==='stairs')cards.push({value:details.text,icon:'stairs'});
    panel.innerHTML='<div class="cm-detail-heading"><h3>'+esc(name)+'</h3>'+(floor?'<p>'+esc(floor)+'</p>':'')+'</div>'
      +'<div class="cm-cards">'+cards.map(function(card){return '<div class="cm-card">'+icon(card.icon)+'<div>'+(card.label?'<span>'+esc(card.label)+'</span>':'')+'<strong'+(card.numeric?' dir="ltr"':'')+'>'+esc(card.value)+'</strong></div></div>';}).join('')+'</div>'
      +(details.text&&room.key!=='stairs'?'<p class="cm-note">'+esc(details.text)+'</p>':'');
  }
  function select(room){
    selected=room;
    markers.forEach(function(b,i){b.setAttribute('aria-pressed',String(rooms[i]===room));});
    polygons.forEach(function(p){p.classList.toggle('is-selected',p.dataset.room===room.key);});
    leaders.forEach(function(g,i){g.classList.toggle('is-selected',rooms[i]===room);});
    renderDetails(room);panel.scrollTop=0;queueLines();
    dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].selected+roomName(room);
  }
  function setLanguage(language){
    labelLanguage=language;updateText();renderDetails(selected);measure();
    dialog.querySelector('.cm-announcement').textContent=tourCopy[labelLanguage].language;
  }
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
    if(!dialog.open)return;
    var mobile=isMobile(),stage=dialog.querySelector('.cm-map-side').getBoundingClientRect(),vp=viewport.getBoundingClientRect();
    var svg=dialog.querySelector('.cm-leaders');svg.setAttribute('viewBox','0 0 '+stage.width+' '+stage.height);
    rooms.forEach(function(room,i){
      var g=leaders[i],line=g.querySelector('path'),dot=g.querySelector('circle');
      var x=vp.left-stage.left+view.imageX+view.imageSize*room.x/100;
      var y=vp.top-stage.top+view.imageY+view.imageSize*room.y/100;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);
      var b=markers[i].getBoundingClientRect(),side=desktopLabels[room.key][0];
      var top=mobile||side==='top';
      var sx=top?b.left+b.width/2-stage.left:(side==='left'?b.right:b.left)-stage.left;
      var sy=(top?b.bottom:b.top+b.height/2)-stage.top;
      var curve=top?'C '+sx+' '+(sy+35)+' '+x+' '+(y-45)+' '+x+' '+y
        :'C '+(sx+(side==='left'?28:-28))+' '+sy+' '+(x+(side==='left'?-28:28))+' '+y+' '+x+' '+y;
      line.setAttribute('d','M '+sx+' '+sy+' '+curve);
    });
  }
  function measure(){
    if(!dialog.open)return;
    var languages=dialog.querySelector('.cm-languages');
    var languageHost=dialog.querySelector(isMobile()?'.cm-mobile-languages':'.cm-header');
    if(languages.parentElement!==languageHost)languageHost.appendChild(languages);
    view.w=viewport.clientWidth;view.h=viewport.clientHeight;
    var mobile=isMobile(),rail=clamp(view.w*.18,108,150);
    view.imageSize=mobile?Math.min((view.w-24)/.82,(view.h-22)/.78):Math.min((view.w-2*rail-24)/.82,(view.h-88)/.78);
    view.imageSize=Math.max(1,view.imageSize);
    view.imageX=(view.w-view.imageSize)/2;
    view.imageY=(mobile?10:68)-view.imageSize*.065;
    plane.style.width=view.w+'px';plane.style.height=view.h+'px';
    plane.querySelector('.cm-illustration').style.cssText='left:'+view.imageX+'px;top:'+view.imageY+'px;width:'+view.imageSize+'px;height:'+view.imageSize+'px';
    layoutLabels();queueLines();
  }
  function dismiss(){document.dispatchEvent(new CustomEvent('fd-chalet-map-dismiss'));}
  function create(){
    dialog=document.createElement('dialog');dialog.id='fd-chalet-map';dialog.className='cm-dialog';dialog.setAttribute('aria-labelledby','cm-title');
    dialog.innerHTML='<nav class="cm-nav"><button type="button" class="cm-close" autofocus></button></nav>'
      +'<div class="cm-header"><div class="cm-heading"><h2 id="cm-title">جولة داخل الشاليه</h2></div><div class="cm-languages" role="group" aria-label="لغة الجولة"><button type="button" class="cm-language" data-lang="ar" lang="ar" aria-label="العربية" aria-pressed="true">AR</button><button type="button" class="cm-language" data-lang="en" lang="en" aria-label="English" aria-pressed="false">EN</button></div></div>'
      +'<div class="cm-workspace"><div class="cm-map-side"><div class="cm-labels" role="group"></div><div class="cm-viewport"><div class="cm-plane"><div class="cm-illustration"><img class="cm-image" width="1254" height="1254" alt="" draggable="false"><svg class="cm-regions" viewBox="0 0 100 100" aria-hidden="true"></svg></div></div><div class="cm-error" hidden><p></p><button type="button" class="cm-retry"></button></div></div><svg class="cm-leaders" aria-hidden="true"></svg></div><div class="cm-mobile-languages"></div><section id="cm-details" class="cm-details" aria-live="polite" aria-atomic="true"></section><p class="cm-occupancy"></p></div><p class="cm-announcement" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    viewport=dialog.querySelector('.cm-viewport');plane=dialog.querySelector('.cm-plane');panel=dialog.querySelector('.cm-details');
    rooms.forEach(function(room){
      [room.shape].concat(room.extraShapes||[]).forEach(function(shape){
        var polygon=document.createElementNS(ns,'polygon');polygon.setAttribute('points',shape);polygon.dataset.room=room.key;polygon.setAttribute('vector-effect','non-scaling-stroke');dialog.querySelector('.cm-regions').appendChild(polygon);polygons.push(polygon);
      });
      var g=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path'),dot=document.createElementNS(ns,'circle');
      dot.setAttribute('r','3.5');g.append(path,dot);dialog.querySelector('.cm-leaders').appendChild(g);leaders.push(g);
      var b=document.createElement('button');b.type='button';b.className='cm-marker';b.dataset.room=room.key;b.setAttribute('aria-controls','cm-details');b.onclick=function(){select(room);};dialog.querySelector('.cm-labels').appendChild(b);markers.push(b);
    });
    viewport.addEventListener('click',function(e){var key=e.target.closest('[data-room]')?.dataset.room;if(key)select(rooms.find(function(r){return r.key===key;}));});
    dialog.querySelector('.cm-close').onclick=dismiss;
    dialog.addEventListener('cancel',function(e){e.preventDefault();dismiss();});
    dialog.querySelectorAll('.cm-language').forEach(function(b){b.onclick=function(){setLanguage(b.dataset.lang);};});
    var img=dialog.querySelector('.cm-image'),error=dialog.querySelector('.cm-error');
    img.onload=function(){error.hidden=true;img.hidden=false;viewport.setAttribute('aria-busy','false');measure();};
    img.onerror=function(){error.hidden=false;img.hidden=true;viewport.setAttribute('aria-busy','false');};
    function load(){error.hidden=true;viewport.setAttribute('aria-busy','true');img.src=imagePath;}
    dialog.querySelector('.cm-retry').onclick=load;
    new ResizeObserver(measure).observe(viewport);
    updateText();load();
    if(document.fonts)document.fonts.ready.then(measure);
  }
  window.FD_CHALET_MAP={
    show:function(){if(!dialog)create();if(dialog.open)return;opener=document.activeElement;previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';select(selected||rooms.find(function(r){return r.key==='pool';}));measure();},
    hide:function(){if(!dialog||!dialog.open)return;dialog.close();cancelAnimationFrame(lineFrame);document.body.style.overflow=previousOverflow;if(opener&&opener.isConnected)opener.focus({preventScroll:true});}
  };
  var grid=document.querySelector('#landing3 .rh-grid');
  if(grid){var launcher=document.createElement('div');launcher.className='fd-chalet-map-launcher';launcher.innerHTML='<button type="button" class="fd-chalet-map-open" aria-haspopup="dialog" aria-controls="fd-chalet-map"><span><strong>جولة داخل الشاليه</strong><small>تعرف على الغرف والمرافق</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>';grid.after(launcher);}
  document.addEventListener('click',function(e){if(e.target.closest('.fd-chalet-map-open'))document.dispatchEvent(new CustomEvent('fd-chalet-map-request'));});
})();

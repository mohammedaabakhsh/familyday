/* Owner-approved chalet illustration. Room details open in place, in one selection. */
(function () {
  'use strict';
  var rooms = [
  {
    "key": "upper",
    "name": "غرفة النوم العلوية",
    "floor": "الدور العلوي",
    "x": 36.364,
    "y": 12.041,
    "shape": "30.383,6.061 43.541,6.061 43.541,16.746 30.383,16.746",
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
    "key": "ground",
    "name": "غرفة النوم",
    "floor": "الدور الأرضي",
    "x": 29.107,
    "y": 24.641,
    "shape": "24.003,19.936 34.211,19.936 34.211,29.665 22.887,29.665",
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
    "key": "living",
    "name": "الصالة الداخلية",
    "floor": "الدور الأرضي",
    "x": 73.445,
    "y": 50.478,
    "shape": "61.962,38.437 80.702,38.437 86.204,61.882 63.955,61.882",
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
    "key": "kitchen",
    "name": "المطبخ",
    "floor": "الدور الأرضي",
    "x": 69.617,
    "y": 22.568,
    "shape": "59.490,14.753 76.316,14.753 79.426,26.954 59.490,26.954",
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
    "primary": []
  },
  {
    "key": "dining",
    "name": "طاولة الطعام",
    "floor": "الدور الأرضي",
    "x": 69.378,
    "y": 33.174,
    "shape": "60.447,28.469 79.904,28.469 80.622,37.959 60.447,37.959",
    "label": [
      "right",
      91,
      64
    ],
    "facts": [],
    "text": "",
    "primary": [
      [
        "السعة",
        "8 أشخاص"
      ]
    ]
  },
  {
    "key": "play",
    "name": "غرفة ألعاب الأطفال",
    "floor": "الدور الأرضي",
    "x": 38.836,
    "y": 24.88,
    "shape": "34.689,19.936 42.982,19.936 42.982,29.745 34.689,29.745",
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
    "x": 36.603,
    "y": 57.496,
    "shape": "26.236,31.419 35.327,31.419 35.327,34.131 48.166,34.131 52.233,39.314 52.552,72.887 22.329,72.887",
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
    "key": "shower",
    "name": "المنطقة الخارجية",
    "floor": "",
    "x": 19.059,
    "y": 74.322,
    "shape": "16.029,69.697 21.930,69.697 21.930,79.426 15.789,79.426",
    "label": [
      "bottom",
      18,
      101
    ],
    "facts": [
      "كرسي تشميس",
      "دش خارجي"
    ],
    "text": "",
    "extraShapes": [
      "22.488,73.445 40.191,73.445 40.191,79.506 22.488,79.506"
    ],
    "primary": []
  },
  {
    "key": "majlis",
    "name": "المجلس المستقل",
    "floor": "المنطقة الخارجية",
    "x": 78.309,
    "y": 71.451,
    "shape": "65.789,63.078 86.523,63.078 90.112,79.266 65.789,79.266",
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
  },
  {
    "key": "groundBath",
    "name": "حمام",
    "floor": "الدور الأرضي",
    "x": 57.257,
    "y": 23.046,
    "shape": "53.907,16.906 58.852,16.906 58.852,28.469 53.907,28.469",
    "label": [
      "right",
      91,
      33
    ],
    "facts": [],
    "text": "",
    "primary": []
  }
];
  var roomNamesEn={
  "upperBath": "En-suite Bathroom",
  "upper": "Upstairs Bedroom",
  "stairs": "Stairs",
  "ground": "Bedroom",
  "play": "Kids' Playroom",
  "pool": "Kids' Pool",
  "groundBath": "Bathroom",
  "kitchen": "Kitchen",
  "living": "Indoor Lounge",
  "shower": "Outdoor Area",
  "majlis": "Separate Majlis",
  "dining": "Dining table"
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
      "Sun lounger",
      "Outdoor shower"
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
  },
  "dining": {
    "primary": [
      [
        "Capacity",
        "8 people"
      ]
    ],
    "facts": [],
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
  var imagePath='imgs/chalet-tour-approved-v3.png';
  var view={w:0,h:0,imageSize:0,imageX:0,imageY:0};
  var ns='http://www.w3.org/2000/svg';
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function roomName(room){return labelLanguage==='en'?roomNamesEn[room.key]:room.name;}
  function isMobile(){return window.matchMedia('(max-width:819px)').matches;}
  function esc(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function queueLines(){cancelAnimationFrame(lineFrame);lineFrame=requestAnimationFrame(drawLeaders);}
  function updateText(){
    var copy=tourCopy[labelLanguage],direction=labelLanguage==='en'?'ltr':'rtl';
    dialog.lang=labelLanguage;
    dialog.querySelector('#cm-title').textContent=copy.title;
    dialog.querySelector('.cm-heading').dir=direction;
    dialog.querySelector('.cm-header').dir=direction;
    dialog.querySelector('.cm-subtitle').textContent=copy.subtitle;
    var back=dialog.querySelector('.cm-close'),backText=labelLanguage==='en'?'Back to chalet':'العودة إلى الشاليه';
    back.dir=direction;back.setAttribute('aria-label',backText);
    back.title=backText;
    back.innerHTML='<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
    return {'تلفزيون':'tv','دش زجاجي':'shower','مغسلة':'basin','دورة مياه':'toilet','ألعاب للأطفال':'toy','إطلالة على المسبح':'window','ألعاب مائية':'pool','زحليقة مزدوجة':'slide','حاجز زجاجي':'barrier','ثلاجة':'fridge','فرن':'oven','ميكروويف':'microwave','موقد غاز وكهرباء':'hob','غلاية':'kettle','أدوات مطبخ أساسية':'utensils','باب مباشر لساحة المسبح':'door','مظلة':'outdoor','كرسي تشميس':'chair','دش خارجي':'shower','مدخل خاص':'door','حمام خاص':'shower'}[text]||'kitchen';
  }
  function renderDetails(room){
    var details=labelLanguage==='en'?roomDetailsEn[room.key]:room;
    var floor=room.floor?(labelLanguage==='en'?floorNamesEn[room.floor]:room.floor):'';
    var name=detailTitles[labelLanguage][room.key]||roomName(room),cards=[];
    (details.primary||[]).forEach(function(f,i){
      var ar=room.primary[i][0],value=f[1],numeric=ar==='العمق';
      if(numeric)value=value.replace('سم','cm');
      cards.push({label:f[0],value:value,numeric:numeric,icon:room.key==='dining'?'dining':{'العمق':'water','السرير':'bed','الأسرّة':'bed','الحمام':'shower','السعة':'people'}[ar]||'size'});
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
  // Match the resort map: compact labels on four sides and persistent connectors.
  var labelSides={
    ground:'left',upper:'top',groundBath:'right',
    play:'left',pool:'left',kitchen:'right',dining:'right',living:'right',
    shower:'bottom',majlis:'bottom'
  };
  var leaderPoints={"upper": [36.364, 12.041], "ground": [29.107, 24.641], "play": [38.836, 24.88], "kitchen": [69.617, 22.568], "dining": [69.378, 33.174], "living": [73.445, 50.478], "majlis": [78.309, 71.451], "pool": [36.603, 57.496], "shower": [19.059, 74.322], "groundBath": [57.257, 23.046]};
  function labelRail(){return isMobile()?clamp(view.w*.19,66,78):clamp(view.w*.14,94,118);}
  function layoutLabels(){
    var mobile=isMobile(),rail=labelRail(),gap=mobile?6:12;
    var visibleTop=view.imageY+view.imageSize*.045;
    var visibleBottom=view.imageY+view.imageSize*.91;
    // One centered bedroom above, two aligned labels below, and ordered side rails.
    var left=Math.max(rail/2+4,view.w/2-view.imageSize*.46-gap-rail/2);
    var right=view.w-left;
    var columnOffset=mobile?view.w*.25:view.imageSize*.25;
    var rowWidth=mobile?Math.min(120,view.w*.38):rail;
    var top=mobile?24:Math.max(24,visibleTop-28);
    var bottom=mobile?view.h-24:Math.min(view.h-24,visibleBottom+28);
    function place(key,x,y,width){
      var button=markers[rooms.findIndex(function(room){return room.key===key;})];
      button.style.width=width+'px';button.style.left=x+'px';button.style.top=y+'px';
    }
    place('upper',view.w/2,top,rowWidth);
    ['shower','majlis'].forEach(function(key,i){
      place(key,view.w/2+(i?1:-1)*columnOffset,bottom,rowWidth);
    });
    [
      {keys:['ground','play','pool'],x:left,start:.24},
      {keys:['groundBath','kitchen','dining','living'],x:right,start:.12}
    ].forEach(function(side){
      var first=Math.max(64,view.imageY+view.imageSize*side.start);
      var step=Math.max(44,view.imageSize*.16);
      var last=Math.min(view.h-66,first+step*(side.keys.length-1));
      step=(last-first)/(side.keys.length-1);
      side.keys.forEach(function(key,i){place(key,side.x,first+i*step,rail);});
    });
  }
  function drawLeaders(){
    if(!dialog.open)return;
    var stage=dialog.querySelector('.cm-map-side').getBoundingClientRect(),vp=viewport.getBoundingClientRect();
    var svg=dialog.querySelector('.cm-leaders');svg.setAttribute('viewBox','0 0 '+stage.width+' '+stage.height);
    rooms.forEach(function(room,i){
      var g=leaders[i],line=g.querySelector('path'),dot=g.querySelector('circle'),point=leaderPoints[room.key];
      var x=vp.left-stage.left+view.imageX+view.imageSize*point[0]/100;
      var y=vp.top-stage.top+view.imageY+view.imageSize*point[1]/100;
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);
      var rect=markers[i].getBoundingClientRect(),side=labelSides[room.key],top=side==='top',bottom=side==='bottom',vertical=top||bottom;
      var sx=vertical?rect.left+rect.width/2-stage.left:(side==='left'?rect.right:rect.left)-stage.left;
      var sy=(top?rect.bottom:bottom?rect.top:rect.top+rect.height/2)-stage.top;
      var bend=vertical?Math.min(18,Math.abs(y-sy)/3):Math.min(24,Math.abs(x-sx)/3);
      var direction=bottom?-1:1;
      var curve=vertical?'C '+sx+' '+(sy+direction*bend)+' '+x+' '+(y-direction*bend)+' '+x+' '+y
        :'C '+(sx+(side==='left'?bend:-bend))+' '+sy+' '+(x+(side==='left'?-bend:bend))+' '+y+' '+x+' '+y;
      line.setAttribute('d','M '+sx+' '+sy+' '+curve);
    });
  }
  function measure(){
    if(!dialog.open)return;
    view.w=viewport.clientWidth;view.h=viewport.clientHeight;
    var mobile=isMobile(),rail=labelRail(),top=mobile?50:60,bottom=mobile?50:54;
    var available=Math.min((view.w-2*rail-24)/.94,(view.h-top-bottom)/.865);
    view.imageSize=Math.max(1,mobile?available:Math.min(740,available*.86));
    view.imageX=view.w/2-view.imageSize*.52;
    view.imageY=top+Math.max(0,(view.h-top-bottom-view.imageSize*.865)/2)-view.imageSize*.045;
    plane.style.width=view.w+'px';plane.style.height=view.h+'px';
    plane.querySelector('.cm-illustration').style.cssText='left:'+view.imageX+'px;top:'+view.imageY+'px;width:'+view.imageSize+'px;height:'+view.imageSize+'px';
    layoutLabels();queueLines();
  }
  function dismiss(){document.dispatchEvent(new CustomEvent('fd-chalet-map-dismiss'));}
  function create(){
    dialog=document.createElement('dialog');dialog.id='fd-chalet-map';dialog.className='cm-dialog';dialog.setAttribute('aria-labelledby','cm-title');
    dialog.innerHTML='<header class="cm-header"><div class="cm-heading"><button type="button" class="cm-close" autofocus></button><div class="cm-heading-copy"><h2 id="cm-title">جولة داخل الشاليه</h2><p class="cm-subtitle"></p></div></div><div class="cm-languages" role="group" aria-label="لغة الجولة"><button type="button" class="cm-language" data-lang="ar" lang="ar" aria-label="العربية" aria-pressed="true">AR</button><button type="button" class="cm-language" data-lang="en" lang="en" aria-label="English" aria-pressed="false">EN</button></div></header>'
      +'<div class="cm-workspace"><div class="cm-map-side"><div class="cm-labels" role="group"></div><div class="cm-viewport"><div class="cm-plane"><div class="cm-illustration"><img class="cm-image" width="1254" height="1254" alt="" draggable="false"><svg class="cm-regions" viewBox="0 0 100 100" aria-hidden="true"></svg></div></div><div class="cm-error" hidden><p></p><button type="button" class="cm-retry"></button></div></div><svg class="cm-leaders" aria-hidden="true"></svg></div><aside class="cm-panel"><section id="cm-details" class="cm-details" aria-live="polite" aria-atomic="true"></section><p class="cm-occupancy"></p></aside></div><p class="cm-announcement" role="status" aria-live="polite"></p>';
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

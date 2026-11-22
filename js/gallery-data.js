
const IMG=["imgs/img04.webp","imgs/img05.webp","imgs/img06.webp","imgs/img07.webp","imgs/img08.webp","imgs/img09.webp",
  "imgs/img10.webp",
  "imgs/img11.webp",
  "imgs/img12.webp",
  "imgs/img13.webp",
  "imgs/img14.webp",
  "imgs/img15.webp",
  "imgs/img16.webp",
  "imgs/img17.webp",
  "imgs/img18.webp",
  "imgs/img19.webp",
  "imgs/img20.webp",
  "imgs/img21.webp",
  "imgs/img22.webp"];
const GALLERY={1:[
    "imgs/dome_1.webp",
    "imgs/dome_2.webp",
    "imgs/dome_3.webp",
    "imgs/dome_4.webp",
    "imgs/dome_5.webp",
    "imgs/dome_6.webp",
    "imgs/dome_7.webp",
    "imgs/dome_8.webp",
  ],
  2:[
    "imgs/harami_1.webp",
    "imgs/harami_2.webp",
    "imgs/harami_3.webp",
    "imgs/harami_4.webp",
    "imgs/harami_5.webp",
    "imgs/harami_6.webp",
    "imgs/harami_7.webp",
    "imgs/harami_8.webp",
  ],
  3:[
    "imgs/classic_1.webp",
    "imgs/classic_2.webp",
    "imgs/classic_3.webp",
    "imgs/classic_4.webp",
    "imgs/classic_5.webp",
    "imgs/classic_6.webp",
    "imgs/classic_7.webp",
    "imgs/classic_8.webp",
  ],
  4:[
    "imgs/greek_1.webp",
    "imgs/greek_2.webp",
    "imgs/greek_3.webp",
    "imgs/greek_4.webp",
    "imgs/greek_5.webp",
    "imgs/greek_6.webp",
    "imgs/greek_7.webp",
    "imgs/greek_8.webp",
    "imgs/greek_9.webp",
  ],
  5:[
    "imgs/palm_1.webp",
    "imgs/palm_2.webp",
    "imgs/palm_3.webp",
    "imgs/palm_4.webp",
    "imgs/palm_5.webp",
    "imgs/palm_6.webp",
    "imgs/palm_7.webp",
    "imgs/palm_8.webp",
    "imgs/palm_9.webp",
  ],
  6:[
    "imgs/boho_1.webp",
    "imgs/boho_2.webp",
    "imgs/boho_3.webp",
    "imgs/boho_4.webp",
    "imgs/boho_5.webp",
    "imgs/boho_6.webp",
    "imgs/boho_7.webp",
    "imgs/boho_8.webp",
    "imgs/boho_9.webp",
  ],
  7:[
    "imgs/french_1.webp",
    "imgs/french_2.webp",
    "imgs/french_3.webp",
    "imgs/french_4.webp",
    "imgs/french_5.webp",
    "imgs/french_6.webp",
    "imgs/french_7.webp",
    "imgs/french_8.webp",
    "imgs/french_9.webp",
  ],
  8:[
    "imgs/rural_1.webp",
    "imgs/rural_2.webp",
    "imgs/rural_3.webp",
    "imgs/rural_4.webp",
    "imgs/rural_5.webp",
    "imgs/rural_6.webp",
    "imgs/rural_7.webp",
    "imgs/rural_8.webp",
    "imgs/rural_9.webp",
  ],
  9:[
    "imgs/royal_1.webp",
    "imgs/royal_2.webp",
    "imgs/royal_3.webp",
    "imgs/royal_4.webp",
    "imgs/royal_5.webp",
    "imgs/royal_6.webp",
    "imgs/royal_7.webp",
    "imgs/royal_8.webp",
    "imgs/royal_9.webp",
  ],
  10:[
    "imgs/panorama_1.webp",
    "imgs/panorama_2.webp",
    "imgs/panorama_3.webp",
    "imgs/panorama_4.webp",
    "imgs/panorama_5.webp",
    "imgs/panorama_6.webp",
    "imgs/panorama_7.webp",
    "imgs/panorama_8.webp",
    "imgs/panorama_9.webp",
    "imgs/panorama_10.webp",
  ],
  11:[
    "imgs/garden_1.webp",
    "imgs/garden_2.webp",
    "imgs/garden_3.webp",
    "imgs/garden_4.webp",
    "imgs/garden_5.webp",
  ]
,
  20:["imgs/sec1_1.webp","imgs/sec1_2.webp","imgs/sec1_3.webp","imgs/sec1_4.webp","imgs/sec1_5.webp","imgs/sec1_6.webp","imgs/sec1_7.webp","imgs/sec1_8.webp","imgs/sec1_9.webp","imgs/sec1_10.webp","imgs/sec1_11.webp","imgs/sec1_12.webp"],
  21:["imgs/sec2_1.webp?v=20261002b","imgs/sec2_2.webp?v=20261002b","imgs/sec2_3-enhanced-20261122.webp?v=20261002b","imgs/sec2_4.webp?v=20261002b","imgs/sec2_5.webp?v=20261002b","imgs/sec2_6.webp?v=20261002b","imgs/sec2_7.webp?v=20261002b","imgs/sec2_8.webp?v=20261002b","imgs/sec2_9.webp?v=20261002b","imgs/sec2_10.webp?v=20261002b","imgs/sec2_11.webp?v=20261002b","imgs/sec2_12.webp?v=20261002b","imgs/sec2_13.webp?v=20261002b"]
};
// Keep the shared photo sets, with the selected cover first for each second unit.
GALLERY[12] = [GALLERY[1][5]].concat(GALLERY[1].slice(0,5),GALLERY[1].slice(6));
GALLERY[13] = [GALLERY[4][5]].concat(GALLERY[4].slice(0,5),GALLERY[4].slice(6));


// Move the selected cover only; preserve every remaining photo's relative order.
function moveGalleryCover(id,filename){
  var photos=GALLERY[id],index=photos.findIndex(function(src){return src.split('?')[0].split('/').pop()===filename;});
  if(index>0) GALLERY[id]=[photos[index]].concat(photos.slice(0,index),photos.slice(index+1));
}
moveGalleryCover(1,'dome_6.webp');
moveGalleryCover(12,'dome_7.webp');
moveGalleryCover(2,'harami_3.webp');
moveGalleryCover(3,'classic_5.webp');
moveGalleryCover(4,'greek_2.webp');
moveGalleryCover(5,'palm_3.webp');
moveGalleryCover(6,'boho_3.webp');
moveGalleryCover(9,'royal_6.webp');
moveGalleryCover(10,'panorama_2.webp');

// Photo labels are keyed by source filename, so reordering photos cannot mislabel them.
var GALLERY_LABELS = {
  1: {
    'dome_1.webp': 'الجلسة الخارجية',
    'dome_2.webp': 'الدوم والمسبح',
    'dome_3.webp': 'المسبح وكراسي التشميس',
    'dome_4.webp': 'المنطقة الخارجية والمسبح',
    'dome_5.webp': 'المسبح',
    'dome_6.webp': 'غرفة النوم والصالة',
    'dome_7.webp': 'غرفة النوم',
    'dome_8.webp': 'الحمام'
  },
  2: {
    'harami_1.webp': 'الجلسة الخارجية',
    'harami_2.webp': 'واجهة الكوخ',
    'harami_3.webp': 'المنطقة الخارجية والمسبح',
    'harami_4.webp': 'الجلسة الخارجية',
    'harami_5.webp': 'الصالة الداخلية وطاولة الطعام',
    'harami_6.webp': 'ركن المطبخ',
    'harami_7.webp': 'غرفة النوم',
    'harami_8.webp': 'الحمام'
  },
  3: {
    'classic_1.webp': 'المسبح وكراسي التشميس',
    'classic_2.webp': 'واجهة الكوخ والمسبح',
    'classic_3.webp': 'الجلسة الخارجية',
    'classic_4.webp': 'المنطقة الخارجية',
    'classic_5.webp': 'الصالة الداخلية الواسعة',
    'classic_6.webp': 'الصالة الداخلية',
    'classic_7.webp': 'غرفة النوم',
    'classic_8.webp': 'الحمام'
  },
  4: {
    'greek_1.webp': 'المسبح',
    'greek_2.webp': 'واجهة الكوخ',
    'greek_3.webp': 'واجهة الكوخ والمسبح',
    'greek_4.webp': 'المنطقة الخارجية',
    'greek_5.webp': 'الجلسة الخارجية',
    'greek_6.webp': 'الصالة الداخلية',
    'greek_7.webp': 'غرفة النوم الرئيسية',
    'greek_8.webp': 'غرفة النوم الثانية',
    'greek_9.webp': 'الحمام'
  },
  5: {
    'palm_1.webp': 'الجلسة الخارجية والمسبح',
    'palm_2.webp': 'واجهة الكوخ والمسبح',
    'palm_3.webp': 'المنطقة الخارجية والمسبح',
    'palm_4.webp': 'المنطقة الخارجية',
    'palm_5.webp': 'الأرجوحة الخارجية',
    'palm_6.webp': 'الصالة الداخلية وطاولة الطعام',
    'palm_7.webp': 'غرفة النوم الرئيسية',
    'palm_8.webp': 'غرفة النوم الثانية',
    'palm_9.webp': 'الحمام'
  },
  6: {
    'boho_1.webp': 'الجلسة الخارجية والمسبح',
    'boho_2.webp': 'واجهة الكوخ والمسبح',
    'boho_3.webp': 'المنطقة الخارجية والمسبح',
    'boho_4.webp': 'الجلسة الخارجية',
    'boho_5.webp': 'الصالة الداخلية وطاولة الطعام',
    'boho_6.webp': 'طاولة الطعام وركن المطبخ',
    'boho_7.webp': 'غرفة النوم الرئيسية',
    'boho_8.webp': 'غرفة النوم الثانية',
    'boho_9.webp': 'الحمام'
  },
  7: {
    'french_1.webp': 'واجهة الكوخ والحديقة',
    'french_2.webp': 'المنطقة الخارجية والمسبح',
    'french_3.webp': 'واجهة الكوخ',
    'french_4.webp': 'الجلسة الخارجية',
    'french_5.webp': 'الصالة الداخلية',
    'french_6.webp': 'الصالة الداخلية',
    'french_7.webp': 'غرفة النوم الرئيسية',
    'french_8.webp': 'غرفة النوم الثانية',
    'french_9.webp': 'الحمام'
  },
  8: {
    'rural_1.webp': 'واجهة الكوخ',
    'rural_2.webp': 'واجهة الكوخ والمسبح',
    'rural_3.webp': 'المنطقة الخارجية والمسبح',
    'rural_4.webp': 'الجلسة الخارجية',
    'rural_5.webp': 'الصالة الداخلية',
    'rural_6.webp': 'الصالة الداخلية',
    'rural_7.webp': 'غرفة النوم الرئيسية',
    'rural_8.webp': 'غرفة النوم الثانية',
    'rural_9.webp': 'الحمام'
  },
  9: {
    'royal_1.webp': 'الجلسة الخارجية',
    'royal_2.webp': 'واجهة الكوخ والجلسة الخارجية',
    'royal_3.webp': 'الحديقة الخاصة',
    'royal_4.webp': 'المسبح والحديقة الخاصة',
    'royal_5.webp': 'كراسي التشميس',
    'royal_6.webp': 'الصالة الداخلية الواسعة',
    'royal_7.webp': 'غرفة النوم الرئيسية',
    'royal_8.webp': 'غرفة النوم الثانية',
    'royal_9.webp': 'الحمام'
  },
  10: {
    'panorama_1.webp': 'المسبح',
    'panorama_2.webp': 'الواجهة الزجاجية والمسبح',
    'panorama_3.webp': 'الجلسة الخارجية',
    'panorama_4.webp': 'الصالة الداخلية',
    'panorama_5.webp': 'طاولة الطعام',
    'panorama_6.webp': 'ركن المطبخ',
    'panorama_7.webp': 'غرفة النوم',
    'panorama_8.webp': 'غرفة النوم والبانيو الداخلي',
    'panorama_9.webp': 'مغاسل الحمام',
    'panorama_10.webp': 'دش الحمام'
  },
  20: {
    'sec1_1.webp': 'مسبح الكبار',
    'sec1_2.webp': 'مسبح الأطفال',
    'sec1_3.webp': 'الجلسة الخارجية',
    'sec1_4.webp': 'الجلسة الخارجية',
    'sec1_5.webp': 'الجلسة الخارجية',
    'sec1_6.webp': 'المجلس الكبير',
    'sec1_7.webp': 'الصالة الداخلية',
    'sec1_8.webp': 'ركن المطبخ',
    'sec1_9.webp': 'غرفة النوم الرئيسية',
    'sec1_10.webp': 'غرفة النوم الثانية',
    'sec1_11.webp': 'المغاسل والحمامات',
    'sec1_12.webp': 'الحمام'
  },
  21: {
    'sec2_1.webp': 'المنطقة الخارجية',
    'sec2_2.webp': 'مسبح الكبار',
    'sec2_3-enhanced-20261122.webp': 'الزحليقة الهوائية الكبيرة برسوم إضافية',
    'sec2_4.webp': 'ملعب الكرة الطائرة',
    'sec2_5.webp': 'الجلسة الخارجية',
    'sec2_6.webp': 'مدخل الدور العلوي',
    'sec2_7.webp': 'المجلس الكبير',
    'sec2_8.webp': 'المجلس الكبير',
    'sec2_9.webp': 'الممر الداخلي',
    'sec2_10.webp': 'ركن المطبخ',
    'sec2_11.webp': 'المجلس وركن المطبخ',
    'sec2_12.webp': 'ركن المطبخ',
    'sec2_13.webp': 'غرفة النوم'
  }
};
function galleryPhotoLabel(sourceId, source) {
  var labels = GALLERY_LABELS[sourceId];
  var filename = String(source || '').split(/[?#]/)[0].split('/').pop();
  return labels && labels[filename] || '';
}

// The two units share source photos but retain independent gallery order.
GALLERY_LABELS[12] = GALLERY_LABELS[1];
GALLERY_LABELS[13] = GALLERY_LABELS[4];

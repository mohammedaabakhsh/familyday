// Shared service catalogue. Edit these values once for the service pages and the guide.
var _jalsatAllSessions = [
  {name:'جلسة بإطار مثلث', persons:'شخصين', personsCat:'2', price:'300 ريال', desc:'جلسة تتسع حتى شخصين تضم إطارًا مثلثًا وطاولة وكرسيين مزينة بالشموع والورود بإطلالة على المسبح والحديقة', img:'imgs/jalsat_1.webp'},
  {name:'الخيمة الهرمية', persons:'شخصين', personsCat:'2', price:'300 ريال', desc:'خيمة تتسع حتى شخصين تضم طاولة صغيرة مزينة بالشموع والورود مع فرشة أرضية ومخدات بإطلالة على المسبح والحديقة', img:'imgs/jalsat_2.webp'},
  {name:'جلسة أرضية', persons:'4 أشخاص', personsCat:'4', price:'200 ريال', desc:'جلسة تتسع حتى 4 أشخاص تضم طاولة أرضية مزينة بالشموع والورود مع فرشة أرضية ومخدات بإطلالة على المسبح والحديقة', img:'imgs/jalsat_3.webp'},
  {name:'جلسة خارجية لـ4 أشخاص', persons:'4 أشخاص', personsCat:'4', price:'300 ريال', desc:'جلسة تتسع حتى 4 أشخاص تضم إطارًا خشبيًا وطاولة أرضية مزينة بالشموع والورود مع فرشات ومخدات بإطلالة على المسبح والحديقة', img:'imgs/jalsat_4.webp'},
  {name:'جلسة خارجية لـ8 أشخاص', persons:'8 أشخاص', personsCat:'8', price:'550 ريال', desc:'جلسة تتسع حتى 8 أشخاص تضم إطارًا خشبيًا وطاولة أرضية مزينة بالشموع والورود مع فرشات ومخدات بإطلالة على المسبح والحديقة', img:'imgs/jalsat_5.webp'},
  {name:'جلسة خارجية لـ12 شخصًا', persons:'12 شخصًا', personsCat:'12', price:'650 ريال', desc:'جلسة تتسع حتى 12 شخصًا تضم إطارًا خشبيًا وطاولة أرضية مزينة بالشموع والورود مع فرشات ومخدات بإطلالة على المسبح والحديقة', img:'imgs/jalsat_6.webp'}
];

var _menuData = {
  'ساندويتشات': [
    {name:'ساندويتش دجاج زنجر',price:11,cheese:true},
    {name:'برجر لحم',price:9,cheese:true},
    {name:'برجر دجاج',price:9,cheese:true},
    {name:'ساندويتش ناجتس',price:5,cheese:true}
  ],
  'الأطباق': [
    {name:'ناجتس مع البطاطس',price:10},
    {name:'ناجتس حار مع البطاطس',price:12},
    {name:'بوب كورن دجاج مع البطاطس',price:18},
    {name:'ستربس دجاج حار مع البطاطس',price:22},
    {name:'دجاج مسحب مع البطاطس',price:22},
    {name:'فيليه دجاج مع البطاطس',price:24},
    {name:'تشيكن فرايز',price:24}
  ],
  'وجبات خفيفة': [
    {name:'بطاطس صغيرة',price:5},
    {name:'بطاطس كبيرة',price:7},
    {name:'فشار صغير',price:5},
    {name:'فشار كبير',price:12},
    {name:'جالكسي',price:7},
    {name:'تويكس',price:5},
    {name:'كيت كات',price:5},
    {name:'سنيكرز',price:5},
    {name:'باونتي',price:5}
  ],
  'بوكسات الشواء': [
    {name:'بوكس الشواء بدون فحم',desc:'مناسب لـ6 أشخاص • اختر لحم أو دجاج • خبز، جبن وصوصات',price:85,bbq:true},
    {name:'بوكس الشواء مع الفحم',desc:'مناسب لـ6 أشخاص • اختر لحم أو دجاج • خبز، جبن وصوصات',price:120,bbq:true}
  ],
  'مشروبات باردة': [
    {name:'بيبسي',price:5},
    {name:'سفن أب',price:5},
    {name:'حمضيات',price:5},
    {name:'كود رد',price:9},
    {name:'رد بول',price:15},
    {name:'بايسون',price:8},
    {name:'موسي فراولة',price:10},
    {name:'موسي شعير',price:10},
    {name:'سنتوب',price:4},
    {name:'موهيتو',price:5},
    {name:'عبوة ماء صغيرة',price:2},
    {name:'عبوة ماء كبيرة',price:3},
    {name:'كرتون ماء',price:40},
    {name:'كوبين ثلج',price:5},
    {name:'ثلج',price:7}
  ],
  'مشروبات ساخنة': [
    {name:'شاي عدني',price:8},
    {name:'كابتشينو بالبندق',price:10},
    {name:'شوكولاتة ساخنة',price:10},
    {name:'لاتيه',price:10},
    {name:'موكا',price:10},
    {name:'نسبرسو',price:10},
    {name:'قهوة تركية',price:10},
    {name:'موكاتشينو',price:10},
    {name:'دلة شاي مع البسكويت',price:15},
    {name:'دلة قهوة مع التمر',price:20}
  ]
};

var _maiyaAllGames = [
  {name:'لعبة 1', rent:'40 ريال', comp:'170 ريال', cat:'كبار', img:'imgs/maiya_1.webp'},
  {name:'لعبة 2', rent:'30 ريال', comp:'120 ريال', cat:'كبار', img:'imgs/maiya_2.webp'},
  {name:'لعبة 3', rent:'10 ريال', comp:'40 ريال', cat:'كبار', img:'imgs/maiya_3.webp'},
  {name:'لعبة 4', rent:'5 ريال', comp:'10 ريال', cat:'صغار', img:'imgs/maiya_4.webp'},
  {name:'لعبة 5', rent:'10 ريال', comp:'20 ريال', cat:'صغار', img:'imgs/maiya_5.webp'},
  {name:'لعبة 6', rent:'10 ريال', comp:'20 ريال', cat:'صغار', img:'imgs/maiya_6.webp'},
  {name:'لعبة 7', rent:'15 ريال', comp:'30 ريال', cat:'صغار', img:'imgs/maiya_7.webp'},
  {name:'لعبة 8', rent:'30 ريال', comp:'90 ريال', cat:'صغار', img:'imgs/maiya_8.webp'},
  {name:'لعبة 9', rent:'40 ريال', comp:'150 ريال', cat:'صغار', img:'imgs/maiya_9.webp'},
  {name:'لعبة 10', rent:'55 ريال', comp:'160 ريال', cat:'صغار', img:'imgs/maiya_10.webp'},
  {name:'لعبة 11', rent:'40 ريال', comp:'130 ريال', cat:'صغار', img:'imgs/maiya_11.webp'},
  {name:'لعبة 12', rent:'40 ريال', comp:'140 ريال', cat:'صغار', img:'imgs/maiya_12.webp'},
  {name:'لعبة 13', rent:'40 ريال', comp:'150 ريال', cat:'صغار', img:'imgs/maiya_13.webp'},
  {name:'لعبة 14', rent:'150 ريال', comp:'1200 ريال', cat:'عائلة', img:'imgs/maiya_14.webp'}
];

var _tawilatPrices = {
  6:  {tansiq:399,  plain:199},
  12: {tansiq:599,  plain:399},
  18: {tansiq:799,  plain:599},
  24: {tansiq:999,  plain:799},
  32: {tansiq:1199, plain:999}
};

var _tawilatTables = {6:1, 12:2, 18:3, 24:3, 32:4};

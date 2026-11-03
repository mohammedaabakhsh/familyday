// Shared service catalogue. Edit these values once for the service pages and the guide.
var _jalsatAllSessions = [
  {name:'جلسة بإطار مثلث', persons:'شخصين', personsCat:'2', price:'300 ريال', desc:'إطار مثلث مع طاولة وكرسيين، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_1.webp'},
  {name:'الخيمة الهرمية', persons:'شخصين', personsCat:'2', price:'300 ريال', desc:'خيمة مع طاولة صغيرة وفرشة أرضية ومخدات، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_2.webp'},
  {name:'جلسة أرضية', persons:'4 أشخاص', personsCat:'4', price:'200 ريال', desc:'طاولة أرضية مع فرشة ومخدات، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_3.webp'},
  {name:'جلسة خارجية لـ4 أشخاص', persons:'4 أشخاص', personsCat:'4', price:'300 ريال', desc:'إطار خشبي وطاولة أرضية مع فرشات ومخدات، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_4.webp'},
  {name:'جلسة خارجية لـ8 أشخاص', persons:'8 أشخاص', personsCat:'8', price:'550 ريال', desc:'إطار خشبي وطاولة أرضية مع فرشات ومخدات، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_5.webp'},
  {name:'جلسة خارجية لـ12 شخصًا', persons:'12 شخصًا', personsCat:'12', price:'650 ريال', desc:'إطار خشبي وطاولة أرضية مع فرشات ومخدات، بتزيين من الشموع والورود وإطلالة على المسبح والحديقة.', img:'imgs/jalsat_6.webp'}
];

var _menuData = {
  'ساندويتشات': [
    {name:'ساندويتش دجاج زنجر',price:11,cheesePrice:1},
    {name:'برجر لحم',price:9,cheesePrice:1},
    {name:'برجر دجاج',price:9,cheesePrice:1},
    {name:'ساندويتش ناجتس',price:5,cheesePrice:1}
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
    {name:'كوبان من الثلج',price:5},
    {name:'ثلج',price:7}
  ],
  'مشروبات ساخنة': [
    {name:'شاهي عدني',price:8},
    {name:'كابتشينو بالبندق',price:10},
    {name:'شوكولاتة ساخنة',price:10},
    {name:'لاتيه',price:10},
    {name:'موكا',price:10},
    {name:'نسبرسو',price:10},
    {name:'قهوة تركية',price:10},
    {name:'موكاتشينو',price:10},
    {name:'دلة شاهي مع البسكويت',price:15},
    {name:'دلة قهوة مع التمر',price:20}
  ]
};

var _tawilatPrices = {
  6:  {tansiq:399,  plain:199},
  12: {tansiq:599,  plain:399},
  18: {tansiq:799,  plain:599},
  24: {tansiq:999,  plain:799},
  32: {tansiq:1199, plain:999}
};

var _tawilatTables = {6:1, 12:2, 18:3, 24:3, 32:4};

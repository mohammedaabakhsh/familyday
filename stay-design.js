var FD_STAY_UNITS = [
    {id:20,img:0,name:"القسم الأول – الدور الأرضي",specs:["غرفتا نوم","مسبح للكبار","مسبح للأطفال"],type:"تتضمن مجلسًا كبيرًا ومسبحين خاصين",suitable:"مناسب للتجمعات الكبيرة",rooms:2,guests:25,maxGuests:70,bathroom:4,hall:true,badge:null,tags:["غرفة النوم الرئيسية بسرير مزدوج","غرفة النوم الثانية بسريرين مفردين","|","مجلس كبير","صالة داخلية","3 دورات مياه","|","ركن المطبخ","|","جلسة خارجية","شواية","حمام خارجي","|","مسبح خاص للكبار بمقاس 8 × 4 م وعمق متدرج من 1 إلى 2 م.","مسبح خاص للأطفال بمقاس 6 × 2 م وعمق 65 سم.","كراسي تشميس"],bookUrl:"https://familyday-sa.com/ar/listings/69cea5753a421f1c8de8cb43"},
    {id:21,slide:true,img:5,name:"القسم الثاني – الدور العلوي",specs:["غرفة نوم","مسبح للكبار","ملعب كرة طائرة"],type:"تتضمن مجلسًا كبيرًا ومسبحًا خاصًا وملعب كرة طائرة",suitable:"مناسب للتجمعات الكبيرة",rooms:1,guests:25,maxGuests:70,bathroom:4,hall:false,badge:null,tags:["غرفة النوم الرئيسية بـ3 أسرّة","|","مجلس كبير","3 دورات مياه","|","ركن المطبخ","|","جلسة خارجية","شواية","حمام خارجي","|","مسبح خاص للكبار بمقاس 8 × 4 م وعمق متدرج من 1 إلى 2 م.","كراسي تشميس","|","ملعب كرة طائرة"],bookUrl:"https://familyday-sa.com/ar/listings/69cea610f9674d785069b3c5"}
  ];

/* Rest-house presentation. Existing section IDs, galleries and booking destinations are retained. */
function renderStayCard(c) {
  var photos = GALLERY[c.id] || [];
  return '<div class="card-img-wrap" data-cid="' + c.id + '" data-cidx="0">'
    + '<img class="card-img" src="' + photos[0] + '" alt="' + c.name + '" loading="lazy" width="800" height="800">'
    + '</div><div class="card-body fd-cabin-card-v2-body">'
    + '<div class="fd-cabin-card-v2-heading"><div><h2 class="card-name">' + c.name + '</h2>'
    + '<p class="fd-cabin-card-v2-subtitle">مناسب للتجمعات العائلية</p></div></div>'
    + '<div class="fd-cabin-card-v2-facts" aria-label="معلومات ' + c.name + '">'
    + '<div class="fd-cabin-card-v2-fact"><span>سعة الضيوف</span><strong>' + resortGuestText(c.guests) + '</strong></div>'
    + '<div class="fd-cabin-card-v2-fact"><span>غرف النوم</span><strong>' + resortRoomText(c.rooms) + '</strong></div></div>'
    + '<button type="button" class="card-btn">عرض التفاصيل والصور</button></div>';
}

function renderStayDetail(c) {
  var groups = [], group = [];
  c.tags.forEach(function (tag) {
    if (tag === '|') { groups.push(group); group = []; }
    else group.push(tag);
  });
  if (group.length) groups.push(group);
  function features(list) {
    return list.map(function (text) {
      return '<span class="fd-cabin-feature' + (text.length > 24 ? ' fd-cabin-feature--wide' : '') + '">' + formatSpecificationText(text) + '</span>';
    }).join('');
  }
  function section(title, list, note) {
    return '<section class="fd-cabin-section"><h3>' + title + '</h3><div class="fd-cabin-feature-list">'
      + features(list) + '</div>' + (note ? '<div class="fd-cabin-instructions">' + note + '</div>' : '') + '</section>';
  }
  var indoor = groups.slice(0, 3).flat().map(function(text){return text.replace('3 دورات مياه','3 حمامات');});
  // Put rooms and seating first, then the kitchen and bathrooms.
  indoor = indoor.filter(function(text){return !/حمام|ركن المطبخ/.test(text);})
    .concat(indoor.filter(function(text){return text==='ركن المطبخ';}), indoor.filter(function(text){return /حمام/.test(text);}));
  var outdoor = groups.slice(3).flat();
  // Match the resort: seating first, pools and facilities next, barbecue last.
  function outdoorRank(text) {
    if (/^جلسة/.test(text)) return 0;
    if (/^مسبح/.test(text)) return 1;
    if (/^كراسي تشميس/.test(text)) return 2;
    if (/^ملعب/.test(text)) return 3;
    if (/^حمام/.test(text)) return 4;
    if (text === 'شواية') return 6;
    return 5;
  }
  outdoor.sort(function(a,b){return outdoorRank(a)-outdoorRank(b);});
  return '<section class="fd-cabin-content" aria-labelledby="fd-stay-detail-title">'
    + '<div class="fd-cabin-heading"><div class="fd-cabin-heading-copy"><h2 id="fd-stay-detail-title" class="fd-cabin-title">' + c.name + '</h2>'
    + '<p class="fd-cabin-occupancy">مناسب للتجمعات العائلية</p>'
    + '<div class="fd-cabin-card-v2-facts fd-cabin-detail-facts" aria-label="معلومات ' + c.name + '">'
    + '<div class="fd-cabin-card-v2-fact"><span>سعة الضيوف</span><strong>' + resortGuestText(c.guests) + '</strong></div>'
    + '<div class="fd-cabin-card-v2-fact"><span>غرف النوم</span><strong>' + resortRoomText(c.rooms) + '</strong></div></div>'
    + '<div class="fd-stay-guest-note"><div class="fd-cabin-instructions"><p>يمكن زيادة العدد إلى ' + c.maxGuests + ' ضيفًا كحد أقصى، برسوم إضافية.</p></div></div></div></div>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + section('المنطقة الداخلية', indoor)
    + '<section class="fd-cabin-section"><h3>المنطقة الخارجية</h3><div class="fd-cabin-feature-list">' + features(outdoor) + '</div></section>'
    + section('تجهيزات المطبخ', ['موقد كهربائي', 'ميكروويف', 'ثلاجة', 'غلاية'])
    + section('مميزات الإقامة', ['تلفزيون ذكي', 'سماعات داخلية (ساوند بار)'])
    + (c.slide ? '<section class="fd-cabin-addons"><h3>خدمات إضافية</h3><p>الزحليقة الهوائية الكبيرة — برسوم إضافية.</p></section>' : '')
    + '<div class="fd-cabin-faq-footer"><a class="fd-cabin-faq-link" href="/stay/faq/" onclick="return openAccommodationFaq(event,\'faq2\')">الأسئلة الشائعة <span aria-hidden="true">←</span></a></div>'
    + '</section>';
}

function renderStayComparison() {
  var available=function(c,pattern){return c.tags.some(function(t){return pattern.test(t);})?'متوفر':'غير متوفر';};
  var rows = [
    ['غرف النوم'].concat(FD_STAY_UNITS.map(function(c){return resortRoomText(c.rooms);})),
    ['الأسرّة'].concat(FD_STAY_UNITS.map(function(c){return c.tags.filter(function(t){return /^غرفة النوم/.test(t);}).map(function(t){return t.replace(/^غرفة النوم (الرئيسية|الثانية) بـ?/, '').replace('سرير مزدوج','مزدوج').replace('سريرين مفردين','مفردان');}).join(' + ');})),
    ['الحمامات'].concat(FD_STAY_UNITS.map(function(c){return String(c.bathroom);})),
    ['مجلس كبير'].concat(FD_STAY_UNITS.map(function(c){return available(c,/مجلس كبير/);})),
    ['مسبح الكبار'].concat(FD_STAY_UNITS.map(function(c){return available(c,/مسبح خاص للكبار/);})),
    ['مسبح الأطفال'].concat(FD_STAY_UNITS.map(function(c){return available(c,/مسبح خاص للأطفال/);})),
    ['ملعب كرة الطائرة'].concat(FD_STAY_UNITS.map(function(c){return available(c,/ملعب كرة طائرة/);})),
    ['الزحليقة الهوائية الكبيرة'].concat(FD_STAY_UNITS.map(function(c){return c.slide?'متاحة برسوم':'غير متاحة';}))
  ];
  return '<section class="fd-stay-comparison" aria-labelledby="fd-stay-comparison-title">'
    + '<h2 id="fd-stay-comparison-title"><button type="button" class="fd-stay-comparison-toggle" aria-expanded="false" aria-controls="fd-stay-comparison-panel" onclick="toggleStayComparison(this)"><span>قارن بين القسمين</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></h2>'
    + '<div id="fd-stay-comparison-panel" class="fd-stay-comparison-frame" hidden><table aria-labelledby="fd-stay-comparison-title">'
    + '<colgroup><col class="fd-stay-comparison-label"><col><col></colgroup>'
    + '<thead><tr><th scope="col">البند</th>'
    + '<th scope="col"><strong>القسم الأول</strong><span>الدور الأرضي</span></th>'
    + '<th scope="col"><strong>القسم الثاني</strong><span>الدور العلوي</span></th></tr></thead><tbody>'
    + rows.map(function (row) {
      return '<tr><th scope="row">' + row[0] + '</th><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>';
    }).join('') + '</tbody></table></div></section>';
}

function toggleStayComparison(button) {
  var expanded = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(expanded));
  document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
}

function resetStayFaq() {
  var overlay = document.getElementById('faq2-overlay');
  overlay.querySelectorAll('.faq-section').forEach(function (section) { section.hidden = true; });
  overlay.querySelectorAll('.faq-accordion-card').forEach(function (card) { card.classList.remove('open'); });
  overlay.querySelectorAll('[aria-expanded]').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
  selectStayFaqSection('faq-stay-booking');
  overlay.scrollTop = 0;
}

function selectStayFaqSection(id) {
  var section = document.getElementById(id);
  if (!section || section.parentElement.id !== 'faq-list-stay') return;
  var overlay = document.getElementById('faq2-overlay');
  overlay.querySelectorAll('.faq-section').forEach(function(item){ item.hidden = item !== section; });
  overlay.querySelectorAll('.faq-accordion-card.open').forEach(function(card){
    card.classList.remove('open');
    card.querySelector('.faq-question-row').setAttribute('aria-expanded','false');
  });
  overlay.querySelectorAll('.fd-faq-shortcuts button').forEach(function(button){
    button.setAttribute('aria-expanded', button.getAttribute('aria-controls') === id ? 'true' : 'false');
  });
}

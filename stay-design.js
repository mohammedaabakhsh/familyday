/* Rest-house presentation. Existing section IDs, galleries and booking destinations are retained. */
function renderStayCard(c) {
  var photos = GALLERY[c.id] || [];
  return '<div class="card-img-wrap" data-cid="' + c.id + '" data-cidx="0">'
    + '<img class="card-img" src="' + photos[0] + '" alt="' + c.name + '" loading="lazy" width="800" height="800">'
    + '</div><div class="card-body fd-cabin-card-v2-body">'
    + '<div class="fd-cabin-card-v2-heading"><div><h2 class="card-name">' + c.name + '</h2>'
    + '<p class="fd-cabin-card-v2-subtitle">مناسب للتجمعات العائلية</p></div></div>'
    + '<div class="fd-cabin-card-v2-facts" aria-label="معلومات ' + c.name + '">'
    + '<div class="fd-cabin-card-v2-fact"><span>سعة الضيوف</span><strong>حتى 25 ضيفًا</strong></div>'
    + '<div class="fd-cabin-card-v2-fact"><span>غرف النوم</span><strong>' + (c.rooms === 2 ? 'غرفتان' : 'غرفة واحدة') + '</strong></div></div>'
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
    + '<div class="fd-cabin-card-v2-fact"><span>سعة الضيوف</span><strong>حتى 25 ضيفًا</strong></div>'
    + '<div class="fd-cabin-card-v2-fact"><span>غرف النوم</span><strong>' + resortRoomText(c.rooms) + '</strong></div></div>'
    + '<div class="fd-stay-guest-note"><div class="fd-cabin-instructions"><p>يمكن زيادة العدد إلى 70 ضيفًا كحد أقصى، برسوم إضافية.</p></div></div></div></div>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + section('المنطقة الداخلية', indoor)
    + '<section class="fd-cabin-section"><h3>المنطقة الخارجية</h3><div class="fd-cabin-feature-list">' + features(outdoor) + '</div></section>'
    + section('تجهيزات المطبخ', ['موقد كهربائي', 'ميكروويف', 'ثلاجة', 'غلاية'])
    + section('مميزات الإقامة', ['تلفزيون ذكي', 'سماعات داخلية (ساوند بار)'])
    + (c.id === 21 ? '<section class="fd-cabin-addons"><h3>خدمات إضافية</h3><p>الزحليقة الهوائية الكبيرة — برسوم إضافية.</p></section>' : '')
    + '<div class="fd-cabin-faq-footer"><a class="fd-cabin-faq-link" href="/stay/faq/" onclick="return openAccommodationFaq(event,\'faq2\')">الأسئلة الشائعة <span aria-hidden="true">←</span></a></div>'
    + '</section>';
}

function renderStayComparison() {
  var rows = [
    ['غرف النوم', 'غرفتان', 'غرفة واحدة'],
    ['الأسرّة', 'سرير مزدوج وسريران مفردان', '3 أسرّة'],
    ['صالة داخلية', 'متوفرة', 'غير متوفرة'],
    ['الحمامات', '4 حمامات', '4 حمامات'],
    ['المسابح', 'مسبح للكبار ومسبح للأطفال', 'مسبح للكبار'],
    ['الزحليقة الهوائية الكبيرة', 'غير متاحة', 'متاحة برسوم إضافية'],
    ['ملعب كرة طائرة', 'غير متوفر', 'متوفر']
  ];
  return '<section class="fd-stay-comparison" aria-labelledby="fd-stay-comparison-title">'
    + '<h2 id="fd-stay-comparison-title">قارن بين القسمين</h2>'
    + '<div class="fd-stay-comparison-frame"><table aria-labelledby="fd-stay-comparison-title">'
    + '<thead><tr><th scope="col" id="fd-stay-compare-first"><strong>القسم الأول</strong><span>الدور الأرضي</span></th>'
    + '<th scope="col" id="fd-stay-compare-second"><strong>القسم الثاني</strong><span>الدور العلوي</span></th></tr></thead>'
    + rows.map(function (row, index) {
      var labelId = 'fd-stay-compare-feature-' + index;
      return '<tbody><tr><th id="' + labelId + '" colspan="2" scope="rowgroup">' + row[0] + '</th></tr>'
        + '<tr><td headers="fd-stay-compare-first ' + labelId + '">' + row[1] + '</td>'
        + '<td headers="fd-stay-compare-second ' + labelId + '">' + row[2] + '</td></tr></tbody>';
    }).join('') + '</table></div></section>';
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

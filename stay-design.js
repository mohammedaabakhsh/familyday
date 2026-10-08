/* Rest-house presentation. Existing section IDs, galleries and booking destinations are retained. */
function renderStayCard(c) {
  var photos = GALLERY[c.id] || [];
  return '<div class="card-img-wrap" data-cid="' + c.id + '" data-cidx="0">'
    + '<img class="card-img" src="' + photos[0] + '" alt="' + c.name + '" loading="lazy" width="800" height="800">'
    + '</div><div class="card-body fd-cabin-card-v2-body">'
    + '<div class="fd-cabin-card-v2-heading"><div><h2 class="card-name">' + c.name + '</h2>'
    + '<p class="fd-cabin-card-v2-subtitle">مناسب للتجمعات العائلية</p></div></div>'
    + '<div class="fd-cabin-card-v2-facts" aria-label="معلومات ' + c.name + '">'
    + '<div class="fd-cabin-card-v2-fact"><span>السعة</span><strong>حتى 25 ضيفًا</strong></div>'
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
      return '<span class="fd-cabin-feature' + (text.length > 24 ? ' fd-cabin-feature--wide' : '') + '">' + text + '</span>';
    }).join('');
  }
  function section(title, list, note) {
    return '<section class="fd-cabin-section"><h3>' + title + '</h3><div class="fd-cabin-feature-list">'
      + features(list) + '</div>' + (note ? '<div class="fd-cabin-instructions">' + note + '</div>' : '') + '</section>';
  }
  var poolNotes = '<p>يُسمح للأطفال باستخدامه تحت إشراف ذويهم.</p>';
  return '<section class="fd-cabin-content" aria-labelledby="fd-stay-detail-title">'
    + '<div class="fd-cabin-heading"><div><h2 id="fd-stay-detail-title" class="fd-cabin-title">' + c.name + '</h2>'
    + '<p class="fd-cabin-occupancy">مناسب للتجمعات العائلية – حتى 25 ضيفًا</p></div></div>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + section('المنطقة الداخلية', groups.slice(0, 3).flat().map(function(text){return text.replace('3 دورات مياه','3 حمامات');}))
    + section('المنطقة الخارجية', groups.slice(3).flat(), poolNotes)
    + section('تجهيزات المطبخ', ['موقد كهربائي', 'ثلاجة', 'ميكروويف', 'غلاية'])
    + section('مميزات الإقامة', ['تلفزيون ذكي', 'سماعات داخلية (ساوند بار)'])
    + '<div class="fd-cabin-section fd-stay-guest-note"><div class="fd-cabin-instructions"><p>يمكن زيادة إجمالي عدد الضيوف إلى 70 ضيفًا كحد أقصى، برسوم إضافية.</p></div></div>'
    + (c.id === 21 ? '<section class="fd-cabin-addons"><h3>إضافات الحجز</h3><p>الزحليقة الهوائية الكبيرة — برسوم إضافية.</p></section>' : '')
    + '</section>';
}

function renderStayComparison() {
  var rows = [
    ['غرف النوم', 'غرفتان', 'غرفة واحدة'],
    ['الأسرّة', 'سرير مزدوج وسريران مفردان', '3 أسرّة'],
    ['الحمامات', '4 حمامات', '4 حمامات'],
    ['المسابح', 'مسبح للكبار ومسبح للأطفال', 'مسبح للكبار'],
    ['الزحليقة الهوائية الكبيرة', 'غير متاحة', 'متاحة برسوم إضافية'],
    ['ملعب كرة طائرة', 'غير متوفر', 'متوفر']
  ];
  return '<section class="fd-stay-comparison" aria-labelledby="fd-stay-comparison-title">'
    + '<h2 id="fd-stay-comparison-title">قارن بين القسمين</h2>'
    + '<div class="fd-stay-comparison-frame"><table aria-labelledby="fd-stay-comparison-title">'
    + '<colgroup><col class="fd-stay-comparison-label"><col><col></colgroup>'
    + '<thead><tr><th scope="col">المرفق</th><th scope="col">القسم الأول</th><th scope="col">القسم الثاني</th></tr></thead>'
    + '<tbody>' + rows.map(function (row) {
      return '<tr><th scope="row">' + row[0] + '</th><td>' + row[1] + '</td><td>' + row[2] + '</td></tr>';
    }).join('') + '</tbody></table></div></section>';
}

function resetStayFaq() {
  var overlay = document.getElementById('faq2-overlay');
  overlay.querySelectorAll('.faq-section').forEach(function (section) { section.hidden = true; });
  overlay.querySelectorAll('.faq-accordion-card').forEach(function (card) { card.classList.remove('open'); });
  overlay.querySelectorAll('[aria-expanded]').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
  overlay.scrollTop = 0;
}

function selectStayFaqSection(id) {
  var section = document.getElementById(id);
  if (!section || section.parentElement.id !== 'faq-list-stay') return;
  var open = section.hidden;
  resetStayFaq();
  if (!open) return;
  section.hidden = false;
  document.querySelector('#faq2-overlay [aria-controls="' + id + '"]').setAttribute('aria-expanded', 'true');
}

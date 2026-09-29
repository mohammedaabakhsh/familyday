/* Standalone chalet; the legacy "chalet" route still belongs to the rest house. */
var PRIVATE_CHALET = {
  id: 30,
  name: 'شاليه يوم العائلة',
  mapUrl: 'https://maps.app.goo.gl/np6uD3XvCQTCr4ff7'
};
GALLERY[PRIVATE_CHALET.id] = Array.from({length:10}, function(_, index){
  return 'imgs/chalet_' + (index + 1) + '.webp';
});

function chaletEnquiryUrl(message){
  return 'https://wa.me/966556156693?text=' + encodeURIComponent(message || 'أرغب في الاستفسار عن حجز الشاليه والأسعار والتوفر');
}

function renderPrivateChaletDetail(){
  function section(title, items){
    return '<section class="fd-cabin-section"><h3>' + title + '</h3><div class="fd-cabin-feature-list">'
      + items.map(function(text){
        return '<span class="fd-cabin-feature' + (text.length > 24 ? ' fd-cabin-feature--wide' : '') + '">' + text + '</span>';
      }).join('')
      + '</div></section>';
  }
  return '<section class="fd-cabin-content" aria-labelledby="fd-chalet-detail-title">'
    + '<div class="fd-cabin-heading"><div><h2 id="fd-chalet-detail-title" class="fd-cabin-title">' + PRIVATE_CHALET.name + '</h2>'
    + '<p class="fd-cabin-occupancy">شاليه من دورين – حتى 15 ضيفًا</p></div></div>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + section('المنطقة الداخلية', [
      'مجلس مستقل لـ10 أشخاص مع حمام ومدخل خاص',
      'مجلس داخلي لـ15 شخصًا مع حمام ومطبخ',
      'طاولة طعام لـ8 أشخاص',
      'غرفة ألعاب للأطفال',
      'غرفة نوم بسريرين مفردين — الدور الأول',
      'غرفة نوم بسرير كبير وحمام خاص — الدور الثاني'
    ])
    + section('المنطقة الخارجية', ['مسبح أطفال بعمق 60 سم', 'ألعاب مائية'])
    + section('تجهيزات المطبخ', ['ثلاجة', 'ميكروويف', 'فرن', 'موقد كهربائي', 'موقد غاز', 'غلاية', 'أدوات مطبخ خفيفة'])
    + '</section>';
}

function openPrivateChalet(){
  document.getElementById('landing3').classList.add('hide');
  var overlay = document.getElementById('ov');
  overlay.classList.add('fd-cabin-modern','fd-stay-modern');
  closeCabinPicker();
  _navType = 'private-chalet';
  _navItems = [PRIVATE_CHALET];
  _navIdx = 0;
  updateNavUI();
  document.querySelector('.modal-back-btn').textContent = '❮ العودة إلى الشاليه';
  document.getElementById('modalBottomBar').style.display = '';
  document.getElementById('navBtns').style.display = '';
  openGalDirect(PRIVATE_CHALET);
  document.querySelectorAll('#galWrap .gal-img').forEach(function(img,index){
    img.alt = PRIVATE_CHALET.name + ' — صورة ' + (index + 1);
  });
  document.getElementById('mBody').innerHTML = renderPrivateChaletDetail();
  var book = document.getElementById('modalBookBtn');
  book.href = chaletEnquiryUrl();
  book.textContent = 'استفسر عن الحجز';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCabinDetailView();
}

(function(){
  var groups = [
    {id:'chalet-faq-booking', title:'الحجز والموقع', items:[
      {question:'أين يقع شاليه يوم العائلة؟', answer:'يمكنك مشاهدة موقع الشاليه وبدء الاتجاهات عبر خرائط Google.'
        + '<a class="fd-text-link" href="' + PRIVATE_CHALET.mapUrl + '" target="_blank" rel="noopener noreferrer">موقع الشاليه على الخريطة</a>'},
      {question:'كيف أستفسر عن الحجز والأسعار؟', answer:'تواصل معنا عبر واتساب لمعرفة التوفر والسعر في التاريخ المناسب لك.'
        + '<a class="fd-text-link" href="' + chaletEnquiryUrl() + '" target="_blank" rel="noopener noreferrer">استفسر عن الحجز</a>'},
      {question:'ما أوقات الدخول والخروج؟', answer:'الدخول الساعة 4:00 مساءً، والخروج الساعة 12:00 ظهرًا.'}
    ]},
    {id:'chalet-faq-facilities', title:'المساحات والمرافق', items:[
      {question:'كم تبلغ سعة الشاليه؟', answer:'يتسع الشاليه حتى 15 ضيفًا.'},
      {question:'كيف تتوزع غرف النوم؟', answer:'غرفتين نوم: غرفة في الدور الأول بسريرين مفردين، وغرفة في الدور الثاني بسرير كبير وحمام خاص.'},
      {question:'هل توجد غرفة ألعاب للأطفال؟', answer:'نعم، توجد غرفة ألعاب للأطفال في الدور الأول.'}
    ]},
    {id:'chalet-faq-pool-kitchen', title:'المسبح وتجهيزات المطبخ', items:[
      {question:'ما نوع المسبح وعمقه؟', answer:'يوجد مسبح أطفال بعمق 60 سم مع ألعاب مائية، وهو المسبح الوحيد في الشاليه.'},
      {question:'ما تجهيزات المطبخ؟', answer:'ثلاجة، ميكروويف، فرن، موقد كهربائي، موقد غاز، غلاية، وأدوات مطبخ خفيفة.'}
    ]}
  ];
  var panel = document.createElement('div');
  panel.id = 'chalet-faq';
  panel.className = 'hide';
  panel.setAttribute('role','region');
  panel.setAttribute('aria-labelledby','chalet-faq-title');
  panel.innerHTML = '<header class="faq-page-header"><div class="faq-heading">'
    + '<button type="button" class="faq-back" onclick="closeChaletFaq()" aria-label="العودة">'
    + '<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
    + '<h1 id="chalet-faq-title" class="faq-title">الأسئلة الشائعة</h1></div>'
    + '<nav class="fd-faq-shortcuts" aria-label="أقسام الأسئلة الشائعة">'
    + groups.map(function(group){
      return '<button type="button" aria-controls="' + group.id + '" aria-expanded="false" onclick="selectChaletFaqSection(this.getAttribute(&quot;aria-controls&quot;))">' + group.title + '</button>';
    }).join('')
    + '</nav></header><div id="chalet-faq-list">'
    + groups.map(function(group){
      return '<section id="' + group.id + '" class="chalet-faq-section" aria-labelledby="' + group.id + '-title" hidden>'
        + '<h2 id="' + group.id + '-title" class="faq-section-title">' + group.title + '</h2><div class="chalet-faq-grid">'
        + group.items.map(function(item){
          return '<details><summary><span>' + item.question + '</span><svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div class="chalet-faq-answer"><p>' + item.answer + '</p></div></details>';
        }).join('') + '</div></section>';
    }).join('')
    + '</div>';
  document.body.appendChild(panel);
})();

function resetChaletFaq(){
  var panel = document.getElementById('chalet-faq');
  panel.querySelectorAll('.chalet-faq-section').forEach(function(section){section.hidden = true;});
  panel.querySelectorAll('details').forEach(function(item){item.open = false;});
  panel.querySelectorAll('.fd-faq-shortcuts button').forEach(function(button){button.setAttribute('aria-expanded','false');});
  panel.scrollTop = 0;
}
function selectChaletFaqSection(id){
  var section = document.getElementById(id);
  if(!section || section.parentElement.id !== 'chalet-faq-list') return;
  var shouldOpen = section.hidden;
  resetChaletFaq();
  if(!shouldOpen) return;
  section.hidden = false;
  document.querySelector('#chalet-faq [aria-controls="' + id + '"]').setAttribute('aria-expanded','true');
}
function showChaletFaq(){
  resetChaletFaq();
  document.getElementById('chalet-faq').classList.remove('hide');
}
function closeChaletFaq(){
  document.getElementById('chalet-faq').classList.add('hide');
  resetChaletFaq();
}

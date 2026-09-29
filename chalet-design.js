/* Standalone chalet; the legacy "chalet" route still belongs to the rest house. */
var PRIVATE_CHALET = {
  id: 30,
  name: 'شاليه يوم العائلة',
  location: 'جدة - المروج',
  mapUrl: 'https://maps.app.goo.gl/np6uD3XvCQTCr4ff7'
};
GALLERY[PRIVATE_CHALET.id] = Array.from({length:10}, function(_, index){
  return 'imgs/chalet_' + (index + 1) + '.webp';
});

function chaletEnquiryUrl(message){
  return 'https://wa.me/966556156693?text=' + encodeURIComponent(message || 'أرغب في الاستفسار عن حجز الشاليه والأسعار والتوفر');
}

function renderPrivateChaletDetail(){
  function features(items){
    return '<div class="fd-cabin-feature-list">' + items.map(function(text){
      return '<span class="fd-cabin-feature' + (text.length > 24 ? ' fd-cabin-feature--wide' : '') + '">' + text + '</span>';
    }).join('') + '</div>';
  }
  function section(title, items){
    return '<section class="fd-cabin-section"><h3>' + title + '</h3>' + features(items) + '</section>';
  }
  function floor(title, items){
    return '<div class="fd-chalet-floor"><h4>' + title + '</h4>' + features(items) + '</div>';
  }
  return '<section class="fd-cabin-content" aria-labelledby="fd-chalet-detail-title">'
    + '<div class="fd-cabin-heading"><div><h2 id="fd-chalet-detail-title" class="fd-cabin-title">' + PRIVATE_CHALET.name + '</h2>'
    + '<p class="fd-cabin-occupancy">شاليه من دورين – حتى 15 ضيفًا</p></div></div>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + '<section class="fd-cabin-section"><h3>المنطقة الداخلية</h3>'
    + floor('الدور الأول', [
      'غرفة نوم بسريرين مفردين',
      'صالة',
      'حمام',
      'مطبخ',
      'طاولة طعام',
      'غرفة أطفال مجهزة بالألعاب'
    ])
    + floor('الدور الثاني', ['غرفة نوم بسرير مزدوج', 'حمام خاص'])
    + '</section>'
    + section('المنطقة الخارجية', [
      'مجلس مستقل يتسع لـ10 أشخاص مع حمام ومدخل خاص',
      'مسبح أطفال بعمق 60 سم مع ألعاب مائية'
    ])
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
  var contactLink = '<a class="fd-text-link" href="#contact=chalet" onclick="event.preventDefault();showContact(&quot;chalet&quot;)">عرض خيارات الحجز</a>';
  var whatsappLink = '<a class="fd-text-link" href="' + chaletEnquiryUrl() + '" target="_blank" rel="noopener noreferrer">تواصل عبر واتساب</a>';
  var groups = [
    {id:'chalet-faq-booking', title:'الحجز وأوقات الدخول', items:[
      {question:'أين يقع شاليه يوم العائلة؟', answer:'يقع شاليه يوم العائلة في ' + PRIVATE_CHALET.location + '.'
        + '<a class="fd-text-link" href="' + PRIVATE_CHALET.mapUrl + '" target="_blank" rel="noopener noreferrer">عرض الموقع على الخريطة</a>'},
      {question:'ما أوقات الدخول والخروج؟', answer:'الدخول الساعة 4:00 مساءً، والخروج الساعة 12:00 ظهرًا.'},
      {question:'كيف يمكنني الحجز؟', answer:'تواصل معنا للاستفسار عن التوفر والأسعار وإتمام حجز الشاليه.' + contactLink}
    ]},
    {id:'chalet-faq-facilities', title:'الشاليه والمرافق', items:[
      {question:'كم عدد غرف النوم في الشاليه؟', answer:'غرفتين نوم: غرفة في الدور الأول بسريرين مفردين، وغرفة في الدور الثاني بسرير مزدوج وحمام خاص.'},
      {question:'كم ضيف يستوعب الشاليه؟', answer:'يتسع الشاليه حتى 15 ضيفًا.'},
      {question:'هل توجد منطقة خارجية في الشاليه؟', answer:'يوجد في المنطقة الخارجية مجلس مستقل يتسع لـ10 أشخاص مع حمام ومدخل خاص، ومسبح أطفال بعمق 60 سم مع ألعاب مائية.'},
      {question:'ما مواصفات المسبح؟', answer:'مسبح أطفال بعمق 60 سم مع ألعاب مائية.'},
      {question:'هل توجد غرفة مخصصة للأطفال؟', answer:'نعم، توجد غرفة أطفال مجهزة بالألعاب في الدور الأول.'},
      {question:'ما تجهيزات المطبخ المتوفرة؟', answer:'ثلاجة، ميكروويف، فرن، موقد كهربائي، موقد غاز، غلاية، وأدوات مطبخ خفيفة.'}
    ]},
    {id:'chalet-faq-services', title:'الخدمات والتعليمات', items:[
      {question:'ما الخدمات الإضافية وكيف أطلبها؟', answer:'للاستفسار عن الخدمات الإضافية المتاحة للشاليه، تواصل معنا عبر واتساب.'
        + '<a class="fd-text-link" href="' + chaletEnquiryUrl('أرغب في الاستفسار عن الخدمات الإضافية المتاحة للشاليه') + '" target="_blank" rel="noopener noreferrer">استفسر عن الخدمات</a>'},
      {question:'كيف يمكنني التواصل معكم؟', answer:'يمكنك التواصل معنا عبر الاتصال أو واتساب على الرقم: <a href="tel:+966556156693" class="phone-link">0556156693</a>.' + whatsappLink}
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
        + group.items.map(function(item,index){
          return '<details><summary><span>' + (index + 1) + '. ' + item.question + '</span><svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div class="chalet-faq-answer"><p>' + item.answer + '</p></div></details>';
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

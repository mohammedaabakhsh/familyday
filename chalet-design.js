/* Standalone chalet; the legacy "chalet" route still belongs to the rest house. */
var PRIVATE_CHALET = {
  id: 30,
  name: 'شاليه يوم العائلة',
  location: 'جدة - المروج',
  bookUrl: 'https://familyday-sa.com/ar/listings/6abb996392a258b8171230a3',
  mapUrl: 'https://maps.app.goo.gl/np6uD3XvCQTCr4ff7'
};
GALLERY[PRIVATE_CHALET.id] = Array.from({length:18}, function(_, index){
  return 'imgs/chalet_' + (index + 1) + '.webp?v=20261007';
});

function chaletEnquiryUrl(message){
  return 'https://wa.me/966556156693?text=' + encodeURIComponent(message || 'أرغب في الاستفسار عن شاليه يوم العائلة');
}

function renderPrivateChaletDetail(){
  function features(items){
    return '<div class="fd-cabin-feature-list">' + items.map(function(text){
      return '<span class="fd-cabin-feature' + (text.length > 24 ? ' fd-cabin-feature--wide' : '') + '">' + text + '</span>'
        + (text === 'مسبح أطفال بعمق 60 سم مع ألعاب مائية' ? '<div class="fd-cabin-instructions fd-chalet-pool-note"><p>يُسمح للأطفال باستخدامه تحت إشراف ذويهم.</p></div>' : '');
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
    + floor('الدور الأرضي', [
      'غرفة نوم بسريرين مفردين',
      'مجلس يتسع لـ15 شخصًا',
      'حمام',
      'مطبخ',
      'طاولة طعام',
      'غرفة أطفال مجهزة بالألعاب'
    ])
    + floor('الدور العلوي', ['غرفة نوم بسرير مزدوج', 'حمام خاص'])
    + '</section>'
    + section('المنطقة الخارجية', [
      'مسبح أطفال بعمق 60 سم مع ألعاب مائية',
      'مجلس مستقل بمدخل خاص، يتسع لـ10 أشخاص، مع حمام'
    ])
    + section('تجهيزات المطبخ', ['ثلاجة', 'ميكروويف', 'فرن', 'موقد كهربائي', 'موقد غاز', 'غلاية', 'أدوات مطبخ أساسية'])
    + '<section class="fd-cabin-section"><h3>زيادة عدد الضيوف</h3><div class="fd-cabin-instructions"><p>يمكن زيادة إجمالي عدد الضيوف إلى 25 ضيفًا كحد أقصى، برسوم إضافية.</p></div></section>'
    + '<div class="fd-cabin-faq-footer"><a class="fd-cabin-faq-link" href="#chalet-faq" onclick="return openAccommodationFaq(event,\'chalet-faq\')">الأسئلة الشائعة <span aria-hidden="true">←</span></a></div>'
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
  updateCabinShareActions(PRIVATE_CHALET);
  var book = document.getElementById('modalBookBtn');
  book.href = PRIVATE_CHALET.bookUrl;
  book.textContent = 'احجز الآن';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCabinDetailView();
}

(function(){
  // Keep booking, facilities, and instructions in the same FAQ structure.
  var groups = [
    {
      "id": "chalet-faq-booking",
      "title": "الحجز وأوقات الدخول",
      "items": [
        {
          "question": "أين يقع شاليه يوم العائلة؟",
          "answer": "يقع شاليه يوم العائلة في جدة - المروج.<a class=\"fd-text-link\" href=\"https://maps.app.goo.gl/np6uD3XvCQTCr4ff7\" target=\"_blank\" rel=\"noopener noreferrer\">عرض الموقع على الخريطة</a>"
        },
        {
          "question": "ما أوقات الدخول والخروج؟",
          "answer": "الدخول الساعة 4:00 مساءً، والخروج الساعة 12:00 ظهرًا."
        },
        {
          "question": "كيف يمكنني الحجز؟",
          "answer": "يمكن الحجز مباشرة عبر الموقع الإلكتروني أو تطبيق يوم العائلة.<a class=\"fd-text-link\" href=\"#contact=chalet\" onclick=\"event.preventDefault();showContact('chalet')\">عرض خيارات الحجز</a>"
        },
        {
          "question": "ما طرق الدفع المتاحة؟",
          "answer": "تتوفر عدة طرق للدفع تشمل مدى، فيزا، Apple Pay، والتحويل البنكي، كما يمكن الدفع نقدًا أو عبر جهاز نقاط البيع في الموقع."
        },
        {
          "question": "هل يمكن تعديل أو إلغاء الحجز؟",
          "answer": "يمكن التعديل أو الإلغاء قبل موعد الوصول بثلاثة أيام أو أكثر. بعد ذلك لا يمكن التعديل أو الإلغاء، بما في ذلك بسبب الأحوال الجوية."
        },
        {
          "question": "كيف يمكنني التواصل معكم؟",
          "answer": "يمكنك التواصل معنا عبر الاتصال أو واتساب على الرقم: <a href=\"tel:+966556156693\" class=\"phone-link\">0556156693</a>، والتواصل متاح على مدار 24 ساعة."
        }
      ]
    },
    {
      "id": "chalet-faq-facilities",
      "title": "الشاليه والمرافق",
      "items": [
        {
          "question": "كم عدد الضيوف وغرف النوم في الشاليه؟",
          "answer": "يتسع الشاليه لاستقبال حتى 15 ضيفًا. ويمكن زيادة إجمالي عدد الضيوف إلى 25 ضيفًا كحد أقصى، برسوم إضافية. ويضم غرفتي نوم موزعتين على دورين: غرفة بسريرين مفردين في الدور الأرضي، وغرفة بسرير مزدوج وحمام خاص في الدور العلوي."
        },
        {
          "question": "هل يوجد مسبح في الشاليه؟",
          "answer": "نعم، يوجد مسبح للأطفال بعمق 60 سم، مع ألعاب مائية."
        },
        {
          "question": "ما المجالس المتوفرة في الشاليه؟",
          "answer": "مجلس في الدور الأرضي يتسع لـ15 شخصًا، ومجلس مستقل بمدخل خاص يتسع لـ10 أشخاص، مع حمام."
        },
        {
          "question": "هل توجد غرفة ألعاب للأطفال؟",
          "answer": "نعم، توجد غرفة أطفال مجهزة بالألعاب في الدور الأرضي."
        },
        {
          "question": "ما تجهيزات المطبخ المتوفرة؟",
          "answer": "يشمل المطبخ ثلاجة، وميكروويف، وفرنًا، وموقدًا كهربائيًا، وموقد غاز، وغلاية، وأدوات مطبخ أساسية."
        }
      ]
    },
    {
      "id": "chalet-faq-services",
      "title": "الخدمات والتعليمات",
      "items": [
        {
          "question": "هل يُسمح بإحضار سماعات خارجية؟",
          "answer": "نعم، يُسمح بإحضار سماعات خارجية للشاليه."
        },
        {
          "question": "ما تعليمات استخدام المسبح؟",
          "answer": "يُرجى الإشراف على الأطفال طوال فترة استخدام المسبح."
        }
      ]
    }
  ];
  groups[0].items[0].answer = 'يقع شاليه يوم العائلة في ' + PRIVATE_CHALET.location + '.'
    + '<a class="fd-text-link" href="' + PRIVATE_CHALET.mapUrl + '" target="_blank" rel="noopener noreferrer">عرض الموقع على الخريطة</a>';
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

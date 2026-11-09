/* Standalone chalet; the legacy "chalet" route still belongs to the rest house. */
var PRIVATE_CHALET = {
  id: 30,
  guests: 15,
  rooms: 2,
  maxGuests: 25,
  name: 'شاليه يوم العائلة',
  location: 'جدة - المروج',
  bookUrl: 'https://familyday-sa.com/ar/listings/6abb996392a258b8171230a3',
  mapUrl: 'https://maps.app.goo.gl/np6uD3XvCQTCr4ff7',
  // Shared facts; each view keeps its approved selection and presentation.
  specifications: {
    bedrooms: {main: {bed: 'سرير مزدوج'}, second: {bed: 'سريران مفردان'}},
    bedroomBathroom: 'حمام خاص داخل غرفة النوم الرئيسية',
    pool: {depthCm: 60, slide: 'زحليقة مزدوجة'},
    seating: {living: 'تتسع لـ15 شخصًا', majlis: 'يتسع لـ10 أشخاص'},
    majlisBathroom: 'حمام خاص بالمجلس المستقل',
    television: 'تلفزيون ذكي',
    kitchen: [
      {label: 'موقد كهربائي', sentence: 'موقدًا كهربائيًا', icon: 'hob'},
      {label: 'موقد غاز', sentence: 'موقد غاز', icon: 'hob'},
      {label: 'فرن', sentence: 'فرنًا', icon: 'oven'},
      {label: 'ميكروويف', sentence: 'ميكروويف', icon: 'microwave'},
      {label: 'ثلاجة', sentence: 'ثلاجة', icon: 'fridge'},
      {label: 'غلاية', sentence: 'غلاية', icon: 'kettle'},
      {label: 'أدوات مطبخ أساسية', sentence: 'أدوات مطبخ أساسية', icon: 'utensils'}
    ]
  }
};
GALLERY[PRIVATE_CHALET.id] = Array.from({length:18}, function(_, index){
  return 'imgs/chalet_' + (index + 1) + '.webp?v=20261110-natural-photos-v1';
});


function chaletBedroomDescription(key) {
  var room=PRIVATE_CHALET.specifications.bedrooms[key];
  return (key==='main'?'غرفة النوم الرئيسية':'غرفة النوم الثانية')+' ب'+room.bed.replace(/^سريران مفردان$/, 'سريرين مفردين');
}

function renderPrivateChaletDetail(){
  var specifications = PRIVATE_CHALET.specifications;
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
    + '<div class="fd-cabin-heading"><div class="fd-cabin-heading-copy"><h2 id="fd-chalet-detail-title" class="fd-cabin-title">' + PRIVATE_CHALET.name + '</h2>'
    + '<p class="fd-cabin-occupancy">شاليه من دورين</p>'
    + '<div class="fd-cabin-card-v2-facts fd-cabin-detail-facts" aria-label="معلومات الشاليه">'
    + '<div class="fd-cabin-card-v2-fact"><span>سعة الضيوف</span><strong>' + resortGuestText(PRIVATE_CHALET.guests) + '</strong></div>'
    + '<div class="fd-cabin-card-v2-fact"><span>غرف النوم</span><strong>' + resortRoomText(PRIVATE_CHALET.rooms) + '</strong></div></div>'
    + '<div class="fd-stay-guest-note"><div class="fd-cabin-instructions"><p>يمكن زيادة إجمالي عدد الضيوف إلى ' + PRIVATE_CHALET.maxGuests + ' ضيفًا كحد أقصى، برسوم إضافية.</p></div></div></div></div>'
    + '<a class="fd-pyramid-detail-tour fd-chalet-map-open" href="/chalet-map/?from=chalet-details" aria-haspopup="dialog" aria-controls="fd-chalet-map">استكشف الشاليه من الداخل <span aria-hidden="true">←</span></a>'
    + '<div class="fd-cabin-times" aria-label="أوقات الدخول والخروج"><div><span>الدخول</span><strong>4:00 مساءً</strong></div><div><span>الخروج</span><strong>12:00 ظهرًا</strong></div></div>'
    + '<section class="fd-cabin-section"><h3>المنطقة الداخلية</h3>'
    + floor('الدور الأرضي', [
      chaletBedroomDescription('second'),
      'الصالة الداخلية ' + specifications.seating.living,
      'طاولة طعام',
      'غرفة ألعاب الأطفال',
      'مطبخ',
      'حمام'
    ])
    + floor('الدور العلوي', [chaletBedroomDescription('main'), specifications.bedroomBathroom])
    + '</section>'
    + section('المجلس المستقل', [specifications.seating.majlis, 'مدخل خاص', specifications.majlisBathroom])
    + section('المنطقة الخارجية', [
      'مسبح أطفال بعمق ' + specifications.pool.depthCm + ' سم',
      specifications.pool.slide,
      'كرسي تشميس',
      'دش خارجي'
    ])
    + section('تجهيزات المطبخ', specifications.kitchen.map(function(item){return item.label;}))
    + section('مميزات الإقامة', [specifications.television])
    + '<div class="fd-cabin-faq-footer"><a class="fd-cabin-faq-link" href="/chalet/faq/" onclick="return openAccommodationFaq(event,\'chalet-faq\')">الأسئلة الشائعة <span aria-hidden="true">←</span></a></div>'
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
  book.textContent = 'الأسعار والتوفر';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCabinDetailView();
}

(function(){
  // Keep booking, facilities, and instructions in the same FAQ structure.
  var specifications = PRIVATE_CHALET.specifications;
  var faqKitchen = specifications.kitchen.filter(function(item){return item.label==='ثلاجة';}).concat(specifications.kitchen.filter(function(item){return item.label!=='ثلاجة';}));
  var groups = [
    {
      "id": "chalet-faq-booking",
      "title": "الحجز وأوقات الدخول",
      "items": [
        {
          "question": "أين يقع شاليه يوم العائلة؟",
          "answer": "يقع شاليه يوم العائلة في " + PRIVATE_CHALET.location.replace(" - "," – ") + "." + "<a class=\"fd-text-link\" href=\"" + PRIVATE_CHALET.mapUrl + "\" target=\"_blank\" rel=\"noopener noreferrer\">موقع الشاليه</a>"
        },
        {
          "question": "ما أوقات الدخول والخروج؟",
          "answer": "وقت الدخول: 4:00 مساءً<br>وقت الخروج: 12:00 ظهرًا"
        },
        {
          "question": "كيف يمكنني الحجز؟",
          "answer": "يمكنك الحجز عبر الموقع الإلكتروني أو تطبيق يوم العائلة.<a class=\"fd-text-link\" href=\"/chalet/contact/\" onclick=\"event.preventDefault();showContact('chalet')\">خيارات الحجز</a>"
        },
        {
          "question": "ما طرق الدفع المتاحة؟",
          "answer": "مدى، فيزا، Apple Pay، والتحويل البنكي. ويمكن الدفع في الموقع نقدًا أو عبر جهاز نقاط البيع."
        },
        {
          "question": "هل يمكن تعديل أو إلغاء الحجز؟",
          "answer": "يمكن تعديل الحجز أو إلغاؤه قبل موعد الوصول بثلاثة أيام أو أكثر. بعد ذلك، لا يمكن التعديل أو الإلغاء، بما في ذلك بسبب الأحوال الجوية."
        },
        {
          "question": "كيف يمكنني التواصل معكم؟",
          "answer": "يمكنك الاتصال أو التواصل عبر واتساب على الرقم <a href=\"tel:+966556156693\" class=\"phone-link\">0556156693</a>، على مدار الساعة."
        }
      ]
    },
    {
      "id": "chalet-faq-facilities",
      "title": "المرافق والخدمات",
      "items": [
        {
          "question": "كم عدد الضيوف في الشاليه؟",
          "answer": "يتسع الشاليه " + resortGuestText(PRIVATE_CHALET.guests) + "، ويمكن زيادة العدد إلى " + PRIVATE_CHALET.maxGuests + " ضيفًا كحد أقصى برسوم إضافية."
        },
        {
          "question": "كم عدد غرف النوم في الشاليه؟",
          "answer": "يضم الشاليه " + (PRIVATE_CHALET.rooms===2?"غرفتي نوم":PRIVATE_CHALET.rooms+" غرف نوم") + ":<br>الدور الأرضي: غرفة نوم ب" + specifications.bedrooms.second.bed.replace(/^سريران مفردان$/, "سريرين مفردين") + ".<br>الدور العلوي: " + chaletBedroomDescription("main") + " و" + specifications.bedroomBathroom.replace("داخل غرفة النوم الرئيسية","داخل الغرفة") + "."
        },
        {
          "question": "هل يوجد مسبح في الشاليه؟",
          "answer": "نعم، يتوفر مسبح للأطفال بعمق " + specifications.pool.depthCm + " سم مع " + specifications.pool.slide + "."
        },
        {
          "question": "هل يوجد مجلس مستقل في الشاليه؟",
          "answer": "نعم، يوجد مجلس مستقل " + specifications.seating.majlis + "، بمدخل خاص و" + specifications.majlisBathroom.replace(" بالمجلس المستقل", "") + "."
        },
        {
          "question": "هل توجد غرفة ألعاب للأطفال؟",
          "answer": "نعم، توجد غرفة مجهزة بألعاب للأطفال في الدور الأرضي."
        },
        {
          "question": "ما تجهيزات المطبخ المتوفرة؟",
          "answer": "يتوفر مطبخ يضم " + faqKitchen.map(function(item){return item.sentence;}).join("، و") + "."
        },
        {
          "question": "كيف أستكشف الشاليه من الداخل؟",
          "answer": "تعرّف على غرف الشاليه ومرافقه من خلال الخريطة التفاعلية.<a class=\"fd-text-link fd-chalet-map-open\" href=\"/chalet-map/\">استكشف الشاليه من الداخل</a>"
        },
        {
          "question": "أين أجد صور الشاليه ومواصفاته؟",
          "answer": "يمكنك الاطّلاع على صور الشاليه ومرافقه وتجهيزاته من صفحة التفاصيل.<a class=\"fd-text-link\" href=\"/chalet/details/\" onclick=\"event.preventDefault();openPrivateChalet()\">عرض التفاصيل والصور</a>"
        }
      ]
    },
    {
      "id": "chalet-faq-services",
      "title": "التعليمات",
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
  var panel = document.createElement('div');
  panel.id = 'chalet-faq';
  panel.className = 'hide';
  panel.setAttribute('role','region');
  panel.setAttribute('aria-labelledby','chalet-faq-title');
  panel.innerHTML = '<header class="faq-page-header"><div class="faq-heading">'
    + '<button type="button" class="faq-back" onclick="closeChaletFaq()" aria-label="العودة">'
    + '<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
    + '<div class="fd-page-heading-copy"><h1 id="chalet-faq-title" class="faq-title">الأسئلة الشائعة</h1><p class="fd-venue-subtitle">شاليه يوم العائلة</p></div></div>'
    + '<nav class="fd-faq-shortcuts" aria-label="أقسام الأسئلة الشائعة">'
    + groups.map(function(group,index){
      return '<button type="button" aria-controls="' + group.id + '" aria-expanded="false" onclick="selectChaletFaqSection(this.getAttribute(&quot;aria-controls&quot;))">' + ['الحجز','المرافق والخدمات','التعليمات'][index] + '</button>';
    }).join('')
    + '</nav></header><div id="chalet-faq-list">'
    + groups.map(function(group){
      return '<section id="' + group.id + '" class="chalet-faq-section" aria-labelledby="' + group.id + '-title" hidden>'
        + '<h2 id="' + group.id + '-title" class="faq-section-title">' + group.title + '</h2><div class="chalet-faq-grid">'
        + group.items.map(function(item,index){
          return '<details name="chalet-faq-answer"><summary><span>' + item.question + '</span><span class="faq-chevron" aria-hidden="true"></span></summary><div class="chalet-faq-answer"><p>' + item.answer + '</p></div></details>';
        }).join('') + '</div></section>';
    }).join('')
    + '</div>';
  panel.querySelectorAll('details').forEach(function(item){
    item.addEventListener('toggle',function(){
      if(item.open) panel.querySelectorAll('details[open]').forEach(function(other){
        if(other !== item) other.open = false;
      });
    });
  });
  document.body.appendChild(panel);
})();

function resetChaletFaq(){
  var panel = document.getElementById('chalet-faq');
  panel.querySelectorAll('.chalet-faq-section').forEach(function(section){section.hidden = true;});
  panel.querySelectorAll('details').forEach(function(item){item.open = false;});
  panel.querySelectorAll('.fd-faq-shortcuts button').forEach(function(button){button.setAttribute('aria-expanded','false');});
  selectChaletFaqSection('chalet-faq-booking');
  panel.scrollTop = 0;
}
function selectChaletFaqSection(id){
  var section = document.getElementById(id);
  if(!section || section.parentElement.id !== 'chalet-faq-list') return;
  var panel = document.getElementById('chalet-faq');
  panel.querySelectorAll('.chalet-faq-section').forEach(function(item){item.hidden = item !== section;});
  panel.querySelectorAll('details').forEach(function(item){item.open = false;});
  panel.querySelectorAll('.fd-faq-shortcuts button').forEach(function(button){
    button.setAttribute('aria-expanded',button.getAttribute('aria-controls') === id ? 'true' : 'false');
  });
}
function showChaletFaq(){
  resetChaletFaq();
  document.getElementById('chalet-faq').classList.remove('hide');
}
function closeChaletFaq(){
  document.getElementById('chalet-faq').classList.add('hide');
  resetChaletFaq();
}



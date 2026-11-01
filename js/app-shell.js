


function showFaq2(){
  initStayFaqAccordion();
  resetStayFaq();
  document.getElementById('faq2-overlay').classList.remove('hide');

}
function closeFaq2(){
  document.getElementById('faq2-overlay').classList.add('hide');
  resetStayFaq();

}

function toggleResortFaq(card, question){
  var isOpen = card.classList.toggle('open');
  question.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
function selectResortFaqSection(sectionId){
  var list = document.getElementById('faq-list-resort');
  var section = document.getElementById(sectionId);
  if(!list || !section || section.parentElement !== list) return;
  var shouldOpen = section.hidden;
  Array.from(list.children).forEach(function(item){
    item.hidden = !shouldOpen || item !== section;
  });
  document.querySelectorAll('#faq-overlay .fd-faq-shortcuts button').forEach(function(button){
    button.setAttribute('aria-expanded', shouldOpen && button.getAttribute('aria-controls') === sectionId ? 'true' : 'false');
  });
}
function initResortFaqAccordion(){
  var list = document.getElementById('faq-list-resort');
  if(!list) return;
  Array.from(list.querySelectorAll('.faq-grid > div')).forEach(function(card){
    if(card.classList.contains('faq-accordion-card') || card.children.length < 2) return;
    var question = card.children[0];
    var answer = card.children[1];
    if(!/^\d+\./.test(question.textContent.trim())) return;
    card.classList.add('faq-accordion-card');
    question.classList.add('faq-question-row');
    answer.classList.add('faq-answer');
    question.setAttribute('role','button');
    question.setAttribute('tabindex','0');
    question.setAttribute('aria-expanded','false');
    var arrow = document.createElement('span');
    arrow.className = 'faq-chevron';
    arrow.textContent = '⌄';
    question.appendChild(arrow);
    question.addEventListener('click',function(){ toggleResortFaq(card,question); });
    question.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        toggleResortFaq(card,question);
      }
    });
  });
}

function initStayFaqAccordion(){
  var list = document.getElementById('faq-list-stay');
  if(!list) return;
  Array.from(list.querySelectorAll('.faq-grid > div')).forEach(function(card){
    if(card.classList.contains('faq-accordion-card') || card.children.length < 2) return;
    var question = card.children[0];
    var answer = card.children[1];
    if(!/^\d+\./.test(question.textContent.trim())) return;
    card.classList.add('faq-accordion-card');
    question.classList.add('faq-question-row');
    answer.classList.add('faq-answer');
    question.setAttribute('role','button');
    question.setAttribute('tabindex','0');
    question.setAttribute('aria-expanded','false');
    var arrow = document.createElement('span');
    arrow.className = 'faq-chevron';
    arrow.textContent = '⌄';
    question.appendChild(arrow);
    question.addEventListener('click',function(){ toggleResortFaq(card,question); });
    question.addEventListener('keydown',function(event){
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        toggleResortFaq(card,question);
      }
    });
  });
}

function resetResortFaq(){
  var overlay = document.getElementById('faq-overlay');
  overlay.querySelectorAll('.faq-section').forEach(function(section){
    section.hidden = true;
  });
  overlay.querySelectorAll('.faq-accordion-card.open').forEach(function(card){
    card.classList.remove('open');
  });
  overlay.querySelectorAll('.fd-faq-shortcuts button, .faq-question-row').forEach(function(button){
    button.setAttribute('aria-expanded','false');
  });
  overlay.scrollTop = 0;
}
function showFaq(){
  initResortFaqAccordion();
  document.getElementById('faq-overlay').classList.remove('hide');
  resetResortFaq();
}
function closeFaq(){
  document.getElementById('faq-overlay').classList.add('hide');
  resetResortFaq();
}

function showContact(type){
  type = type || 'resort';
  document.getElementById('fd-contact-venue').textContent = type==='chalet'?'شاليه يوم العائلة':type==='stay'?'استراحة يوم العائلة':'منتجع يوم العائلة';
  var mapLink = type === 'stay'
    ? 'https://maps.app.goo.gl/i7BhZbfkRLyV68eFA?g_st=ic'
    : 'https://maps.app.goo.gl/FLmawLadNaa3uYpJ8?g_st=ic';
  var mapName = type === 'stay' ? 'موقع الاستراحة' : 'موقع المنتجع';
  var el = document.getElementById('cp-map-link');
  var nm = document.getElementById('cp-map-name');
  if(el) el.href = mapLink;
  if(nm) nm.textContent = mapName;
  var reviewPlaceIds = {
    resort: 'ChIJkfXGX69nwRURYJSW6ifyHqY',
    stay: 'ChIJ9cqaFpNnwRURFlcvpptWW_4',
    chalet: 'ChIJBx9eaoVnwRURtljowMtrzV4'
  };
  var reviewLink = document.querySelector('#contact-page .cp-review-link');
  if(reviewLink) reviewLink.href = 'https://search.google.com/local/writereview?placeid=' + (reviewPlaceIds[type] || reviewPlaceIds.resort);
  var bookingLink = document.querySelector('#contact-page .cp-primary');
  if(bookingLink) bookingLink.href = type === 'chalet' ? PRIVATE_CHALET.bookUrl : 'https://familyday-sa.com/ar';
  var mapSubtitle = document.querySelector('#contact-page .cp-map-sub');
  if(mapSubtitle) mapSubtitle.textContent = type === 'chalet' ? PRIVATE_CHALET.location : 'جدة — خليج سلمان';
  var landing = type === 'chalet' ? 'landing3' : type === 'stay' ? 'landing2' : 'landing';
  document.getElementById(landing).classList.add('hide');
  document.getElementById('contact-page').setAttribute('data-venue', type === 'chalet' ? 'chalet' : type === 'stay' ? 'stay' : 'resort');
  if(type === 'chalet'){
    if(el) el.href = PRIVATE_CHALET.mapUrl;
    if(nm) nm.textContent = 'موقع الشاليه';
  }
  var contactBody = document.querySelector('#contact-page .cp-body');
  var locationGroup = contactBody.querySelector('.cp-location');
  contactBody.insertBefore(locationGroup, contactBody.querySelector('.cp-social'));
  document.getElementById('contact-page').classList.add('show');
  document.getElementById('contact-page').scrollTop=0;
  document.getElementById('contact-page')._fromLanding = landing;
}
function closeContact(){
  document.getElementById('contact-page').classList.remove('show');
  var landing = document.getElementById('contact-page')._fromLanding || 'landing';
  document.getElementById(landing).classList.remove('hide');
  document.getElementById(landing).scrollTop=0;
}




var _enterMainTimer;
var _mainNavigationReady = false;
var _mainEntryRequested = false;
function markMainNavigationReady(){
  _mainNavigationReady = true;
  // A direct link may already have dismissed the splash while restoring its route.
  if(_mainEntryRequested && document.getElementById('splash').style.display !== 'none') enterMain();
  _mainEntryRequested = false;
}
function enterMain(){
  // Keep the existing splash until the router can handle the first destination click.
  if(!_mainNavigationReady){ _mainEntryRequested = true; return; }
  sessionStorage.setItem('fd_visited','1');
  clearTimeout(_autoEnterTimer);
  // Hide landing immediately so it doesn't flash through fading splash
  document.getElementById('landing').classList.add('hide');
  var s = document.getElementById('splash');
  s.style.opacity = '0';
  s.style.pointerEvents = 'none';
  _enterMainTimer = setTimeout(function(){
    s.style.display = 'none';
    document.getElementById('dest').classList.remove('hide');
  }, 550);
}

// Auto-enter after 2 seconds
var _autoEnterTimer = setTimeout(function(){
  if(document.getElementById('splash') && document.getElementById('splash').style.display !== 'none'){
    enterMain();
  }
}, 2000);






var _orderItemName = '';
var _isMenuOrder = false;
var _cabinNums = {
  'البيت اليوناني 1':10,'البيت اليوناني 2':11,'كوخ بالم بيتش':12,'الكوخ الفرنسي':13,
  'الكوخ الريفي':14,'بيت الدوم 1':15,'بيت الدوم 2':16,'الكوخ الهرمي':17,
  'الكوخ الكلاسيكي':18,'كوخ رويال':19,'الكوخ البوهيمي':20,'البيت البانورامي':21
};
function updateCabinNum(){
  var villa = document.getElementById('order-villa').value;
  if(_orderResortScope && villa==='not-booked') setResortOrderError('order-time','');
  var wrap = document.getElementById('order-cabin-num-wrap');
  var numEl = document.getElementById('order-cabin-num');
  if(villa && _cabinNums[villa]){
    numEl.textContent = _cabinNums[villa];
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}
function openOrderPopup(itemName, showTime){
  FD_ORDER_DRAFTS.save();
  configureResortOrderForm();
  _orderItemName = itemName;
  document.getElementById('order-cinema-note').hidden = itemName !== 'جلسة السينما';
  document.getElementById('order-item-name').textContent = itemName;
  FD_MENU_EXPERIENCE.renderCheckout();
  document.getElementById('order-name').value = '';
  document.getElementById('order-villa').value = '';
  document.getElementById('order-notes').value = '';
  document.getElementById('order-time').value = '';
  document.getElementById('order-cabin-num-wrap').style.display = 'none';
  document.getElementById('order-cabin-num').textContent = '';
  document.getElementById('order-time-wrap').style.display = showTime ? 'block' : 'none';
  FD_ORDER_DRAFTS.restore(_orderDraftScope || itemName);
  document.getElementById('order-popup').classList.remove('hide');
}
function closeOrderPopup(){
  FD_ORDER_DRAFTS.close();
  _isMenuOrder = false;
  document.getElementById('order-popup').classList.add('hide');
}
function sendOrderWhatsapp(){
  var name = document.getElementById('order-name').value.trim();
  var villa = document.getElementById('order-villa').value.trim();
  if(_orderResortScope){ if(!validateResortOrder()) return; }
  else if(!name || !villa){ alert('يرجى إدخال اسمك واختيار الكوخ'); return; }
  var inquiryOnly=_orderResortScope && villa==='not-booked';
  if(inquiryOnly) villa='لم أحجز كوخًا بعد';
  var notes = document.getElementById('order-notes').value.trim();
  var timeVal = document.getElementById('order-time').value;
  var timeStr = '';
  if(timeVal){
    var h = parseInt(timeVal);
    var endH = h + 3;
    var fmt12 = function(n){
      var n24 = n % 24;
      var suffix = (n24 >= 6 && n24 < 12) ? 'ص' : (n24 < 6 ? 'ص' : 'م');
      var h12 = n24 === 0 ? 12 : (n24 > 12 ? n24 - 12 : n24);
      return h12 + ':00 ' + suffix;
    };
    timeStr = ' - الوقت: من ' + fmt12(h) + ' حتى ' + fmt12(endH);
  }
  var cabinNum = _cabinNums[villa] ? ' (رقم ' + _cabinNums[villa] + ')' : '';
  var msg;
  if(_isMenuOrder){
    var keys = Object.keys(_menuCart);
    var total = 0;
    var lines = ['السلام عليكم،',inquiryOnly ? 'أرغب في الاستفسار عن الطلب التالي من المطعم:' : 'أرغب في طلب الآتي من المطعم:','الاسم: '+name,'الكوخ: '+villa+cabinNum,'','الطلب:'];
    keys.forEach(function(k){
      var q = _menuCart[k].qty;
      var p = _menuCart[k].price;
      // format extras nicely
      var display = k.indexOf('|')!==-1 ? '  ↳ '+k.split('|')[0]+' × '+q : k+' × '+q;
      lines.push('• '+display+' = '+(q*p)+' ريال');
      total += q*p;
    });
    lines.push('','الإجمالي: '+total+' ريال');
    if(notes) lines.push('ملاحظات: '+notes);
    msg = lines.join('\n');
    _isMenuOrder = false;
    window.open('https://wa.me/966537006531?text=' + encodeURIComponent(msg), '_blank');
    FD_ORDER_DRAFTS.clear();
    closeOrderPopup();
    return;
  } else {
    msg = 'السلام عليكم،' + '\n' + (inquiryOnly ? 'أرغب في الاستفسار عن الخدمة التالية:' : 'أرغب في طلب الخدمة التالية:') + '\n' + 'الاسم: ' + name + '\n' + 'الكوخ: ' + villa + cabinNum + '\n' + 'الخدمة: ' + _orderItemName + (timeStr ? '\n' + timeStr.replace(' - ','') : '') + (notes ? '\n' + 'ملاحظات: ' + notes : '');
  }
  if(_orderItemName === 'جلسة السينما') msg += '\nالسعر: 150 ريال لمدة 3 ساعات\nيُؤكَّد الموعد حسب التوفر.';
  window.open('https://wa.me/966556156693?text=' + encodeURIComponent(msg), '_blank');
  FD_ORDER_DRAFTS.clear();
  closeOrderPopup();
}

var _tarfihiOpt = '';
function showTarfihi(){ openTarfihiDetail(); }
function openTarfihiDetail(){
  var panel = document.getElementById('tarfihi-detail');
  selectTarfihiOpt(_tarfihiOpt);
  panel.classList.remove('hide');
  panel.scrollTop = 0;
}
function closeTarfihiDetail(){
  if(fdReturnToGuestServices()) return;
  document.getElementById('tarfihi-detail').classList.add('hide');
}
function selectTarfihiOpt(opt){
  _tarfihiOpt = opt;
  document.querySelector('#tarfihi-detail .tg-order-button').disabled=!opt;
  ['box','table'].forEach(function(key){
    var button = document.getElementById('tarfihi-opt-'+key);
    var selected = opt===key;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('tarfihi-summary-label').textContent = opt==='box' ? 'بوكس الألعاب' : opt==='table' ? 'طاولة مع بوكس الألعاب' : 'اختر الباقة لعرض الإجمالي';
  document.getElementById('tarfihi-summary-price').textContent = opt==='box' ? '50 ريال' : opt==='table' ? '150 ريال' : '';
}
function tarfihiOrder(){
  if(!_tarfihiOpt){ alert('يرجى اختيار خيار أولاً'); return; }
  var name = _tarfihiOpt==='box' ? 'بوكس الألعاب (50 ريال)' : 'طاولة مع بوكس الألعاب (150 ريال)';
  openOrderPopup(name);
}

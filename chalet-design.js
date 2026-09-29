/* The standalone chalet is separate from the legacy "chalet" rest-house route. */
var PRIVATE_CHALET = {id:30, name:'شالية يوم العائلة'};
GALLERY[PRIVATE_CHALET.id] = Array.from({length:10}, function(_, index){
  return 'imgs/chalet_' + (index + 1) + '.webp';
});

function chaletEnquiryUrl(message){
  return 'https://wa.me/966556156693?text=' + encodeURIComponent(message || 'أرغب في الاستفسار عن حجز الشالية والأسعار والتوفر');
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
  document.querySelector('.modal-back-btn').textContent = '❮ العودة إلى الشالية';
  document.getElementById('modalBottomBar').style.display = '';
  document.getElementById('navBtns').style.display = '';
  openGalDirect(PRIVATE_CHALET);
  document.querySelectorAll('#galWrap .gal-img').forEach(function(img,index){
    img.alt = 'شالية يوم العائلة — صورة ' + (index + 1);
  });
  document.getElementById('mBody').innerHTML =
    '<section class="fd-cabin-content" aria-labelledby="fd-chalet-detail-title">'
    + '<div class="fd-cabin-heading"><div><h2 id="fd-chalet-detail-title" class="fd-cabin-title">شالية يوم العائلة</h2>'
    + '<p class="fd-cabin-occupancy">استكشف المساحات والمرافق بالصور</p></div></div>'
    + '<section class="fd-cabin-section"><h3>المنطقة الداخلية</h3><div class="fd-cabin-feature-list">'
    + '<span class="fd-cabin-feature">مجلس بإطلالة على المسبح</span><span class="fd-cabin-feature">غرفة نوم</span>'
    + '<span class="fd-cabin-feature">منطقة ألعاب أطفال</span><span class="fd-cabin-feature">جلسة تلفزيون</span></div></section>'
    + '<section class="fd-cabin-section"><h3>المنطقة الخارجية</h3><div class="fd-cabin-feature-list">'
    + '<span class="fd-cabin-feature">مسبح</span><span class="fd-cabin-feature">ألعاب مائية</span></div></section>'
    + '<section class="fd-cabin-section"><h3>صور الشالية</h3>'
    + '<button type="button" class="chalet-gallery-button" onclick="openFS(GALLERY[30],0)">عرض جميع الصور — 10 صور</button></section>'
    + '<section class="fd-cabin-section"><h3>الحجز والاستفسارات</h3>'
    + '<p class="chalet-copy">تواصل معنا لمعرفة الأسعار والتوفر والسعة وأوقات الدخول والخروج.</p></section></section>';
  var book = document.getElementById('modalBookBtn');
  book.href = chaletEnquiryUrl();
  book.textContent = 'استفسر عن الحجز';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCabinDetailView();
}

(function(){
  var panel = document.createElement('div');
  panel.id = 'chalet-faq';
  panel.className = 'hide';
  panel.setAttribute('role','region');
  panel.setAttribute('aria-labelledby','chalet-faq-title');
  panel.innerHTML = '<div class="chalet-faq-shell"><div class="chalet-faq-heading">'
    + '<button type="button" class="chalet-back" onclick="closeChaletFaq()" aria-label="العودة">'
    + '<svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
    + '<h1 id="chalet-faq-title">الأسئلة الشائعة</h1></div><div class="chalet-faq-list">'
    + '<details><summary>كيف أشاهد صور الشالية؟</summary><p>اختر «اكتشف الشالية» ثم تصفّح الصور أو اضغط «عرض جميع الصور» لتكبيرها.</p></details>'
    + '<details><summary>كيف أستفسر عن الحجز والأسعار؟</summary><p>تواصل معنا عبر واتساب للاستفسار عن التوفر والسعر في التاريخ المناسب لك.'
    + '<a href="' + chaletEnquiryUrl() + '" target="_blank" rel="noopener noreferrer">استفسر عن الحجز</a></p></details>'
    + '<details><summary>ما السعة وأوقات الدخول والخروج؟</summary><p>تواصل معنا لتأكيد السعة وأوقات الدخول والخروج قبل الحجز.'
    + '<a href="' + chaletEnquiryUrl('أرغب في معرفة سعة الشالية وأوقات الدخول والخروج') + '" target="_blank" rel="noopener noreferrer">تواصل عبر واتساب</a></p></details>'
    + '</div></div>';
  document.body.appendChild(panel);
})();

function showChaletFaq(){
  var panel = document.getElementById('chalet-faq');
  panel.querySelectorAll('details').forEach(function(item){item.open=false;});
  panel.classList.remove('hide');
  panel.scrollTop = 0;
}
function closeChaletFaq(){
  document.getElementById('chalet-faq').classList.add('hide');
}

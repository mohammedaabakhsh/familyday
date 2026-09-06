/* One cabin type, two owner-confirmed dome locations. No booking/navigation actions. */
(function () {
  'use strict';
  var launcher = document.getElementById('fd-map-launcher');
  var openButton = document.getElementById('fd-map-open');
  var filters = document.getElementById('filterSection');
  var app = document.getElementById('app');
  if (!launcher || !openButton || !filters || !app || typeof data === 'undefined') return;

  var dome = data.resort.items.find(function (item) { return item.id === 1; });
  if (!dome) return;

  // Reuse the current site data, keeping the card intentionally brief.
  var roomText = dome.rooms === 1 ? 'غرفة نوم' : dome.rooms === 2 ? 'غرفتين نوم' : dome.rooms + ' غرف نوم';
  var guestText = dome.guests === 2 ? 'لشخصين' : 'حتى ' + dome.guests + ' ضيوف';
  var poolText = dome.tags.some(function (tag) { return tag.indexOf('مسبح خاص') === 0; }) ? 'مسبح خاص' : '';
  var feature = dome.tags.find(function (tag) { return tag.indexOf('بانيو داخلي') === 0; }) || '';
  var dialog;
  var card;
  var stage;
  var image;
  var markers = [];
  var selected = null;
  var previousOverflow = '';

  function syncLauncher() {
    var sub = document.getElementById('service-sub');
    launcher.hidden = typeof curSection === 'undefined' || curSection !== 'resort' ||
      !app.classList.contains('show') || filters.style.display === 'none' ||
      (sub && !sub.classList.contains('hide'));
  }

  function hideCard() {
    if (!card) return;
    card.hidden = true;
    markers.forEach(function (marker) { marker.setAttribute('aria-expanded', 'false'); });
    selected = null;
  }

  function positionCard() {
    if (!selected || card.hidden) return;
    var size = stage.clientHeight;
    var anchor = Number(selected.dataset.mapY) * size / 100;
    card.style.top = Math.max(8, Math.min(anchor - card.offsetHeight / 2, size - card.offsetHeight - 8)) + 'px';
  }

  function selectDome(marker) {
    if (selected === marker && !card.hidden) {
      hideCard();
      return;
    }
    selected = marker;
    markers.forEach(function (item) { item.setAttribute('aria-expanded', String(item === marker)); });
    card.hidden = false;
    positionCard();
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'fd-map-dialog';
    dialog.className = 'fd-map-dialog';
    dialog.setAttribute('aria-labelledby', 'fd-map-title');
    dialog.setAttribute('aria-describedby', 'fd-map-hint');
    dialog.innerHTML =
      '<div class="fd-map-header">' +
        '<div><h2 id="fd-map-title">خريطة الأكواخ</h2>' +
        '<p id="fd-map-hint">اضغط على بيت الدوم لعرض المميزات</p></div>' +
        '<button type="button" class="fd-map-close" aria-label="إغلاق الخريطة" autofocus>×</button>' +
      '</div>' +
      '<div class="fd-map-stage">' +
        '<img class="fd-map-image" src="imgs/resort-map-v1.webp" width="1254" height="1254" alt="توزيع أكواخ المنتجع من الأعلى، ويظهر بيتا الدوم في الجانب الأيسر" decoding="async">' +
        '<button type="button" class="fd-map-hotspot fd-map-hotspot--upper" data-map-y="43.4" aria-label="بيت الدوم العلوي: عرض المميزات" aria-expanded="false" aria-controls="fd-map-card"><span></span></button>' +
        '<button type="button" class="fd-map-hotspot fd-map-hotspot--lower" data-map-y="53.6" aria-label="بيت الدوم السفلي: عرض المميزات" aria-expanded="false" aria-controls="fd-map-card"><span></span></button>' +
        '<section id="fd-map-card" class="fd-map-card" aria-label="مميزات بيت الدوم" aria-live="polite" hidden>' +
          '<div class="fd-map-card-top"><h3></h3><button type="button" class="fd-map-card-close" aria-label="إغلاق مميزات الكوخ">×</button></div>' +
          '<p class="fd-map-summary"></p><p class="fd-map-pool"></p><p class="fd-map-feature"></p>' +
        '</section>' +
      '</div><p class="fd-map-error" role="status" hidden>تعذّر تحميل الصورة. أغلق الخريطة وافتحها للمحاولة مرة أخرى.</p>';
    document.body.appendChild(dialog);
    stage = dialog.querySelector('.fd-map-stage');
    card = dialog.querySelector('.fd-map-card');
    image = dialog.querySelector('.fd-map-image');
    markers = Array.from(dialog.querySelectorAll('.fd-map-hotspot'));
    markers.forEach(function (marker) {
      marker.querySelector('span').textContent = dome.name;
      marker.addEventListener('click', function () { selectDome(marker); });
    });
    card.querySelector('h3').textContent = dome.name;
    card.querySelector('.fd-map-summary').textContent = roomText + ' · ' + guestText;
    card.querySelector('.fd-map-pool').textContent = poolText;
    card.querySelector('.fd-map-pool').hidden = !poolText;
    card.querySelector('.fd-map-feature').textContent = feature;
    card.querySelector('.fd-map-feature').hidden = !feature;
    dialog.querySelector('.fd-map-close').addEventListener('click', function () { dialog.close(); });
    card.querySelector('.fd-map-card-close').addEventListener('click', function () {
      var marker = selected;
      hideCard();
      if (marker) marker.focus();
    });
    stage.addEventListener('click', function (event) {
      if (event.target === stage || event.target === image) hideCard();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('cancel', function (event) {
      if (!card.hidden) {
        event.preventDefault();
        hideCard();
      }
    });
    dialog.addEventListener('close', function () {
      hideCard();
      document.body.style.overflow = previousOverflow;
      openButton.focus({ preventScroll: true });
    });
    image.addEventListener('error', function () {
      stage.hidden = true;
      dialog.querySelector('.fd-map-error').hidden = false;
    });
    image.addEventListener('load', function () {
      stage.hidden = false;
      dialog.querySelector('.fd-map-error').hidden = true;
      positionCard();
    });
    window.addEventListener('resize', positionCard);
  }

  openButton.addEventListener('click', function () {
    if (!dialog) createDialog();
    if (dialog.open) return;
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    if (stage.hidden) image.src = 'imgs/resort-map-v1.webp';
  });

  var observer = new MutationObserver(syncLauncher);
  observer.observe(filters, { attributes: true, attributeFilter: ['style'] });
  observer.observe(app, { attributes: true, attributeFilter: ['class'] });
  var sub = document.getElementById('service-sub');
  if (sub) observer.observe(sub, { attributes: true, attributeFilter: ['class'] });
  syncLauncher();
})();

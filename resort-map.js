/* Locations are physical instances; content is read from the live cabin data. */
(function () {
  'use strict';
  var launcher = document.getElementById('fd-map-launcher');
  var openButton = document.getElementById('fd-map-open');
  var filters = document.getElementById('filterSection');
  var app = document.getElementById('app');
  if (!launcher || !openButton || !filters || !app || typeof data === 'undefined') return;

  // Only owner-confirmed locations are plotted. Add each remaining location here after confirmation.
  var locations = [
    // Owner-confirmed plot directly above the two domes on the left.
    { key: 'pyramid', cabinId: 2, x: 25.359, y: 35.008, labelSide: 'left', labelRightX: 16,
      footprint: [[19.856, 25.518], [41.308, 25.518], [41.308, 39.394], [19.856, 39.394]] },
    { key: 'dome-upper', cabinId: 12, x: 25.598, y: 44.896, labelSide: 'left', labelRightX: 16,
      footprint: [[19.856, 40.112], [41.308, 40.112], [41.308, 50.159], [19.537, 50.159]] },
    { key: 'dome-lower', cabinId: 1, x: 25.598, y: 56.140, labelSide: 'left', labelRightX: 16,
      footprint: [[19.537, 50.957], [41.308, 50.957], [41.308, 61.643], [19.139, 61.643]] },
    // Owner's corrected aerial reference: smaller Classic above, larger Royal below.
    { key: 'classic', cabinId: 3, x: 59.091, y: 21.292, labelSide: 'right', labelLeftX: 70,
      footprint: [[42.982, 24.801], [58.293, 9.968], [67.145, 24.003], [59.490, 30.144], [60.128, 32.775], [55.582, 35.965], [47.368, 24.482]] },
    { key: 'royal', cabinId: 9, x: 67.624, y: 35.327, labelSide: 'right', labelLeftX: 76,
      footprint: [[56.300, 36.683], [60.925, 33.333], [60.207, 30.542], [67.863, 25.040], [81.260, 44.338], [68.581, 53.828]] },
    // Owner's plan confirms this bottom row from left to right.
    { key: 'bohemian', cabinId: 6, x: 24.083, y: 68.581, labelSide: 'left', labelRightX: 15,
      footprint: [[19.139, 62.520], [29.984, 62.520], [29.984, 87.719], [18.900, 87.719]] },
    { key: 'panoramic', cabinId: 10, x: 35.885, y: 68.820, labelSide: 'bottom', labelX: 35, labelY: 95,
      footprint: [[30.781, 62.600], [41.467, 62.600], [41.467, 87.719], [30.781, 87.719]] },
    { key: 'rural', cabinId: 8, x: 47.209, y: 69.059, labelSide: 'bottom', labelX: 49, labelY: 95,
      footprint: [[42.584, 64.992], [47.049, 63.876], [51.754, 64.912], [51.754, 87.719], [42.584, 87.719]] },
    { key: 'french', cabinId: 7, x: 57.257, y: 70.255, labelSide: 'bottom', labelX: 61, labelY: 95,
      footprint: [[52.632, 66.108], [57.097, 64.992], [61.962, 67.703], [61.962, 87.719], [52.632, 87.719]] },
    // Owner-confirmed right-hand row: Greek 1, Greek 2, then Palm Beach.
    { key: 'greek-one', cabinId: 4,
      x: 82.775, y: 57.576, labelSide: 'offset', labelX: 94, labelY: 76, leaderBend: [95, 70],
      footprint: [[74.801, 51.435], [82.536, 46.491], [95.774, 66.986], [88.596, 72.010]] },
    { key: 'greek-two', cabinId: 13,
      x: 75.917, y: 62.440, labelSide: 'offset', labelX: 88, labelY: 83, leaderBend: [89, 77],
      footprint: [[67.863, 57.177], [74.083, 52.233], [87.879, 72.727], [80.861, 76.954]] },
    { key: 'palm-beach', cabinId: 5, x: 68.501, y: 68.581,
      labelSide: 'offset', labelX: 80, labelY: 89, leaderBend: [82, 84],
      footprint: [[59.250, 63.238], [67.145, 57.656], [80.144, 77.592], [73.365, 82.217]] },
    // The central shared garden uses the same details as its existing site card.
    { key: 'shared-garden', cabinId: 11, kind: 'shared', x: 50.638, y: 46.013,
      labelSide: 'offset', labelX: 35, labelY: 8, leaderBend: [43, 24],
      footprint: [[43.062, 27.751], [46.890, 26.555], [66.826, 55.821], [57.097, 64.274], [43.062, 63.158]] }
  ].filter(function (location) { return data.resort.items.some(function (item) { return item.id === location.cabinId; }); });
  if (!locations.length) return;

  // The connecting door is confirmed in the site's FAQ; both positions are owner-confirmed.
  var connections = [{ cabinIds: [3, 9], description: 'يمكن ربط الكلاسيكي ورويال عبر باب داخلي بسعة تصل إلى 35 ضيفًا.' }];
  // Existing gallery photos chosen for a clear, recognizable square thumbnail.
  // Physical instances of the same cabin type share that type's gallery.
  var cardPhotos = {
    1: 'imgs/dome_2.webp',
    12: 'imgs/dome_2.webp',
    2: 'imgs/harami_2.webp',
    3: 'imgs/classic_2.webp',
    4: 'imgs/greek_3.webp',
    13: 'imgs/greek_3.webp',
    5: 'imgs/palm_2.webp',
    6: 'imgs/boho_2.webp',
    7: 'imgs/french_3.webp',
    8: 'imgs/rural_3.webp',
    9: 'imgs/royal_2.webp',
    10: 'imgs/panorama_2.webp'
  };
  var dialog, viewport, plane, card, cardPhoto, empty, image, error, connectionNote;
  var toolbar, fitButton, photoButton;
  var photoDialog, photoStage, photoImage, photoTitle, photoCounter, photoError, photoPrevious, photoNext, photoHint;
  var photoSources = [], photoIndex = 0, photoSwipe = null;
  var markers = [], highlights = [], selected = null;
  var previousOverflow = '', pointers = new Map(), gesture = null;
  var view = { width: 0, height: 0, size: 0, scale: 1, x: 0, y: 0 };
  var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
  var mapLanguage = 'ar', photoLocation = null;
  var cabinNamesEn = {
    1: { name: 'Dome House 1', label: 'Dome 1' },
    12: { name: 'Dome House 2', label: 'Dome 2' },
    2: { name: 'Pyramid Cabin', label: 'Pyramid' },
    3: { name: 'Classic Cabin', label: 'Classic' },
    4: { name: 'Greek House 1', label: 'Greek 1' },
    13: { name: 'Greek House 2', label: 'Greek 2' },
    5: { name: 'Palm Beach Cabin', label: 'Palm Beach' },
    6: { name: 'Bohemian Cabin', label: 'Bohemian' },
    7: { name: 'French Cabin', label: 'French' },
    8: { name: 'Rustic Cabin', label: 'Rustic' },
    9: { name: 'Royal Cabin', label: 'Royal' },
    10: { name: 'Panoramic House', label: 'Panoramic' },
    11: { name: 'Shared Garden', label: 'Shared Garden' }
  };
  var textEn = {
    'تجربة فريدة على شكل قبة مع بانيو داخلي وجاكوزي داخل المسبح': 'A distinctive dome design with an indoor bathtub and an in-pool Jacuzzi.',
    'تصميم هرمي بطابع خشبي مع بانيو خارجي بخصوصية كاملة': 'A pyramid design with a wood-inspired look and a fully private outdoor bathtub.',
    'يتميز بأسلوبه الحديث والكلاسيكي': 'Combines modern and classic styling.',
    'مزيج بين التراث القديم والبساطة الحديثة': 'A blend of traditional heritage and modern simplicity.',
    'طابع أفريقي يجمع بين الخشب والبامبو والقش': 'African-inspired styling with wood, bamboo and straw.',
    'طابع بوهيمي بسيط مستوحى من الطبيعة': 'Simple, nature-inspired bohemian styling.',
    'كوخ خشبي بطراز فرنسي يتميز بالأناقة والفخامة': 'An elegant, luxurious wooden cabin with French styling.',
    'صُمم على الطراز الريفي الأوروبي': 'Designed in a European country style.',
    'أجواء ريفية ومساحات واسعة لجمعات العائلة': 'A rustic setting with plenty of space for family gatherings.',
    'واجهات زجاجية بانورامية تطل على حديقتك الخاصة والمسبح': 'Panoramic windows overlooking your private garden and pool.',
    'منطقة مشتركة مجهزة للعائلات': 'A shared area with facilities for families.',
    'مثالي للأزواج': 'Ideal for couples',
    'مناسب للعائلات': 'Suitable for families',
    'مناسب للجميع': 'Suitable for everyone',
    'مسبح خاص': 'Private pool',
    'مساحة خارجية خاصة': 'Private outdoor space',
    'بانيو داخلي': 'Indoor bathtub',
    'بانيو خارجي': 'Outdoor bathtub',
    'جاكوزي داخلي': 'Indoor Jacuzzi',
    'ألعاب أطفال متنوعة': "Children's play area",
    'شاشة عرض مشتركة للأطفال': 'Shared screen for children',
    'جلسات خارجية': 'Outdoor seating',
    'يمكن ربط الكلاسيكي ورويال عبر باب داخلي بسعة تصل إلى 35 ضيفًا.': 'Classic and Royal can be connected through an internal door, with space for up to 35 guests.'
  };
  var mapCopy = {
    ar: {
      title: 'خريطة الأكواخ', hint: 'اختر الكوخ وشاهد موقعه ومميزاته',
      languageLabel: 'لغة الخريطة', languageStatus: 'تم عرض الخريطة بالعربية',
      close: 'العودة', viewport: 'خريطة تفاعلية؛ كبّر ثم اسحب للاستكشاف، أو استخدم الأسهم للتحريك',
      image: 'توزيع أكواخ المنتجع من الأعلى', error: 'تعذّر تحميل الخريطة.', retry: 'إعادة المحاولة',
      panel: 'معلومات الموقع المختار', empty: 'اختر اسم الكوخ من الخريطة', reset: 'إلغاء التكبير',
      card: 'ملخص الكوخ المختار', gardenCard: 'تفاصيل الحديقة المشتركة',
      clear: 'إلغاء اختيار الكوخ', gardenClear: 'إلغاء اختيار الحديقة',
      capacity: 'السعة', bedrooms: 'غرف النوم', location: 'الموقع', access: 'الاستخدام',
      gardenLocation: 'وسط الأكواخ', gardenAccess: 'لجميع الضيوف',
      gardenConnection: 'لكل كوخ باب داخلي يفتح مباشرة على الحديقة المشتركة',
      tour: 'جولة في كوخ الدوم', details: 'عرض التفاصيل والصور', markerAction: ': عرض المميزات',
      viewPhotos: 'عرض الصور', cabinPhotos: 'عرض صور الكوخ', viewPhotosOf: 'عرض صور ',
      photosOf: 'صور ', photoClose: 'إغلاق الصور والعودة إلى الخريطة',
      photoError: 'تعذّر تحميل الصورة.', previousPhoto: 'الصورة السابقة', nextPhoto: 'الصورة التالية',
      photoHint: 'اسحب للتنقل بين الصور', photoImage: '، الصورة ', photoOf: ' من '
    },
    en: {
      title: 'Cabin Map', hint: 'Choose a cabin to see its location and features',
      languageLabel: 'Map language', languageStatus: 'Map shown in English.',
      close: 'Back', viewport: 'Interactive map; zoom in and drag to explore, or use the arrow keys to pan.',
      image: 'An overhead view of the resort cabins', error: 'The map could not be loaded.', retry: 'Try again',
      panel: 'Selected location details', empty: 'Select a cabin name on the map', reset: 'Reset zoom',
      card: 'Selected cabin summary', gardenCard: 'Shared garden details',
      clear: 'Clear cabin selection', gardenClear: 'Clear garden selection',
      capacity: 'Capacity', bedrooms: 'Bedrooms', location: 'Location', access: 'Access',
      gardenLocation: 'Among the cabins', gardenAccess: 'All resort guests',
      gardenConnection: 'Each cabin has an internal door that opens directly onto the shared garden.',
      tour: 'Explore the Dome House', details: 'View details and photos', markerAction: ': View features',
      viewPhotos: 'View photos', cabinPhotos: 'View cabin photos', viewPhotosOf: 'View photos of ',
      photosOf: 'Photos of ', photoClose: 'Close photos and return to the map',
      photoError: 'The photo could not be loaded.', previousPhoto: 'Previous photo', nextPhoto: 'Next photo',
      photoHint: 'Swipe to browse the photos', photoImage: ', photo ', photoOf: ' of '
    }
  };

  function translateText(value) {
    return mapLanguage === 'en' && Object.prototype.hasOwnProperty.call(textEn, value) ? textEn[value] : value;
  }

  function cabinName(cabin, compact) {
    if (mapLanguage === 'en' && cabinNamesEn[cabin.id]) return cabinNamesEn[cabin.id][compact ? 'label' : 'name'];
    return compact ? cabin.name.replace(/^(?:الكوخ|كوخ|البيت|بيت)\s+/, '') : cabin.name;
  }

  function updatePhotoText() {
    if (!photoDialog) return;
    var copy = mapCopy[mapLanguage], direction = mapLanguage === 'en' ? 'ltr' : 'rtl';
    photoDialog.lang = mapLanguage;
    photoDialog.querySelector('.fd-map-photo-header').dir = direction;
    photoDialog.querySelector('.fd-map-photo-position').dir = direction;
    photoError.dir = direction;
    photoDialog.querySelector('.fd-map-photo-close').setAttribute('aria-label', copy.photoClose);
    photoError.querySelector('p').textContent = copy.photoError;
    photoDialog.querySelector('.fd-map-photo-retry').textContent = copy.retry;
    photoPrevious.setAttribute('aria-label', copy.previousPhoto);
    photoNext.setAttribute('aria-label', copy.nextPhoto);
    photoHint.textContent = copy.photoHint;
    if (photoLocation) photoTitle.textContent = copy.photosOf + cabinName(cabinFor(photoLocation));
    photoImage.alt = photoTitle.textContent + copy.photoImage + (photoIndex + 1);
    photoCounter.textContent = (photoIndex + 1) + copy.photoOf + photoSources.length;
  }

  function updateMapText() {
    var copy = mapCopy[mapLanguage], direction = mapLanguage === 'en' ? 'ltr' : 'rtl';
    dialog.lang = mapLanguage;
    dialog.querySelector('.fd-map-header').dir = direction;
    dialog.querySelector('#fd-map-title').textContent = copy.title;
    dialog.querySelector('#fd-map-hint').textContent = copy.hint;
    dialog.querySelector('.fd-map-languages').setAttribute('aria-label', copy.languageLabel);
    dialog.querySelectorAll('.fd-map-language').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === mapLanguage));
    });
    dialog.querySelector('.fd-map-close').setAttribute('aria-label', copy.close);
    viewport.setAttribute('aria-label', copy.viewport);
    image.alt = copy.image;
    error.dir = direction; error.querySelector('p').textContent = copy.error;
    dialog.querySelector('.fd-map-retry').textContent = copy.retry;
    var panel = dialog.querySelector('.fd-map-panel');
    panel.dir = direction; panel.setAttribute('aria-label', copy.panel);
    empty.querySelector('p').textContent = copy.empty;
    fitButton.setAttribute('aria-label', copy.reset);
    fitButton.querySelector('span').textContent = copy.reset;
    card.setAttribute('aria-label', copy.card);
    card.querySelector('.fd-map-clear').setAttribute('aria-label', copy.clear);
    card.querySelector('.fd-map-guest-label').textContent = copy.capacity;
    card.querySelector('.fd-map-room-label').textContent = copy.bedrooms;
    card.querySelector('.fd-map-details-button').textContent = copy.details;
    card.querySelector('.fd-map-tour-button').textContent = copy.tour;
    card.querySelector('.fd-map-photo-label').textContent = copy.viewPhotos;
    photoButton.setAttribute('aria-label', selected ? copy.viewPhotosOf + cabinName(cabinFor(selected)) : copy.cabinPhotos);
    if (selected) cardPhoto.alt = cabinName(cabinFor(selected));
    markers.forEach(function (marker, i) {
      var cabin = cabinFor(locations[i]), label = marker.querySelector('span');
      marker.setAttribute('aria-label', cabinName(cabin) + copy.markerAction);
      label.textContent = cabinName(cabin, true); label.dir = direction;
    });
    updatePhotoText();
  }

  function setMapLanguage(language) {
    if ((language !== 'ar' && language !== 'en') || language === mapLanguage) return;
    var info = dialog.querySelector('.fd-map-info'), previousScroll = info.scrollTop;
    mapLanguage = language;
    updateMapText();
    if (selected) renderSelectedLocation(selected);
    info.scrollTop = previousScroll;
    renderView();
    dialog.querySelector('.fd-map-announcement').textContent = mapCopy[mapLanguage].languageStatus;
  }

  function cabinFor(location) {
    return data.resort.items.find(function (item) { return item.id === location.cabinId; });
  }

  function syncLauncher() {
    var sub = document.getElementById('service-sub');
    launcher.hidden = typeof curSection === 'undefined' || curSection !== 'resort' ||
      !app.classList.contains('show') || filters.style.display === 'none' ||
      (sub && !sub.classList.contains('hide'));
  }

  function roomText(count) {
    if (mapLanguage === 'en') return count + (count === 1 ? ' bedroom' : ' bedrooms');
    return count === 1 ? 'غرفة نوم واحدة' : count === 2 ? 'غرفتا نوم' : count + ' غرف نوم';
  }

  function roomValue(count) {
    if (mapLanguage === 'en') return count + (count === 1 ? ' bedroom' : ' bedrooms');
    return count === 1 ? 'غرفة واحدة' : count === 2 ? 'غرفتان' : count + ' غرف';
  }

  function featuresFor(cabin) {
    // Keep the map summary focused; full amenities remain in cabin details.
    if (cabin.badge !== 'مشترك') return [];
    return cabin.tags.filter(function (tag) {
      return tag !== '|' && tag !== 'جلسات خارجية';
    }).map(translateText);
  }

  function clearSelection(restoreFocus) {
    var old = selected;
    selected = null;
    document.dispatchEvent(new CustomEvent('fd-map-selection-change',{detail:{cabinId:null}}));
    markers.forEach(function (marker) { marker.setAttribute('aria-pressed', 'false'); });
    highlights.forEach(function (highlight) { highlight.hidden = true; highlight.classList.remove('is-connected'); });
    card.hidden = true;
    empty.hidden = false;
    connectionNote.hidden = true;
    connectionNote.textContent = '';
    syncToolbar();
    if (restoreFocus && old) markers[locations.indexOf(old)].focus({ preventScroll: true });
  }

  function photosFor(cabin) {
    if (cabin.badge === 'مشترك') return [];
    var gallery = typeof GALLERY !== 'undefined' ? GALLERY[cabin.id] : null;
    return gallery && gallery.length ? gallery.slice() : cardPhotos[cabin.id] ? [cardPhotos[cabin.id]] : [];
  }

  function showCardPhoto(cabin) {
    var gallery = typeof GALLERY !== 'undefined' ? GALLERY[cabin.id] : null;
    var source = cabin.badge === 'مشترك' ? null : cardPhotos[cabin.id] || (gallery && gallery[0]);
    card.classList.toggle('has-photo', Boolean(source));
    cardPhoto.parentElement.hidden = !source;
    if (!source) return;
    photoButton.setAttribute('aria-label', mapCopy[mapLanguage].viewPhotosOf + card.querySelector('h3').textContent);
    cardPhoto.alt = cabinName(cabin);
    if (cardPhoto.getAttribute('src') !== source || !cardPhoto.naturalWidth) {
      // Never show the previous cabin's photo while the new one is loading.
      cardPhoto.classList.remove('is-ready');
      cardPhoto.src = source;
    }
    if (cardPhoto.complete && cardPhoto.naturalWidth) cardPhoto.classList.add('is-ready');
  }

  function renderPhoto() {
    if (!photoSources.length) return;
    photoSwipe = null;
    photoError.hidden = true;
    photoStage.setAttribute('aria-busy', 'true');
    photoImage.classList.remove('is-ready');
    updatePhotoText();
    photoImage.src = photoSources[photoIndex];
    photoPrevious.hidden = photoNext.hidden = photoHint.hidden = photoSources.length < 2;
    if (photoImage.complete && photoImage.naturalWidth) {
      photoImage.classList.add('is-ready');
      photoStage.setAttribute('aria-busy', 'false');
    }
    // Warm only the adjacent photos; keep the site's original gallery order.
    if (photoSources.length > 1) {
      [-1, 1].forEach(function (direction) {
        var preload = new Image();
        preload.src = photoSources[(photoIndex + direction + photoSources.length) % photoSources.length];
      });
    }
  }

  function movePhoto(direction) {
    if (photoSources.length < 2) return;
    photoIndex = (photoIndex + direction + photoSources.length) % photoSources.length;
    renderPhoto();
  }

  function createPhotoDialog() {
    photoDialog = document.createElement('dialog');
    photoDialog.id = 'fd-map-photos';
    photoDialog.className = 'fd-map-photos';
    photoDialog.setAttribute('aria-labelledby', 'fd-map-photo-title');
    photoDialog.innerHTML =
      '<div class="fd-map-photo-header"><h2 id="fd-map-photo-title"></h2>' +
        '<button type="button" class="fd-map-photo-close" aria-label="إغلاق الصور والعودة إلى الخريطة" autofocus>' + closeIcon + '</button></div>' +
      '<div class="fd-map-photo-stage"><img class="fd-map-photo-image" alt="" decoding="async" draggable="false">' +
        '<div class="fd-map-photo-error" role="status" hidden><p>تعذّر تحميل الصورة.</p><button type="button" class="fd-map-photo-retry">إعادة المحاولة</button></div></div>' +
      '<div class="fd-map-photo-footer">' +
        '<button type="button" class="fd-map-photo-previous" aria-label="الصورة السابقة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>' +
        '<div class="fd-map-photo-position"><p class="fd-map-photo-counter" role="status" aria-live="polite" aria-atomic="true"></p><p class="fd-map-photo-hint">اسحب للتنقل بين الصور</p></div>' +
        '<button type="button" class="fd-map-photo-next" aria-label="الصورة التالية"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button></div>';
    document.body.appendChild(photoDialog);
    photoStage = photoDialog.querySelector('.fd-map-photo-stage');
    photoImage = photoDialog.querySelector('.fd-map-photo-image');
    photoTitle = photoDialog.querySelector('h2');
    photoCounter = photoDialog.querySelector('.fd-map-photo-counter');
    photoError = photoDialog.querySelector('.fd-map-photo-error');
    photoPrevious = photoDialog.querySelector('.fd-map-photo-previous');
    photoNext = photoDialog.querySelector('.fd-map-photo-next');
    photoHint = photoDialog.querySelector('.fd-map-photo-hint');
    photoImage.addEventListener('load', function () {
      photoImage.classList.add('is-ready');
      photoError.hidden = true;
      photoStage.setAttribute('aria-busy', 'false');
    });
    photoImage.addEventListener('error', function () {
      photoImage.classList.remove('is-ready');
      photoError.hidden = false;
      photoStage.setAttribute('aria-busy', 'false');
    });
    photoPrevious.addEventListener('click', function () { movePhoto(-1); });
    photoNext.addEventListener('click', function () { movePhoto(1); });
    photoDialog.querySelector('.fd-map-photo-retry').addEventListener('click', renderPhoto);
    photoDialog.querySelector('.fd-map-photo-close').addEventListener('click', function () { photoDialog.close(); });
    photoDialog.addEventListener('cancel', function (event) { event.stopPropagation(); });
    photoDialog.addEventListener('close', function () {
      photoSwipe = null;
      // The map stays open, zoomed and selected beneath this native modal.
      if (dialog.open && !photoButton.hidden) photoButton.focus({ preventScroll: true });
      document.dispatchEvent(new CustomEvent('fd-map-photos-dismiss'));
    });
    photoDialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') movePhoto(1);
      else if (event.key === 'ArrowLeft') movePhoto(-1);
      else if (event.key === 'Home') { photoIndex = 0; renderPhoto(); }
      else if (event.key === 'End') { photoIndex = photoSources.length - 1; renderPhoto(); }
      else return;
      event.preventDefault();
      event.stopPropagation();
    });
    photoStage.addEventListener('pointerdown', function (event) {
      if (!event.isPrimary) { photoSwipe = null; return; }
      if (event.button !== 0 || event.target.closest('button')) return;
      photoSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
      photoStage.setPointerCapture(event.pointerId);
    });
    photoStage.addEventListener('pointerup', function (event) {
      if (!photoSwipe || photoSwipe.id !== event.pointerId) return;
      var dx = event.clientX - photoSwipe.x, dy = event.clientY - photoSwipe.y;
      photoSwipe = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) movePhoto(dx < 0 ? 1 : -1);
    });
    ['pointercancel', 'lostpointercapture'].forEach(function (type) {
      photoStage.addEventListener(type, function () { photoSwipe = null; });
    });
    updatePhotoText();
  }

  document.addEventListener('fd-map-photos-open', function (event) {
    var key = event.detail && event.detail.locationKey;
    var location = locations.find(function (item) { return item.key === key && item.kind !== 'shared'; });
    if (!location || !dialog || !dialog.open) return;
    var sources = photosFor(cabinFor(location));
    if (!sources.length) return;
    if (selected !== location) selectLocation(location);
    photoLocation = location;
    if (!photoDialog) createPhotoDialog();
    photoSources = sources;
    // Start with the thumbnail that the guest actually pressed.
    photoIndex = Math.max(0, photoSources.indexOf(cardPhoto.getAttribute('src')));
    renderPhoto();
    if (!photoDialog.open) photoDialog.showModal();
  });
  document.addEventListener('fd-map-photos-close', function () {
    if (photoDialog && photoDialog.open) photoDialog.close();
  });

  function selectLocation(location) {
    if (selected === location) { clearSelection(false); return; }
    var cabin = cabinFor(location);
    selected = location;
    // Highlight only the selected plot; the card still explains connecting cabins.
    markers.forEach(function (marker, i) {
      var active = locations[i] === location;
      marker.setAttribute('aria-pressed', String(active));
      highlights[i].hidden = !active;
    });
    renderSelectedLocation(location);
    document.dispatchEvent(new CustomEvent('fd-map-selection-change',{detail:{cabinId:cabin.id}}));
  }

  function renderSelectedLocation(location) {
    var cabin = cabinFor(location), copy = mapCopy[mapLanguage];
    var shared = location.kind === 'shared';
    var connection = connections.find(function (item) { return item.cabinIds.indexOf(cabin.id) !== -1; });
    card.classList.toggle('is-classic', cabin.id === 3);
    card.classList.toggle('is-shared', shared);
    card.querySelector('h3').textContent = cabinName(cabin);
    card.classList.remove('has-photo');
    photoButton.hidden = true;
    card.setAttribute('aria-label', shared ? copy.gardenCard : copy.card);
    card.querySelector('.fd-map-clear').setAttribute('aria-label', shared ? copy.gardenClear : copy.clear);
    var description = card.querySelector('.fd-map-description');
    var isDome = cabin.id === 1 || cabin.id === 12;
    var isGreek = cabin.id === 4 || cabin.id === 13;
    var isPalm = cabin.id === 5;
    var isBohemian = cabin.id === 6;
    var isFrench = cabin.id === 7;
    var isClassic = cabin.id === 3;
    var isRoyal = cabin.id === 9;
    var isRustic = cabin.id === 8;
    var isPanoramic = cabin.id === 10;
    var gardenTour = shared ? 'https://my.matterport.com/show/?m=S7Z2CF9tdwm' : '';
    var hasTour = !!gardenTour || isDome || cabin.id === 2 || isGreek || isPalm || isBohemian || isFrench || isClassic || isPanoramic || isRoyal || isRustic;
    description.textContent = translateText(cabin.type || cabin.suitable || '');
    var tourButton = card.querySelector('.fd-map-tour-button');
    tourButton.hidden = !hasTour;
    tourButton.href = gardenTour || (isRustic ? '/rustic-tour/' : isRoyal ? '/royal-tour/' : isPanoramic ? '/panoramic-tour/' : isClassic ? '/classic-tour/' : isFrench ? '/french-tour/' : isBohemian ? '/bohemian-tour/' : isPalm ? '/palm-tour/' : isGreek ? '/greek-tour/' : cabin.id === 2 ? '/pyramid-tour/' : '/dome-tour/') + '?from=map&cabin=' + cabin.id + '&v=map-return-20261028-v2';
    tourButton.textContent = gardenTour ? (mapLanguage === 'en' ? '3D garden tour' : 'جولة ثلاثية الأبعاد للحديقة') : isRustic ? (mapLanguage === 'en' ? 'Explore the Rustic Cottage' : 'جولة في الكوخ الريفي') : isRoyal ? (mapLanguage === 'en' ? 'Explore the Royal Cottage' : 'جولة في كوخ رويال') : isPanoramic ? (mapLanguage === 'en' ? 'Explore the Panoramic House' : 'جولة في البيت البانورامي') : isClassic ? (mapLanguage === 'en' ? 'Explore the Classic Cottage' : 'جولة في الكوخ الكلاسيكي') : isFrench ? (mapLanguage === 'en' ? 'Explore the French Cottage' : 'جولة في الكوخ الفرنسي') : isBohemian ? (mapLanguage === 'en' ? 'Explore the Bohemian Cottage' : 'جولة في الكوخ البوهيمي') : isPalm ? (mapLanguage === 'en' ? 'Explore Palm Beach Cottage' : 'جولة في كوخ بالم بيتش') : isGreek ? (mapLanguage === 'en' ? 'Explore the Greek House' : 'جولة في البيت اليوناني') : cabin.id === 2 ? (mapLanguage === 'en' ? 'Explore the Pyramid Cottage' : 'جولة في الكوخ الهرمي') : copy.tour;
    description.hidden = !description.textContent;
    card.querySelector('.fd-map-guest-label').textContent = shared ? copy.location : copy.capacity;
    card.querySelector('.fd-map-room-label').textContent = shared ? copy.access : copy.bedrooms;
    card.querySelector('.fd-map-guests').textContent = shared ? copy.gardenLocation : mapLanguage === 'en' ?
      'Up to ' + cabin.guests + (Number(cabin.guests) === 1 ? ' guest' : ' guests') : resortGuestText(cabin.guests);
    card.querySelector('.fd-map-rooms').textContent = shared ? copy.gardenAccess : roomValue(cabin.rooms);
    photoButton.setAttribute('aria-label', copy.viewPhotosOf + cabinName(cabin));
    cardPhoto.alt = cabinName(cabin);
    var amenities = card.querySelector('.fd-map-amenities');
    amenities.replaceChildren();
    featuresFor(cabin).forEach(function (feature) {
      var item = document.createElement('p');
      item.className = 'fd-map-amenity';
      item.textContent = feature;
      amenities.appendChild(item);
    });
    amenities.hidden = !amenities.children.length;
    connectionNote.textContent = shared ? copy.gardenConnection :
      connection ? translateText(connection.description) : '';
    connectionNote.hidden = !shared && !connection;
    syncToolbar();
    empty.hidden = true;
    card.hidden = false;
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function syncToolbar() {
    if (!toolbar) return;
    fitButton.hidden = view.scale <= 1.001;
    toolbar.hidden = fitButton.hidden && connectionNote.hidden;
  }

  function renderView() {
    var size = view.size * view.scale;
    view.x = size <= view.width ? (view.width - size) / 2 : clamp(view.x, view.width - size, 0);
    view.y = size <= view.height ? (view.height - size) / 2 : clamp(view.y, view.height - size, 0);
    plane.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
    plane.style.setProperty('--fd-map-inverse', String(1 / view.scale));
    markers.forEach(function (marker, i) {
      var location = locations[i];
      if (!location.labelSide) return;
      if (location.labelSide === 'bottom' || location.labelSide === 'offset') {
        marker.style.setProperty('--fd-map-label-x', size * (location.labelX - location.x) / 100 + 'px');
        marker.style.setProperty('--fd-map-label-y', size * (location.labelY - location.y) / 100 + 'px');
        return;
      }
      var left = location.labelSide === 'left';
      var offset = size * (left ? location.x - location.labelRightX : location.labelLeftX - location.x) / 100;
      // Keep each full road label inside the image at the overview scale.
      if (view.scale === 1) {
        var space = left ? location.x : 100 - location.x;
        var available = size * space / 100 - marker.querySelector('span').offsetWidth - 4;
        offset = Math.min(offset, available);
      }
      marker.style.setProperty('--fd-map-label-offset', Math.max(10, offset) + 'px');
    });
    viewport.classList.toggle('is-zoomed', view.scale > 1);
    syncToolbar();
  }

  function measureView(reset) {
    if (!dialog.open || !viewport.clientWidth || !viewport.clientHeight) return;
    var centerX = view.size ? (view.width / 2 - view.x) / (view.size * view.scale) : .5;
    var centerY = view.size ? (view.height / 2 - view.y) / (view.size * view.scale) : .5;
    view.width = viewport.clientWidth;
    view.height = viewport.clientHeight;
    view.size = Math.min(view.width, view.height);
    if (reset) { view.scale = 1; centerX = centerY = .5; }
    view.x = view.width / 2 - centerX * view.size * view.scale;
    view.y = view.height / 2 - centerY * view.size * view.scale;
    plane.style.width = plane.style.height = view.size + 'px';
    renderView();
  }

  function zoomTo(scale, x, y) {
    var next = clamp(scale, 1, 3);
    var ratio = next / view.scale;
    view.x = x - (x - view.x) * ratio;
    view.y = y - (y - view.y) * ratio;
    view.scale = next;
    renderView();
  }

  function localPoint(event) {
    var bounds = viewport.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function insideFootprint(x, y, points) {
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
      var a = points[i], b = points[j];
      if ((a[1] > y) !== (b[1] > y) &&
          x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }

  function locationAt(point) {
    if (!view.size) return null;
    var x = (point.x - view.x) * 100 / (view.size * view.scale);
    var y = (point.y - view.y) * 100 / (view.size * view.scale);
    return locations.find(function (location) {
      return location.footprint ? insideFootprint(x, y, location.footprint) :
        Math.hypot(location.x - x, location.y - y) < 5.2;
    }) || null;
  }

  function pinchState() {
    var points = Array.from(pointers.values());
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2,
      distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) };
  }

  function resetGesture() {
    pointers.clear();
    gesture = null;
    if (viewport) viewport.classList.remove('is-dragging');
  }

  function pointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    var button = event.target.closest('button');
    if (button && !button.classList.contains('fd-map-hotspot')) return;
    var point = localPoint(event);
    pointers.set(event.pointerId, point);
    viewport.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      gesture = { start: point, last: point, moved: false, pinched: false,
        marker: event.target.closest('.fd-map-hotspot') };
    } else if (pointers.size === 2) {
      gesture.pinched = true;
      gesture.pinch = pinchState();
    }
  }

  function pointerMove(event) {
    if (!gesture || !pointers.has(event.pointerId)) return;
    var point = localPoint(event);
    pointers.set(event.pointerId, point);
    if (pointers.size >= 2) {
      var next = pinchState(), previous = gesture.pinch;
      if (!previous) { gesture.pinch = next; return; }
      var scale = clamp(view.scale * next.distance / Math.max(previous.distance, 1), 1, 3);
      var ratio = scale / view.scale;
      view.x = next.x - (previous.x - view.x) * ratio;
      view.y = next.y - (previous.y - view.y) * ratio;
      view.scale = scale;
      gesture.pinch = next;
      gesture.moved = true;
      renderView();
    } else {
      if (Math.hypot(point.x - gesture.start.x, point.y - gesture.start.y) > 5) gesture.moved = true;
      if (gesture.moved) {
        view.x += point.x - gesture.last.x;
        view.y += point.y - gesture.last.y;
        viewport.classList.add('is-dragging');
        renderView();
      }
      gesture.last = point;
    }
  }

  function pointerUp(event) {
    if (!gesture || !pointers.has(event.pointerId)) return;
    var tapped = !gesture.moved && !gesture.pinched && event.type === 'pointerup';
    var marker = gesture.marker;
    pointers.delete(event.pointerId);
    if (pointers.size) {
      var remaining = Array.from(pointers.values())[0];
      gesture.last = gesture.start = remaining;
      gesture.pinch = null;
      gesture.pinched = true;
    } else {
      resetGesture();
      if (tapped) {
        var location = locationAt(localPoint(event)) || (marker ? locations[Number(marker.dataset.mapIndex)] : null);
        if (location) selectLocation(location);
        else clearSelection(false);
      }
    }
  }

  function loadImage() {
    error.hidden = true;
    plane.hidden = false;
    viewport.setAttribute('aria-busy', 'true');
    image.src = 'imgs/resort-map-v6-garden.png';
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'fd-map-dialog';
    dialog.className = 'fd-map-dialog';
    dialog.setAttribute('aria-labelledby', 'fd-map-title');
    dialog.setAttribute('aria-describedby', 'fd-map-hint');
    dialog.innerHTML =
      '<div class="fd-map-header"><div class="fd-map-heading">' +
      '<button type="button" class="fd-map-close" aria-label="العودة" autofocus><svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="fd-map-heading-copy"><h2 id="fd-map-title">خريطة الأكواخ</h2><p id="fd-map-hint">اختر الكوخ وشاهد موقعه ومميزاته</p></div></div>' +
      '<div class="fd-map-header-actions"><div class="fd-map-languages" role="group" aria-label="لغة الخريطة"><button type="button" class="fd-map-language" data-lang="ar" lang="ar" aria-label="عرض الخريطة بالعربية" aria-pressed="true">AR</button><button type="button" class="fd-map-language" data-lang="en" lang="en" aria-label="Show map in English" aria-pressed="false">EN</button></div></div></div>' +
      '<div class="fd-map-workspace">' +
        '<div class="fd-map-viewport" tabindex="0" aria-label="خريطة تفاعلية؛ كبّر ثم اسحب للاستكشاف، أو استخدم الأسهم للتحريك">' +
          '<div class="fd-map-plane"><img class="fd-map-image" width="1254" height="1254" alt="توزيع أكواخ المنتجع من الأعلى" draggable="false" decoding="async"></div>' +
          '<div class="fd-map-error" role="status" hidden><p>تعذّر تحميل الخريطة.</p><button type="button" class="fd-map-tool fd-map-retry">إعادة المحاولة</button></div>' +
        '</div>' +
        '<aside class="fd-map-panel" aria-label="معلومات الموقع المختار">' +
          '<div class="fd-map-toolbar" hidden><button type="button" class="fd-map-tool fd-map-fit" aria-label="إلغاء التكبير" hidden>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 8h5V3m13 5h-5V3M3 16h5v5m13-5h-5v5"/></svg><span>إلغاء التكبير</span></button><p class="fd-map-connection" hidden></p></div>' +
          '<div class="fd-map-info" aria-live="polite" aria-atomic="true">' +
            '<div class="fd-map-empty"><p>اختر اسم الكوخ من الخريطة</p></div>' +
            '<section id="fd-map-card" class="fd-map-card" aria-label="ملخص الكوخ المختار" hidden>' +
              '<div class="fd-map-card-top"><h3></h3><button type="button" class="fd-map-clear" aria-label="إلغاء اختيار الكوخ">' + closeIcon + '</button></div>' +
              '<p class="fd-map-description" hidden></p>' +
              '<div class="fd-map-facts">' +
                '<div class="fd-map-fact"><span class="fd-map-fact-label fd-map-guest-label">السعة</span><strong class="fd-map-guests"></strong></div>' +
                '<div class="fd-map-fact"><span class="fd-map-fact-label fd-map-room-label">غرف النوم</span><strong class="fd-map-rooms"></strong></div>' +
              '</div>' +
              '<div class="fd-map-amenities"></div>' +
              '<button type="button" class="fd-map-details-button">عرض التفاصيل والصور</button>' +
              '<a class="fd-map-details-button fd-map-tour-button" href="/dome-tour/?from=map" hidden>جولة في كوخ الدوم</a>' +
              '<button type="button" class="fd-map-card-photo" aria-label="عرض صور الكوخ" aria-haspopup="dialog" aria-controls="fd-map-photos" hidden><img width="240" height="240" alt="" decoding="async" draggable="false"><span class="fd-map-photo-label" aria-hidden="true">عرض الصور</span></button>' +
            '</section>' +
          '</div>' +
        '</aside>' +
      '</div><p class="fd-map-announcement" role="status" aria-live="polite"></p>';
    document.body.appendChild(dialog);
    viewport = dialog.querySelector('.fd-map-viewport');
    plane = dialog.querySelector('.fd-map-plane');
    card = dialog.querySelector('.fd-map-card');
    photoButton = card.querySelector('.fd-map-card-photo');
    cardPhoto = card.querySelector('.fd-map-card-photo img');
    photoButton.addEventListener('click', function () {
      if (selected) document.dispatchEvent(new CustomEvent('fd-map-photos-request', { detail: { locationKey: selected.key } }));
    });
    cardPhoto.addEventListener('load', function () { cardPhoto.classList.add('is-ready'); });
    cardPhoto.addEventListener('error', function () {
      cardPhoto.classList.remove('is-ready');
      cardPhoto.parentElement.hidden = true;
      card.classList.remove('has-photo');
    });
    empty = dialog.querySelector('.fd-map-empty');
    image = dialog.querySelector('.fd-map-image');
    error = dialog.querySelector('.fd-map-error');
    connectionNote = dialog.querySelector('.fd-map-toolbar .fd-map-connection');
    toolbar = dialog.querySelector('.fd-map-toolbar');
    fitButton = dialog.querySelector('.fd-map-fit');

    locations.forEach(function (location, i) {
      var cabin = cabinFor(location);
      if (location.labelSide === 'bottom' || location.labelSide === 'offset') {
        var leader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        leader.setAttribute('class', 'fd-map-leader');
        leader.setAttribute('viewBox', '0 0 100 100');
        leader.setAttribute('aria-hidden', 'true');
        var route = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        route.setAttribute('points', [[location.x, location.y], location.leaderBend || [location.x, 85.7], [location.labelX, location.labelY]].map(function (point) { return point.join(','); }).join(' '));
        route.setAttribute('vector-effect', 'non-scaling-stroke');
        leader.appendChild(route);
        plane.appendChild(leader);
      }
      var highlight;
      if (location.footprint) {
        highlight = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        highlight.setAttribute('class', 'fd-map-footprint');
        highlight.setAttribute('viewBox', '0 0 100 100');
        highlight.setAttribute('aria-hidden', 'true');
        var outline = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        outline.setAttribute('points', location.footprint.map(function (point) { return point.join(','); }).join(' '));
        outline.setAttribute('vector-effect', 'non-scaling-stroke');
        highlight.appendChild(outline);
        // HTML wrappers preserve the same hidden-property behavior as the dome outlines.
        var wrapper = document.createElement('div');
        wrapper.className = 'fd-map-footprint-wrap';
        wrapper.appendChild(highlight);
        highlight = wrapper;
      } else {
        highlight = document.createElement('div');
        highlight.className = 'fd-map-highlight';
        highlight.style.left = location.x + '%'; highlight.style.top = location.y + '%';
      }
      highlight.hidden = true;
      plane.appendChild(highlight);
      highlights.push(highlight);
      var marker = document.createElement('button');
      marker.type = 'button'; marker.className = 'fd-map-hotspot' + (location.labelSide ? ' fd-map-hotspot--label-' + location.labelSide : '');
      marker.dataset.mapIndex = String(i);
      marker.dataset.locationKey = location.key;
      marker.style.left = location.x + '%'; marker.style.top = location.y + '%';
      marker.setAttribute('aria-label', cabin.name + ': عرض المميزات');
      marker.setAttribute('aria-pressed', 'false'); marker.setAttribute('aria-controls', 'fd-map-card');
      var label = document.createElement('span');
      // Compact map names; full names remain in the detail card and accessible label.
      label.textContent = cabin.name.replace(/^(?:الكوخ|كوخ|البيت|بيت)\s+/, '');
      marker.appendChild(label);
      // Pointer gestures are handled once on pointerup; keyboard/assistive clicks have detail=0.
      marker.addEventListener('click', function (event) { if (event.detail === 0) selectLocation(location); });
      plane.appendChild(marker); markers.push(marker);
    });

    viewport.addEventListener('pointerdown', pointerDown);
    viewport.addEventListener('pointermove', pointerMove);
    viewport.addEventListener('pointerup', pointerUp);
    viewport.addEventListener('pointercancel', pointerUp);
    viewport.addEventListener('lostpointercapture', function (event) {
      if (pointers.has(event.pointerId)) resetGesture();
    });
    viewport.addEventListener('keydown', function (event) {
      if (event.target !== viewport) return;
      if (event.key === '+' || event.key === '=') zoomTo(view.scale + .5, view.width / 2, view.height / 2);
      else if (event.key === '-') zoomTo(view.scale - .5, view.width / 2, view.height / 2);
      else if (event.key === 'Home') measureView(true);
      else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(event.key) !== -1) {
        view.x += event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
        view.y += event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0;
        renderView();
      } else return;
      event.preventDefault();
    });
    fitButton.addEventListener('click', function () {
      resetGesture();
      measureView(true);
      viewport.focus({ preventScroll: true });
    });
    dialog.querySelectorAll('.fd-map-language').forEach(function (button) {
      button.addEventListener('click', function () { setMapLanguage(button.dataset.lang); });
    });
    dialog.querySelector('.fd-map-clear').addEventListener('click', function () { clearSelection(true); });
    dialog.querySelector('.fd-map-details-button').addEventListener('click', function () {
      if (!selected || typeof window.openM !== 'function') return;
      window.openM(cabinFor(selected).id, 'resort');
    });
    card.querySelector('.fd-map-tour-button').addEventListener('click', function (event) {
      if (!selected || selected.kind !== 'shared' || typeof window.open3D !== 'function') return;
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.open3D(this.href);
    });
    dialog.querySelector('.fd-map-close').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.fd-map-retry').addEventListener('click', loadImage);
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('cancel', function (event) {
      if (selected) { event.preventDefault(); clearSelection(true); }
    });
    dialog.addEventListener('close', function () {
      if (dialog.dataset.fdSuspended === 'true') return;
      if (photoDialog && photoDialog.open) photoDialog.close();
      resetGesture(); clearSelection(false);
      document.body.style.overflow = previousOverflow;
      openButton.focus({ preventScroll: true });
    });
    image.addEventListener('load', function () {
      error.hidden = true; plane.hidden = false;
      viewport.setAttribute('aria-busy', 'false'); measureView(false);
    });
    image.addEventListener('error', function () {
      error.hidden = false; plane.hidden = true;
      viewport.setAttribute('aria-busy', 'false');
    });
    new ResizeObserver(function () { measureView(false); }).observe(viewport);
    window.addEventListener('blur', resetGesture);
    updateMapText();
    loadImage();
  }

  openButton.addEventListener('click', function () {
    if (!dialog) createDialog();
    if (dialog.open) return;
    previousOverflow = document.body.style.overflow;
    // Every opening starts with no cabin, outline or connection note selected.
    clearSelection(false);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    measureView(true);
    if (!error.hidden) loadImage();
  });

  document.addEventListener('fd-map-select-cabin', function (event) {
    if (!dialog || !dialog.open) return;
    var cabinId = Number(event.detail && event.detail.cabinId);
    var location = locations.find(function (item) { return cabinFor(item).id === cabinId; });
    if (location && selected !== location) selectLocation(location);
  });

  document.addEventListener('fd-map-suspend', function () {
    if (!dialog || !dialog.open) return;
    dialog.dataset.fdSuspended = 'true';
    dialog.close();
  });
  document.addEventListener('fd-map-resume', function () {
    if (!dialog || dialog.dataset.fdSuspended !== 'true') return;
    dialog.dataset.fdSuspended = 'false';
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    measureView(false);
  });

  var observer = new MutationObserver(syncLauncher);
  observer.observe(filters, { attributes: true, attributeFilter: ['style'] });
  observer.observe(app, { attributes: true, attributeFilter: ['class'] });
  var sub = document.getElementById('service-sub');
  if (sub) observer.observe(sub, { attributes: true, attributeFilter: ['class'] });
  syncLauncher();
})();
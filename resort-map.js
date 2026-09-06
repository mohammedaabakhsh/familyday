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
    { key: 'pyramid', cabinId: 2, x: 23.25, y: 32.9, labelSide: 'left', labelRightX: 16,
      footprint: [[17.8, 24.8], [38.8, 24.8], [38.8, 38.2], [17.8, 38.2]] },
    { key: 'dome-upper', cabinId: 1, x: 23.25, y: 43.4, labelSide: 'left', labelRightX: 16, locationLabel: 'العلوي' },
    { key: 'dome-lower', cabinId: 1, x: 23.25, y: 53.6, labelSide: 'left', labelRightX: 16, locationLabel: 'السفلي' },
    // Owner's corrected aerial reference: smaller Classic above, larger Royal below.
    { key: 'classic', cabinId: 3, x: 60.2, y: 26.6, labelSide: 'right', labelLeftX: 70,
      footprint: [[39.5, 23.8], [54.4, 10.0], [64.7, 24.5], [51.3, 35.5], [43.8, 24.6]] },
    { key: 'royal', cabinId: 9, x: 65.8, y: 35.5, labelSide: 'right', labelLeftX: 76,
      footprint: [[51.3, 35.5], [64.7, 24.5], [76.7, 42.5], [64.3, 52.5]] }
  ].filter(function (location) { return data.resort.items.some(function (item) { return item.id === location.cabinId; }); });
  if (!locations.length) return;

  // The connecting door is confirmed in the site's FAQ; both positions are owner-confirmed.
  var connections = [{ cabinIds: [3, 9], description: 'يمكن ربط الكلاسيكي ورويال عبر باب داخلي، بسعة تصل إلى 30 ضيفًا.' }];
  var dialog, viewport, plane, card, empty, image, error, connectionNote;
  var markers = [], highlights = [], selected = null;
  var previousOverflow = '', pointers = new Map(), gesture = null;
  var view = { width: 0, height: 0, size: 0, scale: 1, x: 0, y: 0 };
  var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';

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
    return count === 1 ? 'غرفة نوم واحدة' : count === 2 ? 'غرفتين نوم' : count + ' غرف نوم';
  }

  function guestText(count) {
    return count === 2 ? 'يتسع لشخصين' : 'يتسع حتى ' + count + ' ضيفًا';
  }

  function featuresFor(cabin) {
    var tags = cabin.tags || [];
    var features = [];
    if (tags.some(function (tag) { return tag.indexOf('مسبح خاص') === 0; })) features.push('مسبح خاص');
    // Use the same compact bath feature shown on the site's cabin cards.
    var bath = tags.find(function (tag) { return tag.indexOf('بانيو') !== -1 || tag.indexOf('جاكوزي') !== -1; });
    if (bath) features.push(bath.indexOf('داخلي') !== -1 && bath.indexOf('جاكوزي') === -1 ? 'بانيو داخلي' :
      bath.indexOf('خارجي') !== -1 ? 'بانيو خارجي' : bath.indexOf('جاكوزي') !== -1 ? 'جاكوزي داخلي' : 'بانيو');
    return features;
  }

  function clearSelection(restoreFocus) {
    var old = selected;
    selected = null;
    markers.forEach(function (marker) { marker.setAttribute('aria-pressed', 'false'); });
    highlights.forEach(function (highlight) { highlight.hidden = true; highlight.classList.remove('is-connected'); });
    card.hidden = true;
    empty.hidden = false;
    connectionNote.hidden = true;
    connectionNote.textContent = '';
    if (restoreFocus && old) markers[locations.indexOf(old)].focus({ preventScroll: true });
  }

  function selectLocation(location) {
    if (selected === location) { clearSelection(false); return; }
    var cabin = cabinFor(location);
    selected = location;
    var connection = connections.find(function (item) { return item.cabinIds.indexOf(cabin.id) !== -1; });
    markers.forEach(function (marker, i) {
      var active = locations[i] === location;
      var linked = !active && connection && connection.cabinIds.indexOf(locations[i].cabinId) !== -1;
      marker.setAttribute('aria-pressed', String(active));
      highlights[i].hidden = !active && !linked;
      highlights[i].classList.toggle('is-connected', Boolean(linked));
    });
    card.querySelector('h3').textContent = cabin.name;
    card.querySelector('.fd-map-rooms').textContent = roomText(cabin.rooms);
    card.querySelector('.fd-map-guests').textContent = guestText(cabin.guests);
    var amenities = card.querySelector('.fd-map-amenities');
    amenities.replaceChildren();
    featuresFor(cabin).forEach(function (feature) {
      var item = document.createElement('p');
      item.className = 'fd-map-amenity';
      item.textContent = feature;
      amenities.appendChild(item);
    });
    amenities.hidden = !amenities.children.length;
    connectionNote.textContent = connection ? connection.description : '';
    connectionNote.hidden = !connection;
    empty.hidden = true;
    card.hidden = false;
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function renderView() {
    var size = view.size * view.scale;
    view.x = size <= view.width ? (view.width - size) / 2 : clamp(view.x, view.width - size, 0);
    view.y = size <= view.height ? (view.height - size) / 2 : clamp(view.y, view.height - size, 0);
    plane.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')';
    plane.style.setProperty('--fd-map-inverse', String(1 / view.scale));
    markers.forEach(function (marker, i) {
      var location = locations[i];
      if (!location.labelSide) return;
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
        var location = marker ? locations[Number(marker.dataset.mapIndex)] : locationAt(localPoint(event));
        if (location) selectLocation(location);
        else clearSelection(false);
      }
    }
  }

  function loadImage() {
    error.hidden = true;
    plane.hidden = false;
    viewport.setAttribute('aria-busy', 'true');
    image.src = 'imgs/resort-map-v2.webp';
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.id = 'fd-map-dialog';
    dialog.className = 'fd-map-dialog';
    dialog.setAttribute('aria-labelledby', 'fd-map-title');
    dialog.setAttribute('aria-describedby', 'fd-map-hint');
    dialog.innerHTML =
      '<div class="fd-map-header"><div><h2 id="fd-map-title">خريطة الأكواخ</h2>' +
      '<p id="fd-map-hint">اختر الكوخ وشاهد موقعه ومميزاته</p></div>' +
      '<button type="button" class="fd-map-close" aria-label="إغلاق الخريطة" autofocus>' + closeIcon + '</button></div>' +
      '<div class="fd-map-viewport" tabindex="0" aria-label="خريطة تفاعلية؛ كبّر ثم اسحب للاستكشاف، أو استخدم الأسهم للتحريك">' +
        '<div class="fd-map-plane"><img class="fd-map-image" width="1254" height="1254" alt="توزيع أكواخ المنتجع من الأعلى" draggable="false" decoding="async"></div>' +
        '<div class="fd-map-error" role="status" hidden><p>تعذّر تحميل الخريطة.</p><button type="button" class="fd-map-tool fd-map-retry">إعادة المحاولة</button></div>' +
      '</div>' +
      '<div class="fd-map-toolbar"><button type="button" class="fd-map-tool fd-map-fit" aria-label="عرض الخريطة كاملة">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>الخريطة كاملة</button><p class="fd-map-connection" hidden></p></div>' +
      '<div class="fd-map-info" aria-live="polite" aria-atomic="true">' +
        '<div class="fd-map-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/></svg><p>اضغط على اسم الكوخ أو موقعه<br>للتعرّف على مميزاته</p></div>' +
        '<section id="fd-map-card" class="fd-map-card" aria-label="ملخص الكوخ المختار" hidden>' +
          '<div class="fd-map-card-top"><h3></h3><button type="button" class="fd-map-clear" aria-label="إلغاء اختيار الكوخ">' + closeIcon + '</button></div>' +
          '<div class="fd-map-facts"><span class="fd-map-fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 18V8m18 10v-7a2 2 0 0 0-2-2h-7v7M3 16h18M3 18v3m18-3v3"/><path d="M5 9h5v5H5z"/></svg><span class="fd-map-rooms"></span></span>' +
          '<span class="fd-map-fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg><span class="fd-map-guests"></span></span></div>' +
          '<div class="fd-map-amenities"></div>' +
        '</section></div>';
    document.body.appendChild(dialog);
    viewport = dialog.querySelector('.fd-map-viewport');
    plane = dialog.querySelector('.fd-map-plane');
    card = dialog.querySelector('.fd-map-card');
    empty = dialog.querySelector('.fd-map-empty');
    image = dialog.querySelector('.fd-map-image');
    error = dialog.querySelector('.fd-map-error');
    connectionNote = dialog.querySelector('.fd-map-toolbar .fd-map-connection');

    locations.forEach(function (location, i) {
      var cabin = cabinFor(location);
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
      marker.setAttribute('aria-label', cabin.name + (location.locationLabel ? ' ' + location.locationLabel : '') + ': عرض المميزات');
      marker.setAttribute('aria-pressed', 'false'); marker.setAttribute('aria-controls', 'fd-map-card');
      var label = document.createElement('span'); label.textContent = cabin.name;
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
    dialog.querySelector('.fd-map-fit').addEventListener('click', function () { measureView(true); });
    dialog.querySelector('.fd-map-clear').addEventListener('click', function () { clearSelection(true); });
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

  var observer = new MutationObserver(syncLauncher);
  observer.observe(filters, { attributes: true, attributeFilter: ['style'] });
  observer.observe(app, { attributes: true, attributeFilter: ['class'] });
  var sub = document.getElementById('service-sub');
  if (sub) observer.observe(sub, { attributes: true, attributeFilter: ['class'] });
  syncLauncher();
})();

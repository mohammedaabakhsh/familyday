/* Shared photo overview. Navigation, Escape and focus stay in the shared router. */
var FD_DOME_GALLERY = (function () {
  'use strict';

  var panel = null;
  var renderedSources = '';

  function photos(cabinId) {
    return typeof GALLERY !== 'undefined' && Array.isArray(GALLERY[cabinId]) ? GALLERY[cabinId].slice() : [];
  }

  function requestDismiss() {
    document.dispatchEvent(new CustomEvent('fd-dome-gallery-dismiss'));
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'fd-dome-gallery';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'fd-dome-gallery-title');
    panel.setAttribute('aria-describedby', 'fd-dome-gallery-help');
    panel.tabIndex = -1;
    panel.innerHTML = '<div class="fd-dome-gallery-shell">'
      + '<header class="fd-dome-gallery-header">'
      + '<div class="fd-dome-gallery-heading"><h2 id="fd-dome-gallery-title">جميع الصور</h2>'
      + '<p id="fd-dome-gallery-help">اختر صورة لعرضها بالحجم الكامل</p></div>'
      + '<button type="button" class="fd-dome-gallery-close" aria-label="إغلاق جميع الصور والعودة إلى التفاصيل">'
      + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
      + '</header><ol class="fd-dome-gallery-grid" aria-label="جميع الصور"></ol></div>';
    panel.querySelector('.fd-dome-gallery-close').addEventListener('click', requestDismiss);
    panel.addEventListener('click', function (event) {
      if (event.target === panel) requestDismiss();
    });
    document.body.appendChild(panel);
    return panel;
  }

  function renderPhotos(sources, cabin) {
    var key = JSON.stringify([cabin.id, cabin.name, sources]);
    if (renderedSources === key) return;
    var list = panel.querySelector('.fd-dome-gallery-grid');
    list.replaceChildren();
    sources.forEach(function (source, index) {
      var item = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'fd-dome-gallery-photo';
      button.setAttribute('aria-label', 'تكبير الصورة ' + (index + 1) + ' من ' + sources.length + ' — ' + cabin.name);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'fsOverlay');
      var image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.width = 1200;
      image.height = 1200;
      var number = document.createElement('span');
      number.className = 'fd-dome-gallery-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(index + 1);
      button.appendChild(image);
      button.appendChild(number);
      button.addEventListener('click', function () {
        // The shared router adds photos above the grid and handles Back/X.
        openFS(sources.slice(), index, cabin.id);
      });
      item.appendChild(button);
      list.appendChild(item);
    });
    renderedSources = key;
  }

  function mountTrigger(wrapper, cabin) {
    var previous = wrapper.querySelector('.fd-dome-gallery-trigger');
    if (previous) previous.remove();
    if (!cabin || !photos(cabin.id).length) return;
    ensurePanel();
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'fd-dome-gallery-trigger';
    trigger.setAttribute('aria-label', 'عرض جميع صور ' + cabin.name);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'fd-dome-gallery');
    trigger.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/></svg><span>عرض جميع الصور</span>';
    trigger.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('fd-dome-gallery-request', {
        detail: { id: cabin.id, name: cabin.name }
      }));
    });
    wrapper.appendChild(trigger);
  }

  function show(cabin) {
    // Keep pre-rollout history entries for the original Dome overview working.
    cabin = cabin || { id: 1, name: 'بيت الدوم' };
    ensurePanel();
    panel.querySelector('#fd-dome-gallery-title').textContent = 'صور ' + cabin.name;
    panel.setAttribute('aria-label', 'صور ' + cabin.name);
    panel.querySelector('.fd-dome-gallery-close').setAttribute('aria-label', 'إغلاق جميع الصور والعودة إلى ' + cabin.name);
    panel.querySelector('.fd-dome-gallery-grid').setAttribute('aria-label', 'جميع صور ' + cabin.name);
    renderPhotos(photos(cabin.id), cabin);
    panel.hidden = false;
    panel.querySelector('.fd-dome-gallery-shell').scrollTop = 0;
  }

  function hide() {
    if (panel) panel.hidden = true;
  }

  return { mountTrigger: mountTrigger, show: show, hide: hide };
})();

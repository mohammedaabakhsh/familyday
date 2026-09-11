// Resort-only interactions. Existing page hashes and service destinations are retained.
var _orderResortScope = false;
var _orderOriginalHTML = null;
var _menuBbqTypes = {};

function configureResortOrderForm() {
  var popup = document.getElementById('order-popup');
  if (_orderOriginalHTML === null) _orderOriginalHTML = popup.innerHTML;
  popup.innerHTML = _orderOriginalHTML;
  popup.classList.toggle('fd-resort-order', _orderResortScope);
  if (!_orderResortScope) return;

  popup.firstElementChild.classList.add('fd-order-panel');
  popup.firstElementChild.firstElementChild.classList.add('fd-order-title');
  ['order-name', 'order-villa', 'order-time', 'order-notes'].forEach(function (id) {
    var field = document.getElementById(id);
    var label = field.previousElementSibling;
    label.htmlFor = id;
    if (id === 'order-time') label.textContent = 'وقت بداية الجلسة';
    if (id !== 'order-notes') {
      var error = document.createElement('p');
      error.id = id + '-error';
      error.className = 'fd-field-error';
      error.setAttribute('aria-live', 'polite');
      field.after(error);
      field.setAttribute('aria-describedby', error.id);
      field.addEventListener('input', function () { setResortOrderError(id, ''); });
      field.addEventListener('change', function () { setResortOrderError(id, ''); });
    }
  });
  var option = document.createElement('option');
  option.value = 'not-booked';
  option.textContent = 'لم أحجز كوخًا بعد';
  document.getElementById('order-villa').appendChild(option);
  var outputLabel = document.querySelector('#order-cabin-num-wrap label');
  outputLabel.id = 'fd-cabin-number-label';
  document.getElementById('order-cabin-num').setAttribute('aria-labelledby', outputLabel.id);
  var send = popup.querySelector('[onclick="sendOrderWhatsapp()"]');
  send.textContent = 'متابعة إلى واتساب';
  send.classList.add('fd-order-submit');
  var cancel = popup.querySelector('[onclick="closeOrderPopup()"]');
  cancel.classList.add('fd-order-cancel');
  send.parentElement.classList.add('fd-order-actions');
  var help = send.parentElement.previousElementSibling;
  help.classList.add('fd-order-help');
  help.firstElementChild.textContent = 'بعد تعبئة بياناتك، ستنتقل إلى واتساب لمتابعة طلبك.';
}

function setResortOrderError(id, text) {
  var field = document.getElementById(id);
  var error = document.getElementById(id + '-error');
  if (!error) return;
  error.textContent = text;
  if (text) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

function validateResortOrder() {
  var name = document.getElementById('order-name');
  var villa = document.getElementById('order-villa');
  var time = document.getElementById('order-time');
  var timeRequired = document.getElementById('order-time-wrap').style.display !== 'none' && villa.value && villa.value !== 'not-booked';
  var errors = [
    [name, name.value.trim() ? '' : 'اكتب اسمك'],
    [villa, villa.value ? '' : 'اختر الكوخ'],
    [time, timeRequired && !time.value ? 'اختر وقت بداية الجلسة' : '']
  ];
  errors.forEach(function (entry) { setResortOrderError(entry[0].id, entry[1]); });
  var first = errors.find(function (entry) { return entry[1]; });
  if (first) first[0].focus();
  return !first;
}

function setMenuBbqType(name, type) {
  if (type !== 'لحم' && type !== 'دجاج') return;
  _menuBbqTypes[name] = type;
  _renderMenuItems();
}

function menuBbqQty(name, delta) {
  var item = _menuData['بوكسات الشواء'].find(function (entry) { return entry.name === name; });
  var type = _menuBbqTypes[name];
  if (!item || !type) return;
  menuQty(name + ' — ' + type, item.price, delta);
}

function renderMenuBbq(item) {
  var type = _menuBbqTypes[item.name] || '';
  var key = item.name + ' — ' + type;
  var qty = (_menuCart[key] && _menuCart[key].qty) || 0;
  return '<article class="menu-item menu-bbq" aria-label="' + item.name + '">'
    + '<h2 class="menu-item-name">' + item.name + '</h2>'
    + '<p class="menu-item-desc">' + item.desc + '</p>'
    + '<div class="menu-bbq-types" role="group" aria-label="نوع ' + item.name + '">'
    + ['لحم', 'دجاج'].map(function (choice) {
      return '<button type="button" class="menu-extra' + (type === choice ? ' is-selected' : '') + '" aria-pressed="' + (type === choice) + '" onclick="setMenuBbqType(&apos;' + item.name + '&apos;,&apos;' + choice + '&apos;)">' + choice + '</button>';
    }).join('') + '</div>'
    + '<p class="menu-item-price">' + item.price + ' ريال</p>'
    + '<div class="menu-controls">'
    + (qty ? '<button type="button" class="menu-qty-button menu-qty-button--minus" aria-label="تقليل كمية ' + key + '" onclick="menuBbqQty(&apos;' + item.name + '&apos;,-1)">−</button><span class="menu-qty">' + qty + '</span>' : '')
    + '<button type="button" class="menu-qty-button" aria-label="إضافة ' + item.name + (type ? ' — ' + type : ' بعد اختيار النوع') + '" onclick="menuBbqQty(&apos;' + item.name + '&apos;,1)"' + (type ? '' : ' disabled') + '>+</button>'
    + '</div></article>';
}

function renderMaiyaThumbnails() {
  var strip = document.getElementById('maiya-thumbnails');
  strip.replaceChildren();
  _maiyaGames.forEach(function (game, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'wm-thumbnail';
    button.setAttribute('aria-label', 'عرض ' + game.name);
    button.setAttribute('aria-pressed', String(index === _maiyaIdx));
    var img = document.createElement('img');
    img.src = game.img;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 64;
    img.height = 64;
    button.appendChild(img);
    button.addEventListener('click', function () { maiyaGoTo(index); });
    strip.appendChild(button);
  });
}

function updateMaiyaThumbnail() {
  var strip = document.getElementById('maiya-thumbnails');
  Array.from(strip.children).forEach(function (button, index) {
    button.setAttribute('aria-pressed', String(index === _maiyaIdx));
  });
  var active = strip.children[_maiyaIdx];
  if (active) {
    var rect = active.getBoundingClientRect(), frame = strip.getBoundingClientRect();
    if (rect.left < frame.left) strip.scrollLeft += rect.left - frame.left;
    else if (rect.right > frame.right) strip.scrollLeft += rect.right - frame.right;
  }
}

function cabinShareURL(id) {
  var url = new URL(location.href);
  url.hash = 'cabin=' + id;
  return url.href;
}

function updateCabinShareActions(cabin) {
  var bar = document.getElementById('modalBottomBar');
  var inquiry = bar.querySelector('.fd-cabin-inquiry');
  if (!inquiry) {
    inquiry = document.createElement('a');
    inquiry.className = 'mbtn mbtn-wa fd-cabin-inquiry';
    inquiry.target = '_blank';
    inquiry.rel = 'noopener noreferrer';
    inquiry.textContent = 'تواصل واتساب';
    bar.appendChild(inquiry);
  }
  inquiry.href = 'https://wa.me/966556156693?text=' + encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن ' + cabin.name + '.');
  var sharing = document.getElementById('fd-cabin-sharing');
  if (!sharing) {
    sharing = document.createElement('div');
    sharing.id = 'fd-cabin-sharing';
    sharing.className = 'fd-cabin-sharing';
    sharing.innerHTML = '<div class="fd-cabin-share-links"><button type="button" onclick="copyCabinLink()">نسخ الرابط</button><a target="_blank" rel="noopener noreferrer">مشاركة عبر واتساب</a></div><p class="fd-cabin-copy-status" role="status"></p>';
    bar.appendChild(sharing);
  }
  sharing.dataset.cabinId = cabin.id;
  sharing.querySelector('a').href = 'https://wa.me/?text=' + encodeURIComponent(cabin.name + '\n' + cabinShareURL(cabin.id));
  sharing.querySelector('[role="status"]').textContent = '';
}

async function copyCabinLink() {
  var sharing = document.getElementById('fd-cabin-sharing');
  var id = sharing.dataset.cabinId;
  var url = cabinShareURL(id);
  var copied = false;
  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch (_) {
    var input = document.createElement('textarea');
    input.value = url;
    input.readOnly = true;
    input.className = 'fd-copy-buffer';
    sharing.appendChild(input);
    input.select();
    try { copied = document.execCommand('copy'); } catch (_) {}
    input.remove();
    sharing.querySelector('button').focus();
  }
  if (sharing.dataset.cabinId === id) {
    sharing.querySelector('[role="status"]').textContent = copied ? 'تم نسخ الرابط' : 'تعذر النسخ، يمكنك نسخ الرابط من شريط العنوان.';
  }
}

/* Mobile-only booking/contact redesign. Desktop and the rest of the resort stay untouched. */
(function () {
  function iconMarkup(kind) {
    var icons = {
      web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.2 2.4 3.4 5.2 3.4 8.5S14.2 18.1 12 20.5M12 3.5C9.8 5.9 8.6 8.7 8.6 12s1.2 6.1 3.4 8.5"/></svg>',
      apple: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 16.8 12 6.2m3.8 10.6L12 6.2M6 14.1h12"/></svg>',
      android: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.2 5.3 1.5-2M16.8 5.3l-1.5-2M6 9.2h12v7.6H6zM8 16.8v3M16 16.8v3M6 10v6M18 10v6"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.2 4.8a9 9 0 0 0-14.4 10.6L4 20l4.7-.8a9 9 0 1 0 10.5-14.4Z"/><path d="M9 8.6c.4 2.7 2.5 4.8 5.3 5.4l1.2-1.2"/></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 4.5 10 8l-1.7 1.7a13.2 13.2 0 0 0 6 6L16 14l3.5 2.6-1.1 3c-.3.8-1.1 1.3-2 1.2C9.3 19.9 4.1 14.7 3.2 7.6c-.1-.9.4-1.7 1.2-2l3-1.1Z"/></svg>',
      map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>',
      faq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.8c-.9.7-1.5 1.1-1.5 2M12.1 14.7h.01"/></svg>'
    };
    return '<span class="fd-contact-icon fd-contact-icon--' + kind + '">' + icons[kind] + '</span>';
  }

  function addIcon(link, kind) {
    if (!link || link.querySelector('.fd-contact-icon')) return;
    link.insertAdjacentHTML('afterbegin', iconMarkup(kind));
  }

  function wrapCardCopy(link) {
    if (!link || link.querySelector('.fd-contact-card-copy')) return;
    var name = link.querySelector('.cp-tile-name, .cp-wide-name');
    var sub = link.querySelector('.cp-tile-sub, .cp-map-sub');
    if (!name) return;
    var copy = document.createElement('div');
    copy.className = 'fd-contact-card-copy';
    name.before(copy);
    copy.appendChild(name);
    if (sub) copy.appendChild(sub);
  }

  function enhanceContact() {
    var page = document.getElementById('contact-page');
    if (!page || page.dataset.fdEnhanced === 'true') return;
    page.dataset.fdEnhanced = 'true';

    var hero = page.querySelector('.cp-hero');
    var heading = page.querySelector('.cp-heading');
    if (hero && heading && !hero.querySelector('.cp-intro')) {
      var intro = document.createElement('p');
      intro.className = 'cp-intro cp-resort-only';
      intro.textContent = 'اختر طريقة الحجز أو التواصل المناسبة لك';
      heading.after(intro);
    }

    var booking = page.querySelector('.cp-booking');
    if (booking) {
      var site = booking.querySelector('.cp-primary');
      addIcon(site, 'web');
      wrapCardCopy(site);
      var appLinks = booking.querySelectorAll('.cp-row2 a');
      if (appLinks[0]) { addIcon(appLinks[0], 'apple'); wrapCardCopy(appLinks[0]); }
      if (appLinks[1]) { addIcon(appLinks[1], 'android'); wrapCardCopy(appLinks[1]); }
    }

    var contact = page.querySelector('.cp-contact');
    if (contact) {
      var contactTitle = contact.querySelector('.cp-label');
      if (contactTitle) contactTitle.textContent = 'التواصل المباشر';
      var wa = contact.querySelector('a[href*="wa.me"]');
      addIcon(wa, 'whatsapp');
      wrapCardCopy(wa);
      var phone = contact.querySelector('a[href^="tel:"]');
      addIcon(phone, 'phone');
      wrapCardCopy(phone);
    }

    var location = page.querySelector('.cp-location');
    if (location) {
      var locationTitle = location.querySelector('.cp-label');
      if (locationTitle) locationTitle.textContent = 'معلومات المنتجع';
      var map = location.querySelector('#cp-map-link');
      addIcon(map, 'map');
      wrapCardCopy(map);
      if (!location.querySelector('.fd-contact-faq')) {
        var faq = document.createElement('button');
        faq.type = 'button';
        faq.className = 'cp-wide fd-contact-faq';
        faq.innerHTML = iconMarkup('faq') + '<div class="fd-contact-card-copy"><div class="cp-wide-name">الأسئلة الشائعة</div><div class="cp-map-sub">إجابات سريعة لأهم استفساراتكم</div></div><div class="cp-wide-arrow" aria-hidden="true">←</div>';
        faq.addEventListener('click', function () { if (typeof showFaq === 'function') showFaq(); });
        map.after(faq);
      }
    }
  }

  var style = document.createElement('style');
  style.id = 'fd-contact-mobile-compact';
  style.textContent = '@media(max-width:599px){'
    + '#contact-page[data-venue="resort"] .cp-shell{padding-top:16px!important;}'
    + '#contact-page[data-venue="resort"] .cp-hero{margin-bottom:22px!important;}'
    + '#contact-page[data-venue="resort"] .cp-title{font-size:17px!important;font-weight:700!important;}'
    + '#contact-page[data-venue="resort"] .cp-intro{font-size:13px!important;margin-top:6px!important;color:#8fb4c0!important;line-height:1.5!important;}'
    + '#contact-page[data-venue="resort"] .cp-label{font-size:13px!important;color:#8bc4d1!important;margin:0 2px 7px!important;font-weight:700!important;}'
    + '#contact-page[data-venue="resort"] .cp-body{gap:clamp(24px,4.5vh,40px)!important;}'
    + '#contact-page[data-venue="resort"] .cp-booking{padding:0!important;border:0!important;background:transparent!important;}'
    + '#contact-page[data-venue="resort"] :is(.cp-wide,.cp-tile){position:relative!important;display:grid!important;grid-template-columns:48px minmax(0,1fr) 18px!important;align-items:center!important;gap:11px!important;min-height:58px!important;padding:9px 14px!important;border-radius:14px!important;text-align:right!important;}'
    + '#contact-page[data-venue="resort"] .cp-row2{grid-template-columns:1fr!important;gap:8px!important;margin-top:8px!important;}'
    + '#contact-page[data-venue="resort"] .cp-row2 .cp-tile{min-height:62px!important;}'
    + '#contact-page[data-venue="resort"] .cp-primary{justify-content:initial!important;background:#153244!important;border-color:#315967!important;}'
    + '#contact-page[data-venue="resort"] .cp-primary .cp-wide-arrow{display:block!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-card-copy{grid-column:2!important;grid-row:1!important;min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important;gap:2px!important;}'
    + '#contact-page[data-venue="resort"] .cp-wide-name,#contact-page[data-venue="resort"] .cp-tile-name,#contact-page[data-venue="resort"] .cp-primary .cp-wide-name{font-size:14px!important;font-weight:700!important;line-height:1.45!important;margin:0!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sub,#contact-page[data-venue="resort"] .cp-map-sub,#contact-page[data-venue="resort"] .cp-app-caption{font-size:12px!important;color:#9bb6c1!important;line-height:1.45!important;margin-top:0!important;}'
    + '#contact-page[data-venue="resort"] .cp-app-caption{margin-top:7px!important;text-align:right!important;padding-inline:2px!important;}'
    + '#contact-page[data-venue="resort"] .cp-contact-links{grid-template-columns:1fr!important;gap:8px!important;}'
    + '#contact-page[data-venue="resort"] .cp-contact-links .cp-wide{justify-content:initial!important;text-align:right!important;}'
    + '#contact-page[data-venue="resort"] .cp-contact-links .cp-wide-arrow{display:block!important;}'
    + '#contact-page[data-venue="resort"] .cp-whatsapp{background:#123746!important;border-color:#3f7e8c!important;}'
    + '#contact-page[data-venue="resort"] .cp-location .cp-wide+ .cp-wide{margin-top:8px!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-faq{width:100%!important;font-family:Tajawal,sans-serif!important;color:#f0f5f7!important;cursor:pointer!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon{grid-column:1!important;grid-row:1!important;width:42px!important;height:42px!important;border-radius:11px!important;display:grid!important;place-items:center!important;color:#fff!important;box-sizing:border-box!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon svg{width:24px!important;height:24px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--web{background:linear-gradient(145deg,#147a8c,#105769)!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--apple{background:linear-gradient(145deg,#2d9cff,#0968de)!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--android{background:linear-gradient(145deg,#3fbf69,#188d47)!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--whatsapp{background:linear-gradient(145deg,#31d36b,#159b47)!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--phone{background:#102b3a!important;border:1px solid #315967!important;color:#9edce5!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--map{background:linear-gradient(145deg,#d68b6a,#ad6346)!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-icon--faq{background:#102b3a!important;border:1px solid #315967!important;color:#9edce5!important;}'
    + '#contact-page[data-venue="resort"] :is(.cp-wide,.cp-tile)>.cp-wide-arrow{grid-column:3!important;grid-row:1!important;font-size:18px!important;}'
    + '#contact-page[data-venue="resort"] .cp-social{padding-top:18px!important;}'
    + '#contact-page[data-venue="resort"] .cp-row3{gap:8px!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sm{display:flex!important;min-height:42px!important;padding:9px 6px!important;text-align:center!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sm .cp-tile-name{font-size:12px!important;font-weight:500!important;}'
    + '}';
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceContact);
  else enhanceContact();
})();
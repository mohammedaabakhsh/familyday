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

/* Mobile-only contact page tuning. Original layout retained; only compact typography/sizing is applied. */
(function () {
  var style = document.createElement('style');
  style.id = 'fd-contact-mobile-compact';
  style.textContent = '@media(max-width:599px){'
    + '#contact-page[data-venue="resort"] .cp-title{font-size:17px!important;font-weight:700!important;}'
    + '#contact-page[data-venue="resort"] .cp-intro{font-size:13px!important;}'
    + '#contact-page[data-venue="resort"] .cp-label{font-size:13px!important;margin-bottom:7px!important;}'
    + '#contact-page[data-venue="resort"] .cp-wide-name,#contact-page[data-venue="resort"] .cp-tile-name{font-size:14px!important;}'
    + '#contact-page[data-venue="resort"] .cp-primary .cp-wide-name{font-size:14px!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sub,#contact-page[data-venue="resort"] .cp-map-sub,#contact-page[data-venue="resort"] .cp-app-caption{font-size:12px!important;}'
    + '#contact-page[data-venue="resort"] .cp-wide{min-height:54px!important;padding:12px 16px!important;border-radius:14px!important;}'
    + '#contact-page[data-venue="resort"] .cp-primary{min-height:48px!important;padding:10px 14px!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile{min-height:62px!important;padding:10px 9px!important;}'
    + '#contact-page[data-venue="resort"] .cp-booking{padding:16px!important;border-radius:16px!important;}'
    + '#contact-page[data-venue="resort"] .cp-body{gap:clamp(24px,4.5vh,40px)!important;}'
    + '#contact-page[data-venue="resort"] .cp-row2{margin-top:8px!important;}'
    + '#contact-page[data-venue="resort"] .cp-social{padding-top:18px!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sm{min-height:42px!important;padding:9px 6px!important;}'
    + '#contact-page[data-venue="resort"] .cp-tile-sm .cp-tile-name{font-size:12px!important;font-weight:500!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-faq-section{padding-top:0!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-faq-button{width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;min-height:54px!important;padding:12px 16px!important;border:1px solid #315967!important;border-radius:14px!important;background:#153244!important;color:#f0f5f7!important;font-family:Tajawal,sans-serif!important;font-size:14px!important;font-weight:700!important;text-align:right!important;cursor:pointer!important;}'
    + '#contact-page[data-venue="resort"] .fd-contact-faq-arrow{color:#92c4d0!important;font-size:18px!important;}'
    + '}';
  document.head.appendChild(style);

  function addFaqShortcut() {
    var page = document.querySelector('#contact-page[data-venue="resort"]');
    if (!page || page.querySelector('.fd-contact-faq-section')) return;
    var social = page.querySelector('.cp-social');
    if (!social) return;
    var section = document.createElement('section');
    section.className = 'cp-group fd-contact-faq-section';
    section.innerHTML = '<h2 class="cp-label">معلومات مفيدة</h2><button type="button" class="cp-wide fd-contact-faq-button"><span>الأسئلة الشائعة</span><span class="fd-contact-faq-arrow" aria-hidden="true">←</span></button>';
    section.querySelector('button').addEventListener('click', function () {
      if (typeof showFaq === 'function') showFaq();
    });
    social.after(section);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addFaqShortcut);
  else addFaqShortcut();
})();

/* Restore the compact FAQ flow on mobile: categories first, one category at a time, then accordion questions. */
(function () {
  var style = document.createElement('style');
  style.id = 'fd-faq-mobile-compact';
  style.textContent = '@media(max-width:599px){'
    + '#faq-overlay .faq-title{font-size:17px!important;font-weight:700!important;}'
    + '#faq-overlay .faq-page-header{padding:20px 20px 22px!important;}'
    + '#faq-overlay .fd-faq-shortcuts{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:18px!important;}'
    + '#faq-overlay .fd-faq-shortcuts button{min-height:48px!important;padding:11px 14px!important;border-radius:12px!important;font-size:14px!important;font-weight:700!important;text-align:right!important;}'
    + '#faq-list-resort .faq-section-title{font-size:13px!important;margin-bottom:8px!important;}'
    + '#faq-list-resort .faq-question-row{min-height:52px!important;padding:13px 16px!important;font-size:14px!important;}'
    + '#faq-list-resort .faq-answer{padding:0 16px 14px!important;font-size:13px!important;}'
    + '}';
  document.head.appendChild(style);

  function sectionButtons() {
    return Array.from(document.querySelectorAll('#faq-overlay .fd-faq-shortcuts button'));
  }

  function sections() {
    return Array.from(document.querySelectorAll('#faq-list-resort .faq-section'));
  }

  function collapseAnswers() {
    document.querySelectorAll('#faq-list-resort .faq-accordion-card.open').forEach(function (card) {
      card.classList.remove('open');
      var question = card.querySelector('.faq-question-row');
      if (question) question.setAttribute('aria-expanded', 'false');
    });
  }

  function hideAllSections() {
    sections().forEach(function (section) { section.hidden = true; });
    sectionButtons().forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
    collapseAnswers();
  }

  function activateSection(button) {
    var id = button.getAttribute('aria-controls');
    var section = id && document.getElementById(id);
    if (!section) return;
    var wasOpen = !section.hidden;
    hideAllSections();
    if (!wasOpen) {
      section.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    }
  }

  function wireFaq() {
    var overlay = document.getElementById('faq-overlay');
    if (!overlay || overlay.dataset.fdCompactFaq === 'true') return;
    overlay.dataset.fdCompactFaq = 'true';
    sectionButtons().forEach(function (button) {
      button.onclick = function (event) {
        event.preventDefault();
        activateSection(button);
      };
    });
    hideAllSections();
  }

  function installShowHook() {
    if (typeof window.showFaq !== 'function' || window.showFaq._fdWrapped) return;
    var originalShowFaq = window.showFaq;
    var wrapped = function () {
      originalShowFaq.apply(this, arguments);
      wireFaq();
      hideAllSections();
    };
    wrapped._fdWrapped = true;
    window.showFaq = wrapped;
  }

  function init() {
    wireFaq();
    installShowHook();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
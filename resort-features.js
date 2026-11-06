// Shared resort interactions. Checkout lives in js/service-orders.js.
var _menuBbqTypes = {};

function setMenuBbqType(name, type) {
  if (type !== 'لحم' && type !== 'دجاج') return;
  _menuBbqTypes[name] = type;
  if (window.FD_MENU_EXPERIENCE) FD_MENU_EXPERIENCE.save();
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

// Keep Meta's click ID out of copied links and the address bar.
function cleanFamilyDayURL(href) {
  var url = new URL(href || location.href);
  url.searchParams.delete('fbclid');
  return url;
}

function cabinShareURL(id) {
  var url = cleanFamilyDayURL();
  var route = String(id) === '30' ? 'chalet-detail' : 'cabin=' + id;
  var page = (window.FD_SHARE_PAGES || []).find(function (p) { return p.route === route; });
  url.pathname = page ? page.path : '/';
  url.hash = page ? '' : route;
  // A shared detail link opens on its own, without the sender's map context.
  if (url.searchParams.get('from') === 'map') url.searchParams.delete('from');
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
    inquiry.textContent = 'تواصل عبر واتساب';
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

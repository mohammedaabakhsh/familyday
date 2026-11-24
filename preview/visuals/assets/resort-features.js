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
  var button = document.getElementById('fd-cabin-share');
  button.hidden = false;
  button.disabled = false;
  button.dataset.cabinId = cabin.id;
  button.dataset.cabinName = cabin.name;
  document.getElementById('fd-cabin-share-status').textContent = '';
}

async function copyCabinURL(url) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (_) {
    var input = document.createElement('textarea');
    input.value = url;
    input.readOnly = true;
    input.className = 'fd-copy-buffer';
    document.querySelector('.fd-cabin-nav').appendChild(input);
    input.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (_) {}
    input.remove();
    return copied;
  }
}

async function shareCabin() {
  var button = document.getElementById('fd-cabin-share');
  var status = document.getElementById('fd-cabin-share-status');
  var id = button.dataset.cabinId;
  var url = cabinShareURL(id);
  status.textContent = '';
  button.disabled = true;
  try {
    if (navigator.share) {
      try {
        await navigator.share({title:button.dataset.cabinName, url:url});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    var copied = await copyCabinURL(url);
    if (button.dataset.cabinId === id) {
      status.textContent = copied ? 'تم نسخ الرابط' : 'تعذر النسخ يمكنك نسخ الرابط من شريط العنوان';
    }
  } finally {
    button.disabled = false;
    if(button.dataset.cabinId===id && !button.hidden && button.getClientRects().length) button.focus({preventScroll:true});
  }
}

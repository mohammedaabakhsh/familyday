/* Restaurant cart persistence and checkout summary. Personal order fields remain session-only. */
window.FD_MENU_EXPERIENCE = (function () {
  'use strict';
  var storageKey = 'familyday.menu-cart.v1';
  var restored = false;

  function catalog() {
    var prices = Object.create(null), extras = Object.create(null);
    Object.keys(_menuData).forEach(function (category) {
      _menuData[category].forEach(function (item) {
        if (item.bbq) {
          ['لحم', 'دجاج'].forEach(function (type) { prices[item.name + ' — ' + type] = item.price; });
        } else prices[item.name] = item.price;
        if (item.cheese) extras['جبنة|' + item.name] = { parent: item.name, price: 1 };
      });
    });
    return { prices: prices, extras: extras };
  }

  function restore() {
    if (restored) return;
    restored = true;
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || saved.version !== 1 || !Array.isArray(saved.items)) return;
      var menu = catalog(), cart = {};
      saved.items.forEach(function (item) {
        if (!item || typeof item.name !== 'string' || !Number.isSafeInteger(item.qty) || item.qty < 1) return;
        if (Object.prototype.hasOwnProperty.call(menu.prices, item.name)) {
          // Use today's menu prices, never a stored price.
          cart[item.name] = { price: menu.prices[item.name], qty: item.qty };
        }
      });
      saved.items.forEach(function (item) {
        var extra = item && menu.extras[item.name];
        if (extra && cart[extra.parent]) cart[item.name] = { price: extra.price, qty: cart[extra.parent].qty };
      });
      _menuCart = {};
      saved.items.forEach(function (item) {
        if (item && Object.prototype.hasOwnProperty.call(cart, item.name)) _menuCart[item.name] = cart[item.name];
      });
      if (Object.prototype.hasOwnProperty.call(_menuData, saved.category)) _menuCat = saved.category;
      (_menuData['بوكسات الشواء'] || []).forEach(function (item) {
        var type = saved.bbqTypes && saved.bbqTypes[item.name];
        if (type === 'لحم' || type === 'دجاج') _menuBbqTypes[item.name] = type;
      });
    } catch (_) { /* Storage may be unavailable or contain an old/corrupt draft. */ }
  }

  function save() {
    try {
      var items = Object.keys(_menuCart).map(function (name) { return { name: name, qty: _menuCart[name].qty }; });
      if (!items.length) { localStorage.removeItem(storageKey); return; }
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, items: items, category: _menuCat, bbqTypes: _menuBbqTypes }));
    } catch (_) { /* Ordering remains available without browser storage. */ }
  }

  function renderCheckout() {
    var popup = document.getElementById('order-popup');
    popup.classList.toggle('fd-menu-order', !!_isMenuOrder);
    var previous = popup.querySelector('.menu-checkout-summary');
    if (previous) previous.remove();
    if (!_isMenuOrder) return;
    popup.querySelector('[onclick="sendOrderWhatsapp()"]').textContent = 'الانتقال إلى واتساب';
    var summary = document.createElement('section');
    summary.className = 'menu-checkout-summary';
    summary.setAttribute('aria-labelledby', 'menu-checkout-title');
    var heading = document.createElement('h2');
    heading.id = 'menu-checkout-title';
    heading.textContent = 'ملخص طلبك';
    summary.appendChild(heading);
    var list = document.createElement('ul');
    Object.keys(_menuCart).forEach(function (key) {
      var item = _menuCart[key], parts = key.split('|');
      var row = document.createElement('li'), label = document.createElement('span'), price = document.createElement('strong');
      label.textContent = (parts.length > 1 ? parts[0] + ' — ' + parts[1] : key) + ' × ' + item.qty;
      price.textContent = (item.qty * item.price) + ' ريال';
      row.appendChild(label); row.appendChild(price); list.appendChild(row);
    });
    summary.appendChild(list);
    var total = document.createElement('p');
    total.className = 'menu-checkout-total';
    var label = document.createElement('span'), value = document.createElement('strong');
    label.textContent = 'الإجمالي';
    value.textContent = _menuCartTotals().price + ' ريال';
    total.appendChild(label); total.appendChild(value); summary.appendChild(total);
    document.getElementById('order-item-name').after(summary);
  }

  function resetListScroll() {
    var overlay = document.getElementById('menu-detail');
    var list = document.getElementById('menu-items'), categories = document.getElementById('menu-cats');
    var firstItem = list.getBoundingClientRect().top - overlay.getBoundingClientRect().top + overlay.scrollTop;
    overlay.scrollTop = Math.min(overlay.scrollTop, Math.max(0, firstItem - categories.offsetHeight - 12));
  }

  return { restore: restore, save: save, renderCheckout: renderCheckout, resetListScroll: resetListScroll };
})();

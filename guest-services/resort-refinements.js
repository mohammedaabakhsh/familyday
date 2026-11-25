/* Presentation only: retain the established catalogue, saved basket and WhatsApp builders. */
(function () {
  'use strict';
  if (!document.body.classList.contains('resort-portal-refinements')) return;
  var expanded = new Set();
  function compact(target) {
    target.querySelectorAll('.order-group-items>li').forEach(function (row) {
      var copy = row.querySelector('.order-item-copy');
      if (!copy || copy.querySelector('.order-line-details')) return;
      var extra = Array.from(copy.children).filter(function (node) {
        return node.tagName === 'SPAN' && !node.classList.contains('pending-copy');
      });
      if (!extra.length) return;
      var group = row.closest('[data-group]');
      var remove = row.querySelector('.remove-item');
      var key = target.id + '/' + group.dataset.group + '/' + remove.getAttribute('aria-label');
      var details = document.createElement('details');
      details.className = 'order-line-details';
      details.open = expanded.has(key);
      var summary = document.createElement('summary');
      summary.textContent = 'تفاصيل إضافية';
      summary.setAttribute('aria-label', 'تفاصيل ' + copy.querySelector('strong').textContent);
      details.appendChild(summary);
      extra.forEach(function (node) { details.appendChild(node); });
      details.addEventListener('toggle', function () {
        if (details.open) expanded.add(key);
        else if (details.isConnected) expanded.delete(key);
      });
      copy.appendChild(details);
    });
  }
  ['restaurant-items', 'order-items'].forEach(function (id) {
    var target = document.getElementById(id);
    if (!target) return;
    // Only direct list changes come from the order renderer. Wrapping nested spans
    // does not retrigger this observer or replace the original remove controls.
    new MutationObserver(function () { compact(target); }).observe(target, {childList:true});
    compact(target);
  });
})();

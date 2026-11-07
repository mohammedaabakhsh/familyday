// Social previews read HTML without running scripts. Restore the same website
// image sources in the browser, preserving size, quality and lazy-loading hints.
(function () {
  'use strict';
  function restore(root) {
    if (!root.querySelectorAll) return;
    var nodes = Array.from(root.querySelectorAll('[data-page-src],[data-page-srcset],[data-page-href]'));
    if (root.matches && root.matches('[data-page-src],[data-page-srcset],[data-page-href]')) nodes.unshift(root);
    nodes.forEach(function (node) {
      ['src', 'srcset', 'href'].forEach(function (attribute) {
        var value = node.getAttribute('data-page-' + attribute);
        if (value !== null && !node.hasAttribute(attribute)) node.setAttribute(attribute, value);
      });
    });
  }
  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) { record.addedNodes.forEach(restore); });
  });
  observer.observe(document.documentElement, {childList: true, subtree: true});
  restore(document);
  document.addEventListener('DOMContentLoaded', function () {
    restore(document);
    observer.disconnect();
  }, {once: true});
})();

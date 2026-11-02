
/* Keyboard access to the existing controls. Does not change visible copy/layout. */
(function () {
  'use strict';
  var panelIds = [
    'splash', 'dest', 'landing', 'landing2', 'landing3', 'chalet-faq', 'app', 'app2', 'contact-page',
    'faq-overlay', 'faq2-overlay', 'services-overlay', 'hospitality-detail',
    'setups-detail', 'maiya-detail', 'sharik-detail', 'contest-detail',
    'tarfihi-detail', 'walaa-detail', 'menu-detail', 'menu-cart-review',
    'ov', 'fd-dome-gallery', 'fsOverlay', 'iframeOverlay', 'order-popup'
  ];
  var modalLabels = {
    ov: 'تفاصيل مكان الإقامة', fsOverlay: 'صور مكان الإقامة', 'fd-dome-gallery': 'صور مكان الإقامة',
    iframeOverlay: 'جولة ثلاثية الأبعاد', 'order-popup': 'طلب الخدمة', 'menu-cart-review': 'مراجعة الطلب'
  };
  var focusSelector = 'button, a[href], input, select, textarea, iframe, [tabindex]';
  var activePanel = null, blocked = new Map(), remembered = new WeakMap(), scheduled = false;

  function label(el, value) {
    if (el && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', value);
  }

  function enhanceControls() {
    document.querySelectorAll('.dest-card, #services-overlay [onclick], label[onclick], .tag[data-tip]').forEach(function (el) {
      // Keep native buttons and their existing click bubbling; never create nested buttons.
      if (el.matches('button, a, input, select, textarea, .faq-question-row') || el.querySelector('button, a[href], input, select, textarea')) return;
      if (el.hasAttribute('data-fd-keyboard')) return;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('data-fd-keyboard', '');
      if (el.matches('.tag[data-tip]')) label(el, el.textContent.trim() + ': ' + el.getAttribute('data-tip'));
    });
    document.querySelectorAll('.card-btn').forEach(function (button) {
      var name = button.closest('.card').querySelector('.card-name');
      if (name) label(button, 'عرض التفاصيل والصور: ' + name.textContent.trim());
    });
    document.querySelectorAll('button[onclick]').forEach(function (button) {
      var action = button.getAttribute('onclick') || '';
      if (!button.textContent.trim() && /^(?:close|goBack)/.test(action)) label(button, 'العودة');
      if (/^moveFS\(-1\)/.test(action)) label(button, 'الصورة السابقة');
      if (/^moveFS\(1\)/.test(action)) label(button, 'الصورة التالية');
    });
    label(document.getElementById('nav-prev'), 'مكان الإقامة السابق');
    label(document.getElementById('nav-next'), 'مكان الإقامة التالي');
    label(document.querySelector('.fs-close'), 'إغلاق الصور');
    label(document.querySelector('.iframe-close'), 'إغلاق الجولة ثلاثية الأبعاد');
    var frame = document.getElementById('iframeEl');
    if (frame && !frame.title) frame.title = 'جولة ثلاثية الأبعاد في مكان الإقامة';
    document.querySelectorAll('#galWrap button').forEach(function (button, i) {
      label(button, i === 0 ? 'الصورة التالية' : 'الصورة السابقة');
    });
    Object.keys(modalLabels).forEach(function (id) {
      var panel = document.getElementById(id);
      if (!panel) return;
      panel.setAttribute('role', 'dialog');
      label(panel, modalLabels[id]);
      panel.setAttribute('tabindex', '-1');
    });
  }

  // Deliberately ignores inert, because this module manages it separately.
  function shown(el) {
    if (!el || !el.isConnected) return false;
    if (el.id === 'ov' && !el.classList.contains('open')) return false;
    for (var node = el; node && node !== document.body; node = node.parentElement) {
      var style = getComputedStyle(node);
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden') return false;
    }
    return true;
  }

  function focusable(el) {
    return !!(el && el.isConnected && !el.disabled && el.tabIndex >= 0 &&
      !el.closest('[inert]') && shown(el) && el.getClientRects().length);
  }

  function focusIn(panel) {
    var previous = remembered.get(panel);
    var target = focusable(previous) && panel.contains(previous) ? previous :
      Array.from(panel.querySelectorAll(focusSelector)).find(focusable);
    if (target) target.focus({ preventScroll: true });
    else if (panel.hasAttribute('tabindex')) panel.focus({ preventScroll: true });
  }

  function sync() {
    scheduled = false;
    enhanceControls();
    // The map uses a native modal dialog with its own focus/close behavior.
    // Leave its top-layer interaction untouched.
    if (document.querySelector('dialog[open]')) return;
    var panels = panelIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var next = null, priority = -Infinity;
    panels.forEach(function (panel) {
      if (!shown(panel)) return;
      var z = parseInt(getComputedStyle(panel).zIndex, 10) || 0;
      if (z >= priority) { priority = z; next = panel; }
    });
    if (!next) return;

    var exclusions = new Set();
    panels.forEach(function (panel) {
      if (panel === next) return;
      if (panel.contains(next)) {
        // Some service details are nested in services-overlay. Block only the
        // sibling branches, never an ancestor of the active details screen.
        for (var branch = next; branch && branch !== panel; branch = branch.parentElement) {
          Array.from(branch.parentElement.children).forEach(function (sibling) {
            if (sibling !== branch && !sibling.matches('script, style, link')) exclusions.add(sibling);
          });
        }
      } else if (!next.contains(panel) || !shown(panel)) exclusions.add(panel);
    });
    var bottomNav = document.getElementById('bottomNav');
    if (bottomNav && next.id !== 'app' && next.id !== 'services-overlay') exclusions.add(bottomNav);

    var previousPanel = activePanel;
    if (previousPanel && previousPanel.contains(document.activeElement)) remembered.set(previousPanel, document.activeElement);
    blocked.forEach(function (wasInert, node) {
      if (!exclusions.has(node)) { node.inert = wasInert; blocked.delete(node); }
    });
    exclusions.forEach(function (node) {
      if (!blocked.has(node)) { blocked.set(node, node.inert); node.inert = true; }
    });
    activePanel = next;
    Object.keys(modalLabels).forEach(function (id) {
      var panel = document.getElementById(id);
      if (panel) panel.setAttribute('aria-modal', panel === next ? 'true' : 'false');
    });
    if (next !== previousPanel && !next.contains(document.activeElement)) focusIn(next);
  }

  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(sync); }
  }
  // Programmatic startup focus must not look like a user selection.
  // Capture real keyboard input before native control/FAQ handlers run.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
      document.documentElement.setAttribute('data-fd-keyboard-mode', '');
    }
  }, true);
  document.addEventListener('pointerdown', function () {
    document.documentElement.removeAttribute('data-fd-keyboard-mode');
  }, true);
  document.addEventListener('focusin', function (event) {
    if (activePanel && activePanel.contains(event.target)) remembered.set(activePanel, event.target);
  });
  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || document.querySelector('dialog[open]')) return;
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-fd-keyboard]')) {
      event.preventDefault();
      if (!event.repeat) event.target.click();
      return;
    }
    // Keep Tab within actual modal dialogs; ordinary pages retain browser Tab behavior.
    if (event.key === 'Tab' && activePanel && modalLabels[activePanel.id]) {
      var targets = Array.from(activePanel.querySelectorAll(focusSelector)).filter(focusable);
      if (!targets.length) { event.preventDefault(); activePanel.focus(); return; }
      var first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === activePanel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === activePanel)) {
        event.preventDefault(); first.focus();
      }
    }
  });
  function init() {
    sync();
    new MutationObserver(schedule).observe(document.body, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'open', 'disabled']
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

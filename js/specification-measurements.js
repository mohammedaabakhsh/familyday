/* Shared by the guide and its illustrated maps. Input has already been HTML-escaped. */
(function () {
  'use strict';
  function formatEscaped(text) {
    return String(text).replace(
      /(\d+(?:\.\d+)?(?:\s*×\s*\d+(?:\.\d+)?)*)\s*(سم|م)(?=$|[\s.،,<])/g,
      '<bdi class="spec-measurement" dir="rtl"><bdi dir="ltr">$1</bdi> <bdi class="spec-unit" dir="rtl">$2</bdi></bdi>',
    );
  }
  window.FD_MEASUREMENTS = Object.freeze({ formatEscaped });
})();

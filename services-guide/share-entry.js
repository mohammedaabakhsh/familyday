(function () {
  'use strict';
  var destination = new URL('/services-guide/', location.origin);
  destination.search = location.search;
  var section = document.querySelector('meta[name="familyday:portal-section"]');
  var legacyItem = section && ((section.content === 'coordination' && /^#package-(1|2|3|celebration|vip|complete)$/.test(location.hash)) || (section.content === 'seating' && /^#session-[1-6]$/.test(location.hash)));
  destination.hash = section && !legacyItem ? section.content : location.hash;
  location.replace(destination.href);
})();

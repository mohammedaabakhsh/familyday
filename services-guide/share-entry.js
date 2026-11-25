(function () {
  'use strict';
  var destination = new URL('/services-guide/', location.origin);
  destination.search = location.search;
  destination.hash = location.hash;
  location.replace(destination.href);
})();

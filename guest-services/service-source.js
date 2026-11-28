/* Shared, independent catalogue. Ordering no longer reads the site's home-page HTML. */
window.FD_GUEST_SOURCE = (function () {
  'use strict';
  var messageModule;
  function loadMessageModule(url) {
    if (messageModule) return messageModule;
    messageModule = new Promise(function(resolve, reject) {
      var source = new URL(url, location.origin);
      if (source.origin !== location.origin) { reject(new Error('Invalid message source')); return; }
      var script = document.createElement('script');
      var timer = setTimeout(function(){script.remove();reject(new Error('Message source timed out'));},15000);
      script.src = source.href;
      script.onload = function(){
        clearTimeout(timer);
        var module = window.FD_MENU_ORDER_MESSAGE;
        if (!module || typeof module.build !== 'function') {reject(new Error('Invalid message source'));return;}
        resolve(module);
      };
      script.onerror = function(){clearTimeout(timer);script.remove();reject(new Error('Message source unavailable'));};
      document.head.appendChild(script);
    }).catch(function(error){messageModule=null;throw error;});
    return messageModule;
  }
  function validate(data) {
    if (data.schemaVersion !== 1 || !data.guest || !data.menuMessageScript) throw new Error('Invalid service catalogue');
    var c = data.guest;
    if (!c.menu || !Object.keys(c.menu).length || !c.cabins || !Object.keys(c.cabins).length || !c.restaurantHours) throw new Error('Menu unavailable');
    if (!c.water || !(c.water.price > 0) || !Number.isInteger(c.water.size) || c.water.size < 1 || !Array.isArray(c.water.notes)) throw new Error('Invalid water package');
    if (!c.cinema || !(c.cinema.price > 0) || !c.cinema.times.length || !c.cinema.contents.length) throw new Error('Invalid cinema package');
    if (!c.games || !c.games.contents.length || !['box','table'].every(function(key){return c.games.packages[key] && c.games.packages[key].price > 0;})) throw new Error('Invalid games package');
    if (!c.hospitality || !c.hospitality.packages.length || c.hospitality.packages.some(function(p){return !(p.price > 0) || !p.contents.length;}) || new Set(c.hospitality.packages.map(function(p){return p.id;})).size !== c.hospitality.packages.length) throw new Error('Invalid hospitality packages');
    return c;
  }
  async function load() {
    var controller = new AbortController(), timer = setTimeout(function(){controller.abort();},15000);
    try {
      var response = await fetch('/data/services.json?v=20261128-approved-pdf-v134',{cache:'no-cache',signal:controller.signal});
      if (!response.ok) throw new Error('Service catalogue unavailable');
      var data = await response.json(), catalog = validate(data);
      catalog.menuMessage = await loadMessageModule(data.menuMessageScript);
      return catalog;
    } finally {clearTimeout(timer);}
  }
  return {load:load};
})();

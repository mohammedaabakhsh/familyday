/* The main service markup is authoritative, just as it is for services-guide.
   Read it on each visit, and load the menu script version referenced there.
   Never execute the fetched document or mount its images/scripts. */
window.FD_GUEST_SOURCE = (function () {
  'use strict';
  function node(doc, selector) {
    var value=doc.querySelector(selector);
    if(!value) throw new Error('Missing service source: '+selector);
    return value;
  }
  function text(doc, selector) {return node(doc,selector).textContent.trim();}
  function list(doc, selector) {return Array.from(doc.querySelectorAll(selector),function(item){return item.textContent.trim();});}
  function number(value) {
    var match=value.match(/\d+(?:\.\d+)?/), amount=match ? Number(match[0]) : NaN;
    if(!Number.isFinite(amount) || amount<=0) throw new Error('Invalid service price or quantity');
    return amount;
  }
  function loadScript(doc, path, globalName) {
    var source=Array.from(doc.querySelectorAll('script[src]')).find(function(script){
      return new URL(script.getAttribute('src'),location.origin).pathname===path;
    });
    if(!source) return Promise.reject(new Error('Missing shared source'));
    var url=new URL(source.getAttribute('src'),location.origin);
    if(url.origin!==location.origin) return Promise.reject(new Error('Invalid shared source'));
    return new Promise(function(resolve,reject){
      var script=document.createElement('script');
      var timer=setTimeout(function(){script.remove();reject(new Error('Shared source load timed out'));},15000);
      script.src=url.href;
      script.onload=function(){clearTimeout(timer);resolve(window[globalName]);};
      script.onerror=function(){clearTimeout(timer);script.remove();reject(new Error('Shared source could not load'));};
      document.head.appendChild(script);
    });
  }
  async function load() {
    var controller=new AbortController(), timer=setTimeout(function(){controller.abort();},15000);
    var html;
    try {
      var response=await fetch('/index.html',{cache:'no-cache',signal:controller.signal});
      if(!response.ok) throw new Error('Service source unavailable');
      html=await response.text();
    } finally {clearTimeout(timer);}
    var doc=new DOMParser().parseFromString(html,'text/html');
    var water={title:text(doc,'.wm-title'),name:node(doc,'.wm-package').getAttribute('aria-label'),
      price:number(text(doc,'.wm-offer strong')),size:number(text(doc,'.wm-offer')),
      prompt:text(doc,'#wm-selection-title'),notes:list(doc,'.wm-notes-list li')};
    var cinema={title:text(doc,'.cn-title'),name:text(doc,'.cn-title'),intro:text(doc,'.cn-intro'),
      price:number(text(doc,'.cn-price')),duration:text(doc,'.cn-stat dd'),
      contentsTitle:text(doc,'#cn-inclusions-title'),contents:list(doc,'.cn-inclusions li'),notes:list(doc,'.cn-notes-list li'),
      times:Array.from(doc.querySelectorAll('#order-time option')).filter(function(option){return !!option.value;}).map(function(option){return {value:option.value,label:option.textContent.trim()};})};
    var games={title:text(doc,'.tg-title'),contentsTitle:text(doc,'#tg-games-title'),
      contents:list(doc,'.tg-games li'),notes:list(doc,'.tg-notes-list li'),packages:{}};
    ['box','table'].forEach(function(key){
      var card=node(doc,'#tarfihi-opt-'+key);
      games.packages[key]={name:text(card,'.tg-package-name'),price:number(text(card,'.tg-package-price')),description:text(card,'.tg-package-description')};
    });
    if(!Number.isInteger(water.size) || !cinema.times.length || !water.name) throw new Error('Invalid service source');
    var data=await Promise.all([loadScript(doc,'/service-data.js','_menuData'),loadScript(doc,'/js/cabin-numbers.js','FD_CABIN_NUMBERS')]);
    var menu=data[0], cabins=data[1];
    if(!menu || !Object.keys(menu).length || !cabins || !Object.keys(cabins).length) throw new Error('Menu unavailable');
    return {water:water,cinema:cinema,games:games,menu:menu,cabins:cabins};
  }
  return {load:load};
})();

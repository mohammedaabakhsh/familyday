/* Keep the existing service forms and galleries as the single source of content.
   The navigation router owns URLs/history; this module only groups the views. */
(function () {
  'use strict';
  var sections = {
    cinema: {id:'sinema-detail', label:'السينما', open:window.openSinemaDetail},
    dining: {id:'tawilat-detail', label:'طاولات الطعام', open:window.openTawilatDetail},
    seating: {id:'jalsat-detail', label:'الجلسات الخارجية', open:window.openJalsatDetail}
  };
  var shell = document.createElement('section');
  shell.id = 'setups-detail';
  shell.className = 'hide';
  shell.setAttribute('aria-labelledby','setups-title');
  shell.innerHTML = '<div class="setups-shell"><div class="setups-heading"><button type="button" class="setups-back" onclick="closeSetupsDetail()" aria-label="العودة إلى الخدمات"><svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h1 id="setups-title">الجلسات والتجهيزات</h1></div><div class="setups-tabs" role="tablist" aria-label="الجلسات والتجهيزات">' + Object.keys(sections).map(function (key) {
    return '<button id="setups-tab-'+key+'" type="button" role="tab" aria-selected="false" aria-controls="'+sections[key].id+'" tabindex="-1" onclick="selectSetupsTab(\''+key+'\')">'+sections[key].label+'</button>';
  }).join('') + '</div><div class="setups-content"></div></div>';
  document.body.appendChild(shell);
  Object.keys(sections).forEach(function (key) {
    var panel=document.getElementById(sections[key].id);
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby','setups-tab-'+key);
    panel.setAttribute('tabindex','0');
    shell.querySelector('.setups-content').appendChild(panel);
  });
  var initialized = {};
  window.openSetupsDetail = function (tab) {
    tab = sections[tab] ? tab : 'cinema';
    shell.classList.remove('hide');
    Object.keys(sections).forEach(function (key) {
      var selected=key===tab;
      var panel=document.getElementById(sections[key].id);
      panel.classList.toggle('hide',!selected);
      var button=document.getElementById('setups-tab-'+key);
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex=selected ? 0 : -1;
    });
    // Initialize once so selections and totals survive tab and order-dialog navigation.
    if(!initialized[tab]) { sections[tab].open(); initialized[tab]=true; }
    shell.scrollTop=0;
  };
  window.closeSetupsDetail = function () { shell.classList.add('hide'); };
  window.openSinemaDetail = function () { window.openSetupsDetail('cinema'); };
  window.openTawilatDetail = function () { window.openSetupsDetail('dining'); };
  window.openJalsatDetail = function () { window.openSetupsDetail('seating'); };
  // Both tablists use RTL arrow navigation and expose only the active tab to Tab.
  document.addEventListener('keydown',function (event) {
    var tab=event.target.closest('#setups-detail [role="tab"], #hospitality-detail [role="tab"]');
    if(!tab || ['ArrowRight','ArrowLeft','Home','End'].indexOf(event.key)===-1) return;
    event.preventDefault();
    var tabs=Array.from(tab.parentElement.querySelectorAll('[role="tab"]'));
    var i=tabs.indexOf(tab);
    i=event.key==='Home' ? 0 : event.key==='End' ? tabs.length-1 : (i+(event.key==='ArrowLeft' ? 1 : -1)+tabs.length)%tabs.length;
    tabs[i].click(); tabs[i].focus({preventScroll:true});
  });
})();

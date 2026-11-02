
// Tag tooltips
var _tooltip = document.getElementById('tag-tooltip');
var _tooltipTimer;

document.addEventListener('click', function(e){
  var tag = e.target.closest('.tag[data-tip]');
  if(!tag){
    _tooltip.classList.remove('show');
    return;
  }
  var rect = tag.getBoundingClientRect();
  _tooltip.textContent = tag.getAttribute('data-tip');
  var tipW = 200;
  var leftPos = rect.left + rect.width/2 - tipW/2;
  if(leftPos < 8) leftPos = 8;
  if(leftPos + tipW > window.innerWidth - 8) leftPos = window.innerWidth - tipW - 8;
  _tooltip.style.width = tipW + 'px';
  _tooltip.style.left = leftPos + 'px';
  _tooltip.style.top = (rect.top - 58) + 'px';
  _tooltip.classList.add('show');
  clearTimeout(_tooltipTimer);
  _tooltipTimer = setTimeout(function(){ _tooltip.classList.remove('show'); }, 2000);
});







function showTansidat(tab){

  document.getElementById('hospitality-detail').classList.remove('hide');
  showHospitalityTab(tab || 'hospitality');
}
function closeHospitalityDetail(){
  document.getElementById('hospitality-detail').classList.add('hide');

}
function showHospitalityTab(tab){
  if(['hospitality','coordination'].indexOf(tab)===-1) tab='hospitality';
  ['hospitality','coordination'].forEach(function(key){
    var selected=key===tab;
    document.getElementById('hd-'+key+'-panel').classList.toggle('hide',!selected);
    var button=document.getElementById('hd-tab-'+key);
    button.classList.toggle('active',selected);
    button.setAttribute('aria-selected',String(selected));
    button.tabIndex=selected ? 0 : -1;
  });
}


// Compatibility entry points used by existing navigation integrations.
function showSinema(){ openSinemaDetail(); }
function showJalsat(){ openJalsatDetail(); }
function showTawilat(){ openTawilatDetail(); }

function openSinemaDetail(){

  document.getElementById('sinema-detail').classList.remove('hide');
}
function closeSinemaDetail(){

  document.getElementById('sinema-detail').classList.add('hide');
  document.getElementById('maiya-detail').classList.add('hide');
}

function showMaiya(){
  openMaiyaDetail();
}
function buildMaiyaSlides(){
  if(_maiyaFilter==='all') _maiyaGames = _maiyaAllGames.slice();
  else _maiyaGames = _maiyaAllGames.filter(function(g){ return g.cat===_maiyaFilter; });
  var container = document.getElementById('maiya-slides');
  container.style.transition = 'none';
  container.style.transform = 'translateX(0%)';
  container.innerHTML = '';
  _maiyaGames.forEach(function(g, index){
    var slide = document.createElement('div');
    slide.className = 'wm-slide';
    slide.setAttribute('aria-hidden', String(index!==0));
    var image = document.createElement('img');
    image.className = 'wm-game-image';
    image.src = g.img;
    image.alt = g.name;
    image.width = 1200;
    image.height = 1200;
    image.loading = index===0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    slide.appendChild(image);
    container.appendChild(slide);
  });
  renderMaiyaThumbnails();
  // Reset the gallery immediately when switching categories.
  void container.offsetWidth;
  container.style.transition = '';
  ['all','عائلة','كبار','صغار'].forEach(function(f){
    var button = document.getElementById('mf-'+f);
    if(button){
      button.classList.toggle('is-active', f===_maiyaFilter);
      button.setAttribute('aria-pressed', String(f===_maiyaFilter));
    }
  });
}
function setMaiyaFilter(f){
  _maiyaFilter = f;
  buildMaiyaSlides();
  maiyaGoTo(0);
}
function openMaiyaDetail(){
  var panel = document.getElementById('maiya-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
  buildMaiyaSlides();
  maiyaGoTo(0);
  var slides = document.getElementById('maiya-slides');
  var startX = 0, startY = 0;
  slides.ontouchstart = function(e){
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  slides.ontouchend = function(e){
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){
      if(dx<0) maiyaGoTo(_maiyaIdx+1);
      else maiyaGoTo(_maiyaIdx-1);
    }
  };
}
function closeMaiyaDetail(){
  if(fdReturnToGuestServices()) return;
  document.getElementById('maiya-detail').classList.add('hide');
}
var _maiyaSelected = new Set();
function toggleMaiyaGame(){
  var game = _maiyaGames[_maiyaIdx];
  if(!game) return;
  if(_maiyaSelected.has(game.name)){
    _maiyaSelected.delete(game.name);
  } else {
    if(_maiyaSelected.size>=3) return;
    _maiyaSelected.add(game.name);
  }
  updateMaiyaSelectionUI();
}
function removeMaiyaGame(name){
  _maiyaSelected.delete(name);
  updateMaiyaSelectionUI();
  var target = document.querySelector('#maiya-selected-games button') || document.getElementById('maiya-selection-count');
  if(target) target.focus({preventScroll:true});
}
function renderMaiyaSelection(){
  var names = Array.from(_maiyaSelected);
  var list = document.getElementById('maiya-selected-games');
  var empty = document.getElementById('maiya-selection-empty');
  if(!list || !empty) return;
  list.hidden = names.length===0;
  empty.hidden = names.length>0;
  var key = names.join('|');
  // Keep thumbnails and their controls stable while browsing other games.
  if(list.getAttribute('data-selection')===key) return;
  list.setAttribute('data-selection', key);
  list.innerHTML = '';
  names.forEach(function(name){
    var game = _maiyaAllGames.find(function(g){ return g.name===name; });
    if(!game) return;
    var item = document.createElement('li');
    item.className = 'wm-selected-item';
    var image = document.createElement('img');
    image.className = 'wm-selected-image';
    image.src = game.img;
    image.alt = name;
    image.width = 240;
    image.height = 220;
    image.decoding = 'async';
    var caption = document.createElement('div');
    caption.className = 'wm-selected-caption';
    var label = document.createElement('span');
    label.className = 'wm-selected-name';
    label.textContent = name;
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'wm-remove';
    remove.setAttribute('aria-label', 'إزالة '+name);
    remove.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    remove.onclick = function(){ removeMaiyaGame(name); };
    caption.appendChild(label);
    caption.appendChild(remove);
    item.appendChild(image);
    item.appendChild(caption);
    list.appendChild(item);
  });
}
function updateMaiyaSelectionUI(){
  var count = _maiyaSelected.size;
  var countEl = document.getElementById('maiya-selection-count');
  if(countEl){
    countEl.textContent = 'اخترت '+count+' من 3';
    countEl.classList.toggle('is-complete', count===3);
  }
  renderMaiyaSelection();
  var remaining = 3-count;
  var remainingText = remaining===3 ? 'متبقي 3 ألعاب' : remaining===2 ? 'متبقي لعبتان' : 'متبقية لعبة واحدة';
  var orderButton = document.getElementById('maiya-order-btn');
  if(orderButton){
    orderButton.disabled = count!==3;
    orderButton.textContent = count===3 ? 'إكمال الطلب عبر واتساب' : remainingText;
  }
  var game = _maiyaGames[_maiyaIdx];
  var isSelected = !!game && _maiyaSelected.has(game.name);
  var full = count===3 && !isSelected;
  var selectButton = document.getElementById('maiya-select-btn');
  if(selectButton){
    selectButton.disabled = !game || full;
    selectButton.classList.toggle('is-selected', isSelected);
    selectButton.setAttribute('aria-pressed', String(isSelected));
    selectButton.textContent = isSelected ? 'تم الاختيار ✓' : full ? 'اكتملت الباقة' : 'اختر اللعبة';
  }
  var hint = document.getElementById('maiya-selection-hint');
  if(hint) hint.hidden = !game || !full;
}
function maiyaOrderNow(){
  if(_maiyaSelected.size!==3) return;
  var names = Array.from(_maiyaSelected).join('، ');
  openOrderPopup('ألعاب مائية - باقة 3 ألعاب بـ 50 ريال - الألعاب: ' + names);
}

// ===== الجلسات الخارجية =====
var _jalsatIdx = 0;
// _jalsatAllSessions is shared with the services guide (service-data.js).
var _jalsatSessions = _jalsatAllSessions.slice();
var _jalsatFilter = 'all';
function buildJalsatSlides(){
  if(_jalsatFilter==='all') _jalsatSessions = _jalsatAllSessions.slice();
  else _jalsatSessions = _jalsatAllSessions.filter(function(s){ return s.personsCat===_jalsatFilter; });
  var container = document.getElementById('jalsat-slides');
  container.innerHTML = '';
  _jalsatSessions.forEach(function(s,idx){
    var div = document.createElement('div');
    div.className = 'jl-slide';
    div.setAttribute('aria-hidden',idx===0?'false':'true');
    var img = document.createElement('img');
    img.className = 'jl-image';
    img.src = s.img;
    img.alt = s.name + ' - ' + s.persons;
    img.decoding = 'async';
    div.appendChild(img);
    container.appendChild(div);
  });
  var total = _jalsatSessions.length;
  document.getElementById('jalsat-gallery-controls').hidden = total<=1;
  var counter = document.getElementById('jalsat-counter');
  if(counter) counter.textContent = total>0 ? '1 من '+total : '0 من 0';
  ['all','2','4','8','12'].forEach(function(f){
    var btn = document.getElementById('jf-'+f);
    if(btn){
      btn.classList.toggle('is-active',f===_jalsatFilter);
      btn.setAttribute('aria-pressed',f===_jalsatFilter?'true':'false');
    }
  });
}
function setJalsatFilter(f){
  _jalsatFilter = f;
  buildJalsatSlides();
  jalsatGoTo(0);
}
function openJalsatDetail(){
  var panel = document.getElementById('jalsat-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
  buildJalsatSlides();
  jalsatGoTo(0);
  var slides = document.getElementById('jalsat-slides');
  var startX = 0, startY = 0;
  slides.ontouchstart = function(e){ startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
  slides.ontouchend = function(e){
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){
      var next = Math.max(0,Math.min(_jalsatIdx+(dx<0?1:-1),_jalsatSessions.length-1));
      if(next!==_jalsatIdx) jalsatGoTo(next);
    }
  };
}
function closeJalsatDetail(){ document.getElementById('jalsat-detail').classList.add('hide'); }

function fdOpenedFromGuestServices(){
  return new URLSearchParams(location.search).get('from') === 'guest';
}
function fdReturnToGuestServices(){
  if(!fdOpenedFromGuestServices()) return false;
  window.location.href = '/guest-services.html';
  return true;
}

// ===== المنيو =====
var _menuCat = 'ساندويتشات';
var _menuCart = {}; // {name: {price, qty}}

// _menuData is shared with the services guide (service-data.js).

function openMenuDetail(){
  FD_MENU_EXPERIENCE.restore();
  document.getElementById('menu-detail').classList.remove('hide');

  _renderMenuCats();
  _renderMenuItems();
  _updateMenuCartBar();
}
function closeMenuDetail(){
  if(fdReturnToGuestServices()) return;
  document.getElementById('menu-detail').classList.add('hide');
}

function _renderMenuCats(){
  var cats = Object.keys(_menuData);
  var el = document.getElementById('menu-cats');
  el.innerHTML = cats.map(function(cat){
    var active = cat === _menuCat;
    return '<button type="button" class="menu-cat'+(active?' is-active':'')+'" aria-pressed="'+active+'" onclick="setMenuCat(\''+cat+'\')">'+cat+'</button>';
  }).join('');
}

function setMenuCat(cat){
  _menuCat = cat;
  _renderMenuCats();
  _renderMenuItems();
  FD_MENU_EXPERIENCE.resetListScroll();
  FD_MENU_EXPERIENCE.save();
}

function _renderMenuItems(){
  var items = _menuData[_menuCat] || [];
  var el = document.getElementById('menu-items');
  el.innerHTML = items.map(function(item){
    if(item.bbq) return renderMenuBbq(item);
    // Regular item
    var qty = (_menuCart[item.name] && _menuCart[item.name].qty) || 0;
    var cheeseKey = 'جبنة|'+item.name;
    var cheeseQty = (_menuCart[cheeseKey] && _menuCart[cheeseKey].qty) || 0;
    var extrasBtn = (item.cheese && qty > 0)
      ? '<div class="menu-extras">'
        +'<button type="button" class="menu-extra'+(cheeseQty>0?' is-selected':'')+'" aria-pressed="'+(cheeseQty>0)+'" onclick="menuToggleExtra(&apos;جبنة&apos;,&apos;'+item.name+'&apos;,1)">'+(cheeseQty>0?'✓ ':'')+'إضافة جبنة · 1 ريال</button>'
        +'</div>'
      : '';
    return '<article class="menu-item'+(item.desc?' menu-item--described':'')+'" aria-label="'+item.name+'">'
      +'<div class="menu-item-info">'
      +'<h2 class="menu-item-name">'+item.name+'</h2>'
      +(item.desc?'<p class="menu-item-desc">'+item.desc+'</p>':'')
      +'<p class="menu-item-price">'+item.price+' ريال</p>'
      +'</div>'
      +'<div class="menu-controls">'
      +(qty > 0
        ? '<button type="button" class="menu-qty-button menu-qty-button--minus" aria-label="تقليل كمية '+item.name+'" onclick="menuQty(&apos;'+item.name+'&apos;,'+item.price+',-1)">−</button>'
        +'<span class="menu-qty">'+qty+'</span>'
        +'<button type="button" class="menu-qty-button" aria-label="زيادة كمية '+item.name+'" onclick="menuQty(&apos;'+item.name+'&apos;,'+item.price+',1)">+</button>'
        : '<button type="button" class="menu-qty-button" aria-label="إضافة '+item.name+'" onclick="menuQty(&apos;'+item.name+'&apos;,'+item.price+',1)">+</button>'
      )
      +'</div>'+extrasBtn+'</article>';
  }).join('');
}
function menuToggleExtra(extraName, sandwichName, price){
  var key = extraName+'|'+sandwichName;
  if(_menuCart[key] && _menuCart[key].qty > 0){
    delete _menuCart[key];
  } else {
    var sandwichQty = (_menuCart[sandwichName] && _menuCart[sandwichName].qty) || 1;
    _menuCart[key] = {price:price, qty:sandwichQty};
  }
  _renderMenuItems();
  _updateMenuCartBar();
  if(!document.getElementById('menu-cart-review').classList.contains('hide')) _renderMenuCartReview();
}
function menuQty(name, price, delta){
  if(!_menuCart[name]) _menuCart[name] = {price:price, qty:0};
  _menuCart[name].qty += delta;
  if(_menuCart[name].qty <= 0){
    delete _menuCart[name];
    delete _menuCart['جبنة|'+name];
  } else {
    // sync extras qty with sandwich qty
    var newQty = _menuCart[name].qty;
    ['جبنة'].forEach(function(ex){
      var k = ex+'|'+name;
      if(_menuCart[k]) _menuCart[k].qty = newQty;
    });
  }
  _renderMenuItems();
  _updateMenuCartBar();
  if(!document.getElementById('menu-cart-review').classList.contains('hide')) _renderMenuCartReview();
}

function _menuCartTotals(){
  var totalQty = 0, totalPrice = 0;
  Object.keys(_menuCart).forEach(function(k){
    if(k.indexOf('|') === -1) totalQty += _menuCart[k].qty;
    totalPrice += _menuCart[k].qty * _menuCart[k].price;
  });
  return {qty:totalQty, price:totalPrice};
}

function _updateMenuCartBar(){
  FD_MENU_EXPERIENCE.save();
  var bar = document.getElementById('menu-cart-bar');
  var keys = Object.keys(_menuCart);
  if(keys.length === 0){ bar.style.display='none'; return; }
  var totals = _menuCartTotals();
  bar.style.display = 'flex';
  document.getElementById('menu-cart-summary').textContent = 'إجمالي الكمية: ' + totals.qty;
  document.getElementById('menu-cart-total').textContent = 'الإجمالي: ' + totals.price + ' ريال';
}

function openMenuCartReview(){
  if(Object.keys(_menuCart).length === 0){ alert('أضف صنفًا أولًا'); return; }
  _renderMenuCartReview();
  document.getElementById('menu-cart-review').classList.remove('hide');
}
function closeMenuCartReview(){
  document.getElementById('menu-cart-review').classList.add('hide');
}
function _renderMenuCartReview(){
  var list = document.getElementById('menu-cart-review-items');
  var keys = Object.keys(_menuCart);
  if(!keys.length){ closeMenuCartReview(); return; }
  fdRenderCartItems(list, keys);
  var totals = _menuCartTotals();
  document.getElementById('menu-cart-review-count').textContent = 'إجمالي الكمية: ' + totals.qty;
  document.getElementById('menu-cart-review-total').textContent = totals.price + ' ريال';
}
function continueMenuOrder(){
  menuOrderNow();
}

function menuOrderNow(){
  var keys = Object.keys(_menuCart);
  if(keys.length===0){ alert('أضف صنفًا أولًا'); return; }
  _isMenuOrder = true;
  openOrderPopup('طلب من المطعم', false);
}

// ===== شارك واربح =====
async function copyContestHandle(button){
  var address = button.closest('.contest-social-card').querySelector('.contest-social-handle');
  var status = document.getElementById('contest-copy-status');
  var copied = false;
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(address.textContent.trim());
    copied = true;
  } catch(error) {
    try {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(address);
      selection.removeAllRanges();
      selection.addRange(range);
      copied = document.execCommand('copy');
      if(copied) selection.removeAllRanges();
    } catch(fallbackError) { copied = false; }
  }
  button.disabled = false;
  document.querySelectorAll('#contest-detail .contest-social-actions button').forEach(function(item){item.textContent='نسخ اسم المستخدم';});
  button.textContent = copied ? 'تم النسخ ✓' : 'نسخ اسم المستخدم';
  status.textContent = copied ? 'تم نسخ اسم مستخدم ' + button.closest('.contest-social-card').querySelector('h4').textContent + '.' : 'حدد اسم الحساب واضغط «نسخ».';
}
function showContest(){
  document.getElementById('contest-copy-status').textContent = '';
  document.querySelectorAll('#contest-detail .contest-social-actions button').forEach(function(button){button.textContent='نسخ اسم المستخدم';});
  var panel = document.getElementById('contest-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
}
function closeContestDetail(){ document.getElementById('contest-detail').classList.add('hide'); }
function showSharik(){
  var panel = document.getElementById('sharik-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
  document.getElementById('sharik-copy-email').textContent = 'نسخ البريد';
  document.getElementById('sharik-copy-status').textContent = '';
}
function closeSharikDetail(){ document.getElementById('sharik-detail').classList.add('hide');  }
async function copySharikEmail(){
  var address = document.getElementById('sharik-email-address');
  var button = document.getElementById('sharik-copy-email');
  var status = document.getElementById('sharik-copy-status');
  var copied = false;
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(address.textContent.trim());
    copied = true;
  } catch (error) {
    try {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(address);
      selection.removeAllRanges();
      selection.addRange(range);
      copied = document.execCommand('copy');
      if(copied) selection.removeAllRanges();
    } catch (fallbackError) { copied = false; }
  }
  button.disabled = false;
  button.textContent = copied ? 'تم النسخ' : 'نسخ البريد';
  status.textContent = copied ? 'تم نسخ البريد الإلكتروني.' : 'حدد البريد واضغط «نسخ» لإكمال النسخ يدويًا.';
}


var _jalsatCakeAdded = false;
function toggleJalsatCake(){
  _jalsatCakeAdded = !_jalsatCakeAdded;
  updateJalsatSummary();
}
function updateJalsatSummary(){
  var s = _jalsatSessions[_jalsatIdx];
  if(!s) return;
  var label = document.getElementById('jalsat-cake-label');
  label.classList.toggle('is-selected',_jalsatCakeAdded);
  label.setAttribute('aria-pressed',_jalsatCakeAdded?'true':'false');
  document.getElementById('jalsat-order-session').textContent = s.name + (s.name.indexOf(' لـ') === -1 ? ' · ' + s.persons : '');
  document.getElementById('jalsat-order-base').textContent = s.price;
  document.getElementById('jalsat-order-base').hidden = !_jalsatCakeAdded;
  document.getElementById('jalsat-order-addon').hidden = !_jalsatCakeAdded;
  document.getElementById('jalsat-total-price').textContent = (parseInt(s.price,10)+(_jalsatCakeAdded?170:0)) + ' ريال';
}
function getJalsatOrderText(){
  var s = _jalsatSessions[_jalsatIdx];
  if(!s) return 'جلسة أرضية';
  var txt = s.name + (s.name.indexOf(' لـ') === -1 ? ' - ' + s.persons : '') + ' - السعر: ' + s.price;
  if(_jalsatCakeAdded){
    var base = parseInt(s.price);
    txt += ' + كيك وعصير (170 ريال) - المجموع: ' + (base+170) + ' ريال';
  }
  return txt;
}

function jalsatGoTo(idx){
  var total = _jalsatSessions.length;
  if(total===0) return;
  idx = Math.max(0, Math.min(idx, total-1));
  _jalsatCakeAdded = false;
  _jalsatIdx = idx;
  var slides = document.getElementById('jalsat-slides');
  slides.style.transform = 'translateX('+(idx*100)+'%)';
  Array.prototype.forEach.call(slides.children,function(slide,i){slide.setAttribute('aria-hidden',i===idx?'false':'true');});
  var s = _jalsatSessions[idx];
  var nameEl = document.getElementById('jalsat-session-name'); if(nameEl) nameEl.textContent = s.name;
  var descEl = document.getElementById('jalsat-session-desc'); if(descEl){ descEl.textContent = s.desc||''; descEl.style.display = s.desc ? 'block' : 'none'; }
  document.getElementById('jalsat-persons').textContent = s.persons;
  document.getElementById('jalsat-price').textContent = s.price;
  var counter = document.getElementById('jalsat-counter');
  if(counter) counter.textContent = (idx+1) + ' من ' + total;
  document.getElementById('jalsat-prev').disabled = idx===0;
  document.getElementById('jalsat-next').disabled = idx===total-1;
  updateJalsatSummary();
}

var _maiyaIdx = 0;
// _maiyaAllGames is shared with the services guide (service-data.js).
var _maiyaGames = _maiyaAllGames.slice();
var _maiyaFilter = 'all';
function maiyaGoTo(idx){
  var total = _maiyaGames.length;
  idx = total ? Math.max(0, Math.min(idx, total-1)) : 0;
  _maiyaIdx = idx;
  updateMaiyaThumbnail();
  var slides = document.getElementById('maiya-slides');
  slides.style.transform = 'translateX('+(idx*100)+'%)';
  Array.from(slides.children).forEach(function(slide, index){
    slide.setAttribute('aria-hidden', String(index!==idx));
  });
  var game = _maiyaGames[idx];
  var nameEl = document.getElementById('maiya-game-name');
  if(nameEl) nameEl.textContent = game ? game.name : 'لا توجد ألعاب في هذه الفئة';
  var counter = document.getElementById('maiya-counter');
  if(counter) counter.textContent = total ? (idx+1)+' من '+total : '0 من 0';
  var previous = document.getElementById('maiya-prev');
  var next = document.getElementById('maiya-next');
  if(previous){ previous.hidden = total<=1; previous.disabled = idx===0; }
  if(next){ next.hidden = total<=1; next.disabled = idx>=total-1; }
  updateMaiyaSelectionUI();
}

// ===== طاولات الطعام =====
var _tawilatSize = 6;
var _tawilatOpt = '';
// _tawilatPrices is shared with the services guide (service-data.js).
// _tawilatTables is shared with the services guide (service-data.js).

function openTawilatDetail(){
  document.getElementById('tawilat-detail').classList.remove('hide');
  document.getElementById('tawilat-detail').scrollTop = 0;

  document.body.style.overflow='hidden';
  updateTawilatPrices();
  selectTawilatOpt(_tawilatOpt);
  updateTawilatContents();
}
function closeTawilatDetail(){
  document.getElementById('tawilat-detail').classList.add('hide');
  document.body.style.overflow='';

}
function setTawilatSize(n){
  _tawilatSize = n;
  _tawilatOpt = '';
  [6,12,18,24,32].forEach(function(s){
    var btn = document.getElementById('ts-'+s);
    if(btn){
      btn.classList.toggle('is-active', s===n);
      btn.setAttribute('aria-pressed', String(s===n));
    }
  });
  updateTawilatPrices();
  selectTawilatOpt('');
}
function updateTawilatPrices(){
  var p = _tawilatPrices[_tawilatSize];
  var el1 = document.getElementById('tawilat-price-tansiq');
  var el2 = document.getElementById('tawilat-price-plain');
  if(el1) el1.textContent = p.tansiq + ' ريال';
  if(el2) el2.textContent = p.plain + ' ريال';
}
function selectTawilatOpt(opt){
  _tawilatOpt = opt;
  ['tansiq','plain'].forEach(function(l){
    var el = document.getElementById('tawilat-opt-'+l);
    if(el){
      el.classList.toggle('is-selected', l===opt);
      el.setAttribute('aria-pressed', String(l===opt));
    }
  });
  updateTawilatContents();
  updateTawilatSummary();
}
function updateTawilatSummary(){
  var orderButton=document.querySelector('#tawilat-detail button[onclick="tawilatOrder()"]');
  if(orderButton){orderButton.disabled=!_tawilatOpt;orderButton.textContent=_tawilatOpt?'إكمال الطلب عبر واتساب':'اختر التجهيز لإكمال الطلب';}
  var box = document.getElementById('tawilat-price-summary');
  var lbl = document.getElementById('tawilat-summary-label');
  var priceEl = document.getElementById('tawilat-summary-price');
  if(!box || !lbl || !priceEl) return;
  if(!_tawilatOpt){
    lbl.textContent = 'اختر التجهيز لعرض الإجمالي';
    priceEl.textContent = '';
    return;
  }
  var p = _tawilatPrices[_tawilatSize][_tawilatOpt];
  var optName = _tawilatOpt==='tansiq' ? 'مع تنسيق' : 'بدون تنسيق';
  lbl.textContent = _tawilatSize + (_tawilatSize===6?' أشخاص':' شخصًا') + ' · ' + optName;
  priceEl.textContent = p + ' ريال';
}
function updateTawilatContents(){
  var section = document.getElementById('tawilat-contents');
  var el = document.getElementById('tawilat-contents-list');
  if(section) section.classList.toggle('hide', _tawilatOpt!=='tansiq');
  if(!el || _tawilatOpt!=='tansiq') return;
  var items = [
    'طاولات زجاجية أنيقة',
    'كراسي أكريليك شفافة',
    'أطقم تقديم متكاملة',
    'مناديل قماش',
    'تنسيق زهور',
    'حاملات شموع مزودة بالشموع'
  ];
  el.innerHTML = items.map(function(item){ return '<li>'+item+'</li>'; }).join('');
}
function tawilatOrder(){
  if(!_tawilatOpt){ alert('يرجى اختيار الخيار أولاً'); return; }
  var opt = _tawilatOpt==='tansiq' ? 'مع تنسيق' : 'بدون تنسيق';
  var price = _tawilatPrices[_tawilatSize][_tawilatOpt];
  var name = 'طاولات الطعام - ' + _tawilatSize + (_tawilatSize===6?' أشخاص':' شخصًا') + ' - ' + opt + ' (' + price + ' ريال)';
  openOrderPopup(name);
}

// ===== بطاقة الولاء =====
function showWalaa(){
  var panel = document.getElementById('walaa-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
  document.body.style.overflow='hidden';

}
function closeWalaaDetail(){
  document.getElementById('walaa-detail').classList.add('hide');
  document.body.style.overflow='';

}

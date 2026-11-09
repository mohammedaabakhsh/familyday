
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

// ===== الجلسات الخارجية =====
var _jalsatIdx = 0;
// _jalsatAllSessions is shared with the services guide (service-data.js).
var _jalsatSessions = _jalsatAllSessions.slice();
var _jalsatFilter = 'all';
var _jalsatCakeBySession = {};
function buildJalsatSlides(){
  // Keep the checkout restoration API while displaying independent session cards.
  _jalsatSessions = _jalsatAllSessions.slice();
  var container = document.getElementById('jalsat-cards');
  if(container.children.length) return;
  var template = document.getElementById('jalsat-card-template');
  _jalsatSessions.forEach(function(session,index){
    var card = template.content.firstElementChild.cloneNode(true);
    card.id = 'jalsat-card-'+index;
    card.querySelector('.jl-card-title').textContent = session.name;
    card.querySelector('.jl-card-persons').textContent = session.persons;
    card.querySelector('.jl-card-price').textContent = session.price;
    var photo = card.querySelector('.jl-card-image');
    photo.src = session.img;
    photo.alt = session.name;
    card.querySelector('.jl-description').textContent = session.desc;
    var addon = card.querySelector('.jl-addon-option');
    addon.setAttribute('aria-label','إضافة كيك وعصير بـ170 ريال إلى '+session.name);
    addon.addEventListener('click',function(){toggleJalsatCake(index);});
    card.querySelector('.jl-order-button').addEventListener('click',function(){addJalsatToCart(index);});
    container.appendChild(card);
    setupJalsatQuantity(card,index);
    renderJalsatCard(index);
  });
}
function renderJalsatCard(index){
  var session = _jalsatSessions[index], card = document.getElementById('jalsat-card-'+index);
  if(!session || !card) return;
  renderJalsatSelection(index,card,session);
}
function openJalsatDetail(){
  var panel = document.getElementById('jalsat-detail');
  panel.classList.remove('hide');
  panel.scrollTop = 0;
  buildJalsatSlides();
  restoreJalsatCart();
}
function closeJalsatDetail(){ document.getElementById('jalsat-detail').classList.add('hide'); }

function fdOpenedFromGuestServices(){
  return new URLSearchParams(location.search).get('from') === 'guest';
}
function fdReturnToGuestServices(){
  if(!fdOpenedFromGuestServices()) return false;
  window.location.href = '/guest-services/';
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
    var extrasBtn = (item.cheesePrice && qty > 0)
      ? '<div class="menu-extras">'
        +'<button type="button" class="menu-extra'+(cheeseQty>0?' is-selected':'')+'" aria-pressed="'+(cheeseQty>0)+'" onclick="menuToggleExtra(&apos;جبنة&apos;,&apos;'+item.name+'&apos;,'+item.cheesePrice+')">'+(cheeseQty>0?'✓ ':'')+'إضافة جبنة · '+item.cheesePrice+' ريال</button>'
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
function toggleJalsatCake(index){
  if(!Number.isInteger(index)) index = _jalsatIdx;
  if(!_jalsatSessions[index]) return;
  _jalsatIdx = index;
  var draft = jalsatDraft(index);
  draft.cakes = draft.cakes ? 0 : 1;
  _jalsatCakeAdded = draft.cakes > 0;
  updateJalsatSummary();
}
function updateJalsatSummary(){
  var draft = jalsatDraft(_jalsatIdx);
  draft.cakes = _jalsatCakeAdded ? Math.max(1,draft.cakes) : 0;
  _jalsatCakeBySession[_jalsatIdx] = !!_jalsatCakeAdded;
  renderJalsatCard(_jalsatIdx);
}
function jalsatOrder(index){
  if(Number.isInteger(index)) jalsatGoTo(index);
  var session = _jalsatSessions[_jalsatIdx];
  if(session) openOrderPopup({type:'seating',index:_jalsatAllSessions.indexOf(session),cake:_jalsatCakeAdded});
}
function jalsatGoTo(index){
  if(!Number.isInteger(index) || !_jalsatSessions[index]) return;
  buildJalsatSlides();
  _jalsatIdx = index;
  _jalsatCakeAdded = !!_jalsatCakeBySession[index];
  document.getElementById('jalsat-card-'+index).open = true;
  updateJalsatSummary();
}

// ===== طاولات الطعام =====
var _tawilatSize = 6;
var _tawilatOpt = '';
function buildTawilatCards(){
  var host=document.getElementById('dining-cards');
  if(host.children.length) return;
  var source=document.getElementById('dining-card-template').content;
  var photo=source.querySelector('.fd-dining-image').cloneNode(true);
  var image=photo.querySelector('img');
  image.src='/'+image.getAttribute('data-page-src').replace(/^\//,'');
  image.removeAttribute('data-page-src');
  document.getElementById('dining-photo').replaceChildren(photo,source.querySelector('.fd-dining-caption').cloneNode(true));
  host.appendChild(FD_DINING_CARDS.table(document,true));
  document.getElementById('dining-details').appendChild(FD_DINING_CARDS.details(document));
  host.querySelectorAll('.fd-dining-option').forEach(function(button){
    button.addEventListener('click',function(){setTawilatSize(Number(button.dataset.size));selectTawilatOpt(button.dataset.option);});
  });
}
function openTawilatDetail(){
  document.getElementById('tawilat-detail').classList.remove('hide');
  document.getElementById('tawilat-detail').scrollTop=0;
  document.body.style.overflow='hidden';
  buildTawilatCards();
}
function closeTawilatDetail(){
  document.getElementById('tawilat-detail').classList.add('hide');
  document.body.style.overflow='';
}
function setTawilatSize(n){
  if(!Object.prototype.hasOwnProperty.call(_tawilatPrices,n)) return;
  buildTawilatCards();
  if(_tawilatSize!==Number(n)) _tawilatOpt='';
  _tawilatSize=Number(n);
}
function selectTawilatOpt(opt){
  if(['plain','tansiq',''].indexOf(opt)===-1) return;
  _tawilatOpt=opt;
  var selected;
  document.querySelectorAll('#dining-cards .fd-dining-option').forEach(function(button){
    var active=Number(button.dataset.size)===_tawilatSize && button.dataset.option===opt;
    button.setAttribute('aria-pressed',String(active));
    if(active) selected=button;
  });
  document.getElementById('dining-selection').textContent=selected ? selected.dataset.selection : '';
  document.querySelector('#tawilat-detail .fd-dining-total strong').textContent=opt ? _tawilatPrices[_tawilatSize][opt]+' ريال' : '—';
  document.querySelector('#tawilat-detail .fd-dining-checkout').disabled=!opt;
}
function tawilatOrder(){
  if(!_tawilatOpt) return;
  openOrderPopup({type:'dining',size:_tawilatSize,option:_tawilatOpt});
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

// Use the same real package photos and gallery controls as the customer guide.
(function () {
  Object.keys(_coordinationPhotos).forEach(function (id) {
    var heading = document.getElementById(id);
    if (!heading) return;
    var card = heading.closest('.hd-package');
    var summary = card.querySelector('.hd-package-details > summary');
    if (!summary) return;
    summary.querySelector('span').textContent = 'الصور وتفاصيل الباقة';
    summary.setAttribute('aria-label', 'الصور وتفاصيل ' + heading.textContent.trim());
    summary.insertAdjacentHTML('afterend', FD_GUIDE_GALLERY.markup(
      _coordinationPhotos[id], heading.textContent.trim(), 'تنسيق باقة ' + heading.textContent.trim()
    ));
    FD_GUIDE_GALLERY.mount(card);
  });
})();

// Session-only drafts. Never infer a booking or share fields between services.
var FD_ORDER_DRAFTS = (function(){
  var drafts = Object.create(null), active = null;
  var fields = ['order-name','order-villa','order-notes','order-time'];
  function save(){
    if(!active) return;
    var value = {};
    fields.forEach(function(id){ value[id] = document.getElementById(id).value; });
    drafts[active] = value;
  }
  return {
    save: save,
    restore: function(key){
      active = key;
      var draft = drafts[key];
      if(!draft) return;
      fields.forEach(function(id){document.getElementById(id).value = draft[id] || '';});
      updateCabinNum();
    },
    close: function(){save();active = null;},
    clear: function(){if(active) delete drafts[active];active = null;}
  };
})();
var _orderDraftScope = '';

function fdRenderCartItems(list, keys){
  var focused = list.contains(document.activeElement) ? document.activeElement : null;
  var focusKey = focused && focused.dataset.cartKey;
  var focusAction = focused && focused.dataset.cartAction;
  list.replaceChildren();
  keys.forEach(function(key){
    var entry = _menuCart[key], extra = key.indexOf('|') !== -1;
    var label = extra ? key.split('|')[0] + ' — ' + key.split('|')[1] : key;
    var row = document.createElement('div');row.className = 'fd-cart-row';
    var copy = document.createElement('div');copy.className = 'fd-cart-copy';
    var title = document.createElement('strong');title.textContent = label;copy.appendChild(title);
    var price = document.createElement('span');
    price.textContent = (extra ? 'إضافة · ' : '') + entry.qty + ' × ' + entry.price + ' ريال';
    copy.appendChild(price);row.appendChild(copy);
    var total = document.createElement('strong');total.className = 'fd-cart-line-total';
    total.textContent = entry.qty * entry.price + ' ريال';row.appendChild(total);
    var controls = document.createElement('div');controls.className = 'fd-cart-row-controls';
    function button(text, action, aria, handler){
      var b = document.createElement('button');b.type = 'button';b.textContent = text;
      b.className = 'fd-cart-' + action;b.dataset.cartKey = key;b.dataset.cartAction = action;
      b.setAttribute('aria-label',aria);b.addEventListener('click',handler);controls.appendChild(b);
    }
    // Add-ons follow the item's quantity; they can be removed separately.
    if(!extra){
      button('+','plus','زيادة كمية ' + label,function(){menuQty(key,entry.price,1);});
      var qty = document.createElement('span');qty.className = 'fd-cart-qty';qty.textContent = entry.qty;controls.appendChild(qty);
      button('−','minus','تقليل كمية ' + label,function(){menuQty(key,entry.price,-1);});
    }
    button('حذف','remove','حذف ' + label,function(){
      if(extra){delete _menuCart[key];_renderMenuItems();_updateMenuCartBar();_renderMenuCartReview();}
      else menuQty(key,entry.price,-entry.qty);
    });
    row.appendChild(controls);list.appendChild(row);
  });
  if(focused){
    var same = Array.from(list.querySelectorAll('button')).find(function(b){return b.dataset.cartKey===focusKey && b.dataset.cartAction===focusAction;});
    var target = same || list.querySelector('button');
    if(target) target.focus({preventScroll:true});
  }
}

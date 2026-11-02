/* Guest extras have one catalog: the names and unit prices in index.html.
   A tab-scoped draft survives visits to the existing restaurant/service pages. */
(function () {
  'use strict';
  var storageKey = 'familyday.guest-extras.v1';
  var phone = '966556156693';
  var form = document.getElementById('extras-order');
  var cabin = document.getElementById('cabin-number');
  var summary = document.getElementById('order-items');
  var send = form.querySelector('.send-order');
  var shortcut = document.getElementById('order-shortcut');
  var shortcutTotal = document.getElementById('shortcut-total');
  var items = Array.from(document.querySelectorAll('[data-extra]')).map(function (row) {
    return {id:row.dataset.extra, name:row.querySelector('h3').textContent,
      price:Number(row.querySelector('.extra-price bdi').textContent), quantity:0, row:row};
  });

  function latinDigits(value) {
    return String(value).replace(/[٠-٩۰-۹]/g,function (digit) {
      var code=digit.charCodeAt(0);
      return String(code-(code>=1776?1776:1632));
    });
  }
  function save() {
    try {
      var quantities={};
      items.forEach(function (item) { quantities[item.id]=item.quantity; });
      sessionStorage.setItem(storageKey,JSON.stringify({cabin:cabin.value,quantities:quantities}));
    } catch (_) { /* Ordering remains available when browser storage is blocked. */ }
  }
  function selectedItems() { return items.filter(function (item) { return item.quantity>0; }); }
  function total() {
    return items.reduce(function (sum,item) { return sum+item.quantity*item.price; },0);
  }
  function render() {
    var count=0;
    summary.replaceChildren();
    items.forEach(function (item) {
      count+=item.quantity;
      item.row.classList.toggle('is-selected',item.quantity>0);
      item.row.querySelector('output').textContent=String(item.quantity);
      item.row.querySelector('[data-step="-1"]').disabled=item.quantity===0;
      item.row.querySelector('[data-step="1"]').disabled=item.quantity===99;
      if (!item.quantity) return;
      var li=document.createElement('li'),label=document.createElement('span'),price=document.createElement('bdi');
      label.textContent=item.name+' × '+item.quantity;
      price.textContent=String(item.quantity*item.price)+' ر.س';
      li.append(label,price);summary.appendChild(li);
    });
    summary.hidden=count===0;
    document.getElementById('order-count').textContent=count?'الكمية المختارة: '+count:'لم تختر أي طلبات بعد';
    var totalValue=total();
    document.getElementById('order-total').textContent=String(totalValue);
    send.disabled=count===0;
    shortcut.hidden=count===0;
    shortcutTotal.textContent=String(totalValue);
    document.body.classList.toggle('has-order-shortcut',count>0);
  }

  try {
    var draft=JSON.parse(sessionStorage.getItem(storageKey));
    if (draft && typeof draft==='object') {
      var savedCabin=latinDigits(draft.cabin||'');
      if (/^[0-9]{1,4}$/.test(savedCabin)) cabin.value=savedCabin;
      items.forEach(function (item) {
        var quantity=draft.quantities && draft.quantities[item.id];
        if (Number.isInteger(quantity) && quantity>=0 && quantity<=99) item.quantity=quantity;
      });
    }
  } catch (_) { /* Ignore an invalid or unavailable draft. */ }

  items.forEach(function (item) {
    item.row.querySelectorAll('[data-step]').forEach(function (button) {
      button.addEventListener('click',function () {
        item.quantity=Math.max(0,Math.min(99,item.quantity+Number(button.dataset.step)));
        render();save();
      });
    });
  });
  cabin.addEventListener('input',function () {
    cabin.value=latinDigits(cabin.value);
    save();
  });
  shortcut.addEventListener('click',function () {
    form.scrollIntoView({behavior:'smooth',block:'start'});
  });
  form.addEventListener('submit',function (event) {
    event.preventDefault();
    var selected=selectedItems();
    if (!selected.length || !form.reportValidity()) return;
    save();
    var lines=['السلام عليكم،','أرغب بطلب التالي للكوخ رقم '+cabin.value+':',''];
    selected.forEach(function (item) {
      lines.push('• '+item.name+' × '+item.quantity+' — '+(item.quantity*item.price)+' ر.س');
    });
    lines.push('','الإجمالي: '+total()+' ر.س','يرجى تأكيد التوفر والطلب.');
    // Opening a prepared message does not mean the guest has sent or confirmed it.
    window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener,noreferrer');
  });
  render();
})();

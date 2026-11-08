/* Session quantities and add-ons stay separate; all prices come from the catalog. */
var _jalsatDrafts = {};
var _jalsatCart = [];
var JALSAT_CART_KEY = 'familyday.seating-cart.v1';
function jalsatDraft(index){
  return _jalsatDrafts[index] || (_jalsatDrafts[index]={quantity:1,cakes:0});
}
function setupJalsatQuantity(card,index){
  ['session','cake'].forEach(function(kind){
    card.querySelectorAll('.jl-'+kind+'-quantity button').forEach(function(button){
      button.addEventListener('click',function(){
        var draft=jalsatDraft(index), change=Number(button.dataset.change);
        if(kind==='session'){
          draft.quantity=Math.max(1,Math.min(99,draft.quantity+change));
          draft.cakes=Math.min(draft.cakes,draft.quantity);
        } else draft.cakes=Math.max(1,Math.min(draft.quantity,draft.cakes+change));
        renderJalsatCard(index);
      });
    });
  });
}
function renderJalsatSelection(index,card,session){
  var draft=jalsatDraft(index), cake=draft.cakes>0, price=parseInt(session.price,10);
  _jalsatCakeBySession[index]=cake;
  var addon=card.querySelector('.jl-addon-option');
  addon.classList.toggle('is-selected',cake);
  addon.setAttribute('aria-pressed',String(cake));
  [['session',draft.quantity,1,99],['cake',draft.cakes,1,draft.quantity]].forEach(function(row){
    var control=card.querySelector('.jl-'+row[0]+'-quantity');
    control.querySelector('output').textContent=row[1];
    control.querySelector('[data-change="-1"]').disabled=row[1]<=row[2];
    control.querySelector('[data-change="1"]').disabled=row[1]>=row[3];
  });
  card.querySelector('.jl-cake-quantity').hidden=!cake || draft.quantity===1;
  card.querySelector('.jl-card-base').hidden=!cake;
  card.querySelector('.jl-card-base span:first-child').textContent='الجلسات × '+draft.quantity;
  card.querySelector('.jl-card-base span:last-child').textContent=price*draft.quantity+' ريال';
  card.querySelector('.jl-card-addon').hidden=!cake;
  card.querySelector('.jl-card-addon span:first-child').textContent='كيك وعصير × '+draft.cakes;
  card.querySelector('.jl-card-addon span:last-child').textContent=170*draft.cakes+' ريال';
  card.querySelector('.jl-total strong').textContent=(price*draft.quantity+170*draft.cakes)+' ريال';
  card.querySelector('.jl-added-status').textContent='';
}
function validJalsatItems(items){
  if(!Array.isArray(items) || !items.length || items.length>_jalsatAllSessions.length) return null;
  var seen={};
  for(var i=0;i<items.length;i++){
    var item=items[i];
    if(!item || !Number.isInteger(item.index) || !_jalsatAllSessions[item.index] || seen[item.index] ||
      !Number.isInteger(item.quantity) || item.quantity<1 || item.quantity>99 ||
      !Number.isInteger(item.cakes) || item.cakes<0 || item.cakes>item.quantity) return null;
    seen[item.index]=true;
  }
  return items.map(function(item){return {index:item.index,quantity:item.quantity,cakes:item.cakes};});
}
function saveJalsatCart(){
  try{sessionStorage.setItem(JALSAT_CART_KEY,JSON.stringify(_jalsatCart));}catch(e){}
}
function restoreJalsatCart(){
  try{_jalsatCart=validJalsatItems(JSON.parse(sessionStorage.getItem(JALSAT_CART_KEY))) || [];}catch(e){_jalsatCart=[];}
  renderJalsatCart();
}
function getJalsatCartDetails(selection,restore){
  var items=validJalsatItems(selection.items);
  if(!items) return null;
  var total=0,lines=[];
  items.forEach(function(item,i){
    var session=_jalsatAllSessions[item.index],base=parseInt(session.price,10),subtotal=base*item.quantity+170*item.cakes;
    if(i) lines.push('');
    lines.push(session.name,
      'الجلسات: '+item.quantity+' × '+base+' ريال = '+base*item.quantity+' ريال');
    if(item.cakes) lines.push('كيك وعصير: '+item.cakes+' × 170 ريال = '+170*item.cakes+' ريال');
    lines.push('المجموع: '+subtotal+' ريال');
    total+=subtotal;
  });
  lines.push('','إجمالي الطلب: '+total+' ريال');
  if(restore){_jalsatCart=items;saveJalsatCart();renderJalsatCart();}
  return {title:'الجلسات الخارجية',summary:lines,message:lines,price:total};
}
function addJalsatToCart(index){
  var draft=jalsatDraft(index),existing=_jalsatCart.find(function(item){return item.index===index;});
  var status=document.querySelector('#jalsat-card-'+index+' .jl-added-status');
  if(existing && existing.quantity+draft.quantity>99){status.textContent='الحد الأقصى 99 جلسة من هذا النوع';return;}
  if(existing){existing.quantity+=draft.quantity;existing.cakes+=draft.cakes;}
  else _jalsatCart.push({index:index,quantity:draft.quantity,cakes:draft.cakes});
  saveJalsatCart();renderJalsatCart();
  status.textContent='تمت الإضافة إلى ملخص الطلب بالأسفل';
}
function removeJalsatCartItem(index){
  _jalsatCart=_jalsatCart.filter(function(item){return item.index!==index;});
  saveJalsatCart();renderJalsatCart();
  var next=document.querySelector('#jalsat-cart-items button') || document.querySelector('#jalsat-card-'+index+' .jl-order-button');
  if(next) next.focus();
}
function renderJalsatCart(){
  var section=document.getElementById('jalsat-cart');
  if(!section) return;
  section.hidden=!_jalsatCart.length;
  var container=document.getElementById('jalsat-cart-items');
  container.replaceChildren();
  _jalsatCart.forEach(function(item){
    var session=_jalsatAllSessions[item.index],row=document.createElement('div');
    row.className='jl-cart-item';
    var title=document.createElement('h3');title.textContent=session.name;row.appendChild(title);
    var details=document.createElement('p');
    details.textContent='عدد الجلسات: '+item.quantity+(item.cakes ? ' · كيك وعصير: '+item.cakes : '');row.appendChild(details);
    var price=document.createElement('strong');price.textContent=(parseInt(session.price,10)*item.quantity+170*item.cakes)+' ريال';row.appendChild(price);
    var remove=document.createElement('button');remove.type='button';remove.textContent='حذف';remove.setAttribute('aria-label','حذف '+session.name+' من الطلب');
    remove.addEventListener('click',function(){removeJalsatCartItem(item.index);});row.appendChild(remove);
    container.appendChild(row);
  });
  var order=getJalsatCartDetails({items:_jalsatCart},false);
  document.getElementById('jalsat-cart-total').textContent=(order ? order.price : 0)+' ريال';
  document.getElementById('jalsat-checkout').disabled=!order;
}
function checkoutJalsatCart(){
  var items=validJalsatItems(_jalsatCart);
  if(items) openOrderPopup({type:'seating-cart',items:items});
}

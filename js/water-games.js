/* Water packages share their base size and price with the guest-services source. */
var _maiyaQuantities = {adults:0,children:0};
var _maiyaPackages = 1;
var _maiyaPackage = null;
function getMaiyaPackage(){
  if(!_maiyaPackage){
    _maiyaPackage={size:Number(document.getElementById('wm-offer-size').textContent),
      price:Number(document.querySelector('.wm-offer strong').textContent)};
  }
  return _maiyaPackage;
}
function showMaiya(){ openMaiyaDetail(); }
function openMaiyaDetail(){
  var panel=document.getElementById('maiya-detail');
  panel.classList.remove('hide');
  panel.scrollTop=0;
  renderMaiyaQuantities();
}
function closeMaiyaDetail(){
  if(typeof fdReturnToGuestServices==='function' && fdReturnToGuestServices()) return;
  document.getElementById('maiya-detail').classList.add('hide');
}
function changeMaiyaPackages(step){
  if(step!==1 && step!==-1) return;
  var next=Math.max(1,Math.min(20,_maiyaPackages+step));
  if(next===_maiyaPackages) return;
  _maiyaPackages=next;
  if(_maiyaQuantities.adults+_maiyaQuantities.children>getMaiyaPackage().size*next){
    _maiyaQuantities={adults:0,children:0};
  }
  renderMaiyaQuantities();
}
function changeMaiyaQuantity(group,step){
  if(!Object.prototype.hasOwnProperty.call(_maiyaQuantities,group) || (step!==1 && step!==-1)) return;
  var total=_maiyaQuantities.adults+_maiyaQuantities.children;
  if((step===1 && total>=getMaiyaPackage().size*_maiyaPackages) || (step===-1 && _maiyaQuantities[group]===0)) return;
  _maiyaQuantities[group]+=step;
  renderMaiyaQuantities();
}
function renderMaiyaQuantities(){
  var pack=getMaiyaPackage(),required=pack.size*_maiyaPackages,price=pack.price*_maiyaPackages;
  var total=_maiyaQuantities.adults+_maiyaQuantities.children,complete=total===required;
  document.getElementById('wm-packages').textContent=String(_maiyaPackages);
  document.getElementById('wm-offer-size').textContent=String(required);
  document.querySelector('.wm-offer strong').textContent=String(price);
  document.getElementById('wm-total').textContent=price+' ريال';
  document.querySelectorAll('[data-water-packages]').forEach(function(button){
    button.disabled=button.dataset.step==='1' ? _maiyaPackages>=20 : _maiyaPackages<=1;
  });
  ['adults','children'].forEach(function(group){
    var output=document.getElementById('wm-'+group);
    output.textContent=String(_maiyaQuantities[group]);
    output.closest('.wm-category').classList.toggle('is-selected',_maiyaQuantities[group]>0);
    document.querySelectorAll('[data-water-group="'+group+'"]').forEach(function(button){
      button.disabled=button.dataset.step==='1'?complete:_maiyaQuantities[group]===0;
    });
  });
  var status=document.getElementById('maiya-selection-count');
  status.textContent=complete?'✓ اكتمل اختيار الألعاب':'اخترت '+total+' من '+required;
  status.classList.toggle('is-complete',complete);
  document.getElementById('maiya-detail').classList.toggle('is-complete',complete);
  document.getElementById('maiya-order-btn').disabled=!complete;
}
function maiyaOrderNow(){
  var selection={type:'water',packages:_maiyaPackages,adults:_maiyaQuantities.adults,children:_maiyaQuantities.children};
  if(!getMaiyaOrderDetails(selection)) return;
  openOrderPopup(selection,false);
}
// The router carries quantities through reloads and Back. Never trust a stored price.
function getMaiyaOrderDetails(selection){
  var pack=getMaiyaPackage(),order=selection;
  if(typeof selection==='string'){
    // Keep already-open single-package checkouts from the previous version working.
    var match=selection.match(/^باقة ألعاب مائية\n(\d+) ألعاب بـ\d+ ريال\nللكبار: (\d+) — للصغار: (\d+)$/);
    if(!match || Number(match[1])!==pack.size) return null;
    order={type:'water',packages:1,adults:Number(match[2]),children:Number(match[3])};
  }
  if(!order || order.type!=='water' || !Number.isInteger(order.packages) || order.packages<1 || order.packages>20 ||
    !Number.isInteger(order.adults) || !Number.isInteger(order.children) || order.adults<0 || order.children<0 ||
    order.adults+order.children!==pack.size*order.packages) return null;
  return {packages:order.packages,adults:order.adults,children:order.children,
    size:pack.size*order.packages,price:pack.price*order.packages};
}
function buildMaiyaOrderMessage(selection,name,cabin,number,notes,venue){
  var order=getMaiyaOrderDetails(selection);
  if(!order) return null;
  var lines=['السلام عليكم، أرغب بطلب الخدمات التالية:','',
    'الاسم: '+name].concat(venue==='chalet' ? ['المكان: شاليه يوم العائلة'] : ['اسم الكوخ: '+cabin,'رقم الكوخ: '+number]).concat(['','الطلبات:','',
    'الألعاب المائية:','باقة ألعاب مائية × '+order.packages+' = '+order.price+' ريال',
    'للكبار: '+order.adults,'للصغار: '+order.children,'','إجمالي الطلب: '+order.price+' ريال']);
  if(notes) lines.push('','ملاحظات: '+notes);
  return lines.join('\n');
}

/* Water games are supplied by age group according to availability. */
var _maiyaQuantities = {adults:0,children:0};
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
function changeMaiyaQuantity(group,step){
  if(!Object.prototype.hasOwnProperty.call(_maiyaQuantities,group) || (step!==1 && step!==-1)) return;
  var total=_maiyaQuantities.adults+_maiyaQuantities.children;
  if((step===1 && total>=3) || (step===-1 && _maiyaQuantities[group]===0)) return;
  _maiyaQuantities[group]+=step;
  renderMaiyaQuantities();
}
function renderMaiyaQuantities(){
  var total=_maiyaQuantities.adults+_maiyaQuantities.children;
  Object.keys(_maiyaQuantities).forEach(function(group){
    document.getElementById('wm-'+group).textContent=String(_maiyaQuantities[group]);
    document.querySelectorAll('[data-water-group="'+group+'"]').forEach(function(button){
      button.disabled=button.dataset.step==='1'?total===3:_maiyaQuantities[group]===0;
    });
  });
  var status=document.getElementById('maiya-selection-count');
  status.textContent=total===3?'اكتملت الباقة':'اخترت '+total+' من 3';
  status.classList.toggle('is-complete',total===3);
  document.getElementById('maiya-order-btn').disabled=total!==3;
}
function maiyaOrderNow(){
  if(_maiyaQuantities.adults+_maiyaQuantities.children!==3) return;
  openOrderPopup('باقة ألعاب مائية\n3 ألعاب بـ50 ريال\nللكبار: '+_maiyaQuantities.adults+
    ' — للصغار: '+_maiyaQuantities.children,false);
}
// The existing router carries the order summary through reloads and Back.
function getMaiyaOrderDetails(itemName){
  var match=typeof itemName==='string' && itemName.match(/^باقة ألعاب مائية\n3 ألعاب بـ50 ريال\nللكبار: ([0-3]) — للصغار: ([0-3])$/);
  if(!match || Number(match[1])+Number(match[2])!==3) return null;
  return {adults:Number(match[1]),children:Number(match[2])};
}
function buildMaiyaOrderMessage(itemName,name,cabin,number,notes){
  var order=getMaiyaOrderDetails(itemName);
  var lines=['السلام عليكم، أرغب بطلب باقة ألعاب مائية.','',
    'الاسم: '+name,'الكوخ: '+cabin,'رقم الكوخ: '+number,'',
    'عدد ألعاب الكبار: '+order.adults,'عدد ألعاب الصغار: '+order.children,
    'الإجمالي: 3 ألعاب بـ50 ريال'];
  if(notes) lines.push('','ملاحظات: '+notes);
  return lines.join('\n');
}

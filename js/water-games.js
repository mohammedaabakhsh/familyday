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
  status.textContent=total===3?'اكتملت الباقة · 3 ألعاب':'اخترت '+total+' من 3';
  status.classList.toggle('is-complete',total===3);
  document.getElementById('maiya-order-btn').disabled=total!==3;
}
function maiyaOrderNow(){
  if(_maiyaQuantities.adults+_maiyaQuantities.children!==3) return;
  openOrderPopup('باقة ألعاب مائية - 3 ألعاب بـ50 ريال\nعدد ألعاب الكبار: '+_maiyaQuantities.adults+
    '\nعدد ألعاب الصغار: '+_maiyaQuantities.children+'\nتُجهّز الألعاب حسب المتوفر.',false);
}

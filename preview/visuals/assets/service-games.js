var _tarfihiOpt = '';
function showTarfihi(){ openTarfihiDetail(); }
function openTarfihiDetail(){
  var panel = document.getElementById('tarfihi-detail');
  selectTarfihiOpt(_tarfihiOpt);
  panel.classList.remove('hide');
  panel.scrollTop = 0;
}
function closeTarfihiDetail(){
  if(fdReturnToGuestServices()) return;
  document.getElementById('tarfihi-detail').classList.add('hide');
}
function selectTarfihiOpt(opt){
  if(isChaletServiceVenue() && opt==='table') opt='';
  _tarfihiOpt = opt;
  document.querySelector('#tarfihi-detail .tg-order-button').disabled=!opt;
  ['box','table'].forEach(function(key){
    var button = document.getElementById('tarfihi-opt-'+key);
    var selected = opt===key;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('tarfihi-summary-label').textContent = opt ? 'إجمالي الباقة' : 'اختر الباقة لعرض الإجمالي';
  document.getElementById('tarfihi-summary-price').textContent = opt==='box' ? '50 ريال' : opt==='table' ? '150 ريال' : '';
}
function tarfihiOrder(){
  if(!_tarfihiOpt){ alert('يُرجى اختيار خيار أولاً'); return; }
  openOrderPopup({type:'games',option:_tarfihiOpt});
}

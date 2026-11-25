/* Shared service screens, with separate selections and checkout identity per venue. */
var _serviceVenue = 'resort';
var _serviceVenueSelections = Object.create(null);
function isChaletServiceVenue(){ return _serviceVenue==='chalet'; }
function setServiceVenue(venue){
  venue=venue==='chalet' ? 'chalet' : 'resort';
  if(venue!==_serviceVenue){
    _serviceVenueSelections[_serviceVenue]={packages:_maiyaPackages,adults:_maiyaQuantities.adults,children:_maiyaQuantities.children,games:_tarfihiOpt};
    var saved=_serviceVenueSelections[venue] || {packages:1,adults:0,children:0,games:''};
    _maiyaPackages=saved.packages;
    _maiyaQuantities={adults:saved.adults,children:saved.children};
    _tarfihiOpt=saved.games;
    _serviceVenue=venue;
  }
  document.getElementById('tarfihi-detail').dataset.venue=_serviceVenue;
  document.getElementById('tarfihi-opt-table').hidden=isChaletServiceVenue();
  document.getElementById('tg-games-title').textContent=isChaletServiceVenue() ? 'الألعاب المشمولة في الباقة' : 'الألعاب المشمولة في الباقتين';
  document.getElementById('tg-packages-title').textContent=isChaletServiceVenue() ? 'باقة الألعاب' : 'اختر باقة الألعاب';
  document.querySelector('#tarfihi-detail .tg-photo img').alt=isChaletServiceVenue() ? 'ضيوف يلعبون لعبة جماعية' : 'ضيوف يلعبون لعبة جماعية على طاولة داخل الكوخ';
}


// Prevent browser horizontal swipe-back gesture on non-scrollable areas
(function(){
  var startX, startY;
  document.addEventListener('touchstart', function(e){
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchmove', function(e){
    var dx = Math.abs(e.touches[0].clientX - startX);
    var dy = Math.abs(e.touches[0].clientY - startY);
    if(dx > dy){
      // horizontal swipe — check if target or ancestor is horizontally scrollable
      var el = e.target;
      var scrollable = false;
      while(el && el !== document.body){
        if(el.scrollWidth > el.clientWidth){scrollable=true;break;}
        el = el.parentElement;
      }
      if(!scrollable) e.preventDefault();
    }
  }, {passive:false});
})();


/* ===== STAY (f2) FUNCTIONS ===== */
var _chaletItems2=[];

// Show a brief selection response, then clear it before leaving the selector.
var _destinationOpenTimer=0;
function clearDestinationFeedback(){
  clearTimeout(_destinationOpenTimer);
  _destinationOpenTimer=0;
  document.querySelectorAll('.dest-card.is-opening').forEach(function(card){
    card.classList.remove('is-opening');
    card.removeAttribute('aria-busy');
  });
}
function openDestinationWithFeedback(type){
  if(_destinationOpenTimer) return;
  var card=document.querySelector('.dest-card[data-dest-photo="'+type+'"]');
  if(!card) return;
  card.classList.add('is-opening');
  card.setAttribute('aria-busy','true');
  _destinationOpenTimer=setTimeout(function(){showDestination(type);},80);
}

function showDestination(type){
  clearDestinationFeedback();
  document.getElementById('dest').classList.add('hide');
  var target = type==='chalet' ? 'landing3' : type==='stay' ? 'landing2' : 'landing';
  ['landing','landing2','landing3'].forEach(function(id){
    document.getElementById(id).classList.toggle('hide',id!==target);
  });
}

function goBackToDestination(){
  clearDestinationFeedback();
  document.getElementById('landing').classList.add('hide');
  document.getElementById('landing2').classList.add('hide');
  document.getElementById('landing3').classList.add('hide');
  document.getElementById('app').classList.remove('show');
  document.getElementById('app2').style.display='none';
  document.getElementById('dest').classList.remove('hide');
}

function showSection2(){
  curSection='chalet';

  document.getElementById('landing2').classList.add('hide');
  var app2=document.getElementById('app2');
  app2.style.display='block';
  var h2=document.getElementById('header2');
  h2.style.background='transparent';
  h2.style.borderBottom='none';
  h2.style.boxShadow='none';
  var bb2=document.getElementById('backBtn2');
  bb2.style.color='rgba(255,255,255,0.85)';
  bb2.style.background='rgba(255,255,255,0.10)';
  bb2.style.borderRadius='50%';
  bb2.style.padding='0';
  bb2.style.width='38px';
  bb2.style.height='38px';
  document.getElementById('heroLogo2').style.display='none';
  var hero2=document.getElementById('sectionHero2');
  hero2.className='section-hero resort-hero';
  var st2=document.getElementById('sectionTitle2');
  st2.textContent='اختر القسم المناسب لتجمّعك';
  st2.removeAttribute('style');
  document.getElementById('sectionDesc2').textContent='';
  document.getElementById('headerTitle2').textContent='أقسام الاستراحة';
  app2.scrollTop=0;
  _chaletItems2=[];
  renderChalet2();
}

function goBack2(){
  var h2=document.getElementById('header2');
  h2.style.background='';
  h2.style.borderBottom='';
  h2.style.boxShadow='';
  var bb2=document.getElementById('backBtn2');
  bb2.style.color='';
  bb2.style.background='';
  bb2.style.borderRadius='';
  bb2.style.padding='';
  bb2.style.width='';
  bb2.style.height='';
  document.getElementById('sectionHero2').className='section-hero';
  document.getElementById('app2').style.display='none';
  document.getElementById('grid2').innerHTML='';
  document.getElementById('landing2').classList.remove('hide');
}

function showContact2(){ showContact('stay'); }

function renderChalet2(){
  var g=document.getElementById('grid2');g.innerHTML='';
  var items=[
    {id:20,img:0,name:"القسم الأول – الدور الأرضي",specs:["غرفتا نوم","مسبح للكبار","مسبح للأطفال"],type:"تتضمن مجلسًا كبيرًا ومسبحين خاصين",suitable:"مناسب للتجمعات الكبيرة",rooms:2,guests:25,bathroom:4,hall:true,badge:null,tags:["غرفة نوم بسرير مزدوج","غرفة نوم بسريرين مفردين","|","مجلس كبير","صالة داخلية","3 دورات مياه","|","ركن مطبخ","|","جلسة خارجية","شواية","حمام خارجي","|","مسبح للكبار، بمقاس 8 × 4 م وعمق متدرج من 1 إلى 2 م.","مسبح للأطفال، بمقاس 6 × 2 م وعمق 65 سم.","كراسي تشميس"],bookUrl:"https://familyday-sa.com/ar/listings/69cea5753a421f1c8de8cb43"},
    {id:21,img:5,name:"القسم الثاني – الدور العلوي",specs:["غرفة نوم","مسبح للكبار","ملعب كرة طائرة"],type:"تتضمن مجلسًا كبيرًا ومسبحًا خاصًا وملعب كرة طائرة",suitable:"مناسب للتجمعات الكبيرة",rooms:1,guests:25,bathroom:4,hall:false,badge:null,tags:["غرفة نوم بـ3 أسرّة","|","مجلس كبير","3 دورات مياه","|","ركن مطبخ","|","جلسة خارجية","شواية","حمام خارجي","|","مسبح للكبار، بمقاس 8 × 4 م وعمق متدرج من 1 إلى 2 م.","كراسي تشميس","|","ملعب كرة طائرة"],bookUrl:"https://familyday-sa.com/ar/listings/69cea610f9674d785069b3c5"}
  ];
  _chaletItems2=items;
  document.getElementById('fd-stay-comparison-slot').innerHTML=renderStayComparison();
  items.forEach(function(c){
    var card=document.createElement('article');
    card.className='card fd-cabin-card-v2';
    card.onclick=function(){openMDirect(c);};
    card.innerHTML=renderStayCard(c);
    g.appendChild(card);
  });
}

function openMDirect(c){
  var overlay=document.getElementById('ov');
  overlay.classList.add('fd-cabin-modern','fd-stay-modern');
  var bb=document.querySelector('.modal-back-btn');
  if(bb)bb.innerHTML='❮ العودة إلى الأقسام';
  closeCabinPicker();
  _navType='chalet';
  _navItems=_chaletItems2.length?_chaletItems2:[c];
  _navIdx=_navItems.findIndex(function(item){return item.id===c.id;});
  if(_navIdx===-1)_navIdx=0;
  updateNavUI();
  document.getElementById('modalBottomBar').style.display='';
  document.getElementById('navBtns').style.display='';
  openGalDirect(c);
  document.getElementById('mBody').innerHTML=renderStayDetail(c);
  updateCabinShareActions(c);
  document.getElementById('modalBookBtn').href=c.bookUrl||'https://familyday-sa.com/ar';
  overlay.classList.add('open');
  document.body.style.overflow='hidden';
  resetCabinDetailView();
}
/* ===== END STAY FUNCTIONS ===== */

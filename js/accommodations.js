let galIdx=0,curId=null,curSection='resort';


function setActiveTab(tab){
  document.querySelectorAll('.bnav-btn').forEach(function(b){b.classList.remove('active');});
  var el = document.getElementById('bnav-'+tab);
  if(el) el.classList.add('active');
  document.getElementById('bottomNav').style.display='flex';
}

// Use touchend for bottom nav to avoid mobile event issues
(function(){
  function initBottomNav(){
    document.querySelectorAll('#bottomNav .bnav-btn').forEach(function(btn){
      btn.addEventListener('touchend', function(e){
        e.preventDefault();
        e.stopPropagation();
        bottomNav(this.getAttribute('data-tab'));
      }, {passive:false});
      btn.addEventListener('click', function(e){
        e.preventDefault();
        bottomNav(this.getAttribute('data-tab'));
      });
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', initBottomNav);
  } else {
    initBottomNav();
  }
})();

function showSection(type){
  curSection=type;

  const d=data[type];
  document.getElementById('services-overlay').classList.add('hide');
  document.getElementById('landing').classList.add('hide');

  document.getElementById('app').classList.add('show');
  document.querySelector('header').style.background = 'transparent';
  document.querySelector('header').style.borderBottom = 'none';
  document.querySelector('header').style.boxShadow = 'none';
  document.querySelector('.back-btn').style.color = 'rgba(255,255,255,0.85)';
  document.querySelector('.back-btn').style.background = 'rgba(255,255,255,0.10)';
  document.querySelector('.back-btn').style.borderRadius = '50%';
  document.querySelector('.back-btn').style.padding = '0';
  document.querySelector('.back-btn').style.width = '38px';
  document.querySelector('.back-btn').style.height = '38px';
  document.getElementById('sectionTag').style.display='none';
  document.getElementById('heroLogo').style.display='none';
  document.getElementById('headerTitle').textContent='الأكواخ';
  document.getElementById('headerTitle').removeAttribute('style');
  document.getElementById('sectionDesc').textContent='';
  const hero=document.querySelector('.section-hero');
  hero.className='section-hero resort-hero';
  const st=document.getElementById('sectionTitle');
  st.innerHTML='اختر الكوخ المناسب لك';
  st.removeAttribute('style');
  const fs=document.getElementById('filterSection');
  fs.style.display = 'flex';
  setActiveTab('resort');
  render('all',type);
}

function openGalDirect(c){
  const imgs=GALLERY[c.id]||[IMG[c.img]];
  galIdx=0;curId=c.id;
  const w=document.getElementById('galWrap');w.innerHTML='';
  imgs.forEach((src,i)=>{
    const el=document.createElement('img');
    el.className='gal-img'+(i===0?' active':'');
    el.src=src;
    el.alt=c.name+' — صورة '+(i+1);
    el.setAttribute('role','button');
    el.setAttribute('aria-label','تكبير الصورة '+(i+1)+' من '+imgs.length);
    el.tabIndex=i===0?0:-1;
    el.setAttribute('aria-hidden',i===0?'false':'true');
    w.appendChild(el);
  });
  if(imgs.length>1){
    var btnL=document.createElement('button');
    btnL.innerHTML='&#10094;';
    btnL.setAttribute('style','position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(19,53,72,0.7);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;direction:ltr;');
    btnL.onclick=function(){moveGalDirect(1,imgs.length);};
    w.appendChild(btnL);
    var btnR=document.createElement('button');
    btnR.innerHTML='&#10095;';
    btnR.setAttribute('style','position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(19,53,72,0.7);border:none;color:#fff;width:40px;height:40px;border-radius:50%;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;direction:ltr;');
    btnR.onclick=function(){moveGalDirect(-1,imgs.length);};
    w.appendChild(btnR);
    var ctr=document.createElement('div');
    ctr.id='gal-counter';
    ctr.setAttribute('style','position:absolute;bottom:10px;left:12px;background:rgba(19,53,72,0.55);color:#fff;font-family:Tajawal,sans-serif;font-size:12px;border-radius:12px;padding:3px 10px;z-index:20;');
    ctr.textContent='1 من '+imgs.length;
    w.appendChild(ctr);
  }
  // Replace handlers on each opening so swipe gestures never accumulate.
  var startX=0,startY=0,suppressClickUntil=0;
  w.ontouchstart=function(e){
    startX=e.touches[0].clientX;startY=e.touches[0].clientY;
    suppressClickUntil=0;
  };
  w.ontouchend=function(e){
    var dx=startX-e.changedTouches[0].clientX,dy=startY-e.changedTouches[0].clientY;
    if(Math.max(Math.abs(dx),Math.abs(dy))>12)suppressClickUntil=Date.now()+400;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy))moveGalDirect(dx>0?1:-1,imgs.length);
  };
  w.onclick=function(e){
    if(e.target.matches('.gal-img.active') && Date.now()>=suppressClickUntil)openFS(imgs,galIdx,curId);
  };
  w.onkeydown=function(e){
    if(e.target.matches('.gal-img.active') && (e.key==='Enter'||e.key===' ')){
      e.preventDefault();openFS(imgs,galIdx,curId);
    }
  };
  FD_DOME_GALLERY.mountTrigger(w,c);
}
function moveGalDirect(dir,total){
  var next=galIdx+dir;
  if(next<0||next>=total)return;
  galIdx=next;updGal(total);
}

function goBack(){
  document.querySelector('header').style.display = '';
  document.querySelector('header').style.background = '';
  document.querySelector('header').style.borderBottom = '';
  document.querySelector('.back-btn').style.color = '';
  document.querySelector('.back-btn').style.background = '';
  document.querySelector('.back-btn').style.borderRadius = '';
  document.querySelector('.back-btn').style.padding = '';
  document.querySelector('.back-btn').style.width = '';
  document.querySelector('.back-btn').style.height = '';
  document.querySelector('.section-hero').style.display = '';
  document.querySelector('.section-hero').style.paddingTop = '';
  document.getElementById('landing').classList.remove('hide');
  document.getElementById('app').classList.remove('show');
  document.getElementById('grid').innerHTML='';
  document.getElementById('bottomNav').style.display='none';
  document.querySelectorAll('.bnav-btn').forEach(function(b){b.classList.remove('active');});
}




function renderResortCardSummary(c){
  const shared=c.id===11;
  const feature=shared?'مشترك':c.bath.summary;
  const guests=resortGuestText(c.guests);
  const rooms=resortRoomText(c.rooms);
  const facts=shared?[['الموقع','وسط الأكواخ'],['الاستخدام','لجميع الضيوف']]:[['السعة',guests],['غرف النوم',rooms]];
  const subtitle=shared?'ألعاب أطفال وشاشة عرض':c.suitable;
  return `
    <div class="fd-cabin-card-v2-heading">
      <div><div class="card-name">${c.name}</div>${subtitle?'<p class="fd-cabin-card-v2-subtitle">'+subtitle+'</p>':''}</div>
      <div class="fd-card-feature-slot">${feature?'<span class="fd-cabin-card-v2-feature">'+feature+'</span>':''}</div>
    </div>
    <div class="fd-cabin-card-v2-facts" aria-label="معلومات ${c.name}">
      ${facts.map(([label,value])=>'<div class="fd-cabin-card-v2-fact"><span>'+label+'</span><strong>'+value+'</strong></div>').join('')}
    </div>`;
}

var _curFilter='all';
function render(f='all',type){
  type=type||curSection;
  _curFilter=f;
  const g=document.getElementById('grid');g.innerHTML='';
  const items=data[type].items;


document.querySelectorAll('.fbtn').forEach(x=>x.classList.remove('active'));
  const activeBtn=document.querySelector(`.fbtn[data-f="${f}"]`);
  if(activeBtn) activeBtn.classList.add('active');
  items.forEach(c=>{
    if(c.id===11) return; // rendered separately after loop
    const show=(f==='all'&&c.id!==11)||(f==='1'&&c.rooms===1)||(f==='2'&&c.rooms===2);
    const d=document.createElement('div');
    d.className='card fd-cabin-card-v2'+(show?'':' hidden');
    d.onclick=()=>openM(c.id,type);
    d.innerHTML=`
      <div class="card-img-wrap" data-cid="${c.id}" data-cidx="0" style="position:relative;overflow:hidden;">
        ${(function(){var gl=GALLERY[c.id]||[IMG[c.img]];return '<img src="'+gl[0]+'" alt="'+c.name+'" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;">';})()}
        ${c.badge?`<div class="badge">${c.badge}</div>`:''}
      </div>
      <div class="card-body fd-cabin-card-v2-body">
        ${renderResortCardSummary(c)}
        <div class="fd-card-actions"><button class="card-btn">عرض التفاصيل والصور</button>${FD_CABIN_COMPARE.cardButton(c)}</div>
        ${(c.id===1||c.id===12)?'<a class="fd-dome-tour-link" href="/dome-tour/?cabin='+c.id+'" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===2?'<a class="fd-dome-tour-link" href="/pyramid-tour/" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${(c.id===4||c.id===13)?'<a class="fd-dome-tour-link" href="/greek-tour/?cabin='+c.id+'" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===5?'<a class="fd-dome-tour-link" href="/palm-tour/?cabin=5" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===6?'<a class="fd-dome-tour-link" href="/bohemian-tour/?cabin=6" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===7?'<a class="fd-dome-tour-link" href="/french-tour/?cabin=7" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===3?'<a class="fd-dome-tour-link" href="/classic-tour/?cabin=3" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===10?'<a class="fd-dome-tour-link" href="/panoramic-tour/?cabin=10" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===9?'<a class="fd-dome-tour-link" href="/royal-tour/?cabin=9" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===8?'<a class="fd-dome-tour-link" href="/rustic-tour/?cabin=8" onclick="event.stopPropagation()">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      </div>`;
    g.appendChild(d);
  });
  // Always add shared garden card to grid (never filtered out)
  if((type||curSection)==='resort'){
    var c12=data.resort.items.find(function(x){return x.id===11;});
    if(c12 && (f==='shared' || f==='all')){
      var gl12=GALLERY[11]||[];
      var d12=document.createElement('div');
      d12.className='card fd-cabin-card-v2';
      d12.onclick=function(){openM(11,'resort');};
      var imgs12=gl12.length?'<img src="'+gl12[0]+'" alt="'+c12.name+'" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;">':'';
      d12.innerHTML='<div class="card-img-wrap" data-cid="11" data-cidx="0" style="position:relative;overflow:hidden;">'+imgs12+'</div>'
        +'<div class="card-body fd-cabin-card-v2-body">'+renderResortCardSummary(c12)
        +'<button class="card-btn">عرض التفاصيل والصور</button>'
        +'<a class="fd-dome-tour-link" href="https://my.matterport.com/show/?m=S7Z2CF9tdwm" onclick="event.preventDefault();event.stopPropagation();open3D(this.href)">جولة ثلاثية الأبعاد للحديقة <span aria-hidden="true">←</span></a></div>';
      g.appendChild(d12);
    }
  }
  FD_CABIN_COMPARE.sync();
}

function openGal(id,type){
  const c=data[type||curSection].items.find(x=>x.id===id);
  if(c)openGalDirect(c);
}
function updGal(total){
  document.querySelectorAll('#galWrap .gal-img').forEach((el,i)=>{
    el.classList.toggle('active',i===galIdx);
    el.tabIndex=i===galIdx?0:-1;
    el.setAttribute('aria-hidden',i===galIdx?'false':'true');
  });
  document.querySelectorAll('.gal-dot').forEach((el,i)=>el.classList.toggle('active',i===galIdx));
  var ctr=document.getElementById('gal-counter');
  if(ctr)ctr.textContent=(galIdx+1)+' من '+total;
}

function renderCabinDetail(c){
  const depthUnit='سم';
  const indoor=c.features.indoor.concat(c.bathroomDetails || [c.bathroom===1?'حمام واحد':c.bathroom===2?'حمامان':c.bathroom+' حمامات']);
  const poolLabel=c.pool.depthInLabel?c.pool.label+' وعمق '+c.pool.depthCm+' '+depthUnit+'.':c.pool.label;
  const wetOutdoor=c.features.outdoor.filter(function(text){return /بانيو|جاكوزي/.test(text);});
  const outdoor=c.features.outdoor.filter(function(text){return !/بانيو|جاكوزي/.test(text);});
  const poolFeatures=[poolLabel].concat(c.pool.facilities,wetOutdoor);
  const kitchen=c.features.kitchen;
  const stayFeatures=c.features.stay;
  const hasMinibar=c.minibar;
  const hasOutdoorBath=c.bath.outdoorPrivacy&&!c.bath.privacyInLabel;
  const subtitle=c.type||'';
  const badge=c.suitable||'';
  const guestsText=resortGuestText(c.guests);
  const poolNote=(c.pool.depthInLabel?'':'المسبح بعمق '+c.pool.depthCm+' '+depthUnit+'، و')+'يُسمح للأطفال باستخدامه تحت إشراف ذويهم.';
  const renderFeatures=function(list){
    return list.map(function(name){
      return '<span class="fd-cabin-feature'+(name.length>24?' fd-cabin-feature--wide':'')+'">'+formatSpecificationText(name)+'</span>';
    }).join('');
  };

  return `
    <section class="fd-cabin-content" data-cabin-id="${c.id}" aria-labelledby="fd-cabin-detail-title">
      <div class="fd-cabin-heading">
        <div>
          <h2 class="fd-cabin-title" id="fd-cabin-detail-title">${c.name}</h2>
          <p class="fd-cabin-occupancy">${badge?badge+' – ':''}${guestsText}</p>
          ${subtitle?`<p class="fd-cabin-suitable">${subtitle}</p>`:''}
        </div>
      </div>

      ${(c.id===1||c.id===12)?'<a class="fd-pyramid-detail-tour" href="/dome-tour/?from=details&cabin='+c.id+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===2?'<a class="fd-pyramid-detail-tour" href="/pyramid-tour/?from=details&v=map-return-20261028-v3'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${(c.id===4||c.id===13)?'<a class="fd-pyramid-detail-tour" href="/greek-tour/?from=details&cabin='+c.id+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===5?'<a class="fd-pyramid-detail-tour" href="/palm-tour/?from=details&cabin=5'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===6?'<a class="fd-pyramid-detail-tour" href="/bohemian-tour/?from=details&cabin=6'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===7?'<a class="fd-pyramid-detail-tour" href="/french-tour/?from=details&cabin=7'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===3?'<a class="fd-pyramid-detail-tour" href="/classic-tour/?from=details&cabin=3'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      ${c.id===10?'<a class="fd-pyramid-detail-tour" href="/panoramic-tour/?from=details&cabin=10'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===9?'<a class="fd-pyramid-detail-tour" href="/royal-tour/?from=details&cabin=9'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
${c.id===8?'<a class="fd-pyramid-detail-tour" href="/rustic-tour/?from=details&cabin=8'+(document.getElementById('ov').dataset.returnToMap==='true'?'&return=map':'')+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a>':''}
      <div class="fd-cabin-times" aria-label="أوقات الدخول والخروج">
        <div><span>الدخول</span><strong>4:00 مساءً</strong></div>
        <div><span>الخروج</span><strong>12:00 ظهرًا</strong></div>
      </div>

      <section class="fd-cabin-section">
        <h3>المنطقة الداخلية</h3>
        <div class="fd-cabin-feature-list">${renderFeatures(indoor)}</div>
      </section>

      <section class="fd-cabin-section">
        <h3>المنطقة الخارجية</h3>
        <div class="fd-cabin-feature-list">
          ${c.id===2?renderFeatures(wetOutdoor.concat(outdoor.filter(function(item){return item!=='شواية';}))):([1,3,4,5,6,7,8,9,10,12,13].includes(c.id))?renderFeatures(outdoor.filter(function(item){return item!=='شواية';})):renderFeatures(poolFeatures)}
          ${([1,2,3,4,5,6,7,8,9,10,12,13].includes(c.id))?renderFeatures(c.id===2?poolFeatures.filter(function(item){return !/بانيو|جاكوزي/.test(item);}):poolFeatures):`<div class="fd-cabin-instructions fd-pool-note"><p>${poolNote}</p>${hasOutdoorBath?'<p><strong>البانيو الخارجي:</strong> بخصوصية كاملة.</p>':''}</div>`}
          ${([1,2,3,4,5,6,7,8,9,10,12,13].includes(c.id))?renderFeatures(outdoor.filter(function(item){return item==='شواية';})):renderFeatures(outdoor)}
        </div>
      </section>

      <section class="fd-cabin-section">
        <h3>تجهيزات المطبخ</h3>
        <div class="fd-cabin-feature-list">${renderFeatures(kitchen)}</div>
        ${hasMinibar?'<div class="fd-cabin-instructions"><p><strong>الميني بار:</strong> مشروبات وسناكس برسوم إضافية.</p></div>':''}
      </section>

      <section class="fd-cabin-section">
        <h3>مميزات الإقامة</h3>
        <div class="fd-cabin-feature-list">${renderFeatures(stayFeatures)}</div>
      </section>

      <section class="fd-cabin-section">
        <h3>خدمات متاحة</h3>
        <div class="fd-cabin-feature-list">
          <a class="fd-cabin-feature fd-cabin-service-link" href="/menu/" onclick="return openCabinService(event,'menu')">المطعم <span aria-hidden="true">←</span></a>
          <span class="fd-cabin-feature">غرفة سائق</span>
        </div>
        <div class="fd-cabin-instructions">
          
          <p><strong>غرفة السائق:</strong> متاحة حسب التوفر.</p>
        </div>
      </section>

      ${(c.id===3 || c.id===9)?'<section class="fd-cabin-section fd-cabin-combined-note"><h3>حجز الكوخين معًا</h3><div class="fd-cabin-instructions"><p>يمكن ربط كوخ رويال والكوخ الكلاسيكي عبر باب داخلي عند حجزهما معًا، بسعة إجمالية تصل إلى 35 ضيفًا.</p></div></section>':''}

      <section class="fd-cabin-addons">
        <h3>إضافات الحجز</h3>
        <div class="fd-cabin-addon-links"><a href="/services/hospitality/" onclick="return openCabinService(event,'hospitality')">الضيافة والتنسيقات <span aria-hidden="true">←</span></a><a href="/services/outdoor-seating/" onclick="return openCabinService(event,'jalsat')">الجلسات الخارجية <span aria-hidden="true">←</span></a><a href="/services/dining-tables/" onclick="return openCabinService(event,'tawilat')">طاولات الطعام <span aria-hidden="true">←</span></a><a href="/services/cinema/" onclick="return openCabinService(event,'sinema')">جلسة السينما <span aria-hidden="true">←</span></a><a href="/services/games/" onclick="return openCabinService(event,'tarfihi')">الألعاب الترفيهية <span aria-hidden="true">←</span></a><a href="/services/water-games/" onclick="return openCabinService(event,'maiya')">الألعاب المائية <span aria-hidden="true">←</span></a></div>
      </section>
      <div class="fd-cabin-faq-footer"><a class="fd-cabin-faq-link" href="/resort/faq/" onclick="return openAccommodationFaq(event,'faq')">الأسئلة الشائعة <span aria-hidden="true">←</span></a></div>
    </section>`;
}

function renderSharedGardenDetail(c){
  const features=(c.tags||[]).filter(function(tag){return tag!=='|';});
  const renderFeatures=function(list){
    return list.map(function(name){
      return '<span class="fd-cabin-feature'+(name.length>24?' fd-cabin-feature--wide':'')+'">'+name+'</span>';
    }).join('');
  };

  return `
    <section class="fd-cabin-content fd-shared-garden-content" aria-labelledby="fd-cabin-detail-title">
      <div class="fd-cabin-heading">
        <div>
          <h2 class="fd-cabin-title" id="fd-cabin-detail-title">${c.name}</h2>
          <p class="fd-cabin-suitable">${c.type}</p>
        </div>
        <span class="fd-cabin-badge">${c.badge}</span>
      </div>

      <div class="fd-cabin-facts" aria-label="معلومات الحديقة المشتركة">
        <div><span>الموقع</span><strong>وسط الأكواخ</strong></div>
        
        <div><span>الاستخدام</span><strong>لجميع الضيوف</strong></div>
      </div>

      <section class="fd-cabin-section">
        <h3>مرافق الحديقة</h3>
        <div class="fd-cabin-feature-list">${renderFeatures(features)}</div>
        <div class="fd-cabin-instructions">
          
          <p><strong>الوصول:</strong> لكل كوخ باب داخلي يفتح مباشرة على الحديقة.</p>
        </div>
      </section>

      <section class="fd-cabin-section fd-shared-garden-tour">
        <h3>الجولة الافتراضية</h3>
        <button type="button" onclick="open3D('https://my.matterport.com/show/?m=S7Z2CF9tdwm')" class="mbtn fd-garden-tour-btn">جولة ثلاثية الأبعاد</button>
      </section>
    </section>`;
}

function openM(id,type){
  document.getElementById('ov').classList.remove('fd-stay-modern');
  var bb=document.querySelector('.modal-back-btn');if(bb)bb.innerHTML='❮ العودة إلى الأكواخ';
  type=type||curSection;
  const modernResortDetail=type==='resort'&&data.resort.items.some(function(item){return item.id===id;});
  document.getElementById('ov').classList.toggle('fd-cabin-modern',modernResortDetail);

  const items=data[type].items;
  const c=items.find(x=>x.id===id);
  if(!c) return;
  closeCabinPicker();
  _navType=type;
  _navItems=filteredCabinItems(items,_curFilter);
  _navIdx=_navItems.findIndex(function(x){return x.id===id;});
  // A map/deep-link selection outside the active filter must not mislabel the current cabin.
  if(_navIdx===-1){_navItems=[c];_navIdx=0;}
  updateNavUI();
  if(id===11){
    document.getElementById('modalBottomBar').style.display='none';document.getElementById('navBtns').style.display='none';
    openGal(11,type);
    document.getElementById('mBody').innerHTML=renderSharedGardenDetail(c);
    document.getElementById('ov').classList.add('open');
    document.body.style.overflow='hidden';
    resetCabinDetailView();
    return;
  }
  document.getElementById('modalBottomBar').style.display='';document.getElementById('navBtns').style.display='';
  openGal(id,type);
  document.getElementById('mBody').innerHTML=renderCabinDetail(c);
  updateCabinShareActions(c);
  var bookBtn=document.getElementById('modalBookBtn');
  if(bookBtn) bookBtn.href=c.bookUrl||'https://familyday-sa.com/ar';
  document.getElementById('ov').classList.add('open');
  document.body.style.overflow='hidden';
  if(modernResortDetail) resetCabinDetailView();
}
var _navItems=[];var _navIdx=0;var _navType='';

function filteredCabinItems(items,filter){
  if(filter==='all') return items.slice();
  if(filter==='1'||filter==='2') return items.filter(function(c){return c.rooms===Number(filter);});
  if(filter==='shared') return items.filter(function(c){return c.id===11;});
  return items.filter(function(c){return c.id!==11;});
}

function navModal(dir){
  var c = _navItems[_navIdx+dir];
  if(!c) return;
  closeCabinPicker();
  if(_navType==='resort') openM(c.id, 'resort');
  else if(_navType==='chalet') openMDirect(c);
  updateNavUI();
}

function updateNavUI(){
  var prev=document.getElementById('nav-prev');
  var next=document.getElementById('nav-next');
  var counter=document.getElementById('nav-counter');
  if(!prev||!next) return;
  prev.disabled = _navIdx===0;
  next.disabled = _navIdx===_navItems.length-1;
  counter.textContent = (_navIdx+1) + ' من ' + _navItems.length;
  if(_navType==='resort' || _navType==='chalet' || _navType==='private-chalet') updateCabinPicker();
}

function updateCabinPicker(){
  var c=_navItems[_navIdx];
  if(!c) return;
  var picker=document.getElementById('fd-cabin-picker');
  document.getElementById('fd-cabin-nav-name').textContent=c.name;
  document.getElementById('fd-detail-current-name').textContent=c.name;
  document.getElementById('fd-cabin-nav-count').textContent=(_navIdx+1)+' من '+_navItems.length;
  document.getElementById('fd-cabin-nav-position').textContent=(_navIdx+1)+' من '+_navItems.length;
  var isStay=_navType==='chalet';
  var isChalet=_navType==='private-chalet';
  var noun=isChalet?'الشاليه':isStay?'القسم':'الكوخ';
  var fromMap=!isChalet && !isStay && document.getElementById('ov').dataset.returnToMap==='true';
  var backLabel=fromMap?'خريطة الأكواخ':isChalet?'العودة إلى الشاليه':isStay?'العودة إلى الأقسام':'العودة إلى الأكواخ';
  var back=document.querySelector('.fd-cabin-nav-back');
  back.setAttribute('aria-label',backLabel);
  var legacyBack=document.querySelector('.modal-back-btn');
  if(legacyBack)legacyBack.textContent='❮ '+backLabel;
  back.querySelector('span').textContent=fromMap?'خريطة الأكواخ':isChalet?'الشاليه':isStay?'الأقسام':'الأكواخ';
  document.querySelector('.fd-cabin-nav').setAttribute('aria-label',isChalet?'تفاصيل الشاليه':isStay?'التنقّل بين الأقسام':'التنقّل بين الأكواخ');
  document.querySelector('#fd-cabin-nav-list ul').setAttribute('aria-label',isChalet?'الشاليه':isStay?'أقسام الاستراحة':'الأكواخ ضمن اختيارك');
  picker.setAttribute('aria-label','اختيار '+noun+': '+c.name);
  picker.disabled=_navItems.length<2;
  ['prev','next'].forEach(function(key){
    var target=_navItems[_navIdx+(key==='prev'?-1:1)];
    var button=document.getElementById('fd-cabin-'+key);
    button.disabled=!target;
    var label=key==='prev'?'السابق':'التالي';
    button.setAttribute('aria-label',target?label+': '+target.name:noun+' '+label);
    button.title=target?target.name:'';
  });
  var list=document.querySelector('#fd-cabin-nav-list ul');
  list.replaceChildren();
  _navItems.forEach(function(item,index){
    var li=document.createElement('li');
    var button=document.createElement('button');
    button.type='button';
    button.dataset.cabinId=item.id;
    button.textContent=item.name;
    if(index===_navIdx) button.setAttribute('aria-current','true');
    li.appendChild(button);list.appendChild(li);
  });
}

function closeCabinPicker(restoreFocus){
  var picker=document.getElementById('fd-cabin-picker');
  document.getElementById('fd-cabin-nav-list').hidden=true;
  picker.setAttribute('aria-expanded','false');
  if(restoreFocus) picker.focus({preventScroll:true});
}

function toggleCabinPicker(moveFocus){
  var list=document.getElementById('fd-cabin-nav-list');
  var picker=document.getElementById('fd-cabin-picker');
  if(picker.disabled) return;
  if(!list.hidden){closeCabinPicker();return;}
  list.hidden=false;
  picker.setAttribute('aria-expanded','true');
  var current=list.querySelector('[aria-current="true"]');
  if(current){
    list.scrollTop=Math.max(0,current.offsetTop-list.clientHeight/2+current.offsetHeight/2);
    if(moveFocus) current.focus({preventScroll:true});
  }
}

function resetCabinDetailView(){
  var body=document.getElementById('mBody');
  document.querySelector('#ov .modal').scrollTop=0;
  body.scrollTop=0;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [body,document.getElementById('galWrap')].forEach(function(el){
    if(!el.animate) return;
    el.getAnimations().forEach(function(animation){animation.cancel();});
    el.animate([{opacity:.45},{opacity:1}],{duration:180,easing:'ease-out'});
  });
}

document.getElementById('fd-cabin-nav-list').addEventListener('click',function(event){
  var button=event.target.closest('button[data-cabin-id]');
  if(!button) return;
  var id=Number(button.dataset.cabinId);
  if(!_navItems.some(function(c){return c.id===id;})) return;
  closeCabinPicker();
  if(_navType==='chalet') openMDirect(_navItems.find(function(c){return c.id===id;}));
  else openM(id,'resort');
  document.getElementById('fd-cabin-picker').focus({preventScroll:true});
});
document.addEventListener('pointerdown',function(event){
  if(!event.target.closest('.fd-cabin-nav-controls')) closeCabinPicker();
});
document.addEventListener('keydown',function(event){
  var list=document.getElementById('fd-cabin-nav-list');
  var picker=document.getElementById('fd-cabin-picker');
  if(event.target===picker && list.hidden && ['ArrowDown','ArrowUp'].includes(event.key)){
    event.preventDefault();toggleCabinPicker(true);return;
  }
  if(list.hidden) return;
  if(event.key==='Escape'){
    event.preventDefault();event.stopPropagation();closeCabinPicker(true);return;
  }
  if(!list.contains(event.target)) return;
  var buttons=Array.from(list.querySelectorAll('button'));
  var index=buttons.indexOf(document.activeElement);
  var next=event.key==='ArrowDown'?Math.min(index+1,buttons.length-1):
    event.key==='ArrowUp'?Math.max(index-1,0):event.key==='Home'?0:event.key==='End'?buttons.length-1:-1;
  if(next>=0){event.preventDefault();buttons[next].focus({preventScroll:true});buttons[next].scrollIntoView({block:'nearest'});}
},true);
document.querySelector('.fd-cabin-nav-controls').addEventListener('focusout',function(event){
  // Safari touch taps may blur a button with relatedTarget=null before click.
  // Outside taps are handled by pointerdown; only a real focus transfer closes here.
  if(event.relatedTarget && !this.contains(event.relatedTarget)) closeCabinPicker();
});

function closeM(){
  closeCabinPicker();
  document.getElementById('modalBookBtn').textContent='الأسعار والتوفر';
  if(_navType==='private-chalet') document.getElementById('landing3').classList.remove('hide');
  document.getElementById('ov').classList.remove('fd-stay-modern');
  document.getElementById('ov').classList.remove('open');
  document.getElementById('ov').classList.remove('fd-cabin-modern');
  document.body.style.overflow='';
}
document.getElementById('ov').addEventListener('click',function(e){if(e.target===this)closeM();});
function replaceTourFrame(url){
  // A fresh frame avoids adding its previous URL to the browser's Back history.
  var previous=document.getElementById('iframeEl'),frame=previous.cloneNode(false);
  frame.src=url || 'about:blank';
  previous.replaceWith(frame);
}
function open3D(url){
  replaceTourFrame(url);
  document.getElementById('iframeOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeIframe(){
  document.getElementById('iframeOverlay').classList.remove('open');
  replaceTourFrame();
  document.body.style.overflow='';
}

function showServices(){

  document.getElementById('landing').classList.add('hide');
  document.getElementById('services-overlay').classList.remove('hide');
  setActiveTab('services');
}
function closeServices(){
  document.getElementById('menu-detail').classList.add('hide');
  document.getElementById('services-overlay').classList.add('hide');
  document.getElementById('landing').classList.remove('hide');
  document.getElementById('landing').scrollTop=0;
  document.getElementById('bottomNav').style.display='none';
  document.querySelectorAll('.bnav-btn').forEach(function(b){b.classList.remove('active');});
}
document.querySelectorAll('.fbtn').forEach(b=>{
  b.addEventListener('click',function(){render(this.dataset.f)});
});

/* The inline guide uses the same approved locations, image and cabin facts as the main map. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const locations = () => FD_RESORT_MAP_DATA.locations.filter(l=>data.resort.items.some(c=>c.id===l.cabinId));
  const cabinFor = id => data.resort.items.find(c=>c.id===id);
  const shortName = c => c.name.replace(/^(?:الكوخ|كوخ|البيت|بيت)\s+/, '');
  const list = values => '<ul class="inclusions">' + values.map(v=>'<li>'+esc(v)+'</li>').join('') + '</ul>';
  function marker(location) {
    const cabin = cabinFor(location.cabinId), name = shortName(cabin);
    const width = Math.min(210, name.length * 14 + 24), height = 44;
    let x = location.labelX * 10, y = location.labelY * 10;
    if(location.labelSide === 'left'){x=location.labelRightX*10-width/2;y=location.y*10;}
    if(location.labelSide === 'right'){x=location.labelLeftX*10+width/2;y=location.y*10;}
    x=Math.max(width/2+5,Math.min(995-width/2,x));
    const bend = location.leaderBend ? ' ' + location.leaderBend.map(v=>v*10).join(',') : '';
    return '<a href="#guide-cabin-card" role="button" aria-pressed="false" aria-label="'+esc(cabin.name)+': عرض البيانات" data-map-cabin="'+cabin.id+'"><polygon class="plot" points="'+location.footprint.map(p=>p.map(v=>v*10).join(',')).join(' ')+'"/><polyline class="leader" points="'+location.x*10+','+location.y*10+bend+' '+x+','+y+'"/><circle class="map-dot" cx="'+location.x*10+'" cy="'+location.y*10+'" r="5"/><rect class="map-label" x="'+(x-width/2)+'" y="'+(y-height/2)+'" width="'+width+'" height="'+height+'" rx="8"/><text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central">'+esc(name)+'</text></a>';
  }
  function markup() {
    return '<div class="guide-map"><div class="map-tools"><button type="button" id="map-zoom" aria-pressed="false">تكبير الخريطة +</button><span>اختاروا من الصورة أو الأسماء</span></div><div class="map-scroll" tabindex="0" role="region" aria-label="خريطة المنتجع؛ يمكن تمرير الصورة بعد تكبيرها"><div class="map-canvas"><img id="guide-map-image" src="/'+esc(FD_RESORT_MAP_DATA.image)+'" alt="توزيع الأكواخ والحديقة المشتركة في منتجع يوم العائلة من الأعلى" width="1254" height="1254" loading="lazy"><svg viewBox="0 0 1000 1000" aria-label="اختيار كوخ على الخريطة">'+locations().map(marker).join('')+'</svg></div></div><p class="map-image-error" hidden>تعذّر عرض الصورة. يمكنكم اختيار الكوخ من الأسماء أدناه.</p><div class="map-choices" role="group" aria-label="أسماء الأكواخ والحديقة">'+locations().map(l=>'<button type="button" data-map-cabin="'+l.cabinId+'" aria-pressed="false">'+esc(cabinFor(l.cabinId).name)+'</button>').join('')+'</div><article id="guide-cabin-card" class="guide-cabin-card" tabindex="-1" aria-labelledby="guide-cabin-title" hidden></article></div>';
  }
  function mount() {
    const root=document.querySelector('.guide-map');
    const card=root.querySelector('#guide-cabin-card');
    let previous=null;
    function select(id,trigger) {
      const cabin=cabinFor(id), location=locations().find(l=>l.cabinId===id);
      if(!cabin || !location) return;
      previous=trigger;
      root.querySelectorAll('[data-map-cabin]').forEach(el=>{
        const selected=Number(el.dataset.mapCabin)===id;
        el.setAttribute('aria-pressed',String(selected));el.classList.toggle('is-selected',selected);
      });
      const shared=location.kind==='shared';
      const photo=FD_RESORT_MAP_DATA.cardPhotos[id];
      const features=cabin.features||{};
      let body='<div class="cabin-card-heading"><h3 id="guide-cabin-title">'+esc(cabin.name)+'</h3><button type="button" id="close-cabin" aria-label="إغلاق بيانات الكوخ">×</button></div>';
      if(photo) body+='<img class="cabin-photo" src="/'+esc(photo)+'" alt="'+esc(cabin.name)+'" width="1200" height="1200">';
      body+='<div class="cabin-card-copy"><p>'+esc(cabin.type||cabin.suitable||'')+'</p>';
      if(shared) {
        body+='<p class="shared-access">متاحة لجميع ضيوف المنتجع</p>'+list((cabin.tags||[]).filter(t=>t!=='|'));
      } else {
        body+='<dl class="cabin-facts"><div><dt>السعة</dt><dd>حتى '+esc(cabin.guests)+' ضيوف</dd></div><div><dt>غرف النوم</dt><dd>'+esc(cabin.rooms)+'</dd></div><div><dt>الحمامات</dt><dd>'+esc(cabin.bathroom)+'</dd></div></dl>';
        if(cabin.pool){body+='<div class="cabin-pool"><h4>المسبح</h4><p>'+esc(cabin.pool.label)+'</p>'+(cabin.pool.depthCm?'<p>العمق: '+esc(cabin.pool.depthCm)+' سم</p>':'')+'</div>';}
        body+='<details class="cabin-features"><summary>مرافق الكوخ</summary>'+list([].concat(features.indoor||[],features.outdoor||[],features.kitchen||[],features.stay||[],(cabin.pool||{}).facilities||[]).filter((v,i,a)=>a.indexOf(v)===i))+'</details>';
      }
      card.innerHTML=body+'</div>';card.hidden=false;
      card.focus({preventScroll:true});card.scrollIntoView({behavior:'instant',block:'start'});
      card.querySelector('#close-cabin').addEventListener('click',()=>{
        card.hidden=true;
        root.querySelectorAll('[data-map-cabin]').forEach(el=>{el.setAttribute('aria-pressed','false');el.classList.remove('is-selected');});
        if(previous){previous.focus({preventScroll:true});previous.scrollIntoView({block:'center',behavior:'instant'});}
      });
    }
    root.addEventListener('click',event=>{
      const trigger=event.target.closest('[data-map-cabin]');
      if(!trigger)return;
      event.preventDefault();select(Number(trigger.dataset.mapCabin),trigger);
    });
    root.querySelector('svg').addEventListener('keydown',event=>{
      if(event.key===' ' && event.target.closest('[data-map-cabin]')){event.preventDefault();event.target.closest('[data-map-cabin]').dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    });
    const viewport=root.querySelector('.map-scroll');
    root.querySelector('#map-zoom').addEventListener('click',event=>{
      const zoomed=viewport.classList.toggle('is-zoomed');
      event.currentTarget.setAttribute('aria-pressed',String(zoomed));
      event.currentTarget.textContent=zoomed?'عرض الخريطة كاملة −':'تكبير الخريطة +';
      viewport.scrollLeft=zoomed?(viewport.scrollWidth-viewport.clientWidth)/2:0;
      viewport.scrollTop=zoomed?(viewport.scrollHeight-viewport.clientHeight)/2:0;
    });
    const img=root.querySelector('#guide-map-image');
    const onError=()=>{root.querySelector('.map-image-error').hidden=false;};
    img.addEventListener('error',onError);
    if(img.complete&&!img.naturalWidth)onError();
  }
  window.FD_GUIDE_MAP={markup,mount};
})();

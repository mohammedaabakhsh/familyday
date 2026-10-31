/* The inline guide uses the same approved locations, image and cabin facts as the main map. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const locations = () => FD_RESORT_MAP_DATA.locations.filter(l=>data.resort.items.some(c=>c.id===l.cabinId));
  const cabinFor = id => data.resort.items.find(c=>c.id===id);
  const shortName = c => c.name.replace(/^(?:الكوخ|كوخ|البيت|بيت)\s+/, '');
  const roomText = n => n===1 ? 'غرفة واحدة' : n===2 ? 'غرفتان' : n>2 ? n+' غرف' : '';
  const guestText = n => n===1 ? 'حتى ضيف واحد' : n===2 ? 'حتى ضيفين' : n>2 && n<=10 ? 'حتى '+n+' ضيوف' : n>10 ? 'حتى '+n+' ضيفًا' : '';
  function highlightFor(cabin) {
    if(cabin.id===3) return 'يمكن ربطه بكوخ رويال عند حجزهما معًا';
    if(cabin.id===9) return 'يمكن ربطه بالكوخ الكلاسيكي عند حجزهما معًا';
    if(cabin.id===10) return 'جاكوزي داخلي';
    if(cabin.bath && cabin.bath.summary) {
      if(cabin.id===2 && cabin.bath.outdoorPrivacy) return cabin.bath.summary+' بخصوصية كاملة';
      return cabin.bath.summary;
    }
    return '';
  }
  function marker(location) {
    const cabin = cabinFor(location.cabinId), name = shortName(cabin);
    const width = Math.min(210, name.length * 14 + 24), height = 44;
    let x = location.labelX * 10, y = location.labelY * 10;
    if(location.labelSide === 'left'){x=location.labelRightX*10-width/2;y=location.y*10;}
    if(location.labelSide === 'right'){x=location.labelLeftX*10+width/2;y=location.y*10;}
    x=Math.max(width/2+5,Math.min(995-width/2,x));
    const bend = location.leaderBend ? ' ' + location.leaderBend.map(v=>v*10).join(',') : '';
    return '<a href="#guide-cabin-card" role="button" aria-pressed="false" aria-label="'+esc(cabin.name)+': اختيار الكوخ" data-map-cabin="'+cabin.id+'"><polygon class="plot" points="'+location.footprint.map(p=>p.map(v=>v*10).join(',')).join(' ')+'"/><polyline class="leader" points="'+location.x*10+','+location.y*10+bend+' '+x+','+y+'"/><circle class="map-dot" cx="'+location.x*10+'" cy="'+location.y*10+'" r="5"/><rect class="map-label" x="'+(x-width/2)+'" y="'+(y-height/2)+'" width="'+width+'" height="'+height+'" rx="8"/><text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central">'+esc(name)+'</text></a>';
  }
  function markup() {
    return '<div class="guide-map"><div class="map-tools"><span>اضغطوا على الكوخ في الخريطة</span></div><div class="map-scroll" tabindex="0" role="region" aria-label="خريطة المنتجع؛ يمكن تمرير الصورة بعد تكبيرها"><div class="map-canvas"><img id="guide-map-image" src="/'+esc(FD_RESORT_MAP_DATA.image)+'" alt="توزيع الأكواخ والحديقة المشتركة في منتجع يوم العائلة من الأعلى" width="1254" height="1254" loading="lazy"><svg viewBox="0 0 1000 1000" aria-label="اختيار كوخ على الخريطة">'+locations().map(marker).join('')+'</svg></div></div><p class="map-image-error" hidden>تعذّر عرض الصورة. يمكنكم الاختيار من الأسماء على الخريطة.</p><article id="guide-cabin-card" class="guide-cabin-card" tabindex="-1" aria-labelledby="guide-cabin-title" hidden></article></div>';
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
      const photo=FD_RESORT_MAP_DATA.cardPhotos[id];
      const highlight=highlightFor(cabin);
      const room=roomText(cabin.rooms), guests=guestText(cabin.guests);
      let body='<div class="cabin-card-heading"><h3 id="guide-cabin-title">'+esc(cabin.name)+'</h3><button type="button" id="close-cabin" aria-label="إغلاق تفاصيل الكوخ">×</button></div>';
      if(photo) body+='<img class="cabin-photo" src="/'+esc(photo)+'" alt="'+esc(cabin.name)+'" width="1200" height="1200">';
      if(cabin.id===11){
        body+='<div class="cabin-card-body"><p class="cabin-card-kicker">الحديقة المشتركة</p><div class="cabin-tag-list">'+(cabin.tags||[]).filter(t=>t!=='|').map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div>';
      } else {
        body+='<div class="cabin-card-body"><div class="cabin-quick-facts">';
        if(room) body+='<div class="cabin-quick-fact"><span>الغرف</span><strong>'+esc(room)+'</strong></div>';
        if(guests) body+='<div class="cabin-quick-fact"><span>السعة</span><strong>'+esc(guests)+'</strong></div>';
        body+='</div>';
        if(highlight) body+='<div class="cabin-highlight"><span>ميزة مميزة</span><strong>'+esc(highlight)+'</strong></div>';
        body+='</div>';
      }
      card.innerHTML=body;card.hidden=false;
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
    const img=root.querySelector('#guide-map-image');
    const onError=()=>{root.querySelector('.map-image-error').hidden=false;};
    img.addEventListener('error',onError);
    if(img.complete&&!img.naturalWidth)onError();
  }
  window.FD_GUIDE_MAP={markup,mount};
})();

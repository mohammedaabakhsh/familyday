/* The inline guide uses the same approved locations, image and cabin facts as the main map. */
(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const locations = () => FD_RESORT_MAP_DATA.locations.filter(l=>data.resort.items.some(c=>c.id===l.cabinId));
  const cabinFor = id => data.resort.items.find(c=>c.id===id);
  const shortName = c => c.name.replace(/^(?:الكوخ|كوخ|البيت|بيت)\s+/, '');
  function tourUrlFor(cabin) {
    const routes={1:'dome-tour',12:'dome-tour',2:'pyramid-tour',3:'classic-tour',4:'greek-tour',13:'greek-tour',5:'palm-tour',6:'bohemian-tour',7:'french-tour',8:'rustic-tour',9:'royal-tour',10:'panoramic-tour'};
    const route=routes[cabin.id];
    return route ? '/'+route+'/?from=guide&cabin='+cabin.id : '';
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
    return '<details class="guide-map-fold"><summary><img class="map-preview" src="/' + esc(FD_RESORT_MAP_DATA.image) + '" alt="" width="80" height="80" loading="lazy"><span><strong>استكشف توزيع الأكواخ</strong><span class="map-fold-label map-fold-label--closed">عرض الخريطة</span><span class="map-fold-label map-fold-label--open">إخفاء الخريطة</span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="guide-map"><div class="map-tools"><span>اضغطوا على الكوخ في الخريطة</span></div><div class="map-scroll" tabindex="0" role="region" aria-label="خريطة الأكواخ في منتجع يوم العائلة"><div class="map-canvas"><img id="guide-map-image" src="/'+esc(FD_RESORT_MAP_DATA.image)+'" alt="توزيع الأكواخ والحديقة المشتركة في منتجع يوم العائلة من الأعلى" width="1254" height="1254" loading="lazy"><svg viewBox="0 0 1000 1000" aria-label="اختيار كوخ على الخريطة">'+locations().map(marker).join('')+'</svg></div></div><p class="map-image-error" hidden>تعذّر عرض الصورة. يمكنكم الاختيار من الأسماء على الخريطة.</p><article id="guide-cabin-card" class="guide-cabin-card" tabindex="-1" aria-labelledby="guide-cabin-title" hidden></article></div></details>';
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
      let body='<div class="cabin-card-heading"><h3 id="guide-cabin-title">'+esc(cabin.name)+'</h3><button type="button" id="close-cabin" aria-label="إغلاق تفاصيل الكوخ">×</button></div>';
      if(photo) body+='<img class="cabin-photo" src="/'+esc(photo)+'" alt="'+esc(cabin.name)+'" width="1200" height="1200">';

      if(cabin.id===11){
        body+='<div class="cabin-card-body"><p class="cabin-card-kicker">الحديقة المشتركة</p><div class="cabin-tag-list">'+(cabin.tags||[]).filter(t=>t!=='|').map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div>';
      } else {
        const tourUrl=tourUrlFor(cabin);
        body+='<div class="cabin-card-body cabin-card-body--explore">';
        if(tourUrl) body+='<div class="cabin-explore-actions cabin-explore-actions--single"><a class="cabin-explore-link cabin-explore-link--primary" href="'+esc(tourUrl)+'">استكشف الكوخ من الداخل <span aria-hidden="true">←</span></a></div>';
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

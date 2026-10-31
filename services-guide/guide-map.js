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
    if(cabin.id===3) return 'إمكانية الربط الداخلي مع كوخ رويال';
    if(cabin.id===9) return 'إمكانية الربط الداخلي مع الكوخ الكلاسيكي';
    if(cabin.id===10) return 'جاكوزي داخلي';
    if(cabin.bath && cabin.bath.summary) {
      if(cabin.id===2 && cabin.bath.outdoorPrivacy) return cabin.bath.summary+' بخصوصية كاملة';
      return cabin.bath.summary;
    }
    return '';
  }
  const bathroomText = n => n===1 ? 'حمام واحد' : n===2 ? 'حمامان' : n>2 ? n+' حمامات' : '';
  function tourUrlFor(cabin) {
    const routes={1:'dome-tour',12:'dome-tour',2:'pyramid-tour',3:'classic-tour',4:'greek-tour',13:'greek-tour',5:'palm-tour',6:'bohemian-tour',7:'french-tour',8:'rustic-tour',9:'royal-tour',10:'panoramic-tour'};
    const route=routes[cabin.id];
    return route ? '/'+route+'/?from=guide&cabin='+cabin.id : '';
  }
  function unique(values) {
    const seen=new Set();
    return values.filter(value=>{
      const key=String(value||'').trim();
      if(!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function featureChips(cabin) {
    const chips=[];
    const highlight=highlightFor(cabin);
    if(highlight) chips.push(highlight);
    if(cabin.pool && /جاكوزي/.test(cabin.pool.label||'') && !chips.some(v=>/جاكوزي/.test(v))) chips.push('جاكوزي داخل المسبح');
    return unique(chips).slice(0,2);
  }
  function detailSection(title,values) {
    const list=unique(values);
    if(!list.length) return '';
    return '<section class="cabin-detail-group"><h4>'+esc(title)+'</h4><ul>'+list.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul></section>';
  }
  function inlineDetails(cabin) {
    const indoor=(cabin.features && cabin.features.indoor ? cabin.features.indoor.slice() : []);
    const bath=bathroomText(cabin.bathroom);
    if(bath) indoor.push(bath);
    if(cabin.features && cabin.features.stay) indoor.push.apply(indoor,cabin.features.stay);

    const kitchen=cabin.features && cabin.features.kitchen ? cabin.features.kitchen.slice() : [];

    const outdoor=cabin.features && cabin.features.outdoor ? cabin.features.outdoor.slice() : [];
    if(cabin.pool){
      if(cabin.pool.label) outdoor.push(cabin.pool.label);
      if(cabin.pool.depthCm) outdoor.push('عمق المسبح '+cabin.pool.depthCm+' سم');
      if(Array.isArray(cabin.pool.facilities)) outdoor.push.apply(outdoor,cabin.pool.facilities);
    }

    return '<div class="cabin-inline-details" data-guide-details-panel hidden>'
      +detailSection('داخل الكوخ',indoor)
      +detailSection('تجهيزات المطبخ',kitchen)
      +detailSection('المساحة الخارجية',outdoor)
      +'</div>';
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
    return '<div class="guide-map"><div class="map-tools"><span>اضغطوا على الكوخ في الخريطة</span></div><div class="map-scroll" tabindex="0" role="region" aria-label="خريطة الأكواخ في منتجع يوم العائلة"><div class="map-canvas"><img id="guide-map-image" src="/'+esc(FD_RESORT_MAP_DATA.image)+'" alt="توزيع الأكواخ والحديقة المشتركة في منتجع يوم العائلة من الأعلى" width="1254" height="1254" loading="lazy"><svg viewBox="0 0 1000 1000" aria-label="اختيار كوخ على الخريطة">'+locations().map(marker).join('')+'</svg></div></div><p class="map-image-error" hidden>تعذّر عرض الصورة. يمكنكم الاختيار من الأسماء على الخريطة.</p><article id="guide-cabin-card" class="guide-cabin-card" tabindex="-1" aria-labelledby="guide-cabin-title" hidden></article></div>';
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
      const room=roomText(cabin.rooms), guests=guestText(cabin.guests);
      let body='<div class="cabin-card-heading"><h3 id="guide-cabin-title">'+esc(cabin.name)+'</h3><button type="button" id="close-cabin" aria-label="إغلاق تفاصيل الكوخ">×</button></div>';
      if(photo) body+='<img class="cabin-photo" src="/'+esc(photo)+'" alt="'+esc(cabin.name)+'" width="1200" height="1200">';

      if(cabin.id===11){
        body+='<div class="cabin-card-body"><p class="cabin-card-kicker">الحديقة المشتركة</p><div class="cabin-tag-list">'+(cabin.tags||[]).filter(t=>t!=='|').map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div>';
      } else {
        const chips=featureChips(cabin), tourUrl=tourUrlFor(cabin);
        body+='<div class="cabin-card-body cabin-card-body--explore">';
        if(cabin.type) body+='<p class="cabin-explore-intro">'+esc(cabin.type)+'</p>';
        body+='<div class="cabin-quick-facts">';
        if(room) body+='<div class="cabin-quick-fact"><span>الغرف</span><strong>'+esc(room)+'</strong></div>';
        if(guests) body+='<div class="cabin-quick-fact"><span>السعة</span><strong>'+esc(guests)+'</strong></div>';
        body+='</div>';
        if(chips.length) body+='<div class="cabin-feature-chips" aria-label="أبرز مميزات الكوخ">'+chips.map(v=>'<span>'+esc(v)+'</span>').join('')+'</div>';
        body+='<div class="cabin-explore-actions"><button type="button" class="cabin-explore-link cabin-explore-link--primary" data-guide-details aria-expanded="false">تفاصيل الكوخ <span aria-hidden="true">＋</span></button>';
        if(tourUrl) body+='<a class="cabin-explore-link" href="'+esc(tourUrl)+'">جولة داخل الكوخ <span aria-hidden="true">←</span></a>';
        body+='</div>'+inlineDetails(cabin)+'</div>';
      }
      card.innerHTML=body;card.hidden=false;
      const detailsButton=card.querySelector('[data-guide-details]');
      if(detailsButton){
        detailsButton.addEventListener('click',()=>{
          const panel=card.querySelector('[data-guide-details-panel]');
          const open=panel.hidden;
          panel.hidden=!open;
          detailsButton.setAttribute('aria-expanded',String(open));
          detailsButton.querySelector('span').textContent=open?'−':'＋';
        });
      }
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

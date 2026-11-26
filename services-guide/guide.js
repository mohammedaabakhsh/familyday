/* Render the independent shared catalogue; the home page can change without affecting services. */
(function () {
  'use strict';
  const back = document.getElementById('guide-back');
  if (document.referrer) {
    const previous = new URL(document.referrer);
    if (previous.origin === location.origin && previous.pathname !== location.pathname) {
      back.href = previous.href;
      back.setAttribute('aria-label', 'العودة إلى الصفحة السابقة');
    }
  }
  const content = document.getElementById('guide-content');
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (root, selector) => {
    const node = root.querySelector(selector);
    if (!node) throw new Error('Missing service content: ' + selector);
    return node.textContent.trim();
  };
  const list = (root, selector) => Array.from(root.querySelectorAll(selector), el => el.textContent.trim());
  const items = values => '<ul class="inclusions">' + values.map(v => '<li>' + escape(v) + '</li>').join('') + '</ul>';
  const sourceImage = (root, selector) => {
    const image = root.querySelector(selector);
    if (!image) throw new Error('Missing service image: ' + selector);
    return {src:image.getAttribute('data-page-src') || image.getAttribute('src'), alt:image.alt, width:image.width, height:image.height};
  };
  function serviceCard({title, price, priceUnit = '', photos = [], body, id = '', label = 'تفاصيل الخدمة', imageAlt, className = '', capacity = '', expandable = true}) {
    const priceMarkup = '<strong class="price">' + escape(price) + (priceUnit ? '<span class="price-unit"> ' + escape(priceUnit) + '</span>' : '') + '</strong>';
    if (!photos.length && className !== 'coordination-card') {
      return '<article class="package-card package-card--text"><details class="package-details hospitality-details">'
        + '<summary class="package-heading"><h3>' + escape(title) + '</h3>' + priceMarkup + ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>'
        + '<div class="package-details-body">' + body + '</div></details></article>';
    }
    if (className === 'photo-card' || className === 'coordination-card') {
      return '<article class="package-card seating-collapsed-card"' + (id ? ' id="' + escape(id) + '"' : '') + '><details class="seating-collapsed-details">'
        + '<summary class="seating-collapsed-summary"><span class="seating-collapsed-main"><span class="seating-collapsed-title">' + escape(title) + '</span>'
        + (capacity ? '<span class="seating-capacity-badge">' + escape(capacity) + '</span>' : '') + '</span>'
        + '<span class="seating-summary-bottom">' + priceMarkup
        + '<span class="seating-detail-footer"><svg class="seating-collapsed-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' + '' + '</span></span></summary>'
        + '<div class="seating-collapsed-content">' + (photos.length ? FD_GUIDE_GALLERY.markup(photos,title,imageAlt) : '')
        + '<div class="package-details-body">' + body + '</div></div></details></article>';
    }
    return '<article class="package-card package-card--gallery ' + className + (photos.length ? '' : ' package-card--text') + '"' + (id ? ' id="' + escape(id) + '"' : '') + '>'
      + (photos.length ? FD_GUIDE_GALLERY.markup(photos,title,imageAlt) : '')
      + '<div class="package-copy"><div class="package-heading"><div class="service-heading-copy"><h3>' + escape(title) + '</h3>' + (capacity ? '<span class="service-capacity" aria-label="عدد الأشخاص: ' + escape(capacity) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/></svg>' + escape(capacity) + '</span>' : '') + '</div>' + priceMarkup + '</div>'
      + (expandable ? '<details class="package-details"><summary><span>' + escape(label) + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="package-details-body">' + body + '</div></details>' : '<div class="package-details-body">' + body + '</div>') + '</div></article>';
  }
  const section = (id, title, intro, body, showTitle = false) => '<section class="guide-section" id="' + id + '" data-title="' + escape(title) + '" aria-labelledby="title-' + id + '"><header class="section-heading' + (showTitle ? ' section-heading--titled' : '') + '"><h2 tabindex="-1" id="title-' + id + '">' + escape(showTitle ? title : intro) + '</h2>' + (showTitle ? '<p>' + escape(intro) + '</p>' : '') + '</header>' + body + '</section>';
  function packages(values) {
    return '<div class="package-grid">' + values.map(pack => {
      const body = (pack.description ? '<p class="package-description">' + escape(pack.description) + '</p>' : '') + items(pack.items)
        + (pack.note ? '<p class="package-usage-note">' + escape(pack.note) + '</p>' : '');
      return serviceCard({title:pack.name,price:pack.price.replace(/\s*للباقة\s*$/, ''),priceUnit:'للباقة',photos:pack.images,
        imageAlt:'تنسيق ' + pack.name,body,className:'coordination-card',label:'تفاصيل الباقة',id:pack.id === 'hd-coordination-package-resort' ? 'package-complete' : 'package-'+pack.id.replace('hd-coordination-package-','')});
    }).join('') + '</div>';
  }
  function render(catalog, serviceLinks) {
    const data = catalog.arrangements;
    if (catalog.schemaVersion !== 1 || !data || !data.coordination.packages.length || !data.seating.sessions.length || !data.dining.template) throw new Error('Invalid arrangements catalogue');
    if(!catalog.guest?.cabins || !Object.keys(catalog.guest.cabins).length) throw new Error('Guest cabins unavailable');
    if(!(catalog.guest.cinema?.price>0)||!catalog.guest.cinema.duration||!catalog.guest.cinema.times?.length||!catalog.guest.cinema.contents?.length)throw Error('Cinema service unavailable');
    // Keep the approved shared dining layout using its small, inert template.
    const doc = document.implementation.createHTMLDocument('');
    const template = doc.createElement('template');template.id = 'dining-card-template';template.innerHTML = data.dining.template;doc.body.append(template);
    window._tawilatPrices = data.dining.prices;
    window._tawilatInclusions = data.dining.items;
    for(const id of ['coordination','cinema','dining']){
      const tile=document.querySelector('.guide-tile[href="#'+id+'"] .tile-description');
      if(tile&&serviceLinks[id]?.cardIntro)tile.textContent=serviceLinks[id].cardIntro;
    }
    const coordination=serviceLinks.coordination,help=coordination?.help;
    const advance=coordination?.advanceNote?'<p class="coordination-order-note">'+escape(coordination.advanceNote)+'</p>':'';
    const contactMarkup=(id,help,description)=>help?'<section class="coordination-help" aria-labelledby="'+escape(id)+'-help-title"><h3 id="'+escape(id)+'-help-title">'+escape(help.title)+'</h3><p class="coordination-help-description">'+escape(description)+'</p><p class="coordination-help-name">'+escape(help.name)+'</p><nav class="coordination-help-actions" aria-label="التواصل مع منسّق المناسبات"><a href="https://wa.me/'+escape(help.phone)+'" target="_blank" rel="noopener noreferrer" aria-label="واتساب منسّق المناسبات">واتساب</a><a href="tel:+'+escape(help.phone)+'" aria-label="اتصال بمنسّق المناسبات">اتصال</a></nav></section>':'';
    const contact=contactMarkup('coordination',help,'تواصل معنا لاختيار التنسيق المناسب لكم');
    let html = section('coordination',data.coordination.name,coordination?.intro||data.coordination.intro,advance+packages(data.coordination.packages)+contact,true);
    const diningSource = template.content;
    const diningImage = sourceImage(diningSource,'.fd-dining-image img');
    const diningPhoto = '<div class="dining-shared-photo"><figure class="package-photo"><img class="dining-full-photo" src="/' + escape(diningImage.src.replace(/^\/+/,'')) + '" alt="' + escape(diningImage.alt) + '" width="' + escape(diningImage.width) + '" height="' + escape(diningImage.height) + '" loading="eager" decoding="async"></figure><p class="fd-dining-caption">' + escape(text(diningSource,'.fd-dining-caption')) + '</p></div>';
    const diningBody = diningPhoto + FD_DINING_CARDS.details(doc).outerHTML + '<p id="dining-price-help" class="dining-order-help">' + escape(serviceLinks.dining?.orderHint||'اختر عدد الأشخاص ونوع التجهيز، ثم اضغط «اطلب هذه الطاولة».') + '</p>' + FD_DINING_CARDS.table(doc,true).outerHTML;
    const diningSection = section('dining',data.dining.name,data.dining.intro,diningBody,true);
    const seating=serviceLinks.seating;
    const seatingAdvance=seating?.advanceNote?'<p class="coordination-order-note">'+escape(seating.advanceNote)+'</p>':'';
    const seatingContact=contactMarkup('seating',seating?.help,'تواصل معنا لاختيار الجلسة المناسبة لكم');
    html += section('seating',data.seating.name,seating?.intro||'جلسات نجهّزها لكم في المساحة الخارجية الخاصة بالكوخ', seatingAdvance+'<div class="photo-grid package-grid">' + data.seating.sessions.map((s,i) => serviceCard({id:'session-'+(i+1),title:s.name,price:s.price,priceUnit:'للجلسة',photos:[s.img],imageAlt:s.name,className:'photo-card',capacity:s.persons,label:'تفاصيل الجلسة',body:'<p class="session-description">' + escape(s.desc) + '</p>'})).join('') + '</div>' + seatingContact,true);
    html += diningSection;
    const cinema=catalog.guest.cinema, cinemaMedia=serviceLinks.cinema;
    const cinemaPhoto=cinemaMedia?.image?'<div class="dining-shared-photo cinema-shared-photo">'+FD_GUIDE_GALLERY.markup([cinemaMedia.image],cinema.title,cinema.title)+'</div>':'';
    const cinemaDetails='<div class="cinema-service-price"><div class="cinema-fact"><small>مدة الجلسة</small><strong class="cinema-duration">'+escape(cinema.duration)+'</strong></div><div class="cinema-fact"><small>سعر الجلسة</small><strong class="price">'+escape(cinema.price)+' ريال</strong></div></div><h3 class="cinema-contents-title">'+escape(cinema.contentsTitle)+'</h3>'+items(cinema.contents)+'<details class="guide-usage"><summary>تعليمات الاستخدام</summary>'+items(cinema.notes)+'</details>';
    html += section('cinema',cinema.title,cinema.intro,'<article id="cinema-session" class="cinema-service-panel">'+cinemaPhoto+'<div class="cinema-service-body package-details-body">'+cinemaDetails+'</div></article>',true);
    content.innerHTML = html;
    for(const id of ['coordination','seating','dining','cinema'])content.querySelector('#'+id).dataset.portalSharePath=serviceLinks[id]?.portalSharePath||'/services-guide/'+id+'/';
    for(const id of ['cinema','dining'])content.querySelector('#'+id).dataset.orderLabel=serviceLinks[id]?.orderLabel||(id==='cinema'?'اطلب هذه الجلسة':'اطلب هذه الطاولة');
    content.querySelectorAll('#cinema-session img').forEach(img=>{img.loading='eager';img.fetchPriority='high';});
    FD_GUIDE_GALLERY.mount();
    content.setAttribute('aria-busy','false');
    content.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('fd:guide-ready',{detail:catalog}));
    scrollToHash();
  }
  const homeBack = {href:back.href, label:back.getAttribute('aria-label')};
  const guideTitle = document.title;
  const guideDescription=document.querySelector('meta[name="description"]').content;
  function pathSection(){const id=location.pathname.match(/^\/services-guide\/(coordination|seating|dining|cinema)\/?$/)?.[1];return id||'';}
  const embeddedOrder=parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order';
  let activeSection = null;
  const dialog=document.getElementById('arrangement-dialog');
  let dialogScrollY=0,closeRequested=false;
  // Restore the original full-page catalogue for standalone visitors.
  if(!embeddedOrder)document.querySelector('.contents').after(content);
  history.scrollRestoration = 'manual';
  function routeSection() {
    const id = location.hash.slice(1)||pathSection();
    const target = document.getElementById(id === 'packages' ? 'seating' : id);
    return target && (target.matches('.guide-section') ? target : target.closest('.guide-section'));
  }
  function scrollToHash(focus = false) {
    closeRequested=false;
    if(location.hash==='#hospitality'){location.replace('/guest-services/'+location.hash);return;}
    const anchorId=location.hash.slice(1);
    const routeHash=location.hash||(pathSection()?'#'+pathSection():'');
    const nextSection = routeSection();
    if(activeSection && activeSection !== nextSection) FD_GUIDE_GALLERY.reset(activeSection);
    activeSection = nextSection;
    const pendingHash = /^#package-(1|2|3|celebration|vip|complete)$/.test(routeHash) ? '#coordination' : routeHash === '#packages' || /^#session-[1-6]$/.test(routeHash) ? '#seating' : routeHash;
    const pendingTile = !content.classList.contains('is-ready') && Array.from(document.querySelectorAll('.contents a')).find(link => link.hash === pendingHash);
    const sectionView = Boolean(activeSection || pendingTile);
    document.body.dataset.guideView = sectionView ? (embeddedOrder?'dialog':'section') : 'home';
    document.body.classList.toggle('arrangement-dialog-open',embeddedOrder&&sectionView);
    document.querySelectorAll('.guide-section').forEach(section => section.classList.toggle('is-active',section === activeSection));
    const title = activeSection ? activeSection.dataset.title : pendingTile ? pendingTile.querySelector('.tile-title').textContent : '';
    back.href = sectionView ? '#contents' : homeBack.href;
    back.setAttribute('aria-label',sectionView ? 'العودة إلى تنسيقات وجلسات' : homeBack.label);
    document.getElementById('guide-back-label').textContent = sectionView ? 'تنسيقات وجلسات' : 'رجوع';
    document.title = title ? title + ' | منتجع يوم العائلة' : guideTitle;
    if(!embeddedOrder&&content.classList.contains('is-ready')){
      const path=activeSection?.dataset.portalSharePath||'/services-guide/';
      const target=new URL(path,location.origin);target.search=location.search;
      const legacyItem=document.getElementById(anchorId);
      if(legacyItem?.matches('.package-card')&&legacyItem.closest('.guide-section')===activeSection)target.hash=anchorId;
      if(target.href!==location.href)history.replaceState(history.state,'',target);
      const description=activeSection?.querySelector('.section-heading p')?.textContent||guideDescription;
      document.querySelector('link[rel="canonical"]').href=new URL(path,location.origin).href;
      for(const name of ['og:title','twitter:title'])document.querySelector('meta[property="'+name+'"],meta[name="'+name+'"]').content=document.title;
      for(const name of ['og:description','twitter:description','description'])document.querySelector('meta[property="'+name+'"],meta[name="'+name+'"]').content=description;
      document.querySelector('meta[property="og:url"]').content=new URL(path,location.origin).href;
    }
    const sectionShare=document.querySelector('.topbar [data-share]');
    sectionShare.dataset.share=activeSection?.id||pendingTile?.hash?.slice(1)||'';
    sectionShare.setAttribute('aria-label','مشاركة '+(title||'تنسيقات وجلسات'));
    document.getElementById('arrangement-dialog-title').textContent=title || 'اختيار التجهيزات';
    if(embeddedOrder && sectionView && !dialog.open){dialogScrollY=window.scrollY;dialog.showModal();}
    else if((!embeddedOrder || !sectionView) && dialog.open){dialog.close();}
    document.dispatchEvent(new Event('fd:arrangement-view'));
    requestAnimationFrame(() => {
      if(activeSection) {
        if(focus)(embeddedOrder?document.getElementById('arrangement-dialog-title'):activeSection.querySelector('h2')).focus({preventScroll:true});
        const target = document.getElementById(anchorId);
        if(target?.matches('.package-card')&&target.closest('.guide-section')===activeSection) target.querySelector('details').open=true;
        if(embeddedOrder){
          if(target && target!==activeSection)content.scrollTop+=target.getBoundingClientRect().top-content.getBoundingClientRect().top-8;
          else content.scrollTop=0;
        }else if(target && target!==activeSection)target.scrollIntoView({behavior:'instant',block:'start'});
        else window.scrollTo({top:0,behavior:'instant'});
      } else {
        const previous = history.state && history.state.guideHomeY;
        const tile = document.querySelector('.contents a[href="' + (history.state && history.state.guideTile || '#coordination') + '"]');
        if(focus) (tile || document.getElementById('contents-title')).focus({preventScroll:true});
        if(typeof previous === 'number') window.scrollTo({top:previous,behavior:'instant'});
        else window.scrollTo({top:dialogScrollY,behavior:'instant'});
      }
    });
  }
  function closeSelection(){
    if(closeRequested)return;closeRequested=true;
    if(!embeddedOrder && history.state && history.state.guideFromHome) history.back();
    else {history.replaceState(null,'','#contents');scrollToHash(true);}
  }
  dialog.querySelectorAll('[data-close-arrangements]').forEach(button=>button.addEventListener('click',closeSelection));
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeSelection();});
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=Array.from(dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')).filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
    const first=controls[0],last=controls[controls.length-1],current=document.activeElement;
    if(!first){event.preventDefault();document.getElementById('arrangement-dialog-title').focus();return;}
    if(event.shiftKey&&(current===first||!controls.includes(current))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(current===last||!controls.includes(current))){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeSelection();}});
  document.addEventListener('click',event => {
    const link = event.target.closest('a');
    if(!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if(link.matches('.contents a')) {
      event.preventDefault();
      history.replaceState({...history.state,guideHomeY:window.scrollY,guideTile:link.hash},'',location.href);
      history[embeddedOrder?'replaceState':'pushState']({guideFromHome:true},'',link.hash);
      scrollToHash(true);
    } else if(link === back && activeSection) {
      event.preventDefault();
      if(!embeddedOrder && history.state && history.state.guideFromHome) history.back();
      else {history.replaceState(null,'','#contents');scrollToHash(true);}
    }
  });
  window.addEventListener('popstate',() => scrollToHash(true));
  let loading = false;
  async function load() {
    if (loading) return;
    loading = true;
    content.setAttribute('aria-busy','true');
    try {
      const response = await fetch('/data/services.json?v=20261125-live-v54',{cache:'no-cache'});
      if (!response.ok) throw new Error('Service source unavailable');
      const links=await fetch('/site/orders/service-links.json?v=20261126-live-v97').then(r=>r.ok?r.json():{}).catch(()=>({}));
      render(await response.json(),links.services||{});
    } catch(error) {
      content.innerHTML = '<div class="load-error"><h2>تعذّر تحميل التجهيزات</h2><p>حاولوا مرة ثانية لعرض التفاصيل هنا.</p><button type="button" id="retry-guide">إعادة المحاولة</button></div>';
      content.setAttribute('aria-busy','false');
      document.getElementById('retry-guide').addEventListener('click',load);
      console.error(error);
    } finally {loading=false;}
  }
  let statusTimeout;
  function status(message) {
    const el = document.getElementById('share-status');
    el.textContent = message; el.classList.add('visible');
    clearTimeout(statusTimeout); statusTimeout=setTimeout(() => el.classList.remove('visible'),3500);
  }
  document.addEventListener('click',async event => {
    const button = event.target.closest('[data-share],[data-share-path]');
    if(!button) return;
    const id = button.dataset.share || (activeSection ? activeSection.id : '');
    // Standalone shares return to this portal; native requests retain their guide URLs.
    const nativePaths={coordination:'/services/coordination/',dining:'/services/dining-tables/',seating:'/services/outdoor-seating/',cinema:'/services/cinema/'};
    const section=activeSection?.id||id;
    const url = new URL(embeddedOrder ? nativePaths[section]||'/services-guide/' : activeSection?.dataset.portalSharePath||'/services-guide/',location.origin);
    try {
      if (navigator.share) {await navigator.share({text:url.href});return;}
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      status(button.dataset.sharePath ? 'تم نسخ رابط الخدمة' : id ? 'تم نسخ رابط القسم' : 'تم نسخ رابط تنسيقات وجلسات');
    } catch(error) {
      if(error.name === 'AbortError') return;
      const dialog = document.getElementById('share-dialog');
      dialog.querySelector('h2').textContent='رابط '+(activeSection?.dataset.title||'تنسيقات وجلسات');
      document.getElementById('share-link').value=url.href;
      dialog.showModal(); document.getElementById('share-link').select();
    }
  });
  document.getElementById('close-share').addEventListener('click',() => document.getElementById('share-dialog').close());
  window.addEventListener('hashchange',() => scrollToHash());
  scrollToHash();
  load();
})();

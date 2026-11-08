/* Read service copy directly from the existing page; never maintain a second catalogue here.
   Dynamic prices and galleries are shared via /service-data.js. See README.md in this folder. */
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
    return {src:image.getAttribute('data-page-src') || image.getAttribute('src'), alt:image.alt};
  };
  function serviceCard({title, price, priceUnit = '', photos = [], body, id = '', label = 'تفاصيل الخدمة', imageAlt, className = '', capacity = '', expandable = true}) {
    const priceMarkup = '<strong class="price">' + escape(price) + (priceUnit ? '<span class="price-unit"> ' + escape(priceUnit) + '</span>' : '') + '</strong>';
    if (!photos.length) {
      return '<article class="package-card package-card--text"><details class="package-details hospitality-details">'
        + '<summary class="package-heading"><h3>' + escape(title) + '</h3>' + priceMarkup + ''
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>'
        + '<div class="package-details-body">' + body + '</div></details></article>';
    }
    if (className === 'photo-card' || className === 'coordination-card') {
      return '<article class="package-card seating-collapsed-card"' + (id ? ' id="' + escape(id) + '"' : '') + '><details class="seating-collapsed-details"' + (className === 'photo-card' ? ' name="guide-seating"' : '') + '>'
        + '<summary class="seating-collapsed-summary"><span class="seating-collapsed-main"><span class="seating-collapsed-title">' + escape(title) + '</span>'
        + (capacity ? '<span class="seating-capacity-badge">' + escape(capacity) + '</span>' : '') + '</span>'
        + '<span class="seating-summary-bottom">' + priceMarkup
        + '<span class="seating-detail-footer"><svg class="seating-collapsed-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg><span class="seating-detail-hint">' + (className === 'coordination-card' ? 'الصور والتفاصيل' : 'الصورة والتفاصيل') + '</span></span></span></summary>'
        + '<div class="seating-collapsed-content">' + FD_GUIDE_GALLERY.markup(photos,title,imageAlt)
        + '<div class="package-details-body">' + body + '</div></div></details></article>';
    }
    return '<article class="package-card package-card--gallery ' + className + (photos.length ? '' : ' package-card--text') + '"' + (id ? ' id="' + escape(id) + '"' : '') + '>'
      + (photos.length ? FD_GUIDE_GALLERY.markup(photos,title,imageAlt) : '')
      + '<div class="package-copy"><div class="package-heading"><div class="service-heading-copy"><h3>' + escape(title) + '</h3>' + (capacity ? '<span class="service-capacity" aria-label="عدد الأشخاص: ' + escape(capacity) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/></svg>' + escape(capacity) + '</span>' : '') + '</div>' + priceMarkup + '</div>'
      + (expandable ? '<details class="package-details"><summary><span>' + escape(label) + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="package-details-body">' + body + '</div></details>' : '<div class="package-details-body">' + body + '</div>') + '</div></article>';
  }
  // Illustrative cabin photos can be replaced here without duplicating package facts or prices.
  const packagePhotos = {
    'باقة الورد': 'imgs/french_1.webp',
    'باقة الورد المميزة': 'imgs/greek_1.webp',
    'باقة اللحظات': 'imgs/dome_2.webp',
    'باقة الاحتفال': 'imgs/royal_1.webp',
    'باقة VIP': 'imgs/classic_2.webp',
    'التجربة المتكاملة': 'imgs/royal_2.webp'
  };
  const section = (id, title, intro, body, showTitle = false) => '<section class="guide-section" id="' + id + '" data-title="' + escape(title) + '" aria-labelledby="title-' + id + '"><header class="section-heading' + (showTitle ? ' section-heading--titled' : '') + '"><h2 tabindex="-1" id="title-' + id + '">' + escape(showTitle ? title : intro) + '</h2>' + (showTitle ? '<p>' + escape(intro) + '</p>' : '') + '</header>' + body + '</section>';
  function packages(doc, key) {
    const panel = doc.querySelector('#hd-' + key + '-panel');
    if (!panel) throw new Error('Missing package panel');
    return '<div class="package-grid">' + Array.from(panel.querySelectorAll('.hd-package')).map(card => {
      const title = text(card, '.hd-package-name');
      const description = card.querySelector('.hd-package-description');
      const price = card.querySelector('.hd-package-price');
      const contents = list(card, '.hd-item span:last-child');
      const body = (description ? '<p class="package-description">' + escape(description.textContent.trim()) + '</p>' : '') + items(contents);
      const image = packagePhotos[title] || 'imgs/dome_1.webp';
      const complete = Boolean(card.querySelector('#hd-coordination-package-resort'));
      const sharedPhotos = _coordinationPhotos[card.getAttribute('aria-labelledby')];
      const photos = key === 'hospitality' ? [] : sharedPhotos || [image, ...[1,2,3,4,5,6].map(n => image.replace(/_\d+\.webp$/, '_' + n + '.webp')).filter(src => src !== image)].slice(0,6);
      return serviceCard({title,price:price ? price.textContent.trim().replace(/\s*للباقة\s*$/, '') : '',priceUnit:'للباقة',photos,imageAlt:sharedPhotos ? 'تنسيق ' + title : undefined,body,className:key === 'coordination' ? 'coordination-card' : '',label:'تفاصيل الباقة',id:complete ? 'package-complete' : ''});
    }).join('') + '</div>';
  }
  function render(doc) {
    let html = section('coordination','التنسيقات','تجهيزات متكاملة لمناسباتكم', packages(doc,'coordination'), true);
    const diningImage = sourceImage(doc,'.tw-photo img');
    const diningBody = '<div class="dining-prices" aria-label="أسعار طاولات الطعام حسب عدد الأشخاص">' + Object.entries(_tawilatPrices).map(([size,p]) => '<section class="dining-price-card" aria-labelledby="dining-size-' + escape(size) + '"><h3 id="dining-size-' + escape(size) + '"><bdi>' + escape(size) + '</bdi> ' + (Number(size) <= 10 ? 'أشخاص' : 'شخصًا') + '</h3><dl><div><dt>' + escape(text(doc,'#tawilat-opt-plain .tw-package-name')) + '</dt><dd><bdi>' + escape(p.plain) + '</bdi> <span>ريال</span></dd></div><div><dt>' + escape(text(doc,'#tawilat-opt-tansiq .tw-package-name')) + '</dt><dd><bdi>' + escape(p.tansiq) + '</bdi> <span>ريال</span></dd></div></dl></section>').join('') + '</div>'
      + '<div class="dining-options"><section><h3>بدون تنسيق</h3><p>' + escape(text(doc,'#tawilat-opt-plain .tw-package-desc')) + '</p></section><section><h3>مع تنسيق</h3>' + items(_tawilatInclusions) + '</section></div>';
    const diningCard = '<article class="package-card package-card--gallery dining-card">' + FD_GUIDE_GALLERY.markup([diningImage.src],text(doc,'.tw-title'),diningImage.alt) + '<div class="package-copy"><div class="package-details-body">' + diningBody + '</div></div></article>';
    html += section('dining',text(doc,'.tw-title'),text(doc,'.tw-intro'),diningCard,true);
    const seatingExtra = '<aside class="seating-extra" aria-labelledby="seating-extra-title"><h3 id="seating-extra-title">أضف إلى جلستك</h3><div class="seating-extra-offer"><strong>' + escape(text(doc,'.jl-addon-name')) + '</strong><strong class="seating-extra-price">' + escape(text(doc,'.jl-addon-price')) + '</strong></div><p>إضافة اختيارية تُضاف قيمتها لسعر الجلسة</p></aside>';
    html += section('seating',text(doc,'.jl-title'),'جلسات نجهّزها لكم في المساحة الخارجية الخاصة بالكوخ', '<div class="photo-grid">' + _jalsatAllSessions.map(s => serviceCard({title:s.name,price:s.price,priceUnit:'للجلسة',photos:[s.img],imageAlt:s.name,className:'photo-card',capacity:s.persons,label:'تفاصيل الجلسة',body:'<p class="session-description">' + escape(s.desc) + '</p>'})).join('') + '</div>' + seatingExtra, true);
    content.innerHTML = html;
    FD_GUIDE_GALLERY.mount();
    content.setAttribute('aria-busy','false');
    content.classList.add('is-ready');
    scrollToHash();
  }
  const homeBack = {href:back.href, label:back.getAttribute('aria-label')};
  const guideTitle = document.title;
  let activeSection = null;
  history.scrollRestoration = 'manual';
  function routeSection() {
    const id = location.hash.slice(1);
    const target = document.getElementById(id === 'packages' ? 'seating' : id);
    return target && (target.matches('.guide-section') ? target : target.closest('.guide-section'));
  }
  function scrollToHash(focus = false) {
    if(['#hospitality','#cinema'].includes(location.hash)){location.replace('/guest-services/'+location.hash);return;}
    activeSection = routeSection();
    const pendingHash = location.hash === '#package-complete' ? '#coordination' : location.hash === '#packages' ? '#seating' : location.hash;
    const pendingTile = !content.classList.contains('is-ready') && Array.from(document.querySelectorAll('.contents a')).find(link => link.hash === pendingHash);
    const sectionView = Boolean(activeSection || pendingTile);
    document.body.dataset.guideView = sectionView ? 'section' : 'home';
    document.querySelectorAll('.guide-section').forEach(section => section.classList.toggle('is-active',section === activeSection));
    const title = activeSection ? activeSection.dataset.title : pendingTile ? pendingTile.querySelector('.tile-title').textContent : '';
    back.href = sectionView ? '#contents' : homeBack.href;
    back.setAttribute('aria-label',sectionView ? 'العودة إلى تنسيقات وجلسات' : homeBack.label);
    document.getElementById('guide-back-label').textContent = sectionView ? 'تنسيقات وجلسات' : 'رجوع';
    document.title = title ? title + ' | يوم العائلة' : guideTitle;
    requestAnimationFrame(() => {
      if(activeSection) {
        if(focus) activeSection.querySelector('h2').focus({preventScroll:true});
        const target = location.hash === '#package-complete' ? document.getElementById('package-complete') : null;
        if(target) target.scrollIntoView({behavior:'instant',block:'start'});
        else window.scrollTo({top:0,behavior:'instant'});
      } else {
        const previous = history.state && history.state.guideHomeY;
        const tile = document.querySelector('.contents a[href="' + (history.state && history.state.guideTile || '#coordination') + '"]');
        if(focus) (tile || document.getElementById('contents-title')).focus({preventScroll:true});
        if(typeof previous === 'number') window.scrollTo({top:previous,behavior:'instant'});
        else if(location.hash === '#contents') document.getElementById('contents').scrollIntoView({behavior:'instant'});
        else window.scrollTo({top:0,behavior:'instant'});
      }
    });
  }
  document.addEventListener('click',event => {
    const link = event.target.closest('a');
    if(!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if(link.matches('.contents a')) {
      event.preventDefault();
      history.replaceState({...history.state,guideHomeY:window.scrollY,guideTile:link.hash},'',location.href);
      history.pushState({guideFromHome:true},'',link.hash);
      scrollToHash(true);
    } else if(link === back && activeSection) {
      event.preventDefault();
      if(history.state && history.state.guideFromHome) history.back();
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
      const response = await fetch('/index.html',{cache:'no-cache'});
      if (!response.ok) throw new Error('Service source unavailable');
      render(new DOMParser().parseFromString(await response.text(),'text/html'));
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
    const button = event.target.closest('[data-share]');
    if(!button) return;
    const id = activeSection ? (location.hash === '#package-complete' ? 'package-complete' : activeSection.id) : button.dataset.share;
    // A separate text-only entry avoids the original guide's cached logo preview.
    const url = new URL('/arrangements/',location.origin);
    if(id) url.hash=id;
    try {
      if (navigator.share) {await navigator.share({title:document.title,url:url.href});return;}
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      status(id ? 'تم نسخ رابط القسم' : 'تم نسخ رابط تنسيقات وجلسات');
    } catch(error) {
      if(error.name === 'AbortError') return;
      const dialog = document.getElementById('share-dialog');
      document.getElementById('share-link').value=url.href;
      dialog.showModal(); document.getElementById('share-link').select();
    }
  });
  document.getElementById('close-share').addEventListener('click',() => document.getElementById('share-dialog').close());
  window.addEventListener('hashchange',() => scrollToHash());
  scrollToHash();
  load();
})();

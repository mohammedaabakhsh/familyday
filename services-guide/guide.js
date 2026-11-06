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
    return {src:image.getAttribute('src'), alt:image.alt};
  };
  function serviceCard({title, price, photos = [], body, id = '', label = 'تفاصيل الخدمة', imageAlt, className = '', capacity = ''}) {
    if (!photos.length) {
      return '<article class="package-card package-card--text"><details class="package-details hospitality-details">'
        + '<summary class="package-heading"><h3>' + escape(title) + '</h3><strong class="price">' + escape(price) + '</strong>'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>'
        + '<div class="package-details-body">' + body + '</div></details></article>';
    }
    return '<article class="package-card package-card--gallery ' + className + (photos.length ? '' : ' package-card--text') + '"' + (id ? ' id="' + escape(id) + '"' : '') + '>'
      + (photos.length ? FD_GUIDE_GALLERY.markup(photos,title,imageAlt) : '')
      + '<div class="package-copy"><div class="package-heading"><div class="service-heading-copy"><h3>' + escape(title) + '</h3>' + (capacity ? '<span class="service-capacity" aria-label="عدد الأشخاص: ' + escape(capacity) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/></svg>' + escape(capacity) + '</span>' : '') + '</div><strong class="price">' + escape(price) + '</strong></div>'
      + '<details class="package-details"><summary><span>' + escape(label) + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="package-details-body">' + body + '</div></details></div></article>';
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
  const section = (id, number, title, intro, body) => '<section class="guide-section" id="' + id + '" aria-labelledby="title-' + id + '"><header class="section-heading"><span class="section-number" aria-hidden="true">' + number + '</span><div><h2 id="title-' + id + '">' + escape(title) + '</h2><p>' + escape(intro) + '</p></div></header>' + body + '</section>';
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
      const photos = key === 'hospitality' ? [] : [image, ...[1,2,3,4,5,6].map(n => image.replace(/_\d+\.webp$/, '_' + n + '.webp')).filter(src => src !== image)].slice(0,6);
      return serviceCard({title,price:price ? price.textContent.trim() : '',photos,body,label:'تفاصيل الباقة',id:complete ? 'package-complete' : ''});
    }).join('') + '</div>';
  }
  function render(doc) {
    let html = section('hospitality','01','الضيافة',text(doc,'#hd-hospitality-panel .hd-intro'),packages(doc,'hospitality'));
    html += section('coordination','02','التنسيقات','باقات متنوعة لتنسيق المناسبات داخل الكوخ.', packages(doc,'coordination'));
    const diningImage = sourceImage(doc,'.tw-photo img');
    const diningBody = '<table class="service-price-table"><thead><tr><th scope="col">الأشخاص</th><th scope="col">' + escape(text(doc,'#tawilat-opt-plain .tw-package-name')) + '</th><th scope="col">' + escape(text(doc,'#tawilat-opt-tansiq .tw-package-name')) + '</th></tr></thead><tbody>' + Object.entries(_tawilatPrices).map(([size,p]) => '<tr><th scope="row">' + escape(size) + '</th><td>' + escape(p.plain) + ' ر.س</td><td>' + escape(p.tansiq) + ' ر.س</td></tr>').join('') + '</tbody></table><p class="small-note">تتوفر الطاولات والكراسي بخيارات متعددة حسب عدد الضيوف، ويمكن اختيارها مع التنسيق أو بدونه.</p>';
    const diningPrice = Math.min(...Object.values(_tawilatPrices).flatMap(p => [p.plain,p.tansiq]));
    html += section('dining','03',text(doc,'.tw-title'),'خيارات لطاولات الطعام حسب عدد الضيوف، مع إمكانية إضافة التنسيق.', serviceCard({title:text(doc,'.tw-title'),price:'تبدأ من ' + diningPrice + ' ريال',photos:[diningImage.src],imageAlt:diningImage.alt,body:diningBody,label:'التفاصيل والأسعار'}));
    const cinemaImage = sourceImage(doc,'.cn-photo img');
    const cinemaFacts = Array.from(doc.querySelectorAll('.cn-stat')).filter(stat => !stat.querySelector('.cn-price')).map(stat => '<div><dt>' + escape(text(stat,'dt')) + '</dt><dd>' + escape(text(stat,'dd')) + '</dd></div>').join('');
    const cinemaBody = '<p class="package-description">' + escape(text(doc,'.cn-intro')) + '</p><dl class="service-facts">' + cinemaFacts + '</dl><h4>' + escape(text(doc,'#cn-inclusions-title')) + '</h4>' + items(list(doc,'.cn-inclusions li'));
    html += section('cinema','04',text(doc,'.cn-title'),text(doc,'.cn-intro'), serviceCard({title:text(doc,'.cn-title'),price:text(doc,'.cn-price'),photos:[cinemaImage.src],imageAlt:cinemaImage.alt,body:cinemaBody,label:'تفاصيل الجلسة'}));
    html += section('seating','05',text(doc,'.jl-title'),'جلسات خارجية تُجهز داخل المساحة الخارجية الخاصة بالكوخ، بخيارات تناسب أعدادًا مختلفة.', '<div class="photo-grid">' + _jalsatAllSessions.map(s => serviceCard({title:s.name,price:s.price,photos:[s.img],imageAlt:s.name,className:'photo-card',capacity:s.persons,label:'تفاصيل الجلسة',body:'<p class="session-description">' + escape(s.desc) + '</p>'})).join('') + '</div><p class="seating-extra">إضافة اختيارية: ' + escape(text(doc,'.jl-addon-name')) + ' · ' + escape(text(doc,'.jl-addon-price')) + '</p>');
    html += section('resort-map','06','خريطة الأكواخ','الأكواخ والحديقة المشتركة في نظرة واحدة.', FD_GUIDE_MAP.markup());
    content.innerHTML = html;
    FD_GUIDE_MAP.mount();
    FD_GUIDE_GALLERY.mount();
    content.setAttribute('aria-busy','false');
    scrollToHash();
    observeSections();
  }
  function scrollToHash() {
    if(location.hash === '#packages') history.replaceState(null,'','#seating');
    const target = document.getElementById(location.hash.slice(1));
    if (target && (target.classList.contains('guide-section') || target.id === 'contents' || target.id === 'package-complete')) target.scrollIntoView({behavior:'instant',block:'start'});
  }
  let observing = false;
  function observeSections() {
    if (observing) return;
    observing = true;
    const links = Array.from(document.querySelectorAll('.contents a'));
    let queued = false;
    const update = () => {
      queued = false;
      let current = '';
      document.querySelectorAll('.guide-section').forEach(s => {if(s.getBoundingClientRect().top < 140) current=s.id;});
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'resort-map';
      links.forEach(a => {if(a.hash === '#' + current) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');});
      document.getElementById('current-section').textContent = current ? text(document,'#title-' + current) : 'دليل يوم العائلة';
    };
    window.addEventListener('scroll',() => {if(!queued){queued=true;requestAnimationFrame(update);}}, {passive:true});
    update();
  }
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
      content.innerHTML = '<div class="load-error"><h2>تعذّر تحميل تفاصيل الدليل</h2><p>حاولوا مرة ثانية لعرض التفاصيل هنا.</p><button type="button" id="retry-guide">إعادة المحاولة</button></div>';
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
    const id = button.dataset.share;
    const url = new URL('/services-guide/',location.origin);
    if(id) url.hash=id;
    try {
      if (!id && navigator.share) {await navigator.share({title:document.title,url:url.href});return;}
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      status(id ? 'تم نسخ رابط القسم' : 'تم نسخ رابط الدليل');
    } catch(error) {
      if(error.name === 'AbortError') return;
      const dialog = document.getElementById('share-dialog');
      document.getElementById('share-link').value=url.href;
      dialog.showModal(); document.getElementById('share-link').select();
    }
  });
  document.getElementById('close-share').addEventListener('click',() => document.getElementById('share-dialog').close());
  window.addEventListener('hashchange',scrollToHash);
  load();
})();

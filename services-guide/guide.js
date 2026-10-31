/* Read service copy directly from the existing page; never maintain a second catalogue here.
   Dynamic prices and galleries are shared via /service-data.js. See README.md in this folder. */
(function () {
  'use strict';
  const content = document.getElementById('guide-content');
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (root, selector) => {
    const node = root.querySelector(selector);
    if (!node) throw new Error('Missing service content: ' + selector);
    return node.textContent.trim();
  };
  const list = (root, selector) => Array.from(root.querySelectorAll(selector), el => el.textContent.trim());
  const items = values => '<ul class="inclusions">' + values.map(v => '<li>' + escape(v) + '</li>').join('') + '</ul>';
  const photo = (src, alt, cls = '') => '<img class="' + cls + '" src="/' + escape(src.replace(/^\//, '')) + '" alt="' + escape(alt) + '" width="1200" height="1200" loading="lazy" decoding="async">';
  const sourcePhoto = (root, selector) => {
    const image = root.querySelector(selector);
    if (!image) throw new Error('Missing service image: ' + selector);
    return photo(image.getAttribute('src'), image.alt);
  };
  const section = (id, number, title, intro, body) => '<section class="guide-section" id="' + id + '" aria-labelledby="title-' + id + '"><header class="section-heading"><span class="section-number" aria-hidden="true">' + number + '</span><h2 id="title-' + id + '">' + escape(title) + '</h2><p>' + escape(intro) + '</p></header>' + body + '<a class="back-index" href="#contents">↑ الفهرس</a></section>';
  function packages(doc, key) {
    const panel = key === 'winter' ? doc : doc.querySelector('#hd-' + key + '-panel');
    if (!panel) throw new Error('Missing package panel');
    return '<div class="package-grid">' + Array.from(panel.querySelectorAll(key === 'winter' ? '#winter-package' : '.hd-package')).map(card => {
      const title = text(card, '.hd-package-name');
      const description = card.querySelector('.hd-package-description');
      const price = card.querySelector('.hd-package-price');
      const heading = '<h3>' + escape(title) + '</h3>' + (description ? '<p>' + escape(description.textContent.trim()) + '</p>' : '');
      const priceLabel = price ? '<strong class="price">' + escape(price.textContent.trim()) + '</strong>' : '';
      const body = items(list(card, '.hd-item span:last-child'));
      return key === 'coordination' ? '<details class="package-card"><summary><div>' + heading + priceLabel + '</div><span class="expand-icon" aria-hidden="true"></span></summary>' + body + '</details>' : '<article class="package-card">' + heading + priceLabel + body + '</article>';
    }).join('') + '</div>';
  }
  function render(doc) {
    let html = section('coordination','01','التنسيقات','باقات متنوعة لتنسيق المناسبات داخل الكوخ.', packages(doc,'coordination'));
    html += section('dining','02',text(doc,'.tw-title'),'خيارات لطاولات الطعام حسب عدد الضيوف، مع إمكانية إضافة التنسيق.', '<div class="feature-card"><figure>' + sourcePhoto(doc,'.tw-photo img') + '</figure><div class="feature-copy"><table><caption>الأسعار بالريال</caption><thead><tr><th scope="col">الأشخاص</th><th scope="col">' + escape(text(doc,'#tawilat-opt-plain .tw-package-name')) + '</th><th scope="col">' + escape(text(doc,'#tawilat-opt-tansiq .tw-package-name')) + '</th></tr></thead><tbody>' + Object.entries(_tawilatPrices).map(([size,p]) => '<tr><th scope="row">' + size + '</th><td>' + p.plain + '</td><td>' + p.tansiq + '</td></tr>').join('') + '</tbody></table><p class="small-note">تتوفر الطاولات والكراسي بخيارات متعددة حسب عدد الضيوف، ويمكن اختيارها مع التنسيق أو بدونه.</p></div></div>');
    html += section('cinema','03',text(doc,'.cn-title'),'جلسة سينما خارجية خاصة داخل مساحة الكوخ.', '<div class="feature-card"><figure>' + sourcePhoto(doc,'.cn-photo img') + '</figure><div class="feature-copy"><div class="facts">' + Array.from(doc.querySelectorAll('.cn-stat')).map(stat => '<div><span>' + escape(text(stat,'dt')) + '</span><strong>' + escape(text(stat,'dd')) + '</strong></div>').join('') + '</div>' + '<h3>' + escape(text(doc,'#cn-inclusions-title')) + '</h3>' + items(list(doc,'.cn-inclusions li')) + '</div></div>');
    html += section('seating','04',text(doc,'.jl-title'),'جلسات خارجية تُجهز داخل المساحة الخارجية الخاصة بالكوخ، بخيارات تناسب أعدادًا مختلفة.', '<div class="photo-grid">' + _jalsatAllSessions.map(s => '<article class="photo-card">' + photo(s.img,s.name) + '<div class="card-copy"><h3>' + escape(s.name) + '</h3><div class="card-meta"><span>' + escape(s.persons) + '</span><strong class="price">' + escape(s.price) + '</strong></div><details class="notes"><summary>تفاصيل الجلسة</summary><p>' + escape(s.desc) + '</p></details></div></article>').join('') + '</div><p class="seating-extra">إضافة اختيارية: ' + escape(text(doc,'.jl-addon-name')) + ' · ' + escape(text(doc,'.jl-addon-price')) + '</p>');
    html += section('resort-map','05','خريطة الأكواخ','اختر الكوخ من الخريطة لعرض صورته ومواصفاته المختصرة.', FD_GUIDE_MAP.markup());
    content.innerHTML = html;
    FD_GUIDE_MAP.mount();
    content.setAttribute('aria-busy','false');
    scrollToHash();
    observeSections();
  }
  function scrollToHash() {
    if(location.hash === '#packages') history.replaceState(null,'','#seating');
    const target = document.getElementById(location.hash.slice(1));
    if (target && (target.classList.contains('guide-section') || target.id === 'contents')) target.scrollIntoView({behavior:'instant',block:'start'});
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

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
  const cta = (path, label = 'التفاصيل والطلب') => '<a class="service-link" href="' + path + '">' + label + ' <span aria-hidden="true">←</span></a>';
  const section = (id, number, title, intro, body) => '<section class="guide-section" id="' + id + '" aria-labelledby="title-' + id + '"><header class="section-heading"><div><span class="section-number" aria-hidden="true">' + number + '</span><h2 id="title-' + id + '">' + escape(title) + '</h2><p>' + escape(intro) + '</p></div><button class="copy-link" data-share="' + id + '" type="button" aria-label="نسخ رابط قسم ' + escape(title) + '">نسخ رابط القسم</button></header>' + body + '</section>';
  function hospitality(doc, key) {
    const panel = doc.querySelector('#hd-' + key + '-panel');
    if (!panel) throw new Error('Missing hospitality panel');
    const cards = Array.from(panel.querySelectorAll('.hd-package')).map(card => {
      const title = text(card, '.hd-package-name');
      const description = card.querySelector('.hd-package-description');
      const price = card.querySelector('.hd-package-price');
      const body = items(list(card, '.hd-item span:last-child'));
      return '<article class="package-card"><h3>' + escape(title) + '</h3>' + (description ? '<p>' + escape(description.textContent.trim()) + '</p>' : '') + (price ? '<strong class="price">' + escape(price.textContent.trim()) + '</strong>' : '') + (key === 'hospitality' ? body : '<details><summary>ماذا تشمل؟</summary>' + body + '</details>') + '</article>';
    });
    return '<div class="package-grid ' + (key === 'coordination' ? 'two-col' : '') + '">' + cards.join('') + '</div>' + cta('/services/hospitality/?tab=' + key, 'عرض ' + ({hospitality:'الضيافة',coordination:'التنسيقات',packages:'الباقات'})[key]);
  }
  function render(doc) {
    let html = section('hospitality','01','الضيافة','بداية ترحّب بكم، وضيافة تناسب وقتكم.', hospitality(doc, 'hospitality'));
    html += section('coordination','02','التنسيقات','تفاصيل تختارونها لمناسبتكم، من الورد إلى تنسيق الأمسية.', hospitality(doc, 'coordination'));
    html += section('packages','03','الباقات','خيارات تجمع لكم تفاصيل الجلسة في باقة واحدة.', hospitality(doc, 'packages'));
    html += section('seating','04',text(doc,'.jl-title'),'اختاروا الجلسة التي تناسب عددكم وأجواءكم.', '<div class="photo-grid">' + _jalsatAllSessions.map(s => '<article class="photo-card">' + photo(s.img,s.name) + '<div class="card-copy"><div class="card-meta"><span>' + escape(s.persons) + '</span><strong class="price">' + escape(s.price) + '</strong></div><h3>' + escape(s.name) + '</h3><p>' + escape(s.desc) + '</p></div></article>').join('') + '</div><p class="seating-extra">إضافة اختيارية: ' + escape(text(doc,'.jl-addon-name')) + ' · ' + escape(text(doc,'.jl-addon-price')) + '</p><details class="notes"><summary>تعليمات وملاحظات</summary>' + items(list(doc,'.jl-notes-list li')) + '</details>' + cta('/services/outdoor-seating/'));
    html += section('dining','05',text(doc,'.tw-title'),'مساحة تجمعكم حول طاولة واحدة.', '<div class="feature-layout"><figure>' + sourcePhoto(doc,'.tw-photo img') + '</figure><div class="feature-copy"><h3>اختاروا العدد والتجهيز</h3><div class="table-scroll"><table><caption>أسعار تجهيز طاولات الطعام بالريال</caption><thead><tr><th scope="col">الأشخاص</th><th scope="col">' + escape(text(doc,'#tawilat-opt-plain .tw-package-name')) + '</th><th scope="col">' + escape(text(doc,'#tawilat-opt-tansiq .tw-package-name')) + '</th></tr></thead><tbody>' + Object.entries(_tawilatPrices).map(([size,p]) => '<tr><th scope="row">' + size + '</th><td>' + p.plain + '</td><td>' + p.tansiq + '</td></tr>').join('') + '</tbody></table></div><p>' + escape(text(doc,'#tawilat-opt-plain .tw-package-desc')) + '، أو ' + escape(text(doc,'#tawilat-opt-tansiq .tw-package-desc')) + '.</p>' + cta('/services/dining-tables/') + '</div></div>');
    html += section('cinema','06',text(doc,'.cn-title'),text(doc,'.cn-intro'),'<div class="feature-layout"><figure>' + sourcePhoto(doc,'.cn-photo img') + '</figure><div class="feature-copy"><div class="large-facts">' + Array.from(doc.querySelectorAll('.cn-stat')).map(stat => '<div><span>' + escape(text(stat,'dt')) + '</span><strong>' + escape(text(stat,'dd')) + '</strong></div>').join('') + '</div><h3>' + escape(text(doc,'#cn-inclusions-title')) + '</h3>' + items(list(doc,'.cn-inclusions li')) + '<details class="notes"><summary>تعليمات وملاحظات</summary>' + items(list(doc,'.cn-notes-list li')) + '</details>' + cta('/services/cinema/') + '</div></div>');
    html += section('water-games','07',text(doc,'.wm-title'),text(doc,'#wm-selections-title'), '<div class="water-preview">' + _maiyaAllGames.slice(0,4).map(g => '<figure>' + photo(g.img,g.name) + '<figcaption>' + escape(g.name) + '</figcaption></figure>').join('') + '</div><details class="gallery-more"><summary>شاهدوا جميع الألعاب (' + _maiyaAllGames.length + ')</summary><div class="water-preview">' + _maiyaAllGames.slice(4).map(g => '<figure>' + photo(g.img,g.name) + '<figcaption>' + escape(g.name) + '</figcaption></figure>').join('') + '</div></details><details class="notes"><summary>تعليمات وملاحظات</summary>' + items(list(doc,'.wm-notes-list li')) + '</details>' + cta('/services/water-games/','اختيار الألعاب والطلب'));
    html += section('games','08',text(doc,'.tg-title'),'وقت ممتع للعائلة والأصدقاء.', '<div class="feature-layout"><figure>' + sourcePhoto(doc,'.tg-photo img') + '</figure><div class="feature-copy">' + Array.from(doc.querySelectorAll('.tg-package')).map(p => '<article class="compact-card"><div class="card-meta"><h3>' + escape(text(p,'.tg-package-name')) + '</h3><strong class="price">' + escape(text(p,'.tg-package-price')) + '</strong></div><p>' + escape(text(p,'.tg-package-description')) + '</p></article>').join('') + '<h3>' + escape(text(doc,'#tg-games-title')) + '</h3>' + items(list(doc,'.tg-games li')) + '<details class="notes"><summary>تعليمات وملاحظات</summary>' + items(list(doc,'.tg-notes-list li')) + '</details>' + cta('/services/games/') + '</div></div>');
    html += section('restaurant','09','المطعم',text(doc,'.menu-hours'),'<div class="restaurant-panel"><div><h3>من الوجبة إلى فنجان القهوة</h3><p>تصفّحوا الأصناف، ثم انتقلوا إلى المنيو لإضافة اختياراتكم وإكمال الطلب.</p>' + cta('/menu/','فتح المنيو والطلب') + '</div><div class="menu-categories">' + Object.entries(_menuData).map(([name,rows]) => '<details><summary>' + escape(name) + '<span>' + rows.length + ' أصناف</span></summary><ul class="menu-list">' + rows.map(r => '<li><div><span>' + escape(r.name) + '</span>' + (r.desc ? '<small>' + escape(r.desc) + '</small>' : '') + '</div><strong>' + escape(r.price) + ' ريال</strong></li>').join('') + '</ul></details>').join('') + '</div></div>');
    content.innerHTML = html;
    content.setAttribute('aria-busy','false');
    scrollToHash();
    observeSections();
  }
  function scrollToHash() {
    const id = location.hash.slice(1);
    const section = document.getElementById(id);
    if (section && section.classList.contains('guide-section')) section.scrollIntoView({behavior:'instant',block:'start'});
  }
  function observeSections() {
    const links = Array.from(document.querySelectorAll('.category-nav a'));
    // Read positions together, once per frame. Keep the chosen anchor while scrolling.
    let queued = false;
    const update = () => {
      queued = false;
      let current = '';
      document.querySelectorAll('.guide-section').forEach(s => {if(s.getBoundingClientRect().top < 180) current=s.id;});
      links.forEach(a => {if(a.hash === '#' + current) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');});
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
      content.innerHTML = '<div class="load-error"><h2>تعذّر تحميل تفاصيل الدليل</h2><p>يمكنكم إعادة المحاولة أو تصفّح صفحات الخدمات مباشرة.</p><button type="button" id="retry-guide">إعادة المحاولة</button><a href="/services/">فتح الخدمات ←</a></div>';
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

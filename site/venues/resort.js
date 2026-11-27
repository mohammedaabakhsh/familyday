// resort destination: approved views, separate from shared navigation and requests.
export function createResortViews(context) {
  function resortHome() {
    const { guideCopy, icon, out, safe, unit, venue } = context;
    return `<div class="venue-overview resort-overview"><section class="resort-intro"><h1>دليلكم لمنتجع يوم العائلة</h1><p><span>منتجع بأكواخ متنوعة للأزواج والعائلات</span><br><span>ومساحات خاصة لجمعات الأهل والأصدقاء</span></p></section><section class="hero"><img src="${safe(unit(10).images[0])}" alt="منتجع يوم العائلة" fetchpriority="high"><div class="hero-content"><span class="eyebrow">${icon('pin')}${safe(venue().location)}</span><p>خصوصية تليق بكم وراحة تستحقونها</p></div></section><div class="facts-strip">${[
      ['home', '12 من الأكواخ الخاصة'],
      ['spark', 'حديقة مشتركة'],
      ['water', 'مسابح خاصة'],
    ]
      .map(([i, t]) => `<div>${icon(i)}<span>${t}</span></div>`)
      .join(
        '',
      )}</div>${out(guideCopy.resortReviews.url, '<span class="review-stars" aria-hidden="true">★★★★<span class="review-partial">★</span></span><span><bdi>4.7</bdi> من 5</span><span>شاهد تقييماتنا على Google</span>', 'resort-reviews')}</div>`;
  }

  function resortCard(u) {
    const { compare, explorationTitle, guests, icon, link, prefix, rooms, safe } = context;
    const garden = u.id === 11,
      feature = u.raw?.bath?.summary || '';
    return `<article class="unit-card resort-unit-card ${garden ? 'garden-card' : ''}" data-unit-id="${u.id}"><a class="card-photo" href="${prefix(u.path)}" aria-label="التفاصيل والصور — ${safe(u.name)}"><img src="${safe(u.images[0])}" alt="${safe(u.name)}" loading="lazy"></a><div class="card-copy"><div class="card-title-row"><h3>${safe(u.name)}</h3><span class="card-audience">${garden ? 'لجميع الضيوف' : safe(u.suitable)}</span></div><div class="card-facts">${garden ? `<span>${icon('spark')}ألعاب أطفال وشاشة عرض مشتركة</span>` : `<span>${icon('users')}${guests(u.guests)}</span><span>${icon('bed')}${rooms(u.rooms)}</span>${feature ? `<span class="card-feature">${icon('bath')}${safe(feature)}</span>` : ''}`}</div><div class="card-actions">${link(u.path, 'التفاصيل والصور', 'button primary card-details')}${garden ? '' : `<button type="button" class="button outline card-compare" data-card-compare="${u.id}" aria-label="${compare.has(u.id) ? 'إزالة' : 'إضافة'} ${safe(u.name)} ${compare.has(u.id) ? 'من المقارنة' : 'للمقارنة'}" aria-pressed="${compare.has(u.id)}">${compare.has(u.id) ? 'تم الاختيار' : 'قارن'}</button>`}${garden ? `<button type="button" class="button outline card-explore" data-virtual="${safe(u.tour)}">استكشف الحديقة من الداخل ${icon('arrow')}</button>` : link(u.tour, `<span>${safe(explorationTitle(u))}</span>${icon('arrow')}`, 'button outline card-explore')}</div></div></article>`;
  }

  function gardenCard() {
    const { unit } = context;
    return resortCard(unit(11));
  }

  function resortCabins() {
    const { filter, icon, link, unitsFor } = context;
    const cabins = filter === 3 ? [] : unitsFor().filter((u) => !filter || u.rooms === filter),
      count = cabins.length + 1;
    return `<section class="resort-catalog-panel"><div class="catalog-heading"><h1>اختاروا كوخكم</h1>${link('/resort/compare/', 'مقارنة الأكواخ', 'text-link')}</div><div class="filters" aria-label="تصفية الأكواخ والحديقة">${[
      [0, 'الكل'],
      [1, 'غرفة واحدة'],
      [2, 'غرفتان'],
      [3, 'الحديقة المشتركة'],
    ]
      .map(
        ([n, t]) => `<button class="filter" data-filter="${n}" aria-pressed="${filter === n}">${t}</button>`,
      )
      .join(
        '',
      )}</div><div class="units-grid resort-cabin-cards ${count === 1 ? 'single' : ''}">${cabins.map(resortCard).join('')}${gardenCard()}</div><div class="carousel-tools" ${count === 1 ? 'hidden' : ''}><button class="icon-button" data-carousel="-1" aria-label="السابق">${icon('right')}</button><span id="carousel-count">${cabins.length ? '1 / ' + cabins.length : 'الحديقة المشتركة'}</span><button class="icon-button" data-carousel="1" aria-label="التالي">${icon('left')}</button></div></section>`;
  }

  function resortServiceDirectory() {
    const { guideCopy, icon, safe, serviceBy } = context;

    const categoryNote = (group) =>
      group.note
        ? `<div class="restaurant-hours service-category-note">${icon(group.note.icon)}<p>${safe(group.note.text)}</p></div>`
        : '';
    const arrow =
      '<svg class="svcs-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
    return `<section id="resort-service-directory" class="resort-service-directory" data-service-group="0" aria-labelledby="service-directory-title"><header class="svcs-header"><h1 id="service-directory-title" class="svcs-title">خدمات المنتجع</h1></header><div class="svcs-content"><nav class="faq-categories service-categories" aria-label="أقسام خدمات المنتجع">${guideCopy.resortServiceDirectory.map((group, index) => `<button type="button" data-service-group="${index}" aria-controls="directory-group-${index}" aria-pressed="${index === 0}">${safe(group.title)}</button>`).join('')}</nav>${guideCopy.resortServiceDirectory.map((group, index) => `<section id="directory-group-${index}" aria-labelledby="service-group-${index}" ${index ? 'hidden' : ''}><h2 id="service-group-${index}" class="sr-only">${safe(group.title)}</h2>${index === 0 ? restaurantGuide(serviceBy('menu'), { embedded: true }) : `${categoryNote(group)}<div class="svcs-grid">${group.items.map((item) => `<a class="svcs-card" href="${safe(serviceBy(item.id).path)}"><span class="svcs-copy"><span class="svcs-name">${safe(item.label)}</span>${item.description ? `<span class="svcs-description">${safe(item.description)}</span>` : ''}</span>${arrow}</a>`).join('')}</div>`}</section>`).join('')}</div></section>`;
  }

  function bindServiceDirectory() {
    const { $, activeEntryId, navViews, saveView } = context;

    const root = $('#resort-service-directory');
    if (!root) return;
    const select = (group) => {
      root.dataset.serviceGroup = group;
      root
        .querySelectorAll('button[data-service-group]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.serviceGroup === group)));
      root
        .querySelectorAll('.svcs-content>section')
        .forEach((panel, i) => (panel.hidden = String(i) !== group));
    };
    select(navViews[activeEntryId]?.serviceGroup || root.dataset.serviceGroup || '0');
    root.querySelectorAll('button[data-service-group]').forEach(
      (button) =>
        (button.onclick = () => {
          select(button.dataset.serviceGroup);
          root.scrollTop = 0;
          saveView();
        }),
    );
  }

  function restaurantGuide(s, { embedded = false } = {}) {
    const { catalog, heading, icon, money, out, safe } = context;
    const phone = window.FD_GUEST_ORDER_MESSAGE?.copy.restaurant.phone || '966537006531';
    return `<section class="restaurant-guide${embedded ? ' restaurant-directory-menu' : ''}">${embedded ? '' : heading(s.name, s.intro)}<div class="restaurant-hours restaurant-support-hours"><div class="restaurant-hours-line">${icon('clock')}<p>${safe(catalog.source.guestCatalog.restaurantHours)}</p></div><section class="restaurant-support" aria-labelledby="restaurant-help-title"><p id="restaurant-help-title" class="restaurant-help-title">تحتاج مساعدة في طلبك؟</p><div class="restaurant-support-actions">${out('https://wa.me/' + phone, icon('whatsapp') + 'واتساب', 'button outline')}<a class="button outline" href="tel:+${safe(phone)}" aria-label="اتصال بالمطعم">${icon('phone')}اتصال</a></div></section></div><div class="restaurant-menu-browser"><nav class="restaurant-menu-tabs" aria-label="أقسام المنيو">${Object.keys(
      s.menu,
    )
      .map(
        (category, ci) =>
          `<button type="button" data-menu-category="${ci}" aria-pressed="${ci === 0}" aria-controls="restaurant-menu-category-${ci}">${safe(category)}</button>`,
      )
      .join('')}</nav><div class="menu-categories">${Object.entries(s.menu)
      .map(
        ([category, items], ci) =>
          `<section class="restaurant-menu-category" id="restaurant-menu-category-${ci}" aria-label="${safe(category)}" ${ci ? 'hidden' : ''}><div class="restaurant-menu-items">${items.map((item) => `<article class="menu-row"><div class="inline-menu-info"><h3>${safe(item.name)}</h3>${item.desc ? `<p class="note">${safe(item.desc)}</p>` : ''}<strong>${money(item.price)}</strong></div></article>`).join('')}</div></section>`,
      )
      .join(
        '',
      )}</div></div><p class="restaurant-inline-status" role="status">جاري تجهيز الطلب…</p></section>`;
  }

  function diningGuide(s) {
    const { guideCopy, heading, icon, safe, servicePhoto, serviceText, ul } = context;
    return `<section class="dining-guide">${heading(s.name, serviceText(s, 'pageIntro'))}<p class="coordination-order-note">${safe(guideCopy.serviceCopy.dining.advanceNote)}</p>${servicePhoto(s, '', { zoom: false })}<div class="dining-guide-options"><div><h2>تجهيز أساسي</h2><p>طاولات وكراسي فقط</p></div><div><h2>تجهيز مع تنسيق</h2><p>طاولات وكراسي مع تجهيز الطاولة</p></div></div><details class="dining-guide-details package"><summary><span id="dining-contents-title">محتويات التجهيز مع التنسيق</span>${icon('down')}</summary>${ul(s.items)}</details><div class="dining-guide-prices"><div class="dining-guide-table"><table aria-describedby="dining-selection-help"><caption class="sr-only">أسعار طاولات الطعام بالريال</caption><thead><tr><th scope="col">عدد الأشخاص</th><th scope="col">تجهيز أساسي</th><th scope="col">تجهيز مع تنسيق</th></tr></thead><tbody>${Object.entries(
      s.prices,
    )
      .map(
        ([size, price]) =>
          `<tr><th scope="row"><bdi>${safe(size)}</bdi></th>${['plain', 'tansiq'].map((option) => `<td><button type="button" class="dining-guide-option" data-dining-size="${safe(size)}" data-dining-option="${option}" aria-pressed="false" aria-label="${safe(size)} ${Number(size) <= 10 ? 'أشخاص' : 'شخصًا'}، ${option === 'plain' ? 'تجهيز أساسي' : 'تجهيز مع تنسيق'}، ${safe(price[option])} ريال"><bdi>${safe(price[option])}</bdi><span class="dining-guide-price-currency">ريال</span></button></td>`).join('')}</tr>`,
      )
      .join(
        '',
      )}</tbody></table></div></div><p id="dining-selection-help" class="dining-selected-option note" role="status" aria-live="polite" data-empty-text="${safe(guideCopy.serviceCopy.dining.mainOrderHint)}">${safe(guideCopy.serviceCopy.dining.mainOrderHint)}</p><button type="button" class="button primary wide dining-guide-link" data-service-portal data-service-url="https://familydaystay.com/arrangements/#dining" disabled>${safe(guideCopy.serviceCopy.dining.orderLabel)} ${icon('arrow')}</button>${coordinationHelp('dining')}</section>`;
  }

  function resortServiceLink(id) {
    const { guideCopy, icon, route, safe } = context;
    const arrangements = ['dining', 'coordination', 'seating', 'cinema'].includes(id),
      pack = route.params.get('package'),
      session = route.params.get('session'),
      anchor =
        id === 'coordination' && /^(1|2|3|celebration|vip|resort)$/.test(pack)
          ? pack === 'resort'
            ? 'package-complete'
            : 'package-' + pack
          : id === 'seating' && /^[1-6]$/.test(session)
            ? 'session-' + session
            : id;
    return `<a class="button primary wide service-guide-link" data-service-portal href="https://familydaystay.com/${arrangements ? 'arrangements' : 'guest-services'}/#${safe(anchor)}">${safe(guideCopy.serviceCopy?.[id]?.orderLabel || 'اطلب عبر واتساب')} ${icon('arrow')}</a>`;
  }

  function serviceGuidePackage(p, i, { seating = false, request = false } = {}) {
    const { icon, packagePhotos, paragraphs, safe, ul } = context;
    const key = seating
      ? 'session-' + (i + 1)
      : p.id.replace('hd-coordination-', '').replace('package-resort', 'package-complete');
    return `<details class="package" data-remember="guide-package-${i}"><summary><span>${safe(p.name)}${seating ? `<small class="service-guide-capacity">${safe(p.persons)}</small>` : ''}</span><span class="package-price">${safe(p.price)}</span>${icon('down')}</summary><div class="package-body">${packagePhotos(seating ? { name: p.name, images: [p.img] } : p, { zoom: !seating })}${p.description ? `<p class="note">${safe(p.description)}</p>` : ''}${seating ? `<div class="note">${paragraphs(p.desc)}</div>` : ul(p.items)}${p.note ? `<p class="note">${safe(p.note)}</p>` : ''}${request ? `<a class="button primary wide" data-service-portal data-resort-order-key="${safe(key)}" href="https://familydaystay.com/arrangements/#${safe(key)}">${seating ? 'اطلب هذه الجلسة' : 'اطلب هذه الباقة'}</a>` : ''}</div></details>`;
  }

  function coordinationHelp(service = 'coordination') {
    const { guideCopy, safe } = context;
    const help = guideCopy.serviceCopy[service].help;
    return `<section class="coordination-help" aria-labelledby="coordination-help-title"><h2 id="coordination-help-title">${safe(help.title)}</h2><p class="coordination-help-description">${safe(help.description)}</p><nav class="coordination-help-actions" aria-label="التواصل مع منسّق المناسبات"><a href="https://wa.me/${safe(help.phone)}" target="_blank" rel="noopener noreferrer" aria-label="واتساب منسّق المناسبات">واتساب</a><a href="tel:+${safe(help.phone)}" aria-label="اتصال بمنسّق المناسبات">اتصال</a></nav></section>`;
  }

  function resortServiceGuide(s) {
    const {
      catalog,
      guideContents,
      guideCopy,
      guideNotes,
      heading,
      icon,
      money,
      safe,
      servicePhoto,
      serviceText,
      ul,
    } = context;
    const source = catalog.source.guestCatalog[s.id];
    let body = '';
    if (s.id === 'games')
      body = `${servicePhoto(s, '', { zoom: false })}<div class="service-guide-prices">${s.packages.map((p) => `<article><h2>${safe(p.name)}</h2><strong>${safe(p.price)}</strong><p>${safe(p.note)}</p></article>`).join('')}</div>${guideContents(s.items, 'الألعاب المشمولة في الباقتين')}${guideNotes(source.notes)}`;
    if (s.id === 'extras')
      body = `<section class="service-guide-extras" aria-label="المستلزمات الإضافية">${catalog.source.extras.map((p) => `<article class="service-guide-extra"><div><h2>${safe(p.name)}</h2>${p.description ? `<p class="note">${safe(p.description)}</p>` : ''}</div><strong>${money(p.price)}</strong></article>`).join('')}</section>`;
    if (s.id === 'water')
      body = `<div class="price-highlight">${safe(s.offer)}</div><p class="service-guide-explanation">وزّع الألعاب بين الكبار والأطفال</p>${guideNotes(source.notes)}`;
    if (s.id === 'cinema')
      body = `<p class="coordination-order-note">${safe(guideCopy.serviceCopy.cinema.advanceNote)}</p>${servicePhoto(s, '', { zoom: false })}<div class="fact-boxes two-facts">${s.stats.map((t) => `<div class="fact-box"><small>${safe(t.label)}</small><strong>${safe(t.value)}</strong></div>`).join('')}</div><section class="cinema-contents"><h2>محتويات الجلسة</h2>${ul(s.items)}</section><details class="package service-guide-details"><summary><span>تعليمات الاستخدام</span>${icon('down')}</summary><div class="package-body">${guideNotes(source.notes)}</div></details>`;
    if (['hospitality', 'coordination'].includes(s.id))
      body = `<div class="service-guide-packages">${s.packages.map((p, i) => serviceGuidePackage(p, i, { request: s.id === 'coordination' })).join('')}</div>`;
    if (s.id === 'coordination')
      body = `<p class="coordination-order-note">${safe(guideCopy.serviceCopy.coordination.advanceNote)}</p>${body}${coordinationHelp()}`;
    if (s.id === 'seating')
      body = `<p class="coordination-order-note">${safe(guideCopy.serviceCopy.seating.advanceNote)}</p><div class="service-guide-packages">${s.sessions.map((p, i) => serviceGuidePackage(p, i, { seating: true, request: true })).join('')}</div>${coordinationHelp('seating')}`;
    return `<section class="service-guide${['coordination', 'seating'].includes(s.id) ? ' service-guide-coordination' + (s.id === 'seating' ? ' service-guide-seating' : '') : ''}${s.id === 'cinema' ? ' service-guide-cinema' : ''}">${heading(s.name, serviceText(s, 'pageIntro'))}${body}${['coordination', 'seating'].includes(s.id) ? '' : resortServiceLink(s.id)}${s.id === 'cinema' ? coordinationHelp('cinema') : ''}</section>`;
  }

  function promotionList(items) {
    const { safe } = context;
    return `<ul class="promotion-list">${items.map((t) => `<li>${safe(t)}</li>`).join('')}</ul>`;
  }

  function promotionDisclosure(title, body) {
    const { icon, safe } = context;
    return `<details class="promotion-details"><summary><span>${safe(title)}</span>${icon('down')}</summary><div class="promotion-details-body">${body}</div></details>`;
  }

  function promotionAction(a, primary = false) {
    const { icon, safe } = context;
    return `<a class="button ${primary ? 'primary' : 'outline'} wide" href="${safe(a.href)}" ${a.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'}>${safe(a.text)} ${icon('arrow')}</a>`;
  }

  function promotionSteps(steps) {
    const { safe } = context;
    return `<section class="promotion-how" aria-labelledby="promotion-how-title"><h2 id="promotion-how-title">طريقة المشاركة</h2><ol class="promotion-steps">${steps.map(([title, copy], i) => `<li><span class="promotion-step-number" aria-hidden="true">${i + 1}</span><div><h3>${safe(title)}</h3><p>${safe(copy)}</p></div></li>`).join('')}</ol></section>`;
  }

  function promotionSocial(links) {
    const { safe } = context;
    return `<div class="promotion-social">${links
      .map((a) => {
        const snap = a.href.includes('snapchat'),
          name = snap ? 'سناب شات' : a.href.includes('instagram') ? 'إنستقرام' : 'تيك توك',
          handle = snap ? 'familyday.ksa' : 'familydayresort';
        return `<article class="promotion-social-card"><div><h3>${name}</h3><bdi>@${handle}</bdi></div><div class="promotion-social-actions"><a class="button outline" href="${safe(a.href)}" target="_blank" rel="noopener noreferrer" aria-label="زيارة حساب ${name}">${safe(a.text)}</a><button type="button" class="button outline" data-copy="${handle}" aria-label="نسخ اسم مستخدم ${name}">نسخ اسم المستخدم</button></div></article>`;
      })
      .join('')}</div>`;
  }

  function promotionGuide(s) {
    const { catalog, heading, safe, ul, unavailable } = context;
    const c = catalog.source.campaigns.find(
      (c) =>
        c.id === { competition: 'contest-detail', video: 'sharik-detail', loyalty: 'walaa-detail' }[s.id],
    );
    if (!c) return unavailable();
    const sec = (title) => c.sections.find((section) => section.title === title);
    let body = '';
    if (s.id === 'competition') {
      const choose = sec('اختر فيديو للمشاركة'),
        terms = sec('شروط المشاركة'),
        submit = sec('أرسل مشاركتك');
      body = `<div class="promotion-reward"><p class="promotion-kicker">${safe(c.paragraphs[0])}</p><h2>يوم مجاني في منتجع يوم العائلة</h2><p>${safe(c.paragraphs[1])}</p></div>${promotionSteps(
        [
          [choose.title, choose.paragraphs[0]],
          [submit.title, submit.paragraphs[0]],
        ],
      )}${promotionDisclosure(terms.title, `${promotionList(terms.items)}<h3>معيار اختيار الفائز</h3>${terms.paragraphs.map((t) => `<p>${safe(t)}</p>`).join('')}`)}${promotionDisclosure('حساباتنا للمنشن', promotionSocial(terms.links))}<div class="promotion-actions">${choose.links.map((a) => promotionAction(a)).join('')}${submit.links.map((a) => promotionAction(a, true)).join('')}</div>`;
    }
    if (s.id === 'video') {
      const how = sec('طريقة المشاركة'),
        terms = sec('شروط المشاركة'),
        criteria = sec('معايير الاختيار'),
        submit = sec('إرسال المشاركة'),
        email = new URL(c.links[0].href).pathname;
      body = `<div class="promotion-reward"><p class="promotion-kicker">${safe(c.paragraphs[0])}</p><h2>${safe(c.headings[0])}</h2></div>${promotionSteps(
        [
          [c.headings[2], how.paragraphs[0]],
          [c.headings[3], how.paragraphs[1]],
        ],
      )}${promotionDisclosure(terms.title, promotionList(terms.items))}${promotionDisclosure(criteria.title, `${promotionList(criteria.items)}${criteria.paragraphs.map((t) => `<p>${safe(t)}</p>`).join('')}`)}<section class="promotion-contact" aria-labelledby="promotion-contact-title"><h2 id="promotion-contact-title">${safe(submit.title)}</h2><div class="promotion-email"><bdi>${safe(email)}</bdi><button type="button" class="text-link" data-copy="${safe(email)}">نسخ الإيميل</button></div>${submit.links.map((a) => promotionAction(a, true)).join('')}</section>`;
    }
    if (s.id === 'loyalty') {
      const benefits = sec('مزايا البطاقة');
      body = `<div class="promotion-reward promotion-loyalty"><h2>${safe(c.headings[0])}</h2><p>${safe(c.paragraphs[0])}</p><ol class="promotion-stamps" aria-label="ثلاثة حجوزات ثم الحجز الرابع مجانًا">${['الأول', 'الثاني', 'الثالث', 'مجانًا'].map((label, i) => `<li${i === 3 ? ' class="is-reward"' : ''}><span aria-hidden="true">${i + 1}</span><small>${i === 3 ? 'الرابع' : 'الحجز'}<br>${label}</small></li>`).join('')}</ol></div><section class="promotion-benefits" aria-labelledby="promotion-benefits-title"><h2 id="promotion-benefits-title">${safe(benefits.title)}</h2>${ul(benefits.items)}</section><div class="promotion-actions">${c.links.map((a) => promotionAction(a, true)).join('')}</div>`;
    }
    return `<section class="promotion-guide promotion-${safe(s.id)}">${heading(s.name)}${body}</section>`;
  }

  function comparisonSpecials(u) {
    const raw = u.raw,
      features = [
        ...(raw.features?.indoor || []),
        ...(raw.features?.outdoor || []),
        ...(raw.pool?.facilities || []),
      ].filter((t) => /بانيو|جاكوزي|سرير تشميس داخل/.test(t));
    return [
      ...new Set(features.concat(u.extras.filter((e) => e.title === 'حجز الكوخين معًا').map((e) => e.text))),
    ];
  }

  function resortComparison() {
    const { compare, guests, heading, icon, link, rooms, safe, specificationText, unitsFor } = context;

    const cabins = unitsFor('resort'),
      selected = cabins.filter((u) => compare.has(u.id));
    const picker = `<p class="note">اختر من 2 إلى 3 أكواخ للمقارنة</p><div class="compare-picker">${cabins.map((u) => `<label class="compare-chip"><input type="checkbox" data-compare="${u.id}" ${compare.has(u.id) ? 'checked' : ''}><span>${safe(u.name)}</span></label>`).join('')}</div>`;
    const intro = heading('مقارنة الأكواخ');
    if (selected.length < 2)
      return `${intro}${picker}<div class="comparison-empty" role="status">${icon('bed')}<p>${selected.length ? 'اختر كوخًا آخر لعرض المقارنة' : 'اختر الأكواخ التي تريد مقارنتها'}</p></div>`;
    const rows = [
      ['سعة الضيوف', (u) => guests(u.guests)],
      ['لمن يناسب', (u) => u.suitable],
      ['غرف النوم', (u) => rooms(u.rooms)],
      [
        'الأسرّة',
        (u) => (u.raw.features?.indoor || []).filter((t) => /سرير|أسرّة|أسرة/.test(t) && !/تشميس/.test(t)),
      ],
      [
        'الصالة الداخلية',
        (u) =>
          u.raw.livingRoom === 'integrated' ? 'مدمجة مع غرفة النوم' : u.raw.hall ? 'متوفرة' : 'غير متوفرة',
      ],
      [
        'طاولة الطعام',
        (u) => ((u.raw.features?.indoor || []).includes('طاولة طعام') ? 'متوفرة' : 'غير متوفرة'),
      ],
      [
        'الحمامات',
        (u) => (u.bathrooms === 1 ? 'حمام واحد' : u.bathrooms === 2 ? 'حمامان' : u.bathrooms + ' حمامات'),
      ],
      [
        'المسبح',
        (u) =>
          u.sections
            .find((s) => s.title === 'المنطقة الخارجية والمسبح')
            ?.items.find((t) => /مسبح خاص/.test(t)) || '—',
      ],
      ['مميزات خاصة', comparisonSpecials],
    ];
    const formatted = specificationText;
    const value = (text) =>
      Array.isArray(text)
        ? text.length
          ? text.map((t) => `<span class="comparison-fact">${formatted(t)}</span>`).join('')
          : '—'
        : formatted(text);
    return `${intro}${picker}<div class="comparison-scroll ${selected.length === 3 ? 'comparison-three' : ''}" role="region" aria-label="جدول مقارنة الأكواخ" tabindex="0"><table class="comparison-table resort-comparison-table"><caption class="sr-only">مقارنة مواصفات ${selected.map((u) => safe(u.name)).join(' و')}</caption><thead><tr><th scope="col">المواصفات</th>${selected.map((u) => `<th scope="col"><img src="${safe(u.images[0])}" alt=""><strong>${safe(u.name)}</strong></th>`).join('')}</tr></thead><tbody>${rows.map(([title, read]) => `<tr><th scope="row">${title}</th>${selected.map((u) => `<td>${value(read(u))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">التفاصيل</th>${selected.map((u) => `<td>${link(u.path, 'التفاصيل والصور', 'button outline')}</td>`).join('')}</tr></tbody></table></div>`;
  }

  function cabinNavigation(u) {
    const { icon, prefix, safe, unit, unitsFor } = context;

    const selected = history.state?.fdPreviewRoute?.cabinFilter,
      garden = u.id === 11;
    if (u.venue !== 'resort' || (garden && selected === 3)) return '';
    const selectedRooms = [1, 2].includes(selected) && (garden || u.rooms === selected) ? selected : 0;
    const cabins = unitsFor('resort').filter((c) => !selectedRooms || c.rooms === selectedRooms),
      steps = [...cabins, unit(11)],
      index = steps.findIndex((c) => c.id === u.id);
    if (index < 0) return '';
    const next = steps[index + 1];
    return `<nav class="cabin-switcher" aria-label="التنقل بين الأكواخ والحديقة المشتركة">${[
      [steps[index - 1], 'الكوخ السابق', 'right', 'prev'],
      [next, garden || next?.id === 11 ? 'التالي' : 'الكوخ التالي', 'left', 'next'],
    ]
      .map(([c, label, arrow, rel]) =>
        c
          ? `<a class="cabin-switch" href="${prefix(c.path)}" data-cabin-switch rel="${rel}">${icon(arrow)}<span><small>${label}</small><strong>${safe(c.name)}</strong></span></a>`
          : `<span class="cabin-switch unavailable" aria-disabled="true">${icon(arrow)}<span><small>${label}</small></span></span>`,
      )
      .join(
        '',
      )}<div class="cabin-browse-summary" role="status"><p>${garden ? 'الحديقة المشتركة' : `${index + 1} من ${cabins.length} + الحديقة المشتركة`}</p></div></nav>`;
  }

  return {
    resortHome,
    resortCard,
    gardenCard,
    resortCabins,
    resortServiceDirectory,
    bindServiceDirectory,
    restaurantGuide,
    diningGuide,
    resortServiceLink,
    serviceGuidePackage,
    coordinationHelp,
    resortServiceGuide,
    promotionList,
    promotionDisclosure,
    promotionAction,
    promotionSteps,
    promotionSocial,
    promotionGuide,
    comparisonSpecials,
    resortComparison,
    cabinNavigation,
  };
}

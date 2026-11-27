// Shared guide views: identical components across destinations.
export function createSharedViews(context) {
  function destinations() {
    const { catalog, icon, labels, prefix, safe, unit } = context;
    return `<div class="destination-picker all-destinations"><button type="button" class="icon-button destination-share" data-share="/" aria-label="مشاركة صفحة اختر وجهتك">${icon('share')}</button><div class="destination-intro"><div class="destination-brand"><img src="/site/brand/logo-original.png" alt="شعار يوم العائلة" width="400" height="400" fetchpriority="high"></div><p class="destination-promise entry-shimmer">خصوصية تليق بكم… وراحة تستحقونها</p><h1>اختر وجهتك</h1><p class="destination-description">تعرّف على تفاصيل كل وجهة واختر ما يناسبك</p></div>${[
      ['resort', '/imgs/panorama_2.webp', 'أكواخ خاصة · مسابح مستقلة · حديقة مشتركة'],
      ['stay', '/imgs/sec1_1.webp', 'قسمان مستقلان · مسابح كبيرة · تجمعات عائلية'],
      ['chalet', unit(30).images[0], 'شاليه من دورين · مسبح أطفال · مجلس مستقل'],
    ]
      .map(
        ([v, img, desc]) =>
          `<a class="destination-card" href="${prefix('/' + v + '/')}"><img src="${img}" alt="${labels[v]}" loading="eager"><span class="destination-card-copy"><span class="eyebrow">${safe(catalog.venues[v].location)}</span><strong>${labels[v]}</strong><span class="destination-features">${desc}</span></span>${icon('arrow')}</a>`,
      )
      .join('')}<p class="destination-preview-note">يوم العائلة</p></div>`;
  }

  function venueHome(stay) {
    const { icon, safe, unitsFor, venue } = context;

    const u = unitsFor()[0];
    const intro = stay
      ? ['قسمان مستقلان بمداخل ومرافق خاصة', 'ومساحات واسعة لجمعات الأهل والأصدقاء']
      : ['شاليه من دورين بمجلس مستقل بمدخل خاص', 'وغرفة ألعاب ومسبح أطفال بزحليقة مزدوجة'];
    const facts = stay
      ? [
          ['home', 'قسمان مستقلان'],
          ['users', `${u.guests} ضيفًا لكل قسم`],
          ['water', 'مسابح خاصة'],
        ]
      : [
          ['bed', 'غرفتا نوم'],
          ['users', `حتى ${u.guests} ضيفًا`],
          ['water', 'مسبح أطفال'],
        ];
    return `<div class="venue-overview resort-overview venue-guide-overview"><section class="resort-intro"><h1>دليلكم ل${safe(venue().name)}</h1><p><span>${intro[0]}</span><br><span>${intro[1]}</span></p></section><section class="hero"><img src="${safe(u.images[0])}" alt="${safe(venue().name)}" fetchpriority="high"><div class="hero-content"><span class="eyebrow">${icon('pin')}${safe(venue().location)}</span><p>خصوصية تليق بكم وراحة تستحقونها</p></div></section><div class="facts-strip">${facts.map(([i, t]) => `<div>${icon(i)}<span>${safe(t)}</span></div>`).join('')}</div>${stay ? '<div class="venue-footnotes"><p>يمكن حجز قسم واحد أو القسمين معًا</p><p>يمكن استقبال حتى 70 ضيفًا لكل قسم برسوم إضافية</p></div>' : '<p class="venue-footnote">يمكن استقبال حتى 25 ضيفًا برسوم إضافية</p>'}</div>`;
  }

  function venueContact() {
    const { catalog, guideCopy, icon, labels, link, out, route, safe, venue } = context;

    const v = venue(),
      links = guideCopy.venueContacts?.[route.venue] || catalog.source.resortContact;
    return `<section class="resort-contact-panel resort-contact-expanded resort-contact-reordered">
  <div class="page-heading"><h1>الموقع والتواصل</h1></div>
  ${out(v.map, icon('pin') + '<span>موقع ' + safe(labels[route.venue]) + '<small>' + safe(v.location) + '</small></span>' + icon('arrow'), 'quick-link resort-location-link')}
  <div class="resort-booking-group">
   ${out(links.booking, 'احجز عبر الموقع ' + icon('arrow'), 'button primary wide resort-booking-link')}
   <div class="resort-apps" role="group" aria-label="تحميل تطبيق يوم العائلة">${out(links.iphone, icon('apple', 'solid-icon') + '<span><strong>تطبيق iPhone</strong><small>App Store</small></span>', 'resort-app-link')}${out(links.android, icon('android') + '<span><strong>تطبيق Android</strong><small>Google Play</small></span>', 'resort-app-link')}</div>
  </div>
  ${
    route.venue === 'resort'
      ? `<nav class="resort-contact-shortcuts" aria-label="روابط تهمك">${link('/services/loyalty/', `${icon('star')}<span>بطاقة الولاء</span>`, 'explore-link resort-loyalty-link')}
  ${link('/resort/faq/', `${icon('info')}<span>الأسئلة الشائعة</span>`, 'explore-link resort-information-faq')}</nav>`
      : link(
          '/' + route.venue + '/faq/',
          `<span>${icon('info')}الأسئلة الشائعة</span>${icon('arrow')}`,
          'explore-link resort-information-faq',
        )
  }
  <section class="resort-contact-help" aria-labelledby="resort-contact-help-title"><h2 id="resort-contact-help-title">نحن بخدمتك</h2><p>تواصل معنا لأي استفسار أو مساعدة</p><div class="resort-contact-actions">${out('https://wa.me/' + v.phone.replace(/\D/g, ''), icon('whatsapp') + 'تواصل عبر واتساب', 'button outline')}<a class="button outline" href="tel:${safe(v.phone)}">${icon('phone')}اتصال هاتفي</a></div></section>
  <footer class="resort-contact-footer"><div class="resort-review-row"><p>زرتنا؟ شاركنا تقييمك</p>${out(links.review, icon('star') + 'قيّم تجربتك', 'resort-rating-link')}</div><section class="resort-contact-social"><h2 class="sr-only">تابعنا</h2><nav class="social-links" aria-label="حسابات ${safe(v.name)}">${v.social
    .map((url) => {
      const instagram = url.includes('instagram');
      return out(
        url,
        icon(instagram ? 'instagram' : 'snapchat') +
          '<span class="sr-only">' +
          (instagram ? 'إنستقرام' : 'سناب شات') +
          '</span>',
        'resort-social-icon' + (instagram ? '' : ' social-snapchat'),
      );
    })
    .join('')}</nav></section></footer>
 </section>`;
  }

  function gallery(u) {
    const { icon, photoIndex, safe } = context;
    return `<div class="gallery"><button class="gallery-photo" data-lightbox-unit="${u.id}" aria-label="تكبير الصورة"><img id="gallery-image" src="${safe(u.images[photoIndex])}" alt="${safe(u.labels[photoIndex] || u.name)}" fetchpriority="high"></button><button class="gallery-control previous" data-photo="-1" aria-label="الصورة السابقة">${icon('right')}</button><button class="gallery-control next" data-photo="1" aria-label="الصورة التالية">${icon('left')}</button><div class="gallery-caption"><span id="gallery-label">${safe(u.labels[photoIndex] || u.name)}</span><span class="count" id="gallery-count">${photoIndex + 1} / ${u.images.length}</span></div></div><div class="thumbnails">${u.images.map((src, i) => `<button data-thumbnail="${i}" aria-label="${safe(u.labels[i] || 'الصورة ' + (i + 1))}" aria-pressed="${photoIndex === i}"><img src="${safe(src)}" alt="" loading="lazy"></button>`).join('')}</div>`;
  }

  function specificationIcon(title) {
    return /^داخل/.test(title)
      ? 'home'
      : /المجلس/.test(title)
        ? 'sofa'
        : /الخارجية|المسبح/.test(title)
          ? 'water'
          : /المطبخ/.test(title)
            ? 'coffee'
            : /معلومات/.test(title)
              ? 'clock'
              : 'spark';
  }

  function unitSpecifications(u) {
    const { icon, safe, specificationText } = context;

    const boxes = (items, amenities = false) =>
      `<div class="spec-list">${items.map((t) => `<div class="spec-item ${t.length > 52 || (amenities && /سماعات|غرفة سائق/.test(t)) ? 'wide' : ''}">${specificationText(t)}</div>`).join('')}</div>`;
    return `<div class="specs">${u.sections
      .map((s) => {
        const resort = ['resort', 'chalet', 'stay'].includes(u.venue),
          stack =
            resort && /^(داخل الكوخ|داخل الشاليه|داخل القسم|المجلس المستقل|المنطقة الخارجية)/.test(s.title),
          amenities = resort && s.title === 'مميزات الإقامة',
          compact = resort && (stack || amenities || s.title === 'تجهيزات المطبخ');
        const groups = s.groups || [],
          grouped = new Set(groups.flatMap((g) => g.items));
        const items = groups.length
          ? groups
              .map((g) => `<section class="spec-floor"><h3>${safe(g.title)}</h3>${boxes(g.items)}</section>`)
              .join('') + boxes(s.items.filter((t) => !grouped.has(t)))
          : boxes(s.items, amenities);
        const notes =
          u.venue === 'resort'
            ? s.notes
            : s.notes.flatMap((n) =>
                n
                  .split(/(?=يُرجى إشراف)/)
                  .map((t) => t.trim())
                  .filter(Boolean),
              );
        return `<details class="spec${compact ? ' spec-compact' : ''}${stack ? ' spec-stacked' : ''}"><summary>${icon(specificationIcon(s.title))}${safe(s.title)}${icon('down', 'chevron')}</summary><div class="spec-content">${items}${s.times.length ? `<div class="spec-list">${s.times.map((t) => `<div class="spec-item"><small>${safe(t.label)}</small><br><strong>${safe(t.value)}</strong></div>`).join('')}</div>` : ''}${notes.map((n) => `<p class="note">${safe(n)}</p>`).join('')}</div></details>`;
      })
      .join(
        '',
      )}${u.extras.map((e) => `<aside class="extra-note"><h3>${safe(e.title)}</h3><p>${safe(e.text)}</p></aside>`).join('')}</div>`;
  }

  function detail() {
    const {
      cabinNavigation,
      currentUnit,
      explorationTitle,
      guests,
      icon,
      link,
      paragraphs,
      rooms,
      safe,
      stayNavigation,
      venue,
    } = context;

    const u = currentUnit(),
      garden = u.id === 11,
      v = u.venue;
    return `<div class="detail-layout"><section class="detail-gallery" aria-label="صور الإقامة">${gallery(u)}</section><section class="detail-copy">${v === 'chalet' ? '' : `<span class="eyebrow">${safe(venue().name)}</span>`}<h1>${safe(u.name)} ${garden ? '' : `<span class="suitability-inline">(${safe(u.suitable)})</span>`}</h1><div class="description">${paragraphs(u.description)}</div>${
      garden
        ? `<div class="fact-boxes two-facts"><div class="fact-box">${icon('pin')}<small>الموقع</small><strong>وسط الأكواخ</strong></div><div class="fact-box">${icon('users')}<small>الاستخدام</small><strong>لجميع الضيوف</strong></div></div><h2 class="content-heading" id="garden-facilities-title">مرافق الحديقة</h2><ul class="spec-list garden-facilities" aria-labelledby="garden-facilities-title">${u.gardenFeatures.map((t) => `<li class="spec-item">${safe(t)}</li>`).join('')}</ul><button class="explore-link" data-virtual="${safe(u.tour)}"><span>${icon('map')}جولة ثلاثية الأبعاد للحديقة</span>${icon('arrow')}</button>`
        : `<div class="fact-boxes">${[
            ['users', 'سعة الضيوف', guests(u.guests)],
            ['bed', 'غرف النوم', rooms(u.rooms)],
            [
              'bath',
              'الحمامات',
              u.bathrooms === 1 ? 'حمام واحد' : u.bathrooms === 2 ? 'حمامان' : u.bathrooms + ' حمامات',
            ],
          ]
            .map(
              ([i, t, a]) => `<div class="fact-box">${icon(i)}<small>${t}</small><strong>${a}</strong></div>`,
            )
            .join(
              '',
            )}</div>${u.tour ? link(u.tour, `<span>${icon('map')}${safe(explorationTitle(u))}</span>${icon('arrow')}`, 'explore-link cabin-explore-primary') : ''}${unitSpecifications(u)}`
    }<div class="detail-actions"></div>${v === 'resort' ? cabinNavigation(u) : v === 'stay' ? stayNavigation(u) : ''}</section></div>`;
  }

  function faqSearchText(text) {
    const { digit, roomWording } = context;
    return digit(roomWording(text))
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .toLowerCase()
      .trim();
  }

  function faqGuide() {
    const { guideCopy, heading, icon, link, route, safe, venue } = context;
    const groups = guideCopy.faqs[route.venue].groups,
      source = new Map(venue().faqs.map((q) => [q.question, q]));
    return `<section class="faq-guide" data-faq-group="${safe(groups[0].id)}">${heading('الأسئلة الشائعة')}<div class="faq-tools"><nav class="faq-categories" aria-label="أقسام الأسئلة الشائعة">${groups.map((g, i) => `<button type="button" data-faq-group="${safe(g.id)}" aria-controls="faq-group-${safe(g.id)}" aria-pressed="${i === 0}">${safe(g.label)}</button>`).join('')}</nav><label class="search-field">${icon('search')}<input type="search" id="faq-search" placeholder="ابحث في كل الأسئلة" aria-label="ابحث في كل الأسئلة" autocomplete="off"></label><div class="faq-search-feedback" hidden><p id="faq-results" role="status" aria-live="polite"></p><button type="button" id="faq-clear" class="text-link">مسح البحث</button></div></div><div class="faq-groups">${groups
      .map(
        (g, i) =>
          `<section class="faq-group" id="faq-group-${safe(g.id)}" aria-labelledby="faq-heading-${safe(g.id)}" ${i ? 'hidden' : ''}><h2 id="faq-heading-${safe(g.id)}">${safe(g.title)}</h2><div class="faq-list">${g.items
            .map((item) => {
              const originals = item.sources.map((q) => source.get(q)),
                answers = (item.answers || originals.map((q) => q.answer)).map((a) =>
                  a.replace('على الرقم ،', 'على الرقم ' + venue().phone.replace(/^\+966/, '0') + '،'),
                ),
                question = item.question || originals[0].question,
                index = [question, ...item.sources, ...originals.map((q) => q.answer), ...answers].join(' ');
              return `<details class="faq" id="faq-${safe(item.id)}" data-question="${safe(index)}"><summary>${safe(question)}${icon('down')}</summary><div class="faq-answer">${answers.map((a) => `<p>${safe(a)}</p>`).join('')}${item.links ? `<div class="faq-answer-links">${item.links.map((a) => link(a.path, safe(a.text), 'text-link')).join('')}</div>` : ''}</div></details>`;
            })
            .join('')}</div></section>`,
      )
      .join(
        '',
      )}</div><p id="faq-empty" class="empty" hidden>ما لقينا سؤالًا مطابقًا. جرّب كلمة ثانية.</p></section>`;
  }

  function bindFaqGuide() {
    const { $, activeEntryId, navViews } = context;
    const root = $('.faq-guide'),
      input = $('#faq-search', root),
      buttons = [...root.querySelectorAll('button[data-faq-group]')],
      groups = [...root.querySelectorAll('.faq-group')],
      questions = [...root.querySelectorAll('.faq')],
      feedback = $('.faq-search-feedback', root),
      snap = navViews[activeEntryId]?.faq;
    let active = buttons.some((b) => b.dataset.faqGroup === snap?.group)
      ? snap.group
      : buttons[0].dataset.faqGroup;
    const update = () => {
      const query = faqSearchText(input.value),
        words = query.split(/\s+/).filter(Boolean);
      let count = 0;
      root.dataset.faqGroup = active;
      root.classList.toggle('is-searching', !!query);
      questions.forEach((q) => {
        q.hidden = !!query && !words.every((word) => faqSearchText(q.dataset.question).includes(word));
        if (!q.hidden) count++;
      });
      groups.forEach((group) => {
        group.hidden = query
          ? !group.querySelector('.faq:not([hidden])')
          : group.id !== 'faq-group-' + active;
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(!query && b.dataset.faqGroup === active)));
      feedback.hidden = !query;
      $('#faq-results', root).textContent = query ? `${count} نتيجة في كل الأقسام` : '';
      $('#faq-empty', root).hidden = !query || count > 0;
    };
    input.value = snap?.query || '';
    update();
    if (snap?.open) {
      const q = document.getElementById(snap.open);
      if (q?.matches('.faq') && !q.hidden && !q.closest('.faq-group').hidden) q.open = true;
    }
    input.addEventListener('input', () => {
      questions.forEach((q) => (q.open = false));
      update();
    });
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        active = b.dataset.faqGroup;
        input.value = '';
        questions.forEach((q) => (q.open = false));
        update();
      }),
    );
    $('#faq-clear', root).addEventListener('click', () => {
      input.value = '';
      update();
      input.focus({ preventScroll: true });
    });
    root.addEventListener(
      'toggle',
      (e) => {
        if (e.target.matches('.faq[open]'))
          questions.forEach((q) => {
            if (q !== e.target) q.open = false;
          });
      },
      true,
    );
  }

  function packagePhotos(p, { zoom = true } = {}) {
    const { displayServiceImage, guideCopy, reviewedGuide, safe } = context;
    return p.images?.length
      ? `<div class="package-gallery">${p.images
          .map((src, i) => {
            const size = guideCopy.serviceImageSizes?.[src.split('?')[0]] || p.dimensions,
              resort = reviewedGuide(),
              eager = resort && i === 0;
            return `${zoom ? `<button type="button" class="package-image" data-package-photo="${safe(src)}" aria-label="تكبير صورة ${safe(p.name)} ${i + 1}">` : '<div class="package-image package-image-static">'}<img src="${safe(resort ? displayServiceImage(src) : src)}" alt="${safe(p.name)} ${i + 1}" ${size ? `width="${size[0]}" height="${size[1]}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''}>${zoom ? '</button>' : '</div>'}`;
          })
          .join('')}</div>`
      : '';
  }

  function guideNotes(notes) {
    const { safe } = context;
    return notes?.length
      ? `<aside class="service-guide-notes">${notes.map((n) => `<p>${safe(n)}</p>`).join('')}</aside>`
      : '';
  }

  function servicePhoto(s, caption = '', { zoom = true } = {}) {
    const { displayServiceImage, guideCopy, safe } = context;
    const size = s.image && guideCopy.serviceImageSizes?.[s.image.split('?')[0]],
      photo = zoom
        ? packagePhotos({ name: s.name, images: s.image ? [s.image] : [] })
        : s.image
          ? `<img class="service-static-photo" src="${safe(displayServiceImage(s.image))}" alt="${safe(s.name)}" ${size ? `width="${size[0]}" height="${size[1]}"` : ''} loading="eager" decoding="async">`
          : '';
    return `<figure class="service-main-photo">${photo}${caption ? `<figcaption>${safe(caption)}</figcaption>` : ''}</figure>`;
  }

  function guideContents(items, title = 'محتويات الخدمة') {
    const { icon, safe, ul } = context;
    return `<details class="package service-guide-details"><summary><span>${safe(title)}</span>${icon('down')}</summary><div class="package-body">${ul(items)}</div></details>`;
  }

  return {
    destinations,
    venueHome,
    venueContact,
    gallery,
    specificationIcon,
    unitSpecifications,
    detail,
    faqSearchText,
    faqGuide,
    bindFaqGuide,
    packagePhotos,
    guideNotes,
    servicePhoto,
    guideContents,
  };
}

// stay destination: approved views, separate from shared navigation and requests.
export function createStayViews(context) {
  function stayHome() {
    const { venueHome } = context;
    return venueHome(true);
  }

  function stayCard(u) {
    const { guests, icon, link, prefix, rooms, safe } = context;

    const outdoor = u.sections.find((s) => /^المنطقة الخارجية/.test(s.title));
    const feature = outdoor?.items.some((t) => /مسبح خاص للأطفال/.test(t))
      ? 'مسبح للكبار والأطفال'
      : outdoor?.items.find((t) => /ملعب كرة طائرة/.test(t)) || '';
    return `<article class="unit-card resort-unit-card stay-unit-card" data-unit-id="${u.id}"><a class="card-photo" href="${prefix(u.path)}" aria-label="التفاصيل والصور — ${safe(u.name)}"><img src="${safe(u.images[0])}" alt="${safe(u.name)}" loading="lazy"></a><div class="card-copy"><div class="card-title-row stay-card-title"><h3>${safe(u.name.split('–')[0].trim())}<small class="stay-card-floor">${safe(u.name.split('–')[1]?.trim() || '')}</small></h3><span class="card-audience">${safe(u.suitable)}</span></div><div class="card-facts"><span>${icon('users')}${guests(u.guests)}</span><span>${icon('bed')}${rooms(u.rooms)}</span></div>${feature ? `<p class="stay-card-feature">${safe(feature)}</p>` : ''}<div class="card-actions stay-card-actions">${link(u.path, 'التفاصيل والصور', 'button primary card-details')}</div></div></article>`;
  }

  function staySections() {
    const { icon, link, unitsFor } = context;

    const us = unitsFor('stay');
    return `<section class="resort-catalog-panel stay-catalog-panel"><div class="catalog-heading"><h1>اختاروا القسم المناسب لكم</h1>${link('/stay/compare/', 'مقارنة القسمين', 'text-link')}</div><div class="units-grid stay-grid resort-cabin-cards">${us.map(stayCard).join('')}</div><div class="carousel-tools"><button class="icon-button" data-carousel="-1" aria-label="القسم السابق">${icon('right')}</button><span id="carousel-count">1 / ${us.length}</span><button class="icon-button" data-carousel="1" aria-label="القسم التالي">${icon('left')}</button></div></section>`;
  }

  function stayServiceGuide() {
    const { guideCopy, heading, icon, money, out, packagePhotos, safe } = context;
    const service = guideCopy.stayService;
    return `<section class="service-guide stay-slide-guide">${heading('خدمات الاستراحة')}<div class="stay-service-intro"><h2>${safe(service.name)}</h2><p>${safe(service.pageIntro || service.description)}</p></div>${packagePhotos({ name: service.name, images: [service.image], dimensions: service.dimensions }, { zoom: false })}<div class="fact-boxes two-facts"><div class="fact-box">${icon('pin')}<small>المكان</small><strong>${safe(service.location)}</strong></div><div class="fact-box">${icon('info')}<small>سعر اللعبة</small><strong>${money(service.price)}</strong></div></div><a class="button primary wide service-guide-link" data-service-portal data-resort-service="slide" href="/stay/guest-services/#slide">${safe(service.orderLabel)} ${icon('arrow')}</a><section class="stay-service-help"><h2>تحتاج مساعدة؟</h2><p>تواصل معنا للاستفسار عن اللعبة وتجهيزها لكم</p><div class="stay-service-help-actions">${out('https://wa.me/966556156693', 'واتساب', 'button outline')}<a class="button outline" href="tel:+966556156693">اتصال</a></div></section></section>`;
  }

  function stayNavigation(u) {
    const { icon, prefix, safe, unitsFor } = context;

    const us = unitsFor('stay'),
      index = us.findIndex((c) => c.id === u.id);
    if (index < 0) return '';
    return `<nav class="cabin-switcher stay-switcher" aria-label="التنقل بين قسمي الاستراحة">${[
      [us[index - 1], 'القسم السابق', 'right', 'prev'],
      [us[index + 1], 'القسم التالي', 'left', 'next'],
    ]
      .map(([next, label, arrow, rel]) =>
        next
          ? `<a class="cabin-switch" href="${prefix(next.path)}" data-cabin-switch rel="${rel}">${icon(arrow)}<span><small>${label}</small><strong>${safe(next.name)}</strong></span></a>`
          : `<span class="cabin-switch unavailable" aria-disabled="true">${icon(arrow)}<span><small>${label}</small></span></span>`,
      )
      .join('')}<div class="cabin-browse-summary"><p>القسم ${index + 1} من ${us.length}</p></div></nav>`;
  }

  function stayComparison() {
    const { heading, link, rooms, specificationText, unitsFor } = context;

    const us = unitsFor('stay'),
      section = (u, pattern) => u.sections.find((s) => pattern.test(s.title))?.items || [];
    const rows = [
      ['الدور', (u) => (u.id === 20 ? 'أرضي' : 'علوي')],
      ['سعة الضيوف', (u) => `${u.guests} ضيفًا، وحتى 70 برسوم إضافية`],
      ['غرف النوم', (u) => rooms(u.rooms)],
      ['الأسرّة', (u) => (u.rooms === 2 ? 'مزدوج + مفردان' : '3 أسرّة')],
      ['الحمامات', (u) => u.bathrooms + ' حمامات'],
      ['مجلس كبير', (u) => (section(u, /^داخل/).some((t) => /مجلس/.test(t)) ? 'متوفر' : 'غير متوفر')],
      [
        'مسبح الكبار',
        (u) => (section(u, /الخارجية/).some((t) => /مسبح خاص للكبار/.test(t)) ? 'متوفر' : 'غير متوفر'),
      ],
      [
        'مسبح الأطفال',
        (u) => (section(u, /الخارجية/).some((t) => /مسبح خاص للأطفال/.test(t)) ? 'متوفر' : 'غير متوفر'),
      ],
      [
        'ملعب كرة طائرة',
        (u) => (section(u, /الخارجية/).some((t) => /ملعب كرة طائرة/.test(t)) ? 'متوفر' : 'غير متوفر'),
      ],
      ['الزحليقة الهوائية الكبيرة', (u) => (u.raw.slide ? 'متاحة برسوم إضافية' : 'غير متاحة')],
    ];
    const formatted = specificationText;
    const value = (text) =>
      Array.isArray(text)
        ? text.length
          ? text.map((t) => `<span class="comparison-fact">${formatted(t)}</span>`).join('')
          : '—'
        : formatted(text);
    return `<div class="stay-comparison">${heading('مقارنة قسمي الاستراحة')}<p class="note">قسمان مستقلان ولكل قسم مدخله ومرافقه الخاصة</p><div class="comparison-scroll" role="region" aria-label="مقارنة مواصفات قسمي الاستراحة" tabindex="0"><table class="comparison-table resort-comparison-table"><caption class="sr-only">مقارنة القسم الأول في الدور الأرضي والقسم الثاني في الدور العلوي</caption><thead><tr><th scope="col">المواصفات</th>${us.map((u) => `<th scope="col"><strong>${u.id === 20 ? 'القسم الأول' : 'القسم الثاني'}</strong></th>`).join('')}</tr></thead><tbody>${rows.map(([title, read]) => `<tr><th scope="row">${title}</th>${us.map((u) => `<td>${value(read(u))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">التفاصيل</th>${us.map((u) => `<td>${link(u.path, 'التفاصيل والصور', 'button outline')}</td>`).join('')}</tr></tbody></table></div></div>`;
  }

  return { stayHome, stayCard, staySections, stayServiceGuide, stayNavigation, stayComparison };
}

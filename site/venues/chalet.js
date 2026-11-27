// chalet destination: approved views, separate from shared navigation and requests.
export function createChaletViews(context) {
  function chaletHome() {
    const { venueHome } = context;
    return venueHome(false);
  }

  function chaletServices() {
    const { catalog, heading, safe, venue } = context;
    const ss = catalog.services.filter((s) => venue().services.includes(s.id)),
      groups = [...new Set(ss.map((s) => s.group))];
    return (
      heading('خدمات الشاليه') +
      groups
        .map(
          (g) =>
            `<section class="service-group"><h2>${safe(g)}</h2><div class="services-list">${ss
              .filter((s) => s.group === g)
              .map(chaletServiceCard)
              .join('')}</div></section>`,
        )
        .join('')
    );
  }

  function chaletServiceCard(s) {
    const { guideCopy, icon, link, safe, servicePath } = context;
    return link(
      servicePath(s),
      `<div><h3>${safe(s.name)}</h3><p>${safe(guideCopy.chaletServiceCopy[s.id].cardIntro)}</p></div>${icon('arrow')}`,
      'service-card',
    );
  }

  function chaletServiceGuide(s) {
    const { catalog, guideContents, guideCopy, guideNotes, heading, icon, safe, servicePhoto } = context;

    const source = catalog.source.guestCatalog[s.id];
    let body = '';
    if (s.id === 'games') {
      const p = s.packages[0];
      body = `${servicePhoto(s, '', { zoom: false })}<div class="service-guide-prices"><article><h2>${safe(p.name)}</h2><strong>${safe(p.price)}</strong><p>${safe(p.note)}</p></article></div>${guideContents(s.items, 'الألعاب المشمولة في الباقة')}${guideNotes(source.notes)}`;
    }
    if (s.id === 'water')
      body = `<div class="price-highlight">${safe(s.offer)}</div><p class="service-guide-explanation">وزّع الألعاب بين الكبار والأطفال</p>${guideNotes(source.notes)}`;
    return `<section class="service-guide">${heading(s.name, s.intro)}${body}<a class="button primary wide service-guide-link" data-service-portal href="https://familydaystay.com/chalet/guest-services/#${safe(s.id)}">${safe(guideCopy.chaletServiceCopy[s.id].orderLabel)} ${icon('arrow')}</a></section>`;
  }

  return { chaletHome, chaletServices, chaletServiceCard, chaletServiceGuide };
}

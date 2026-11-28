import { createResortViews } from './venues/resort.js?v=20261128-venue-headings-v141';
import { createChaletViews } from './venues/chalet.js?v=20261128-venue-headings-v141';
import { createStayViews } from './venues/stay.js?v=20261128-venue-headings-v141';
import { createSharedViews } from './shared/views.js?v=20261128-venue-headings-v141';
// Published guide. Original page URLs are preserved; ordering documents remain independent.
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  bed: '<path d="M3 18v3m18-3v3M3 18h18v-6H3Zm1-6V5h16v7M7 8h3m4 0h3"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-16a3 3 0 0 1 0 6m3 10v-3a7 7 0 0 0-3-6"/>',
  water: '<path d="M3 20q3-4 6 0t6 0 6 0M6 15V5a2 2 0 0 1 4 0m4 10V5a2 2 0 0 1 4 0M6 9h8m-8 4h8"/>',
  volleyball: '<circle cx="12" cy="12" r="10"/><path d="M12 2c-3 3-4 7-2 10m10.66-5c-4-1.1-8 .1-10.66 5m10.66 5c-1-4-4-7-10.66-5M12 22c3-3 4-7 2-10M3.34 17c4 1.1 8-.1 10.66-5M3.34 7c1 4 4 7 10.66 5"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  arrow: '<path d="m14 5-7 7 7 7M7 12h14"/>',
  right: '<path d="m10 5 7 7-7 7"/>',
  left: '<path d="m14 5-7 7 7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  share: '<path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  services: '<path d="M3 11h18M5 11V8a7 7 0 0 1 14 0v3M3 16h18M6 20h12M12 2V1"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  utensils: '<path d="M4 2v7q3 4 6 0V2M7 2v20M19 22V2q-7 5-3 11h3"/>',
  dining: '<path d="M2 10h20M4 10V5h16v5M5 10v11m14-11v11M2 16h20"/>',
  games: '<rect x="2" y="6" width="20" height="13" rx="5"/><path d="M7 10v5m-2-2.5h4m7-1.5v.1m3 3v.1"/>',
  cinema: '<rect x="3" y="3" width="18" height="13" rx="1"/><path d="m10 7 5 3-5 3Zm2 9v6m-4 0h8"/>',
  coffee: '<path d="M4 8h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 9h2a3 3 0 0 1 0 6h-2M7 2v3m6-3v3"/>',
  flower: '<path d="M12 22V12m0 6q-7 0-7-5 7 0 7 5m0-3q7 0 7-5-7 0-7 5"/><circle cx="12" cy="7" r="4"/>',
  sofa: '<path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 11h3v6h12v-6h3v10H3Zm3 10v2m12-2v2"/>',
  video: '<rect x="2" y="4" width="15" height="16" rx="3"/><path d="m17 9 5-3v12l-5-3"/>',
  gift: '<rect x="3" y="8" width="18" height="5"/><path d="M5 13v9h14v-9M12 8v14m0-14C0 8 6-4 12 8Zm0 0c12 0 6-12 0 0Z"/>',
  card: '<rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20M6 15h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  phone: '<path d="m7 2 3 5-3 3q2 5 7 7l3-3 5 3-2 5C8 23 1 16 2 4Z"/>',
  bath: '<path d="M2 13h20l-2 6H4Zm3 6v3m14-3v3M5 13V5a3 3 0 0 1 6 0H8"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
};
paths.faq =
  '<path d="M21 11a8 8 0 0 1-8 8H7l-5 3V10a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8Z"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.1"/>';
paths.search = '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>';
paths.whatsapp =
  '<path d="M21 11.5a9 9 0 0 1-13.5 7.8L3 21l1.6-4.6A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 3l1-1 3 2c-1 3-5 1-7-1S6 9 8 7Z"/>';
paths.star = '<path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3.2 9.6l6-.9L12 3Z"/>';
paths.android = '<path d="m7 7-2-3m12 3 2-3M4 14a8 8 0 0 1 16 0v5H4Z"/><path d="M8 12v1m8-1v1"/>';
paths.apple =
  '<path d="M16.7 3.4c.8-1 1.2-2.2 1.1-3.4-1.2.1-2.6.8-3.4 1.7-.7.8-1.3 2.1-1.1 3.3 1.3.1 2.6-.6 3.4-1.6ZM20.7 17.1c-.5 1.2-.8 1.7-1.5 2.8-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.7.9c-1.6 0-2.8-1.5-3.8-2.9C1.5 16.2.8 10.8 2.6 8c1.3-2 3.4-3.2 5.4-3.2 1.6 0 2.6.9 3.8.9s2-.9 3.8-.9c1.7 0 3.5 1 4.8 2.5-4.2 2.3-3.5 8.2.3 9.8Z"/>';
paths.instagram =
  '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>';
paths.snapchat =
  '<path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>';
const icon = (n, cl = '') =>
  `<svg class="icon ${cl}" viewBox="0 0 24 24" aria-hidden="true">${paths[n] || paths.spark}</svg>`;
const ROOT = '/',
  ASSETS = '/site/',
  VERSION = '20261128-venue-headings-v141';
import '../js/specification-measurements.js?v=20261128-venue-headings-v141';
import '../js/order-visit.js?v=20261128-venue-headings-v141';
const main = $('#main'),
  viewer = $('#viewer');
let resortOrders = null,
  restaurantInline = null;
const ORDER_STORAGE_KEYS = [
  'familyday.resort-direct-identity.v1',
  'familyday.guest-orders.v2',
  'familyday.arrangements-orders.v1',
  'familyday.chalet-guest-orders.v1',
  'familyday.guest-extras.v1',
  'familyday.menu-cart.v1',
];
function discardStoredOrders() {
  for (const name of ['localStorage', 'sessionStorage'])
    try {
      for (const key of ORDER_STORAGE_KEYS) window[name].removeItem(key);
    } catch (_) {}
}
function resetOrderDetails() {
  discardStoredOrders();
  restaurantInline?.reset();
  resortOrders?.reset();
}
discardStoredOrders();
let ordersBackgrounded = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) ordersBackgrounded = true;
  else if (ordersBackgrounded) {
    ordersBackgrounded = false;
    resetOrderDetails();
  }
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) requestAnimationFrame(resetOrderDetails);
});
window.addEventListener('pagehide', resetOrderDetails);

let catalog,
  shareMetadata = {},
  guideCopy = {},
  runtimeConfig = {},
  route,
  photoIndex = 0,
  filter = 0,
  modalPhotos = null,
  returnFocus = null,
  toastTimer,
  compare = new Set();
const stableViews = new Map();
const scrollPositions = new Map();
let previousURL = location.href;
const labels = { resort: 'المنتجع', stay: 'الاستراحة', chalet: 'الشاليه' };
const prefix = (path) => (path.startsWith(ROOT) ? path : ROOT + String(path).replace(/^\//, ''));
const money = (n) => `${n} ريال`;
const digit = (s) => String(s ?? '').replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
const roomWording = (s) =>
  (guideCopy.roomWording || [])
    .reduce((text, [from, to]) => text.replaceAll(from, to), String(s ?? ''))
    .replace(/ +؛/g, '؛');
const safe = (s) => esc(digit(roomWording(s)));
const unit = (id) => catalog.units.find((u) => u.id === Number(id));
const currentUnit = () => catalog.units.find((u) => u.path === route.path);
const explorationTitle = (u) =>
  'استكشف مرافق ' +
  (u?.venue === 'chalet' ? 'الشاليه' : (u?.name || 'الكوخ').replace(/\s+[12]$/, '')) +
  ' من الداخل';
const explorationUnit = () =>
  catalog.units.find(
    (u) =>
      u.tour &&
      u.id !== 11 &&
      new URL(u.tour, 'https://familydaystay.com').pathname === route.path &&
      (route.params.get('cabin') ? u.id === Number(route.params.get('cabin')) : true),
  );
const venue = () => catalog.venues[route.venue];
const unitsFor = (v = route.venue) => catalog.units.filter((u) => u.venue === v && u.id !== 11);
const serviceBy = (id) => catalog.services.find((s) => s.id === id);
const servicesPath = (v = route.venue) =>
  v === 'chalet' ? '/chalet/services/' : v === 'stay' ? '/stay/services/' : '/services/';
const servicePath = (s, v = route.venue) =>
  v === 'chalet' ? `/chalet/services/${s.id === 'water' ? 'water-games' : 'games'}/` : s.path;
const listPath = (v = route.venue) =>
  v === 'resort' ? '/cabins/' : v === 'stay' ? '/stay/sections/' : '/chalet/details/';
const link = (p, label, cl = 'button outline') => `<a class="${cl}" href="${safe(prefix(p))}">${label}</a>`;
const out = (p, label, cl = 'button outline') =>
  `<a class="${cl}" href="${safe(p)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const reviewedGuide = () => ['resort', 'chalet', 'stay'].includes(route?.venue);
const ul = (items) =>
  items?.length
    ? `<ul class="inclusions">${items.map((t) => `<li${reviewedGuide() && String(t).length > 40 ? ' class="inclusion-wide"' : ''}>${reviewedGuide() ? '' : icon('check')}<span>${safe(t)}</span></li>`).join('')}</ul>`
    : '';
const paragraphs = (text) =>
  String(text || '')
    .split('\n')
    .filter(Boolean)
    .map((t) => `<p>${specificationText(t)}</p>`)
    .join('');
const guests = (n) => (n === 2 ? 'حتى ضيفين' : `حتى ${n} ${n >= 3 && n <= 10 ? 'ضيوف' : 'ضيفًا'}`);
// Shared Arabic measurement presentation, including illustrated maps.
const specificationText = (text) => window.FD_MEASUREMENTS.formatEscaped(safe(text));
const rooms = (n) => (n === 1 ? 'غرفة واحدة' : n === 2 ? 'غرفتان' : `${n} غرف`);
const heading = (title, description = '') =>
  `<div class="page-heading">${['chalet', 'stay'].includes(route.venue) || ['services', 'guest', 'guide'].includes(route.type) ? '' : `<span class="eyebrow">${icon('pin')}${safe(venue().location)}</span>`}<h1>${safe(title)}</h1>${description ? `<p>${safe(description)}</p>` : ''}</div>`;
function toast(t) {
  $('#toast').textContent = t;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2500);
}
async function copyShareLink(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (_) {}
  const focus = document.activeElement,
    buffer = document.createElement('textarea');
  buffer.value = value;
  buffer.readOnly = true;
  buffer.style.cssText = 'position:fixed;inset:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.append(buffer);
  buffer.focus({ preventScroll: true });
  buffer.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (_) {}
  buffer.remove();
  if (focus?.isConnected) focus.focus({ preventScroll: true });
  return copied;
}
async function share(path, title) {
  const shareURL = new URL(prefix(path), location.origin);
  ['from', 'return', 'v', 'layout', 'share'].forEach((k) => shareURL.searchParams.delete(k));
  const target = shareURL.href,
    shareTitle =
      shareMetadata[shareURL.pathname.slice(ROOT.length - 1)]?.title || title.replace(/\s*\|\s*معاينة$/, '');
  if (navigator.share) {
    try {
      await navigator.share(reviewedGuide() ? { text: target } : { title: shareTitle, url: target });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  toast((await copyShareLink(target)) ? 'تم نسخ الرابط' : 'تعذر النسخ؛ يمكنك نسخ الرابط من شريط العنوان');
}
const NAV_KEY = 'familyday.live.navigation.v6';
let activeEntryId = null,
  navViews = {};
try {
  const saved = JSON.parse(sessionStorage.getItem(NAV_KEY) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) navViews = saved;
} catch (_) {}
const newEntryId = () =>
  globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
function ownURL(value) {
  try {
    const u = new URL(value, location.origin);
    return u.origin === location.origin && u.pathname.startsWith(ROOT);
  } catch (_) {
    return false;
  }
}
function initEntry() {
  const old = history.state?.fdPreviewRoute;
  if (old?.id) {
    activeEntryId = old.id;
    return;
  }
  const entry = { id: newEntryId(), previous: null };
  history.replaceState({ ...history.state, fdPreviewRoute: entry }, '', location.href);
  activeEntryId = entry.id;
}
function saveView(id = activeEntryId) {
  if (!id || !route || route.type === 'destinations') return;
  const grid = $('.units-grid');
  navViews[id] = {
    path: route.path,
    filter,
    photoIndex,
    openSpecs: [...document.querySelectorAll('.spec')].flatMap((e, i) => (e.open ? [i] : [])),
    gridLeft: grid?.scrollLeft || 0,
    directoryTop: $('#resort-service-directory')?.scrollTop || 0,
    serviceGroup: $('#resort-service-directory')?.dataset.serviceGroup,
    y: scrollY,
    faq: $('.faq-guide')
      ? {
          group: $('.faq-guide').dataset.faqGroup,
          query: $('#faq-search').value,
          open: $('.faq-guide .faq[open]')?.id,
        }
      : undefined,
    savedAt: Date.now(),
  };
  const keys = Object.keys(navViews);
  while (keys.length > 80) delete navViews[keys.shift()];
  try {
    sessionStorage.setItem(NAV_KEY, JSON.stringify(navViews));
  } catch (_) {}
}
function restoreView() {
  const snap = navViews[activeEntryId];
  if (!snap || snap.path !== route.path) return;
  if (Array.isArray(snap.openSpecs))
    document.querySelectorAll('.spec').forEach((e, i) => {
      e.open = snap.openSpecs.includes(i);
    });
  const grid = $('.units-grid');
  if (grid) {
    grid.scrollLeft = Number(snap.gridLeft) || 0;
    grid.dispatchEvent(new Event('scroll'));
  }
  const directory = $('#resort-service-directory');
  if (directory) directory.scrollTop = Number(snap.directoryTop) || 0;
  window.scrollTo({ top: Number(snap.y) || 0, behavior: 'instant' });
}
function labelForURL(value) {
  const u = new URL(value, location.origin),
    path = u.pathname.slice(ROOT.length - 1);
  if (path === '/') return 'الوجهات';
  for (const v of Object.keys(labels)) if (path === `/${v}/`) return labels[v];
  if (path === '/cabins/') return 'الأكواخ';
  if (path === '/stay/sections/') return 'القسمان';
  if (path === '/resort-map/') return 'الخريطة';
  if (path === '/chalet-map/') return 'استكشف الشاليه';
  if (path.endsWith('/compare/')) return 'المقارنة';
  if (path.endsWith('/contact/')) return 'الموقع والتواصل';
  if (path.endsWith('/faq/')) return 'الأسئلة الشائعة';
  if (path.endsWith('/order/')) return 'ملخص الطلب';
  if (path.endsWith('/checkout/')) return 'تفاصيل الطلب';
  if (path === '/services/') return 'خدمات المنتجع';
  if (path === '/chalet/services/') return 'خدمات الشاليه';
  if (path === '/stay/services/') return 'خدمات الاستراحة';
  if (path.includes('guest-services')) return 'خدمات إقامتك';
  const uinfo = catalog.units.find((u) => u.path === path);
  if (uinfo) return uinfo.name;
  const sinfo = catalog.services.find(
    (s) => s.path === path || (['games', 'water'].includes(s.id) && servicePath(s, 'chalet') === path),
  );
  if (sinfo) return sinfo.name;
  if (path.includes('-tour/')) return 'استكشاف الكوخ';
  return 'الوجهات';
}

function contextualBack(fallback) {
  const previous = history.state?.fdPreviewRoute?.previous;
  let target = new URL(prefix(fallback), location.origin).href;
  if (previous?.id && ownURL(previous.url)) {
    const path = new URL(previous.url).pathname.slice(ROOT.length - 1),
      source = catalog.units.find((u) => u.path === path),
      v = route.venue;
    const unitParents =
      v === 'resort'
        ? ['/cabins/', '/resort-map/']
        : v === 'stay'
          ? ['/stay/sections/', '/stay/compare/']
          : ['/chalet/'];
    const allowed =
      route.type === 'unit'
        ? unitParents.includes(path)
        : route.type === 'tour'
          ? source?.venue === v || unitParents.includes(path)
          : route.type === 'faq'
            ? path === `/${v}/contact/` || source?.venue === v
            : false;
    if (allowed) target = previous.url;
  }
  const sameParent =
    previous?.id && ownURL(previous.url) && new URL(previous.url).pathname === new URL(target).pathname;
  return { url: sameParent ? previous.url : target, label: labelForURL(target), native: Boolean(sameParent) };
}

const isOrderPortal = (path) =>
  path.startsWith('/services-guide/') ||
  path.startsWith('/guest-services/') ||
  path.startsWith('/stay/guest-services/') ||
  [
    '/guest-services/',
    '/guest-services.html',
    '/chalet/guest-services/',
    '/services-guide/',
    '/arrangements/',
  ].includes(path);
function navigate(
  path,
  { replace = false, restore = false, section = false, parent = false, sibling = false } = {},
) {
  saveView();
  scrollPositions.set(previousURL, scrollY);
  if (viewer.open) viewer.close();
  const url = new URL(path, location.origin);
  if (!url.pathname.startsWith(ROOT)) url.pathname = prefix(url.pathname);
  if (isOrderPortal(url.pathname)) {
    window.FD_ORDER_VISIT.prepare(url.href);
    location[replace ? 'replace' : 'assign'](url.href);
    return;
  }
  const here = new URL(location.href),
    there = new URL(url);
  here.searchParams.delete('v');
  there.searchParams.delete('v');
  if (here.href === there.href) return;
  const current = history.state?.fdPreviewRoute;
  const destinationPath = url.pathname.slice(ROOT.length - 1),
    destinationUnit = catalog.units.find((u) => u.path === destinationPath);
  const cabinTarget = destinationUnit?.venue === 'resort' || /\-tour\/$/.test(destinationPath);
  let cabinFilter = 0;
  if (cabinTarget && route.venue === 'resort') {
    if (route.type === 'stays' && [1, 2, 3].includes(filter)) cabinFilter = filter;
    else if (['unit', 'tour'].includes(route.type) && [1, 2, 3].includes(current?.cabinFilter))
      cabinFilter = current.cabinFilter;
    if (destinationUnit && destinationUnit.id !== 11 && destinationUnit.rooms !== cabinFilter)
      cabinFilter = 0;
  }
  const next = {
    id: newEntryId(),
    cabinFilter,
    previous:
      section || parent
        ? null
        : sibling
          ? current?.previous || null
          : { id: current?.id || activeEntryId, url: location.href, label: labelForURL(location.href) },
  };
  if ((section || parent) && restore) {
    const path = url.pathname.slice(ROOT.length - 1),
      snap = Object.values(navViews)
        .filter((v) => v.path === path)
        .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
    if (snap) navViews[next.id] = { ...snap };
  }
  history[replace || section || parent || sibling ? 'replaceState' : 'pushState'](
    { ...history.state, fdPreviewRoute: next },
    '',
    url,
  );
  activeEntryId = next.id;
  render();
  window.scrollTo({ top: restore ? scrollPositions.get(location.href) || 0 : 0, behavior: 'instant' });
  restoreView();
  previousURL = location.href;
}
function legacyHash() {
  const raw = decodeURIComponent(location.hash.slice(1)),
    original = raw.split('&')[0];
  if (runtimeConfig.legacyRoutes?.[original]) return runtimeConfig.legacyRoutes[original];
  if (/^map=\d+$/.test(original)) return '/resort-map/?cabin=' + Number(original.split('=')[1]);
  const [v, view, key] = raw.split('/');
  if (v === 'destinations') return '/';
  if (!catalog.venues[v]) return null;
  if (view === 'unit')
    return catalog.units.find((u) => u.venue === v && (u.key === key || v === 'chalet'))?.path;
  if (view === 'service') return servicePath(serviceBy(key) || serviceBy('games'), v);
  if (view === 'services') return servicesPath(v);
  if (view === 'stays') return listPath(v);
  if (view === 'info') return `/${v}/contact/`;
  return `/${v}/`;
}
function parse() {
  let path = location.pathname.slice(ROOT.length - 1).replace(/index\.html$/, '');
  if (!path.endsWith('/')) path += '/';
  let v = path.startsWith('/chalet') ? 'chalet' : path.startsWith('/stay') ? 'stay' : 'resort';
  let type = 'unknown',
    s = null,
    u = catalog.units.find((u) => u.path === path);
  if (path === '/') type = 'destinations';
  else if (u) {
    type = 'unit';
    v = u.venue;
  } else if (['/resort/', '/stay/', '/chalet/'].includes(path)) type = 'home';
  else if (['/cabins/', '/stay/sections/'].includes(path)) type = 'stays';
  else if (path.includes('/checkout/')) type = 'checkout';
  else if (path.includes('/order/')) type = 'cart';
  else if (path.endsWith('/contact/')) type = 'contact';
  else if (path.endsWith('/faq/')) type = 'faq';
  else if (path === '/resort-map/') type = 'map';
  else if (path === '/chalet-map/' || /\-tour\/$/.test(path)) type = 'tour';
  else if (path.endsWith('/compare/')) type = 'compare';
  else if (path === '/arrangements/' || path === '/services-guide/') {
    type = 'guide';
    v = 'resort';
  } else if (
    path === '/guest-services/' ||
    path === '/guest-services.html/' ||
    path === '/chalet/guest-services/'
  ) {
    type = 'guest';
    v = path.startsWith('/chalet') ? 'chalet' : 'resort';
  } else if (path.endsWith('/services/')) type = 'services';
  else {
    s = catalog.services.find((s) => s.path === path);
    if (v === 'chalet') {
      s =
        path === '/chalet/services/games/'
          ? serviceBy('games')
          : path === '/chalet/services/water-games/'
            ? serviceBy('water')
            : null;
    }
    if (s) type = 'service';
  }
  if (path === '/stay/sections/' && new URLSearchParams(location.search).get('compare') === '1')
    type = 'compare';
  return { path, venue: v, type, service: s, unit: u, params: new URLSearchParams(location.search) };
}
function resortGuideAlias() {
  const path = location.pathname.replace(/index\.html$/, '');
  if (
    ![
      ROOT + 'arrangements/',
      ROOT + 'services-guide/',
      ROOT + 'guest-services/',
      ROOT + 'guest-services.html',
    ].includes(path)
  )
    return;
  const key = location.hash.slice(1).replace(/-service$/, ''),
    id = {
      restaurant: 'menu',
      games: 'games',
      water: 'water',
      cinema: 'cinema',
      hospitality: 'hospitality',
      dining: 'dining',
      coordination: 'coordination',
      seating: 'seating',
      packages: 'seating',
      'package-complete': 'coordination',
    }[key];
  if (!id) return;
  const target = new URL(prefix(serviceBy(id).path), location.origin);
  target.search = location.search;
  if (key === 'package-complete') target.searchParams.set('package', 'resort');
  history.replaceState(history.state, '', target);
}
function render() {
  if (isOrderPortal(location.pathname)) {
    location.replace(location.href);
    return;
  }
  if (viewer.open) viewer.close();
  resortGuideAlias();
  const generalURL = new URL(location.href);
  if (generalURL.pathname === '/services/coordination/') generalURL.searchParams.delete('package');
  if (generalURL.pathname === '/services/outdoor-seating/') generalURL.searchParams.delete('session');
  if (generalURL.href !== location.href) history.replaceState(history.state, '', generalURL);
  route = parse();
  if (['cart', 'checkout'].includes(route.type)) {
    history.replaceState(history.state, '', prefix(servicesPath()));
    route = parse();
  }
  activeEntryId = history.state?.fdPreviewRoute?.id || activeEntryId;
  const snap = navViews[activeEntryId];
  photoIndex = snap?.path === route.path ? Number(snap.photoIndex) || 0 : 0;
  filter = snap?.path === route.path ? ([0, 1, 2, 3].includes(snap.filter) ? snap.filter : 0) : 0;
  shell();
  renderMain();
  restoreView();
}
function shell() {
  const entry = route.type === 'destinations',
    focused = ['map', 'tour'].includes(route.type),
    v = route.venue;
  document.body.className =
    (entry ? 'destination-flow' : focused ? 'complete-flow focused-view' : 'complete-flow') +
    (!entry ? ` ${v}-scope ${v}-${route.type}` : '');
  const active =
    v === 'stay' && route.type === 'compare'
      ? 'compare'
      : route.type === 'map'
        ? 'map'
        : route.type === 'unit' || ['stays', 'tour', 'compare'].includes(route.type)
          ? 'stays'
          : ['services', 'service', 'guide', 'guest', 'cart', 'checkout'].includes(route.type)
            ? 'services'
            : ['contact', 'faq'].includes(route.type)
              ? 'info'
              : 'home';
  const nav = $('#bottom-nav');
  nav.hidden = entry || focused;
  const discover =
    v === 'resort'
      ? ['/resort-map/', 'map', 'الخريطة', 'map']
      : v === 'chalet'
        ? ['/chalet-map/', 'map', 'الجولة', 'map']
        : ['/stay/compare/', 'users', 'المقارنة', 'compare'];
  const tabs = [
    [`/${v}/`, 'home', labels[v], 'home'],
    discover,
    [listPath(), 'bed', v === 'resort' ? 'الأكواخ' : v === 'stay' ? 'القسمان' : 'التفاصيل', 'stays'],
    [servicesPath(), 'services', 'الخدمات', 'services'],
    [`/${v}/contact/`, 'phone', 'التواصل', 'info'],
  ];
  nav.classList.remove('six-items');
  nav.innerHTML = entry
    ? ''
    : tabs
        .map(
          ([path, i, title, k]) =>
            `<a href="${prefix(path)}" data-section-tab ${k === 'map' ? `aria-label="${v === 'chalet' ? explorationTitle(unit(30)) : 'خريطة الأكواخ التفاعلية'}"` : ''} class="${k === 'stays' ? 'nav-featured' : ''}" ${active === k ? 'aria-current="page"' : ''}><span class="nav-icon">${icon(i)}</span><span class="nav-label">${title}</span></a>`,
        )
        .join('');
  if (entry) {
    $('.header-wrap').innerHTML = '';
    return;
  }
  const tourUnit = explorationUnit();
  let back =
    route.type === 'tour'
      ? route.path === '/chalet-map/'
        ? route.params.get('from') === 'chalet-details'
          ? unit(30).path
          : '/chalet/'
        : route.params.get('from') === 'map'
          ? '/resort-map/?cabin=' + (tourUnit?.id || 1)
          : tourUnit?.path || `/${v}/`
      : route.type === 'unit'
        ? v === 'chalet'
          ? '/chalet/'
          : listPath()
        : route.type === 'service'
          ? servicesPath()
          : route.type === 'checkout'
            ? `/${v}/order/`
            : route.type === 'faq'
              ? `/${v}/contact/`
              : `/${v}/`;
  if (route.type === 'compare') back = listPath();
  if (['guide', 'guest', 'cart'].includes(route.type)) back = servicesPath();
  if (back === route.path) back = `/${v}/`;
  const title =
    route.type === 'map'
      ? 'خريطة الأكواخ التفاعلية'
      : route.type === 'tour'
        ? explorationTitle(v === 'chalet' ? unit(30) : tourUnit)
        : venue().name;
  const target = contextualBack(route.type === 'home' ? '/' : back),
    href = target.url;
  const backLabel = target.label;
  const quietHeader = ['home', 'stays', 'unit'].includes(route.type) || reviewedGuide();
  $('.header-wrap').innerHTML =
    `<nav class="header-start" aria-label="الرجوع"><a class="context-back" href="${safe(href)}" ${target.native ? 'data-history-back' : 'data-parent-back'} aria-label="العودة إلى ${safe(backLabel)}"><span class="icon-button">${icon('right')}</span><span>${safe(backLabel)}</span></a></nav>${quietHeader ? '<span class="header-identity" aria-hidden="true"></span>' : `<a class="header-identity" href="${prefix('/' + v + '/')}">${safe(title)}</a>`}<div class="header-actions" id="header-actions"><button class="icon-button" data-share="${safe(route.type === 'service' ? route.path : route.path + location.search)}" aria-label="مشاركة الصفحة">${icon('share')}</button></div>`;
}

function updateShareMetadata() {
  const info = shareMetadata[route.path];
  if (!info) {
    document.title = $('h1', main)?.textContent || 'يوم العائلة';
    return;
  }
  document.title = info.title;
  const set = (attr, key, value) => {
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.append(tag);
    }
    tag.content = value;
  };
  for (const [attr, key, value] of [
    ['name', 'description', info.description],
    ['property', 'og:title', info.title],
    ['property', 'og:description', info.description],
    ['property', 'og:url', new URL(prefix(route.path), location.origin).href],
    ['name', 'twitter:title', info.title],
    ['name', 'twitter:description', info.description],
  ])
    set(attr, key, value);
  document
    .querySelectorAll(
      'meta[property^="og:image"],meta[name^="twitter:image"],meta[name="thumbnail"],link[rel="image_src"]',
    )
    .forEach((e) => e.remove());
  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = new URL(prefix(route.path), location.origin).href;
}
function resortServiceDirectory(...args) {
  return viewModules.resort.resortServiceDirectory(...args);
}
function bindServiceDirectory(...args) {
  return viewModules.resort.bindServiceDirectory(...args);
}
function renderMain() {
  const views = {
    destinations,
    home,
    stays,
    unit: detail,
    services,
    service: serviceDetail,
    contact,
    faq,
    map: resortMap,
    tour,
    compare: comparison,
    unknown: unavailable,
  };
  // Keep the decoded venue hero and directory in memory when switching sections.
  // Returning reuses the decoded photo instead of rebuilding the overview.
  const stable = route.type === 'home' || (route.venue === 'resort' && route.type === 'services');
  let view = stable ? stableViews.get(route.path) : null;
  if (!view) {
    view = document.createElement('div');
    view.className = 'view';
    view.innerHTML = views[route.type]();
    if (stable) stableViews.set(route.path, view);
  }
  main.replaceChildren(view);
  updateShareMetadata();
  $('#announcer').textContent = $('h1', main)?.textContent || 'يوم العائلة';
  bindView();
  warmServiceImages();
  resortOrders?.setContext(route);
}
function destinations(...args) {
  return viewModules.shared.destinations(...args);
}
function resortHome(...args) {
  return viewModules.resort.resortHome(...args);
}
function resortCard(...args) {
  return viewModules.resort.resortCard(...args);
}
function gardenCard(...args) {
  return viewModules.resort.gardenCard(...args);
}
function resortCabins(...args) {
  return viewModules.resort.resortCabins(...args);
}
function venueContact(...args) {
  return viewModules.shared.venueContact(...args);
}

function venueHome(...args) {
  return viewModules.shared.venueHome(...args);
}
function chaletHome(...args) {
  return viewModules.chalet.chaletHome(...args);
}
function stayHome(...args) {
  return viewModules.stay.stayHome(...args);
}
function home() {
  return route.venue === 'resort' ? resortHome() : route.venue === 'stay' ? stayHome() : chaletHome();
}

function stayCard(...args) {
  return viewModules.stay.stayCard(...args);
}

function staySections(...args) {
  return viewModules.stay.staySections(...args);
}
function stays() {
  return route.venue === 'resort' ? resortCabins() : staySections();
}

function gallery(...args) {
  return viewModules.shared.gallery(...args);
}
function cabinNavigation(...args) {
  return viewModules.resort.cabinNavigation(...args);
}

function specificationIcon(...args) {
  return viewModules.shared.specificationIcon(...args);
}
function unitSpecifications(...args) {
  return viewModules.shared.unitSpecifications(...args);
}
function stayNavigation(...args) {
  return viewModules.stay.stayNavigation(...args);
}
function detail(...args) {
  return viewModules.shared.detail(...args);
}

const serviceText = (s, field) => guideCopy.serviceCopy?.[s.id]?.[field] || s.intro;
function chaletServiceCard(...args) {
  return viewModules.chalet.chaletServiceCard(...args);
}
function chaletServices(...args) {
  return viewModules.chalet.chaletServices(...args);
}
function services() {
  return route.venue === 'resort'
    ? resortServiceDirectory()
    : route.venue === 'stay'
      ? stayServiceGuide()
      : chaletServices();
}
const displayServiceImage = (src) => runtimeConfig.serviceImages?.[String(src).split('?')[0]] || src;
const warmedServiceImages = new Map();
function warmServiceImages() {
  if (
    !reviewedGuide() ||
    !['services', 'service', 'guest', 'guide'].includes(route.type) ||
    navigator.connection?.saveData
  )
    return;
  const services =
    route.venue === 'stay'
      ? [guideCopy.stayService]
      : route.type === 'service'
        ? [route.service]
        : catalog.services.filter((s) => venue().services.includes(s.id));
  for (const s of services) {
    if (!s?.image) continue;
    const src = displayServiceImage(s.image);
    if (warmedServiceImages.has(src)) continue;
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = route.type === 'service' ? 'high' : 'low';
    image.src = src;
    image.decode?.().catch(() => {});
    warmedServiceImages.set(src, image);
  }
  for (const image of main.querySelectorAll('.package-image img[loading="eager"]'))
    image.decode?.().catch(() => {});
}
function packagePhotos(...args) {
  return viewModules.shared.packagePhotos(...args);
}
function stayServiceGuide(...args) {
  return viewModules.stay.stayServiceGuide(...args);
}
function restaurantGuide(...args) {
  return viewModules.resort.restaurantGuide(...args);
}

function diningGuide(...args) {
  return viewModules.resort.diningGuide(...args);
}

// The resort guide explains services; the two existing portals own requests and contact.
function resortServiceLink(...args) {
  return viewModules.resort.resortServiceLink(...args);
}
function guideNotes(...args) {
  return viewModules.shared.guideNotes(...args);
}
function servicePhoto(...args) {
  return viewModules.shared.servicePhoto(...args);
}
function guideContents(...args) {
  return viewModules.shared.guideContents(...args);
}
function serviceGuidePackage(...args) {
  return viewModules.resort.serviceGuidePackage(...args);
}
function coordinationHelp(...args) {
  return viewModules.resort.coordinationHelp(...args);
}
function resortServiceGuide(...args) {
  return viewModules.resort.resortServiceGuide(...args);
}
function chaletServiceGuide(...args) {
  return viewModules.chalet.chaletServiceGuide(...args);
}

function serviceDetail() {
  const s = route.service;
  if (!s || !venue().services.includes(s.id)) return unavailable();
  if (route.venue === 'chalet') return chaletServiceGuide(s);
  if (route.venue === 'resort' && s.id === 'menu') return restaurantGuide(s);
  if (route.venue === 'resort' && s.id === 'dining') return diningGuide(s);
  if (
    route.venue === 'resort' &&
    ['games', 'water', 'cinema', 'hospitality', 'coordination', 'seating', 'extras'].includes(s.id)
  )
    return resortServiceGuide(s);
  if (route.venue === 'resort' && ['competition', 'video', 'loyalty'].includes(s.id))
    return promotionGuide(s);
  return unavailable();
}
function promotionList(...args) {
  return viewModules.resort.promotionList(...args);
}
function promotionDisclosure(...args) {
  return viewModules.resort.promotionDisclosure(...args);
}
function promotionAction(...args) {
  return viewModules.resort.promotionAction(...args);
}
function promotionSteps(...args) {
  return viewModules.resort.promotionSteps(...args);
}
function promotionSocial(...args) {
  return viewModules.resort.promotionSocial(...args);
}
function promotionGuide(...args) {
  return viewModules.resort.promotionGuide(...args);
}
function contact() {
  return venueContact();
}

function faqSearchText(...args) {
  return viewModules.shared.faqSearchText(...args);
}
function faqGuide(...args) {
  return viewModules.shared.faqGuide(...args);
}
function bindFaqGuide(...args) {
  return viewModules.shared.bindFaqGuide(...args);
}

function faq() {
  return faqGuide();
}

function comparisonSpecials(...args) {
  return viewModules.resort.comparisonSpecials(...args);
}
function resortComparison(...args) {
  return viewModules.resort.resortComparison(...args);
}
function stayComparison(...args) {
  return viewModules.stay.stayComparison(...args);
}
function comparison() {
  return route.venue === 'resort' ? resortComparison() : stayComparison();
}

function visualSource(path) {
  const source = new URL(ASSETS + 'visuals' + path, location.origin);
  source.search = location.search;
  source.searchParams.set('assetVersion', VERSION);
  return safe(source.pathname + source.search);
}
function resortMap() {
  return `<div class="tour-view map-original"><h1 class="resort-visual-title">خريطة الأكواخ التفاعلية</h1><iframe class="tour-frame" id="tour-frame" src="${visualSource('/resort-map/')}" title="خريطة الأكواخ التفاعلية" allow="clipboard-write; web-share; fullscreen" allowfullscreen></iframe></div>`;
}
function tour() {
  const chalet = route.path === '/chalet-map/',
    title = explorationTitle(chalet ? unit(30) : explorationUnit());
  return `<div class="tour-view"><h1 class="resort-visual-title">${safe(title)}</h1><iframe class="tour-frame" id="tour-frame" src="${visualSource(route.path)}" title="${chalet ? 'خريطة الشاليه' : 'استكشاف الكوخ'}" allow="clipboard-write; web-share; fullscreen" allowfullscreen></iframe></div>`;
}

function unavailable() {
  return `<div class="error-state"><h1>الصفحة غير موجودة</h1><p>اختر وجهتك للمتابعة</p>${link('/', 'الوجهات', 'button primary')}</div>`;
}
function bindView() {
  bindServiceDirectory();
  const restaurant = $('.restaurant-guide');
  if (restaurant) {
    if (restaurantInline) restaurantInline.bind(restaurant);
    else {
      const status = $('.restaurant-inline-status', restaurant);
      status.replaceChildren(document.createTextNode('تعذر تحميل طلب المطعم. '));
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'text-link';
      retry.textContent = 'إعادة المحاولة';
      retry.onclick = () => location.reload();
      status.append(retry);
    }
  }
  const grid = $('.units-grid');
  if (grid)
    grid.addEventListener(
      'scroll',
      () => {
        const cards = [...grid.children],
          right = grid.getBoundingClientRect().right,
          i = cards.reduce(
            (n, c, j) =>
              Math.abs(c.getBoundingClientRect().right - right) <
              Math.abs(cards[n].getBoundingClientRect().right - right)
                ? j
                : n,
            0,
          );
        if ($('#carousel-count')) {
          const resort = route.venue === 'resort',
            cabins = resort ? cards.filter((c) => c.dataset.unitId !== '11') : cards;
          $('#carousel-count').textContent =
            resort && cards[i]?.dataset.unitId === '11' ? 'الحديقة المشتركة' : `${i + 1} / ${cabins.length}`;
        }
      },
      { passive: true },
    );
  if ($('.faq-guide')) bindFaqGuide();
}
function showViewer(title, html) {
  returnFocus = document.activeElement;
  $('#viewer-title').textContent = title;
  $('#viewer-body').innerHTML = html;
  $('[data-close]', viewer).innerHTML = icon('close');
  viewer.showModal();
  document.body.style.overflow = 'hidden';
}
function showPhotos(images, labels, title, index = 0) {
  modalPhotos = { images, labels, title, index };
  showViewer(title, lightboxMarkup());
  upgradeLightboxImage();
}
function lightboxMarkup() {
  const m = modalPhotos;
  return `<img class="lightbox-image" src="${safe(reviewedGuide() ? displayServiceImage(m.images[m.index]) : m.images[m.index])}" alt="${safe(m.labels?.[m.index] || m.title)}">${m.images.length > 1 ? `<button class="gallery-control previous" data-modal-photo="-1" aria-label="الصورة السابقة">${icon('right')}</button><button class="gallery-control next" data-modal-photo="1" aria-label="الصورة التالية">${icon('left')}</button>` : ''}<span class="lightbox-count">${m.index + 1} / ${m.images.length}</span>`;
}
function upgradeLightboxImage() {
  const target = $('.lightbox-image', viewer),
    original = modalPhotos?.images[modalPhotos.index];
  if (!target || !original || target.src === new URL(original, location.origin).href) return;
  const full = new Image();
  full.src = original;
  const ready = full.decode
    ? full.decode()
    : new Promise((resolve, reject) => {
        full.onload = resolve;
        full.onerror = reject;
      });
  ready
    .then(() => {
      if (target.isConnected && modalPhotos?.images[modalPhotos.index] === original) target.src = original;
    })
    .catch(() => {});
}
function changePhoto(i) {
  const u = currentUnit();
  if (!u) return;
  photoIndex = (i + u.images.length) % u.images.length;
  $('#gallery-image').src = u.images[photoIndex];
  $('#gallery-image').alt = u.labels[photoIndex] || u.name;
  $('#gallery-label').textContent = u.labels[photoIndex] || u.name;
  $('#gallery-count').textContent = `${photoIndex + 1} / ${u.images.length}`;
  document
    .querySelectorAll('[data-thumbnail]')
    .forEach((e, i) => e.setAttribute('aria-pressed', String(photoIndex === i)));
}
viewer.addEventListener('close', () => {
  modalPhotos = null;
  $('#viewer-body').innerHTML = '';
  document.body.style.overflow = '';
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
document.addEventListener('click', async (e) => {
  const backLink = e.target.closest('a[data-history-back]');
  if (
    backLink &&
    !e.defaultPrevented &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    !e.altKey &&
    e.button === 0
  ) {
    e.preventDefault();
    saveView();
    history.back();
    return;
  }
  const a = e.target.closest('a[href]');
  if (
    a &&
    !a.hasAttribute('data-service-portal') &&
    !e.defaultPrevented &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    !e.altKey &&
    e.button === 0
  ) {
    const u = new URL(a.href, location.href);
    if (u.origin === location.origin && u.pathname.startsWith(ROOT) && !a.hasAttribute('download')) {
      e.preventDefault();
      const section = a.hasAttribute('data-section-tab'),
        parent = a.hasAttribute('data-parent-back');
      const sibling = route.type === 'unit' && a.hasAttribute('data-cabin-switch');
      navigate(u.href, { section, parent, sibling, restore: section || parent });
      return;
    }
  }
  const b = e.target.closest('button');
  if (!b) return;
  if (b.hasAttribute('data-share')) {
    share(b.dataset.share, document.title);
    return;
  }
  if (b.hasAttribute('data-copy')) {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      toast('تم النسخ');
    } catch (_) {
      toast(b.dataset.copy);
    }
    return;
  }
  if (b.hasAttribute('data-card-compare')) {
    const id = Number(b.dataset.cardCompare);
    if (compare.has(id)) compare.delete(id);
    else {
      if (compare.size >= 3) {
        toast('اختر حتى 3 أكواخ');
        return;
      }
      compare.add(id);
    }
    const selected = compare.has(id);
    b.setAttribute('aria-pressed', String(selected));
    b.setAttribute(
      'aria-label',
      (selected ? 'إزالة ' : 'إضافة ') + unit(id).name + ' ' + (selected ? 'من المقارنة' : 'للمقارنة'),
    );
    b.textContent = selected ? 'تم الاختيار' : 'قارن';
  }
  if (b.hasAttribute('data-filter')) {
    filter = Number(b.dataset.filter);
    renderMain();
  }
  if (b.hasAttribute('data-carousel')) {
    const g = $('.units-grid'),
      cards = [...g.children],
      right = g.getBoundingClientRect().right;
    let i = cards.reduce(
      (n, c, j) =>
        Math.abs(c.getBoundingClientRect().right - right) <
        Math.abs(cards[n].getBoundingClientRect().right - right)
          ? j
          : n,
      0,
    );
    i = Math.max(0, Math.min(cards.length - 1, i + Number(b.dataset.carousel)));
    cards[i].scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  }
  if (b.hasAttribute('data-photo')) changePhoto(photoIndex + Number(b.dataset.photo));
  if (b.hasAttribute('data-thumbnail')) changePhoto(Number(b.dataset.thumbnail));
  if (b.hasAttribute('data-lightbox-unit')) {
    const u = currentUnit();
    showPhotos(u.images, u.labels, u.name, photoIndex);
  }
  if (b.hasAttribute('data-package-photo')) {
    const image = b.dataset.packagePhoto,
      s = route.service;
    const p = s?.packages?.find((p) => p.images?.includes(image));
    showPhotos(p?.images || [image], [], p?.name || s?.name || 'الصورة', p?.images?.indexOf(image) || 0);
  }
  if (b.hasAttribute('data-modal-photo') && modalPhotos) {
    modalPhotos.index =
      (modalPhotos.index + Number(b.dataset.modalPhoto) + modalPhotos.images.length) %
      modalPhotos.images.length;
    $('#viewer-body').innerHTML = lightboxMarkup();
    upgradeLightboxImage();
  }
  if (b.hasAttribute('data-close')) viewer.close();
  if (b.hasAttribute('data-virtual'))
    showViewer(
      'جولة ثلاثية الأبعاد للحديقة',
      `<iframe src="${safe(b.dataset.virtual)}" title="جولة الحديقة المشتركة" allow="fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`,
    );
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.hasAttribute('data-compare')) {
    const id = Number(t.dataset.compare);
    if (t.checked) {
      if (compare.size >= 3) {
        t.checked = false;
        toast('اختر حتى 3 أكواخ');
        return;
      }
      compare.add(id);
    } else compare.delete(id);
    if (route.type === 'compare') {
      renderMain();
      $('[data-compare="' + id + '"]')?.focus({ preventScroll: true });
    }
  }
});
document.addEventListener('keydown', (e) => {
  if (resortOrders?.isOpen()) return;
  if (e.key === 'Escape' && route.venue === 'resort' && route.type === 'services' && !viewer.open) {
    e.preventDefault();
    $('.context-back').click();
    return;
  }
  if (modalPhotos && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
    modalPhotos.index =
      (modalPhotos.index + (e.key === 'ArrowLeft' ? 1 : -1) + modalPhotos.images.length) %
      modalPhotos.images.length;
    $('#viewer-body').innerHTML = lightboxMarkup();
    upgradeLightboxImage();
  } else if (
    !viewer.open &&
    currentUnit() &&
    e.target.closest('.gallery,.thumbnails') &&
    ['ArrowLeft', 'ArrowRight'].includes(e.key)
  )
    changePhoto(photoIndex + (e.key === 'ArrowLeft' ? 1 : -1));
});
let touchX = 0;
main.addEventListener(
  'touchstart',
  (e) => {
    if (e.target.closest('.gallery')) touchX = e.touches[0].clientX;
  },
  { passive: true },
);
main.addEventListener(
  'touchend',
  (e) => {
    if (e.target.closest('.gallery') && Math.abs(e.changedTouches[0].clientX - touchX) > 45)
      changePhoto(photoIndex + (e.changedTouches[0].clientX < touchX ? 1 : -1));
  },
  { passive: true },
);
window.addEventListener('pagehide', () => {
  discardStoredOrders();
  saveView();
});
window.addEventListener('popstate', () => {
  if (resortOrders?.handlePopstate()) return;
  saveView(activeEntryId);
  scrollPositions.set(previousURL, scrollY);
  render();
  restoreView();
  previousURL = location.href;
});
window.addEventListener('message', (e) => {
  const frame = $('#tour-frame');
  if (e.origin !== location.origin || !frame || e.source !== frame.contentWindow) return;
  if (
    e.data?.type === 'familyday-preview-navigate' &&
    typeof e.data.path === 'string' &&
    e.data.path.startsWith('/')
  )
    navigate(prefix(e.data.path));
  if (
    e.data?.type === 'familyday-preview-virtual' &&
    e.data.url === 'https://my.matterport.com/show/?m=S7Z2CF9tdwm'
  )
    showViewer(
      'جولة ثلاثية الأبعاد للحديقة',
      `<iframe src="${safe(e.data.url)}" title="جولة الحديقة المشتركة" allow="fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`,
    );
  if (e.data?.type === 'familyday-preview-map-selection' && route.type === 'map') {
    const u = new URL(location.href);
    if (e.data.cabinId) u.searchParams.set('cabin', String(e.data.cabinId));
    else u.searchParams.delete('cabin');
    history.replaceState(history.state, '', u);
    previousURL = location.href;
    route.params = new URLSearchParams(u.search);
    const button = $('[data-share]');
    if (button) button.dataset.share = route.path + u.search;
  }
});

// Shared dependencies are provided once; getters keep navigation state current.
const viewContext = {
  $,
  get activeEntryId() {
    return activeEntryId;
  },
  cabinNavigation,
  get catalog() {
    return catalog;
  },
  get compare() {
    return compare;
  },
  currentUnit,
  digit,
  displayServiceImage,
  explorationTitle,
  get filter() {
    return filter;
  },
  guests,
  guideContents,
  get guideCopy() {
    return guideCopy;
  },
  guideNotes,
  heading,
  icon,
  labels,
  link,
  money,
  get navViews() {
    return navViews;
  },
  out,
  packagePhotos,
  paragraphs,
  get photoIndex() {
    return photoIndex;
  },
  prefix,
  reviewedGuide,
  roomWording,
  rooms,
  get route() {
    return route;
  },
  safe,
  saveView,
  serviceBy,
  servicePath,
  servicePhoto,
  serviceText,
  specificationText,
  stayNavigation,
  ul,
  unavailable,
  unit,
  unitsFor,
  venue,
  venueHome,
};
const viewModules = {
  resort: createResortViews(viewContext),
  chalet: createChaletViews(viewContext),
  stay: createStayViews(viewContext),
  shared: createSharedViews(viewContext),
};
const orderDependencies = {
  native: import('./orders/native-orders.js?v=' + VERSION).catch((error) => ({ error })),
  restaurant: Promise.all([
    import('./orders/restaurant-inline.js?v=' + VERSION),
    import('../js/guest-order-message.js?v=' + VERSION),
  ]).catch((error) => ({ error })),
};
try {
  const responses = await Promise.all([
    fetch(ASSETS + 'catalog.json?v=' + VERSION),
    fetch(ASSETS + 'share-metadata.json?v=' + VERSION),
    fetch(ASSETS + 'guide-copy.json?v=' + VERSION),
    fetch(ASSETS + 'runtime-config.json?v=' + VERSION),
  ]);
  if (responses.some((response) => !response.ok)) throw new Error('preview data');
  [catalog, shareMetadata, guideCopy, runtimeConfig] = await Promise.all(
    responses.map((response) => response.json()),
  );
  try {
    const dependency = await orderDependencies.native;
    if (dependency.error) throw dependency.error;
    const { createResortOrders } = dependency;
    resortOrders = createResortOrders({
      version: VERSION,
      services: catalog.services,
      share,
      toast,
      stayService: guideCopy.stayService,
    });
  } catch (error) {
    console.error('تعذر تحميل الطلب داخل الموقع', error);
  }
  try {
    const dependency = await orderDependencies.restaurant;
    if (dependency.error) throw dependency.error;
    const [{ createRestaurantInline }] = dependency;
    restaurantInline = createRestaurantInline({
      menu: serviceBy('menu').menu,
      cabins: catalog.source.guestCatalog.cabins,
      messageBuilder: { build: window.FD_GUEST_ORDER_MESSAGE.restaurant },
    });
  } catch (error) {
    console.error('تعذر تحميل طلب المطعم', error);
  }
  window.FD_ORDER_VISIT.register(
    'main:restaurant',
    () => restaurantInline?.snapshot(),
    (saved) => restaurantInline?.restore(saved),
  );
  window.FD_ORDER_VISIT.register(
    'main:requests',
    () => resortOrders?.snapshot(),
    (saved) => resortOrders?.restore(saved),
  );
  const old = legacyHash();
  if (old && isOrderPortal(new URL(old, location.origin).pathname)) {
    location.replace(old);
    await new Promise(() => {});
  }
  if (old) history.replaceState(history.state, '', prefix(old));
  initEntry();
  render();
} catch (e) {
  main.innerHTML =
    '<div class="error-state"><h1>تعذر تحميل الصفحة</h1><button class="button primary" onclick="location.reload()">إعادة المحاولة</button></div>';
  console.error(e);
}

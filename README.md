# Family Day

Static Arabic site. Serve the repository root; no build or package installation is
needed to run the site:

```sh
python3 -m http.server 8023 --bind 127.0.0.1
```

## Where to edit

- `index.html`: page content, metadata and asset loading order. Keep executable
  application code in `js/`, and large stylesheet sections in `css/`.
- `js/app-shell.js`: FAQ, contact and splash actions.
- `js/service-orders.js` and `css/service-orders.css`: shared service checkout,
  catalog-priced summaries and WhatsApp messages. Restaurant orders retain their
  separate destination. `css/service-mobile.css` holds phone-only service layouts.
- `js/gallery-data.js` and `js/accommodations.js`: photo sets, cabin cards and details.
- `js/fullscreen-gallery.js`: fullscreen photo navigation.
- `js/services.js`: service controls and restaurant ordering.
- `js/stay-navigation.js`: destination/rest-house views and touch navigation.
- `js/router.js`: URLs, history and return destinations.
- `js/accessibility.js`, `js/cabin-carousel.js`, `js/cabin-toolbar.js`: keyboard
  access, listing carousel and mobile map launcher.
- `css/app-base.css`: base and service styles. `css/accommodation-layout.css`:
  destination/cabin refinements, kept in their original cascade position.
- `share-pages.json`: public entry URLs; `scripts/build-share-pages.py` generates
  complete entry pages from the shared `index.html`, with route-specific metadata.
  Visitors load the app directly, without a redirect or a second document request.
  Do not edit generated pages. After every `index.html` or `share-pages.json`
  change, run `python3 scripts/build-share-pages.py`; use `--check` to detect stale output.
  General service links keep the group preview; specific tab links
  use their own catalog entries and open the same grouped interface. Keep titles
  and descriptions in this catalog, then regenerate the entry pages.
- `site-ui.css`: shared mobile contact spacing; desktop/contact base rules live
  in `css/app-base.css`, without JavaScript-injected contact overrides.
- `services-guide/`: guide navigation and the temporary footer link to
  `/guest-services/`. Removing that link later does not remove the guest page.
- `resort-data.js`: shared cabin specifications. Keep physical cabin IDs and
  booking URLs stable; Dome and Greek units share their approved specifications.
- `service-data.js`: menu, seating and dining prices. Hospitality and coordination
  contents live in `index.html`; the guide reads them from there.
- `resort-map-data.js`: shared resort map coordinates and photos.
- `tour-common.js`: shared cabin exploration markup, icons, details renderer and
  connector geometry. Each `*-tour.js` owns its cabin's points, labels, content,
  image and responsive layout configuration. Load the common script first.
- Tour and map text uses the current Arabic content directly. `tour-page.css`
  holds the shared standalone canvas, followed by `tour-layout.css` for common
  navigation and details styling. Cabin styles retain their illustration and
  label positions; viewport styles retain the responsive layout differences.
- The compact FAQ styling lives in `css/faq-mobile.css`; `resort-features.js`
  handles category selection and accordion behavior without injecting CSS.
- `services-guide/`: brochure backed by those shared sources; see its README.
- `js/water-games.js` and `css/water-games.css`: the shared water-game bundle
  for the site and app preview. Guests allocate 3 games between adults and
  children for 50 SAR; checkout sends the quantities, without an item catalog.
- `guest-services/`: in-stay orders on one page. Five service tiles open a
  shared native dialog: restaurant, water games, games, cinema, extras. Editing
  uses a temporary selection; only Add/Save updates the grouped bills and the
  tab-scoped saved order. Close, Escape and Cancel discard unapplied changes.
  Selected tiles show a green state and subtotal; reopening edits that service.
  The restaurant basket/recipient stays separate from resort
  services. `service-source.js` reads the main `index.html` on each visit (as the
  guide does) for service names, prices, contents, instructions and cinema slots.
  It loads the menu and cabin script versions referenced by that source, so
  updating the original services also updates this page. Do not copy their data
  into the guest HTML/JS. Extra-item names/prices live only in the guest HTML.
  Cheese add-on prices use each menu item's `cheesePrice` in `service-data.js`.
  `guest-services.js` saves selections, not trusted prices, in a tab-scoped draft;
  it migrates earlier extras drafts and blocks incomplete water bundles.
  Names/cabins are shared between the two forms, but notes/totals remain separate.
  The mobile shortcut totals both baskets, jumps to their summaries, and hides
  while those summaries or a service dialog are visible.
  WhatsApp opens a prepared message, never sends or confirms an order.
  **Keep `/guest-services/` permanent**, regardless of where its link is placed.
  Its title, description, Open Graph and Twitter preview copy are intentionally
  fixed independently from the service catalogue. Do not regenerate them from
  service text. `guest-services.html` redirects legacy links to this same page.

Exploration layouts use a 600 px or 900 px side-layout breakpoint, depending on
the cabin. Preserve these configurations when changing the shared renderer.
The application scripts use shared globals and execute at specific DOM positions.
Keep their order in `index.html`; adding `async`, `defer` or `type="module"` changes
that contract. Preload hints fetch larger files early without executing them.
Critical and small inline styles remain in place to preserve first paint and the
CSS cascade. Relative image paths in external CSS resolve from that CSS folder.
Update asset cache keys (including matching preload hints) when publishing changes.
Keep service compatibility entry functions: navigation checks exercise them.

## Checks

Browser checks require Python Playwright and `/usr/bin/chromium`. With the local
server running:

```sh
python3 scripts/build-share-pages.py --check
python3 scripts/check-approved-review.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
python3 scripts/check-entry-loading.py http://127.0.0.1:8023
python3 scripts/check-share-pages.py http://127.0.0.1:8023
python3 scripts/check-menu-experience.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-service-orders.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-lossless-images.py http://127.0.0.1:8023
python3 scripts/check-guest-services.py http://127.0.0.1:8023
python3 scripts/check-water-games.py http://127.0.0.1:8023
```

Checks capture intended WhatsApp URLs locally; they do not send orders. The
review check accepts `FD_TEST_FONT_CSS` for an optional local Tajawal font fixture.

Standalone preview files and the two guest-services entry points are retained.
Asset paths can also be assembled dynamically; a text-search miss alone is not
proof that an image or page is unused.

The lossless-image check also requires Pillow and compares the 14 active PNG
illustrations with approved revision `148ff44`, plus the app icon and sharing
image with revision `7bf2bde`, in Git history. It verifies the
full RGBA data, dimensions, metadata and Chromium-rendered pixels. Compression
keeps the original PNG paths; update the comparison revision deliberately if
the user later approves different source artwork.

The 37 unused older tour PNG variants were removed after checking static and
dynamic image references. They remain recoverable from revision `7bf2bde`;
current `*-clarity-v1.png` artwork and deferred pages are retained.

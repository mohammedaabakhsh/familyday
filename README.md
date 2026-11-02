# Family Day

Static Arabic site. Serve the repository root; no build or package installation is
needed to run the site:

```sh
python3 -m http.server 8023 --bind 127.0.0.1
```

## Where to edit

- `index.html`: page content, metadata and asset loading order. Keep executable
  application code in `js/`, and large stylesheet sections in `css/`.
- `js/app-shell.js`: FAQ, contact, splash and order-dialog actions.
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
  their pages. General service links keep the group preview; specific tab links
  use their own catalog entries and open the same grouped interface. Keep titles
  and descriptions in this catalog, then regenerate the static preview pages.
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
- `services-guide/`: brochure backed by those shared sources; see its README.

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
python3 scripts/check-approved-review.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
python3 scripts/check-entry-loading.py http://127.0.0.1:8023
python3 scripts/check-share-pages.py http://127.0.0.1:8023
python3 scripts/check-menu-experience.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-lossless-images.py http://127.0.0.1:8023
```

Checks capture intended WhatsApp URLs locally; they do not send orders. The
review check accepts `FD_TEST_FONT_CSS` for an optional local Tajawal font fixture.

Standalone preview files and the two guest-services entry points are retained.
Asset paths can also be assembled dynamically; a text-search miss alone is not
proof that an image or page is unused.

The lossless-image check also requires Pillow and compares the 14 active PNG
illustrations with approved revision `148ff44` in Git history. It verifies the
full RGBA data, dimensions, metadata and Chromium-rendered pixels. Compression
keeps the original PNG paths; update the comparison revision deliberately if
the user later approves different source artwork.

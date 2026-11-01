# Family Day

Static Arabic site. Serve the repository root; no build or package installation is
needed to run the site:

```sh
python3 -m http.server 8023 --bind 127.0.0.1
```

## Where to edit

- `index.html`: main page markup and navigation. Public entry URLs are described
  in `share-pages.json`; `scripts/build-share-pages.py` generates their pages.
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
Update asset cache keys in the affected entry pages when publishing changes.
Keep service compatibility entry functions: navigation checks exercise them.

## Checks

Browser checks require Python Playwright and `/usr/bin/chromium`. With the local
server running:

```sh
python3 scripts/check-approved-review.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
python3 scripts/check-share-pages.py http://127.0.0.1:8023
python3 scripts/check-menu-experience.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
```

Checks capture intended WhatsApp URLs locally; they do not send orders. The
review check accepts `FD_TEST_FONT_CSS` for an optional local Tajawal font fixture.

Standalone preview files and the two guest-services entry points are retained.
Asset paths can also be assembled dynamically; a text-search miss alone is not
proof that an image or page is unused.

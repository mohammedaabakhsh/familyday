# Family Day complete independent preview

Live preview: `https://familydaystay.com/preview/`.

The original public website and every published production URL are unchanged. All implementation, route entries, data snapshots and illustrated-tour code for this experiment are inside `preview/`. Delete this folder to remove the experiment. The production UI does not link to it; its pages have `noindex,nofollow` (unlisted, not authenticated/private).

## Coverage

- Three destination entries and venue-scoped bottom navigation, with services highlighted in gold.
- All 12 cabins, the shared garden, both rest-house sections and the chalet (16 detail pages), their original galleries, approved descriptions, closed specification accordions and FAQs.
- Original bedroom-count filters, horizontal mobile cabin cards, desktop grid, cabin comparison and rest-house comparison.
- Interactive resort map based on approved `resort-map-data.js` coordinates/footprints, and 10 original cabin exploration modules plus the chalet's interactive illustration. Paired domes/Greek cabins retain their separate illustrations through query parameters. Garden Matterport remains the original external tour.
- All 11 resort service categories, all coordination/hospitality packages and photos, all six outdoor seating sessions, dining-table capacities and preparations, games, water-package distribution and cinema time slots.
- Full restaurant menu and variants/cheese selections, in-stay extras, venue-specific baskets, totals, editing/removal, customer details and WhatsApp draft preparation. Prices are recalculated from the catalog, never trusted from session storage.
- Restaurant, coordinator and general service orders remain separate, with their source phone numbers. Chalet permits only its actual water/games services; resort promotions stay resort-only. Rest-house extras are informational/contact-based; no prices or offerings were invented.
- Both video campaigns (terms, download links, email/WhatsApp and social accounts), loyalty benefits/enrollment, social/contact/map links, all FAQs and preview-specific sharing.

## Routes and isolation

An original path such as `/cabins/dome-1/` has an independent preview at `/preview/cabins/dome-1/`. The original path is not redirected or modified. Preview navigation and sharing use the prefixed paths; reloads and direct opens work on GitHub Pages using generated route entry files. Existing first-prototype hash links are handled as aliases where applicable.

All internal document links stay under `/preview/`. Deliberate external actions remain the original business integrations: WhatsApp drafts (the visitor must send), email, phone, Google Maps, social accounts, contest video downloads, loyalty enrollment, the existing reservation provider and Matterport. There is no new booking backend, automated sending, payment, analytics, confirmed-order database or invented availability.

Selections and customer-entered draft fields are stored only in browser `sessionStorage` under the new key `familyday.preview.v3`; production storage is not read or changed. No personal draft fields are put in share links.

Original image/font files are referenced without recompression. Illustrated-tour JS/CSS are snapshotted inside `visuals/assets` and receive a local theme/bridge; their source specifications and room positions are preserved. Only static assets are shared with production; no legacy website documents are embedded.

## Rebuilding

1. Serve the repository locally (`python -m http.server 8058`).
2. `python preview/build-data.py http://127.0.0.1:8058` captures current authoritative production presentation/data into `catalog.json`.
3. `python preview/build-site.py` regenerates preview route entries and illustrated-tour snapshots from local sources. It writes only `preview/`; retain `visuals/bridge.js` and `visuals/frame.css`.

`routes.json` inventories the public preview routes and source hashes; `catalog.json` records its source revision. The test evidence for this implementation is summarized in `verification.md`.

## Focused exploration layout

The revised header puts Arabic Back/destination navigation on the right. Cabin tours, chalet exploration and the resort map occupy the viewport beneath one compact title bar; the regular bottom tabs return after leaving an exploration. The resort map uses an isolated copy of the original map engine and label layout. Service directories use plain full-width rows; service/package photos remain inside details.

## Resort-only navigation trial

Only resort screens use the new five-item navigation (resort, cabins, gold services, information, map). The resort introduction sits above its photo; duplicate cabin/map shortcuts were removed from the overview. The shared garden is a card in the cabin carousel/grid, after the 12 cabins, and has its own filter alongside All, one bedroom and two bedrooms. Comparison is alongside the cabin heading. Resort contact removes repeated venue/location headings and the duplicate in-stay-services shortcut.

Resort Back links use the page hierarchy: main sections return to the resort, and the resort returns to destination selection. Cabin details retain their cabin-list/map origin; exploration retains its details/list/map origin. Switching resort bottom tabs replaces the current entry so repeated tab visits do not accumulate. Direct opens use safe in-preview parent fallbacks. Resort filters, carousel position, gallery index and scroll are saved by history entry in `familyday.preview.navigation.v5` session storage (UI state only); the other venues retain their prior visible layouts and four tabs. Usual mobile heights fit the resort overview, cabin chooser and contact page without vertical scrolling; shorter screens retain scrolling rather than making the cards too small.

Resort cabin cards place suitability beside the name and show the source bath summary only when present. Details and a compact comparison toggle share a row; a full-width exploration action stays in the same card. The shared garden uses the same visual structure with its real virtual tour and no bedroom, capacity or comparison claims.

Resort cabin details omit the price/availability CTA. The filled turquoise exploration button precedes the unchanged specifications; the services button follows specifications and cabin-specific notes, immediately before FAQ. Chalet and rest-house details retain their previous layout.

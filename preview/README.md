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

## Shared destination navigation

All destinations use the five-item navigation, with gold services in the center. The fifth destination-specific item is the resort map, chalet exploration or rest-house comparison. The resort introduction sits above its photo; duplicate cabin/map shortcuts were removed from the overview. The shared garden is a card in the cabin carousel/grid, after the matching cabins in All/one-bedroom/two-bedroom views, and has its own filter alongside All, one bedroom and two bedrooms. Comparison is alongside the cabin heading. Resort contact removes repeated venue/location headings and the duplicate in-stay-services shortcut.

Resort Back links use the page hierarchy: main sections return to the resort, and the resort returns to destination selection. Cabin details retain their cabin-list/map origin; exploration retains its details/list/map origin. Switching bottom tabs in any venue replaces the current entry so repeated tab visits do not accumulate. Direct opens use safe in-preview parent fallbacks. Filters, carousel position, gallery index, open specifications and scroll are saved by history entry in `familyday.preview.navigation.v5` session storage (UI state only). Usual mobile heights fit the resort overview, cabin chooser and contact page without vertical scrolling; shorter screens retain scrolling rather than making the cards too small.

Resort cabin cards place suitability beside the name and show the source bath summary only when present. Details and a compact comparison toggle share a row; a full-width exploration action stays in the same card. The shared garden uses the same visual structure with its real virtual tour and no bedroom, capacity or comparison claims.

Resort cabin details omit the price/availability CTA. The filled turquoise exploration button precedes the unchanged specifications; the services button follows specifications and cabin-specific notes. In the resort-only compactness trial, FAQ is reached from Information rather than repeated below every cabin/garden. Chalet and rest-house details follow the same specification/services/FAQ order without a reservation CTA. The chalet retains its source ground/upper-floor grouping, and the rest house supports Previous/Next between its two sections.

Resort chooser and unit headers omit the repeated central brand name. The chooser Back label reads “منتجع يوم العائلة”; unit Back remains contextual to the cabin list/map. The 12 cabin details include Previous/Next links after FAQ, following catalog order within the chosen bedroom filter, with the shared garden as the final unnumbered stop. A direct unit link browses all cabins. Cabin switches replace the current detail history entry, preserve the list/map origin, and start the next detail at its first photo and page top.

The resort overview restores the original 4.7/5 rating, stars and guest-review link as a compact row below the venue facts. Portrait mobile screens from 320×568 upward and normal desktop heights fit the overview without document scrolling. The rating is the approved value shown by the original source, not a live Google API feed.

Resort comparison begins without automatic selections and shows a table only after the visitor chooses at least two cabins (up to three). It includes the original bed, living-room, dining-table, bathroom, pool and special-feature facts from the catalog. Two-cabin tables fit mobile width; three-cabin tables can scroll within their own container. Source dimensions use left-to-right number isolation. Resort detail CTAs consistently say “استكشف مرافق الكوخ من الداخل” and “خدمات المنتجع”; their routes remain the same.

Cabin detail browsing controls include a compact position/filter line and the matching cabin total plus “الحديقة المشتركة” for every choice (All, one bedroom and two bedrooms). The shared garden is the actual final stop in both the carousel and detail Previous/Next sequence for each group. It never increases the cabin count: the counters display 12/4/8 cabins, then switch to the garden name. The garden-only filter remains a standalone garden view.

## Chalet and rest-house completion (venues-v17)

Both venue homes use a two-line factual introduction above the original photo, with three source-backed facts and no duplicate home shortcuts. Rest-house independent entrances and the option to book one/both sections are preserved. There is no invented review rating or illustrated tour for the rest house. Chalet exploration uses its original floor/room illustration as the focused fifth tab.

The rest house chooser uses the same card language as the resort, with suitability beside names, actual distinguishing facilities, no photo-overlay badge and a two-section carousel/grid. A full fixed-pair comparison includes beds, adult/child pool details, bathroom totals, extra-capacity fees, kitchen/equipment and the upper section's source inflatable-slide fee disclosure. The legacy `/stay/sections/?compare=1` preview alias also opens this comparison. No garden or resort-only amenities are copied to these venues.

Contact pages use the venue-specific source map, phone and socials without repeated location/service shortcuts. Chalet services remain games and water games only, with source package restrictions and a venue-specific cart. The rest house retains only its existing charcoal/BBQ WhatsApp inquiry. Repeated chalet-service shortcuts were removed from the main directory while published preview aliases still work. The missing phone in the captured chalet/stay contact FAQ answer is filled from the same venue phone.

No photos were copied or recompressed. Original production files and URLs remain unchanged while this complete preview is reviewed. Final promotion and retirement of the old implementation are separate from this preview publication.

## Resort-only compactness trial (resort-v18)

Resort inner-page headings share a compact 22px mobile/24px desktop scale; the venue overview keeps its accepted typography. The services directory reads “خدمات منتجع يوم العائلة” and uses 54px minimum plain rows with 16px titles. Repeated central resort branding is removed from inner headers; the map header also omits its duplicate visible title while Back/sharing and accessible page labeling remain. Chalet and rest-house layout/content are unchanged.

The resort Information contact page restores its original App Store, Google Play, external booking and Google write-review links, alongside venue map, phone/WhatsApp, FAQ and socials. Links are captured from the original contact markup under `source.resortContact`. Compact two-column action/app rows retain all actions without adding a repeated brand/logo block.

`resort-map-copy.json` holds source-backed editorial summaries for the map only. Capacity and bedroom counts remain in their existing fact boxes; Royal/Classic connection copy starts on its own line. The original cabin descriptions, room data, map geometry and interactive engine remain unchanged. Visual snapshot scripts/data/styles carry release-version queries so returning preview visitors receive the updated map adapter.

Link previews use the original text-only titles/descriptions from share-pages.json and share-extras.json. build-site.py writes both static metadata and share-metadata.json, which app.js uses for SPA navigation and native Share titles. Do not add og:image/twitter:image or replace the original sharing copy with UI headings. The site's visible photos remain unchanged.

Resort service routes now use the original service experience. build-services.py extracts original panels/templates from index.html, snapshots the relevant original service modules and builds preview/visuals/services/{index,guest,guide}.html. services-theme.css supplies the new palette/type scale; services-bridge.js keeps navigation/sharing in preview/, closes local dialogs with contextual Back and isolates saved selections. Source calculators and WhatsApp messages are unchanged. The main app hides its former global cart shortcut for resort pages; chalet/stay retain their current native flows. Rebuild using build-site.py; do not edit generated service snapshots directly.

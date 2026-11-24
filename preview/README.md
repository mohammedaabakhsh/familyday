# Family Day complete independent preview

Live preview: `https://familydaystay.com/preview/`.

Current resort reference: **resort-v50**. See [DESIGN_REFERENCE.md](DESIGN_REFERENCE.md) and [design-tokens.json](design-tokens.json) for the approved reusable styling, [REVIEW_REPORT.md](REVIEW_REPORT.md) for the old/new audit, and [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for preserving published URLs and protecting the existing ordering portals before the eventual cutover. No production cutover has happened.

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

The chalet and rest house keep five navigation items. The resort currently has six navigation destinations (resort-v40), right to left: المنتجع، الأكواخ، الخريطة، الخدمات، المعلومات، الموقع. Location now opens the venue’s existing Google Maps URL in a new tab, using the same link as the contact page. FAQ is reached inside Information and highlights that item. All six slots now have equal widths and spacing (resort-v39); Services follows its fourth slot naturally without forced screen centering. المعلومات is unchanged. Destination-specific navigation includes the resort map, chalet exploration and rest-house comparison. The resort introduction sits above its photo; duplicate cabin/map shortcuts were removed from the overview. The shared garden is a card in the cabin carousel/grid, after the matching cabins in All/one-bedroom/two-bedroom views, and has its own filter alongside All, one bedroom and two bedrooms. Comparison is alongside the cabin heading. Resort contact removes repeated venue/location headings and the duplicate in-stay-services shortcut.

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

Current resort service behavior (resort-v30): restaurant, dining, games, water games, cinema, hospitality, coordination and outdoor seating use native informational guides. Descriptions, prices, package contents, usage notes and original photos are retained without quantities, baskets or order forms. Restaurant/games/water/cinema/hospitality and extras link in the same window to the corresponding #service in the existing /guest-services/ portal; dining/coordination/seating link to their corresponding section under /arrangements/. Coordination/seating promise service information and contact, not a new checkout. External portals retain their original styling, behavior, URLs and data. The preview guest-services entry is an informational directory with passive extra prices; arrangements/services-guide aliases open the matching native service when a recognized hash is supplied. The source directory retains the original-flow adapter. The three offers/loyalty pages now use native layouts (resort-v32): source reward copy, numbered participation steps, collapsible conditions/criteria, original social/copy/WhatsApp/email actions, and four informational loyalty stamps with the fourth in gold. Original participation and enrollment links remain exact; there is no new portal handoff for these pages. The restaurant trial and full-width square dining photo remain unchanged. Chalet and rest-house flows are unchanged.


## Resort FAQ editorial organization (resort-v33)

`guide-copy.json` holds the presentation-only room terminology and resort FAQ organization; the captured source catalog is unchanged. Its four category keys (booking/cabins/services/rules) can be reused for the other destinations when approved. Only the resort adopts the grouped design now: 29 source questions map once each into 22 clearer entries (6 booking, 8 cabins, 4 services, 4 rules). Related subjects are merged without dropping reservation policies, fees, safety instructions or facility facts. The original missing phone in the captured resort answer is filled from the venue phone. Useful answer links stay inside the new guide.

FAQ search covers all categories and the original merged question wording, tolerates Arabic diacritics/alef variants/Arabic digits, and shows matching category headings. Clearing search restores the selected category. One answer opens at a time; category/search/open-answer state is saved by navigation entry for browser Back/reload. The FAQ heading omits repeated venue/location copy and uses the same heading scale as other resort pages.

The shared room terminology is applied to visible native text in all three destinations and to the preview-only illustrated-tour data snapshots. Two bedrooms display as غرفتان (or غرفتان للنوم in sentences); one bedroom remains غرفة واحدة. Sentence patterns are rephrased rather than producing phrases such as مع غرفتان. Original production data, external portals and text-only share metadata remain unchanged. The builder checks complete source FAQ coverage before generating the preview.


## Borderless service photos and plain inclusion lists (resort-v40)

All native resort inclusion lists omit decorative checkmarks, including dining, games, cinema, hospitality, coordination and loyalty. Source text is retained and other destinations keep their current presentation.

Resort service photos use one full available width with consistent 12px inner gutters. The original square photos stay square; 4:3 cinema/coordination photos keep their complete natural proportions. Image containers fit the image instead of enforcing a square with colored letterbox bars. No image is cropped, edited, recompressed or replaced. `guide-copy.json.serviceImageSizes` records audited intrinsic dimensions for the 43 original service image assets; packagePhotos writes matching width/height attributes to reserve the correct layout while loading. Galleries and photo enlargement retain the original files. Update that dimension inventory when replacing source service photos.


Resort service contents now use two compact items per row (resort-v41), with 8px/10px padding and the existing 13px type. Long descriptions span both columns for readability. This affects games, cinema, dining and package contents; photos, item text, prices and checkmark-free styling remain intact. Other destinations and the garden specification rows are unchanged.


## Panoramic floating-card trial (resort-v42)

Only Panoramic exploration and its selected card on the resort map load `visuals/panoramic-trial.css` and `panoramic-trial.js`. The source illustration, hotspots, leader lines, room facts, notes and navigation are retained. Exploration places the selected facility title and its facts inside one compact rounded card; map selection uses the same inset card styling, keeping the existing desktop side column. Other cabin selections keep their accepted layout.

Add `?layout=previous` to Panoramic exploration or `?cabin=10&layout=previous` to the resort map to compare the previous layout; the option carries through map/Panoramic links. Set the controller's `enabled` flag to false to restore the previous default without editing source engines or drawings. Both trial assets are injected by `build-site.py`, not the original production pages.


### Panoramic Kitchen grouping (resort-v43)

The preview-only Panoramic snapshot groups the existing dining-table fact into Kitchen, leaving eight selectable facilities and one Kitchen hotspot/leader at the original coordinates. Kitchen retains every source appliance and minibar disclosure with its existing scrolling controls. All text within the floating facility cards now uses the same light color; icon turquoise and the surrounding layout remain. `layout=previous` keeps the original nine selections and separate dining entry. The adapter is generated in `build-site.py`; do not edit the production module.


### Balanced Panoramic controls and deterministic specification arrows (resort-v44)

Dining is now the first Kitchen fact. The indoor-tub button occupies the former dining slot in the six top controls; Outdoor and Pool share the two equal bottom slots. Original hotspot coordinates and source facts remain. On larger layouts the tub uses the former dining label position and right-side leader routing. The comparison URL retains the original arrangement.

Panoramic specification arrows use immediate bounded steps rather than queuing smooth relative scrolling. Source touch scrolling, snap behavior, navigation labels, disabled boundary states and other tours remain intact; the branch is scoped to Panoramic outside `layout=previous` in the generated common snapshot.


### Swipe-like Panoramic specification arrows (resort-v45)

Replaced the immediate arrow jump with a 280ms horizontal slide. Consecutive clicks accumulate bounded destinations and reversing retargets the current slide without queuing animations. Native snap is suspended only during an arrow slide and restored afterward; pointer/touch/wheel input and resize cancel it so visitors can scroll directly. Reduced-motion preferences retain the instant move. Other tours and the original comparison layout are unchanged.


## Shared cabin explorations and map redesign trial (resort-v46)

All twelve resort cabins now use the accepted Panoramic facility-card presentation and swipe-like specification navigation. Panoramic itself retains its approved v45 implementation as the reference. `resort-tour.js`/`.css` supply the remaining nine tour modules (including separate Dome/Greek instances). Source photos, room facts, paid minibar disclosure and hotspot coordinates are unchanged. Only cabins with an existing Dining part merge that fact first into Kitchen; Dome receives no dining fact. Mobile indoor controls are arranged by their actual room positions, with balanced rows and two outdoor/pool controls below. Selected leaders leave label edges through reserved outer gutters; other mobile leaders are hidden until selected. Desktop source positions remain.

The new default map uses `resort-map-trial.js`/`.css`: measured pill labels remain inside the image, Panoramic moves below Bohemian, Rural/French/Palm share a spaced bottom-road row, selected leaders are emphasized, and source footprints remain exact. The selected summary is a rounded card for every cabin/garden with two primary facts, an optional full-width connection/access strip, and adjacent details/exploration actions. Explicit zoom/Fit controls supplement original gestures; on short phones they hide during selection to reserve room for labels.

`/preview/resort-map/?layout=before` preserves the preceding v45 map and its Panoramic card via `comparison-v45.js` and the frozen Panoramic stylesheet. `layout=before` on other explorations preserves their prior presentation. `layout=previous` retains the earlier source layout. Comparison mode stays on map/tour links. All adapters are preview-only and are injected by `build-site.py`; original production engines/data/images are untouched.


### Compact connecting-cabin summaries and lower Panoramic label (resort-v47)

Classic and Royal use a single-line compact description with their internal-door connection in parentheses. Their redundant third connection fact is hidden in the new map only, leaving the same two equal primary facts as other cabins. The source descriptions and comparison modes are unchanged. Panoramic now joins Rural, French and Palm along the bottom road instead of the left edge. If the four measured names cannot fit, the selected short-phone map uses two balanced rows; all labels stay inside the image. Physical coordinates and leader origins remain unchanged.


### Map toolbar removal (resort-v48)

Removed the added zoom-out/zoom-in/Fit group and its styling/label-obstacle logic from the new map. The original gesture and keyboard map engine remains; cabin summaries and the lower Panoramic label are retained.


### Initial map alignment (resort-v49)

The unselected overview at normal zoom now starts 12px below the map viewport's top, directly beneath the page title. It returns to that position after clearing a selection. Selected-card fitting and zoom/pan retain their prior alignment.


## Resort audit, text sharing and image readiness (resort-v50)

The 46 resort entry routes, 58 source share metadata pages and 44 original fragment aliases are audited in `audits/`. `runtime-config.json` is generated by `build-site.py` from the source route registry and media manifest. Resort sharing now sends plain text and uses a preview-only `share=text-v50` cache key; transient navigation/experiment parameters are removed. Original titles/descriptions and semantic cabin/package query values remain. `text-only-head.js` activates the same icon as the source site only after browser execution; the first-response HTML contains no active image hints. Actual WhatsApp cache/client rendering still requires a device send test.

`python preview/build-media.py` (Pillow) creates full-dimension quality-92 WebP display images and `media-manifest.json`, without modifying originals. Re-run it when source service images change, then run `build-site.py`. The first image is eager and decoded early; the directory warms service covers, and lightboxes show the ready display image before upgrading to the source original. Browser tests keep original pixels/dimensions and full-source URLs for zoom. The services directory retains its accepted markup/theme but uses `directory.html` and the small `services-directory.js`, rather than loading all order modules. Its scroll position is kept on return. Portal handoffs carry `data-service-portal` and bypass the app router, including during a future root deployment.

# Family Day published guide

The canonical implementation is under `site/`; generated public HTML stays at the original paths such as `/cabins/dome-1/`, `/services/cinema/` and `/stay/`. The domain and distributed QR destinations are unchanged. `/preview/` now contains compatibility redirects, not another application or photo tree.

## Editing and building

- `app.js`: client-side guide and navigation. `ROOT='/'` is for pages; `ASSETS='/site/'` is for files. Independent order URLs remain available; resort service actions can reuse their live controls inside an in-page order dialog.
- `style.css`, `chalet.css`, `stay.css`: approved shared and venue-specific styling.
- `catalog.json`: accommodation details, gallery URLs, campaign copy and compiled guide service content. Original photos and fonts are still shared under `/imgs/` and `/fonts/`.
- `guide-copy.json`: FAQ organization, room wording and destination-specific contact links.
- `../data/services.json`: authoritative service/restaurant catalogue. Both the established ordering portals and the guide build consume it. `build-site.py` synchronizes service content into the guide catalogue without changing accommodation/campaign data.
- `template.html`: native document shell. Edit this instead of generated route HTML.
- `structured-data.json`: the original search-engine schema graphs, deduplicated across their 42 original page destinations; the build preserves them exactly.
- `visuals/`: the approved illustrations and map modules, their isolated CSS, data and parent-navigation bridges. Their physical source coordinates remain unchanged.
- `runtime-config.json`, `media-manifest.json`, `media/`: service display images. Full originals are kept for zoom.

Run from the repository root:

```sh
python site/build-site.py
python -m http.server 8112 --bind 127.0.0.1
python scripts/check-live-cutover.py http://127.0.0.1:8112
```

The build generates canonical pages, metadata, sitemap and preview redirects. It preserves `/guest-services/`, `/chalet/guest-services/`, `/services-guide/` and `/arrangements/` as independent ordering/preparation documents. It also redirects retired order/checkout guide aliases to the corresponding service directory. Redirects preserve query parameters and hashes.

When deploying future content/code changes, bump the version in `cutover-config.json`, its asset references and the changed portal entry scripts as appropriate. Keep original share titles/descriptions and text-only image hints. Do not reintroduce the preview cache parameter into public share links.

## Completed legacy cleanup

The owner approved removing the retired interface after the live cutover. Old application code, redundant generated documents inside `site/`, unused service snapshots, retired UI tests, superseded image variants and the deployed rollback archive have been removed. `cleanup-manifest.json` records removed paths and exact hashes of the protected ordering files. Shared original photos remain wherever used by the guide, zoom, maps or the ordering portals.

The three order experiences remain `/guest-services/`, `/services-guide/` (also entered through `/arrangements/`) and `/chalet/guest-services/`. Their documents, scripts, styles, catalogue and WhatsApp message builder were not changed by cleanup. Canonical public URLs, `/preview/` redirects, `/guest-services.html` and the old service-worker unregister endpoint remain compatible. Git history and tag `pre-live-cutover-20261125` remain available for recovery; no backup copy of the old interface is deployed.

Current regression checks:

```sh
python scripts/check-live-cutover.py http://127.0.0.1:8112
python scripts/check-live-assets.py http://127.0.0.1:8112
python scripts/check-guest-services.py http://127.0.0.1:8112
python scripts/check-chalet-guest-services.py http://127.0.0.1:8112
python scripts/check-guide-source.py http://127.0.0.1:8112
```

The design references and prior audits in this folder document approved decisions. Current cleanup evidence is `audits/live-cutover-v55.json` and `audits/live-assets-v55.json`.

## Back navigation and the resort directory

The resort directory renders as native guide links from `guide-copy.json`, preserving its approved titles, descriptions, sizes and colors. It no longer mounts a nested document. The three venue overviews and the resort directory reuse their existing DOM nodes, retaining decoded hero images and restoring directory scroll. Views render without fade/slide entrance effects, and the document canvas retains the shared background.

`python scripts/check-back-navigation.py http://127.0.0.1:8112` checks the first rendered frames, exact hero-image pixels and image-node reuse while further hero requests are blocked, directory scroll, header/browser Back, and mobile/desktop/reduced-motion layouts. Evidence is `audits/back-navigation-v57.json`, `audits/directory-layout-v57.json` and `audits/live-cutover-v57.json`.

## Cross-venue review — v58

[Full review](FULL_REVIEW_20261125.md) covers all three destinations, 290 responsive page views, canonical/legacy links, image integrity, FAQ behavior, every facility/map selection, and the three protected order experiences. The only presentation fixes align the resort service heading with other internal titles and remove chalet/rest-house navigation-label overrides so all three use the approved shared scale.

Run `python scripts/check-shared-format.py http://127.0.0.1:8112` to compare headings, six navigation columns, label sizes and common detail components at five viewport sizes. Evidence is `audits/full-review-v58.json`, `audits/shared-format-v58.json` and the linked review checks.

## Resort portal refinements — v61

[Approved changes and rollback](../docs/resort-portal-refinements-v61.md) document the resort-only revision. The existing centered mobile header and service tile geometry remain; only the slight logo reduction, branch caption, selected colors, compact supplementary bill details and help card are enabled. The return link is explicitly deferred. The shared ordering code, catalogue and other portals are unchanged.

Run `python scripts/check-resort-portal-refinements.py http://127.0.0.1:8112` and the existing guest-order checks. The scoped stylesheet/helper are loaded only by `/guest-services/`; `cleanup-manifest.json` records the owner-approved exception and unchanged protected-file hashes.

### Help styling restored — v62

At the owner’s request, the help section uses its original styling again. The other accepted v61 refinements remain enabled; contact copy, numbers and links are unchanged. Current verification: `audits/resort-refinements-v62.json`.

## Arrangements ordering and matching shares — v63

[Implementation and checks](../docs/arrangements-ordering-v63.md): the independent arrangements portal now supports a coordinator draft and summary, with its original cards/contact layout, branch caption and service-specific selection colors. Public package/dining links match the native guide; all six outdoor sessions gain individual share URLs. The other two order portals remain unchanged.

### Arrangements flow simplified — v64

The owner found the separate service views and per-item WhatsApp shortcuts confusing. The portal now opens each service in a selection dialog, exposes package/session counters without expanding photos, and keeps the summary and its single teal WhatsApp action on the home page. Selected dining cells have explicit readable foreground/background colors. Canonical links, prices, coordinator, saved choices and other portals remain unchanged. See [flow details](../docs/arrangements-flow-v64.md).

### Arrangements order details — v65

Dining is limited to one configuration/quantity, including older saved drafts. Seating capacity is no longer repeated in summary/draft lines. WhatsApp drafts now group items under the same category headings as the summary. Source-backed prices and existing share URLs remain unchanged.

## Cabin exploration order and arrows — v66

[Approved placements and routing](../docs/cabin-tour-order-v66.md) implement the owner’s Dome/Pyramid/Classic swaps and room-first organization for the twelve resort cabins. Phone/tablet controls use explicit rows, while wide-screen positions remain. Arrows clear other controls and only the active arrow is visible. Source images, hotspot coordinates and facts are unchanged. Run `scripts/check-cabin-tour-order.py`; evidence is `audits/cabin-tour-order-v66.json`.

## Approved guide batch — v67

[User-approved copy and navigation](../docs/guide-batch-v67.md) add home sharing, remove repeated facts from the twelve resort cabin introductions, balance paragraph lines, align exploration wording across cards/pages/static share metadata, and reduce each venue’s bottom navigation to five equal tabs with accommodation highlighted in gold at the center. Contact keeps Maps and FAQ links. Original routes, source facts, images and the three ordering portals remain unchanged.

Checks: `scripts/check-guide-batch.py`, `scripts/check-shared-format.py`, `scripts/check-back-navigation.py`, and `scripts/check-live-cutover.py`. Evidence is stored in the corresponding v67 audits.

## Chalet and rest-house introductions — v68

[Approved wording](../docs/chalet-stay-copy-v68.md) removes repeated audience/capacity/bedroom facts from the three introductions, keeps the upper section’s extra-fee note, and balances their lines. The stay comparison has section-only column headings and a first specification row for the floor. All previous comparison values, photos, facts, names, routes and ordering portals are preserved. Verification: `audits/chalet-stay-copy-v68.json`.

## Approved mobile PDF review — v69

[Approved scope and deferred proposals](../docs/approved-mobile-review-v69.md): correct guest grammar; retain the upper home title and remove the duplicate title inside each hero; simplify cabin/garden navigation status; unify selected terminology; isolate complete pool measurements; display the cinema/games/dining photo before collapsed contents; add capacity to the stay comparison; and reuse the chalet's first detail image on its two cover entries. No new photos, recompression, font changes or desktop redesign. The ordering portals only receive the approved Instagram accessibility spelling and two source seating-capacity labels; their layout, logic, prices and links remain.

Run `scripts/check-approved-mobile-review.py` plus the existing format, Back, cabin-arrow and cutover checks. Evidence: `audits/*v69.json`; rollback: `pre-approved-pdf-batch-20261125`.

## Resort direct ordering — v71

[Scope, implementation and checks](../docs/resort-direct-orders-v71.md): each service in the main resort guide has its own selection, customer fields and direct WhatsApp action. There is no native cart, summary screen or “My orders” shortcut. A fresh same-origin view reuses the original controller and message builder; only guest identity is remembered in a separate session key. Standalone portals retain their approved order/cart flows and original session keys. Chalet/stay work is deferred.

`site/orders/service-links.json` is generated from existing routes and photo references. `native-orders.js/css` owns the host dialog; `portal-surface.js/css` scopes the direct form, original service shares and standalone display photos. `check-resort-native-orders.py` compares all nine service drafts against standalone requests, checks literal message-builder preservation, isolation, original prices/shares, cabin numbers, Back and recovery across four mobile sizes. Run the existing standalone guest, chalet, arrangements, Back and cutover checks as well. Rollback: `pre-resort-direct-orders-20261125`. The previous v70 behavior is recorded in [its historical implementation note](../docs/resort-native-orders-v70.md).

## Arrangements catalogue restoration — v73

[Implementation and checks](../docs/arrangements-browse-restore-v73.md): the standalone arrangements portal restores full-page browsing and the original closed package/session card geometry. Per-item order/share actions appear inside the original disclosures. Each order opens a small customer form and the original coordinator WhatsApp draft; identity alone is remembered. Dining retains one choice and seating retains its optional add-on. The main resort's embedded requests, original prices, photos and public share links remain. Rollback: `pre-arrangements-browse-restore-20261125`.

## Arrangements WhatsApp copy — v74

Owner-approved independent request greetings now distinguish coordination, dining setup and outdoor seating. Seating capacity appears once beside the session name on the same message line. Both standalone and native resort requests use this shared builder. Prices, recipient numbers, public shares and catalogue data are unchanged. `check-arrangement-orders.py` verifies the three greetings and all six session lines (including the optional add-on); `check-resort-native-orders.py` compares both request surfaces. Rollback: `pre-arrangements-message-copy-20261125`.

## Cinema portal move — v75

[Implementation and checks](../docs/cinema-portal-move-v75.md): the arrangements portal is ordered coordination → outdoor seating → dining → cinema. Cinema uses the same independent request design, its original services recipient, price, duration, times and canonical share URL. Its old guest-portal tile, panel and controller logic are removed; old `#cinema` entries redirect with their queries preserved. Main-site cinema orders use the new portal in place. No catalogue facts or image files are duplicated. Rollback: `pre-cinema-portal-move-20261125`.

## Cinema photo presentation — v76

Cinema's standalone section shows its photo immediately, using the same shared gallery wrapper, width, height ratio and corners as dining. Price, contents, usage instructions and independent request/share actions follow the photo. The order model, prices, recipients and links are unchanged. The cinema browser check compares the actual photo dimensions with dining on four mobile sizes. Rollback: `pre-cinema-photo-layout-20261125`.

## Service share scope — v77

[Implementation and checks](../docs/service-share-scope-v77.md): section/page/order headers share the general service URL; package/session cards retain their original item query URLs. Opening an item URL reveals its selected open card under the header. Saved positions still win on Back. `check-service-share-scope.py` round-trips all twelve item links and checks header scope, clipboard fallback and Back on three phone sizes. Original catalogue facts, prices and share metadata remain. Rollback: `pre-service-share-scope-20261126`.

## Independent package/session pages — v78

[Implementation and checks](../docs/independent-service-items-v78.md): twelve real item documents show one package/session each, with their own text-only metadata and existing photos/content/order form. Shared route helpers keep card shares consistent across the main site and portal. Old query links resolve to their item documents without losing tracking queries. The item is preselected alone in the order dialog. No price catalogue, message builder, JS bundle or photo asset is duplicated. The guide-home initialization fix was published and verified before this work; rollback `pre-independent-service-items-20261126` points to that fixed version.

## Complete-section sharing only — v79

[Implementation and checks](../docs/section-only-sharing-v79.md): the owner cancelled individual package/session sharing. Only complete service sections are shared; card-level share actions and independent item rendering/routing are removed from both interfaces. Individual WhatsApp ordering remains. Retired item documents are compatibility redirects to their complete sections and are excluded from the sitemap. No original prices, content, photos or order message formatting change. Rollback: `pre-section-only-sharing-20261126`.

## Reviewed resort cinema, coordination and dining — v80

[Owner-approved unification](../docs/resort-services-unification-v80.md) aligns card/page copy, keeps one cinema header share, gives each coordination package a direct native request and one specification per row, and makes dining select one setup before its separate request action in both surfaces. Existing public URLs, source prices/inclusions/photos, recipients and WhatsApp message assembly remain unchanged. Rollback: `pre-resort-service-unification-20261126`. Verify with `check-reviewed-resort-services.py`, the arrangements/native-order checks, share scope and cutover checks; draft links are intercepted and no messages are sent.

## Share destinations stay in their originating interface — v81

[Owner clarification](../docs/portal-share-destinations-v81.md): standalone portals share their own section URLs; the main guide and its embedded requests keep native service URLs. Only order wording is unified across surfaces. Existing section/item compatibility and text-only previews remain. Guest-portal hash links now replace an already-open different service panel. Verify with `check-portal-share-destinations.py` and `check-service-share-scope.py`. Rollback: `pre-portal-share-destinations-20261126`.

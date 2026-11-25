# Family Day published guide

The canonical implementation is under `site/`; generated public HTML stays at the original paths such as `/cabins/dome-1/`, `/services/cinema/` and `/stay/`. The domain and distributed QR destinations are unchanged. `/preview/` now contains compatibility redirects, not another application or photo tree.

## Editing and building

- `app.js`: client-side guide and navigation. `ROOT='/'` is for pages; `ASSETS='/site/'` is for files. Protected order documents always use full-page navigation.
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

# Family Day published guide

The canonical implementation is under `site/`; generated public HTML stays at the original paths such as `/cabins/dome-1/`, `/services/cinema/` and `/stay/`. The domain and distributed QR destinations are unchanged. `/preview/` now contains compatibility redirects, not another application or photo tree.

## Editing and building

- `app.js`: client-side guide and navigation. `ROOT='/'` is for pages; `ASSETS='/site/'` is for files. Protected order documents always use full-page navigation.
- `style.css`, `chalet.css`, `stay.css`: approved shared and venue-specific styling.
- `catalog.json`: accommodation details, gallery URLs, campaign copy and compiled guide service content. Original photos and fonts are still shared under `/imgs/` and `/fonts/`.
- `guide-copy.json`: FAQ organization, room wording and destination-specific contact links.
- `../data/services.json`: authoritative service/restaurant catalogue. Both the established ordering portals and the guide build consume it. `build-site.py` synchronizes service content into the guide catalogue without changing accommodation/campaign data.
- `template.html`: native document shell. Edit this instead of generated route HTML.
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

## Retained legacy code and rollback

The old root HTML and order-source code are compressed in `../rollback/legacy-interface-20261125.tar.gz`; the manifest records exact hashes. Git tag `pre-live-cutover-20261125` records the complete prior repository. Old root runtime assets remain during owner verification. They are not loaded by the new guide.

The former preview-capture builders are archived under `../rollback/preview-builders/`; do not run them against the published guide. Final removal/deduplication of unused legacy files is deferred until the owner explicitly approves deletion. Keep shared original photos/fonts and the files still used by ordering or visual modules.

The final content comparison and design references in this folder are historical review records. Current cutover evidence is `audits/live-cutover-v54.json` and `audits/cutover-source-v54.json`.

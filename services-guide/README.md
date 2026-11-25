# Services guide

`/services-guide/` retains the approved “تنسيقات وجلسات” design, section tiles and shareable anchors. `/arrangements/` remains its text-only share entry and preserves query strings and hashes.

The independent `../data/services.json` supplies coordination, dining, seating, photos, prices and usage notes. The guide no longer fetches home-page HTML or loads the old service-data script. Its small inert dining template and `js/dining-cards.js` preserve the approved table/details layout. Update the catalogue, then run `python site/build-site.py` to synchronize the native guide as well.

The arrangements order helper `guide-orders.js` uses the same independent catalogue for quantities and current totals, stores a separate session draft, and opens a text-only WhatsApp draft to the existing events coordinator (966537009217). Name and cabin are required as in the guest portal. The cake/juice add-on requires a seating selection. The original contact footer remains.

Package shares reuse the exact native public `/services/coordination/?package=…` URLs, dining uses `/services/dining-tables/`, and each session uses `/services/outdoor-seating/?session=1` through `6` on both surfaces. No images/files are passed to sharing. Existing gallery photos remain visible within the guide. Native pages remain informational; order entry links open the corresponding arrangements card.

The hash router preserves direct links, Back/Forward, home scroll position and keyboard focus. `#coordination`, `#dining`, `#seating`, legacy `#packages` and `#package-complete` remain supported. Hospitality/cinema anchors still hand off to the existing guest-order page. Gallery originals, contact destinations and share metadata remain unchanged.

Run `python scripts/check-guide-source.py http://127.0.0.1:8112` to check all three sections and independent-source updates. Failed loading offers a retry rather than stale prices.

New direct anchors `#package-1`, `#package-2`, `#package-3`, `#package-celebration`, `#package-vip` and `#session-1` through `#session-6` open their card. Run `python scripts/check-arrangement-orders.py http://127.0.0.1:8112` for quantities, exact messages, matching links, validation, current prices and draft persistence.

## Single-page selection — v64

Home tiles open a service selection dialog over the same page. Every package/session counter remains visible while its photo/details accordion is closed. Quantities update the home summary immediately; Done, close, Escape, Back and backdrop dismissal return to that summary without a second service page. Focus stays in the dialog, its footer stays visible, and the inner catalogue scrolls independently. Existing hashes still open their corresponding section/card in the dialog.

Per-item WhatsApp shortcuts were removed; the single teal submit action is in the summary. Sharing remains available on each card using the same canonical URLs. Selected dining prices use an explicit dark teal background and white foreground, avoiding the previous pale-background/white-text conflict.

Run `scripts/check-arrangement-flow.py` in addition to the existing order/source checks. Current evidence: `site/audits/arrangements-v64.json` and `site/audits/arrangements-flow-v64.json`.

## Dining limit and grouped draft — v65

Dining is a single configuration with quantity one. Selecting a new size/setup replaces the earlier choice; the summary offers deletion rather than a quantity counter. Older saved drafts with several dining configurations or larger quantities normalize to one known choice at quantity one. The seating capacity badge remains in service details, while its redundant standalone capacity line is removed from the order summary and WhatsApp draft. WhatsApp items use the same category headings as the summary. Current evidence: `site/audits/arrangements-v65.json`.

# Services guide

`/services-guide/` retains the approved “تنسيقات وجلسات” design, section tiles and shareable anchors. `/arrangements/` remains its text-only share entry and preserves query strings and hashes.

The independent `../data/services.json` supplies coordination, dining, seating, photos, prices and usage notes. The guide no longer fetches home-page HTML or loads the old service-data script. Its small inert dining template and `js/dining-cards.js` preserve the approved table/details layout. Update the catalogue, then run `python site/build-site.py` to synchronize the native guide as well.

The hash router preserves direct links, Back/Forward, home scroll position and keyboard focus. `#coordination`, `#dining`, `#seating`, legacy `#packages` and `#package-complete` remain supported. Hospitality/cinema anchors still hand off to the existing guest-order page. Gallery originals, contact destinations and share metadata remain unchanged.

Run `python scripts/check-guide-source.py http://127.0.0.1:8112` to check all three sections and independent-source updates. Failed loading offers a retry rather than stale prices.

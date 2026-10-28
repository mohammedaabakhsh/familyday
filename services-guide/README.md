# Services guide

Public page: `/services-guide/`. This is a separate customer catalogue; `/services/`
and all existing ordering screens remain the ordering flow.

## One source of content

- `index.html` remains the source for hospitality, coordination, packages, cinema,
  games, service photos, notes, restaurant hours, and static service labels.
  `guide.js` fetches that document with HTTP cache revalidation on each load and
  reads text/attributes from the service selectors. It does **not** execute the
  fetched page's scripts, insert its HTML, or load the main application in an iframe.
- `../service-data.js` owns the existing `_jalsatAllSessions`, `_maiyaAllGames`,
  `_tawilatPrices`, `_tawilatTables`, and `_menuData` variables. Both the main site
  and this guide load that file. Edit those values once for both views.
- Do not add a second copy of prices or package contents in this directory.
  Changes to source content appear in the guide on the next page load after deployment.
- Descriptive catalogue introductions and layout live here. Keep product claims
  in sync with approved site contents. Use existing service imagery where available;
  do not invent package photos or prices.
- If service IDs/classes change in `index.html`, update the selectors in `guide.js`
  and run the regression check. A source failure shows an explicit retry and a
  link to existing services instead of displaying stale prices.

Section links use stable anchors, e.g. `/services-guide/#coordination`.
Hospitality's existing page accepts `?tab=hospitality|coordination|packages`.

## Checks

Serve repository root, then run:

```
python3 scripts/check-services-guide.py http://127.0.0.1:8022
python3 scripts/check-menu-experience.py http://127.0.0.1:8022
```

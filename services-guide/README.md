# Services guide

Public page: `/services-guide/`. This is a separate customer catalogue; `/services/`
and all existing ordering screens remain unchanged. The guide is a self-contained
reading experience: only in-page anchors, no links to other service pages.

The mobile cover includes a short introduction and a five-item index:
coordination, dining tables, cinema, outdoor seating, and packages, followed by an inline resort map. Hospitality,
food, and games are deliberately excluded. Long lists expand inline.

## One source of content

- `index.html` remains the source for hospitality, coordination, packages, cinema,
  games, service photos, notes, restaurant hours, and static service labels.
  `guide.js` fetches that document with HTTP cache revalidation on each load and
  reads the selected sections’ text/attributes from the service selectors. It does **not** execute the
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
  and run the regression check. A source failure shows a clear message and a
  retry button instead of displaying stale prices or sending readers elsewhere.

Section links use stable anchors, e.g. `/services-guide/#coordination`.
Hospitality's existing page accepts `?tab=hospitality|coordination|packages`.

## Checks

Serve repository root, then run:

```
python3 scripts/check-services-guide.py http://127.0.0.1:8023
```

## Inline resort map

`../resort-map-data.js` is the shared source for the owner-approved footprint
coordinates, map image and cabin photos used by both maps. Cabin names and facts
come from `../resort-data.js`. `guide-map.js` displays these inline with zoom,
keyboard/touch selection on the map labels and a square photo with the selected
cabin’s name. There is no duplicate name list or cabin-facts panel.
Keep the administrative area excluded, and never duplicate cabin facts here.
Notes panels are intentionally omitted from the guide; the original service pages
retain their content.

## Coordination package order

The approved six packages are Rose (120), Complete Rose (350), Evening (650),
Celebration (850), VIP (1150), and Family Day Resort (1850 SAR).
Within each list, keep matching items in the same relative order: decorations,
arrival arrangements, hospitality, guest-use amenities, and recreation. Stable
`data-coordination-item` keys in the source HTML identify matching inclusions.
Do not add amenities just because they are used as examples in a design discussion.

# Services guide

`/services-guide/` is a shareable preparation catalogue titled “تنسيقات وجلسات”, with a compact introduction and service tiles inspired by `/guest-services/`.
Coordination, dining and seating use matching full-width tiles stacked vertically.
Each tile opens a full-page section in the same tab: coordination, dining or seating. The home screen shows only the introduction, tiles and contact footer. Service cards keep a visible name
and price, then a native inline disclosure for all its details. Dining shows its complete price table immediately, without a disclosure. Seating capacity appears below each session name. Package ordering
for coordination stays on `/services/hospitality/`. Hospitality and cinema are offered through `/guest-services/`, using its shared order dialog, basket and resort WhatsApp draft.
The six coordination packages have six illustrative cabin photos. Dining and each seating option keep their
actual source photo; single-image cards omit the gallery controls.
The guide's footer provides contact links. The cabin map is not included in this catalogue.

## One source of content

- `index.html` supplies package names, prices, inclusions and
  service photos. `guide.js` fetches it with cache revalidation on every load,
  reads text and attributes, and never executes the fetched scripts.
- `../service-data.js` supplies table prices and seating information/photos.
- Update shared sources once, deploy them, and reload the guide. Bump their
  script cache keys at active entry points when deploying source changes.
- If source selectors change, update `guide.js` and run the checks. Failed
  loading offers a retry instead of showing stale content.

The hash router preserves direct links, browser Back/Forward, home scroll position and keyboard focus.
The section header returns to the tiles; direct entry has a safe home fallback.
Sharing on a section copies that section link. All chapters remain visible in print/PDF.

The old `#hospitality` and `#cinema` links redirect to their guest-service ordering panels.
Stable guide anchors include `#coordination`; the old `#packages`
anchor still opens seating. `#package-complete` remains a direct link to the complete-experience package.
Usage instructions and
package usage notes are intentionally omitted from this brochure. Dining
shows the lowest shared price with “تبدأ من” and keeps every price/size visible in its
table. Seating shows capacity below the name before expanding its description; the optional add-on remains visible.
`guide-gallery.js` supplies a 4:3 inline gallery with native swipe, keyboard navigation and grouped bottom-right arrows/counter. `packagePhotos` in `guide.js` assigns illustrative
cabin photos to packages; these are labelled as cabin atmosphere and can be replaced
with dedicated service photos later. The actual dining and seating photos
continue to come from the shared sources. Print styles also support saving the
continuous brochure as a PDF from the browser.
Coordination opens with a centered category heading and short description above its photos; its category label is hidden in the navigation header. Other sections retain their short opening descriptions and navigation labels.
Section pages keep their white, navy and muted teal palette. The home tiles use soft rose, sand and sage fills. The pale blue help footer offers WhatsApp, a phone link, directions and two labelled social icons (Instagram and Snapchat) without repeating the logo.

## Checks

Serve the repository root, then run:

```sh
python3 scripts/check-guide-navigation.py http://127.0.0.1:8023
python3 scripts/check-guide-gallery.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
```

The guide check covers shared source updates, section links,
layout at four widths, image loading, sharing, error recovery, and direct anchors.

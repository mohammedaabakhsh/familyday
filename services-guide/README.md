# Services guide

`/services-guide/` is a shareable brochure, with a compact introduction and service tiles inspired by `/guest-services/`.
Coordination spans the full row above dining and seating tiles; the map uses a compact link below.
Each tile opens a full-page section in the same tab: coordination, dining, seating or the map. The home screen shows only the introduction, tiles and contact footer. Service cards keep a visible name
and price, then a native inline disclosure for all its details. Package ordering
for coordination stays on `/services/hospitality/`. Hospitality and cinema are offered through `/guest-services/`, using its shared order dialog, basket and resort WhatsApp draft.
The six coordination packages have six illustrative cabin photos. Dining and each seating option keep their
actual source photo; single-image cards omit the gallery controls.
The guide's footer provides contact links; each cabin links to its existing exploration.

## One source of content

- `index.html` supplies package names, prices, inclusions and
  service photos. `guide.js` fetches it with cache revalidation on every load,
  reads text and attributes, and never executes the fetched scripts.
- `../service-data.js` supplies table prices and seating information/photos.
- `../resort-data.js` supplies cabin names. `../resort-map-data.js` supplies
  locations, the map image and cabin photos.
- Exploration links open the main site's existing pages with `from=guide` and
  the physical cabin ID, including separate Dome and Greek units.
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
shows the lowest shared price with “تبدأ من” and keeps every price/size in its
disclosure. Seating shows capacity next to the name before expanding its description; the optional add-on remains visible.
`guide-gallery.js` supplies a 4:3 inline gallery with native swipe, keyboard navigation and grouped bottom-right arrows/counter. `packagePhotos` in `guide.js` assigns illustrative
cabin photos to packages; these are labelled as cabin atmosphere and can be replaced
with dedicated service photos later. The actual dining and seating photos
continue to come from the shared sources. Print styles also support saving the
continuous brochure as a PDF from the browser. Map selection
supports touch and keyboard, shows a square cabin photo and an exploration link,
and retains the shared garden's features. The map starts collapsed behind a preview; its contents remain visible when printing.
Chapter headings stack a centered number between fine rules, title and description.
Section pages keep their white, navy and muted teal palette. The home tiles use soft rose, sand and sage fills. The dark closing footer groups a small logo and directions with WhatsApp, a phone link and three labelled social icons.

## Checks

Serve the repository root, then run:

```sh
python3 scripts/check-guide-navigation.py http://127.0.0.1:8023
python3 scripts/check-guide-gallery.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
```

The guide check covers every map marker, shared source updates, section links,
layout at four widths, image loading, sharing, error recovery, and direct anchors.

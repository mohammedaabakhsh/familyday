# Services guide

`/services-guide/` is a shareable brochure, with a photographic cover and six icon tiles inspired by `/guest-services/`.
Each tile opens a full-page section in the same tab: hospitality, coordination,
dining, cinema, seating or the map. The home screen shows only the cover, tiles and contact footer. Service cards keep a visible name
and price, then a native inline disclosure for all its details. Package ordering
stays on `/services/hospitality/`. The three hospitality packages form a compact text-only menu without placeholder photos. Each name/price row opens its full details.
The six coordination packages have six illustrative cabin photos. Cinema, dining and each seating option keep their
actual source photo; single-image cards omit the gallery controls.
The guide's footer provides contact links; each cabin links to its existing exploration.

## One source of content

- `index.html` supplies package names, prices, inclusions, cinema information and
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

Stable anchors include `#hospitality` and `#coordination`; the old `#packages`
anchor still opens seating. `#package-complete` remains a direct link to the complete-experience package.
Cinema retains its description, duration and contents. Usage instructions and
package usage notes are intentionally omitted from this brochure. Dining
shows the lowest shared price with “تبدأ من” and keeps every price/size in its
disclosure. Seating shows capacity next to the name before expanding its description; the optional add-on remains visible.
`guide-gallery.js` supplies a 4:3 inline gallery with native swipe, keyboard navigation and grouped bottom-right arrows/counter. `packagePhotos` in `guide.js` assigns illustrative
cabin photos to packages; these are labelled as cabin atmosphere and can be replaced
with dedicated service photos later. The actual dining, cinema and seating photos
continue to come from the shared sources. Print styles also support saving the
continuous brochure as a PDF from the browser. Map selection
supports touch and keyboard, shows a square cabin photo and an exploration link,
and retains the shared garden's features. The map starts collapsed behind a preview; its contents remain visible when printing.
Chapter headings stack a centered number between fine rules, title and description.
Chapters share a restrained white, navy and muted teal palette; spacing and thin
rules distinguish sections without assigning a different color to each service. The closing
panel groups location, phone and social links in one grid.

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

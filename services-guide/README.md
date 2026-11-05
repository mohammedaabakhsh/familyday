# Services guide

`/services-guide/` is a shareable brochure, with a photographic cover, a compact index,
hospitality, coordination, dining, cinema and seating chapters, and
a compact map preview that expands inline. Every service uses the approved card: 4:3 photos, visible name
and price, then a native inline disclosure for all its details. Package ordering
stays on `/services/hospitality/`. All nine hospitality/coordination packages have
six illustrative cabin photos. Cinema, dining and each seating option keep their
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
Each chapter has a distinct colored heading and a separating margin. The closing
panel groups location, phone and social links in one grid.

## Checks

Serve the repository root, then run:

```sh
python3 scripts/check-guide-gallery.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
```

The guide check covers every map marker, shared source updates, section links,
layout at four widths, image loading, sharing, error recovery, and direct anchors.

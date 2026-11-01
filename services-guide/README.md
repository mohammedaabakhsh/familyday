# Services guide

`/services-guide/` is a shareable brochure, with the existing introduction,
expandable hospitality, coordination, dining, cinema and seating sections, and
an always-visible resort map. Package ordering stays on `/services/hospitality/`.
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
anchor still opens seating. Long package lists expand inline. Map selection
supports touch and keyboard, shows a square cabin photo and an exploration link,
and retains the shared garden's features. The map has no collapsible heading.

## Checks

Serve the repository root, then run:

```sh
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
```

The guide check covers every map marker, shared source updates, section links,
layout at four widths, image loading, sharing, error recovery, and direct anchors.

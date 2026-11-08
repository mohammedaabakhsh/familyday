# Services guide

`/services-guide/` is a shareable preparation catalogue titled “تنسيقات وجلسات”, with a compact introduction and service tiles inspired by `/guest-services/`.
Coordination, dining and seating use matching full-width tiles stacked vertically.
Each tile opens a full-page section in the same tab: coordination, dining or seating. The home screen shows only the introduction, tiles and contact footer. Service cards keep a visible name
and price, then a native inline disclosure for all its details. Dining has one expandable card per capacity. Both prices and the plain/decorated explanations remain visible while closed; inclusions appear on expansion. One shared photo and its decorated-setup caption sit above the dining cards. Seating capacity appears below each session name. Package ordering
for coordination stays on `/services/hospitality/`. Hospitality and cinema are offered through `/guest-services/`, using its shared order dialog, basket and resort WhatsApp draft.
Coordination galleries use only the shared package photos in `service-data.js`. All coordination cards show “الصور وتفاصيل الباقة”. Celebration currently has no photos; its label is kept consistent ahead of adding photos later. No cabin-photo fallback is used. Dining uses one shared source photo above its cards; each seating option keeps its source photo; single-image cards omit the gallery controls.
The guide's footer provides contact links. The cabin map is not included in this catalogue.

## One source of content

- `index.html` supplies package names, prices, inclusions and
  service photos. `guide.js` fetches it with cache revalidation on every load,
  reads text and attributes, and never executes the fetched scripts.
- `../service-data.js` supplies table prices, dining inclusions shared with the ordering page, and seating information/photos.
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
Each coordination package includes its source-backed usage note beneath its contents, when present. Dining
uses the same `dining-card-template` and `js/dining-cards.js` renderer as the main site. All five capacities show both prices. The guide removes the ordering controls; the main site selects a preparation and opens the shared WhatsApp checkout. Multiple cards can stay open for comparison. Seating shows capacity below the name before expanding its description; the optional add-on remains visible.
`guide-gallery.js` supplies a 4:3 inline gallery with native swipe, keyboard navigation and grouped bottom-right arrows/counter. `_coordinationPhotos` in `service-data.js` keeps the main site and guide galleries aligned; packages without assigned photos remain text-only. The actual dining and seating photos
continue to come from the shared sources. Print styles also support saving the
continuous brochure as a PDF from the browser.
All three sections open with centered category headings and short descriptions above their photos; their category labels are hidden in the navigation header. Footer social icons match the guest-services page.
Section pages keep their white, navy and muted teal palette. The home tiles use soft rose, sand and sage fills. The pale blue help footer follows the guest-services layout: help text, resort contact buttons, the privacy tagline, resort location and directions, and Instagram/Snapchat icons. The guest-services link remains below; there is no back-to-sections link or repeated logo.

## Checks

Sharing uses `/arrangements/`, a separate text-only HTML entry with its own canonical and Open Graph URL so the original guide's cached logo preview is not reused. Keep this entry free of image tags, favicon links, image metadata and stylesheets. Its `share-entry.js` redirects browsers to `/services-guide/` while preserving the section hash; link-preview clients that do not run JavaScript receive the title and description only. Existing messages and external preview caches cannot be changed by the site.

Serve the repository root, then run:

```sh
python3 scripts/check-dining-cards.py http://127.0.0.1:8023
python3 scripts/check-coordination-parity.py http://127.0.0.1:8023
python3 scripts/check-guide-navigation.py http://127.0.0.1:8023
python3 scripts/check-guide-gallery.py http://127.0.0.1:8023
python3 scripts/check-services-guide.py http://127.0.0.1:8023
python3 scripts/check-service-sections.py http://127.0.0.1:8023
python3 scripts/check-share-navigation.py http://127.0.0.1:8023
```

The guide check covers shared source updates, section links,
layout at four widths, image loading, sharing, error recovery, and direct anchors.

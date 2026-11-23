# Complete preview verification

Verified locally on 2026-11-23 before publication, with Chromium/Playwright. Production source files were not changed.

- 68 preview route entries loaded without JavaScript errors, missing main images, or horizontal page overflow.
- 16 accommodation/garden detail pages cover 12 resort cabins, the shared garden, both rest-house sections and the chalet. All 153 unit-gallery entries refer to existing original files. Source specifications, descriptions, contact details and photos were captured from the live repository presentation.
- 70 original FAQs retained across the resort (29), rest house (22) and chalet (19), including policies and practical information.
- Layouts checked at viewport widths 320, 390, 768 and 1440, including entry, venue pages, cabin listing/detail, garden, resort map, services, dining, coordination, restaurant, FAQs, contact and comparison.
- All selectable parts in all 10 cabin tour modules, plus all 10 chalet map hotspots, were exercised. Correct images for Dome 2 and Greek 2 were checked. The preview-specific tour bridge and theme keep document navigation inside this experiment.
- Internal links were audited across destination/listing/service/guide/guest-service/contact/campaign pages; no same-origin document link points outside `/preview/`.
- Orders exercised: water-package completeness gating and adult/child distribution, both games packages (chalet restricted to box), cinema time, dining capacity/preparation, hospitality quantities, outdoor seating quantities and cake/juice add-ons, in-stay extras, restaurant cheese additions and coordination packages.
- A mixed general-service basket was independently checked at 2027 SAR; restaurant 12 SAR; coordinator 1150 SAR; chalet games plus water 100 SAR. Message contents, selected cabin number, notes and recipient phone numbers were verified.
- Checkout required-field validation, basket persistence across navigation/reload, removal, venue isolation, recalculation after deliberately corrupted stored totals and preview-specific share URLs were checked.
- External order actions were intercepted during tests: **no actual WhatsApp message, email, reservation or order was submitted**.
- Every generated entry has a single preview canonical URL, preview Open Graph URL and `noindex,nofollow` metadata. Original production sitemap, robots, links, navigation and assets are unchanged.

Publication checks are recorded in the task response after the deployment is available.

## Layout revision after owner review

- Replaced the two-row brand header with a compact RTL header; Back is at the far right and destination navigation is grouped on the right on standard screens.
- Maps and illustrated explorations use a focused viewport with the bottom navigation hidden only for those screens. Returning restores the regular navigation. Duplicate headings inside visual documents are hidden.
- Corrected the mobile illustration grid: hiding the duplicate heading no longer shifts the stage into the automatic heading row. All ten cabin tours measured approximately 355 px image width versus 352 px in the original at the same 390 × 844 viewport; every room control was exercised.
- Restored the original resort map implementation, label placement, pan/zoom and compact selection cards inside an isolated preview visual document. Cabin details, tours, map selection restoration and shared-garden actions remain in the preview.
- Service directories use full-width text rows without thumbnail photos or decorative icon tiles. Important existing descriptions remain. Actual service/package detail photos remain available inside their pages.

## Resort-only navigation revision

- Resort overview, cabin chooser and contact page fit the usual mobile viewport heights without vertical page scrolling. Responsive checks covered 320×568, 360×740, 390×744, 390×844, 430×932, 768×1024 and 1440×900. Short screens retain scrolling to preserve usable cards. Carousel controls clear the bottom navigation.
- Resort has five tabs with services centered in gold and the map as the fifth destination. Chalet/rest-house pages retain four tabs and their prior presentations.
- The cabin carousel contains 12 cabins plus the shared garden as its last card (13 total); garden remains accessible under either bedroom filter. Comparison moved alongside the chooser heading and repeated location text/map shortcuts were removed.
- Filter and horizontal position survive header Back, browser Back and a detail-page reload. Back labels match the real source screen. Map → cabin details → Back restores the map selection. Entry → resort → cabins → cabin → Back unwinds to each correct screen without a list/detail loop. Direct unit links fall back to the cabin chooser within the preview.
- Resort contact retains map/phone/WhatsApp, FAQ and social links while removing the duplicate services shortcut and location/venue headings. WhatsApp links resolve to the source number.
- No JavaScript errors or horizontal document overflow were observed in these checks. All edits remain under `preview/`.

## Destination entry branding revision

- Entry page uses the same original `img01.webp` logo as the production contact section, enlarged through its existing transparent framing technique; no logo artwork was modified.
- The original privacy/comfort tagline appears above the unchanged destination heading, description and three cards.
- Text uses the original 2.8-second blue/white light-sweep gradient; motion was verified to advance and to stop under reduced-motion preferences.
- Entry layouts checked at 320×568, 390×744, 390×844 and 1440×900; no horizontal overflow. Both tested usual phone heights show all three cards without vertical scrolling. Existing resort five-tab navigation was checked after entry.
- Functional edits are limited to the destination-entry markup and scoped entry CSS; other generated pages only receive the cache-version update.

## Entry logo size and source correction

The usual mobile logo frame was reduced slightly from 180px to 170px. The logo now uses the repository's original 400×400 PNG from before WebP conversion, restored byte-for-byte under `preview/brand/`. No artificial upscaling, logo redesign or additional lossy compression was applied. Display was verified at 390×844 with 2× device pixel density; all three destination cards and the existing tagline remain. See `brand/README.md` for source provenance and the native-resolution limit.

## Entry visual-weight refinement

The usual mobile logo frame is now 155px (148px on small widths; 180px desktop), with the original PNG untouched. The heading is 25px on usual mobile widths. Heading and descriptive line were verified as solid white with no animation or gradient; the privacy/comfort promise is the sole animated color-sweep element. All three cards remain unchanged and no JavaScript errors were observed.

## Resort introduction copy revision

Only the resort overview removes its repeated name from the compact header. Its main heading now reads “دليلكم لمنتجع يوم العائلة”. A two-line description introduces the resort itself without repeating the numbers/pool/garden strip or giving browsing instructions. Exact two-line rendering was checked at 320×568, 390×744, 390×844 and 1440×900. Existing hero image, overlay copy, three facts and five tabs were verified unchanged, with no horizontal overflow or extra scrolling at the tested usual phone heights.

## Resort chooser card revision (20261123-resort-v11)

Verified four filters on a single row at widths 320, 390, 430 and 1440. Suitability appears beside names rather than over photos. Bath feature labels come directly from catalog raw.bath.summary (Dome 1/2, Pyramid, Panoramic); other cards have no invented feature. Details, exploration and the three-cabin comparison limit work within preview routes; the garden opens its own details and original Matterport tour. Bedroom filters return only matching cabins; All includes the 12 cabins and garden.

At 320×740, 390×744, 390×844 and 430×932 the chooser fits without document scrolling or controls behind the footer. At 390×667 scrolling remains available to keep the photo usable. Desktop retains a grid. Browser/contextual Back and reload restore the new garden filter; Back from details/exploration restores the bedroom filter and in-memory comparison selection. Chalet and rest-house cards retain their existing layout. Chromium reported no script errors.

## Resort detail and navigation revision (20261123-resort-v12)

All 12 cabin details were checked against catalog specification titles, items, notes and check-in/out values; data and spec markup are unchanged. Price/availability links are removed from these details only. The filled turquoise exploration button comes before specifications; services and FAQ come after specifications and special notes. Bottom actions are reachable above the fixed navigation.

The missing resortContact renderer from the previous card revision was restored from the accepted resort-v10 implementation. Touch checks at 320, 390 and 430 CSS pixels verify the whole information slot resolves to its contact link, actual contact content renders, and both icon/label taps work. The services tab retains its separate route and gold appearance.

Repeated resort/cabins/information/services tab changes leave browser history length unchanged. Tested arrows from cabin list to details, details to exploration and back, direct list-to-exploration, map selection to Royal details and back to the same cabin query, main sections to resort, and resort to destination selection. Direct opens and reloads retain safe parents. Filter selection is restored on return. Chalet/rest-house booking links and detail layouts remain unchanged.

All 68 preview route bodies were rendered in Chromium with script-error monitoring; no script errors or loading-error states remained. Production files are unchanged.

## Resort cabin browsing revision (20261123-resort-v13)

Verified all 12 cabin detail pages have the exact previous/next cabin names and original preview-prefixed detail paths in catalog order. The first Previous and final Next controls are inactive; garden, chalet and rest-house pages have no cabin-sequence controls. Controls follow FAQ and remain reachable above the bottom bar at 320×740, 390×844, 430×932 and 1440×1000. Long names fit without horizontal overflow.

The resort chooser header shows “منتجع يوم العائلة” only as the Back label, without a central brand repetition; cabin headers similarly omit the central brand while retaining list/map Back and sharing. The chooser label fits the narrow mobile width and the carousel screen retains its no-scroll layout.

Traversed the full 12-cabin sequence, both directions, with constant browser history length and each new detail starting at page top. App Back and browser Back return to the original filtered list, including after reload. Direct details, a nested interior exploration and a Royal map origin followed by a sibling cabin return to safe parents; map selection is preserved. Resort contact content still renders. Chromium reported no page errors. All changes remain under preview/.

## Approved resort review changes (20261123-resort-v14)

Implemented only the six reviewed decisions: restore guest reviews in the one-screen overview; complete/improve the comparison table; restrict detail Previous/Next to the chosen bedroom filter; unify the interior-exploration CTA; rename the detail services CTA to match its unchanged destination; and remove automatic comparison selections. The original rating value (4.7/5) and Google Maps review link are retained without claiming a live rating lookup.

The overview fits without horizontal or vertical document overflow at 320×568, 320×740, 375×667, 390×667/701/744/844, 430×932 and desktop 1440×900; the review link is above the bottom navigation. Compact type/spacing preserve a useful photo area.

Traversed the All, one-bedroom and two-bedroom detail sequences, including reload and nested exploration, and returned to the exact original list filter. A direct cabin link after a filtered visit browses all cabins. The per-history-entry bedroom context survives sibling replacement without altering published unit/tour URL shapes.

Comparison checks cover zero selections, one selection (second-cabin prompt), two and three selected cabins, rejecting a fourth, clearing all choices, reload with no automatic choices, and carrying explicit card selections into comparison. Verified all original comparison row concepts, the integrated Dome living room, dining availability, indoor bath, combined Royal/Classic capacity of 35, pool depth of 140 cm and the original bed specifications. Two-cabin tables fit at widths 320, 390 and 1440; three-cabin overflow remains inside its table region. Checkbox focus is retained after updates.

All 12 cabin detail specification titles/items/times remain unchanged from catalog. All 12 show the approved exploration wording and services label with the same destination routes. Chalet/rest-house booking/services wording and resort contact remain intact. Chromium reported no page errors in the interaction checks. All changed files are under preview/.

## Cabin browsing count (20261123-resort-v15)

Verified totals of 12 for All, 4 for one bedroom and 8 for two bedrooms, each followed by “+ الحديقة المشتركة”. The position line updates after Previous/Next and survives reload with the chosen filter. List Back retains the original filter. A direct Pyramid link shows position 3 of 12 and All context. Position/total lines fit at mobile widths 320 and 390, remain above the bottom navigation at full scroll, and use English digits. Garden/chalet/rest-house detail pages are unchanged. No Chromium page errors occurred.

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

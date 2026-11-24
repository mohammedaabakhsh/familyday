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

## Shared garden as an actual browsing stop (20261123-resort-v16)

Corrects the previous interpretation of “+ الحديقة المشتركة”. For All, one-bedroom and two-bedroom choices, the matching cabin cards are followed by the real shared-garden card. The carousel counts only 12/4/8 cabins; on the garden card it shows “الحديقة المشتركة” instead of a numbered 13th/5th/9th cabin.

The last cabin detail has an active Next link to the existing shared-garden detail route. The garden's Previous returns to the last cabin in the same group; its browsing position displays the garden name, never a cabin number. The per-entry filter and original list/map source survive these replacements and reload. The independent garden-only filter remains a standalone garden detail without an unrelated cabin sequence.

Verified carousel and detail transitions for all three groups, garden-card entry, reload on garden, Previous to the matching last cabin, Back to the preserved list/filter/position, and the independent garden filter. At width 320 the summary has no horizontal overflow and is reachable above the bottom bar. The chalet and rest-house views are unchanged. Chromium reported no page errors.

## Chalet and rest-house completion (20261123-venues-v17)

Extended the accepted resort design/navigation to both remaining destinations while preserving source differences: chalet single-unit details and original interactive exploration, rest-house independent two-section chooser/comparison and section Previous/Next. Removed price/availability CTAs from these details and placed venue-named services after source specifications, before FAQ.

Source checks confirm all catalog values are unchanged except adding the original chalet floor groups from the production detail DOM (6 ground-floor items, 2 upper-floor items; TV remains separate). All 43 source photo entries, all specification items/times/notes, the chalet's 15→25 guest extra-capacity rule, each stay section's 25→70 rule, 3 chalet bathrooms and 4 bathrooms per stay section are retained. The child pool belongs only to the ground-floor stay section; the upper section's volleyball/inflatable-slide fee disclosure is retained. No adult pool is invented for the chalet, and no Wi-Fi, resort activities or garden is added to the rest house.

All 68 preview route bodies rendered without script errors. Homes fit one viewport without horizontal/vertical document overflow at 320×568, 320×740, 390×667/744/844, 430×932 and desktop 1440×900. Contact actions are reachable above the footer; an additional compact adjustment at 320×568 keeps socials clear of the raised gold services icon. The rest-house chooser fits at usual mobile heights and uses two desktop columns.

Interaction checks cover repeated venue-tab switching without growing history, destination return, contextual unit/FAQ/exploration Back, retained gallery photo and open specifications across Back/reload, stay section switching without a history loop, and return to the same carousel card. Tested the fixed two-section comparison, mobile table fit and legacy compare-query alias. The original chalet frame exposes its existing markers, hides the regular footer during exploration and returns to the proper details/home source. Venue-specific contact-map URLs, FAQ counts (22 stay, 19 chalet) and corrected contact-phone display were checked.

Chalet ordering checks use only games/water services: box-only games selection, required three-game water distribution, source total of 100 ريال for one of each package, and a mocked WhatsApp draft containing the chalet location rather than a cabin number. No message was sent. The resort cart does not expose chalet orders. Rest-house service content stays limited to its existing charcoal/BBQ inquiry.

The previous resort regression checks still pass for all bedroom-filtered cabin sequences and the final unnumbered shared-garden stop, reload, carousel position and map/list origin. Production source files, public URLs and root site remain untouched. All implementation changes are under preview/.

## Resort compactness and information restoration (20261123-resort-v18)

Implemented the approved resort-only adjustments: remove repeated central header branding and the visible map title; unify inner page headings at 22px mobile/24px desktop; compact service directory rows and rename its heading; restore the original iPhone/Android/external-booking/write-review links; keep Information as the bottom-tab label; remove repeated FAQ CTAs from the 12 cabin details and garden; and simplify only map-card summaries with separate Royal/Classic connection lines.

The contact page has no horizontal/vertical document overflow at 320×568/740, 390×667/744/844 and 430×932. Its final social actions remain above the raised services icon; desktop 1440×900 was also checked. The four restored external URLs match the original markup. No external booking, app-install, review submission or message was performed. Services retain all 11 entries, original destinations and descriptions with 54px minimum row height.

All 13 map selections display the expected source-backed summary. Numeric capacity/bedroom repetition is removed from these summaries, and Royal/Classic have a deliberate newline with `white-space: pre-line`. Original fact boxes, map selection/navigation, geometry, pictures and tours remain. The map-to-details/Back flow works. Versioned script/data/style URLs prevent an older cached map adapter from masking the change.

The catalog is identical to the previous release after excluding the newly captured contact-link object. All 12 original cabin descriptions/specifications and garden facts are untouched. Chalet/rest-house detail FAQ shortcuts, heading sizing and contact layout remain as in venues-v17. All 68 preview route bodies and representative versioned chalet/Dome/Greek visual frames render without script errors. All changed files remain under preview/.

## Compact resort specification boxes (20261123-resort-v19)

Applied the approved layout to all 12 resort cabins: inside and outdoor/pool items occupy individual full-width rows; Wi-Fi and smart TV share a row, while soundbar and driver-room items each use a full row. Kitchen equipment keeps its two-column layout. These four sections use the original compact proportions (44px minimum height, 10px/12px padding, 13px text and 1.55 line height). Existing specification text, notes, times, extra notices and catalog data are unchanged. Chalet and rest-house box layouts remain unchanged.

Browser checks passed for all 12 cabins at 320×568, 390×844, 430×932 and 1440×900: exact source items/notes/times/extras, full-width inside/outdoor items, 44px kitchen boxes, paired/full-width amenities and no horizontal overflow or script errors. Checked both rest-house sections and chalet for unchanged 12px padding and 1.8 line height. Visually inspected Dome inside/outdoor and kitchen/amenities screenshots. JavaScript syntax and diff whitespace checks pass. All changed files are under preview/.

## Remove duplicate resort services action (20261124-resort-v20)

Removed the repeated services shortcut from resort cabin details. The bottom Services tab remains the access point. Checked all 13 resort detail/garden routes: no detail-action links or empty visible action spacing, cabin navigation and specifications retained, and bottom Services opens all 11 service entries. Chalet and both rest-house sections retain their existing services/FAQ actions. Browser rendering and JavaScript syntax passed without errors; changes are limited to preview/.

## Resort contact hierarchy and social icons (20261124-resort-v21)

Reordered resort Information into location, website booking with its app links, WhatsApp/phone, review, FAQ and social accounts. Available portrait height is distributed across the action groups instead of accumulated above the social row. Instagram and Snapchat use the original site's SVG artwork in centered circular links with accessible account names, retaining the exact original account destinations. Compact short-phone spacing keeps every action above the raised navigation icon.

Verified original map, booking, app, review and social URLs; FAQ opens and contextual Back returns. Layout passes at 320×568/740, 390×667/744/844, 430×932, landscape 844×390 and desktop 1440×900. Portrait phone pages fit one viewport without horizontal/vertical document overflow or overlap with the raised services icon. Spare vertical space is distributed evenly between top-level groups. Visually inspected 390px and 320px screenshots. Other two venue contact pages retain their existing layout and text-based social actions. Catalog data is unchanged; JavaScript syntax, browser errors and diff whitespace checks passed. Changes remain under preview/.

## Resort detail divider and exploration heading (20261124-resort-v22)

Removed the second divider and its redundant padding before resort cabin Previous/Next controls. The final accommodation-information section retains the same single 1px divider as the preceding sections. Garden and rest-house navigation retain their existing dividers.

Moved each resort exploration title out of the header into a centered heading directly above the room controls, using the correct source cabin name including Dome 2 and Greek 2. Removed only the extra mobile top inset above those controls. The compact Back/share header, original diagram geometry, room controls, detail cards and navigation remain. Chalet exploration retains its existing heading placement.

Checked all 12 cabin details for one final divider. All 12 explorations pass source-specific title, centered position, original drawing width/height and interactive room-selection checks at 390×844. Dome 2, Greek 1 and Panoramic also pass at 320×568, 430×932 and desktop 1440×900. Confirmed exploration-to-details contextual Back, unchanged chalet heading and rest-house navigation divider, exact catalog preservation, JavaScript syntax and no browser errors. Visually inspected Dome 2 and Greek 2. Changes are confined to preview/.

## Unified resort exploration headings and backgrounds (20261124-resort-v23)

Reduced all resort exploration titles to an actual computed 14px and applied the same centered heading above the resort map. The heading selector explicitly overrides the general resort h1 rule. Back/share remain in the compact top bar. Resort visual documents now have a scoped root class and transparent canvases, including the map dialog/backdrop; their iframes expose the parent page's existing background. Chalet visuals retain their prior styling.

Checked all 12 tours for correct small titles, centered alignment, unchanged original drawing dimensions and working room selection. Map heading/background and all 13 location selections pass at 320×568, 390×844, 430×932 and 1440×900 without document overflow. The map image footprint at 390px is unchanged. Pixel comparisons at empty iframe edges match the underlying parent background exactly, confirming no separate canvas color remains. Visually inspected Classic and map screenshots. Contextual exploration Back works, catalog data is unchanged, and chalet heading/background are unchanged. JavaScript syntax, diff whitespace and browser error checks pass. All changes remain under preview/.

## Resort title sizing and alignment (20261124-resort-v24)

Reduced the resort guide heading from 26px to 22px on regular phones (21px on shorter screens), and the resort name over the hero photo from 30px to 26px (24px on shorter screens). Desktop guide/hero headings are 26px/36px. Inner resort page headings share 20px mobile and 22px desktop sizing. Standard resort pages now start 12px below the 64px header; page-heading margins are reset and the heading precedes any existing location eyebrow visually, retaining all content. Services and Contact have matching title bounds on phones. Exploration/map titles retain their accepted 14px size.

Browser checks passed at 320×568/740, 390×667/744/844, 430×932 and 1440×900. Resort home fits one viewport and preserves its facts/rating. Services, Contact, cabin chooser, FAQ, comparison and games headings share the same computed size and 76px top position; mobile Services/Contact also share identical horizontal bounds. Contact socials remain above the raised navigation icon and portrait contact pages retain one-viewport fit. Visually inspected home, Services and Contact. Chalet/rest-house guide, hero, contact and services title sizes are unchanged. Catalog is unchanged; syntax, browser errors and diff checks pass. Only preview/ changes are included.

## Restore original text-only link sharing (20261124-resort-v25)

Removed per-accommodation Open Graph images from the preview builder. All 68 public preview routes now include a complete text-only metadata set (description, Open Graph and Twitter summary) with no image/thumbnail tags and the preview's existing noindex plus max-image-preview:none directives. The 58 routes with original counterparts use the exact titles/descriptions from share-pages.json/share-extras.json; preview-only routes use their existing interface labels. Live original Pyramid and cabin-chooser metadata were checked before implementation.

The builder generates share-metadata.json from those same sources. Client-side navigation updates browser/head metadata, and native Share uses the destination's original title instead of an interface heading with a preview suffix. Existing preview route paths are preserved. Sharing retains meaningful cabin/package selectors while removing sender-return/cache context. A copied link remains within preview/. Original pages, photographs and visible content are unchanged.

Verified metadata on every generated route against the source and confirmed no image tags, duplicate fields or stray preview suffixes. Rebuilding is byte-for-byte stable. All 68 route bodies load without script errors and expose the expected dynamic metadata. Mocked native Share and clipboard checks pass for Pyramid, cabin chooser and Dome 2, including in-app navigation. No message was sent. WhatsApp's own previously cached previews cannot be retroactively changed by page metadata.

## Original resort service experience in the preview shell (20261124-resort-v26)

Restored the original resort service directory and every original service screen instead of the preview's rewritten shared-cart flow. build-services.py extracts the original service panels/templates and snapshots their source CSS/JS, including restaurant categories and extras, menu review, water distribution, explicit games selection, cinema timing, dining price table, seating quantities/add-ons, hospitality/coordination disclosures and galleries, and original promotions. The independent guest-services and occasion-guide pages are also copied and themed. No order action is invented for the original information-only hospitality panel.

services-theme.css changes colors and typography; services-bridge.js adapts only preview navigation, local dialog Back and session restoration. The original service calculators, validation, cabin numbers, menu message builder and WhatsApp destinations are reused. The global resort cart shortcut is disabled on all resort pages; original restaurant/seating/guest order bars exist only within their service. Old preview cart/checkout URLs remain valid and open the source service directory. Chalet/rest-house screens retain their native implementations. Canonical/public original URLs are untouched; same-origin anchors and coordination sharing point into preview/, including context-menu opens. Snapshot storage is namespaced away from the public site's data.

Browser flow checks passed for restaurant categories, quantity/cheese extras, local review, personal-field restoration after reload, exact original WhatsApp message and restaurant number, both game packages, required 3-game water distribution, cinema time/price, dining table option/price, seating/cake totals, original package counts/galleries, directory navigation, and absence of a floating request on the resort home. All outgoing WhatsApp calls were mocked; no message was sent. Guest hydration/editor, guide section Back, package deep links/sharing and retired cart aliases were checked. All 68 parent routes render with text-only sharing metadata and no browser errors.

Layout checks cover all 14 service/directory/guest/guide pages at 320×568, 390×844 and 1440×900: no horizontal overflow, parent shell fits the viewport and service content scrolls locally. All six restaurant categories, including BBQ rendering, were checked. Visually inspected restaurant, directory, games, guest services and coordination. Rebuilding is deterministic. The source catalog, original production files and source photos are unchanged; source file hashes include index.html/app-shell plus copied modules. All changes are under preview/.

## Restaurant guide with existing order-page handoff (20261124-resort-v27)

Changed only the resort restaurant entry in the new preview into an informational guide. It shows the source introduction, original opening hours and six menu categories, followed by a single “عرض المنيو والطلب” link. It contains no menu quantity controls, order form, cart or embedded ordering screen. The link intentionally opens the existing published guest-services page at #restaurant in the same window, preserving that page's original design. Other resort services retain v26's original flows.

Verified at 320×568, 390×667/844, 430×932 and 1440×900: one viewport, no horizontal overflow, and CTA clear of the raised footer icon. Clicked through to the actual original guest-services page and confirmed its restaurant editor opens directly; browser Back returns to the new guide. Checked directory-to-restaurant navigation and the unaffected games, water and outdoor-seating screens. No order was placed or message sent. Original external files, source catalog and text-only sharing copy are unchanged. JavaScript/browser error and diff checks pass; all changed files are under preview/.

## Dining information and external service handoff (20261124-resort-v28)

Converted only the resort dining entry to an informational guide following the restaurant trial. The page explains basic versus arranged preparation and shows all five source price rows (6, 12, 18, 24 and 32 people) in a passive, accessible table. No prices are clickable and no quantities/cart/order form appear. A disclosure preserves the original photo, caption and six arranged-setting inclusions. The final “عرض الخدمة والتواصل” button opens the existing /arrangements/#dining entry in the same window; its original redirect leads directly to the dining section of the external guide, including its existing coordinator contact. External pages/styles were not modified.

Verified all ten price values against the unchanged catalog, all original inclusions/image, no horizontal overflow at 320×568, 390×667/844, 430×932 and 1440×900, and no cart shortcut. Regular portrait/desktop views fit one viewport; smaller screens scroll vertically with readable table text. Clicked through to the actual original dining section and tested browser Back. Directory navigation, the restaurant guide/link and other original resort service flows remain functional. No order or request was sent. Browser/syntax/diff checks passed. Changes remain under preview/ and source metadata/catalog/public files are unchanged.

## Square dining photo (20261124-resort-v29)

Changed only the dining disclosure photo container to full available width and a 1:1 aspect ratio. The unchanged original 2400×2400 photo remains contained without cropping. Browser/visual checks confirm square full-width rendering at 320px (266×266), 390px (320×320) and desktop 1440px (690×690), with all six inclusions and no horizontal overflow. Photo location, caption, disclosure, price table and external link are unchanged.


## All resort services as informational guides (20261124-resort-v30)

Extended the accepted restaurant/dining approach to games, water games, cinema, hospitality, coordination and outdoor seating. Source descriptions, all package/session prices and inclusions, galleries, and original usage notes remain available. New resort pages contain no quantity controls, selections, forms, order totals or cart shortcut. Requests open the original guest-services portal at the exact restaurant/games/water/cinema/hospitality/extras section. Dining, coordination and seating open their original arrangements section for information/contact. Original external documents, scripts, styling, catalog and sharing metadata were not modified. The preview guest-services aliases are also informational, including the five original extras/prices; recognized guide/guest hash aliases open the matching native service. Promotion screens retain their existing informational source implementation.

Browser checks at 320×568, 390×844 and 1440×900 verified all eight service guides: source prices, every package inclusion/note/photo, no internal ordering controls, accessible final links above the footer after scrolling, and no horizontal overflow with details open or closed. Checked the accepted square dining photo, coordination VIP deep link, gallery and shared package URL, directory navigation into all eight guides, auxiliary directory aliases, and unchanged chalet/stay flows. Visually inspected mobile guides. Clicked all nine handoff buttons through to the actual original external portals and confirmed each correct editor/section plus browser Back to the new guide; no orders or messages were sent. Syntax/browser/diff checks passed. All edits remain under preview/.


## Outdoor seating capacity labels (20261124-resort-v31)

Removed the leading middle dot from all six preview outdoor seating capacity labels and colored the standalone labels with the existing turquoise token. Browser checks at 320×568, 390×844 and 1440×900 confirm exact source capacity text, computed turquoise color, unchanged source prices/external link and no horizontal overflow. Original portals and other service layouts are unchanged.


## Native offers and loyalty pages (20261124-resort-v32)

Restyled only the three resort offer/privilege pages: contest, share-and-win and loyalty. Each now uses the native guide shell, matching the service heading sizes, surfaces, typography and spacing. Both contests show the original reward and participation steps, with expandable source conditions/selection criteria; the original contest social accounts retain visit/copy actions. The original Drive, WhatsApp participation draft, email draft and loyalty enrollment URLs are unchanged. Email copying is retained. Loyalty shows four informational reservation slots with only the free fourth slot in gold; no progress or earned status is invented. No external service-portal handoff was added.

Compared every original paragraph, heading and list item in the three production panels with the new DOM, including collapsed content, and compared every outgoing link exactly. Browser checks at 320×568, 390×844, 430×932 and 1440×900 confirm no horizontal overflow, working disclosures and final actions clear of the fixed footer after scrolling. Verified four loyalty slots and gold reward, copied all three social handles/email using a mocked clipboard, and checked directory navigation/contextual Back for all three. Visually inspected the mobile layouts. No message/email/order was sent and enrollment was not submitted. Syntax/browser/diff checks passed; original files, catalog, sharing metadata and both service portals are unchanged. All changes remain under preview/.


## Grouped resort FAQ and room terminology (20261124-resort-v33)

Reorganized only the resort FAQ into four compact categories: booking, cabins, services and instructions. The editorial mapping preserves all 29 original source questions exactly once across 22 displayed entries (6/8/4/4). Merged booking/pricing, location/contact, cabin selection/features, guest capacity/sleeping capacity, outdoor/pool privacy, and kitchen/BBQ/minibar subjects. Paragraphs retain the original restrictions, paid extras, all kitchen equipment, 35-person connected-cabin capacity, pool depth and safety responsibilities. The resort contact answer now includes the venue's actual 0556156693 number. Heading duplication is removed. One answer opens at a time; open questions use the existing turquoise. Category switches do not add browser history entries.

Search works across all four categories, including original source question wording, answers, Arabic diacritics/alef variants and Arabic digits, with category headings, result count, no-result and clear states. It restores the selected category after clearing. Browser Back/reload retains category, query and open answer. Useful links lead into the appropriate native guide pages. Other destinations retain their FAQ layouts/content organization; only the authorized two-bedroom wording is standardized across all visible native pages and preview-only tour data. Source catalog, original files/portals and share metadata were not modified.

Browser checks at 320×568, 390×844, 430×932 and 1440×900 covered all categories, one-open behavior/turquoise, search and no-result/clear states, Arabic query variants, important policy/capacity/fee facts, phone, answer links and state restoration. Default closed categories each fit one viewport at 390×844. Keyboard Enter toggles native answers. All 68 native routes load without browser errors and show no legacy two-bedroom spelling in visible content. Checked chalet/stay FAQ question counts and layout isolation plus the resort tour's visible room wording. Mobile views were visually inspected. Builder/source coverage, syntax and diff checks pass; all changes remain under preview/.


## Shared-garden card and facility rows (20261124-resort-v34)

The garden card now explicitly reads ألعاب أطفال وشاشة عرض مشتركة. In garden details, the same four original facility facts render as full-width compact specification rows with no check icons or list markers, matching the cabin row dimensions/spacing. Source facilities/photos/tour and other cabin layouts remain unchanged. Browser checks at 320×568, 390×844 and 1440×900 verify exact card copy, all four source facts, stacked full-width rows, no icons/markers or horizontal overflow, intact garden tour URL and unaffected cabin specifications. All edits remain under preview/.


## Consistent resort Back label and garden fact icons (20261124-resort-v35)

The resort cabin chooser now labels its Back link المنتجع, matching the services, contact and map sections. Existing contextual rules remain: cabin details return to الأكواخ or الخريطة according to origin, service details to خدمات المنتجع, and the resort home to الوجهات. Other destinations' labels are unchanged. Added the existing location-pin and guests icons above the garden's الموقع/وسط الأكواخ and الاستخدام/لجميع الضيوف facts, reusing cabin fact icon size/color/layout. The four facility rows remain icon-free.

Browser checks verified the text, accessible label, href and actual destination for seven resort Back routes. Clicking the actual map details button and Back restores the selected map cabin with الخريطة as the label. At 320×568, 390×844 and 1440×900, both garden fact icons are turquoise and above their labels, all source text and the four icon-free facility rows remain intact, and there is no horizontal overflow. Source catalog, editorial copy, share metadata and original files/portals are unchanged. Syntax/diff checks pass; changes remain under preview/.


## Resort-only six-item navigation trial (20261124-resort-v36)

Added one standalone الأسئلة item in the resort bottom bar, between المعلومات and الخريطة. المعلومات keeps its existing label, icon, page and FAQ shortcut. The new question-bubble icon opens the existing resort FAQ; FAQ and information each highlight their own item. The bar keeps its original height, colors, typography and 54px raised gold service circle. Six equal columns are used normally; below 375px the service column keeps its 54px width so the circle stays within its horizontal hit area. The experiment is confined to the resort; chalet/stay keep five items and focused maps/tours still hide the bar.

Browser checks at 320×568, 360×740, 375×812, 390×844, 430×932 and 1440×900 verified six items in one row, unchanged information label, bar height and service circle, label bounds, 44px minimum click targets and correct hit testing. Checked independent FAQ/information navigation/highlights, the retained information-page shortcut, unchanged other destinations and focused views, and no horizontal overflow/browser errors. Visually inspected 320px and 390px screenshots. Source data, editorial copy, share metadata and original portals remain unchanged; all changes are under preview/.


## Seven-slot resort navigation visual trial (20261124-resort-v37)

Added الموقع with the existing location-pin icon at the far right of the resort bar, before المنتجع and الأكواخ. It is a full-opacity disabled button used only to preview the layout: it has no href, handler, page, content or external map action. Six existing destinations remain functional and unchanged, including المعلومات. The services button is now fourth of seven, with three slots on each side. Symmetric side widths keep its 54px circle centered exactly over the bar/screen; on narrow screens المعلومات receives additional room within its side without changing the total side width or font sizes. Bar height, colors and service-circle dimensions are unchanged.

Browser checks at 320×568, 360×740, 375×812, 390×844, 430×932 and 1440×900 verify all seven labels fit, no horizontal overflow, exact service-circle center/size, the unchanged 72px bar height and location's inactive behavior with no navigation/history change. Checked existing service/FAQ/information actions and highlights, unchanged five-item chalet/stay bars, and the focused map's hidden bar. Visually inspected 320px and 390px screenshots. No location page/content was added; original sources, data and share copy are unchanged. All edits remain under preview/.


## Six-item resort navigation in the requested order (20261124-resort-v38)

Removed the standalone FAQ slot; its existing page and Information-page shortcut remain intact. Resort FAQ once again highlights المعلومات. The exact right-to-left bar order is المنتجع، الأكواخ، الخريطة، الخدمات، المعلومات، الموقع. Location remains the same disabled visual-only placeholder, with no page, content or action. The seven-column trial rules are retired. The six-item layout balances three columns on the right against two wider columns on the left so Services stays centered (within 2px including the existing inter-item gaps), keeping the original 54px circle, 72px bar, colors and typography.

Browser checks at 320×568, 360×740, 375×812, 390×844, 430×932 and 1440×900 verified exact DOM/visual order, fitting labels, preserved dimensions, no horizontal overflow and no standalone FAQ link. Followed Information → FAQ and confirmed all 22 entries and Information highlighting. Checked existing services, map and cabin navigation, focused-map hiding and unchanged five-item chalet/stay bars. Visually inspected 320px and 390px views. Source data, FAQ content, original portals and share metadata are unchanged. All changes remain under preview/.


## Equal-width resort navigation (20261124-resort-v39)

Replaced the asymmetric side widths with six equal columns at every viewport, as requested. The order remains المنتجع، الأكواخ، الخريطة، الخدمات، المعلومات، الموقع. Services stays centered within its own fourth slot and naturally sits to the left of the screen center; its existing raised 54px gold circle and the 72px bar are unchanged. No label, icon, route, FAQ shortcut or location-placeholder behavior changed.

Browser checks at 320×568, 360×740, 375×812, 390×844, 430×932 and 1440×900 verified all six slot widths and center-to-center gaps are equal within subpixel rounding, all labels fit, there is no horizontal overflow, and the original bar/circle dimensions are retained. Checked Information → FAQ and Services navigation. Original sources, data, editorial/share copy and other destinations are unchanged; all edits remain under preview/.


## Activated location link and clean resort service photos/lists (20261124-resort-v40)

Activated the location navigation slot as a real anchor to the resort’s existing Google Maps URL, with the same new-tab behavior as its contact-page map link. The six equal-width slots, labels and order are retained. Removed decorative checkmarks from every native resort inclusion list, including package contents, dining, games, cinema, hospitality and loyalty; chalet/stay and the existing external portals retain their presentation.

Audited all 43 original service images: 35 at 1448×1086, 6 at 1200×1200 and 2 at 2400×2400. Service photos now share the same full width and 12px inner gutters. Their buttons fit the complete original aspect ratio with transparent backgrounds, no border/shadow/padding and no colored letterbox area. Dining/games/seating remain square; cinema/coordination retain their 4:3 image. Source image files are unchanged. Added intrinsic dimensions to the editorial metadata so image layout is reserved before loading. Existing FAQ/editorial entries are unchanged.

Browser checks at 320×568, 390×844, 430×932 and 1440×900 verified every rendered service photo’s ratio, full/common width, exact wrapper/image dimensions, transparent unframed styling, original intrinsic dimensions and no horizontal overflow. At mobile widths, all originals cover the rendered image width at 3× device pixel density. Verified every original inclusion/usage note/package price, no checkmarks across all eleven native service screens, and unchanged external handoff destinations. Tested gallery scrolling and enlargement using the original photo URL. The location anchor opens the exact existing map URL in a new tab with the external response stubbed; no request/order/message was submitted. Original production files, portals, source catalog, photo files and share metadata remain unchanged. Syntax/diff checks pass and edits remain under preview/.


## Compact paired service-content rows (20261124-resort-v41)

Resort service inclusion cards now place two items per row and use smaller 8px/10px padding, retaining the 13px font. Long descriptions over 40 characters span the full row. Games show six items in three rows; cinema shows four in two rows. Dining and hospitality/coordination package contents use the same treatment. Source text, image presentation, prices and the absence of checkmarks are preserved.

Browser checks at 320×568, 390×844, 430×932 and 1440×900 verified two-column layout, paired row positions, full-width long items, unchanged source item text and no text/horizontal overflow. Visually inspected games/cinema rows. Chalet inclusion styling remains unchanged. Source data, photos, editorial/share copy and original portals were not modified; all edits remain under preview/.


## Reversible Panoramic floating-card trial (20261124-resort-v42)

Introduced a scoped presentation layer for Panoramic exploration and cabin ID 10 on the interactive resort map. The exploration card shows the existing selected-facility title above its source facts. Single facts use a compact horizontal icon/value row; multiple facts and the original scroll controls/notes remain accessible. The map card has inset rounded edges, the same palette and its original facts, dismissal, details and exploration actions. Mobile retains the bottom card; desktop retains the source side column. Other cabins and illustrations keep their previous presentation. `layout=previous` restores the original layout and persists through map/Panoramic links; the controller also has a one-flag default rollback.

Browser checks at 320×568, 390×844, 768×1024 and 1440×900 compared all nine facility selections against a pre-change capture: exact fact/notes text, selected label/point/leader, unchanged drawing bounds, no added horizontal overflow or document scrolling. Verified map facts, Panoramic-only scope, switching to Classic and back, clearing selection, details/exploration links and contextual Back, previous-layout continuity, and absence of trial assets on Classic exploration. Mobile/desktop map keyboard zoom and Fit reset also passed; both final layouts were visually inspected. No browser errors. The existing short-screen tour scrolling at 320×568 is unchanged. Original production engines/styles, catalog, editorial/share metadata and photos are untouched; all changes remain under preview/.


## Panoramic Kitchen grouping and consistent detail text (20261124-resort-v43)

Removed the standalone dining-table button/hotspot/leader from the default Panoramic exploration and placed its original icon/fact at the end of Kitchen details. The kitchen's source equipment and minibar contents/fee stay intact and accessible with the existing strip/arrow controls. All text inside its floating facility cards, including nested soundbar and bathroom descriptions, uses #f1f7f8; nested value lines inherit their value typography. Icons retain turquoise. Only the preview Panoramic snapshot receives the source adapter; `layout=previous` still shows the original nine facilities and separate dining entry.

Browser checks at 320×568, 390×844, 768×1024 and 1440×900 covered all eight facilities, exact source fact/note preservation plus dining under Kitchen, one selected point/leader, uniform computed text color, no horizontal document overflow, scrolling all the way to the dining card, and the original comparison layout. Visually inspected Kitchen and Living on mobile. Classic exploration remains unaffected. No browser errors. Builder, JavaScript syntax and diff checks pass. Original production code, source catalog, editorial/share data and photos are unchanged; edits remain under preview/.


## Panoramic ordering, balanced controls and reliable arrows (20261124-resort-v44)

Moved the original dining-table fact to the first position in Kitchen. Indoor Tub now replaces the former dining button in the top group (six controls), leaving Outdoor and Pool in two equal-width bottom slots. Its hotspot retains the exact original illustration coordinates; desktop label/leader placement follows the former dining position. The old-layout comparison preserves the original nine controls and facts.

Panoramic-only arrow handling now calculates a bounded absolute destination and moves immediately, avoiding competing smooth animations during repeated/reversed clicks. The original scrollbar, touch/manual scrolling, scroll snapping, arrow labels and boundary disabled states are retained. Original production code is unchanged; the common snapshot adapter checks both the Panoramic root ID and comparison query before applying the behavior.

At 320×568, 390×844, 768×1024 and 1440×900, checked all eight facilities against pre-change fact/note captures (Kitchen adds dining first), uniform text color, one selected point/leader, no horizontal overflow, six top/two bottom controls, old-layout isolation and unchanged Classic exploration. Separate tests with normal motion verified next/previous sequences, synchronous rapid clicks and immediate reversal, both disabled boundaries, manual scrolling followed by keyboard activation, and selection of the relocated tub. Visually inspected mobile/desktop controls. No browser errors. Build, JavaScript syntax and diff checks pass; source data, photos and original files remain unchanged.


## Visible swipe-like specification motion (20261124-resort-v45)

Panoramic arrow clicks now animate the existing specification strip over 280ms with a smooth easing curve. Repeated clicks accumulate bounded targets; changing direction retargets the same animation from its current visible position. No queued browser smooth-scroll operations are used. Native snapping is temporarily suspended during animation and restored on completion or interruption. Pointer, touch and wheel input cancel the arrow motion without blocking native gestures; resize or replacing the selected facility also cancels safely. Visitors requesting reduced motion keep the immediate step. Original arrow labels and disabled boundary states remain.

Browser sampling at 320×568 and 390×844 confirmed multiple intermediate positions, monotonic one-step movement, rapid three-click accumulation and immediate reversal, both disabled endpoints, keyboard activation, interruption, facility switching and resize cleanup. A trusted Chromium mobile touch gesture interrupted an in-progress arrow slide, scrolled the strip naturally, then returned using the arrow. Desktop Kitchen already fits all its facts without scrolling and keeps its hidden arrows. Reduced-motion behavior and absence of the controller on previous-layout/Classic exploration were verified; no browser errors. The existing four-viewport facility/source-fact checks also pass, retaining eight controls, dining first in Kitchen, the relocated tub and uniform text. All edits remain under preview/; original production modules, photos, catalog and editorial/share data are unchanged.

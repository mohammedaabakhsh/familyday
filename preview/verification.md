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

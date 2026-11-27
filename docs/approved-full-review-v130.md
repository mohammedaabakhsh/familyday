# Approved full review batch — v130

The full-site audit was discussed as thirteen questions, one at a time. The owner approved this batch for the main guide and its standalone portals. External booking pages were comparison references only and are outside the edit scope.

## Approved changes

- Use the current Snapchat account `familyday.ksa` in contact/footer links, shared structured metadata, and the competition's displayed/copyable username. The new URL resolves to that account.
- Match interactive room labels (`الحمام`, `الصالة الداخلية`), retaining plural bathrooms and the Dome's integrated living/bedroom description.
- Display check-in at 4 pm and check-out at noon in two paragraphs in all three FAQ guides. Refine merged-answer grammar, singular chalet-pool wording, punctuation and paragraph breaks without changing facts, capacity, policies, payment methods or phone numbers.
- Use `طاولة الطعام تجمعكم في المساحة الخارجية الخاصة بالكوخ` for both dining page introductions and existing share descriptions. The arrangements portal consumes the same maintained copy as the native guide, with refreshed data/script cache keys.
- Remove the redundant small chalet name above its detail heading. Add the living room's pool view/direct pool-area door, the playroom's pool view, and each published TV location to their matching chalet specification sections. Remove the old unspecified TV row to avoid repeating it.
- Extend comparison-link and catalogue-carousel touch areas to 44 px with transparent pseudo-elements. Visible 34 px arrow circles and existing text sizes/layout remain unchanged; actual clicks outside the visible boundaries were verified.

## Preserved decisions

|Question|Decision|
|---|---|
|1|Our native/standalone inflatable-slide price remains 450 riyals; no external booking edits|
|2|Cinema stays at 3 hours without adding the booking platform's fixed slots|
|3|Approve Snapchat identity update|
|4|Keep our existing outdoor-session names|
|5|Do not add directions links to guest-service portal footers|
|6|Keep capacity in outdoor-session titles and the separate capacity line|
|7–13|Approve room labels, FAQ time layout/copy, dining introduction, chalet heading/specifications and larger touch areas|

Service prices/recipients, catalogue selections, invoice/request flows, WhatsApp message builders, share destinations, maps, photos, fonts and approved portal spacing are preserved. No new prepared-message notice is added above order submission.

## Validation

- `scripts/check-live-cutover.py`:82 canonical routes,82 preview aliases,44 legacy hashes,153 accommodation photos, unit facts, internal links, protected portals and structured metadata passed.
- `scripts/check-main-guest-parity.py`:main/source order drafts and recipient parity, independent shares, static service photos and visit privacy passed at 390 px and 320 px.
- Focused browser audit at 320×568, 390×844, 768×1024 and 1440×900:52 FAQ answers; all three FAQ time layouts/search; both dining introductions; correct chalet sections; changed tour labels;14 actual enlarged-area touch checks; current Snapchat links across three contacts/four portals; and copied competition username. No messages were sent.
- Reviewed the expanded chalet specifications at 390 px and the longer Dome living-room label at 320 px.

Evidence: `site/audits/approved-full-review-v130.json`, `site/audits/live-cutover-v130.json`, and `site/audits/main-guest-parity-v114.json`.

Version: `20261127-approved-review-v130`. Rollback reference: `pre-approved-review-20261127` (previous approved site at 5c2ee5d9).

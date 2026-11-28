# Final PDF decisions — approved batch v134

Baseline: `f379a3c4cc5d0a085ccb2a72afb8040e58702cc0` (Royal example v133).
Release: `20261128-approved-pdf-v134`.
Rollback reference: `pre-final-pdf-approved-20261128`.

The owner completed25questions from the12-page final PDF. Apply the13approved changes below. The owner explicitly excludes redesigns for old/very narrow phones and desktop spacing; the small visible refinements target current phone widths, preserving existing typography elsewhere. No external booking platform changes or real WhatsApp messages are involved.

| Question | Approved result |
| --- | --- |
|1| Extend the reviewed Royal measurement style across detail pages, FAQs, comparisons and illustrated maps/tours. Keep every dimension and depth unchanged |
|2| Rest-house destination card: `للتجمعات الكبيرة` |
|4| Give the three rest-house home facts natural column widths on current phones, keeping the original font/icon sizes and separate70-guest note |
|8| Remove only the redundant `ترفيه` group heading from the native chalet service list |
|9| Slightly reduce only the rest-house slide card's service title on current phones,17→16px; retain the28px main heading and the original service name |
|12| Address guests in the plural in the reviewed descriptions and portal introductions; keep service names, request-button labels and the guest's first-person request greeting |
|13| Use `التنسيقات والجلسات` for the section name, standalone heading, navigation/share labels and associated metadata; retain every URL |
|14| Chalet bottom tab: `الجولة`, retaining its link, icon and map behavior |
|15| Use `لجمعاتكم` in the corresponding cabin/rest-house descriptions |
|17| No trailing full stop in titles or short phrases; retain appropriate punctuation in complete prose sentences |
|21| Exactly one blank line before the total in prepared order messages, for single/multiple items in both interfaces |
|23| Restaurant item lines identify their calculated amount with `الإجمالي:`, with no price/calculation/quantity change |
|24| Cabin options show the actual mapped number in parentheses, e.g. `البيت اليوناني 1 (10)` and `كوخ رويال (19)`. Keep option values/order and message identity unchanged; remove the duplicated number row below the select |

Question25confirms the owner's video-contest number0556615018; retain it.

## Explicitly retained decisions

Keep the existing bathroom breakdown, service-card prices only inside details, standard navigation/information font sizes, branch captions with Jeddah already in the footer, repeated garden-access sentence, and `برسوم إضافية` without repeating the slide price in accommodation details/comparison/FAQ. General WhatsApp help links still open an empty conversation. Resort request messages keep cabin name/number without an extra venue line. Keep full package and section names, including `الباقة: باقة ألعاب مائية` and `القسم: القسم الثاني – الدور العلوي`.

Earlier keep decisions remain: loyalty content/policies, active contest rules/durations, capacity labels and session names, existing map/navigation entrances, `سناكس`, restaurant/coordinator/general recipients, invoice placement, request lifecycle, all original images and their loading policy. No image, font, video or public route is removed.

## Shared measurements and cabin presentation

`js/specification-measurements.js` is the single escaped-text formatter used by the native guide and existing illustrated-map helpers. `css/specification-measurements.css` keeps a numeric value before its Arabic unit in RTL reading order, with a gap; dimension factors remain LTR. Semantic `bdi` elements prevent existing map-card label rules for `span` from changing the numeric/unit layout. This replaces the Royal-only prototype, rather than keeping two divergent implementations.

`site/app.js` imports/preloads the helper; visual documents load the same helper before their existing specification data. The existing builder refreshes these cache keys. Callers escape text before formatting. Geometry checks verify both order and separation, rather than accepting textContent alone, which cannot detect a visual bidi regression.

Cabin numbers remain sourced from the unchanged catalogue. Only display labels change; selection values still contain the original cabin name. Removed number-row callbacks do not participate in customer identity, message generation or draft retention. The canonical cabin map, message fields and all prices remain unchanged.

## Verification

- Compare63native/standalone pages with v133: identical image src/alt/loading data, no horizontal overflow or JavaScript errors, and no changed link hrefs. Text/control-label changes correspond to approved copy and cabin options.
- Check28measurement views: all15accommodation detail pages with pool facts,12cabin tours and the chalet map. Numeric/unit reading order, shared baseline and visible gap are checked geometrically.
- Rest-house facts remain one line at375,390and430px with their original font sizes. The70-guest note remains separate. Portal main headings stay28px; the requested slide-card title is16px on current phones. Branch captions and blank general-chat links are verified.
- Test all12cabin labels/values and absence of the duplicated row in inline and standalone invoices.
- `check-main-guest-parity.py`, `check-order-session.py`, `check-order-readd.py`, `check-chalet-guest-services.py`, `check-stay-services.py`, and `check-back-navigation.py` pass. They cover exact native/source draft parity and recipients, deletion/re-addition, internal navigation, reload/background/exit clearing, source-specific sharing and stable decoded hero reuse.
- `check-live-cutover.py`:82routes,82preview aliases,44legacy hashes,153unit-gallery photos, no runtime errors.
- Source invariants: all numeric facts/prices/capacities/phones, unit sections, gallery lists, FAQ answers, garden content, loyalty content, structured schemas and lifecycle/native-order code remain unchanged. No files are deleted.

Current evidence is `site/audits/approved-final-pdf-v134.json`, `live-cutover-v134.json` and `back-navigation-v134.json`. The existing tests' approved copy/message expectations and cabin-number presentation check were updated explicitly; behavioral assertions were retained.

Run the focused regression after future measurement/order-presentation changes:

```sh
python site/build-site.py
python scripts/check-approved-pdf-batch.py http://127.0.0.1:8140
```

The focused check writes screenshots/results under `/tmp/familyday-approved-pdf-v134`; it intercepts WhatsApp actions and never sends a message. Rebuilding a second time produces identical output. The rollback tag retains the exact prior implementation.

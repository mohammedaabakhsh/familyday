# Accommodation heading consistency — v141

Use the resort accommodation detail heading as the reference. Both rest-house section cards now show `استراحة يوم العائلة` above their section name and place `(مناسب للتجمعات الكبيرة)` beside the name. Preserve the floor label beneath the name and all four illustrated facts in a single row. Venue text uses the shared12px eyebrow style; audience captions use the shared14px detail-caption size.

On the chalet detail page, show `شاليه يوم العائلة` as the venue eyebrow and `الشاليه (مناسب للعائلات)` as the visible heading. Change only the displayed heading: canonical accommodation names, page metadata, URLs, booking and gallery data remain unchanged. Resort detail output is unchanged.

Browser verification at375,390and430pixels confirms the venue/name/audience hierarchy, inline parenthetical captions, non-overlapping text, all four facts on one row, carousel and detail-link navigation, correct chalet heading and unchanged Greek cabin reference. Screenshots of both rest-house cards and the chalet heading were inspected. Canonical catalog, services, guide copy and structured data remain byte-identical. Evidence: `site/audits/venue-headings-v141.json`.

## Typography follow-up — v142

Unify rest-house card names with the reviewed mobile detail headings by changing21px to20px. All three venues now use12px/500/18px for venue names,20px/800/30px for accommodation titles, and14px/500/21px for audience captions (font size/weight/line height), with the same Tajawal family. Browser checks at375,390and430pixels compare the complete computed typography tuples across both rest-house cards, Greek and dome cabins, chalet details and rest-house details. Card fact rows remain on one line and navigation checks pass. Canonical data are unchanged.

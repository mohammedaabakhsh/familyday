# Rest-house section cards — v136

The owner requests removing the upper comparison link because the bottom navigation already provides comparison, keeping the audience caption on one line, and making adult-pool availability explicit in both cards.

Remove only the comparison link in the section-list heading. The bottom comparison tab, comparison page, carousel and detail links remain. Keep the existing11px caption font and use available card width on current phones. No redesign for desktop or old/narrow phones is introduced.

Feature summaries are derived from each section's maintained outdoor facilities: ground floor `مسبح للكبار ومسبح للأطفال`; upper floor `مسبح للكبار وملعب كرة طائرة`. Accommodation data, photos, capacities, prices and contact/order behavior are unchanged.

Browser checks at375,390and430pixels verify the single-line caption with no heading overlap, the unchanged font size, accurate summaries, carousel navigation, no horizontal overflow and the bottom comparison link. Screenshots of both cards were inspected. Evidence: `site/audits/stay-section-cards-v136.json`.

## Owner follow-up — v137

The owner rejects both feature sentences and requests removing them entirely, keeping the remaining information balanced and moving the25-guest row downward. Remove the derived feature row and its now-unused styling. On current phones, the existing facts row has24px above and18px below; caption/title/fact fonts remain unchanged. Pools and volleyball facilities remain in the accommodation details and comparison data.

Checks at375,390and430pixels confirm that both cards contain no feature paragraph, the guest/room row is lower, captions still fit one line, and the details buttons, carousel and bottom comparison remain functional. Evidence: `site/audits/stay-section-cards-v137.json`. This supersedes the v136 feature-summary wording above.

## Owner follow-up — v138

The owner requests pool information beside the existing guest and bedroom facts, rather than a separate description. Derive the maintained outdoor facilities from each section: ground floor `مسبحان`; upper floor `مسبح وملعب كرة طائرة`. The new text follows the bedroom fact. Preserve the full existing guest/room labels and12px fact font; distribute the three facts in one row using the available card width on current phones. The24px/18px vertical spacing from v137 remains.

Browser checks at375,390and430pixels verify all three facts occupy the same row with no overlaps, correct facility wording, unchanged font sizes, no horizontal overflow, and working carousel/comparison navigation. Both card screenshots were inspected. Canonical accommodation, service, contact and structured data remain byte-identical. Evidence: `site/audits/stay-section-cards-v138.json`.

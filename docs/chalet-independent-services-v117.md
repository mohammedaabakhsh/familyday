# Chalet independent services — v117

The chalet portal used a combined water/entertainment summary, while the main
chalet request action opened that general portal. Main service preview descriptions
also repeated the chalet brand.

Both chalet services now follow the approved resort method with independent
requests, invoice removal, one total, name/notes, Send Request and service-specific
follow-up. Main requests stay in a dark native dialog; standalone requests keep
the light selection/invoice flow and the chalet's existing home layout. Chalet
entertainment exposes only the box package. Main photos are static. No cabin
selector is introduced for a single chalet.

The shared catalogue and formatter supply both interfaces. Chalet draft messages
identify `المكان: شاليه يوم العائلة`, with the actual package, quantity, water
allocation if relevant, total and optional notes. Recipient remains0556156693.
Standalone follow-ups name chalet services; resort copy remains unchanged.

Share destinations stay in their interface:

| Service | Main | Standalone |
| --- | --- | --- |
| Water | /chalet/services/water-games/ | /chalet/guest-services/water/ |
| Games | /chalet/services/games/ | /chalet/guest-services/games/ |

Crawler HTML has a service/brand title, a plain description and no preview images.
Existing `#water`, `#games` and `-service` links still open their correct section.
Whole-service sharing, clipboard/manual fallback, reload and tracking-query
handling use the existing section-entry mechanism.

The existing visit manager preserves independent drafts during internal Back,
closing and site navigation, with separate chalet/resort state namespaces. Refresh,
actual exit/background return and sending clear the relevant draft.

Validation intercepts all drafts/shares, never sends. The chalet suite covers
390px,320px,short390px and desktop, exact main/source messages and prices, box-only
content, no cabin fields, deletion, internal-return retention, lifecycle clearing,
preview/legacy URLs and share fallback, plus cross-venue state isolation. Existing
resort invoice and session suites guard shared-controller behavior. The catalogue
is byte-identical to the prior release.

Rollback: `pre-chalet-independent-services-20261127`.

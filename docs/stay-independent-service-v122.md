# Stay slide requests — v122

The existing inflatable slide is available in the second section, on the upper
floor. The owner set its price to **450 riyals** and approved independent ordering
on both the native site and a new standalone portal.

- Native page: `/stay/services/` keeps the main site's design and opens its native
  order dialog. The existing original photo is static, followed by location,
  price, “اطلب هذه اللعبة”, and assistance contacts.
- Standalone home: `/stay/guest-services/` follows the other portal homes, including
  the same original logo, branch caption, compact help typography, call/WhatsApp
  controls and social footer. Its one service opens details then an invoice.
- Service share: `/stay/guest-services/slide/` opens those details directly and
  has a text-only preview. Native sharing stays on `/stay/services/`.
- Both order surfaces use the same stay controller/catalogue and produce the
  same message to `966556156693`. The invoice has one game, one total, item
  removal, name and optional notes. No cabin selectors or combined cart.
- Drafts remain in memory during internal navigation and close/Back; actual
  exit, background return, refresh and successful handoff to WhatsApp clear them.

`data/services.json` owns the new `stay` catalogue. The build synchronizes its
slide content to `site/guide-copy.json`; existing resort/chalet catalogues and
message builders remain unchanged. The native controller adds a stay destination
using the existing iframe protocol. The new portal is protected from regeneration.

Validation: `python scripts/check-stay-services.py http://127.0.0.1:8173` intercepts
outgoing messages and checks exact message/recipient parity, price, previews,
real links, image loading, deletion, internal Back and document navigation,
refresh/background clearing and mobile/desktop layouts. Existing main guest and
chalet service checks cover the shared native-controller extension.

Rollback tag: `pre-stay-independent-service-20261127`.

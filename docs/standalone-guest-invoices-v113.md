# Independent standalone guest-service invoices

The standalone resort guest portal keeps its existing cards and selection dialogs. Each of the five services now advances from its selection dialog to its own invoice, customer fields and `إرسال الطلب`. There is no combined basket beneath the home cards. This does not enable the new flow in native main-site iframes or the chalet; their existing controllers and message builders remain in place for a later review.

The invoice lists all choices within that service, their quantities/unit prices and line values, then one order total. An explicit edit returns to the active selection; final cancellation, Back out of the invoice, navigation, background return, refresh and successful draft preparation discard the order and customer details. Closed requests cannot be revived with browser Forward. Fields remain memory-only with autocomplete disabled.

| Service | Standalone shared URL | WhatsApp recipient |
|---|---|---|
| Restaurant | `/guest-services/restaurant/` | `966537006531` |
| Hospitality | `/guest-services/hospitality/` | `966556156693` |
| Extras | `/guest-services/extras/` | `966556156693` |
| Water games | `/guest-services/water/` | `966556156693` |
| Entertainment games | `/guest-services/games/` | `966556156693` |

Each share opens its own standalone service with no order/customer data in the URL. Crawler-readable previews include `منتجع يوم العائلة` once in the title and only service copy in the description, without images. Legacy section hashes still work. The existing selection-header share action remains; invoices do not duplicate it. Native main-site sharing still uses its existing native paths.

The messages use the reviewed service-specific greetings, name/cabin/number, package or item and quantity, one total, and optional notes. Multiple dishes/items list each line amount. Restaurant variants and cheese choices are retained; water allocations state games for adults and children rather than implying guest counts. Opening WhatsApp only prepares a draft for the guest to review and send.

Implementation is isolated by the standalone bridge in `guest-services.js` and `independent-orders.js`; selection design and the authoritative catalogue are retained. The invoice gets a copy of the selected service only. The existing legacy submit builder is byte-identical. Scoped styles cannot apply to the native iframes or chalet.

Validation:

- `python scripts/check-guest-independent-orders.py BASE_URL` checks exact approved drafts, all five independent flows, quantities, multiple items/options, edit/cancel/Back/Forward/hash/refresh/background privacy, own share URLs, crawler previews, copy fallback and unchanged native main messages at normal, narrow and short mobile sizes. It mocks outgoing drafts.
- `python scripts/check-order-exits.py BASE_URL` retains the broader main/chalet/arrangements exit-policy regression and checks the new standalone invoice exits.
- `python scripts/check-portal-share-destinations.py BASE_URL` checks section shares, receiver behavior and fallback copy.

Rollback tag: `pre-standalone-guest-invoices-20261127`. Applying the same message/flow conventions in the main interface is intentionally deferred until the owner returns to that review.

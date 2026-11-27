# Order visits and invoice deletion — v115

The old exit rule discarded requests on internal Back, closing a request and
switching main-site sections. The owner clarified that these actions must
preserve the active visit. Refresh, leaving the website, returning after
backgrounding and sending a request still discard the corresponding draft.

Main restaurant state survives SPA navigation. Other main requests use JSON
snapshots keyed by service and selected package/table, rebuilding one native
iframe when reopened rather than retaining a collection of live frames.
Standalone guest services retain selections and per-service invoice identity;
standalone arrangements retain per-item request drafts. Requests remain
independent and do not form a cross-service basket.

`js/order-visit.js` carries controller snapshots only during a same-origin
full-document navigation: a destination-bound handoff expires after15 seconds,
is read and removed immediately by the destination and is rejected on reload.
No order is saved while users fill forms. Actual exits produce no handoff;
background return clears retained visit records. Browser-cache restoration uses
the same exit cleanup before applying a valid internal handoff.

Cabin numbers follow the arrangements reference: a small inline note under the
cabin selector. Every resort checkout exposes item removal. Removal updates the
selection, total and outgoing message; sending an empty order is disabled.
Optional seating extras stay synchronized with their controls when removed.
Prices, shared WhatsApp formatting/recipients, share URLs and the chalet-specific
controller are unchanged.

Validation: `check-order-session.py` (also the entry for `check-order-exits.py`)
checks both interfaces and all nine services at390px/320px, customer/selection
retention after closing and browser Back, main route/category changes,
same-origin document handoff, external exit/background/reload clearing, invoice
removal and totals/drafts, optional extra controls, cabin-number styling and
absence of saved customer data. Standalone invoice/message and main/source
parity suites retain their exact-price and exact-message checks under the new
exit policy. All WhatsApp calls are intercepted; no messages are sent.

Rollback: `pre-order-session-20261127`.

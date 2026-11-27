# Main resort guest services — v114

The main resort guest services still used generic request buttons, a generic
WhatsApp introduction and a generic follow-up sentence after the standalone
portal gained individual service requests. Extras had no main service entry.

The approved change preserves the dark main-site design and inline restaurant
menu. Hospitality, extras, water and entertainment keep independent native
requests. Main and standalone use `js/guest-order-message.js` for the exact
approved message format, follow-up and service recipients. The standalone
invoice design is unchanged. Chalet continues using its existing controller
and legacy message builder.

The accommodation directory now shows hospitality, extras, water and games,
with the same short descriptions as the standalone cards. Extras has its own
`/services/extras/` page, while standalone sharing stays under
`/guest-services/extras/`. Each interface retains its own share destination;
preview descriptions match without repeating the resort name. The main games
photo is static. Prices and service contents remain unchanged.

Validation intercepts WhatsApp drafts and native sharing; no messages are sent.
`check-main-guest-parity.py` compares real main/source requests at 390px and
320px, including multi-item hospitality/extras, cheese and BBQ variant,
water-package quantity/allocation, recipients, previews, own-interface shares,
static photos and extras exit privacy. Existing standalone invoice, whole-service
sharing and global order-exit suites cover unchanged flows.

Rollback: `pre-main-guest-parity-20261127`.

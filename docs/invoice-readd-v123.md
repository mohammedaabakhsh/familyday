# Re-add removed services in the same invoice — v123

Removing the last invoice item previously left a zero total and disabled sending,
with no visible way to add it again in several request windows. The owner reported
this for the stay's slide and requested the same fix wherever needed.

- The stay invoice keeps the slide row at quantity0 after removal and offers
  “إضافة اللعبة”. Explicitly adding it returns quantity1 and the450riyal total.
  There is no way to order a second slide.
- Guest invoices for resort/chalet keep removed items available through
  “إضافة من جديد”. Recovery restores actual selections, including quantities,
  cheese, game package and adult/child water distribution. It works in the native
  iframe and standalone invoices, including multi-item requests.
- Coordination, seating, dining and cinema invoices offer the same recovery
  action, including deleted seating add-ons. An add-on is unavailable until its
  seating request is present. Dining retains one configuration.
- A removed request stays at zero when its native invoice is closed and reopened;
  no automatic re-add. Identity and notes survive removal/recovery. Only active
  items count towards the total and outgoing WhatsApp message.
- Recovery data uses the existing in-memory visit state and one-use internal
  handoff. True exit, refresh, background return and submission clear it along
  with the rest of the request. No durable order storage was added.
- The main restaurant already offers usable inline menu quantity controls after
  invoice removal. Its design is unchanged and this path is covered by the checks.

Validation: `check-order-readd.py` covers13 cases at390px and320px, with native and
standalone recovery and exact outgoing draft parity. It also verifies recovery
after native closure/reopening, untouched identity/notes, repeated stay recovery
limited to one, and water allocation restoration. WhatsApp opening is intercepted.
Existing order-session, four-surface water-empty and82-route cutover checks pass.

Prices, recipient numbers, message wording, share routes and existing selection
limits remain unchanged. Rollback: `pre-invoice-readd-20261127`.

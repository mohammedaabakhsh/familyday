# Guest services

The page uses one shared service dialog with a draft selection. Applying commits only the active service; cancel, Escape and backdrop dismissal discard its draft. Resort services and restaurant orders keep separate totals and WhatsApp recipients.

Hospitality is read from `#hd-hospitality-panel` in the main `/index.html` by `service-source.js`. Package names, prices, inclusions and usage notes are not duplicated. Each package supports quantities, expandable contents, basket editing/removal and restoration from session storage. Restored quantities are validated against the live catalogue; saved prices and unknown names are ignored. Cinema remains in the existing guest ordering flow.

`/guest-services/#hospitality` and `#cinema` open the relevant dialog. Legacy guide links redirect here. WhatsApp actions only prepare a draft; they do not send a message automatically.

Serve the repository and run:

```sh
python scripts/check-guest-services.py http://127.0.0.1:8044
python scripts/check-guest-hospitality.py http://127.0.0.1:8044
```

Both checks intercept outgoing WhatsApp URLs locally; no messages are sent.

## Chalet parity

`/chalet/guest-services/` is a permanent QR-code URL. Its `data-venue="chalet"` page uses the same stylesheet, catalogue loader, sharing code and ordering controller as the resort. Only water games and the box-only games option are present. Keep the venue-specific headings, location, and WhatsApp place line; keep the services recipient `966556156693`. Resort and chalet drafts use separate session-storage keys. The historical `chalet-services.js` is no longer loaded and remains only for previously cached HTML.

Run `python scripts/check-chalet-guest-services.py <base-url>` and the resort checks above after shared controller changes.

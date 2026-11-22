# Independent Family Day interface preview

Unlisted preview at `/preview/`. This folder does not replace or modify the live site's routes, navigation, data or styles. Remove the folder to remove the preview.

- Three resort cabins: Dome 1, Royal and Panoramic.
- One chalet and the rest house's ground-floor section.
- Original high-resolution source photos, approved specifications and venue-specific services.
- Navigation stays in hash routes inside this preview. Sharing uses original canonical public URLs. Existing booking and order flows open their original pages.
- `noindex,nofollow` on the preview document. This is an unlisted public page, not an authenticated private page.
- No new booking forms, submissions, analytics or account storage.

`catalog.json` is a snapshot of approved production content at the `sourceRevision` included in that file. The helper `build-data.py` can rebuild the snapshot from a local server using Python Playwright; it writes only this folder. Photos are referenced at their original paths and are not recompressed.

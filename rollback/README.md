# Retained rollback point

Deletion is not approved yet. This folder retains the original files replaced by the cutover and exact hashes in `manifest.json`. The full repository before migration is also published as Git tag `pre-live-cutover-20261125` (base `0fca20e7`).

`legacy-interface-20261125.tar.gz` contains the original root entry documents and original order-source modules. Original shared photos/fonts and old runtime files are still present in the repository while the owner verifies production. The new guide does not load the archived interface.

Rollback should restore the complete Git state, or revert the canonical-interface cutover commit while retaining the tested independent order source. Restoring only one HTML document is insufficient. Do not execute files in `preview-builders/` against the current tree; they are historical source copies for review/rollback.

Final legacy deletion and removal of unused duplicates requires the owner's later explicit instruction.

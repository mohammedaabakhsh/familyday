# Explicit water-package selection — v118

Opening water ordering previously created a quantity-one draft automatically.
The main native invoice therefore showed a pending package and50-riyal total
before the visitor chose anything. The shared controller supplies all four
resort/chalet main/standalone surfaces.

Water ordering now starts with zero packages, zero selected total and no invoice
item. Adult/child additions remain disabled until the visitor chooses package
quantity. Sending/advancing requires a positive quantity and a complete three-game
allocation per package. Reducing the last package to zero or deleting it clears
the allocation and invoice. Reducing capacity below the current allocation resets
the allocation, as before. The visible per-package offer remains informational.

The catalogue,50-riyal package price, shared messages/recipients, request layouts,
independent ordering and internal-visit retention are unchanged.

`check-water-empty.py` exercises all four surfaces at390px,320px and short390px:
initial emptiness, no phantom invoice/false completion, disabled empty actions,
explicit choice, reduction/removal to zero, allocation capacity reset and exact
one-/two-package draft messages. Drafts are intercepted; nothing is sent. Existing
request suites now explicitly choose their package quantities before allocation.

Rollback: `pre-water-empty-selection-20261127`.

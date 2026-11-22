# My Usual Order — explicit reorder shortcut (v1)

This change is stacked on draft PR #35 (Taste Memory), which in turn depends on
draft PR #34 (Growth Engine). All three require individual review before merging.

## The customer action

1. Add any priced menu product or configure a sandwich/breakfast in the existing
   cart, then press **Save as my usual order**. Nothing is saved as a previous
   purchase; this is an explicit personal *list template*.
2. The menu shows a compact **My usual order** card with real catalog photos,
   item count and **current** prices. There is no false discount or points.
3. **Add this order** appends the selected items to the current cart.
   Quantities and unique configuration options are checked *before* changing
   any line. If an item would exceed the 99-portion limit or the 100-custom-
   configuration limit, no part of the saved list is appended.
4. The shortcut also appears inside the **empty** cart. The visitor can edit
   and review their order before showing it to the barista.
5. **Delete saved order** erases the saved template on this device without
   clearing the actual cart, independently stored favorite hearts or opted-in
   Taste Memory.

## Data minimization

`localStorage['miora:usual-order:v1']` is written **only on Save**. It holds
`{version:1,cart:{id:quantity},configuredOrders:[{kind,selection,qty}]}`.
No price cache, contacts, delivery addresses, timestamps, user IDs, completed
orders, browser fingerprinting, payment or remote API calls.

Saved lists can contain configurable selections validated against existing
recipe contracts and product IDs validated against the live menu data. Invalid
outdated entries are not reintroduced; prices are recalculated from source
catalog/recipe definitions. The interface states this is a demo order LIST,
not a submitted or paid transaction.

## Acceptance criteria

- All previous catalog/cart/media/growth/taste tests continue to pass.
- Unit coverage for explicit save/read/delete, stale data, current prices,
  customized sandwich selections, quantity overflow, blocked storage and
  preservation of the existing cart if a repeat fails.
- Playwright on TR/390px, RU/320px and EN/1280px: save, reload, empty-cart
  shortcut, repeat, append without replacement, overflow, delete.
- Uploaded browser screenshots for visual review.
- Do not merge PR #34, #35 or this PR before required checks and review.

# Taste Memory v1 — return to your favorites

This phase builds on the draft Miora Growth Engine PR #34.
It does **not** add payments, a loyalty ledger, fake offers, marketing messages,
a remote user profile, or repeat-purchase claims.

## Intended experience

- A compact “favorite flavors” row sits between the menu toolbar and the
  catalog in the feed, grid and list layouts.
- Products explicitly saved using the existing heart icon appear in the row,
  including on repeat visits to the same device/browser.
- A separate optional button enables remembering recent *successful additions*
  to the local order list. No implicit history is kept before enabling.
- The row shows favorites first, then the most recent explicitly opted-in
  selections, up to four priced products. All cards use current catalog photos
  and prices, with one transparent add action.
- Switching off remembering deletes its entire recent-choice history
  immediately. Hearts remain in the existing separate `miora:favorites` store
  and can be removed by unliking a product.
- The original cart, staff view and menu prices remain unchanged.

## Local data only

The optional recent-choice record is stored in
`localStorage['miora:taste-memory:v1']` as
`{"enabled":true,"recent":["428748"]}`. It contains at most six currently
priced menu item IDs. No names, addresses, timestamps, device identifiers,
contacts, allergens, purchase claims, or payment details are written to this
record. Broken storage must never prevent browsing or adding products.

Favorite IDs already existed in `localStorage['miora:favorites']`; we do not
silently migrate them into the new opt-in history. Their visibility in the
personal row is a presentation of items the visitor previously chose to save.

## QA

`npm test` verifies opt-in, invalid and stale data, deduplication,
favorites-first ordering, deletion, empty limits and blocked storage.
The dedicated Chromium test covers TR/390px, RU/320px and EN/1280px:
initial state, favorite save/reload, opt-in, recent choices, opt-out/delete,
repeat add and consistency across feed, grid and list.
Existing media, 93-item catalog and growth-engine checks also remain active.

There is no attribution to a real customer, no cross-device history and no
online order. Production release requires review of mobile screenshots and
all mandatory GitHub Actions checks before merging PR #34 and this follow-up.

# Miora Coffee pre-publication QA — 2026-11-05

Target: Miora Coffee, buildless authored files in `dist/`. This report covers the source experience before its GitHub Pages publication.

## Executed

- PASS: 10 Node tests: all 93 source items and exact integer-kuruş prices, all 92 source photos plus logo, corrupted cart normalization, monetary totals, removal, unpriced exclusions, atomic pairing and its limit, accent-insensitive and translated search, categories/favorites membership.
- PASS (Chrome browser UI): complete catalog shows 93 positions; translated search finds matcha; an unmatched query shows the empty state.
- PASS (Chrome browser UI): latte + cappuccino = 380 TRY; brownie companion +30 = 410 TRY; increasing latte gives 610 TRY and reducing returns 410 TRY. Staff summary preserves all three original Turkish product names and shows 410 TRY. QR canvas generated; physical camera scanning was not tested.
- PASS (Chrome browser UI): cart survives reload (410 TRY). Clearing and adding Cappuccino + San Sebastian creates exactly two lines, 430 TRY. A second open tab reflects the two-item cart.
- PASS (Chrome browser UI): unpriced large Magnum Brownie has no add action; the questionable 1 kcal/100g source value is flagged for confirmation.
- PASS (Chrome browser UI): adding Cool Lime to favorites yields one card in favorites; share dialog contains the exact item link with `item=429441&lang=ru`.
- PASS: responsive iframe layouts with 320, 390, 768 and 1440 px outside widths, in TR/EN/RU (12 combinations), have root scrollWidth equal to clientWidth. The iframe reserves 15 px for its scrollbar. Final shortened Russian/English hero copy visually checked at 390 px.
- PASS: original source data and pictures are kept locally; no invented vitamin values or fabricated social counts.

## Limits

These are Chrome layout and interaction checks, not physical-device or Safari/Firefox validation. Native mobile sharing, camera QR scanning, offline operation and online ordering/payment were not tested. This concept never sends orders or charges payments. The shared preview route sometimes switched to unrelated projects during navigation; those unrelated pages are excluded from evidence. The production item-link check follows native deployment and is not represented as a passing preview test here.

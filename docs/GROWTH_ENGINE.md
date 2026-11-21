# Miora Growth Engine v1 — honest, testable funnel

Status: implementation proposed in a draft pull request. Do not describe local cart
lists as completed sales; Miora has no payment/POS integration.

## Scope already implemented in this phase

- Deterministic cart recommendation using only the published menu catalog.
  A drink-only cart may suggest San Sebastian cheesecake (430226), then a croissant
  (430350) if the first choice is already in the cart. A food-only cart, including
  configured breakfast/sandwiches, may suggest Cappuccino (428772), then Caffe Latte
  (428748). A mixed food + drink cart has no extra suggestion.
- Prices remain the original per-item menu prices in integer kuruş. The customer
  must explicitly choose an extra. There is no auto-add, fake bundle discount,
  false scarcity, timer or payment promise.
- A customer can dismiss the offer; it will not recur in the current page
  session. After accepting it, no second offer immediately appears.
- RU/TR/EN copy clearly states that the price is regular, without a discount.
  Staff-mode order summaries remain Turkish and show only actual cart items.
- Bounded, device-local funnel diagnostics: `menu_visit`, `product_open`,
  `cart_add`, `cart_open`, `offer_visible`, `offer_accepted`,
  `offer_dismissed`, `staff_preview`, `order_copied`, `cart_cleared`.
  `offer_visible` is recorded after the offer becomes at least 50% visible,
  not merely because HTML was rendered.
- Data storage: `localStorage['miora:growth-events:v1']`, maximum 200 records.
  Only event name, numeric menu item ID (or null), and timestamp are persisted.
  There is no network request, identity, advertising pixel, email, IP or
  cross-device tracking; blocked storage must never block ordering.
- `growthSummary(readGrowthEvents(localStorage))` returns event counts and
  observed offer take rate (accepted / visible). This is NOT purchase CVR,
  AOV, CAC, LTV or revenue; no payment has taken place.

## QA acceptance conditions

1. Visiting a card, adding a drink, and opening the cart must preserve the
   existing price, quantity, kiosk and layout.
2. Offer appears only when contextually relevant and its item is not already in
   the order, priced at the exact source-menu amount.
3. No extra enters the cart before an explicit click. Refusal is respected
   throughout the current page session.
4. Staff view contains only selected goods and is not a completed transaction.
5. RU/TR/EN at 320px, 390px and 1280px are covered by Chromium smoke; Node tests
   cover edge cases, malformed storage and truthful metrics.
6. Existing 93-product source parity, original photographs, and all other tests
   remain unchanged.

## Follow-on work: not yet built

- Phase 2: eligible add-ons in the sandwich configurator and transparent
  bundles composed of existing separate line items; require the café to approve
  actual recipes, allergen data and stock before real offers.
- Phase 3: consent-first saved taste memory, visit return without fake loyalty
  points, and optional referral links with a clear invitation. Never invent
  a reward that the café has not agreed to honor.
- Phase 4: server-side consent and aggregated telemetry, event quality checks,
  deduplication and A/B experiment assignment. Only after an order submission
  integration may reports show actual conversion, AOV and repeat purchases.
- Phase 5: genuine tripwire, limited-time OTO, loyalty and win-back campaigns
  only with documented prices, eligibility, stock and authorized messaging.

The implementation is deliberately minimal and modular so that eligibility,
analytics and UI can be adapted to other projects without shipping café-specific
discount claims or turning the customer's menu into an aggressive sales funnel.

# Miora City Guide — conversation-first family welcome (v1)

A minimal guided introduction for Miora as a family café: the venue is
both a play town for children and a coffee/food place for adults.

## Source and visual fidelity

The panorama `dist/assets/city/miora-city.webp` was made from three
photographs supplied directly by the project owner on 21 November 2026.
It depicts the storefront-style play façades, an indoor slide/play area,
and the real Miora coffee counter. The source photographs were cropped
to omit identifiable children's faces, resized into a small montage and
kept separate from the existing product photos. No stock image or
synthetic playground was substituted. The established Miora logo is
unchanged. The picture is a location preview, not a promise of
supervision, child-care services or a purchasable play session.

## Visitor journey

The guide appears **inline** after the hero, before the catalog. It
never interrupts the page as a modal or hides the menu.

1. Greeting: **Here with kids** or **Here for a coffee break**.
2. Family journey: optionally discover the play town's real photo
   collage, or move to food and drinks.
3. Adults' journey: move to a product preference, or see the town too.
4. Preference: choose coffee, desserts, or food. Show up to three
   source-catalog products with their live, normal menu prices.
5. Opening a category uses the exact existing menu navigation.
   Product cards open the existing detail dialog, not an instant
   transaction or hidden add-to-cart.
6. If the visitor explicitly saved a list previously, the greeting also offers an **Add my saved list** shortcut. Nothing is added until they press it; quantities still pass the atomic overflow guard. If heart favorites exist, a matching **See my favorites** path appears without selling to a child.
7. **Go straight to menu** dismisses the guide at any point.
   **Meet Miora** reopens and restarts it. Keyboard focus follows the
   guidance; the original cart and menu stay accessible.

All content is TR/RU/EN, and the conversation is a deterministic
interaction, **not** a real AI chat or an interaction with staff.
Answers are not stored, sent or linked to children. We do not ask
for child names, ages, contact information or family identifiers.

## Marketing / safety boundaries

- Parents and adults decide whether to open or add products.
- No child-directed sales pressure, scarcity, fake reward mechanics,
  age profiling or purported order history.
- No invented discounts, payment ability, reservations or child
  supervision promises.
- Product photos, catalog data and prices stay the existing originals.
- The personalized favorites, optional Taste Memory and explicit
  saved-list flow remain independent and non-blocking.

## QA

`npm test` includes route and category invariants, TR/RU/EN copy,
original-pricing checks, valid WebP asset integrity and absence of
visitor profiling.

The Chromium smoke runs on TR/390, RU/320 and EN/1280:
welcome, parent path, photo loading, Back, category filter,
adult path, skip and reopen. It checks no cart auto-adds and no
browser errors. Screenshots are uploaded for manual visual review.

Release is stacked on draft PR #36 (Usual Order), #35 (Taste Memory)
and #34 (Growth Engine). Main and production remain unchanged until
the individual PRs have passed CI and review.

## Visual QA follow-up (21 November 2026)

The first CI screenshots revealed that the 390 px photo montage was stretched
across a 1,000+ px desktop panel and that long three-column captions were too
small on 320 px devices. The follow-up patch caps the image at 440 px on
desktop, changes each region caption to one or two localized words, and gives
the dialogue a small real Miora logo avatar and distinct speech surface.

Choosing **Go straight to menu** or a category stores only a boolean in the
current tab's `sessionStorage`: `miora:city-guide-dismissed:v1 = '1'`.
It is deleted if the visitor explicitly reopens the guide. We do not store
responses, age, family data or choices. The browser smoke asserts that reopening
works after reload, the menu heading receives keyboard focus, the tour has no
horizontal overflow at 320 px and the panorama is not oversized on desktop.
Images remain cropped to exclude recognizable children.

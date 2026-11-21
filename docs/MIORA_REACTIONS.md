# Miora Reactions v1 — personal flavor sticker language

## What is real

The existing Miora menu has 93 catalog items in 8 categories.
This prototype gives each product exactly **three stickers** according to
its *source catalog category*. One visitor can choose at most one sticker
per product on their device, replace it, or remove it by selecting the
same sticker again. The options never require a purchase or a review.

The original Miora source logo, header and item photos are unchanged.
The hearts remain **Favorites**, independent from sticker choices. Existing
like/share/view numbers continue to represent device-local activity,
not community totals. **The new stickers never show invented guest counts.**

## Category catalog mapping

| Source category | Category (EN) | Choices |
|---|---|---|
| 46776 | Hot coffee | 🤎 Cozy · ⚡ Energy · 😍 Love it |
| 46810 | Iced coffee | 🧊 Chill · ✨ Wow · 😎 Cool |
| 46814 | Hot drinks | 🫖 Warm · 💛 Love · 🌿 Calm |
| 46817 | Cold drinks | ❄️ Fresh · 🍋 Zing · 🌈 Joy |
| 46818 | Desserts | 😋 Yum · 🍰 Sweet · ✨ Wow |
| 47037 | Soft drinks | 🥤 Refresh · 💛 Love · 🌈 Joy |
| 50454 | Smoothies & fresh | 🍓 Fruity · 🌿 Fresh · 😋 Yum |
| 46885 | Food & bakery | 😋 Yum · 🥰 Favorite · ⭐ Special |

The option names and UI are translated into Turkish, Russian and English,
so the interface never claims a reaction is a verified taste review.

## Interaction design

- Feed: three visible sticker buttons below the existing social metadata.
  Action rail remains Favorites / Share / Details.
- Grid: three compact, emoji-first sticker buttons below metadata, with
  localized accessible labels, and without obscuring the photo or price.
- List: the same three compact choices.
- Detail: the same choices in a full-width, labeled row.
- Selected reaction: `aria-pressed=true` and a restrained one-time
  pop effect; it respects `prefers-reduced-motion`.
- Repeating a selected sticker removes it. Another choice replaces it.
- **My flavor stickers**: a small, collapsed-by-default personal album
  appears only when the visitor selects at least one. It links back to
  the corresponding source product; it never displays purchases or points.
- All interactions are intentional; no add-to-cart or favorite toggles
  occur when a sticker is selected.

## Privacy, truth in marketing, and future social roadmap

Device-local `localStorage['miora:personal-stickers:v1']` contains only
`{"version":1,"items":{"428748":"cozy"}}` — source catalog IDs and
category-allowed code IDs. No names, contacts, child attributes,
timestamps, location, purchasing history, session IDs, network traffic,
or paid-order claims. Storage is bounded to 93 products.

**These are not community/social counts.** We have no common backend
that can establish a reliable number of guests who selected each sticker.
Do not label reactions `34 people loved it`, `most popular with
children`, or publish simulated counts. If later implementing shared
numbers, design proper data processing/consent, anti-abuse, deduplication,
moderation, opt-out, clear attribution, and measured server-side
aggregation; do not reuse this local prototype as fabricated evidence.

The current Miora logo animation is **not** part of this phase. Any
future loading animation must preserve the existing approved logo asset
(`dist/assets/logo-source.jpg`) rather than replacing it with a new
mascot or generated logo.

## QA and rollout

Unit tests cover all source categories, all 93 items, localization,
select/replace/remove, malformed and blocked storage, original prices,
favorites independence, no fabricated aggregate counters and album
membership. The Chromium smoke runs TR/390px, RU/320px and EN/1280px:
all three view modes, detail, reload persistence, single-choice behavior,
local album, original cart, no horizontal overflow and accessible
selection status.

This PR is stacked on **Draft PR #37**, which depends on #36 → #35 →
#34. The separate **unapproved second-floor events PR #38 is not a
dependency** and does not enter this branch. No PR has been merged or
published to Miora's production menu as part of this work.

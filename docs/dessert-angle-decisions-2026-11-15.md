# Dessert cover angles — 15 November 2026

## Scope and observed problems

The user's seven named entries were visually inspected at their original packaged resolution: Strawberry Magnolia 430198, Dubai Cup 429872, Bromisu 430207, Pumpkin Magnolia 431299, Lemon Tiramisu 430214, small Magnum Brownie 431304 and large Magnum Brownie 431302.

The large Magnum reference is a pink-coated dessert on a stick with a large flower covering much of the body. It is not the dark-coated small Magnum variant. Several cup references have steep angles, excess background, low contrast or distracting cutlery, coffee cups and branded paper. The small Magnum is already recognizable; its new cover harmonizes the angle, lighting and safe framing with the rest of this set without adding a cut or filling.

## Art direction and factual boundaries

Seven separately generated, visually reviewed AI restagings use a natural three-quarter side angle, clearer side structure, quiet warm background and product-focused framing. Full containers, sticks and dessert silhouettes remain visible. The original square cups, faceted Pumpkin tumbler, stemmed Dubai goblet and elongated Lemon tub remain recognizable. Existing visible garnish is retained modestly; no new ingredient labels are derived from the pictures.

The large Magnum retains pink coating and its wooden stick; the oversized decorative flower is removed. The small Magnum retains dark coating and white drizzle. These are distinct catalog products, not a measured small/large size comparison. Source records for both Magnum variants have no ingredient list or weight, so this change does not invent either, identify the pink flavor or expose a guessed filling. No new cutaway image or recipe is added to any of the seven products.

The new images are **AI serving illustrations / restaged source-menu images**, not newly taken cafe photographs. Actual presentation may differ. Existing original assets remain unmodified and are available as the second gallery frame and via the detail source toggle. Full prompts, source-reference hashes, generated PNG hashes, dimensions, acceptance and all published WebP hashes are in `dessert-angles-2026-11-15.json`.

## Implementation

A separate seven-item photo index extends the existing product-focus resolver. Previous covers, cake interiors and archives retain their own manifests. Default photo selection uses the new cover for these seven IDs; explicit `original` selection still uses the original photo. New variants reuse the existing manual two-frame gallery rather than adding another interaction. Product-focus provenance now describes source-image restaging rather than implying a known recipe for the two Magnum variants.

Grid/list and basket images use contain for this set so the change in source aspect ratio does not crop the stick or vessel. Feed galleries and product details already use contain. Local responsive WebP files are 160/360/640/1200px and are never upscaled. All 28 variants total 889,488 bytes; visitors load an appropriate size. New code/index URLs are versioned to refresh cached clients.

No catalog, recipe, price, category, order, Instagram-source or automatic-rotation behavior is changed. In particular Large Magnum remains unpriced because the source has no listed price; Dubai Cup retains its listed 200 lira price. New images are labelled in RU/TR/EN, including grid and basket surfaces. No external image request, embed, tracking or autoplay is introduced.

## Verification

51 Node tests cover catalog/order integrity, photo precedence, unchanged archive hashes, new asset budgets/hashes, multilingual disclosures and distinct Magnum variants. New manifest/index generation is reproducible in CI. Browser checks cover all seven products at 320/390/1280 CSS pixels, RU/TR/EN and light/dark themes: new-image decoding, contain framing, archive navigation, photo provenance, two-frame counters, grid/list variants, exact Strawberry Magnolia basket identity and exclusion of unpriced large Magnum, horizontal overflow, errors and third-party requests. Axe checks cover the large-Magnum detail view in each combination.

The existing nine cake interiors and their ingredients remain covered by unit tests and targeted browser regression. These checks are browser/emulation evidence, not physical-device, independent human review or measured sales evidence. Exact head, CI, deployment and live artifact status are recorded in the release report after publication.

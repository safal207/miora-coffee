# Complete menu image coverage

Requested: create and insert images for every menu position without photography. Audited all 93 source products. Exactly nine lacked a usable product image. Nine separate images were created using the built-in `image_gen` tool; no external API/CLI fallback was used.

## Generated subjects

- `429448` Iced Chai Tea Latte: chai syrup, milk and ice; no coffee or whipped cream.
- `431314` Mini Cheesecake: plain white-chocolate/cheese style; unspecified fruit/topping is not invented as a named recipe.
- `430199` Banana Magnolia: milk dessert, biscuit crumbs and banana slices.
- `430227` Brownie Bite: one round chocolate brownie bite, no nuts/coconut coatings.
- `431294` Chocolate Muffin: cocoa/chocolate muffin, no icing or fruit.
- `430203` Éclair: conventional plain chocolate-glazed éclair serving concept; the source filling is unspecified, so the picture is not a recipe claim.
- `431747` Muffin: plain unfilled golden muffin because the source recipe is absent.
- `431748` Gluten-free Poğaça: simple plain bun; no unspecified filling or dietary certification artwork.
- `431749` Gluten-free Vegetable Bun: simple vegetable-flecked bun, no specified filling or dietary certification artwork.

Source names, descriptions, prices, nutrition and allergen data are unchanged. In particular, a generated image cannot certify gluten-free preparation or fill a missing allergen declaration. Existing ingredient/allergen cautions remain in product details.

## Presentation and provenance

The nine new visuals are **AI serving illustrations, not actual Miora dish photographs**. RU/TR/EN captions identify them in feed, grid/list and cart. Product details explicitly explain that they were created from the source menu name/ingredients. Actual restaurant photographs retain their existing provenance; previously reviewed restyled images retain their own serving-inspiration treatment.

The remaining source images that had been suppressed for repeated-photo recipe variants are visible again, as requested, with their existing identity chips and serving-image labels. This gives **93/93 product cards a packaged image**; it does not assert 93 distinct actual restaurant photographs.

`generated-menu-illustrations-2026-11-12.json` preserves each complete prompt, built-in tool name, source ingredient text, original generated filename, PNG SHA-256, source dimensions, visual-review status, and each derivative's hash/dimensions/byte count. Source PNGs are preserved in the task's user-facing `outputs/menu-illustrations/` folder; the website consumes local WebP variants at 160/360/640/1200 width targets, never upscaled. Generated assets are separate from source-menu originals and placeholder archives.

## Verification

- Unit checks cover all 93 packaged image references and exactly nine generated identities; immutable source catalog/price checks remain intact.
- Generated-file hashes, native dimensions, responsive srcsets and per-file byte budgets are checked.
- Browser verification covers category membership, one image in every card, actual decoding of all 93 images, nine explicit provenance labels in feed/grid/list, detail images, cart thumbnails/labels, exact nine-item total, persistence, mobile layouts, RU/TR/EN and scoped light/dark accessibility.
- No autoplay, external image requests, tracking, price changes or automatic order submission is introduced.

The original no-photography queue is now visually covered with disclosed AI illustrations. Real owner photos can still replace these concepts later without changing product identities or prices.

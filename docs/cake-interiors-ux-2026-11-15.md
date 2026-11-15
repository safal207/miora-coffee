# Cake interiors and ingredient reveal

## Reference and scope

The requested reference is [Pocitel Coffee](https://safal207.github.io/pocitel-coffee-gazipasa/?lang=ru). Its `cutaway-overlay.js` (blob `8b06a0483b4585ffc9173b163eae788ec3c75524`), `ingredient-reveal.js` (`6d60e76b824e2546b92916caa8d29efa98d49e70`) and `cutaway-media.js` (`97595c9644c7e456bd785e2a87b509109fdc45a0`) were inspected via the GitHub connector on 13 November. The pattern is a serving/interior comparison with a native range control and an on-photo ingredient preview that opens the full menu-derived list. This change adapts the interaction to Miora; no Pocitel food images or recipe claims are copied.

Nine Miora entries receive separately reviewed additional interior illustrations: San Sebastian 430226, pistachio San Sebastian 430222, French white chocolate cheesecake 429826, chocolate cheesecake 429828, coconut cheesecake 429921, raspberry cheesecake 429808, Oreo cheesecake 429822, mini cheesecake 431314 and Malaga cake 429834. Catalog covers, archival source views, prices, IDs and order behavior remain intact. These are the eight cheesecakes and the catalog's Malaga cake, rather than cup desserts, muffins or brownie bites.

## Evidence and limits

The ingredient authority is the committed `source-menu-2026-11-05.json` snapshot. Reopening the source-menu page through web access was unsuccessful; this release does not claim to verify the cafe's current recipe. Eight of the nine entries have nonempty ingredient descriptions. Chocolate cheesecake 429828 does not, so it receives an explicit ask-staff message, no guessed ingredient tags, and no generated ingredient list.

Ingredients are translated token by token, retaining all listed ingredients and their source order. The preview emphasizes three distinctive ingredients only when they occur in that item's source list. Hazelnut in coconut cheesecake remains hazelnut; unspecified `Yağ` in Malaga remains oil/fat rather than being turned into butter. The full list is available in RU/TR/EN. Source allergen information and its existing incompleteness notice remain in product details; these ingredient previews are not allergy guarantees.

All nine new views are **AI cutaway serving illustrations**, not photographs of actual Miora interiors. Ingredient lists do not establish layer order, thickness, texture, recipe proportions or portion weight. Thus the UI says serving, layers and portion size may differ, and that list order does not describe layers. The chocolate illustration follows only its existing visual reference; its unknown recipe stays unknown. San Sebastian illustrations do not invent biscuit bases. Existing whole-cake covers are not used to change portion prices. Malaga preserves the oblong individual cake format, with an explicitly illustrative banana/cream interior consistent with the source ingredients.

`cake-interiors-2026-11-13.json` records the full generation prompts, per-item reference paths and hashes, generated PNG hashes, visual review, dimensions and 36 encoded WebP hashes. Images were generated on 13 November with built-in image_gen, one distinct asset per product, then encoded without upscaling. All 36 responsive files total 1,127,276 bytes; a visitor loads the appropriate size, not all four variants.

## Interaction and mobile presentation

Feed cards offer serving → interior, retaining a third archival view for the three cakes with previously restaged covers. A visible edge, localized cue and native next-photo button explain the manual gallery. Counts now follow the actual number of frames and wrap correctly for both two- and three-frame galleries. Selecting an interior frame opens details directly to the interior. Cover/title entry opens the serving view, with a prominent Inside button.

Details offer explicit Serving/Inside buttons and a native 0–100 range slider. Both endpoints show complete views; intermediate values compare the two different serving illustrations. This is a visual comparison, not a physical X-ray or proof of matching camera geometry. No automatic movement is added to this viewer. Keyboard Home/End/Arrow keys work through the native range input; pressed states and value text follow the selected view.

The ingredient overlay is independent of the generated bitmap: clear translated text, solid theme-aware background, three-item preview and full-list disclosure. It hides in serving mode and becomes available for the interior. Native details and `aria-expanded` stay synchronized, including when the summary is used directly. Unknown ingredients use a noninteractive note. UI controls have at least 44px targets. Product images reserve a 4:3 frame, fit without distortion, use local responsive sources and lazy feed loading. No new external requests, tracking or embed players are introduced. The existing menu spotlight retains its own pause/reduced-motion behavior.

## Validation and delivery

49 Node tests cover unchanged catalog/prices/order logic, original photo retention, all nine assets and provenance hashes, recipe-token completeness, honest missing composition, translations, responsive image budgets, two/three-frame markup and native manual viewer controls. Browser validation covers all nine entries across RU/TR/EN, 320/390/1280 CSS pixels and light/dark themes, ingredient disclosure/expanded state, keyboard slider, gallery wrapping, image decoding, exact Malaga add-to-cart, overflow, uncaught errors and pre-click external requests. Axe checks cover the open ingredient viewer in each of the 18 combinations.

These are desktop browser/emulation checks, not physical-phone, screen-reader-user or sales-conversion evidence. Publication requires successful exact-head PR CI, then successful main/Pages deployment and live verification; final statuses, SHA/tree and evidence links belong in the delivery report.

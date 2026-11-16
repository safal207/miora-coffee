# Optional dessert 360° viewer

## Product decision

Seven recently refreshed desserts receive an optional, manually controlled turntable: Strawberry Magnolia, Dubai Cup, Bromisu, Pumpkin Magnolia, Lemon Tiramisu and the small/large Magnum brownies. A compact 360° button sits beside the existing photo navigation; normal product details also offer an entry. Other products retain their current photos and cake-interior controls.

The viewer presents **12 AI-estimated perspectives in a circular sequence**. Generated atlases preserve the recognizable vessels, coverings and existing garnish, and were visually reviewed before acceptance. The large Magnum remains pink, the small one dark with white decoration. No new cuts, fillings, ingredients, recipe proportions or portion weights are inferred. Unseen sides are explicitly described as reconstructed AI views. The sequence is an illustrative browsing effect; its positions are not calibrated camera-angle measurements or a physical 3D scan. Small shape/texture variation between generated views remains possible.

The prompt/reference/output hashes and tile layout are recorded in `turntable-provenance-2026-11-16.json`. Each product has one distinct built-in image_gen contact-sheet generation. Original photos, restaged covers and their provenance remain independently available. No source image is overwritten.

## Customer flow

Feed → 360° button → optional viewer → drag/previous/next/native range → add the exact product or return to photos. Product name, actual catalog price and a regular add-to-list action stay beside the interaction. The duplicate lower add action is omitted while the viewer is active. Unpriced large Magnum remains an ask-price entry and receives no add action.

Dragging horizontally changes real displayed frame pixels. Previous/next wrap from the last frame to the first and vice versa. The native range offers keyboard arrows/Home/End and a localized view-number value. A price or ingredient list never comes from the generated images. The existing 93-item catalog, prices, order calculations and staff-list behavior remain intact. No sales uplift is claimed.

The viewer has no automatic product rotation. A small directional glyph gets one bounded hint animation; reduced-motion preference disables it. Vertical touch scrolling and pinch zoom remain available. Closing, switching to another item, returning to photos or changing the detail view aborts pending loading and releases drawing/listener resources. A failed load keeps the poster, ordinary photos and order information, with retry and return actions. A native image-decoding fallback supports environments without ImageBitmap.

Direct links may request `?lang=ru&view=feed&item=431302&photo=spin`. Unsupported product IDs cannot activate a nonexistent viewer and fall back to their normal detail view. Source-photo actions preserve the original source view.

## Accessibility and presentation

RU/TR/EN cover all entry names, controls, status, AI provenance, errors and retry. Buttons have at least 44px targets; the native range and explicit previous/next buttons provide alternatives to a drag gesture. Labels and selected view text stay synchronized. Focus goes to the return control when changing to 360°, and back to the launcher when returning to photos. The user is never forced to wait for a frame load before returning.

The native range and keyboard behavior follow the [W3C slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/); explicit buttons also avoid depending solely on a slider gesture. Browser emulation cannot establish physical-device assistive-technology support. Existing product/source descriptions and ingredient information remain available below the viewer.

## Loading, performance and privacy

No atlas is fetched during normal feed or photo viewing. Only explicit 360° activation, including an intentional direct link, fetches the selected local atlas. All seven encoded atlases total **1,013,200 bytes**, with the largest **216,430 bytes**. A single active view uses a 2D canvas, draws only on demand, coalesces redraws with requestAnimationFrame and crops native-sized tiles. It adds no 3D library, external player, iframe, tracking, video autoplay or third-party image request.

The small 4×3 atlases contain 12 square source frames. Tile edges are inset by two pixels to exclude generated grid lines; no food content is creatively altered by this extraction. Generated source dimensions are retained without upscaling the published assets. The square stage reserves space before loading. Underlying regular photos remain at their existing higher-resolution responsive sizes.

## Verification

54 Node tests cover catalog/order invariants, circular indexing, tile bounds, source/output hashes and budgets, seven-item membership, multilingual disclosure, no eager atlas markup and priced/unpriced actions.

Browser matrix: seven products × RU/TR/EN × 320/390/1280 CSS pixels × light/dark. Checks include no atlas before activation, selected-atlas-only loading, changed canvas pixels, last/first wrapping, native keyboard range, matching visible/accessibility view labels, reduced motion, returning to photos with focus, exact priced product add and no add for unpriced large Magnum. Axe scans cover the open turntable in all 18 language/size/theme combinations; overflow, page errors and pre-click third-party requests are monitored.

Additional browser tests exercise an actual emulated touch drag, retained vertical modal scrolling, unsupported-item fallback, failed-sheet poster/retry, close during pending loading and fallback decoding without ImageBitmap. Existing photo galleries, cake interiors and normal views are checked separately. These are browser/emulation results, not physical-phone, screen-reader-user, independent review or sales evidence. Exact CI/deployment/live status is recorded in the release report after successful publication.

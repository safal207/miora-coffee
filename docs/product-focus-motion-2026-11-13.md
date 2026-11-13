# Product focus and controlled movement — 13 November 2026

## Decision

The audited catalog contains 93 products. Two drink covers (460119, 460120) and four dessert covers (429921, 429808, 429822, 429833) were selected for AI restaging because flowers, other products or tray context competed with the sold product. The reviewed contact sheets are retained in the working QA pack. Other covers keep their current product identity; packaged goods keep their packaging rather than inventing an unpacked appearance.

The six replacements preserve the reference product, visible ingredients and recognizable glass/cake. The product is centered against a quiet background, with safe margins for the entire glass or plate. Feed frames stay 4:3, use contain for these six covers, and maintain a stable height. Whole cakes were not invented as new plated slices. All prices, recipes and product IDs remain those of the catalog; no photo establishes serving weight or availability.

These are **AI serving illustrations**, not photographs of actual Miora servings or newly photographed angles. `focused-menu-images-2026-11-13.json` records the full per-asset prompt, reference path/hash, generated PNG hash, dimensions and published WebP hashes. Original assets remain separately addressable. One reference (429921) was already AI-restyled; its second frame says so rather than calling it an original restaurant photo.

## Customer path

Category circle → one compact product spotlight → taste groups → static product/price/add controls → exact product details → order list. No automatic add, invented discount, scarcity or best-seller claim.

The six affected feed cards offer a manual two-frame gallery: restaged cover → source image. A narrow visible edge, localized swipe hint and 44px button explain the action. One visible gallery gets one 650ms, 7px cue per render; no repeating card animation. Each frame labels its origin, and opening details preserves the selected frame. Details also offer a source/cover switch. Swipe gestures do not intentionally trigger a product click. Source images retain their own original crop and are provided for transparency, not advertised as another real camera angle.

The single spotlight uses up to three distinct images from the selected category, with actual listed prices and a details CTA. Configurable breakfast/sandwich/pancake entries are excluded to avoid showing source catalog prices as configured prices; their existing builder entry points remain available. Spotlight is absent from search, favourites, grid and list views. Feed cards never auto-rotate.

## Timing evidence and limits

[NordicScreen’s Burger King case](https://nordicscreen.com/cases/burgerking-case) confirms digital menus, dynamic video/animation and scheduled campaigns in Burger King Scandinavia. It does **not** publish a kiosk dwell time or transition duration. The public sources checked did not establish a universal Burger King timing. We did not measure a physical kiosk.

Miora therefore uses **7000ms between automatic slide starts** and **650ms horizontal transitions**, as a configurable design hypothesis prompted by the user's observation. This is not a Burger King specification or a demonstrated conversion optimum. 0.7 seconds means 700 milliseconds, not 0.7 milliseconds. There is no claim that these changes have increased sales.

The next useful validation is an observed usability session comparing whether people notice the spotlight, understand pause/swipe, and reach details/add without accidental interaction; a conversion claim would require actual consented measurement and a suitable comparison.

## Accessibility, performance and privacy

[W3C carousel guidance](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) informs the visible pause/resume control first in carousel tab order, previous/next buttons, persistent stop after focus or manual interaction, hover suspension and correctly hidden inactive slides. Auto movement is off initially under reduced-motion preference and transition duration becomes zero; a user may explicitly request rotation. Opening a dialog stops rotation until explicit resume. Hidden documents and offscreen spotlights suspend timers. Render cleanup disconnects all motion observers/listeners/timers.

No video autoplay, Instagram iframe, third-party script, tracking request or external image request is added. The spotlight uses local 160px WebP thumbnails; cards use responsive 160/360/640/1200px assets, lazy loading and reserved image frames. Images are not upscaled. Source links and existing consent-free outbound Instagram actions remain intact.

## Validation

46 Node tests cover catalog/order integrity, all-category membership, distinct spotlight sources, source preservation, generated labels, asset hashes and image budgets. Browser QA covers RU/TR/EN at 320/390/1280 CSS pixels, reduced motion, gallery/source navigation, static product membership, overflow, axe checks, external requests and one real-time automatic advance/pause scenario. Browser emulation does not constitute a physical phone, kiosk, assistive-technology user or sales experiment.

Publication is gated on this branch's exact-head GitHub validation, then Pages deployment and live verification. Evidence artifacts and final commit/PR/deployment states are recorded in the release report.

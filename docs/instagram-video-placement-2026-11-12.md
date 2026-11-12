# Instagram videos in the menu — 2026-11-12

## Source verification

All three supplied URLs opened in the browser without signing in after dismissing Instagram's optional sign-in prompt. Account: **@mioracoffeetr**. Search/fetch tools could not retrieve these URLs; verification used visible captions and video frames, not search guesses. This is a dated observation, not a promise of future availability.

| Original source | Observed content | Menu relationship and placement |
| --- | --- | --- |
| https://www.instagram.com/p/DTuzdlJDbe2/ | Croissant sandwich preparation; caption discusses croissants and orange juice. Visible frame shows cheese and greens being placed in a croissant. | Compact card directly below the sandwich introduction; local CTA opens Croissant Sandwich **430356** details. Also available in that product's details. Explicitly distinguishes the croissant video from the separate bread/filling builder. Does not add croissant as a builder bread. |
| https://www.instagram.com/p/DVIdcx1jcAN/ | Strawberry cup dessert; visible frame shows strawberries, cream and crumb layers. | Card before dessert/catalog results in all, featured and desserts **46818** only; hidden during search and unrelated/favorites filters. CTA selects actual dessert catalog. Caption does not establish an exact menu SKU, so no automatic “buy this video dessert” or implied price. |
| https://www.instagram.com/p/DTXNw46jQ5E/ | Breakfast plates and tea at a table; caption describes breakfast and self-service. | Below Breakfast 2.0 introduction, on its first selection step, and in Breakfast Plate **431203** details. Serving-inspiration disclaimer; no claim that video equals the configured ingredients or current service policy. |

## Interaction decisions

- Menu actions remain on the site. Watching explicitly opens Instagram in a new tab with `noopener noreferrer` and no referrer; the order stays in its existing tab.
- Cart and staff summary have no video promotions. Both custom and regular order behavior are retained. Sales improvement is a design hypothesis; no conversion increase has been measured.
- All titles, disclosures, actions, sign-in/new-tab hints and accessible link names have RU/TR/EN copy. Native links/buttons retain keyboard behavior and visible focus. Light and dark themes use existing tokens; touch targets are at least 44px high.
- No autoplay, embedded player, iframe, Instagram JavaScript, remote cover URLs, tracking, preconnect or background availability requests. No Instagram connection until the visitor clicks. Fixed cover boxes avoid image-load shifts; no asynchronous video insertion or auto-scrolling. The dessert CTA moves/focuses the results only on explicit activation.
- Covers reuse existing local menu assets: croissant `assets/enhanced/430350-160.webp`, breakfast `assets/products/431203.jpg` (51,737 bytes), dessert `assets/products/430198.jpg` (28,909 bytes). Visible labels say **menu photo, not a video frame**. The dessert cover is not evidence that the video is menu SKU 430198. No new photo or video binaries are added. Small WebP croissant cover plus the two fallback JPEGs are lazy-loaded; dialogs use text-only cards.
- Original videos and music remain hosted by their original platform/account. Attribution and exact supplied source links remain visible. No video download, rehosting, fabricated thumbnail or removal of attribution.
- Instagram may require login or become unavailable later. The menu, local product CTAs and basket work independently; the cards warn about a possible sign-in requirement. No fake in-site playback/error detection.

## Validation

- 39 Node tests pass, including catalog integrity, prices, configured breakfast/sandwich and video privacy/filter behavior.
- Catalog and photo-index regeneration produce no changes. JavaScript syntax and authored whitespace checks pass.
- Local Chromium: 18 combinations, widths **320/390/1280**, **RU/TR/EN**, **light/dark**. No page overflow or uncaught errors. Scoped axe checks report zero violations for video cards. Confirmed no third-party requests before activation, separate-tab opening with no opener, and persistent configured breakfast add/edit/cart behavior. Desktop browser emulation; not a physical-device test or a full-site accessibility audit.
- PR CI and deployed-site results are linked in the delivery report after they complete; local checks alone do not establish publication.

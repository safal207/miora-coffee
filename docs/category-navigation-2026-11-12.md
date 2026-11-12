# Category circles must visibly navigate

The category buttons previously changed the filtered catalog below the long sandwich/breakfast discovery section, outside the visitor's viewport. A changed border alone did not show the outcome. Rebuilding all navigation buttons also discarded keyboard focus.

Selecting a category now starts a fresh browse: clears the search, updates the existing buttons' pressed state, announces the category/count, and immediately positions the result heading beneath the sticky controls. The category circles remain available above the search toolbar so visitors can switch again without passing through the discovery section. Selecting the current category returns to its first result. The original builders remain available above the results when scrolling upward.

The sticky offset follows the actual rendered circle-row height using ResizeObserver, including translated labels. Navigation uses a single immediate user-triggered scroll, with no animation or delayed scroll. Keyboard focus and horizontal row position survive selection. Dessert discovery uses the same result-navigation behavior. Feed, grid, list, favorites and order contents retain their existing roles.

Validation before publication:

- 40 existing integrity tests pass; JavaScript syntax and whitespace checks pass.
- Chromium at 320/390/1280 px in RU/TR/EN: 9 scenarios pass.
- Checked contradictory search → category selection; correct category membership; heading below both sticky rows; first non-promotional product visible; changing category after scrolling; keyboard Enter; grid/feed switching; no page overflow or uncaught errors.
- Scoped axe check for category navigation reports zero violations.
- Desktop browser emulation, not physical-device testing. No measured conversion claim.

PR CI and Pages deployment are verified separately after these local checks.

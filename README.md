# Miora Coffee

[Open the feed](https://safal207.github.io/miora-coffee/?view=feed) · [Лента на русском](https://safal207.github.io/miora-coffee/?view=feed&lang=ru) · [Русский](https://safal207.github.io/miora-coffee/?lang=ru) · [Türkçe](https://safal207.github.io/miora-coffee/?lang=tr) · [English](https://safal207.github.io/miora-coffee/?lang=en)

Three-language, mobile-first digital menu concept, inspired by the existing Robys menu experience. The catalog retains all 93 products from Miora Coffee's AKINSOFT menu captured on 2026-11-05. The original 92 available photos and logo are local assets. Two unpriced dishes are visible but cannot be ordered; one dish has no source photo.

The local order list supports quantity changes, a single optional companion item, dine in / takeaway, persistence across pages and tabs, a Turkish staff summary, a text QR and copying. It never submits an order or charges a payment. Favorites and view counts are device-local. Source ingredients remain in their original Turkish wording, with explicit language labels in translated interfaces. The original source lists are not treated as exhaustive allergen declarations. One suspicious calorie entry is marked for confirmation; no vitamin values are invented.

## Photo feed

The default is a mobile-first, grouped photo menu. Category circles lead to real products; taste collections jump within the complete catalog without hiding the other choices. Compact photo cards expose the name, price and one add/build action. A photo opens composition and the heart saves a favorite. Search, grid/list modes, shared orders and saved items remain available. Source photos, serving illustrations and positions awaiting photography are distinguished. Thirty source-menu originals now have responsive local WebP variants; no new food photography was invented.

[Mobile preview](docs/feed-mobile-preview.jpg) · [Feed QA](docs/feed-2026-11-06.md)

## Develop and verify

This is a buildless static app. Serve `dist/` using the supported Sites preview. `python scripts/build-data.py` reproducibly rebuilds the catalog from the raw capture. `npm test` verifies complete source parity, local assets, integer monetary totals, unpriced exclusions, quantity validation, atomic pairing and search/filter behavior. Browser QA is recorded in `docs/QA.md` when completed.

GitHub Actions runs catalog reproducibility, JavaScript syntax and all integrity tests before deploying `dist/` to GitHub Pages. Pull requests run validation only. In repository Settings → Pages, select GitHub Actions as the source.

Photos and branding belong to their respective owners and are used from the supplied source menu. The bundled QR implementation is by Kazuhiko Arase under its included MIT license (`dist/assets/qr-LICENSE.txt`).

## Photography

Retouched photos are served as responsive 160/640/1200 px WebP assets. Original source files remain available as fallbacks. See [photo refresh](docs/photo-refresh-2026-11-06.md) and its asset manifest for coverage and provenance. Run `python scripts/build-photos.py` after adding reviewed exports.

## Instagram videos

Three source-linked videos support sandwich, Breakfast 2.0 and dessert discovery without embedded players. Covers are explicitly labelled menu photos. See [source verification and UX decisions](docs/instagram-video-placement-2026-11-12.md).

## Complete image coverage

All 93 menu cards now have a packaged visual. Nine newly generated serving illustrations are explicitly labelled in RU/TR/EN; the original menu records and prices are unchanged. See [generation provenance and prompts](docs/generated-menu-illustrations-2026-11-12.md).

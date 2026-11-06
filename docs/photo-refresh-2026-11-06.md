# Menu photography refresh

Source revision: `2c0d3d00cc40f06cd291919c24b87d5093a1a959`.

The first published set contains 18 individually retouched source photographs,
covering 36 menu products that shared those exact source files. This is a
partial rollout of the 84 products with actual photography. Eight source
entries contain only the Miora logo; one has no image. They remain explicit
placeholders instead of invented food photographs.

The built-in image-generation tool used each original as its edit target.
The prompt requested natural iPhone-style cafe photography, denoising, clean
texture, corrected exposure, soft side window light and clearer hero framing.
It required preserving the pictured product, portion, ingredients, cup/dish,
and branding, with no invented toppings, extra dishes or overlaid graphics.
The photographs are editorial retouches, not new photographs taken at the cafe.

Responsive WebP exports are 160, 640 and 1200 pixels square. ImageMagick is
used only for resizing and encoding the generated results. Original source
JPEGs remain in the repository as reference and runtime fallbacks. Matching
source bytes share a retouch. The asset manifest records source/output hashes,
product mappings, dimensions, file sizes and visual-review state.

The feed and product details use responsive sources; story circles, compact
lists and the cart use small thumbnails. Product-detail photos fit inside the
viewer so the full product is visible. Prices, ingredients, calorie information
and order behavior are unchanged.

Validation: 15 Node tests cover catalogue parity, order integrity, complete
photo indexing, asset identity/digests, WebP files and responsive source mapping.
CI regenerates the photo index and rejects missing, mismatched or unreviewed
published assets. Browser checks are recorded after deployment.

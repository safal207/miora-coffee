import {photoUrl} from './photos.js?v=20261117-curated1';

// Frame the specific menu image so a replacement image starts with the default crop.
// Entries specify object position, optional zoom, and optional detail aspect ratio.
const frames = new Map([
  ['assets/enhanced/428743-640.webp', ['50% 51%']], // Americano cup and saucer
  ['assets/enhanced/428772-640.webp', ['50% 57%']], // Cappuccino foam and handle
  ['assets/enhanced/428748-640.webp', ['50% 58%']], // Latte art and saucer
  ['assets/enhanced/428974-640.webp', ['50% 51%', 1.16]], // Espresso cup
  ['assets/originals/430356-640.webp', ['50% 49%']], // Croissant and filling
  ['assets/enhanced/430236-640.webp', ['50% 69%', 1.05]], // Sandwich over table setting
  ['assets/originals/431742-640.webp', ['45% 50%', 1.10]], // Muffin texture
  ['assets/originals/431203-640.webp', ['50% 8%', 1, .86]], // Breakfast tray and sides
  ['assets/enhanced/431293-640.webp', ['50% 65%', 1.04]], // Both date bites
  ['assets/enhanced/430226-640.webp', ['51% 57%']], // Cheesecake slice
  ['assets/originals/431745-640.webp', ['48% 50%', 1.08]] // Cookie and topping
]);

export function dishFrameStyle(item, variant = 'focus') {
  const frame = frames.get(photoUrl(item, 640, variant));
  if (!frame) return '';
  const [position, scale = 1, detailRatio = 1.25] = frame;
  return `style="--dish-position:${position};--dish-scale:${scale};--dish-detail-ratio:${detailRatio}"`;
}

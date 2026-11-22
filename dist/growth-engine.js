// Miora Growth Engine v1. Zero discounts, checkout changes or network tracking.
// Business rules use existing source-menu IDs and the exact catalog prices.
const FOOD_CATEGORIES = new Set(['46818', '46885']);
const DESSERT_CANDIDATES = ['430226', '430350'];
const DRINK_CANDIDATES = ['428772', '428748'];
export const GROWTH_STORAGE_KEY = 'miora:growth-events:v1';
export const GROWTH_EVENT_TYPES = Object.freeze([
  'menu_visit', 'product_open', 'cart_add', 'cart_open',
  'offer_visible', 'offer_accepted', 'offer_dismissed',
  'staff_preview', 'order_copied', 'cart_cleared'
]);
const isValidPrice = item => Number.isSafeInteger(item?.price) && item.price > 0;
const isProductId = id => typeof id === 'string' && /^\d{5,7}$/.test(id);

/** A relevant, optional complement; never a discount or a hidden cart addition.
 * If the basket already combines food and drinks, do not keep trying to upsell.
 * Suppression is session-level and always wins over merchandising.
 */
export function selectCartOffer({cart = {}, configuredOrders = [], catalog, suppressed = false} = {}) {
  if (suppressed || !(catalog instanceof Map)) return null;
  const regular = Object.entries(cart || {}).filter(([id, qty]) =>
    Number.isInteger(qty) && qty > 0 && isValidPrice(catalog.get(id))
  );
  const customCount = Array.isArray(configuredOrders) ? configuredOrders.length : 0;
  if (!regular.length && !customCount) return null;
  const hasFood = customCount > 0 || regular.some(([id]) => FOOD_CATEGORIES.has(catalog.get(id).cat));
  const hasDrink = regular.some(([id]) => !FOOD_CATEGORIES.has(catalog.get(id).cat));
  if (hasFood && hasDrink) return null;
  const candidates = hasFood ? DRINK_CANDIDATES : DESSERT_CANDIDATES;
  for (const id of candidates) {
    const item = catalog.get(id);
    if (isValidPrice(item) && !Object.hasOwn(cart || {}, id)) return item;
  }
  return null;
}

export function readGrowthEvents(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(GROWTH_STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.slice(-200).filter(entry =>
      entry && typeof entry === 'object' &&
      GROWTH_EVENT_TYPES.includes(entry.type) &&
      Number.isSafeInteger(entry.at) && entry.at >= 0 &&
      (entry.productId === null || isProductId(entry.productId))
    ).map(({type, at, productId}) => ({type, at, productId}));
  } catch { return []; }
}

/** Local, bounded, anonymous diagnostic events. Nothing is sent to a server. */
export function recordGrowthEvent(storage, type, productId = null, at = Date.now()) {
  if (!GROWTH_EVENT_TYPES.includes(type) || !Number.isSafeInteger(at) || at < 0 ||
      (productId !== null && !isProductId(productId))) return false;
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    const next = [...readGrowthEvents(storage), {type, productId, at}].slice(-200);
    storage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch { return false; }
}

export function growthSummary(events) {
  const counts = Object.fromEntries(GROWTH_EVENT_TYPES.map(type => [type, 0]));
  for (const event of Array.isArray(events) ? events : []) {
    if (event && Object.hasOwn(counts, event.type)) counts[event.type]++;
  }
  return {
    counts,
    // An interaction metric, not a payment conversion or confirmed revenue metric.
    offerTakeRate: counts.offer_visible ? counts.offer_accepted / counts.offer_visible : null
  };
}

export function normalizeCart(value, catalog) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const clean = {};
  for (const [id, qty] of Object.entries(value)) {
    const item = catalog.get(id);
    if (item && Number.isSafeInteger(item.price) && item.price > 0 && Number.isInteger(qty) && qty >= 1 && qty <= 99) clean[id] = qty;
  }
  return clean;
}
export function totals(cart, catalog) {
  return Object.entries(normalizeCart(cart,catalog)).reduce((sum,[id,qty]) => ({count:sum.count+qty,price:sum.price+catalog.get(id).price*qty}),{count:0,price:0});
}
export function updateCart(cart, id, delta, catalog) {
  const next = normalizeCart(cart,catalog);
  const item = catalog.get(id);
  if (!item || !Number.isSafeInteger(item.price) || item.price <= 0 || !Number.isInteger(delta)) return next;
  const qty = (next[id] || 0) + delta;
  if (qty > 99) return next;
  if (qty <= 0) delete next[id]; else next[id] = qty;
  return next;
}
export function addBundle(cart, lines, catalog) {
  const next = normalizeCart(cart, catalog);
  for (const [id, quantity] of lines) {
    const price = catalog.get(id)?.price;
    const total = (next[id] || 0) + quantity;
    if (!Number.isSafeInteger(price) || price <= 0 || !Number.isInteger(quantity) || quantity < 1 || total > 99) return null;
    next[id] = total;
  }
  return next;
}
export function addPair(cart, ids, catalog) {
  return addBundle(cart, ids.map(id => [id, 1]), catalog);
}
export function fold(value) {return String(value).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');}
export function resolveView(requested, saved) {
  const allowed = ['feed', 'grid', 'list'];
  return allowed.includes(requested) ? requested : allowed.includes(saved) ? saved : 'feed';
}
export function filterProducts(products, {category='featured',search='',favorites=[],featured=[]}={}) {
  const query = fold(search.trim());
  return products.filter(p => (category==='all'||category==='featured'&&featured.includes(p.id)||category==='favorites'&&favorites.includes(p.id)||p.cat===category) && (!query || fold(Object.values(p.name).join(' ')+' '+p.description).includes(query)));
}

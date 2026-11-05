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
export function addPair(cart, ids, catalog) {
  let next = normalizeCart(cart,catalog);
  if (ids.some(id => !catalog.get(id)?.price || (next[id] || 0) >= 99)) return null;
  for (const id of ids) next = updateCart(next,id,1,catalog);
  return next;
}
export function fold(value) {return String(value).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');}
export function filterProducts(products, {category='featured',search='',favorites=[],featured=[]}={}) {
  const query = fold(search.trim());
  return products.filter(p => (category==='all'||category==='featured'&&featured.includes(p.id)||category==='favorites'&&favorites.includes(p.id)||p.cat===category) && (!query || fold(Object.values(p.name).join(' ')+' '+p.description).includes(query)));
}

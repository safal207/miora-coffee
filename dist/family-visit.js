import {photoKind, photoUrl} from './photos.js?v=20261117-curated1';
import {dishFrameStyle} from './photo-framing.js';
import {journeyCopy} from './desire-journey.js?v=20261112-generated1';

const labels = (tr, ru, en) => ({tr, ru, en});

export const familyCombos = Object.freeze({
  'family-mini': {
    title: labels('Küçük atıştırmalık', 'Маленький перекус', 'Small snack'),
    size: labels('S · 1 yiyecek + 1 içecek', 'S · 1 блюдо и 1 напиток', 'S · 1 snack and 1 drink'),
    lines: [['431742', 1], ['431458', 1]]
  },
  'family-meal': {
    title: labels('Doyurucu mola', 'Сытный перекус', 'Filling snack'),
    size: labels('M · sandviç ve içecek', 'M · сэндвич и напиток', 'M · sandwich and drink'),
    lines: [['430356', 1], ['431459', 1]]
  },
  'family-share': {
    title: labels('Paylaşmalık', 'Перекус на двоих', 'Snack for two'),
    size: labels('2 yiyecek + 2 içecek', '2 блюда и 2 напитка', '2 snacks and 2 drinks'),
    lines: [['430356', 1], ['431742', 1], ['431459', 2]]
  }
});

export const familyCopy = {
  tr: {entry:'Çocuk menüleri', title:'Çocuklarla MIORA', room:'Bebek bakım odası', roomText:'Tuvalet ve alt değiştirme masası olan ayrı bir bebek bakım odası var.', roomPhoto:'Bebek Bakım Odası tabelası', check:'İçerik ve alerjen bilgisi için ürüne dokunun veya ekibe sorun.', add:'Menüyü ekle', welcome:'Miora’yı yanına al'},
  ru: {entry:'Детские комбо', title:'С детьми в MIORA', room:'Комната для ухода за малышом', roomText:'Есть туалет и отдельная комната с пеленальным столиком.', roomPhoto:'Табличка «Baby Care Room» в MIORA', check:'Нажмите на блюдо, чтобы узнать состав. Аллергены можно уточнить у сотрудника.', add:'Добавить комбо', welcome:'Возьми MIORA с собой'},
  en: {entry:'Kids’ combos', title:'With kids at MIORA', room:'Baby care room', roomText:'There’s a restroom and a separate baby care room with a changing table.', roomPhoto:'Baby Care Room sign at MIORA', check:'Tap an item for ingredients. Ask the team about allergens.', add:'Add combo', welcome:'Take MIORA with you'}
};

export function renderFamilyVisit(root, {byId, lang, money, esc, name, social}) {
  const c = familyCopy[lang];
  const combos = Object.entries(familyCombos).map(([id, combo]) => {
    const items = combo.lines.map(([itemId, quantity]) => [byId.get(itemId), quantity]);
    if (items.some(([item]) => !item?.price)) return '';
    const price = items.reduce((sum, [item, quantity]) => sum + item.price * quantity, 0);
    const photos = items.map(([item, quantity], index) => {
      const kind = photoKind(item);
      const caption = kind === 'generated' ? journeyCopy[lang].generated : kind === 'illustration' ? journeyCopy[lang].illustration : '';
      return `<button type="button" class="family-photo${index === 0 ? ' family-photo-main' : ''}" data-detail="${item.id}" aria-label="${esc(name(item))}">
        <img src="${photoUrl(item, 640)}" ${dishFrameStyle(item)} loading="lazy" decoding="async" alt="">
        ${caption ? `<small class="family-photo-note">${esc(caption)}</small>` : ''}
        ${quantity > 1 ? `<span class="family-photo-quantity" aria-hidden="true">×${quantity}</span>` : ''}
      </button>`;
    }).join('');
    return `<article class="family-card share-target" id="${id}" aria-labelledby="${id}-title">
      <div class="family-photos" data-view-id="${id}">${photos}</div>
      <div class="family-card-copy">
        <p class="family-size">${esc(combo.size[lang])}</p>
        <h3 id="${id}-title">${esc(combo.title[lang])}</h3>
        <ul class="family-combo-items">${items.map(([item, quantity]) =>
          `<li><button type="button" data-detail="${item.id}">${quantity > 1 ? quantity + ' × ' : ''}${esc(name(item))}</button></li>`).join('')}</ul>
        ${social(id)}
        <button type="button" class="button primary family-add" data-family-add="${id}">${esc(c.add)} · ${money(price)}</button>
      </div>
    </article>`;
  }).join('');
  root.innerHTML = `<h2 id="family-title" tabindex="-1">${esc(c.title)}</h2>
    <div class="family-grid">${combos}</div>
    <p class="family-note">${esc(c.check)}</p>
    <article class="family-care family-card share-target" id="family-care" aria-labelledby="family-care-title">
      <div class="family-care-photo" data-view-id="family-care">
        <img src="assets/family/baby-care-sign.webp" width="960" height="422" loading="lazy" decoding="async" alt="${esc(c.roomPhoto)}">
      </div>
      <div class="family-card-copy"><h3 id="family-care-title">${esc(c.room)}</h3><p>${esc(c.roomText)}</p>${social('family-care')}</div>
    </article>`;
}

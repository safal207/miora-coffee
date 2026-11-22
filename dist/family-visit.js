import {photoKind, photoUrl} from './photos.js?v=20261122-merch1';
import {dishFrameStyle} from './photo-framing.js?v=20261122-merch1';
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
  tr: {entry:'Çocuk menüleri', title:'Çocuklarla MIORA', changingTable:'Bebek alt değiştirme masası var.', check:'İçerik için ürüne dokunun. Alerjenleri ekibe sorun.', add:'Menüyü ekle'},
  ru: {entry:'Детские комбо', title:'С детьми в MIORA', changingTable:'Есть пеленальный столик.', check:'Состав — по нажатию на блюдо. Об аллергенах спросите сотрудника.', add:'Добавить комбо'},
  en: {entry:'Kids’ combos', title:'With kids at MIORA', changingTable:'A baby changing table is available.', check:'Tap an item for ingredients. Ask the team about allergens.', add:'Add combo'}
};

export function renderFamilyVisit(root, {byId, lang, money, esc, name, overlay, scope}) {
  const c = familyCopy[lang];
  const combos = Object.entries(familyCombos).map(([id, combo]) => {
    const items = combo.lines.map(([itemId, quantity]) => [byId.get(itemId), quantity]);
    if (items.some(([item]) => !item?.price)) return '';
    const price = items.reduce((sum, [item, quantity]) => sum + item.price * quantity, 0);
    const photos = items.map(([item, quantity], index) => {
      const kind = photoKind(item);
      const caption = kind === 'generated' ? journeyCopy[lang].generated : kind === 'illustration' ? journeyCopy[lang].illustration : '';
      return `<button type="button" class="family-photo${index === 0 ? ' family-photo-main' : ''}" data-detail="${item.id}" aria-label="${esc(name(item))}">
        <img src="${photoUrl(item, index===0?640:160)}" ${dishFrameStyle(item)} loading="lazy" decoding="async" alt="">
        ${caption ? `<small class="family-photo-note">${esc(caption)}</small>` : ''}
        ${quantity > 1 ? `<span class="family-photo-quantity" aria-hidden="true">×${quantity}</span>` : ''}
      </button>`;
    }).join('');
    return `<article class="family-card share-target" id="${id}" aria-labelledby="${id}-title">
      <div class="family-photos photo-surface" data-photo-count="${items.length}" data-view-id="${id}">${photos}${overlay(id,money(price))}</div>
      <div class="family-card-copy">
        <p class="family-size">${esc(combo.size[lang])}</p>
        <h3 id="${id}-title">${esc(combo.title[lang])}</h3>
        <ul class="family-combo-items">${items.map(([item, quantity]) =>
          `<li><button type="button" data-detail="${item.id}">${quantity > 1 ? quantity + ' × ' : ''}${esc(name(item))}</button></li>`).join('')}</ul>
        <button type="button" class="button primary family-add" data-family-add="${id}" aria-label="${esc(c.add+' · '+combo.title[lang])}">${esc(c.add)}</button>
      </div>
    </article>`;
  }).join('');
  root.innerHTML = `<h2 id="family-title" tabindex="-1">${esc(c.title)}</h2><small class="photo-scope">${esc(scope)}</small>
    <div class="family-grid">${combos}</div>
    <p class="family-note">${esc(c.check)}</p>
    <p class="family-note family-changing-table" id="family-changing-table">${esc(c.changingTable)}</p>`;
}

import {categories, products} from './menu-data.js';
import {filterProducts} from './core.js';
import {photoUrl, photoSet, photoKind} from './photos.js?v=20261117-curated1';
import {dishFrameStyle} from './photo-framing.js';
import {journeyCopy} from './desire-journey.js?v=20261112-generated1';

export const kioskCopy = {
  tr: {entry:'Kiosk', exit:'Menüye dön', title:'Hızlı seçim', coffee:'Kahve', food:'Atıştırmalık', pairs:'Kahve ve tatlı', coffeeTitle:'Kahve klasikleri', foodTitle:'Yiyecek ve fırın ürünleri', pairsTitle:'Kahve ve tatlı ikilileri', pairAdd:'İkisini ekle', categories:'Kategoriler', portion:'Espresso', single:'Tek', double:'Çift', nextGuest:'Bitir ve yeni liste aç'},
  ru: {entry:'Киоск', exit:'В меню', title:'Быстрый выбор', coffee:'Хочу кофе', food:'Перекусить', pairs:'Кофе с десертом', coffeeTitle:'Кофейная классика', foodTitle:'Еда и выпечка', pairsTitle:'Кофе с десертом', pairAdd:'Добавить обе', categories:'Категории', portion:'Эспрессо', single:'Один шот', double:'Двойной', nextGuest:'Завершить и начать новый заказ'},
  en: {entry:'Kiosk', exit:'Back to menu', title:'Quick picks', coffee:'Coffee', food:'A bite to eat', pairs:'Coffee & dessert', coffeeTitle:'Coffee classics', foodTitle:'Food & bakery', pairsTitle:'Coffee & dessert pairings', pairAdd:'Add both', categories:'Categories', portion:'Espresso', single:'Single', double:'Double', nextGuest:'Finish and start a new order'}
};

const drinks = ['428743', '428772', '428748'];
const food = ['430356', '430236', '431742', '431203'];
const groups = {coffee:'428748', food:'430356', pairs:'430226'};
const cardSizes = '(max-width: 620px) 47vw, (max-width: 800px) 46vw, 260px';
const pairSizes = '(max-width: 620px) 47vw, 180px';
export const kioskPairs = {
  latte: ['428748', '431293'],
  cappuccino: ['428772', '430226'],
  americano: ['428743', '431745']
};

export function mountKioskMode({byId, getLanguage, name, money, t, esc, icon, kioskFor, kioskBread, menuPrice, quantity, overlay, onCardsRendered}) {
  const root = document.getElementById('kiosk-menu');
  const find = id => root.querySelector('#' + id);
  const search = find('quick-search');
  const category = find('quick-category');
  const results = find('quick-results');
  let group = 'coffee';
  let espresso = '428974';

  function picture(item, sizes) {
    return `<img src="${photoUrl(item, 640)}" ${photoSet(item, sizes)} ${dishFrameStyle(item)} loading="lazy" decoding="async" alt="">`;
  }
  function photoNote(items) {
    const kinds=items.map(item=>photoKind(item));
    const labels=journeyCopy[getLanguage()];
    const note=kinds.includes('generated')?labels.generated:kinds.includes('illustration')?labels.illustration:'';
    return note?`<small class="card-photo-note">${esc(note)}</small>`:'';
  }

  function itemCard(item) {
    const id = item.id;
    const title = esc(name(item));
    const kind = kioskFor(id);
    const bread = kioskBread(id);
    const count = quantity(id);
    const attrs = kind ? `data-k-start="${kind}" ${bread ? `data-k-bread="${bread}"` : ''}`
      : item.price === null ? `data-detail="${id}"` : `data-add="${id}"`;
    const action = kind ? journeyCopy[getLanguage()].build : t(item.price === null ? 'detail' : 'add');
    const label = esc(action + ' · ' + name(item));
    return `<article class="quick-card" data-quick-item="${id}">
      <div class="photo-surface" data-view-id="${id}"><button type="button" class="quick-photo" data-detail="${id}" aria-label="${esc(t('detail'))} · ${title}">
        ${picture(item, cardSizes)}</button>${overlay(id,menuPrice(item))}</div>
      <div class="quick-card-body">
        <h3><button type="button" data-detail="${id}">${title}</button></h3>
        <small data-post-qty="${id}" ${count ? '' : 'hidden'}>${esc(t('inOrder'))}: ${count}</small>
        ${photoNote([item])}
        <div class="quick-card-foot">
          <button class="quick-add" type="button" ${attrs} aria-label="${label}" title="${label}">${kind || item.price === null ? esc(action) : icon('plus')}</button>
        </div>
      </div></article>`;
  }

  function espressoCard(copy) {
    const item = byId.get(espresso);
    const options = [['428974',copy.single],['428976',copy.double]].map(([id,label]) =>
      `<button type="button" data-quick-shot="${id}" aria-pressed="${espresso===id}">${esc(label)}</button>`).join('');
    return `<article class="quick-card quick-espresso"><div class="photo-surface" data-view-id="${espresso}">
      <button type="button" class="quick-photo" data-detail="${espresso}" aria-label="${esc(t('detail')+' · '+name(item))}">${picture(item,cardSizes)}</button>
      ${overlay(espresso,money(item.price))}</div>
      <div class="quick-card-body"><h3>${esc(copy.portion)}</h3>${photoNote([item])}<div class="quick-shots" role="group" aria-label="${esc(copy.portion)}">${options}</div>
      <div class="quick-card-foot"><button type="button" class="quick-add" data-add="${espresso}" aria-label="${esc(t('add')+' · '+name(item))}">${esc(t('add'))}</button></div></div></article>`;
  }

  function pairCard(key, ids, copy) {
    const id = 'pair-' + key;
    const items = ids.map(id => byId.get(id));
    if (!items.every(item => item?.price > 0)) return '';
    const title = items.map(name).join(' + ');
    const photos = items.map(item =>
      `<button type="button" class="quick-photo" data-detail="${item.id}" aria-label="${esc(t('detail') + ' · ' + name(item))}">${picture(item, pairSizes)}</button>`).join('');
    return `<article class="quick-card quick-pair share-target" id="${id}"><div class="quick-pair-photos photo-surface" data-view-id="${id}">${photos}${overlay(id,money(items[0].price + items[1].price))}</div>
      <div class="quick-card-body"><h3>${esc(title)}</h3>${photoNote(items)}<div class="quick-card-foot">
      <button type="button" class="quick-add" data-quick-pair="${key}" aria-label="${esc(copy.pairAdd + ' · ' + title)}">${esc(copy.pairAdd)}</button></div></div></article>`;
  }

  function renderResults() {
    const copy = kioskCopy[getLanguage()];
    const all = group === 'all';
    root.querySelectorAll('[data-quick-group]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.quickGroup === group)));
    find('quick-filters').hidden = !all;
    find('quick-section').textContent = all ? t('all') : copy[group + 'Title'];
    const count = find('quick-count');
    count.textContent = '';
    results.classList.toggle('quick-pairs', group === 'pairs');
    results.classList.toggle('quick-catalog', all);
    if (group === 'pairs') {
      results.innerHTML = Object.entries(kioskPairs).map(([key, ids]) => pairCard(key, ids, copy)).join('');
      onCardsRendered();
      return;
    }
    const items = all ? filterProducts(products, {category:category.value, search:search.value})
      : (group === 'food' ? food : drinks).map(id => byId.get(id));
    if (all) count.textContent = String(items.length);
    results.innerHTML = items.map(itemCard).join('') + (group === 'coffee' ? espressoCard(copy) : '');
    if (!items.length) {
      results.innerHTML = `<div class="quick-empty"><p>${esc(t('noResults'))}</p><button type="button" class="quick-all" data-quick-reset>${esc(t('seeAll'))}</button></div>`;
    }
    onCardsRendered();
  }

  function render() {
    const lang = getLanguage(), copy = kioskCopy[lang];
    const selectedCategory = category.value || 'all';
    find('quick-title').textContent = copy.title;
    root.querySelector('[data-quick-group="all"]').textContent = t('all');
    find('quick-groups').innerHTML = Object.entries(groups).map(([key, id]) =>
      `<button class="quick-choice" type="button" data-quick-group="${key}" aria-controls="quick-results">
        <img src="${photoUrl(byId.get(id), 160)}" alt="" width="100" height="90">
        <span>${esc(copy[key])}</span></button>`).join('');
    search.placeholder = t('searchLabel');
    search.setAttribute('aria-label', t('searchLabel'));
    category.setAttribute('aria-label', copy.categories);
    category.innerHTML = `<option value="all">${esc(t('all'))}</option>` + categories.map(c =>
      `<option value="${c.id}">${esc(c.name[lang])}</option>`).join('');
    category.value = selectedCategory;
    renderResults();
  }

  function reset() {
    group = 'coffee';
    espresso = '428974';
    search.value = '';
    category.value = 'all';
  }

  root.addEventListener('click', event => {
    const shot=event.target.closest('[data-quick-shot]');
    if(shot&&shot.dataset.quickShot!==espresso){
      espresso=shot.dataset.quickShot;
      shot.closest('.quick-espresso').outerHTML=espressoCard(kioskCopy[getLanguage()]);
      results.querySelector('[data-quick-shot][aria-pressed="true"]').focus({preventScroll:true});
      onCardsRendered();
      return;
    }
    const choice = event.target.closest('[data-quick-group]');
    if (choice) {
      group = choice.dataset.quickGroup;
      renderResults();
    } else if (event.target.closest('[data-quick-reset]')) {
      search.value = '';
      category.value = 'all';
      renderResults();
      search.focus();
    }
  });
  search.addEventListener('input', renderResults);
  category.addEventListener('change', renderResults);
  return {render, reset, showPairs(){ group = 'pairs'; renderResults(); }};
}

import {products,categories,featured,source} from './menu-data.js';
import {photoUrl as photo,photoSet,hasPhoto} from './photos.js?v=20261106-photos2';
import {normalizeCart,totals,updateCart,addPair,filterProducts,resolveView} from './core.js?v=20261106-feed1';

const $ = id => document.getElementById(id);
const byId = new Map(products.map(p=>[p.id,p]));
const svgPaths = {
  coffee:'<path d="M4 8h12v6a6 6 0 0 1-12 0V8Zm12 1h2a3 3 0 0 1 0 6h-2M3 21h15M7 2v3m5-3v3"/>',
  tea:'<path d="M4 10h13v5a6.5 6.5 0 0 1-13 0v-5Zm13 1h2a3 3 0 0 1 0 6h-2M8 2c-3 3 3 3 0 6m5-6c-3 3 3 3 0 6"/>',
  ice:'<path d="M6 7h13l-2 14H8L6 7Zm8 0 2-5h4M5 7h15M9 13h2v2H9m5-5h2v2h-2"/>',
  glass:'<path d="M6 5h12l-2 16H8L6 5Zm6 0 3-4M7 10h10"/><path d="m12 12 2 1-1 3-2-1z"/>',
  cake:'<path d="m3 11 13-7 5 10H3v-3Zm0 3v6h18v-6M6 17h3m4 0h2"/><path d="M15 4V2"/>',
  bottle:'<path d="M9 2h6v5l3 4v10H6V11l3-4V2Zm0 3h6M6 13h12M6 18h12"/>',
  leaf:'<path d="M20 3C9 2 3 6 4 13c1 6 7 8 12 3 4-4 4-9 4-13ZM3 22 16 9m-6 6v-5m0 5h5"/>',
  croissant:'<path d="m3 15 2-7 4-3h6l4 3 2 7-4-1-3 5h-4l-3-5-4 1ZM9 5l1 14m5-14-1 14M5 8l2 6m12-6-2 6"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  bag:'<path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01"/>',
  search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  share:'<path d="M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7"/>',
  moon:'<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M19 5l-1 1M6 18l-1 1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flame:'<path d="M13 2c2 7-5 7-2 11-3 0-4-2-4-4-5 6-3 13 5 13 8 0 11-10 1-20Z"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>'
};
const icon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgPaths[key]||svgPaths.coffee}</svg>`;
const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const messages = {
tr:{menu:'Menü',pairings:'Birlikte güzel',heroTitle:'Bir kahve.<br><em>Güzel bir an.</em>',heroDescription:'Sevdiğin kahve, yanına güzel bir şey.<br>Miora’da küçük bir mola ver.',explore:'Menüyü keşfet',heroNote:'Biraz kendine, biraz sevdiklerine.',croissantMoment:'Bir de kruvasan?',menuKicker:'KÜÇÜK MOLALAR, GÜZEL LEZZETLER',menuTitle:'Bugün canın ne istiyor?',menuChoices:'farklı seçim, senin molan.',featured:'Miora seçkisi',all:'Tüm menü',favorites:'Favoriler',search:'Bir lezzet ara…',searchLabel:'Menüde ara',clearSearch:'Aramayı temizle',grid:'Fotoğraf görünümü',list:'Kompakt liste',count:'seçenek',add:'Ekle',addToOrder:'Siparişe ekle',ask:'Fiyatı sorunuz',priceMissing:'Kaynak menüde fiyat belirtilmemiş. Fiyatı ve bulunurluğu çalışana sorunuz.',detail:'İncele',share:'Paylaş',copied:'Bağlantı kopyalandı',copy:'Bağlantıyı kopyala',selectCopy:'Bağlantıyı seçip kopyalayabilirsiniz.',shareDescription:'Bu lezzetin bağlantısını sevdiklerinle paylaş.',favoriteAdded:'Favorilerine eklendi',favoriteRemoved:'Favorilerinden çıkarıldı',cart:'Sipariş listem',cartKicker:'KÜÇÜK MOLANI HAZIRLA',added:'Sipariş listene eklendi',emptyCart:'Listende henüz bir şey yok. Güzel bir kahveyle başlayalım mı?',backToMenu:'Menüye dön',total:'Toplam',increase:'Bir adet ekle',decrease:'Bir adet azalt',showStaff:'Çalışana göster',orderNote:'Bu liste çalışana göstermek içindir. Sipariş otomatik gönderilmez; ödeme alınmaz.',staffTitle:'Çalışana göster',staffKicker:'MIORA COFFEE',staffNote:'Fiyatı ve bulunurluğu çalışanla teyit edin. Listeniz henüz iletilmedi.',editOrder:'Listeyi düzenle',copyOrder:'Listeyi kopyala',orderCopied:'Sipariş listesi kopyalandı',clearCart:'Listeyi temizle',dineIn:'Burada',takeaway:'Paket',qr:'Sipariş QR kodu',qrNote:'QR kodu yalnızca bu siparişin metnini içerir.',qrError:'Liste uzun olduğu için QR oluşturulamadı. Yukarıdaki listeyi gösterin.',bump:'YANINA KÜÇÜK BİR ŞEY?',limit:'Bir üründen en fazla 99 adet ekleyebilirsiniz.',noResults:'Burada henüz bir şey yok.',tryAgain:'Başka bir lezzet ara veya tüm menüyü aç.',seeAll:'Tüm menüyü gör',sourceNote:'Fiyatlar ve içerik bilgileri Miora’nın kaynak menüsünden · 5 Kasım 2026. Fotoğraflar menü için rötuşlanmıştır.',pairingKicker:'MİORA EŞLEŞTİRMESİ',pairingTitle:'Bazı şeyler<br>birlikte daha güzel.',pairingText:'Cappuccino’nun yumuşacık köpüğü, San Sebastian’ın kremamsı dokusu. Kendine küçük bir iyilik.',addPair:'İkisini de ekle',pairingNote:'İki ürünün normal toplam fiyatı. İndirim içermez.',closing:'Bir fincanın etrafında buluşalım.',originalMenu:'Kaynak menü ↗',demoNote:'Dijital menü konsepti. Sipariş listeni çalışana göster; çevrim içi sipariş gönderilmez.',close:'Kapat',ingredients:'İçindekiler',originalRecipe:'Kaynak menüdeki açıklama',noIngredients:'İçerik bilgisi kaynak menüde belirtilmemiş. Ayrıntıları çalışana sorunuz.',allergens:'Kaynak menüde belirtilen alerjenler',noAllergens:'Kaynak menüde alerjen listesi belirtilmemiş.',allergenNote:'Liste eksik olabilir. Alerji veya hassasiyetiniz varsa çalışana danışın.',calorieNote:'Kalori bilgisi kaynak menüden aktarılmıştır; porsiyon gramajı belirtilmemiştir. /100g olarak verilen değerler ayrıca işaretlidir.',reviewCalorie:'Kaynakta 1 kcal/100g yazıyor. Bu değeri çalışanla teyit edin.',minutes:'dk',localViews:'Bu cihazdaki görüntüleme',storageError:'Tarayıcınız kaydetmeyi engelliyor. Liste bu sekmede kullanılabilir.',photoMissing:'Fotoğraf yakında',searchResults:'Arama sonuçları',milk:'Süt ürünleri',gluten:'Gluten',eggs:'Yumurta',peanuts:'Yer fıstığı',sesame:'Susam'},
en:{menu:'Menu',pairings:'Better together',heroTitle:'Your coffee.<br><em>Your moment.</em>',heroDescription:'Your favourite coffee, something lovely on the side.<br>Take a little break at Miora.',explore:'Explore the menu',heroNote:'A little time for you. A little joy to share.',croissantMoment:'And a croissant?',menuKicker:'LITTLE BREAKS, LOVELY FLAVOURS',menuTitle:'What are you in the mood for?',menuChoices:'choices for your little break.',featured:'The Miora selection',all:'Full menu',favorites:'Favourites',search:'Find something lovely…',searchLabel:'Search the menu',clearSearch:'Clear search',grid:'Photo view',list:'Compact list',count:'choices',add:'Add',addToOrder:'Add to my list',ask:'Ask for price',priceMissing:'The source menu does not list a price. Please ask the staff about price and availability.',detail:'View details',share:'Share',copied:'Link copied',copy:'Copy link',selectCopy:'Select and copy the link.',shareDescription:'Share a link to this little treat.',favoriteAdded:'Saved to favourites',favoriteRemoved:'Removed from favourites',cart:'My order list',cartKicker:'PUT TOGETHER YOUR LITTLE BREAK',added:'Added to your order list',emptyCart:'Your list is empty. Shall we start with a lovely coffee?',backToMenu:'Back to the menu',total:'Total',increase:'Add one',decrease:'Remove one',showStaff:'Show the staff',orderNote:'Show this list to the staff. It is not sent automatically and no payment is taken.',staffTitle:'Show the staff',staffKicker:'MIORA COFFEE',staffNote:'Confirm prices and availability with the staff. Your list has not been submitted.',editOrder:'Edit my list',copyOrder:'Copy order list',orderCopied:'Order list copied',clearCart:'Clear my list',dineIn:'Dine in',takeaway:'Takeaway',qr:'Order QR code',qrNote:'The QR code contains only the text of this order.',qrError:'This list is too long for a QR code. Show the list above instead.',bump:'A LITTLE SOMETHING ON THE SIDE?',limit:'You can add up to 99 of each item.',noResults:'Nothing here just yet.',tryAgain:'Try another flavour or explore the full menu.',seeAll:'See the full menu',sourceNote:'Prices and ingredient information from Miora’s source menu · 5 November 2026. Photos retouched for the menu.',pairingKicker:'THE MIORA PAIRING',pairingTitle:'Some things are<br>better together.',pairingText:'Soft cappuccino foam meets creamy San Sebastian cheesecake. A little treat, just for you.',addPair:'Add both to my list',pairingNote:'The regular combined price. No discount is included.',closing:'Let’s meet over a cup.',originalMenu:'Source menu ↗',demoNote:'Digital menu concept. Show your list to the staff; online orders are not submitted.',close:'Close',ingredients:'Ingredients',originalRecipe:'Original source description · Turkish',noIngredients:'The source menu does not provide ingredients. Please ask the staff for details.',allergens:'Allergens listed in the source menu',noAllergens:'No allergen list is provided in the source menu.',allergenNote:'This list may be incomplete. Please ask the staff about allergies or sensitivities.',calorieNote:'Calories are taken from the source menu; serving weights are not provided. Values given per 100 g are labelled separately.',reviewCalorie:'The source lists 1 kcal/100g. Please confirm this value with the staff.',minutes:'min',localViews:'Views on this device',storageError:'Your browser is blocking storage. You can still use this list in this tab.',photoMissing:'Photo coming soon',searchResults:'Search results',milk:'Dairy',gluten:'Gluten',eggs:'Eggs',peanuts:'Peanuts',sesame:'Sesame'},
ru:{menu:'Меню',pairings:'Вкуснее вместе',heroTitle:'Твой кофе.<br><em>Твой момент.</em>',heroDescription:'Любимый кофе и что-нибудь вкусное к нему.<br>Загляни на маленький перерыв в Miora.',explore:'Посмотреть меню',heroNote:'Немного для себя. Немного для близких.',croissantMoment:'А ещё круассан?',menuKicker:'МАЛЕНЬКИЙ ПЕРЕРЫВ, БОЛЬШОЕ УДОВОЛЬСТВИЕ',menuTitle:'Чего хочется сегодня?',menuChoices:'варианта для твоего перерыва.',featured:'Выбор Miora',all:'Всё меню',favorites:'Избранное',search:'Найти что-нибудь вкусное…',searchLabel:'Поиск по меню',clearSearch:'Очистить поиск',grid:'Меню с фото',list:'Компактный список',count:'позиций',add:'Добавить',addToOrder:'Добавить в заказ',ask:'Уточните цену',priceMissing:'В исходном меню цена не указана. Уточните цену и наличие у сотрудника.',detail:'Подробнее',share:'Поделиться',copied:'Ссылка скопирована',copy:'Скопировать ссылку',selectCopy:'Выделите и скопируйте ссылку.',shareDescription:'Поделись ссылкой на эту вкусную находку.',favoriteAdded:'Добавлено в избранное',favoriteRemoved:'Убрано из избранного',cart:'Мой заказ',cartKicker:'СОБЕРИ СВОЙ МАЛЕНЬКИЙ ПЕРЕРЫВ',added:'Добавлено в заказ',emptyCart:'В заказе пока ничего нет. Начнём с чашечки кофе?',backToMenu:'Вернуться к меню',total:'Итого',increase:'Добавить одну порцию',decrease:'Убрать одну порцию',showStaff:'Показать сотруднику',orderNote:'Покажите список сотруднику. Заказ автоматически не отправляется, оплата не списывается.',staffTitle:'Покажите сотруднику',staffKicker:'MIORA COFFEE',staffNote:'Уточните цену и наличие у сотрудника. Заказ ещё не передан в кафе.',editOrder:'Изменить заказ',copyOrder:'Скопировать заказ',orderCopied:'Заказ скопирован',clearCart:'Очистить заказ',dineIn:'В кафе',takeaway:'С собой',qr:'QR-код заказа',qrNote:'QR-код содержит только текст этого заказа.',qrError:'Заказ слишком длинный для QR-кода. Покажите список выше.',bump:'МОЖЕТ, ЧТО-НИБУДЬ К КОФЕ?',limit:'Можно добавить до 99 порций одной позиции.',noResults:'Здесь пока ничего нет.',tryAgain:'Поищи что-нибудь другое или открой всё меню.',seeAll:'Посмотреть всё меню',sourceNote:'Цены и состав — из исходного меню Miora · 5 ноября 2026. Фото обработаны для меню.',pairingKicker:'СОЧЕТАНИЕ ОТ MIORA',pairingTitle:'Некоторые вещи<br>вкуснее вместе.',pairingText:'Нежная пенка капучино и сливочный Сан-Себастьян. Маленькое удовольствие для себя.',addPair:'Добавить обе позиции',pairingNote:'Обычная сумма двух позиций. Без скидки.',closing:'Встретимся за чашечкой кофе.',originalMenu:'Исходное меню ↗',demoNote:'Концепт цифрового меню. Покажите заказ сотруднику; онлайн-заказ не отправляется.',close:'Закрыть',ingredients:'Состав',originalRecipe:'Описание из исходного меню · на турецком',noIngredients:'В исходном меню состав не указан. Уточните подробности у сотрудника.',allergens:'Аллергены, указанные в исходном меню',noAllergens:'В исходном меню список аллергенов не указан.',allergenNote:'Список может быть неполным. При аллергии или чувствительности уточните состав у сотрудника.',calorieNote:'Калории перенесены из исходного меню; вес порций не указан. Значения на 100 г отмечены отдельно.',reviewCalorie:'В источнике указано 1 ккал/100 г. Это значение требует уточнения у сотрудника.',minutes:'мин',localViews:'Просмотры на этом устройстве',storageError:'Браузер не позволяет сохранить данные. Заказ доступен в этой вкладке.',photoMissing:'Фото скоро появится',searchResults:'Результаты поиска',milk:'Молочные продукты',gluten:'Глютен',eggs:'Яйца',peanuts:'Арахис',sesame:'Кунжут'}
};

Object.assign(messages.tr,{feed:'Akış',feedTitle:'Miora anları',feedKicker:'KAYDIR · KEŞFET · TADINI ÇIKAR',like:'Beğen ve kaydet',liked:'Kaydedildi',feedHint:'Fotoğrafa iki kez dokun, favorilerine ekle.',addMore:'Bir tane daha',inOrder:'Listende',viewOnDevice:'Bu cihazda görüntülendi'});
Object.assign(messages.en,{feed:'Feed',feedTitle:'Miora moments',feedKicker:'SCROLL · DISCOVER · ENJOY',like:'Like and save',liked:'Saved',feedHint:'Double-tap a photo to save it to favourites.',addMore:'Add one more',inOrder:'On your list',viewOnDevice:'Viewed on this device'});
Object.assign(messages.ru,{feed:'Лента',feedTitle:'Моменты Miora',feedKicker:'ЛИСТАЙ · ВДОХНОВЛЯЙСЯ · ПРОБУЙ',like:'Нравится · сохранить',liked:'В избранном',feedHint:'Дважды нажми на фото, чтобы добавить в избранное.',addMore:'Ещё одну',inOrder:'В заказе',viewOnDevice:'Просмотры на этом устройстве'});
Object.assign(svgPaths,{feed:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 7h16M4 16h16M8 19h4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'});

function load(key,fallback) {try {const value=localStorage.getItem('miora:'+key);return value===null?fallback:JSON.parse(value);} catch{return fallback;}}
let storageWarningShown=false;
function save(key,value) {try {localStorage.setItem('miora:'+key,JSON.stringify(value));return true;} catch {if(!storageWarningShown){storageWarningShown=true;notify(t('storageError'));}return false;}}
const params=new URLSearchParams(location.search);
const savedLanguage=load('language','tr');
let lang=['tr','en','ru'].includes(params.get('lang'))?params.get('lang'):['tr','en','ru'].includes(savedLanguage)?savedLanguage:'tr';
let cart=normalizeCart(load('cart',{}),byId);
let favoriteIds=load('favorites',[]); if(!Array.isArray(favoriteIds))favoriteIds=[];
let favorites=new Set(favoriteIds.filter(id=>byId.has(id)));
let view=resolveView(params.get('view'),load('view',null));
let category=view==='feed'?'all':'featured', search='', detailId=null, staffMode=false;
let service=load('service','dineIn'); if(!['dineIn','takeaway'].includes(service))service='dineIn';
let views=load('views',{}); if(!views||typeof views!=='object'||Array.isArray(views))views={};
views=Object.fromEntries(Object.entries(views).filter(([id,n])=>byId.has(id)&&Number.isSafeInteger(n)&&n>=0));
const viewedThisSession=new Set();
let feedObserver=null;
const feedViewTimers=new Map();
let toastTimer;
const t = key => messages[lang][key]||messages.tr[key]||key;
const name = item => item.name[lang]||item.name.tr;
const money = value => new Intl.NumberFormat(lang==='tr'?'tr-TR':lang==='ru'?'ru-RU':'en-GB',{maximumFractionDigits:2}).format(value/100)+' ₺';
function notify(text) {clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2600);}
function updateUrl() {const url=new URL(location.href);url.searchParams.set('lang',lang);url.searchParams.set('view',view);history.replaceState(null,'',url);}
function renderTheme() {const dark=document.documentElement.dataset.theme==='dark';$('theme-toggle').innerHTML=icon(dark?'sun':'moon');$('theme-toggle').setAttribute('aria-label',lang==='ru'?(dark?'Светлая тема':'Тёмная тема'):lang==='en'?(dark?'Light theme':'Dark theme'):(dark?'Açık tema':'Koyu tema'));$('theme-toggle').setAttribute('aria-pressed',String(dark));}
function renderLanguage() {
  document.documentElement.lang=lang;$('language').value=lang;
  document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.dataset.i18n;if(['heroDescription','pairingTitle'].includes(k))e.innerHTML=t(k);else e.textContent=t(k);});
  $('hero-title').innerHTML=t('heroTitle');$('categories').setAttribute('aria-label',t('menu'));document.querySelector('.view-switch').setAttribute('aria-label',t('grid')+' / '+t('list'));$('share-link').setAttribute('aria-label',t('share')); $('search').placeholder=t('search');$('search').setAttribute('aria-label',t('searchLabel'));$('search-clear').setAttribute('aria-label',t('clearSearch'));
  $('view-feed').setAttribute('aria-label',t('feed'));$('view-grid').setAttribute('aria-label',t('grid'));$('view-list').setAttribute('aria-label',t('list'));$('favorites-filter').setAttribute('aria-label',t('favorites'));
  $('feed-stories').setAttribute('aria-label',t('menu'));document.querySelector('.view-switch').setAttribute('aria-label',[t('feed'),t('grid'),t('list')].join(' / '));
  document.querySelectorAll('[data-close]').forEach(e=>e.setAttribute('aria-label',t('close')));
  renderTheme();renderCategories();renderProducts();renderCartCount();
  if($('cart-dialog').open)renderCart();if($('detail-dialog').open&&detailId)renderDetail();
}
function renderCategories() {
  const all=[{id:'featured',name:t('featured'),icon:'star'},{id:'all',name:t('all'),icon:'grid'},...categories.map(c=>({id:c.id,name:c.name[lang],icon:c.icon}))];
  $('categories').innerHTML=all.map(c=>`<button class="category-btn" type="button" data-category="${c.id}" aria-pressed="${category===c.id}">${icon(c.icon)}${esc(c.name)}</button>`).join('');
  $('feed-stories').innerHTML=all.map(c=>{const cover=products.find(p=>hasPhoto(p)&&(c.id==='featured'?featured.includes(p.id):c.id==='all'||p.cat===c.id));return `<button class="story-button" type="button" data-category="${c.id}" aria-pressed="${category===c.id}"><span class="story-ring"><img src="${photo(cover,160)}" width="64" height="64" alt="" decoding="async" loading="lazy"></span><span class="story-name">${esc(c.name)}</span></button>`;}).join('');
  $('favorites-filter').innerHTML=icon('heart');$('favorites-filter').setAttribute('aria-pressed',String(category==='favorites'));
}
function meta(item) {return `${item.kcal&&!item.calorieReview?`<span>${icon('flame')}${esc(item.kcal)}</span>`:''}${item.time?`<span>${icon('clock')}${item.time} ${t('minutes')}</span>`:''}`;}
function renderProducts() {
  stopFeedViews();
  const list=filterProducts(products,{category,search,favorites:[...favorites],featured});
  const label=category==='featured'?t('featured'):category==='all'?(search?t('searchResults'):t('all')):category==='favorites'?t('favorites'):categories.find(c=>c.id===category)?.name[lang]||t('all');
  $('result-title').textContent=label;$('result-count').textContent=`${list.length} ${t('count')}`;
  document.body.dataset.view=view;
  $('menu-title').textContent=t(view==='feed'?'feedTitle':'menuTitle');document.querySelector('[data-i18n="menuKicker"]').textContent=t(view==='feed'?'feedKicker':'menuKicker');
  $('feed-stories').hidden=view!=='feed';$('categories').hidden=view==='feed';
  $('empty-state').hidden=list.length>0;$('products').className='product-grid'+(view==='list'?' list-view':view==='feed'?' feed-view':'');
  $('view-feed').setAttribute('aria-pressed',String(view==='feed'));$('view-grid').setAttribute('aria-pressed',String(view==='grid'));$('view-list').setAttribute('aria-pressed',String(view==='list'));$('search-clear').hidden=!search;
  if(view==='feed'){const ranks=new Map(featured.map((id,i)=>[id,i]));const ordered=category==='all'&&!search?[...list].sort((a,b)=>(ranks.get(a.id)??100)-(ranks.get(b.id)??100)):list;$('products').innerHTML=ordered.map(feedPost).join('');startFeedViews();return;}
  $('products').innerHTML=list.map(p=>`<article class="product-card" data-product="${p.id}">
    <div class="product-media"><button class="product-open" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}"><img src="${photo(p,view==='list'?160:640)}" ${view==='list'?'':photoSet(p,'(max-width: 620px) calc(50vw - 26px), (max-width: 960px) 30vw, 265px')} width="640" height="640" loading="lazy" decoding="async" alt="${esc(hasPhoto(p)?name(p):t('photoMissing'))}" ${hasPhoto(p)?'':'class="missing-photo"'}></button>
    <div class="product-social"><button type="button" data-share="${p.id}" aria-label="${esc(t('share')+' · '+name(p))}">${icon('share')}</button><button type="button" data-favorite="${p.id}" aria-label="${esc(t('favorites')+' · '+name(p))}" aria-pressed="${favorites.has(p.id)}">${icon('heart')}</button></div></div>
    <div class="product-body"><button class="product-title" type="button" data-detail="${p.id}">${esc(name(p))}</button><p class="product-subtitle">${esc(lang==='tr'?p.description||categories.find(c=>c.id===p.cat).name.tr:p.name.tr)}</p><div class="product-meta">${meta(p)}</div><div class="product-bottom"><strong class="product-price${p.price===null?' ask':''}">${p.price===null?t('ask'):money(p.price)}</strong>${p.price===null?`<button class="add-btn" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}">↗</button>`:`<button class="add-btn${cart[p.id]?' quantity-badge':''}" type="button" data-add="${p.id}" aria-label="${esc(t('add')+' · '+name(p))}">${cart[p.id]||icon('plus')}</button>`}</div></div></article>`).join('');
}
function feedPost(p) {
  const cat=categories.find(c=>c.id===p.cat),qty=cart[p.id]||0;
  return `<article class="product-card feed-post" data-product="${p.id}" aria-labelledby="post-title-${p.id}">
    <div class="post-head"><img class="post-avatar" src="assets/logo-source.jpg" width="36" height="36" alt=""><div><b>mioracoffeetr</b><span>${esc(cat.name[lang])}</span></div><button class="icon-btn" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}">${icon('more')}</button></div>
    <div class="feed-media"><div class="feed-photo" data-feed-photo="${p.id}"><img class="${hasPhoto(p)?'':'missing-photo'}" src="${photo(p)}" ${photoSet(p,'(max-width: 620px) 100vw, 624px')} width="640" height="640" loading="lazy" decoding="async" alt="${esc(hasPhoto(p)?name(p):t('photoMissing'))}"><span class="feed-love" aria-hidden="true">${icon('heart')}</span></div></div>
    <div class="post-actions"><button class="icon-btn feed-heart" type="button" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${esc(t('like')+' · '+name(p))}">${icon('heart')}</button><button class="icon-btn" type="button" data-detail="${p.id}" aria-label="${esc(t('ingredients')+' · '+name(p))}">${icon('info')}</button><button class="icon-btn" type="button" data-share="${p.id}" aria-label="${esc(t('share')+' · '+name(p))}">${icon('share')}</button><span class="post-saved" data-saved="${p.id}" ${favorites.has(p.id)?'':'hidden'}>${t('liked')}</span></div>
    <div class="post-caption"><h3 id="post-title-${p.id}"><button type="button" data-detail="${p.id}">${esc(name(p))}</button></h3><p class="post-original" ${lang==='tr'?'':'lang="tr"'}>${esc(lang==='tr'?(p.description.length>130?p.description.slice(0,127)+'…':p.description):p.name.tr)}</p><div class="post-meta">${meta(p)}</div><span class="post-views" data-views="${p.id}" ${views[p.id]?'':'hidden'}>${icon('eye')}<span>${views[p.id]||0} · ${t('viewOnDevice')}</span></span></div>
    <div class="post-order"><div><strong>${p.price===null?t('ask'):money(p.price)}</strong><span data-post-qty="${p.id}" ${qty?'':'hidden'}>${t('inOrder')}: ${qty}</span></div>${p.price===null?`<button class="button secondary feed-add" type="button" data-detail="${p.id}">${t('detail')}</button>`:`<button class="button primary feed-add" type="button" data-add="${p.id}" aria-label="${esc(t('addToOrder')+' · '+name(p))}">${icon('bag')}<span>${t(qty?'addMore':'addToOrder')}</span></button>`}</div>
    <p class="feed-hint">${t('feedHint')}</p></article>`;
}
function recordView(id) {
  if(!byId.has(id)||viewedThisSession.has(id))return;
  const stored=load('views',{}),current=stored&&Number.isSafeInteger(stored[id])&&stored[id]>=0?stored[id]:0;
  views[id]=Math.min(Math.max(views[id]||0,current)+1,1000000);viewedThisSession.add(id);save('views',views);
  document.querySelectorAll(`[data-views="${id}"]`).forEach(el=>{el.hidden=false;el.innerHTML=`${icon('eye')}<span>${views[id]} · ${t('viewOnDevice')}</span>`;});
}
function stopFeedViews() {
  feedObserver?.disconnect();feedObserver=null;
  for(const timer of feedViewTimers.values())clearTimeout(timer);feedViewTimers.clear();
}
function startFeedViews() {
  stopFeedViews();
  if(view!=='feed'||!('IntersectionObserver' in window))return;
  feedObserver=new IntersectionObserver(entries=>{for(const entry of entries){const id=entry.target.dataset.feedPhoto;clearTimeout(feedViewTimers.get(id));feedViewTimers.delete(id);
    if(entry.intersectionRatio>=.65&&!document.hidden&&!document.querySelector('dialog[open]')&&!viewedThisSession.has(id))feedViewTimers.set(id,setTimeout(()=>{feedViewTimers.delete(id);if(view==='feed'&&!document.hidden&&!document.querySelector('dialog[open]')&&entry.target.isConnected)recordView(id);},1000));
  }},{threshold:[0,.65],rootMargin:`-${document.querySelector('.header').offsetHeight+$('toolbar').offsetHeight}px 0px 0px 0px`});
  document.querySelectorAll('[data-feed-photo]').forEach(el=>feedObserver.observe(el));
}
function likePhoto(id,button) {
  if(!favorites.has(id))toggleFavorite(id);
  button.classList.remove('like-flash');void button.offsetWidth;button.classList.add('like-flash');setTimeout(()=>button.classList.remove('like-flash'),650);
}
function renderCartCount() {
  const sum=totals(cart,byId);
  $('cart-open').innerHTML=`${icon('bag')}<span>${esc(t('cart'))}</span><span class="cart-count">${sum.count}</span>`;$('cart-open').setAttribute('aria-label',`${t('cart')} · ${sum.count}`);
  $('mobile-cart').hidden=!sum.count;$('mobile-cart-open').innerHTML=`<span>${icon('bag')}${esc(t('cart'))} · ${sum.count}</span><strong>${money(sum.price)}</strong>`;
  document.querySelectorAll('[data-add]').forEach(b=>{if(!b.classList.contains('add-btn'))return;const n=cart[b.dataset.add];b.classList.toggle('quantity-badge',!!n);b.innerHTML=n||icon('plus');});
  document.querySelectorAll('.feed-add[data-add]').forEach(b=>{const n=cart[b.dataset.add]||0;b.innerHTML=`${icon('bag')}<span>${t(n?'addMore':'addToOrder')}</span>`;});
  document.querySelectorAll('[data-post-qty]').forEach(el=>{const n=cart[el.dataset.postQty]||0;el.hidden=!n;el.textContent=`${t('inOrder')}: ${n}`;});
}
function refreshCart() {cart=normalizeCart(load('cart',cart),byId);}
function commitCart(next) {cart=next;save('cart',cart);if(!totals(cart,byId).count)staffMode=false;renderCartCount();if($('cart-dialog').open)renderCart();}
function add(id) {if(byId.get(id)?.price==null)return;refreshCart();if((cart[id]||0)>=99){notify(t('limit'));return;}commitCart(updateCart(cart,id,1,byId));notify(`${t('added')} · ${name(byId.get(id))}`);}
function toggleFavorite(id) {
  if(!byId.has(id))return;
  if(favorites.has(id)){favorites.delete(id);notify(t('favoriteRemoved'));}else{favorites.add(id);notify(t('favoriteAdded'));}
  save('favorites',[...favorites]);document.querySelectorAll(`[data-favorite="${id}"]`).forEach(b=>b.setAttribute('aria-pressed',String(favorites.has(id))));
  document.querySelectorAll(`[data-saved="${id}"]`).forEach(el=>el.hidden=!favorites.has(id));
  if(category==='favorites')renderProducts();
}
function openDetail(id) {
  if(!byId.has(id))return;detailId=id;
  stopFeedViews();recordView(id);
  renderDetail();if(!$('detail-dialog').open)$('detail-dialog').showModal();$('detail-dialog').scrollTop=0;
}
function renderDetail() {
  const p=byId.get(detailId),c=categories.find(c=>c.id===p.cat);if(!p)return;
  $('detail-content').innerHTML=`<div class="detail-top"><img class="detail-photo${hasPhoto(p)?'':' missing-photo'}" src="${photo(p)}" ${photoSet(p,'(max-width: 620px) 100vw, 540px')} width="640" height="640" alt="${esc(hasPhoto(p)?name(p):t('photoMissing'))}"><button class="icon-btn close-btn" type="button" data-close="detail-dialog" aria-label="${t('close')}">×</button></div>
    <div class="detail-copy"><p class="eyebrow">${esc(c.name[lang])}</p><h2 id="detail-title">${esc(name(p))}</h2>${lang!=='tr'?`<p class="original-name" lang="tr">${esc(p.name.tr)}</p>`:''}<div class="detail-metrics">${p.kcal&&!p.calorieReview?`<span class="metric">${icon('flame')}${esc(p.kcal)}</span>`:''}${p.time?`<span class="metric">${icon('clock')}${p.time} ${t('minutes')}</span>`:''}${p.price!==null?`<span class="metric detail-price">${money(p.price)}</span>`:''}</div>
    ${p.price===null?`<section class="detail-section"><h3>${t('ask')}</h3><p>${t('priceMissing')}</p></section>`:''}
    <section class="detail-section"><h3>${t('ingredients')}</h3>${p.description?`<p lang="tr">${esc(p.description)}</p>${lang!=='tr'?`<p class="detail-disclaimer">${t('originalRecipe')}</p>`:''}`:`<p>${t('noIngredients')}</p>`}</section>
    <section class="detail-section"><h3>${t('allergens')}</h3>${p.allergens.length?`<div class="allergens">${p.allergens.map(a=>`<span>${t(a)}</span>`).join('')}</div>`:`<p>${t('noAllergens')}</p>`}<p class="detail-disclaimer">${t('allergenNote')}</p>${p.kcal?`<p class="detail-disclaimer">${p.calorieReview?t('reviewCalorie'):t('calorieNote')}</p>`:''}</section><div class="views">${icon('eye')}${views[p.id]||0} · ${t('localViews')}</div></div>
    <div class="detail-actions">${p.price!==null?`<button class="button primary" type="button" data-add="${p.id}">${icon('plus')}${t('addToOrder')} · ${money(p.price)}</button>`:`<button class="button secondary" type="button" data-close="detail-dialog">${t('backToMenu')}</button>`}<button class="icon-btn" type="button" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${t('favorites')}">${icon('heart')}</button><button class="icon-btn" type="button" data-share="${p.id}" aria-label="${t('share')}">${icon('share')}</button></div>`;
}
function recommend() {
  const items=Object.keys(cart).map(id=>byId.get(id));if(!items.length)return null;
  const hasFood=items.some(p=>['46818','46885'].includes(p.cat));
  const hasDrink=items.some(p=>!['46818','46885'].includes(p.cat));
  const id=!hasFood?'430227':!hasDrink?'428743':null;
  return id&&!cart[id]?byId.get(id):null;
}
function orderText() {
  const lines=Object.entries(cart).map(([id,qty])=>`${qty} x ${byId.get(id).name.tr} — ${money(byId.get(id).price*qty)}`);
  return ['Miora Coffee',service==='takeaway'?'Paket':'Burada',...lines,`Toplam: ${money(totals(cart,byId).price)}`].join('\n');
}
function drawQR(canvas,text) {
  const code=new window.MioraQRCode(-1,1);code.addData(String.fromCharCode(...new TextEncoder().encode(text)));code.make();
  const modules=code.getModuleCount(),unit=5;canvas.width=canvas.height=(modules+8)*unit;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';
  for(let y=0;y<modules;y++)for(let x=0;x<modules;x++)if(code.isDark(y,x))ctx.fillRect((x+4)*unit,(y+4)*unit,unit,unit);
}
function renderCart() {
  const body=$('cart-content'),top=body.scrollTop,active=document.activeElement,focusId=active?.dataset?.stepId,focusDelta=active?.dataset?.step;
  const sum=totals(cart,byId);$('cart-title').textContent=t(staffMode?'staffTitle':'cart');$('cart-kicker').textContent=t(staffMode?'staffKicker':'cartKicker');
  if(!sum.count){body.innerHTML=`<div class="cart-empty">${icon('bag')}<p>${t('emptyCart')}</p></div>`;$('cart-footer').innerHTML=`<button class="button primary" type="button" data-action="back-menu">${t('backToMenu')}</button>`;return;}
  const lines=Object.entries(cart).map(([id,qty])=>{const p=byId.get(id);return `<li class="cart-line"><div class="cart-item"><img src="${photo(p,160)}" alt="" width="58" height="62"><div><b ${staffMode?'lang="tr"':''}>${staffMode?qty+' × ':''}${esc(staffMode?p.name.tr:name(p))}</b><small>${money(p.price)} × ${qty}${staffMode?'':' · '+money(p.price*qty)}</small></div></div>${staffMode?`<strong class="order-line-total">${money(p.price*qty)}</strong>`:`<div class="qty"><button type="button" data-step="-1" data-step-id="${id}" aria-label="${esc(t('decrease')+' · '+name(p))}">${icon('minus')}</button><output>${qty}</output><button type="button" data-step="1" data-step-id="${id}" aria-label="${esc(t('increase')+' · '+name(p))}" ${qty>=99?'disabled':''}>${icon('plus')}</button></div>`}</li>`;}).join('');
  const extra=!staffMode&&recommend();
  body.innerHTML=`${staffMode?`<p class="order-intro">${t('staffNote')}</p><p class="order-intro" lang="tr"><b>${service==='takeaway'?'Paket':'Burada'}</b></p>`:''}<ul class="cart-lines">${lines}</ul>${extra?`<section class="order-bump"><img src="${photo(extra,160)}" width="64" height="70" alt="${esc(name(extra))}"><div><p>${t('bump')}</p><b>${esc(name(extra))}</b></div><button type="button" data-add="${extra.id}" aria-label="${esc(t('add')+' · '+name(extra))}">+ ${money(extra.price)}</button></section>`:''}
    ${staffMode?`<details class="order-qr"><summary>${t('qr')}</summary><canvas id="order-qr" role="img" aria-label="${t('qr')}"></canvas><small>${t('qrNote')}</small></details>`:`<div class="serve-select" role="group" aria-label="${t('dineIn')} / ${t('takeaway')}"><button type="button" data-service="dineIn" aria-pressed="${service==='dineIn'}">${t('dineIn')}</button><button type="button" data-service="takeaway" aria-pressed="${service==='takeaway'}">${t('takeaway')}</button></div>`}`;
  $('cart-footer').innerHTML=`<div class="total-line"><span>${t('total')}</span><strong>${money(sum.price)}</strong></div>${staffMode?`<button class="button primary" type="button" data-action="edit-order">${t('editOrder')}</button><button class="clear-cart" type="button" data-action="copy-order">${t('copyOrder')}</button>`:`<button class="button primary" type="button" data-action="show-staff">${t('showStaff')} <span aria-hidden="true">↗</span></button><button class="clear-cart" type="button" data-action="clear-cart">${t('clearCart')}</button>`}<p class="checkout-note">${t('orderNote')}</p>`;
  if(staffMode){try{drawQR($('order-qr'),orderText());}catch{$('order-qr').parentElement.innerHTML=`<p class="qr-error">${t('qrError')}</p>`;}}
  body.scrollTop=top;
  if(focusId&&focusDelta)body.querySelector(`[data-step-id="${focusId}"][data-step="${focusDelta}"]`)?.focus({preventScroll:true});
}
function openCart() {refreshCart();staffMode=false;renderCart();$('cart-dialog').showModal();}
async function copyText(text,success,fallback) {try {if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText(text);notify(success);return true;}catch{fallback?.();return false;}}
async function shareItem(id) {
  const p=byId.get(id);if(!p)return;const url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('item',id);url.searchParams.set('lang',lang);url.searchParams.set('view',view);
  if(navigator.share){try{await navigator.share({title:'Miora Coffee · '+name(p),text:name(p),url:url.href});return;}catch(e){if(e.name==='AbortError')return;}}
  $('share-title').textContent=t('share')+' · Miora';$('share-description').textContent=name(p)+' — '+t('shareDescription');$('share-link').value=url.href;$('copy-link').textContent=t('copy');$('share-dialog').showModal();
}
function selectCategory(id) {category=id;renderCategories();renderProducts();}

document.addEventListener('click',async event=>{
  const button=event.target.closest('button,a[data-action]');if(!button)return;
  const d=button.dataset;
  if(d.close){$(d.close).close();return;}
  if(d.detail){openDetail(d.detail);return;}
  if(d.add){add(d.add);return;}
  if(d.favorite){toggleFavorite(d.favorite);return;}
  if(d.share){await shareItem(d.share);return;}
  if(d.category){selectCategory(d.category);return;}
  if(d.view){const boundary=$('toolbar').getBoundingClientRect().bottom;const anchor=[...document.querySelectorAll('[data-product]')].find(el=>{const r=el.getBoundingClientRect();return r.bottom>boundary&&r.top<innerHeight;})?.dataset.product;view=resolveView(d.view,null);save('view',view);renderProducts();updateUrl();if(anchor)requestAnimationFrame(()=>{const card=document.querySelector(`[data-product="${anchor}"]`);if(card)window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+scrollY-document.querySelector('.header').offsetHeight-$('toolbar').offsetHeight-16),behavior:'instant'});});return;}
  if(d.step){refreshCart();commitCart(updateCart(cart,d.stepId,Number(d.step),byId));return;}
  if(d.service){service=d.service;save('service',service);renderCart();return;}
  if(d.action==='reset'){search='';$('search').value='';selectCategory('all');return;}
  if(d.action==='add-pair'){refreshCart();const next=addPair(cart,['428772','430226'],byId);if(!next){notify(t('limit'));return;}commitCart(next);notify(t('added')+' · Cappuccino + San Sebastian');return;}
  if(d.action==='show-staff'){staffMode=true;renderCart();$('cart-content').scrollTop=0;$('cart-title').setAttribute('tabindex','-1');$('cart-title').focus();return;}
  if(d.action==='edit-order'){staffMode=false;renderCart();return;}
  if(d.action==='clear-cart'){commitCart({});return;}
  if(d.action==='back-menu'){$('cart-dialog').close();$('menu').scrollIntoView({block:'start'});return;}
  if(d.action==='copy-order')await copyText(orderText(),t('orderCopied'),()=>{const text=document.createElement('textarea');text.className='copy-order-fallback';text.value=orderText();text.setAttribute('aria-label',t('copyOrder'));$('cart-content').append(text);text.focus();text.select();notify(t('selectCopy'));});
});
$('cart-open').addEventListener('click',openCart);$('mobile-cart-open').addEventListener('click',openCart);
$('search-icon').innerHTML=icon('search');
$('view-feed').innerHTML=icon('feed');$('view-grid').innerHTML=icon('grid');$('view-list').innerHTML=icon('list');
$('search').addEventListener('input',event=>{search=event.target.value;if(search&&category!=='favorites'&&category!=='all'){category='all';renderCategories();}renderProducts();});
$('search-clear').addEventListener('click',()=>{search='';$('search').value='';renderProducts();$('search').focus();});
$('favorites-filter').addEventListener('click',()=>{search='';$('search').value='';selectCategory(category==='favorites'?'featured':'favorites');});
$('language').addEventListener('change',event=>{lang=event.target.value;save('language',lang);renderLanguage();updateUrl();});
$('theme-toggle').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('miora:theme',theme);}catch{}document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#1e1c19':'#f8f5ef';renderTheme();});
$('copy-link').addEventListener('click',()=>copyText($('share-link').value,t('copied'),()=>{$('share-link').focus();$('share-link').select();notify(t('selectCopy'));}));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))startFeedViews();}));
document.addEventListener('dblclick',event=>{const button=event.target.closest('[data-feed-photo]');if(button){event.preventDefault();likePhoto(button.dataset.feedPhoto,button);}});
let lastTouch=null;
document.addEventListener('pointerup',event=>{if(event.pointerType!=='touch')return;const button=event.target.closest('[data-feed-photo]');if(!button)return;const now=Date.now();if(lastTouch&&lastTouch.id===button.dataset.feedPhoto&&now-lastTouch.at<260&&Math.hypot(event.clientX-lastTouch.x,event.clientY-lastTouch.y)<35){likePhoto(button.dataset.feedPhoto,button);lastTouch=null;}else lastTouch={id:button.dataset.feedPhoto,at:now,x:event.clientX,y:event.clientY};});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFeedViews();else if(!document.querySelector('dialog[open]'))startFeedViews();});
document.addEventListener('error',event=>{
  const image=event.target;if(!(image instanceof HTMLImageElement)||image.src.endsWith('/favicon.svg'))return;
  const enhanced=(image.currentSrc||image.src).match(/\/enhanced\/(\d+)-(?:160|640|1200)\.webp(?:$|[?#])/);
  image.removeAttribute('srcset');image.removeAttribute('sizes');
  if(enhanced&&!image.dataset.photoFallback){image.dataset.photoFallback='original';image.src=`assets/products/${enhanced[1]}.jpg`;return;}
  image.src='favicon.svg';image.classList.add('missing-photo');
},true);
window.addEventListener('storage',event=>{
  if(event.key==='miora:cart'||event.key===null){refreshCart();renderCartCount();if($('cart-dialog').open)renderCart();}
  if(event.key==='miora:favorites'||event.key===null){const saved=load('favorites',[]);favorites=new Set(Array.isArray(saved)?saved.filter(id=>byId.has(id)):[]);renderProducts();if($('detail-dialog').open)renderDetail();}
});
renderLanguage();updateUrl();
const linked=params.get('item');if(byId.has(linked))openDetail(linked);

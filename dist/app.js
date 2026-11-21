import {hasCuratedCutaway} from './media-merchandising.js?v=20261117-curated1';
import {mountSpotlight,mountGalleries,galleryMarkup,motionCopy} from './menu-motion.js?v=20261117-curated1';
import {desireSections,journeyCopy,localizedJourney} from './desire-journey.js?v=20261112-generated1';
import {videoStory,dessertStoryVisible} from './video-stories.js';
import {products,categories,featured,source} from './menu-data.js';
import {photoUrl as photo,photoSet,hasPhoto,photoKind,hasAlternatePhoto,photoVariants,hasRestagedPhoto} from './photos.js?v=20261117-curated1';
import {normalizeCart,totals,updateCart,addPair,filterProducts,resolveView} from './core.js?v=20261106-feed1';
import {selectCartOffer,recordGrowthEvent} from './growth-engine.js?v=20261121-v1';
import {readTasteMemory,setTasteMemoryEnabled,rememberTasteChoice,tasteSuggestions,TASTE_STORAGE_KEY} from './taste-memory.js?v=20261121-v1';
import {USUAL_STORAGE_KEY,readUsual,saveUsual,forgetUsual,usualTotals,appendUsual} from './usual-order.js?v=20261121-v1';
import {CITY_CATEGORY,CITY_ASSETS,CITY_COPY,cityNext,cityProducts} from './city-guide.js?v=20261121-v1';
import {TOUR_SPOTS,TOUR_COPY,validTourSpot,nextTourSpot,getTourCopy} from './city-tour.js?v=20261121-v1';
import {mountKiosk} from './kiosk.js?v=20261112-videos1';
import {appendOrder,changeOrderQty,replaceOrder,normalizeOrders,configuredTotals,describeOrder,orderPrice} from './kiosk-core.js';
import {recipes,ui as kioskMessages,localized} from './kiosk-data.js';
import {previewForSelection} from './sandwich-preview.js';
import {breakfastVisualForSelection,breakfastCopy} from './breakfast-preview.js';
import {identityFor,diversifyPhotoOrder,storyCoverIds} from './visual-merchandising.js?v=20261112-covers1';

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
  share:'<path d="m22 2-7 20-4-9-9-4L22 2Z"/><path d="M22 2 11 13"/>',
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
let growthOfferSuppressed=false;
let growthOfferObserver=null;
const growthOffersSeen=new Set();
function trackGrowth(type,productId=null){try{return recordGrowthEvent(localStorage,type,productId);}catch{return false;}}
let configuredOrders=normalizeOrders(load('configured-orders',[]));
let kioskUI;
let favoriteIds=load('favorites',[]); if(!Array.isArray(favoriteIds))favoriteIds=[];
let favorites=new Set(favoriteIds.filter(id=>byId.has(id)));
let view=resolveView(params.get('view'),load('view',null));
const requestedCategory=params.get('category');
let category=['all','featured',...categories.map(c=>c.id)].includes(requestedCategory)?requestedCategory:view==='feed'?'all':'featured', search='', detailId=null, staffMode=false;
let service=load('service','dineIn'); if(!['dineIn','takeaway'].includes(service))service='dineIn';
let views=load('views',{}); if(!views||typeof views!=='object'||Array.isArray(views))views={};
views=Object.fromEntries(Object.entries(views).filter(([id,n])=>byId.has(id)&&Number.isSafeInteger(n)&&n>=0));
let shareCounts=load('shares',{});
if(!shareCounts||typeof shareCounts!=='object'||Array.isArray(shareCounts))shareCounts={};
shareCounts=Object.fromEntries(Object.entries(shareCounts).filter(([id,n])=>byId.has(id)&&Number.isSafeInteger(n)&&n>=0&&n<=1000000));
let pendingShareId=null;
const viewedThisSession=new Set();
let feedObserver=null;
const feedViewTimers=new Map();
let toastTimer,disposeSpotlight=()=>{},disposeGalleries=()=>{},detailVariant='focus';
const t = key => messages[lang][key]||messages.tr[key]||key;
const name = item => item.name[lang]||item.name.tr;
const money = value => new Intl.NumberFormat(lang==='tr'?'tr-TR':lang==='ru'?'ru-RU':'en-GB',{maximumFractionDigits:2}).format(value/100)+' ₺';
function notify(text) {clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2600);}
function updateUrl() {const url=new URL(location.href);url.searchParams.set('lang',lang);url.searchParams.set('view',view);url.searchParams.set('category',category);history.replaceState(null,'',url);}
function renderTheme() {const dark=document.documentElement.dataset.theme==='dark';$('theme-toggle').innerHTML=icon(dark?'sun':'moon');$('theme-toggle').setAttribute('aria-label',lang==='ru'?(dark?'Светлая тема':'Тёмная тема'):lang==='en'?(dark?'Light theme':'Dark theme'):(dark?'Açık tema':'Koyu tema'));$('theme-toggle').setAttribute('aria-pressed',String(dark));}
const tasteCopy={
  tr:{title:'Sevdiğin tatlar',note:'Kalple kaydettiklerin burada. Önceki seçimleri yalnızca izin verirsen hatırlarız.',on:'Hatırlama açık',off:'Seçimlerimi hatırla',disable:'Hatırlamayı kapat ve geçmişi sil',add:'Yeniden ekle',empty:'Favori eklemek için kalbe dokun. Seçim geçmişi isteğe bağlıdır.'},
  ru:{title:'Твои любимые вкусы',note:'Избранное с этого устройства. Последние добавления запоминаются только с разрешения.',on:'Запоминание включено',off:'Запоминать мой выбор',disable:'Выключить и удалить историю',add:'Добавить снова',empty:'Нажми сердечко на блюде. История выбора — только по желанию.'},
  en:{title:'Your favorite flavors',note:'Favorites saved on this device. Recent selections are remembered only if you opt in.',on:'Remembering on',off:'Remember my picks',disable:'Turn off and erase recent history',add:'Add again',empty:'Tap the heart to save a favorite. Remembering recent picks is optional.'}
};
function renderTasteMemory(){
  const container=$('taste-memory'),memory=readTasteMemory(localStorage,byId);
  const picks=tasteSuggestions({favorites,memory,catalog:byId});
  const c=tasteCopy[lang],focusKey=document.activeElement?.dataset?.tasteToggle!==undefined?'tasteToggle':document.activeElement?.dataset?.tasteAdd!==undefined?'tasteAdd':null;
  const focusId=focusKey==='tasteAdd'?document.activeElement.dataset.tasteAdd:null;
  container.setAttribute('aria-label',c.title);
  const items=picks.map(p=>`<article class="taste-card"><img src="${photo(p,160)}" width="60" height="60" alt="" loading="lazy" decoding="async"><div class="taste-card-info"><b>${esc(name(p))}</b><small>${money(p.price)}</small></div><button type="button" data-taste-add="${p.id}" aria-label="${esc(c.add+' · '+name(p))}">${esc(c.add)} +</button></article>`).join('');
  container.innerHTML=`<div class="taste-head"><div><h3>${esc(c.title)}</h3><p>${esc(c.note)}</p></div><button type="button" class="taste-toggle" data-taste-toggle aria-pressed="${memory.enabled}" aria-label="${esc(memory.enabled?c.disable:c.off)}">${esc(memory.enabled?c.on:c.off)}</button></div>${items?`<div class="taste-list">${items}</div>`:`<p class="taste-empty">${esc(c.empty)}</p>`}`;
  if(focusKey)container.querySelector(focusKey==='tasteToggle'?'[data-taste-toggle]':`[data-taste-add="${focusId}"]`)?.focus({preventScroll:true});
}
const usualCopy={
  tr:{title:'Her zamanki listem',note:'Bu cihazda senin kaydettiğin liste. Fiyatlar güncel menüden hesaplanır.',repeat:'Listeye tekrar ekle',forget:'Kayıtlı listeyi sil',save:'Bu listeyi her zamanki listem olarak kaydet',saved:'Listen bu cihaza kaydedildi',deleted:'Kayıtlı liste silindi',full:'Ürün sınırına ulaşıldı. Önce mevcut listeyi düzenle.',failure:'Bu cihazda liste kaydedilemedi',count:'ürün',estimated:'Başlangıç ',notSent:'Sipariş gönderilmedi; ödeme alınmadı.'},
  ru:{title:'Мой обычный заказ',note:'Ты сам сохранил этот список на устройстве. Цены пересчитываются по актуальному меню.',repeat:'Добавить этот заказ',forget:'Удалить сохранённый',save:'Сохранить как мой обычный заказ',saved:'Список сохранён на этом устройстве',deleted:'Сохранённый список удалён',full:'Превышен лимит количества. Сначала измени текущий список.',failure:'Не удалось сохранить на этом устройстве',count:'позиций',estimated:'От ',notSent:'Заказ не отправлен, оплата не списана.'},
  en:{title:'My usual order',note:'You explicitly saved this list on this device. Prices are recalculated from the current menu.',repeat:'Add this order',forget:'Delete saved order',save:'Save as my usual order',saved:'Your list was saved on this device',deleted:'Saved order removed',full:'Quantity limit reached. Adjust your current list first.',failure:'Could not save on this device',count:'items',estimated:'From ',notSent:'No order was placed or payment taken.'}
};
function renderUsual(){
  const root=$('usual-order'),saved=readUsual(localStorage,byId);
  if(!saved){root.hidden=true;root.innerHTML='';return;}
  const copy=usualCopy[lang],sum=usualTotals(saved,byId);
  const images=[...Object.keys(saved.cart),...saved.configuredOrders.map(row=>recipes[row.kind].image)]
    .map(id=>byId.get(id)).filter(item=>item&&hasPhoto(item)).slice(0,3)
    .map(item=>`<img src="${photo(item,160)}" alt="" width="46" height="46" loading="lazy" decoding="async">`).join('');
  const estimated=saved.configuredOrders.some(row=>recipes[row.kind].estimated);
  root.hidden=false;
  root.innerHTML=`<div class="usual-order-heading"><div><h3>${esc(copy.title)}</h3><p>${esc(copy.note)}</p></div><div class="usual-order-photos" aria-hidden="true">${images}</div></div><div class="usual-order-meta"><b>${sum.count} ${esc(copy.count)}</b><strong>${estimated?esc(copy.estimated):''}${money(sum.price)}</strong></div><div class="usual-order-actions"><button type="button" data-usual-repeat>${esc(copy.repeat)}</button><button type="button" data-usual-forget>${esc(copy.forget)}</button></div><p class="usual-order-disclaimer">${esc(copy.notSent)}</p>`;
}
function repeatUsual(){
  refreshCart();
  const saved=readUsual(localStorage,byId);
  const combined=appendUsual({cart,configuredOrders},saved,byId);
  if(!combined){notify(usualCopy[lang].full);return false;}
  // Validate all quantities before either existing commit; nothing is silently dropped.
  commitCart(combined.cart);
  commitConfigured(combined.configuredOrders);
  for(const id of Object.keys(saved.cart))rememberTasteChoice(localStorage,id,byId);
  renderTasteMemory();
  renderUsual();
  notify(t('added'));
  return true;
}
const CITY_DISMISS_KEY='miora:city-guide-dismissed:v1';
function cityDismissed(){try{return sessionStorage.getItem(CITY_DISMISS_KEY)==='1';}catch{return false;}}
let cityStep='hello',cityHidden=cityDismissed(),cityTourSpot='houses';
const cityHistory=[];
function tourMarkup(c){
  const words=TOUR_COPY[lang],selected=getTourCopy(lang,cityTourSpot);
  const spots=TOUR_SPOTS.map((spot,i)=>{
    const title=words[spot].label,pressed=spot===cityTourSpot;
    return `<button type="button" class="city-tour-pin city-tour-pin-${spot}" data-city-spot="${spot}" aria-pressed="${pressed}" aria-label="${esc(title)}" title="${esc(title)}"><b aria-hidden="true">${i+1}</b></button>`;
  }).join('');
  const choices=TOUR_SPOTS.map((spot,i)=>{
    const title=words[spot].label,pressed=spot===cityTourSpot;
    return `<button type="button" class="city-tour-stop" data-city-spot="${spot}" aria-pressed="${pressed}"><span aria-hidden="true">${i+1}</span>${esc(title)}</button>`;
  }).join('');
  return `<section class="city-tour" aria-label="${esc(words.prompt)}"><figure class="city-tour-figure"><div class="city-tour-image"><img src="${CITY_ASSETS.panorama}" alt="${esc(words.photo)}" width="390" height="130" decoding="async" loading="lazy">${spots}</div><figcaption>${esc(words.hint)}</figcaption></figure><div class="city-tour-bottom"><div class="city-tour-stops" role="group" aria-label="${esc(words.prompt)}">${choices}</div><div class="city-tour-story" role="status" aria-live="polite" aria-atomic="true"><b id="city-tour-name">${esc(selected.label)}</b><p id="city-tour-description">${esc(selected.story)}</p></div><button class="city-tour-next" type="button" data-city-tour-next>${esc(words.next)} →</button><p class="city-guide-photo-note">${esc(c.privacy)}</p></div></section>`;
}
function selectTourSpot(spot){
  if(cityStep!=='town'||!validTourSpot(spot))return;
  cityTourSpot=spot;
  const root=$('city-guide'),c=getTourCopy(lang,spot);
  root.querySelectorAll('[data-city-spot]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.citySpot===spot)));
  const title=root.querySelector('#city-tour-name'),detail=root.querySelector('#city-tour-description');
  if(title)title.textContent=c.label;
  if(detail)detail.textContent=c.story;
}
function setCityVisibility(visible){
  cityHidden=!visible;
  try{if(visible)sessionStorage.removeItem(CITY_DISMISS_KEY);
      else sessionStorage.setItem(CITY_DISMISS_KEY,'1');}catch{}
  renderCityGuide();
}
function focusCityDestination(){
  $('result-title').setAttribute('tabindex','-1');
  $('result-title').focus({preventScroll:true});
}
function renderCityGuide(focus=false){
  const root=$('city-guide'),opener=$('city-open'),c=CITY_COPY[lang];
  opener.textContent=c.reopen;
  opener.hidden=!cityHidden;
  root.hidden=cityHidden;
  if(cityHidden){root.innerHTML='';return;}
  const labels={
    hello:[['family',c.familyChoice],['adults',c.adultChoice]],
    family:[['tour',c.tour],['choose',c.pick]],
    adults:[['choose',c.pick],['tour',c.tour]],
    town:[['choose',c.pick]],
    choose:[['coffee',c.coffeeChoice],['dessert',c.dessertChoice],['food',c.foodChoice]],
    coffee:[['category',c.openCategory],['choose',c.pick]],
    dessert:[['category',c.openCategory],['choose',c.pick]],
    food:[['category',c.openCategory],['choose',c.pick]]
  };
  if(cityStep==='hello'&&readUsual(localStorage,byId))labels.hello.push(['usual',c.usual]);
  if(favorites.size&&['family','adults','choose'].includes(cityStep))labels[cityStep].push(['favorites',c.favorites]);
  const photos=cityStep==='town'
    ?tourMarkup(c)
    :cityStep==='hello'
      ?`<img class="city-guide-preview" src="${CITY_ASSETS.panorama}" width="390" height="130" alt="${esc(c.panorama)}" loading="lazy">`:'';
  const suggestions=['coffee','dessert','food'].includes(cityStep)
    ?cityProducts(cityStep,products).map(p=>`<button type="button" class="city-guide-product" data-detail="${p.id}" aria-label="${esc(name(p)+' · '+money(p.price))}"><img src="${photo(p,160)}" alt="" width="60" height="60" loading="lazy"><span><b>${esc(name(p))}</b><small>${money(p.price)}</small></span></button>`).join(''):'';
  const actions=(labels[cityStep]||[]).map(([action,label])=>`<button class="city-guide-choice" type="button" data-city-action="${action}">${esc(label)}</button>`).join('');
  root.innerHTML=`<div class="city-guide-inner city-guide-step-${cityStep}"><div class="city-guide-copy"><p class="city-guide-eyebrow">${esc(c.eyebrow)}</p><h2 id="city-guide-title" tabindex="-1">${esc(c.title)}</h2><div class="city-guide-dialogue"><img src="assets/logo-source.jpg" alt="" width="38" height="38" decoding="async"><p class="city-guide-question">${esc(c[cityStep])}</p></div>${suggestions?`<div class="city-guide-products">${suggestions}</div>`:''}<div class="city-guide-actions">${actions}</div><div class="city-guide-secondary">${cityHistory.length?`<button type="button" data-city-action="back">${esc(c.back)}</button>`:''}<button type="button" data-city-action="skip">${esc(c.skip)}</button></div><p class="city-guide-privacy">${esc(c.notChat)}</p></div>${photos}</div>`;
  root.setAttribute('aria-label',c.title);
  if(focus)root.querySelector('#city-guide-title')?.focus({preventScroll:true});
}
function cityAction(action){
  if(action==='usual'){
    if(!readUsual(localStorage,byId)||!repeatUsual())return;
    setCityVisibility(false);openCart();return;
  }
  if(action==='favorites'){
    if(!favorites.size)return;
    setCityVisibility(false);selectCategory('favorites');focusCityDestination();return;
  }
  if(action==='skip'||action==='category'){
    const nextCategory=action==='category'?CITY_CATEGORY[cityStep]:'all';
    setCityVisibility(false);
    selectCategory(nextCategory||'all');focusCityDestination();return;
  }
  if(action==='back'){
    cityStep=cityHistory.pop()||'hello';renderCityGuide(true);return;
  }
  const next=cityNext(cityStep,action);
  if(!next)return;
  if(next==='town')cityTourSpot='houses';
  cityHistory.push(cityStep);cityStep=next;
  renderCityGuide(true);
}
function renderLanguage() {
  document.documentElement.lang=lang;$('language').value=lang;
  document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.dataset.i18n;if(['heroDescription','pairingTitle'].includes(k))e.innerHTML=t(k);else e.textContent=t(k);});
  $('hero-title').innerHTML=t('heroTitle');$('categories').setAttribute('aria-label',t('menu'));document.querySelector('.view-switch').setAttribute('aria-label',t('grid')+' / '+t('list'));$('share-link').setAttribute('aria-label',t('share')); $('search').placeholder=t('search');$('search').setAttribute('aria-label',t('searchLabel'));$('search-clear').setAttribute('aria-label',t('clearSearch'));
  $('view-feed').setAttribute('aria-label',t('feed'));$('view-grid').setAttribute('aria-label',t('grid'));$('view-list').setAttribute('aria-label',t('list'));$('favorites-filter').setAttribute('aria-label',t('favorites'));
  $('feed-stories').setAttribute('aria-label',t('menu'));document.querySelector('.view-switch').setAttribute('aria-label',[t('feed'),t('grid'),t('list')].join(' / '));
  document.querySelectorAll('[data-close]').forEach(e=>e.setAttribute('aria-label',t('close')));
  document.querySelectorAll('[data-journey-copy]').forEach(node=>node.textContent=journeyCopy[lang][node.dataset.journeyCopy]);
  renderTheme();renderCategories();renderProducts();renderTasteMemory();renderUsual();renderCityGuide();renderCartCount();kioskUI?.refresh();
  if($('cart-dialog').open)renderCart();if($('detail-dialog').open&&detailId)renderDetail();
}
function renderCategories() {
  const all=[{id:'featured',name:t('featured'),icon:'star'},{id:'all',name:t('all'),icon:'grid'},...categories.map(c=>({id:c.id,name:c.name[lang],icon:c.icon}))];
  $('categories').innerHTML=all.map(c=>`<button class="category-btn" type="button" data-category="${c.id}" aria-pressed="${category===c.id}">${icon(c.icon)}${esc(c.name)}</button>`).join('');
  $('feed-stories').innerHTML=all.map(c=>{const cover=products.find(p=>p.id===storyCoverIds[c.id]&&hasPhoto(p))||products.find(p=>hasPhoto(p)&&(c.id==='featured'?featured.includes(p.id):c.id==='all'||p.cat===c.id));return `<button class="story-button" type="button" data-category="${c.id}" aria-pressed="${category===c.id}"><span class="story-ring"><img src="${photo(cover,160)}" width="64" height="64" alt="" decoding="async" loading="lazy"></span><span class="story-name">${esc(c.name)}</span></button>`;}).join('');
  $('favorites-filter').innerHTML=icon('heart');$('favorites-filter').setAttribute('aria-pressed',String(category==='favorites'));
}
function meta(item) {return `${item.kcal&&!item.calorieReview?`<span>${icon('flame')}${esc(item.kcal)}</span>`:''}${item.time?`<span>${icon('clock')}${item.time} ${t('minutes')}</span>`:''}`;}
const flavorChip=item=>{
 const name=identityFor(item,lang);
 return name?'<span class="miora-photo-identity">'+esc(name)+'</span>':'';
};
const socialCopy={
  ru:{likes:'Лайки',shares:'Поделились или скопировали',views:'Просмотры',scope:'На этом устройстве'},
  tr:{likes:'Beğeniler',shares:'Paylaşılan veya kopyalanan',views:'Görüntüleme',scope:'Bu cihazda'},
  en:{likes:'Likes',shares:'Shared or copied',views:'Views',scope:'On this device'}
};
function socialStats(id) {
  const c=socialCopy[lang],like=favorites.has(id)?1:0,share=shareCounts[id]||0,seen=views[id]||0;
  return `<div class="social-stats" role="group" aria-label="${esc(c.scope)}" title="${esc(c.scope)}">
    <span class="social-stat" title="${esc(c.likes)}">${icon('heart')}<b data-like-count="${id}">${like}</b><span class="sr-only">${esc(c.likes)}</span></span>
    <span class="social-stat" title="${esc(c.shares)}">${icon('share')}<b data-share-count="${id}">${share}</b><span class="sr-only">${esc(c.shares)}</span></span>
    <span class="social-stat" title="${esc(c.views)}">${icon('eye')}<b data-view-count="${id}">${seen}</b><span class="sr-only">${esc(c.views)}</span></span>
    <span class="social-stats-scope">${esc(c.scope)}</span></div>`;
}
function syncSocialStats() {
  document.querySelectorAll('[data-like-count]').forEach(el=>el.textContent=favorites.has(el.dataset.likeCount)?1:0);
  document.querySelectorAll('[data-share-count]').forEach(el=>el.textContent=shareCounts[el.dataset.shareCount]||0);
  document.querySelectorAll('[data-view-count]').forEach(el=>el.textContent=views[el.dataset.viewCount]||0);
}
function recordShare(id) {
  if(!byId.has(id))return;
  shareCounts[id]=Math.min((shareCounts[id]||0)+1,1000000);
  save('shares',shareCounts);
  syncSocialStats();
}
function productSocial(p,compact=false){
  const scope=esc(socialCopy[lang].scope);
  return `<div class="product-social" role="group" aria-label="${esc(name(p)+' · '+socialCopy[lang].scope)}">
    <button type="button" data-favorite="${p.id}" aria-label="${esc(t('favorites')+' · '+name(p))}" title="${esc(t('favorites'))}" aria-pressed="${favorites.has(p.id)}">${icon('heart')}<span class="social-action-number" data-like-count="${p.id}" aria-hidden="true">${favorites.has(p.id)?1:0}</span></button>
    <button type="button" data-share="${p.id}" aria-label="${esc(t('share')+' · '+name(p))}" title="${esc(t('share'))}">${icon('share')}<span class="social-action-number" data-share-count="${p.id}" aria-hidden="true">${shareCounts[p.id]||0}</span></button>
    ${compact?`<span class="list-view-stat" title="${esc(socialCopy[lang].views)}">${icon('eye')}<b data-view-count="${p.id}">${views[p.id]||0}</b></span><small class="list-device-scope">${scope}</small>`:''}
  </div>`;
}
function renderProducts() {
  stopFeedViews();disposeSpotlight();disposeGalleries();
  const videoSlot=$('dessert-video');
  videoSlot.hidden=!dessertStoryVisible(category,search);
  videoSlot.innerHTML=videoSlot.hidden?'':videoStory('dessert',lang,{compact:true});
  const list=filterProducts(products,{category,search,favorites:[...favorites],featured});
  const displayList=!search&&!['all','featured','favorites'].includes(category)?diversifyPhotoOrder(list):list;
  const label=category==='featured'?t('featured'):category==='all'?(search?t('searchResults'):t('all')):category==='favorites'?t('favorites'):categories.find(c=>c.id===category)?.name[lang]||t('all');
  $('result-title').textContent=label;$('result-count').textContent=`${list.length} ${t('count')}`;
  document.body.dataset.view=view;
  const builderMenu=$('builder-menu');
  if(builderMenu.dataset.lastView!==view){builderMenu.open=view!=='feed';builderMenu.dataset.lastView=view;}
  $('spotlight-disclosure-label').textContent=motionCopy[lang].title;
  $('spotlight-disclosure').hidden=view!=='feed';
  $('menu-title').textContent=t(view==='feed'?'feedTitle':'menuTitle');document.querySelector('[data-i18n="menuKicker"]').textContent=t(view==='feed'?'feedKicker':'menuKicker');
  $('feed-stories').hidden=view!=='feed';$('categories').hidden=view==='feed';
  $('empty-state').hidden=list.length>0;$('products').className='product-grid'+(view==='list'?' list-view':view==='feed'?' feed-view':'');
  $('view-feed').setAttribute('aria-pressed',String(view==='feed'));$('view-grid').setAttribute('aria-pressed',String(view==='grid'));$('view-list').setAttribute('aria-pressed',String(view==='list'));$('search-clear').hidden=!search;
  if(view==='feed'){
    if(!search&&category!=='favorites')disposeSpotlight=mountSpotlight($('menu-spotlight'),displayList,{lang,name,money});
    $('spotlight-disclosure').hidden=$('menu-spotlight').hidden;
    const copy=journeyCopy[lang],sections=desireSections(displayList,{category,search,categories});
    const index=sections.length>1?`<details class="journey-index"><summary>${esc(copy.find)}</summary><div class="journey-links">${sections.map(g=>`<button type="button" data-journey-jump="${g.id}">${esc(localizedJourney(g.title,lang))}<small>${g.items.length}</small></button>`).join('')}</div></details>`:'';
    $('products').innerHTML=index+sections.map(g=>{
      const cards=g.items.map(p=>feedPost(p)).join('');
      return `<section class="journey-section" id="collection-${g.id}" data-journey-section="${g.id}"${g.title?` aria-labelledby="collection-title-${g.id}"`:''}>${g.title?`<div class="journey-heading"><h3 id="collection-title-${g.id}">${esc(localizedJourney(g.title,lang))}</h3><span>${g.items.length} ${copy.choices}</span></div>`:''}<div class="journey-cards">${cards}</div></section>`;
    }).join('')+(category==='featured'?`<button type="button" class="desire-catalog-link" data-category="all">${esc(copy.seeMenu)} →</button>`:'');
    disposeGalleries=mountGalleries($('products'));startFeedViews();enhanceKioskCards();return;
  }
  $('products').innerHTML=displayList.map(p=>`<article class="product-card" data-product="${p.id}">
    <div class="product-media" data-view-id="${p.id}"><button class="product-open" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}">${hasPhoto(p)?`<img src="${photo(p,view==='list'?160:640)}" ${view==='list'?'':photoSet(p,'(max-width: 620px) calc(50vw - 26px), (max-width: 960px) 30vw, 265px')} width="640" height="640" loading="lazy" decoding="async" alt="${esc(hasPhoto(p)?name(p):t('photoMissing'))}" ${hasPhoto(p)?'':'class="missing-photo"'}>`:`<div class="menu-photo-pending"><span>miora</span><small>${esc(journeyCopy[lang].noPhoto)}</small></div>`}</button>${photoKind(p)==='generated'?`<span class="generated-media-label">${esc(journeyCopy[lang].generated)}</span>`:''}${flavorChip(p)}
${view==='list'?'':productSocial(p)}</div>
    <div class="product-body"><button class="product-title" type="button" data-detail="${p.id}">${esc(name(p))}</button><p class="product-subtitle">${esc(lang==='tr'?p.description||categories.find(c=>c.id===p.cat).name.tr:p.name.tr)}</p><div class="product-meta">${meta(p)}</div>${view==='list'?productSocial(p,true):socialStats(p.id)}<div class="product-bottom"><strong class="product-price${p.price===null?' ask':''}">${p.price===null?t('ask'):money(p.price)}</strong>${p.price===null?`<button class="add-btn" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}">↗</button>`:`<button class="add-btn${cart[p.id]?' quantity-badge':''}" type="button" data-add="${p.id}" aria-label="${esc(t('add')+' · '+name(p))}">${cart[p.id]||icon('plus')}</button>`}</div></div></article>`).join('');
  enhanceKioskCards();startFeedViews();
}
const kioskFor=id=>({430236:'sandwich',430240:'sandwich',431177:'sandwich',431178:'sandwich',431179:'sandwich',431203:'breakfast',431333:'pancake'})[id]||null;
function kioskBread(id){return ({430236:'wholewheat',430240:'olive',431177:'tomato-walnut',431178:'plain',431179:'focaccia'})[id]||null;}
function enhanceKioskCards(){
  for(const card of document.querySelectorAll('#products [data-product]')){
    const id=card.dataset.product,kind=kioskFor(id);if(!kind)continue;
    const row=card.querySelector(view==='feed'?'.post-order':'.product-bottom');
    if(!row)continue;
    const prior=row.querySelector('button[data-add],button[data-detail]');if(!prior)continue;
    const b=document.createElement('button');
    b.type='button';b.className=view==='feed'?'button primary feed-add kiosk-card-cta':'kiosk-card-cta';
    b.dataset.kStart=kind;if(kioskBread(id))b.dataset.kBread=kioskBread(id);
    b.textContent=kioskMessages[lang].build;row.classList.add('kiosk-has-config');prior.replaceWith(b);
    const priceNode=row.querySelector('.product-price,strong');
    if(kind==='pancake'&&priceNode){priceNode.textContent=money(25000);priceNode.classList.remove('ask');}
    if(kind==='sandwich'&&priceNode)priceNode.textContent=kioskMessages[lang].from+' '+money(35000);
    if(kind==='breakfast'&&priceNode)priceNode.textContent=kioskMessages[lang].from+' '+money(35000);
  }
}
function enhanceKioskDetail(id){
  const kind=kioskFor(id);if(!kind)return;
  const row=$('detail-content').querySelector('.detail-actions');
  const button=row?.querySelector('button');if(!button)return;
  const b=document.createElement('button');b.type='button';b.className='button primary kiosk-card-cta';
  b.dataset.kStart=kind;if(kioskBread(id))b.dataset.kBread=kioskBread(id);
  b.textContent=kioskMessages[lang].build;button.replaceWith(b);
  if(kind==='pancake'){
    const section=$('detail-content').querySelector('.detail-copy > .detail-section');
    if(section?.querySelector('h3')?.textContent===t('ask'))section.remove();
    const metrics=$('detail-content').querySelector('.detail-metrics');
    if(metrics)metrics.insertAdjacentHTML('beforeend','<span class="metric detail-price">'+money(25000)+'</span>');
  }
}
function feedPost(p) {
  const copy=journeyCopy[lang],qty=cart[p.id]||0,kind=photoKind(p);
  const media=kind==='missing'
    ?`<div class="menu-photo-pending"><span>miora</span><small>${esc(copy.noPhoto)}</small></div>`
    :hasAlternatePhoto(p)?`<div class="feed-photo generated-photo" data-feed-photo="${p.id}">${galleryMarkup(p,lang,name(p),copy.details)}</div>`
    :`<div class="feed-photo ${kind==='original'?'original-photo original-'+p.id:kind==='generated'?'generated-photo generated-'+p.id:''}" data-feed-photo="${p.id}"><button class="feed-photo-button" type="button" data-detail="${p.id}" aria-label="${esc(copy.details+' · '+name(p))}"><img src="${photo(p)}" ${photoSet(p,'(max-width: 620px) calc(100vw - 24px), (max-width: 960px) 660px, 640px')} width="640" height="480" loading="lazy" decoding="async" alt="${esc(name(p))}"></button>${flavorChip(p)}</div>`;
  return `<article class="product-card feed-post" data-product="${p.id}" aria-labelledby="post-title-${p.id}">
    <div class="feed-media" data-view-id="${p.id}">${media}<div class="feed-action-rail" role="group" aria-label="${esc(name(p))}">
      <button class="icon-btn feed-save feed-rail-button" type="button" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${esc(t('favorites')+' · '+name(p))}" title="${esc(t('favorites'))}">${icon('heart')}<span class="feed-rail-label" aria-hidden="true">${esc(t('favorites'))}</span></button>
      <button class="icon-btn feed-rail-button" type="button" data-share="${p.id}" aria-label="${esc(t('share')+' · '+name(p))}" title="${esc(t('share'))}">${icon('share')}<span class="feed-rail-label" aria-hidden="true">${esc(t('share'))}</span></button>
      <button class="icon-btn feed-rail-button" type="button" data-detail="${p.id}" aria-label="${esc(t('detail')+' · '+name(p))}" title="${esc(t('detail'))}">${icon('info')}<span class="feed-rail-label" aria-hidden="true">${esc(t('detail'))}</span></button>
    </div></div>
    ${kind==='missing'||hasAlternatePhoto(p)?'':`<p class="feed-media-note">${kind==='generated'?copy.generated:kind==='illustration'?copy.illustration:copy.photo}</p>`}
    <div class="post-caption"><h3 id="post-title-${p.id}"><button type="button" data-detail="${p.id}">${esc(name(p))}</button></h3>${lang==='tr'?'':`<p class="post-original" lang="tr">${esc(p.name.tr)}</p>`}</div>
    ${socialStats(p.id)}
    <div class="post-order"><div><strong>${p.price===null?t('ask'):money(p.price)}</strong><span data-post-qty="${p.id}" ${qty?'':'hidden'}>${t('inOrder')}: ${qty}</span></div>${p.price===null?`<button class="button secondary feed-add" type="button" data-detail="${p.id}">${t('detail')}</button>`:`<button class="button primary feed-add" type="button" data-add="${p.id}" aria-label="${esc(t('addToOrder')+' · '+name(p))}">${copy.add}</button>`}</div></article>`;
}
function recordView(id) {
  if(!byId.has(id)||viewedThisSession.has(id))return;
  const stored=load('views',{}),current=stored&&Number.isSafeInteger(stored[id])&&stored[id]>=0?stored[id]:0;
  views[id]=Math.min(Math.max(views[id]||0,current)+1,1000000);viewedThisSession.add(id);save('views',views);
  document.querySelectorAll(`[data-view-count="${id}"]`).forEach(el=>el.textContent=views[id]);
}
function stopFeedViews() {
  feedObserver?.disconnect();feedObserver=null;
  for(const timer of feedViewTimers.values())clearTimeout(timer);feedViewTimers.clear();
}
function startFeedViews() {
  stopFeedViews();
  if(!('IntersectionObserver' in window))return;
  feedObserver=new IntersectionObserver(entries=>{for(const entry of entries){const id=entry.target.dataset.viewId;clearTimeout(feedViewTimers.get(id));feedViewTimers.delete(id);
    if(entry.intersectionRatio>=.65&&!document.hidden&&!document.querySelector('dialog[open]')&&!viewedThisSession.has(id))feedViewTimers.set(id,setTimeout(()=>{feedViewTimers.delete(id);if(!document.hidden&&!document.querySelector('dialog[open]')&&entry.target.isConnected)recordView(id);},1000));
  }},{threshold:[0,.65],rootMargin:`-${document.querySelector('.header').offsetHeight+$('toolbar').offsetHeight}px 0px 0px 0px`});
  document.querySelectorAll('[data-view-id]').forEach(el=>feedObserver.observe(el));
}
function likePhoto(id,button) {
  if(!favorites.has(id))toggleFavorite(id);
  button.classList.remove('like-flash');void button.offsetWidth;button.classList.add('like-flash');setTimeout(()=>button.classList.remove('like-flash'),650);
}
function orderTotals(){const regular=totals(cart,byId),custom=configuredTotals(configuredOrders);return {count:regular.count+custom.count,price:regular.price+custom.price};}
function commitConfigured(next){configuredOrders=normalizeOrders(next);save('configured-orders',configuredOrders);if(!orderTotals().count)staffMode=false;renderCartCount();if($('cart-dialog').open)renderCart();}
function addConfigured(order,drink){
  const next=appendOrder(configuredOrders,order);if(!next){notify(t('limit'));return false;}
  refreshCart();
  if(drink&&(cart['428772']||0)>=99){notify(t('limit'));return false;}
  commitConfigured(next);
  if(drink)commitCart(updateCart(cart,'428772',1,byId));
  trackGrowth('cart_add');notify(t('added'));return true;
}
function estimatedBasket(){return configuredOrders.some(item=>recipes[item.kind].estimated);}
function updatedConfigured(order,index){
  const next=replaceOrder(configuredOrders,index,order);
  if(!next){notify(t('limit'));return false;}
  commitConfigured(next);
  setTimeout(()=>{if(!$('kiosk-dialog').open)openCart();},0);
  return true;
}
function renderCartCount() {
  const sum=orderTotals();
  $('cart-open').innerHTML=`${icon('bag')}<span>${esc(t('cart'))}</span><span class="cart-count">${sum.count}</span>`;$('cart-open').setAttribute('aria-label',`${t('cart')} · ${sum.count}`);
  $('mobile-cart').hidden=!sum.count;$('mobile-cart-open').innerHTML=`<span>${icon('bag')}${esc(t('cart'))} · ${sum.count}</span><strong>${estimatedBasket()?kioskMessages[lang].from+' ':''}${money(sum.price)}</strong>`;
  document.querySelectorAll('[data-add]').forEach(b=>{if(!b.classList.contains('add-btn'))return;const n=cart[b.dataset.add];b.classList.toggle('quantity-badge',!!n);b.innerHTML=n||icon('plus');});
  document.querySelectorAll('.feed-add[data-add]').forEach(b=>{const n=cart[b.dataset.add]||0;b.innerHTML=`${icon('bag')}<span>${t(n?'addMore':'addToOrder')}</span>`;});
  document.querySelectorAll('[data-post-qty]').forEach(el=>{const n=cart[el.dataset.postQty]||0;el.hidden=!n;el.textContent=`${t('inOrder')}: ${n}`;});
}
function refreshCart() {cart=normalizeCart(load('cart',cart),byId);}
function commitCart(next) {cart=next;save('cart',cart);if(!orderTotals().count)staffMode=false;renderCartCount();if($('cart-dialog').open)renderCart();}
function add(id) {
  if(byId.get(id)?.price==null)return false;
  refreshCart();
  if((cart[id]||0)>=99){notify(t('limit'));return false;}
  commitCart(updateCart(cart,id,1,byId));
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const cartButton=$('cart-open');
    cartButton.classList.remove('miora-cart-pulse');
    void cartButton.offsetWidth;
    cartButton.classList.add('miora-cart-pulse');
    cartButton.addEventListener('animationend',()=>cartButton.classList.remove('miora-cart-pulse'),{once:true});
  }
  trackGrowth('cart_add',id);
  rememberTasteChoice(localStorage,id,byId);renderTasteMemory();
  notify(`${t('added')} · ${name(byId.get(id))}`);
  return true;
}
function toggleFavorite(id) {
  if(!byId.has(id))return;
  if(favorites.has(id)){favorites.delete(id);notify(t('favoriteRemoved'));}else{favorites.add(id);notify(t('favoriteAdded'));}
  save('favorites',[...favorites]);document.querySelectorAll(`[data-favorite="${id}"]`).forEach(b=>b.setAttribute('aria-pressed',String(favorites.has(id))));syncSocialStats();
  document.querySelectorAll(`[data-saved="${id}"]`).forEach(el=>el.hidden=!favorites.has(id));
  if(category==='favorites')renderProducts();
  renderTasteMemory();renderCityGuide();
}
function openDetail(id,variant='focus') {
  if(!byId.has(id))return;
  const switching=detailId===id&&$('detail-dialog').open;
  detailId=id;
  // Curated front image first: no unsolicited reconstructed 360 or synthetic cutaway.
  detailVariant=variant==='original'?'original':'focus';
  stopFeedViews();recordView(id);if(!switching)trackGrowth('product_open',id);
  renderDetail();
  if(!$('detail-dialog').open)$('detail-dialog').showModal();
  $('detail-dialog').scrollTop=0;
  if(switching)$('detail-content').querySelector('.detail-source-toggle')?.focus({preventScroll:true});
}

const detailCopy = {
  ru:{more:'Состав, аллергены и дополнительная информация',allergen:'Аллергены по меню',check:'уточните состав у сотрудника',unknown:'Аллергены: уточните у сотрудника'},
  en:{more:'Ingredients, allergens and more',allergen:'Listed allergens',check:'confirm ingredients with staff',unknown:'Allergens: ask the staff'},
  tr:{more:'İçindekiler, alerjenler ve ayrıntılar',allergen:'Menüdeki alerjenler',check:'içeriği personele doğrulayın',unknown:'Alerjenler: personele danışın'}
};
const cutawayCopy={
  ru:{title:'Как выглядит внутри (AI-иллюстрация)',alt:'Иллюстрация возможной текстуры разреза',note:'Иллюстрация создана ИИ. Реальные слои, размер порции и подача могут отличаться.'},
  en:{title:'Inside texture (AI illustration)',alt:'Illustration of a possible interior texture',note:'AI illustration, not an actual product cut. Layers, serving size and presentation may differ.'},
  tr:{title:'İç doku (yapay zekâ görseli)',alt:'Ürünün olası iç dokusunun görseli',note:'Yapay zekâ görselidir, gerçek ürün kesiti değildir. Katmanlar, porsiyon ve sunum değişebilir.'}
};
function renderDetail() {
  const keepDetailsOpen=$('detail-dialog').open && $('detail-content').querySelector('.detail-more')?.open===true;
  const p=byId.get(detailId),c=categories.find(c=>c.id===p.cat);if(!p)return;
  $('detail-content').innerHTML=`<div class="detail-top">${hasPhoto(p)?`<img class="detail-photo${hasPhoto(p)?'':' missing-photo'}" src="${photo(p,480,detailVariant)}" ${photoSet(p,'(max-width: 620px) calc(100vw - 32px), 480px',detailVariant)} width="640" height="640" decoding="async" alt="${esc(hasPhoto(p)?name(p):t('photoMissing'))}">`:`<div class="menu-photo-pending detail-photo-pending"><span>miora</span><strong>${esc(name(p))}</strong><small>${esc(journeyCopy[lang].noPhoto)}</small></div>`}<button class="icon-btn close-btn" type="button" data-close="detail-dialog" aria-label="${t('close')}">×</button></div>
    <div class="detail-copy"><p class="eyebrow">${esc(c.name[lang])}</p><h2 id="detail-title">${esc(name(p))}</h2><div class="detail-metrics">${p.kcal&&!p.calorieReview?`<span class="metric">${icon('flame')}${esc(p.kcal)}</span>`:''}${p.time?`<span class="metric">${icon('clock')}${p.time} ${t('minutes')}</span>`:''}${p.price!==null?`<span class="metric detail-price">${money(p.price)}</span>`:''}</div>
    <p class="photo-provenance">${esc(photoKind(p,detailVariant)==='generated'&&!hasRestagedPhoto(p)?(lang==='ru'?'AI-пример подачи, созданный по названию и составу меню; это не фотография блюда Miora.':lang==='en'?'AI serving illustration created from the menu name and ingredients; not a photograph of the actual Miora dish.':'Menü adı ve içeriğine göre oluşturulmuş yapay zekâ servis örneğidir; gerçek Miora ürün fotoğrafı değildir.'):(photoKind(p,detailVariant)==='illustration'||hasRestagedPhoto(p)&&detailVariant!=='original')?(lang==='ru'?'Изображение из меню переработано с помощью ИИ; подача и выбранный вариант могут отличаться.':lang==='en'?'AI-restyled source-menu image; serving and recipe variant may differ.':'Kaynak menü görseli yapay zekâ ile düzenlenmiştir; servis ve tarif seçeneği farklı olabilir.'):hasPhoto(p)?journeyCopy[lang].photo:journeyCopy[lang].noPhoto)}</p>
    <p class="detail-allergen-quick">${p.allergens.length?`${esc(detailCopy[lang].allergen)}: ${esc(p.allergens.map(a=>t(a)).join(", "))} · ${esc(detailCopy[lang].check)}`:esc(detailCopy[lang].unknown)}</p>
    ${p.price===null?`<section class="detail-section"><h3>${t('ask')}</h3><p>${t('priceMissing')}</p></section>`:''}
    <details class="detail-more"><summary>${esc(detailCopy[lang].more)}</summary><div class="detail-more-body">
      ${lang!=='tr'?`<p class="original-name" lang="tr">${esc(p.name.tr)}</p>`:''}
    ${photoVariants(p).includes('original')?`<button type="button" class="detail-source-toggle" data-detail="${p.id}" data-source-view="${detailVariant==='original'?'focus':'original'}">${motionCopy[lang][detailVariant==='original'?'cover':'source']}</button>`:''}
    ${hasCuratedCutaway(p)?`<details class="detail-cutaway"><summary>${esc(cutawayCopy[lang].title)}</summary><div class="detail-cutaway-content"><img src="${photo(p,640,'inside')}" ${photoSet(p,'(max-width: 620px) calc(100vw - 64px), 460px','inside')} width="640" height="480" loading="lazy" decoding="async" alt="${esc(cutawayCopy[lang].alt)}"><p>${esc(cutawayCopy[lang].note)}</p></div></details>`:''}
    ${p.id==='430356'?videoStory('croissant',lang,{compact:true}):p.id==='431203'?videoStory('breakfast',lang,{compact:true}):''}
    <section class="detail-section"><h3>${t('ingredients')}</h3>${p.description?`<p lang="tr">${esc(p.description)}</p>${lang!=='tr'?`<p class="detail-disclaimer">${t('originalRecipe')}</p>`:''}`:`<p>${t('noIngredients')}</p>`}</section>
    <section class="detail-section"><h3>${t('allergens')}</h3>${p.allergens.length?`<div class="allergens">${p.allergens.map(a=>`<span>${t(a)}</span>`).join('')}</div>`:`<p>${t('noAllergens')}</p>`}<p class="detail-disclaimer">${t('allergenNote')}</p>${p.kcal?`<p class="detail-disclaimer">${p.calorieReview?t('reviewCalorie'):t('calorieNote')}</p>`:''}</section><div class="views">${icon('eye')}${views[p.id]||0} · ${t('localViews')}</div>
    </div></details>
    </div>
    <div class="detail-actions">${p.price!==null?`<button class="button primary" type="button" data-add="${p.id}">${icon('plus')}${t('addToOrder')} · ${money(p.price)}</button>`:`<button class="button secondary" type="button" data-close="detail-dialog">${t('backToMenu')}</button>`}<button class="icon-btn" type="button" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${t('favorites')}">${icon('heart')}</button><button class="icon-btn" type="button" data-share="${p.id}" aria-label="${t('share')}">${icon('share')}</button></div>`;
  if(keepDetailsOpen)$('detail-content').querySelector('.detail-more').open=true;
  enhanceKioskDetail(detailId);
}
function recommend() {
  return selectCartOffer({cart,configuredOrders,catalog:byId,suppressed:growthOfferSuppressed});
}
const growthLabels={
  tr:{regular:'Normal menü fiyatı · indirim yok',dismiss:'Hayır, teşekkürler'},
  ru:{regular:'Обычная цена меню · без скидки',dismiss:'Нет, спасибо'},
  en:{regular:'Regular menu price · no discount',dismiss:'No, thanks'}
};
function observeGrowthOffer(id){
  growthOfferObserver?.disconnect();
  growthOfferObserver=null;
  if(!id||growthOffersSeen.has(id))return;
  const body=$('cart-content'),offer=body.querySelector('[data-growth-offer]');
  if(!offer)return;
  const mark=()=>{if(growthOffersSeen.has(id))return;growthOffersSeen.add(id);trackGrowth('offer_visible',id);growthOfferObserver?.disconnect();growthOfferObserver=null;};
  if(typeof IntersectionObserver==='function'){
    growthOfferObserver=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.5))mark();
    },{root:body,threshold:.5});
    growthOfferObserver.observe(offer);
  }else{
    const r=offer.getBoundingClientRect(),v=body.getBoundingClientRect();
    if(r.top<v.bottom&&r.bottom>v.top)mark();
  }
}
function orderText() {
  const lines=Object.entries(cart).map(([id,qty])=>`${qty} x ${byId.get(id).name.tr} — ${money(byId.get(id).price*qty)}`);
  const custom=configuredOrders.map(o=>`${o.qty} x ${describeOrder(o,'tr')} — ${money(orderPrice(o.kind,o.selection)*o.qty)}${recipes[o.kind].estimated?'*':''}`);
  const caution=configuredOrders.some(o=>recipes[o.kind].estimated)?['* Sandviç içeriğinin son fiyatını personelle teyit ediniz.']:[];
  return ['Miora Coffee',service==='takeaway'?'Paket':'Burada',...lines,...custom,`Toplam: ${money(orderTotals().price)}`,...caution].join('\n');
}
function drawQR(canvas,text) {
  const code=new window.MioraQRCode(-1,1);code.addData(String.fromCharCode(...new TextEncoder().encode(text)));code.make();
  const modules=code.getModuleCount(),unit=5;canvas.width=canvas.height=(modules+8)*unit;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';
  for(let y=0;y<modules;y++)for(let x=0;x<modules;x++)if(code.isDark(y,x))ctx.fillRect((x+4)*unit,(y+4)*unit,unit,unit);
}
function renderCart() {
  growthOfferObserver?.disconnect();growthOfferObserver=null;
  const body=$('cart-content'),top=body.scrollTop,active=document.activeElement,focusId=active?.dataset?.stepId,focusDelta=active?.dataset?.step;
  const sum=orderTotals();$('cart-title').textContent=t(staffMode?'staffTitle':'cart');$('cart-kicker').textContent=t(staffMode?'staffKicker':'cartKicker');
  if(!sum.count){body.innerHTML=`<div class="cart-empty">${icon('bag')}<p>${t('emptyCart')}</p></div>`;$('cart-footer').innerHTML=`${readUsual(localStorage,byId)?`<button class="button primary" type="button" data-usual-repeat>${esc(usualCopy[lang].repeat)}</button>`:''}<button class="button secondary" type="button" data-action="back-menu">${t('backToMenu')}</button>`;return;}
  const lines=Object.entries(cart).map(([id,qty])=>{const p=byId.get(id);return `<li class="cart-line"><div class="cart-item"><img src="${photo(p,160)}" alt="" width="58" height="62"><div><b ${staffMode?'lang="tr"':''}>${staffMode?qty+' × ':''}${esc(staffMode?p.name.tr:name(p))}</b><small>${money(p.price)} × ${qty}${staffMode?'':' · '+money(p.price*qty)}</small>${photoKind(p)==='generated'?`<small class="cart-photo-note">${esc(journeyCopy[lang].generated)}</small>`:''}</div></div>${staffMode?`<strong class="order-line-total">${money(p.price*qty)}</strong>`:`<div class="qty"><button type="button" data-step="-1" data-step-id="${id}" aria-label="${esc(t('decrease')+' · '+name(p))}">${icon('minus')}</button><output>${qty}</output><button type="button" data-step="1" data-step-id="${id}" aria-label="${esc(t('increase')+' · '+name(p))}" ${qty>=99?'disabled':''}>${icon('plus')}</button></div>`}</li>`;}).join('');
  const configuredLines=configuredOrders.map((item,i)=>{
    const r=recipes[item.kind];
    const language=staffMode?'tr':lang;
    const nameText=localized(r.name,language);
    const subtotal=orderPrice(item.kind,item.selection)*item.qty;
    const details=r.steps.map(step=>({
      label:localized(step.title,language),
      values:item.selection[step.id].map(id=>localized(step.items.find(v=>v.id===id).label,language))
    })).filter(group=>group.values.length);
    const values=details.flatMap(group=>group.values);
    const pills=values.slice(0,4).map(value=>`<span class="kiosk-cart-pill">${esc(value)}</span>`).join('')+
      (values.length>4?`<span class="kiosk-cart-pill">+${values.length-4}</span>`:'');
    const imageItem=byId.get(r.image);
    const sandwich=item.kind==='sandwich';
    const breakfast=item.kind==='breakfast';
    const showFood=sandwich||breakfast;
    const visual=sandwich?previewForSelection(item.selection):
      breakfast?breakfastVisualForSelection(item.selection):null;
    const bc=breakfastCopy[language]||breakfastCopy.tr;
    const previewPhoto=breakfast?(visual.src||(imageItem&&hasPhoto(imageItem)?photo(imageItem,640):null)):
      visual?.src||null;
    const compactPhoto=previewPhoto
      ?`<img src="${esc(previewPhoto)}" width="62" height="62" alt="" loading="lazy" decoding="async">`
      :imageItem&&hasPhoto(imageItem)&&!showFood
        ?`<img src="${photo(imageItem,160)}" width="62" height="62" alt="" loading="lazy" decoding="async">`
        :'<div class="kiosk-cart-symbol" aria-hidden="true">m</div>';
    const cartPhotoLabel=breakfast?(visual.isAI
      ?language==='ru'?'AI-визуализация завтрака':language==='en'?'AI serving concept':'Yapay zekâ servis örneği'
      :language==='ru'?'Завтрак из меню Miora':language==='en'?'Miora menu breakfast':'Miora menü kahvaltısı'):
      language==='ru'?(visual?.baseOnly?'Твоя основа':'Пример подачи'):
      language==='en'?(visual?.baseOnly?'Your chosen bread':'Illustrative serving photo'):
      visual?.baseOnly?'Seçtiğin ekmek':'Örnek servis görseli';
    const cartPhotoDisclaimer=breakfast?(visual.isAI?bc.ai:bc.real):
      language==='ru'?'Фото иллюстративное, состав указан ниже':
      language==='en'?'Illustrative image; actual ingredients listed below':
      'Görsel örnektir; gerçek içerik aşağıda';
    const featuredPhoto=showFood&&!staffMode
      ?`<figure class="kiosk-cart-showcase">${previewPhoto
        ?`<img src="${esc(previewPhoto)}" width="900" height="600" alt="" loading="lazy" decoding="async">`
        :'<div class="kiosk-cart-showcase-placeholder" aria-hidden="true">miora</div>'}
        <figcaption><strong>${esc(cartPhotoLabel)}</strong><span>${esc(cartPhotoDisclaimer)}</span></figcaption></figure>`
      :'';
    const displayName=breakfast&&!staffMode?bc.cart:
      sandwich&&!staffMode
      ?language==='ru'?'Твой сэндвич Miora':language==='en'?'Your Miora sandwich':'Senin Miora sandviçin'
      :nameText;
    const cartDesire=breakfast&&!staffMode
      ?`<span class="kiosk-cart-promise">${esc(bc.promise)}</span>`
      :sandwich&&!staffMode
      ?`<span class="kiosk-cart-promise">${esc(visual.baseOnly
         ?language==='ru'?'Твоя основа уже выбрана':language==='en'?'Your bread is selected':'Ekmeğini seçtin'
         :language==='ru'?'Собрано по твоему вкусу':language==='en'?'Made to your taste':'Tam damak zevkine göre')}</span>`
      :'';
    const editLabel=language==='ru'?'Изменить состав':language==='en'?'Edit ingredients':'İçeriği düzenle';
    const detailLabel=language==='ru'?'Весь состав':language==='en'?'Full ingredients':'Tüm içerik';
    return `<li class="cart-line kiosk-cart-line${showFood?' kiosk-cart-sandwich':''}${breakfast?' kiosk-cart-breakfast':''}${staffMode?' kiosk-cart-staff':''}">${featuredPhoto}<div class="kiosk-cart-top">${showFood&&!staffMode?'':compactPhoto}<div class="kiosk-cart-top-text">
      <b ${staffMode?'lang="tr"':''}>${staffMode?item.qty+' × ':''}${esc(displayName)}</b>
      ${cartDesire}
      <small>${r.estimated?(language==='ru'?'От ':language==='en'?'From ':'Başlangıç '):''}${money(orderPrice(item.kind,item.selection))} × ${item.qty} = ${money(subtotal)}</small>
      </div></div>
      ${pills?`<div class="kiosk-cart-pills">${pills}</div>`:''}
      ${details.length?`<details class="kiosk-cart-details" ${staffMode?'open':''}><summary>${detailLabel}</summary>
        <dl>${details.map(group=>`<div><dt>${esc(group.label)}</dt><dd>${esc(group.values.join(' · '))}</dd></div>`).join('')}</dl>
        </details>`:''}
      <div class="kiosk-cart-actions">${staffMode?`<strong class="order-line-total">${money(subtotal)}</strong>`:
        `<button type="button" class="kiosk-cart-edit" data-k-edit="${i}">${editLabel} ↗</button>
          <div class="qty"><button type="button" data-k-order="${i}" data-k-delta="-1" aria-label="${esc(t('decrease')+' · '+nameText)}">${icon('minus')}</button>
          <output>${item.qty}</output><button type="button" data-k-order="${i}" data-k-delta="1" aria-label="${esc(t('increase')+' · '+nameText)}" ${item.qty>=99?'disabled':''}>${icon('plus')}</button></div>`}</div></li>`;
  }).join('');
  const kioskCaution=configuredOrders.some(o=>recipes[o.kind].estimated)?`<p class="kiosk-order-note">${esc(kioskMessages[lang].confirm)}</p>`:'';
  const extra=!staffMode&&recommend();
  body.innerHTML=`${staffMode?`<p class="order-intro">${t('staffNote')}</p><p class="order-intro" lang="tr"><b>${service==='takeaway'?'Paket':'Burada'}</b></p>`:''}<ul class="cart-lines">${lines}${configuredLines}</ul>${kioskCaution}${extra?`<section class="order-bump growth-offer" data-growth-offer="${extra.id}"><img src="${photo(extra,160)}" width="64" height="70" alt=""><div class="growth-offer-copy"><p>${t('bump')}</p><b>${esc(name(extra))}</b><small>${growthLabels[lang].regular}</small></div><div class="growth-offer-actions"><button type="button" data-growth-add="${extra.id}" aria-label="${esc(t('add')+' · '+name(extra))}">+ ${money(extra.price)}</button><button type="button" class="growth-dismiss" data-growth-dismiss="${extra.id}">${growthLabels[lang].dismiss}</button></div></section>`:''}
    ${staffMode?`<details class="order-qr"><summary>${t('qr')}</summary><canvas id="order-qr" role="img" aria-label="${t('qr')}"></canvas><small>${t('qrNote')}</small></details>`:`<div class="serve-select" role="group" aria-label="${t('dineIn')} / ${t('takeaway')}"><button type="button" data-service="dineIn" aria-pressed="${service==='dineIn'}">${t('dineIn')}</button><button type="button" data-service="takeaway" aria-pressed="${service==='takeaway'}">${t('takeaway')}</button></div>`}`;
  $('cart-footer').innerHTML=`<div class="total-line"><span>${estimatedBasket()?kioskMessages[lang].estimated:t('total')}</span><strong>${estimatedBasket()?kioskMessages[lang].from+' ':''}${money(sum.price)}</strong></div>${staffMode?`<button class="button primary" type="button" data-action="edit-order">${t('editOrder')}</button><button class="clear-cart" type="button" data-action="copy-order">${t('copyOrder')}</button>`:`<button class="button primary" type="button" data-action="show-staff">${t('showStaff')} <span aria-hidden="true">↗</span></button><button class="usual-order-save" type="button" data-usual-save>${esc(usualCopy[lang].save)}</button><button class="clear-cart" type="button" data-action="clear-cart">${t('clearCart')}</button>`}<p class="checkout-note">${t('orderNote')}</p>`;
  if(staffMode){try{drawQR($('order-qr'),orderText());}catch{$('order-qr').parentElement.innerHTML=`<p class="qr-error">${t('qrError')}</p>`;}}
  body.scrollTop=top;
  observeGrowthOffer(extra?.id);
  if(focusId&&focusDelta)body.querySelector(`[data-step-id="${focusId}"][data-step="${focusDelta}"]`)?.focus({preventScroll:true});
}
function openCart() {refreshCart();staffMode=false;renderCart();$('cart-dialog').showModal();trackGrowth('cart_open');}
async function copyText(text,success,fallback) {try {if(!navigator.clipboard?.writeText)throw new Error('clipboard');await navigator.clipboard.writeText(text);notify(success);return true;}catch{fallback?.();return false;}}
async function shareItem(id) {
  const p=byId.get(id);if(!p)return;const url=new URL(location.href);url.hash='';url.search='';url.searchParams.set('item',id);url.searchParams.set('lang',lang);url.searchParams.set('view',view);
  if(navigator.share){try{await navigator.share({title:'Miora Coffee · '+name(p),text:name(p),url:url.href});recordShare(id);return;}catch(e){if(e.name==='AbortError')return;}}
  pendingShareId=id;$('share-title').textContent=t('share')+' · Miora';$('share-description').textContent=name(p)+' — '+t('shareDescription');$('share-link').value=url.href;$('copy-link').textContent=t('copy');$('share-dialog').showModal();
}
function showCategoryResults() {
  const header=document.querySelector('.header').offsetHeight;
  const stories=view==='feed'?$('feed-stories').offsetHeight:0;
  const toolbar=$('toolbar').offsetHeight;
  const top=document.querySelector('.result-heading').getBoundingClientRect().top+scrollY-header-stories-toolbar-8;
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
}
function selectCategory(id) {
  category=id;search='';$('search').value='';$('builder-discovery').open=false;
  // Keep the navigation nodes, keyboard focus and horizontal position intact.
  document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===id)));
  $('favorites-filter').setAttribute('aria-pressed',String(id==='favorites'));
  renderProducts();updateUrl();
  $('category-status').textContent=$('result-title').textContent+' · '+$('result-count').textContent;
  showCategoryResults();
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('button,a[data-action]');if(!button)return;
  const d=button.dataset;
  if(d.close){$(d.close).close();return;}
  if(d.detail){openDetail(d.detail,d.sourceView);return;}
  if(d.cityOpen!==undefined){cityStep='hello';cityHistory.length=0;setCityVisibility(true);renderCityGuide(true);$('city-guide').scrollIntoView({block:'start',behavior:'instant'});return;}
  if(d.citySpot){selectTourSpot(d.citySpot);return;}
  if(d.cityTourNext!==undefined){
    selectTourSpot(nextTourSpot(cityTourSpot));
    $('city-guide').querySelector('.city-tour-stops [data-city-spot="'+cityTourSpot+'"]')?.focus({preventScroll:true});
    return;
  }
  if(d.cityAction){cityAction(d.cityAction);return;}
  if(d.tasteToggle!==undefined){
    const enabled=!readTasteMemory(localStorage,byId).enabled;
    if(!setTasteMemoryEnabled(localStorage,enabled,byId)){notify(t('storageError'));return;}
    renderTasteMemory();return;
  }
  if(d.tasteAdd){add(d.tasteAdd);return;}
  if(d.usualSave!==undefined){
    refreshCart();
    if(saveUsual(localStorage,{cart,configuredOrders},byId)){renderUsual();renderCityGuide();notify(usualCopy[lang].saved);}
    else notify(usualCopy[lang].failure);
    return;
  }
  if(d.usualRepeat!==undefined){repeatUsual();return;}
  if(d.usualForget!==undefined){
    if(forgetUsual(localStorage)){renderUsual();if($('cart-dialog').open)renderCart();notify(usualCopy[lang].deleted);}
    else notify(usualCopy[lang].failure);
    return;
  }
  if(d.growthDismiss){growthOfferSuppressed=true;trackGrowth('offer_dismissed',d.growthDismiss);renderCart();return;}
  if(d.growthAdd){const accepted=add(d.growthAdd);if(accepted){growthOfferSuppressed=true;trackGrowth('offer_accepted',d.growthAdd);renderCart();}return;}
  if(d.add){const added=add(d.add);if(added&&button.closest('#detail-dialog')&&$('detail-dialog').open)$('detail-dialog').close();return;}
  if(d.favorite){
    const wasLiked=favorites.has(d.favorite);
    toggleFavorite(d.favorite);
    if(!wasLiked&&favorites.has(d.favorite)&&button.isConnected&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      button.classList.add('miora-tapped');
      button.addEventListener('animationend',()=>button.classList.remove('miora-tapped'),{once:true});
    }
    return;
  }
  if(d.share){await shareItem(d.share);return;}
  if(button.hasAttribute('data-video-desserts')){selectCategory('46818');$('result-title').setAttribute('tabindex','-1');$('result-title').focus({preventScroll:true});return;}
  if(d.journeyJump){const section=$('collection-'+d.journeyJump);if(section){const offset=document.querySelector('.header').offsetHeight+(view==='feed'?$('feed-stories').offsetHeight:0)+$('toolbar').offsetHeight+8;window.scrollTo({top:Math.max(0,section.getBoundingClientRect().top+scrollY-offset),behavior:'instant'});section.querySelector('h3')?.setAttribute('tabindex','-1');section.querySelector('h3')?.focus({preventScroll:true});}return;}
  if(d.category){selectCategory(d.category);return;}
  if(d.view){const boundary=$('toolbar').getBoundingClientRect().bottom;const anchor=[...document.querySelectorAll('[data-product]')].find(el=>{const r=el.getBoundingClientRect();return r.bottom>boundary&&r.top<innerHeight;})?.dataset.product;view=resolveView(d.view,null);save('view',view);renderProducts();updateUrl();if(anchor)requestAnimationFrame(()=>{const card=document.querySelector(`[data-product="${anchor}"]`);if(card)window.scrollTo({top:Math.max(0,card.getBoundingClientRect().top+scrollY-document.querySelector('.header').offsetHeight-$('toolbar').offsetHeight-16),behavior:'instant'});});return;}
  if(d.kEdit!==undefined){const lineIndex=Number(d.kEdit),item=configuredOrders[lineIndex];if(item){$('cart-dialog').close();kioskUI?.edit(item,lineIndex);}return;}
  if(d.kOrder!==undefined){commitConfigured(changeOrderQty(configuredOrders,Number(d.kOrder),Number(d.kDelta)));return;}
  if(d.step){refreshCart();commitCart(updateCart(cart,d.stepId,Number(d.step),byId));return;}
  if(d.service){service=d.service;save('service',service);renderCart();return;}
  if(d.action==='reset'){search='';$('search').value='';selectCategory('all');return;}
  if(d.action==='add-pair'){refreshCart();const next=addPair(cart,['428772','430226'],byId);if(!next){notify(t('limit'));return;}commitCart(next);trackGrowth('cart_add');rememberTasteChoice(localStorage,'428772',byId);rememberTasteChoice(localStorage,'430226',byId);renderTasteMemory();notify(t('added')+' · Cappuccino + San Sebastian');return;}
  if(d.action==='show-staff'){staffMode=true;trackGrowth('staff_preview');renderCart();$('cart-content').scrollTop=0;$('cart-title').setAttribute('tabindex','-1');$('cart-title').focus();return;}
  if(d.action==='edit-order'){staffMode=false;renderCart();return;}
  if(d.action==='clear-cart'){commitConfigured([]);commitCart({});growthOfferSuppressed=false;growthOffersSeen.clear();trackGrowth('cart_cleared');return;}
  if(d.action==='back-menu'){$('cart-dialog').close();$('menu').scrollIntoView({block:'start'});return;}
  if(d.action==='copy-order'){const copied=await copyText(orderText(),t('orderCopied'),()=>{const text=document.createElement('textarea');text.className='copy-order-fallback';text.value=orderText();text.setAttribute('aria-label',t('copyOrder'));$('cart-content').append(text);text.focus();text.select();notify(t('selectCopy'));});if(copied)trackGrowth('order_copied');}
});
$('cart-open').addEventListener('click',openCart);$('mobile-cart-open').addEventListener('click',openCart);
$('search-icon').innerHTML=icon('search');
$('view-feed').innerHTML=icon('feed');$('view-grid').innerHTML=icon('grid');$('view-list').innerHTML=icon('list');
$('search').addEventListener('input',event=>{search=event.target.value;if(search&&category!=='favorites'&&category!=='all'){category='all';renderCategories();}renderProducts();});
$('search-clear').addEventListener('click',()=>{search='';$('search').value='';renderProducts();$('search').focus();});
$('favorites-filter').addEventListener('click',()=>{search='';$('search').value='';selectCategory(category==='favorites'?'featured':'favorites');});
$('language').addEventListener('change',event=>{lang=event.target.value;save('language',lang);renderLanguage();updateUrl();});
$('theme-toggle').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('miora:theme',theme);}catch{}document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#1e1c19':'#f8f5ef';renderTheme();});
$('copy-link').addEventListener('click',async()=>{const ok=await copyText($('share-link').value,t('copied'),()=>{$('share-link').focus();$('share-link').select();notify(t('selectCopy'));});if(ok&&pendingShareId)recordShare(pendingShareId);});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))startFeedViews();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFeedViews();else if(!document.querySelector('dialog[open]'))startFeedViews();});
document.addEventListener('error',event=>{
  const image=event.target;if(!(image instanceof HTMLImageElement)||image.src.endsWith('/favicon.svg'))return;
  const original=(image.currentSrc||image.src).match(/\/originals\/(\d+)-(?:160|360|640|1200)\.webp(?:$|[?#])/);
  const enhanced=(image.currentSrc||image.src).match(/\/enhanced\/(\d+)-(?:160|640|1200)\.webp(?:$|[?#])/);
  image.removeAttribute('srcset');image.removeAttribute('sizes');
  if(original&&!image.dataset.photoFallback){image.dataset.photoFallback='original';image.src=`assets/products/${original[1]}.jpg`;return;}
  if(enhanced&&!image.dataset.photoFallback){image.dataset.photoFallback='original';image.src=`assets/products/${enhanced[1]}.jpg`;return;}
  if(image.closest('.feed-photo,.detail-top,.spotlight-slide')){const placeholder=document.createElement('div');placeholder.className='menu-photo-pending';placeholder.textContent=journeyCopy[lang].noPhoto;image.replaceWith(placeholder);return;}
  image.src='favicon.svg';image.classList.add('missing-photo');
},true);
window.addEventListener('storage',event=>{
  if(event.key==='miora:cart'||event.key===null){refreshCart();renderCartCount();if($('cart-dialog').open)renderCart();}
  if(event.key==='miora:configured-orders'||event.key===null){configuredOrders=normalizeOrders(load('configured-orders',[]));renderCartCount();if($('cart-dialog').open)renderCart();}
  if(event.key==='miora:favorites'||event.key===null){const saved=load('favorites',[]);favorites=new Set(Array.isArray(saved)?saved.filter(id=>byId.has(id)):[]);renderProducts();renderTasteMemory();if($('detail-dialog').open)renderDetail();}
  if(event.key===TASTE_STORAGE_KEY||event.key===null)renderTasteMemory();
  if(event.key===USUAL_STORAGE_KEY||event.key===null){renderUsual();renderCityGuide();if($('cart-dialog').open)renderCart();}
  if(event.key==='miora:views'||event.key==='miora:shares'||event.key===null){const nextViews=load('views',{}),nextShares=load('shares',{});views=Object.fromEntries(Object.entries(nextViews&&typeof nextViews==='object'&&!Array.isArray(nextViews)?nextViews:{}).filter(([id,n])=>byId.has(id)&&Number.isSafeInteger(n)&&n>=0));shareCounts=Object.fromEntries(Object.entries(nextShares&&typeof nextShares==='object'&&!Array.isArray(nextShares)?nextShares:{}).filter(([id,n])=>byId.has(id)&&Number.isSafeInteger(n)&&n>=0&&n<=1000000));syncSocialStats();}
});
// Translated category labels can change the sticky row height.
const storySizeObserver=new ResizeObserver(()=>{
  const height=$('feed-stories').offsetHeight;
  if(height)document.documentElement.style.setProperty('--stories-h',height+'px');
});
storySizeObserver.observe($('feed-stories'));
kioskUI=mountKiosk({getLanguage:()=>lang,onAdd:addConfigured,onUpdate:updatedConfigured,onEdited:openCart,money,getPhoto:id=>hasPhoto(byId.get(id))?photo(byId.get(id),640):null});
renderLanguage();updateUrl();trackGrowth('menu_visit');
const linked=params.get('item');if(byId.has(linked))openDetail(linked,params.get('photo'));


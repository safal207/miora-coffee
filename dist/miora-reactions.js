// Miora Reactions v1: a personal, consent-by-tap sticker on each product.
// These are NOT community votes, verified tasting reviews, loyalty points or
// evidence that visitors purchased an item. No network requests or tracking.
export const STICKER_STORAGE_KEY='miora:personal-stickers:v1';
export const STICKER_LIMIT=93;

const CATALOG_CATEGORY_STICKERS=Object.freeze({
  '46776':['cozy','energy','adore'],    // hot coffee
  '46810':['ice','wow','cool'],         // iced coffee
  '46814':['warm','heart','calm'],      // hot drinks
  '46817':['fresh','zest','joy'],       // cold drinks
  '46818':['yum','sweet','wow'],        // desserts
  '47037':['sip','heart','joy'],        // water, juice, soft drinks
  '50454':['fruit','green','yum'],      // smoothies and fresh juices
  '46885':['yum','comfort','star']      // food and bakery
});
export const CATEGORY_STICKERS=CATALOG_CATEGORY_STICKERS;

const STICKERS=Object.freeze({
  cozy:{emoji:'🤎',tr:'Sıcacık',ru:'Уют',en:'Cozy'},
  energy:{emoji:'⚡',tr:'Enerji',ru:'Энергия',en:'Energy'},
  adore:{emoji:'😍',tr:'Bayıldım',ru:'Любовь',en:'Love it'},
  ice:{emoji:'🧊',tr:'Serin',ru:'Свежесть',en:'Chill'},
  wow:{emoji:'✨',tr:'Vay be',ru:'Вау',en:'Wow'},
  cool:{emoji:'😎',tr:'Havalı',ru:'Настроение',en:'Cool'},
  warm:{emoji:'🫖',tr:'İçimi ısıtır',ru:'Тепло',en:'Warm'},
  heart:{emoji:'💛',tr:'Sevdim',ru:'Нравится',en:'Love'},
  calm:{emoji:'🌿',tr:'Huzur',ru:'Спокойствие',en:'Calm'},
  fresh:{emoji:'❄️',tr:'Ferah',ru:'Свежесть',en:'Fresh'},
  zest:{emoji:'🍋',tr:'Canlandırır',ru:'Бодрость',en:'Zing'},
  joy:{emoji:'🌈',tr:'Neşe',ru:'Радость',en:'Joy'},
  yum:{emoji:'😋',tr:'Nefis',ru:'Ням',en:'Yum'},
  sweet:{emoji:'🍰',tr:'Tatlı mola',ru:'Сладко',en:'Sweet'},
  sip:{emoji:'🥤',tr:'Ferahlık',ru:'Освежает',en:'Refresh'},
  fruit:{emoji:'🍓',tr:'Meyve keyfi',ru:'Фруктовое настроение',en:'Fruity'},
  green:{emoji:'🌿',tr:'Doğa gibi',ru:'Свежесть',en:'Fresh'},
  comfort:{emoji:'🥰',tr:'Favorim',ru:'Любимое',en:'Favorite'},
  star:{emoji:'⭐',tr:'Özel',ru:'Особенное',en:'Special'}
});
export const STICKER_COPY=Object.freeze({
  tr:{
    title:'Lezzetine bir çıkartma seç',scope:'Sadece bu cihazda · genel oy sayısı değil',
    saved:'Çıkartman bu cihaza kaydedildi',removed:'Çıkartman kaldırıldı',
    failed:'Bu cihazda çıkartma kaydedilemedi',
    album:'Benim lezzet çıkartmalarım',albumNote:'Yalnızca senin seçtiğin çıkartmalar. Gerçek müşteri oyları veya satın almalar değil.',
    choose:'Bu ürün için çıkartma seç',remove:'Tekrar dokunarak çıkartmayı kaldır'
  },
  ru:{
    title:'Подари блюду стикер',scope:'Только на этом устройстве · не голоса всех гостей',
    saved:'Стикер сохранён на этом устройстве',removed:'Стикер убран',
    failed:'Не удалось сохранить стикер на устройстве',
    album:'Мои стикеры вкусов',albumNote:'Только твои выбранные стикеры. Это не голоса всех гостей и не история покупок.',
    choose:'Выбрать стикер для блюда',remove:'Нажми ещё раз, чтобы убрать'
  },
  en:{
    title:'Give this item a sticker',scope:'Only on this device · not a guest vote count',
    saved:'Sticker saved on this device',removed:'Sticker removed',
    failed:'Could not save a sticker on this device',
    album:'My flavor stickers',albumNote:'Only your selected stickers. Not community votes or purchase history.',
    choose:'Choose a sticker for this item',remove:'Tap again to remove'
  }
});
export function stickerOptions(category,lang='tr'){
  const locale=['tr','ru','en'].includes(lang)?lang:'tr';
  return (CATALOG_CATEGORY_STICKERS[category]||[]).map(id=>({id,emoji:STICKERS[id].emoji,label:STICKERS[id][locale]}));
}
const validProduct=(id,catalog)=>typeof id==='string'&&/^\d{5,7}$/.test(id)&&catalog instanceof Map&&CATALOG_CATEGORY_STICKERS[catalog.get(id)?.cat];
const validChoice=(id,code,catalog)=>validProduct(id,catalog)&&typeof code==='string'&&CATALOG_CATEGORY_STICKERS[catalog.get(id).cat].includes(code);
export function readStickers(storage,catalog){
  try{
    const raw=JSON.parse(storage?.getItem(STICKER_STORAGE_KEY)||'null');
    if(raw?.version!==1||!raw.items||typeof raw.items!=='object'||Array.isArray(raw.items))return {};
    const entries=[];
    for(const [id,code] of Object.entries(raw.items).slice(0,256)){
      if(validChoice(id,code,catalog))entries.push([id,code]);
      if(entries.length===STICKER_LIMIT)break;
    }
    return Object.fromEntries(entries);
  }catch{return {};}
}
/** One personal sticker per product; choosing the same option again removes it. */
export function chooseSticker(storage,catalog,id,code){
  if(!validChoice(id,code,catalog))return {ok:false,selected:null};
  try{
    if(typeof storage?.setItem!=='function'||typeof storage?.getItem!=='function')return {ok:false,selected:null};
    const items=readStickers(storage,catalog);
    if(items[id]===code)delete items[id];
    else items[id]=code;
    if(Object.keys(items).length===0){
      if(typeof storage?.removeItem!=='function')return {ok:false,selected:null};
      storage.removeItem(STICKER_STORAGE_KEY);
    }else storage.setItem(STICKER_STORAGE_KEY,JSON.stringify({version:1,items}));
    return {ok:true,selected:items[id]||null,items};
  }catch{return {ok:false,selected:null};}
}
export function personalStickerAlbum(reactions,catalog,lang='tr'){
  const safe=reactions&&typeof reactions==='object'&&!Array.isArray(reactions)?reactions:{};
  const rows=[];
  for(const [id,code] of Object.entries(safe)){
    if(!validChoice(id,code,catalog))continue;
    const p=catalog.get(id),sticker=stickerOptions(p.cat,lang).find(option=>option.id===code);
    if(sticker)rows.push({id,product:p,sticker});
  }
  return rows.slice(0,STICKER_LIMIT);
}

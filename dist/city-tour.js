// Real venue photo hotspots for Miora's optional family tour.
// Spot selection is ephemeral UI state; never a purchase funnel or child profile.
export const TOUR_SPOTS=Object.freeze(['houses','shop','slide','coffee']);
export const TOUR_COPY=Object.freeze({
  tr:{
    prompt:'Şehrin bir yerine dokun',hint:'Bir noktaya dokun; sana gerçek mekânımızdan bahsedelim.',
    houses:{label:'Evler',story:'Pastel renkli cepheler, küçük pencereler ve tenteler: çocuklar için minik bir sokak gibi tasarlanmış oyun alanı.'},
    shop:{label:'Dükkân',story:'Sarı cephenin üzerinde SHOP yazan küçük bir dükkân var. Oyun şehrinin keşfedilecek köşelerinden biri.'},
    slide:{label:'Kaydırak',story:'Oyun alanında tırmanma bölümü ve kaydırak görülüyor. Oyun sırasında çocuğun yanında olun.'},
    coffee:{label:'Kahve köşesi',story:'Oyun şehrinin yanında gerçek kahve tezgâhı ve Rocket espresso makinesi var. Büyükler de kendi molasını seçebilir.'},
    next:'Sonraki durak',progress:'durak',photo:'Miora oyun evleri, küçük dükkânı, kaydırağı ve kahve tezgâhı'
  },
  ru:{
    prompt:'Нажми на место в городке',hint:'Выбери точку — расскажем, что здесь находится на самом деле.',
    houses:{label:'Домики',story:'Пастельные фасады, маленькие окна и полосатые навесы. Детская зона выглядит как собственная небольшая улица.'},
    shop:{label:'Магазинчик',story:'В жёлтом домике есть вход с вывеской SHOP — одна из деталей игрового городка, которую можно исследовать.'},
    slide:{label:'Горка',story:'В игровой зоне есть подъём и горка. Во время игры взрослым важно присматривать за детьми.'},
    coffee:{label:'Кофейня',story:'Рядом с игровым городком — настоящая кофейная стойка с эспрессо-машиной Rocket. Взрослые тоже могут устроить себе перерыв.'},
    next:'Следующая точка',progress:'точка',photo:'Настоящие домики, магазинчик, горка и кофейная стойка Miora'
  },
  en:{
    prompt:'Tap a place in our little town',hint:'Choose a spot to discover what is really here.',
    houses:{label:'Little houses',story:'Pastel façades, small windows and striped awnings make the play area look like a tiny neighborhood.'},
    shop:{label:'Little shop',story:'A yellow storefront marked SHOP is one of the details to explore in the play town.'},
    slide:{label:'Slide',story:'The play area has a climbing section and slide. Adults should supervise children during play.'},
    coffee:{label:'Coffee corner',story:'Alongside the play town is a real café counter with a Rocket espresso machine. Grown-ups can enjoy their own break.'},
    next:'Next stop',progress:'stop',photo:'The real Miora play houses, shop, slide and coffee counter'
  }
});
export function validTourSpot(id){return typeof id==='string'&&TOUR_SPOTS.includes(id);}
export function nextTourSpot(id){
  const index=TOUR_SPOTS.indexOf(id);
  return TOUR_SPOTS[(index+1)%TOUR_SPOTS.length]||TOUR_SPOTS[0];
}
export function getTourCopy(lang,id){
  const c=TOUR_COPY[Object.hasOwn(TOUR_COPY,lang)?lang:'tr'];
  return validTourSpot(id)?c[id]:c.houses;
}

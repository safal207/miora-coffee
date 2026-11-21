// Four user-approved editorial concepts based on owner-supplied photos.
// Generative edits can alter details: not documentary photographs.
export const CITY_GALLERY=Object.freeze([
  {id:'town',src:'assets/city/gallery/01-play-town.webp',width:1440,height:810},
  {id:'shop',src:'assets/city/gallery/02-shop-and-houses.webp',width:1440,height:810},
  {id:'family',src:'assets/city/gallery/03-family-corner.webp',width:1440,height:810},
  {id:'slide',src:'assets/city/gallery/04-slide.webp',width:810,height:1440}
]);
export const GALLERY_COPY=Object.freeze({
  tr:{heading:'Miora’dan dört kare',lead:'Oyun şehrimizin fotoğraflarından hazırlanan dört görsel.',
    disclaimer:'Yapay zekâ ile düzenlenmiş görselleştirmelerdir; bazı ayrıntılar gerçek mekândan farklı olabilir. Üstteki küçük fotoğraf gerçek alanı gösterir.',
    names:{town:'Oyun şehri',shop:'Dükkânlar',family:'FAM’S köşesi',slide:'Kaydırak'},
    enlarge:'Büyük gör',previous:'Önceki fotoğraf',next:'Sonraki fotoğraf',close:'Fotoğrafı kapat',of:' / '},
  ru:{heading:'Четыре ракурса Miora',lead:'Четыре обработанных изображения игрового городка.',
    disclaimer:'Художественная AI-обработка исходных фото: отдельные детали могут отличаться от реального интерьера. Фотография-карта выше показывает настоящее пространство.',
    names:{town:'Игровой город',shop:'Домики и SHOP',family:'Уголок FAM’S',slide:'Горка'},
    enlarge:'Увеличить фото',previous:'Предыдущее фото',next:'Следующее фото',close:'Закрыть фото',of:' из '},
  en:{heading:'Four views of Miora',lead:'Four edited views based on the original play-town photos.',
    disclaimer:'AI-assisted artistic edits: some details may differ from the real venue. The smaller photo map above shows the actual space.',
    names:{town:'Play town',shop:'Houses & SHOP',family:'FAM’S corner',slide:'The slide'},
    enlarge:'Enlarge image',previous:'Previous image',next:'Next image',close:'Close photo',of:' of '}
});
export function gallerySlide(index){return CITY_GALLERY[Number.isInteger(index)&&index>=0&&index<CITY_GALLERY.length?index:0];}
export function galleryStep(index,delta){const count=CITY_GALLERY.length;return ((index+delta)%count+count)%count;}
export function galleryTitle(lang,index){const c=GALLERY_COPY[lang]||GALLERY_COPY.tr;return c.names[gallerySlide(index).id];}

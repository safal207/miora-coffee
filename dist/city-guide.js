// Miora City Guide — a short, local, opt-out-first conversation.
// No child profiling, registration, questions about age, remote AI or telemetry.
export const CITY_CATEGORY=Object.freeze({coffee:'46776',dessert:'46818',food:'46885'});
export const CITY_ASSETS=Object.freeze({panorama:'assets/city/miora-city.webp'});
const path=Object.freeze({
  hello:{family:'family',adults:'adults'},
  family:{tour:'town',choose:'choose'},
  adults:{choose:'choose',tour:'town'},
  town:{choose:'choose'},
  choose:{coffee:'coffee',dessert:'dessert',food:'food'},
  coffee:{choose:'choose'},
  dessert:{choose:'choose'},
  food:{choose:'choose'}
});
export function cityNext(step,action){
  if(action==='reset')return 'hello';
  if(action==='back')return step==='town'?'family':step==='choose'?'family':['coffee','dessert','food'].includes(step)?'choose':'hello';
  return Object.hasOwn(path,step)&&Object.hasOwn(path[step],action)?path[step][action]:null;
}
export function cityProducts(mood,products,max=3){
  const cat=CITY_CATEGORY[mood];
  if(!cat||!Array.isArray(products))return [];
  const count=Number.isInteger(max)?Math.max(0,Math.min(max,3)):3;
  return products.filter(p=>p?.cat===cat&&Number.isSafeInteger(p.price)&&p.price>0).slice(0,count);
}
export const CITY_COPY=Object.freeze({
  tr:{
    eyebrow:'MIORA ŞEHRİ · TANIŞALIM',title:'Küçük bir şehir, güzel bir mola.',
    hello:'Merhaba! Miora’ya hoş geldiniz. Bugün nasıl bir mola planlıyorsunuz?',
    family:'Minik kaşifler için oyun, büyükler için kahve. Önce neye bakalım?',
    adults:'Kendine bir mola mı veriyorsun? Ne yapmak istersin?',
    town:'Burası oyun şehrimizden gerçek kareler: küçük dükkânlar, evler ve kaydırak. Fotoğraflar örnektir; oyun alanını ziyaretinizde keşfedebilirsiniz.',
    choose:'Şimdi ne istersin? Menüden gerçek seçenekleri göstereyim.',
    coffee:'Mis gibi kahve zamanı! Güncel menüden birkaç seçenek:',
    dessert:'Tatlı bir mola? Güncel menüden birkaç seçenek:',
    food:'Acıktın mı? Güncel menüden birkaç seçenek:',
    familyChoice:'Çocuklarla geldik',adultChoice:'Kahve molasına geldim',
    tour:'Oyun şehrini keşfet',pick:'Yiyecek ve içecek seç',coffeeChoice:'Kahve',dessertChoice:'Tatlı',foodChoice:'Yemek',
    openCategory:'Menüde göster',skip:'Tüm menüye geç',back:'Geri',restart:'Baştan başla',
    reopen:'Miora ile tanış',usual:'Kaydettiğim listeyi ekle',favorites:'Favorilerime bak',notChat:'Bu, canlı sohbet değil; kısa bir menü rehberi. Yanıtlar gönderilmez ve kaydedilmez.',
    photoTown:'Miora oyun alanında küçük dükkân cepheleri',photoPlay:'Miora oyun alanında kaydırak ve oyuncaklar',
    photoCoffee:'Miora kahve tezgâhı',panorama:'Oyun şehri, kaydırak ve kahve tezgâhı · Miora',privacy:'Çocukların yüzlerini göstermeyen, mekândan gerçek fotoğraflar.'
  },
  ru:{
    eyebrow:'ГОРОД MIORA · ДАВАЙ ЗНАКОМИТЬСЯ',title:'Маленький город, большой перерыв.',
    hello:'Привет! Добро пожаловать в Miora. Как вы сегодня к нам заглянули?',
    family:'Для маленьких исследователей — игра, для взрослых — кофе. С чего начнём?',
    adults:'Небольшой перерыв для себя? Что хочется посмотреть?',
    town:'Это настоящие фотографии нашего игрового городка: домики, магазинчики и горка. Прогуляемся по ним?',
    choose:'А теперь выберем что-нибудь вкусное из настоящего меню.',
    coffee:'Время для кофе! Вот несколько напитков из меню:',
    dessert:'Немного сладкого? Вот варианты из меню:',
    food:'Хочется перекусить? Вот варианты из меню:',
    familyChoice:'Мы с детьми',adultChoice:'Заглянули на кофе',
    tour:'Посмотреть игровой городок',pick:'Выбрать еду и напитки',coffeeChoice:'Кофе',dessertChoice:'Десерты',foodChoice:'Перекусить',
    openCategory:'Открыть в меню',skip:'Сразу в меню',back:'Назад',restart:'Начать заново',
    reopen:'Познакомиться с Miora',usual:'Добавить мой сохранённый список',favorites:'Посмотреть избранное',notChat:'Это не онлайн-чат, а мини-гид по кафе. Ответы никуда не отправляются и не сохраняются.',
    photoTown:'Настоящие фасады домиков игрового городка Miora',photoPlay:'Горка и игрушки в детской зоне Miora',
    photoCoffee:'Кофейная стойка Miora',panorama:'Домики, горка и кофейная стойка Miora',privacy:'Настоящие фотографии пространства, без публикации детских лиц.'
  },
  en:{
    eyebrow:'MIORA TOWN · SAY HELLO',title:'A little town. A lovely break.',
    hello:'Hello! Welcome to Miora. What brings you in today?',
    family:'A play town for little explorers, good coffee for grown-ups. Where shall we start?',
    adults:'Taking a little break? What would you like to explore?',
    town:'Real photos of our play town: little storefronts, houses and a slide. Take a look!',
    choose:'Now, shall we find something tasty from the real menu?',
    coffee:'Coffee time! A few choices from the menu:',
    dessert:'Something sweet? A few choices from the menu:',
    food:'Feeling hungry? A few choices from the menu:',
    familyChoice:'Here with kids',adultChoice:'Here for a coffee break',
    tour:'Explore the play town',pick:'Choose food and drinks',coffeeChoice:'Coffee',dessertChoice:'Desserts',foodChoice:'Something to eat',
    openCategory:'See in menu',skip:'Go straight to menu',back:'Back',restart:'Start again',
    reopen:'Meet Miora',usual:'Add my saved list',favorites:'See my favorites',notChat:'This is a short interactive guide, not a live chat. Answers are not sent or stored.',
    photoTown:'Real storefront facades in the Miora play town',photoPlay:'Slide and toys in the Miora play area',
    photoCoffee:'Miora coffee counter',panorama:'Miora play town, slide and coffee counter',privacy:'Real venue photos cropped to exclude identifiable children.'
  }
});

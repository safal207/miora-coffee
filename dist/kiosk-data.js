// Source: in-store Miora menu photographed 2026-11-10.
// Prices are integer kuruş. Unknown sandwich ingredient surcharges are NOT treated as confirmed free additions.
export const L=(tr,ru,en)=>({tr,ru,en});
const opt=(id,tr,ru,en,price=0)=>({id,label:L(tr,ru,en),price});
export const recipes={
  sandwich:{
    name:L('Kendi Ekşi Maya Sandviçin','Сэндвич на твой вкус','Build your sourdough sandwich'),
    short:L('Ekmeğini ve içini seç','Выбери хлеб и начинку','Choose bread and fillings'),
    image:'430236',
    price:35000,estimated:true,
    steps:[
      {id:'bread',title:L('Ekmeğini seç','Выбери хлеб','Choose your bread'),min:1,max:1,items:[
        opt('olive','Zeytinli kekikli ekmek','Хлеб с оливками и тимьяном','Olive & thyme bread'),
        opt('tomato-walnut','Kuru domatesli cevizli ekmek','Хлеб с вялеными томатами и грецким орехом','Sun-dried tomato & walnut bread'),
        opt('purple-carrot','Mor havuçlu ekmek','Хлеб с фиолетовой морковью','Purple carrot bread'),
        opt('focaccia','Focaccia ekmeği','Фокачча','Focaccia bread'),
        opt('wholewheat','Tam buğday ekmek','Цельнозерновой хлеб','Wholewheat bread'),
        opt('plain','Sade ekmek','Классический хлеб','Plain bread')
      ]},
      {id:'cheese',title:L('Peynir seç','Выбери сыр','Choose cheese'),min:0,max:2,items:[
        opt('labne','Labne','Лабне','Labneh'),opt('white','Beyaz peynir','Белый сыр','White cheese'),
        opt('strained','Süzme peynir','Сливочный сыр','Cream cheese'),opt('ezine','Ezine peyniri','Сыр Эзине','Ezine cheese'),
        opt('kasar','Kaşar peyniri','Кашар','Kashar cheese'),opt('cheddar','Cheddar peyniri','Чеддер','Cheddar')
      ]},
      {id:'sauce',title:L('Sos ve turşu seç','Выбери соусы и маринады','Choose sauces and pickles'),min:0,max:2,items:[
        opt('avocado-mousse','Avokado mus','Мусс из авокадо','Avocado mousse'),
        opt('pesto','Pesto sos','Песто','Pesto'),
        opt('roasted-pepper','Özel köz biber sosu','Соус из печёного перца','Roasted pepper sauce'),
        opt('sun-tomato','Kuru domates sosu','Соус из вяленых томатов','Sun-dried tomato sauce'),
        opt('onion','Kırmızı soğan turşusu','Маринованный красный лук','Pickled red onion'),
        opt('pickle','Kornişon turşusu','Маринованные корнишоны','Pickled gherkins')
      ]},
      {id:'extra',title:L('Bir ekstra malzeme','Добавь начинку','Choose a filling'),min:0,max:1,items:[
        opt('turkey','Hindi füme','Копчёная индейка','Smoked turkey'),
        opt('avocado','Avokado dilim','Ломтики авокадо','Avocado slices'),
        opt('beef','Dana kaburga füme','Копчёные говяжьи рёбра','Smoked beef rib'),
        opt('salmon','Somon balığı','Лосось','Salmon'),
        opt('tuna','Ton balığı','Тунец','Tuna'),
        opt('tomato','Domates','Помидор','Tomato'),
        opt('cucumber','Salatalık','Огурец','Cucumber')
      ]},
      {id:'greens',title:L('Biraz yeşillik','Добавь свежую зелень','Add fresh greens'),min:0,max:2,items:[
        opt('lettuce','Marul','Листовой салат','Lettuce'),opt('rocket','Roka','Руккола','Rocket'),
        opt('parsley','Maydanoz','Петрушка','Parsley'),opt('dill','Dereotu','Укроп','Dill'),
        opt('mint','Taze nane','Свежая мята','Fresh mint')
      ]}
    ],
    note:L('350 ₺ temel fiyat. Seçilen malzemelerin son fiyatını personelle teyit edin.',
      '350 ₺ — базовая цена. Стоимость выбранных начинок уточните у сотрудника.',
      '350 ₺ base price. Confirm the final price of selected fillings with staff.')
  },
  breakfast:{
    name:L('Kahvaltı Tabağını Hazırla','Собери свой завтрак','Build your breakfast plate'),
    short:L('Tabağını istediğin gibi seç','Выбери свою тарелку','Make your plate your way'),
    image:'431203',price:0,estimated:false,
    steps:[
      {id:'base',title:L('Tabak çeşidini seç','Выбери основу завтрака','Choose your plate'),min:1,max:1,items:[
        opt('large','Büyük kruvasanlı tabak','Большой круассан','Large croissant plate',45000),
        opt('mini','1 mini kruvasanlı tabak','Один мини-круассан','Mini croissant plate',40000),
        opt('bread','Dilim ekmekli tabak','Ломтики хлеба','Sliced bread plate',35000)
      ]},
      {id:'egg',title:L('Yumurta nasıl olsun?','Как приготовить яйцо?','How would you like your egg?'),min:1,max:1,items:[
        opt('omelette','Omlet','Омлет','Omelette'),opt('boiled','Haşlama','Варёное яйцо','Boiled egg')
      ]},
      {id:'sweet',title:L('Tatlı eşlikçi','Сладкое дополнение','A little sweetness'),min:0,max:3,items:[
        opt('tahin','Tahin-pekmez','Тахин с пекмезом','Tahini & molasses'),
        opt('honey','Bal','Мёд','Honey'),opt('nutella','Nutella','Nutella','Nutella')
      ]},
      {id:'addons',title:L('Biraz daha ekle','Хочешь добавить?','Would you like an extra?'),min:0,max:2,items:[
        opt('bread','Ekstra ekmek','Дополнительный хлеб','Extra bread',2000),
        opt('mini','Ekstra mini kruvasan','Дополнительный мини-круассан','Extra mini croissant',4000)
      ]}
    ],
    note:L('Tabağa yeşillik, domates, salatalık, avokado, peynir, yeşil ve siyah zeytin, kahvaltılık sos ve ceviz içi dahildir.',
      'В тарелку входят зелень, помидоры, огурцы, авокадо, сыр, зелёные и чёрные оливки, соус для завтрака и грецкий орех.',
      'The plate includes greens, tomato, cucumber, avocado, cheese, green and black olives, breakfast sauce and walnuts.')
  },
  pancake:{
    name:L('Pankek Tabağı','Панкейки','Pancake plate'),
    short:L('5 pankek · meyve ve tatlı eşlikçiler','5 панкейков с фруктами и топпингами','5 pancakes with fruit and toppings'),
    image:null,price:25000,estimated:false,steps:[],
    note:L('5 pankek, muz, çilek, bal, tahin-pekmez ve Nutella.',
      '5 панкейков, банан, клубника, мёд, тахин с пекмезом и Nutella.',
      'Five pancakes, banana, strawberry, honey, tahini-molasses and Nutella.')
  },
  croissant:{
    name:L('Nutellalı Meyveli Kruvasan','Круассан с Nutella и фруктами','Nutella & fruit croissant'),
    short:L('Tatlı bir mola','Сладкая пауза','A sweet little break'),
    image:null,price:35000,estimated:false,steps:[],
    note:L('Nutella ve meyvelerle servis edilen kruvasan. Meyve çeşidini personelle teyit edin.',
      'Круассан с Nutella и фруктами. Уточните вид фруктов у сотрудника.',
      'Croissant with Nutella and fruit. Ask staff which fruit is available.')
  }
};
export const ui={
  tr:{kicker:'MIORA · SANA ÖZEL',title:'Tam istediğin gibi.',subtitle:'Bir dokunuşla seç, birlikte tamamlayalım.',build:'Kendin hazırla',choose:'Seç',next:'Devam et',previous:'Geri',add:'Listeme ekle',close:'Kapat',step:'Adım',of:'/',selectOne:'Bir seçenek seç',selectUpTo:'En fazla',optional:'İsteğe bağlı',included:'Dahil',from:'Başlangıç',base:'Temel fiyat',estimated:'Tahmini',total:'Toplam',confirm:'Fiyatı ve içeriği personelle teyit et.',review:'Siparişini gözden geçir',yourChoice:'Seçimin',drink:'Yanına cappuccino?',drinkNote:'180 ₺ · normal menü fiyatı, indirim yok',ready:'Hazır!',staff:'Bu liste personele göstermek içindir; otomatik sipariş veya ödeme yok.',empty:'Bu adımı geçebilirsin.',allergens:'Alerjenler ve özel istekler için personele danış.',max:'Bu adım için seçim sınırına ulaştın.'},
  ru:{kicker:'MIORA · ТВОЙ ВЫБОР',title:'Так, как нравится тебе.',subtitle:'Пара касаний — и готово.',build:'Собрать самому',choose:'Выбрать',next:'Продолжить',previous:'Назад',add:'В мой заказ',close:'Закрыть',step:'Шаг',of:'из',selectOne:'Выбери один вариант',selectUpTo:'Не более',optional:'Можно пропустить',included:'Включено',from:'От',base:'Базовая цена',estimated:'Предварительно',total:'Итого',confirm:'Уточните стоимость и состав у сотрудника.',review:'Проверь свой выбор',yourChoice:'Ты выбрал',drink:'Добавить капучино?',drinkNote:'180 ₺ · обычная цена, без скидки',ready:'Готово!',staff:'Список предназначен для сотрудника. Онлайн-заказ и оплата не выполняются.',empty:'Этот шаг можно пропустить.',allergens:'При аллергии или ограничениях уточните ингредиенты у сотрудника.',max:'Достигнут предел выбора.'},
  en:{kicker:'MIORA · MADE FOR YOU',title:'Your way. Every time.',subtitle:'A few taps. Your perfect little break.',build:'Make it yours',choose:'Choose',next:'Continue',previous:'Back',add:'Add to my list',close:'Close',step:'Step',of:'of',selectOne:'Choose one',selectUpTo:'Up to',optional:'Optional',included:'Included',from:'From',base:'Base price',estimated:'Estimated',total:'Total',confirm:'Confirm the final price and ingredients with staff.',review:'Review your choices',yourChoice:'Your choices',drink:'Add a cappuccino?',drinkNote:'180 ₺ · regular menu price, no discount',ready:'All set!',staff:'Show your list to staff. No order is submitted or charged online.',empty:'You can skip this step.',allergens:'Please ask staff about allergens and dietary needs.',max:'You have reached the selection limit.'}
};
export const localized=(value,lang='tr')=>value?.[lang]||value?.tr||'';

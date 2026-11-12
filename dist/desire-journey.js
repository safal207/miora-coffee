// Editorial paths, not popularity, availability or measured preference claims.
const L=(tr,ru,en)=>({tr,ru,en});
const group=(id,title,ids)=>({id,title,ids:ids.split(' ')});
export const journeys={
 '46776':[
  group('classic',L('Kahve klasikleri','Кофейная классика','Coffee classics'),'428743 428974 428976 428977 429150'),
  group('milk',L('Sütlü favorini bul','Кофе с молоком','Find your milk coffee'),'428748 428772 428961 428979 428777 428787 428981 429151'),
  group('flavour',L('Farklı bir aroma','Другой вкус','A different flavour'),'428759 428985 429233 429239 429243 429244'),
  group('matcha',L('Matcha molası','Пауза с матчей','A matcha break'),'429301 429303')],
 '46810':[
  group('black',L('Sade ve soğuk','Чёрный и холодный','Black & chilled'),'429252 429294'),
  group('iced',L('Sütlü ve aromalı','Молоко и разные вкусы','Milk & flavour, over ice'),'429264 429282 429286 429287 429271 429277 429293')],
 '46814':[
  group('tea',L('Çay zamanı','Время чая','Tea time'),'429390 429391 429394'),
  group('turkish',L('Türk kahvesi','Турецкий кофе','Turkish coffee'),'429392 429393'),
  group('warm',L('Sıcak bir mola','Тёплая пауза','A warming break'),'429400 429429 429431')],
 '46817':[
  group('refresh',L('Ferah bir seçim','Освежиться','Something refreshing'),'429436 429441 429442 429443'),
  group('creamy',L('Milkshake ve chai','Милкшейки и чай латте','Milkshakes & chai'),'429446 429447 429448'),
  group('matcha',L('Soğuk matcha','Холодная матча','Iced matcha'),'429449 429450')],
 '46818':[
  group('cheesecake',L('Cheesecake keyfi','Хочется чизкейк','In the mood for cheesecake'),'430226 430222 429808 429822 429826 429828 429921 431314'),
  group('layers',L('Kup ve kat kat lezzetler','Десерты слоями и в стакане','Cups & layers'),'430198 429872 430207 431299 430199 430214'),
  group('bites',L('Kek ve küçük tatlılar','Кексы, брауни и небольшие десерты','Cakes, brownies & little bites'),'431304 431302 429834 431293 430227 431294'),
  group('pastry',L('Ekler, tart ve pankek','Эклеры, тарт и панкейки','Éclairs, tart & pancakes'),'431336 430203 429833 431333')],
 '47037':[
  group('water',L('Su ve maden suyu','Вода и минеральная вода','Water & sparkling'),'431453 431455 431456'),
  group('bottled',L('Süt ve meyve suyu','Молоко и сок','Milk & juice'),'431458 431459')],
 '50454':[group('fruit',L('Meyveli bir mola','Фруктовая пауза','A fruity break'),'460119 460120')],
 '46885':[
  group('sandwich',L('Sandviçini seç','Выбери сэндвич','Choose your sandwich'),'430356 430236 430240 431177 431178 431179'),
  group('breakfast',L('Kahvaltı zamanı','Время завтрака','Breakfast time'),'431203'),
  group('bakery',L('Fırından bir şey','Что-нибудь из выпечки','Something from the bakery'),'430350 431742 431744 431745 431746 431747 431748 431749')]
};
export const journeyCopy={
 tr:{find:'Bugün ne istersin?',all:'Tüm seçenekler aşağıda. Bir başlık seçerek hızlıca geç.',choices:'seçenek',photo:'Menü fotoğrafı',generated:'AI servis örneği',illustration:'Servis örneği',noPhoto:'Fotoğraf henüz eklenmedi',details:'İçeriğe bak',add:'Ekle',build:'Kendin oluştur',ideas:'Fikirler ve Instagram videoları',made:'Kendi lezzetini oluştur',sandwich:'Sandviç oluştur',breakfast:'Breakfast 2.0',saved:'Kaydet',seeMenu:'Tüm 93 seçeneği keşfet'},
 ru:{find:'Чего хочется сегодня?',all:'Все позиции ниже. Выбери раздел, чтобы перейти сразу к нему.',choices:'позиций',photo:'Фото из меню',generated:'AI-пример подачи',illustration:'Пример подачи',noPhoto:'Пока без фото',details:'Посмотреть состав',add:'Добавить',build:'Собрать',ideas:'Идеи и видео из Instagram',made:'Собери на свой вкус',sandwich:'Свой сэндвич',breakfast:'Breakfast 2.0',saved:'Сохранить',seeMenu:'Посмотреть все 93 позиции'},
 en:{find:'What are you in the mood for?',all:'Every choice is below. Pick a collection to jump straight to it.',choices:'choices',photo:'Menu photo',generated:'AI serving illustration',illustration:'Serving inspiration',noPhoto:'No photo yet',details:'View ingredients',add:'Add',build:'Build yours',ideas:'Ideas & Instagram videos',made:'Make it your way',sandwich:'Build a sandwich',breakfast:'Breakfast 2.0',saved:'Save',seeMenu:'Explore all 93 choices'}
};
export const localizedJourney=(value,lang)=>value?.[lang]||value?.tr||({tr:'Diğer seçenekler',ru:'Другие варианты',en:'More choices'}[lang]||'More choices');
export function desireSections(items,{category='all',search='',categories=[]}={}){
 if(search.trim()||category==='favorites'||category==='featured')return [{id:'selection',title:null,items:[...items]}];
 const definitions=category==='all'
  ?['46776','46810','46818','46885','46814','46817','50454','47037'].map(id=>({id:'cat-'+id,title:categories.find(c=>c.id===id)?.name,ids:items.filter(p=>p.cat===id).map(p=>p.id)}))
  :journeys[category]||[];
 const byId=new Map(items.map(p=>[p.id,p])),seen=new Set();
 const sections=definitions.map(g=>({id:g.id,title:g.title,items:g.ids.filter(id=>byId.has(id)&&!seen.has(id)&&(seen.add(id),true)).map(id=>byId.get(id))})).filter(g=>g.items.length);
 const remaining=items.filter(p=>!seen.has(p.id));
 if(remaining.length)sections.push({id:'more',title:null,items:remaining});
 return sections;
}

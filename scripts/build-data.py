"""Rebuild the complete catalog from the captured, unmodified source menu."""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
raw = json.loads((ROOT/'docs/source-menu-2026-11-05.json').read_text())
names = {
'428743':('Americano','Американо'),'428748':('Caffè Latte','Кофе латте'),'428759':('Caffè Mocha','Кофе мокка'),'428772':('Cappuccino','Капучино'),
'428777':('Caramel Cappuccino','Карамельный капучино'),'428787':('Caramel Latte','Карамельный латте'),'428961':('Cortado','Кортадо'),'428974':('Espresso · Single','Эспрессо · один шот'),'428976':('Espresso · Double','Эспрессо · двойной'),
'428977':('Filter Coffee','Фильтр-кофе'),'428979':('Flat White','Флэт уайт'),'428981':('Hazelnut Latte','Ореховый латте'),'428985':('Lotus Macchiato','Макиато Lotus'),'429150':('Filter Coffee with Milk','Фильтр-кофе с молоком'),'429151':('Vanilla Latte','Ванильный латте'),'429233':('White Chocolate Mocha','Мокка с белым шоколадом'),'429239':('Salted Caramel Latte','Латте «Солёная карамель»'),'429243':('Caramel Macchiato','Карамельный макиато'),'429244':('Pumpkin Spice Latte','Пряный тыквенный латте'),'429301':('Matcha Latte','Матча латте'),'429303':('Flavoured Matcha Latte','Матча латте с сиропом'),
'429252':('Iced Americano','Айс-американо'),'429264':('Iced Latte','Айс-латте'),'429271':('Iced Mocha','Айс-мокка'),'429277':('Iced Salted Caramel Latte','Айс-латте «Солёная карамель»'),'429282':('Iced Caramel Latte','Карамельный айс-латте'),'429286':('Iced Hazelnut Latte','Ореховый айс-латте'),'429287':('Iced Vanilla Latte','Ванильный айс-латте'),'429293':('Iced White Chocolate Mocha','Айс-мокка с белым шоколадом'),'429294':('Cold Brew','Колд брю'),
'429390':('Turkish Tea','Турецкий чай'),'429391':('Turkish Tea · Double','Турецкий чай · двойной'),'429392':('Turkish Coffee','Кофе по-турецки'),'429393':('Turkish Coffee · Double','Кофе по-турецки · двойной'),'429394':('Herbal Tea','Травяной чай'),'429400':('Hot Chocolate','Горячий шоколад'),'429429':('Salep','Салеп'),'429431':('Chai Tea Latte','Пряный чай латте'),
'429436':('Berry Lime','Ягодный лайм'),'429441':('Cool Lime','Кул лайм'),'429442':('Lemonade','Лимонад'),'429443':('Fresh Orange Juice','Свежий апельсиновый сок'),'429446':('Chocolate Milkshake','Шоколадный милкшейк'),'429447':('Forest Berry Milkshake','Милкшейк «Лесные ягоды»'),'429448':('Iced Chai Tea Latte','Холодный пряный чай латте'),'429449':('Iced Forest Berry Matcha Latte','Айс-матча «Лесные ягоды»'),'429450':('Iced Matcha Latte','Айс-матча латте'),
'431293':('Date Bites · 2 pieces','Финиковые шарики · 2 шт.'),'430222':('Pistachio San Sebastian','Фисташковый Сан-Себастьян'),'430226':('San Sebastian','Сан-Себастьян'),'429826':('French White Chocolate Cheesecake','Французский чизкейк с белым шоколадом'),'429828':('Chocolate Cheesecake','Шоколадный чизкейк'),'429921':('Coconut Cheesecake','Кокосовый чизкейк'),'429808':('Raspberry Cheesecake','Малиновый чизкейк'),'429822':('Oreo Cheesecake','Чизкейк Oreo'),'431314':('Mini Cheesecake','Мини-чизкейк'),'430207':('Bromisu','Бромису'),'429872':('Dubai Cup','Дубайский десерт'),'430198':('Strawberry Magnolia','Клубничная магнолия'),'431299':('Pumpkin Magnolia','Тыквенная магнолия'),'430199':('Banana Magnolia','Банановая магнолия'),'430227':('Brownie Bite','Брауни-шарик'),'430214':('Lemon Tiramisu','Лимонный тирамису'),'431294':('Chocolate Muffin','Шоколадный маффин'),'430203':('Éclair','Эклер'),'431336':('Pistachio Éclair','Фисташковый эклер'),'431302':('Magnum Brownie · Large','Магнум брауни · большой'),'431304':('Magnum Brownie · Small','Магнум брауни · маленький'),'429834':('Malaga Cake','Торт «Малага»'),'429833':('Fruit Tart','Фруктовый тарт'),'431333':('Pancake Plate','Тарелка панкейков'),
'431453':('Uludağ Premium Water','Вода Uludağ Premium'),'431455':('Beypazarı Sparkling Water','Газированная вода Beypazarı'),'431456':('Uludağ Premium Mineral Water','Минеральная вода Uludağ Premium'),'431458':('Pınar Kido Milk','Молоко Pınar Kido'),'431459':('Pınar Fruit Juice','Фруктовый сок Pınar'),'460119':('Fresh Tropic','Тропический фреш'),'460120':('Berry Mojito','Ягодный мохито'),
'430236':('Wholewheat Sourdough Sandwich','Сэндвич на цельнозерновой закваске'),'430240':('Olive & Thyme Sourdough Sandwich','Сэндвич с оливками и тимьяном'),'430350':('Butter Croissant','Сливочный круассан'),'430356':('Croissant Sandwich','Круассан-сэндвич'),'431177':('Sun-dried Tomato & Walnut Sandwich','Сэндвич с вялеными томатами и орехами'),'431178':('Classic Sourdough Sandwich','Классический сэндвич на закваске'),'431179':('Purple Focaccia Sandwich','Сэндвич на фиолетовой фокачче'),'431203':('Breakfast Plate','Тарелка для завтрака'),'431742':('Savoury Muffin','Несладкий маффин'),'431744':('Gluten-free Almond Cake','Безглютеновый миндальный кекс'),'431745':('Cookie','Печенье'),'431746':('Gluten-free Oat Cookie','Безглютеновое овсяное печенье'),'431747':('Muffin','Маффин'),'431748':('Gluten-free Poğaça','Безглютеновая поача'),'431749':('Gluten-free Vegetable Bun','Безглютеновая овощная булочка')
}
cats=[('46776','Sıcak kahveler','Hot coffee','Горячий кофе','coffee'),('46810','Soğuk kahveler','Iced coffee','Холодный кофе','ice'),('46814','Sıcak içecekler','Hot drinks','Горячие напитки','tea'),('46817','Soğuk içecekler','Cold drinks','Холодные напитки','glass'),('46818','Tatlılar','Desserts','Десерты','cake'),('47037','Meşrubat','Soft drinks','Вода и соки','bottle'),('50454','Smoothie & fresh','Smoothies & fresh','Смузи и фреши','leaf'),('46885','Yiyecekler','Food & bakery','Еда и выпечка','croissant')]
allergy={'Milk and dairy products':'milk','Cereals containing gluten':'gluten','Eggs and egg products':'eggs','Peanuts and peanut products':'peanuts','Sesame seeds and sesame seed products':'sesame'}
out=[]
for p in raw['products']:
    v=dict(p)
    assert p['id'] in names, p['name']
    if p['price']:
        number=p['price'].replace('₺','').replace('.','').replace(',','.')
        v['price']=round(float(number)*100)
    v['name']={'tr':p['name'],'en':names[p['id']][0],'ru':names[p['id']][1]}
    v['time']=int(re.search(r'\d+',p['time'])[0]) if p['time'] else None
    v['allergens']=[allergy[a] for a in p['allergens']]
    v['calorieReview']=p['id']=='431302'
    out.append(v)
data='export const products = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
data+='export const categories = '+json.dumps([{'id':i,'name':dict(tr=t,en=e,ru=r),'icon':ic} for i,t,e,r,ic in cats],ensure_ascii=False,separators=(',',':'))+';\n'
data+='export const featured = ["428748","429264","430226","430350","429441","430236","428772","429449"];\n'
data+='export const source = '+json.dumps({'url':'https://qrmenuapp.akinsoft.com.tr/L1VBCV/miora-coffee/menu','capturedAt':raw['capturedAt'],'itemCount':len(out)},separators=(',',':'))+';\n'
(ROOT/'dist/menu-data.js').write_text(data)
print('Built',len(out),'products and',len(cats),'categories; all source prices retained in kuruş.')

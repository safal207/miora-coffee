import {cakePhotos} from './cake-photo-data.js';
import {photoUrl,photoSet} from './photos.js?v=20261115-angles1';
export const hasCakeInterior=p=>Boolean(cakePhotos[p?.id]);
const ingredients={
 'Peynir':['Cheese','Сыр'],'Şeker':['Sugar','Сахар'],'Çikolata':['Chocolate','Шоколад'],'Krema':['Cream','Сливки'],'Antep Fıstığı':['Pistachio','Фисташки'],
 'Bisküvi':['Biscuit','Печенье'],'Tereyağı':['Butter','Сливочное масло'],'Labne':['Labneh','Лабне'],'Beyaz Çikolata':['White chocolate','Белый шоколад'],'Orman Meyveleri':['Forest berries','Лесные ягоды'],
 'Süt':['Milk','Молоко'],'Fındık':['Hazelnut','Фундук'],'Hindistan Cevizi':['Coconut','Кокос'],'Meyve':['Fruit','Фрукты'],'Frambuaz':['Raspberry','Малина'],'Oreo Bisküvi':['Oreo biscuits','Печенье Oreo'],
 'Yağ':['Oil / fat','Масло / жир'],'Kakao':['Cocoa','Какао'],'Nişasta':['Starch','Крахмал'],'Kuruyemiş':['Nuts','Орехи'],'Muz':['Banana','Банан'],'Krem Şanti':['Whipped cream','Взбитые сливки']
};
const flavors={430226:['Peynir','Çikolata','Krema'],430222:['Antep Fıstığı','Peynir','Çikolata'],429826:['Beyaz Çikolata','Orman Meyveleri','Labne'],429921:['Hindistan Cevizi','Fındık','Beyaz Çikolata'],429808:['Frambuaz','Labne','Bisküvi'],429822:['Oreo Bisküvi','Labne','Çikolata'],431314:['Beyaz Çikolata','Peynir','Meyve'],429834:['Muz','Kakao','Krem Şanti']};
export const cakeCopy={
 ru:{inside:'В разрезе',outside:'Подача',range:'Сколько разреза показать',shown:'Разрез',ingredients:'Состав из меню',all:'Весь состав',more:'ещё',hint:'Двигай ползунок или выбери вид',art:'AI-пример разреза. Подача, слои и размер порции могут отличаться.',source:'Состав — из исходного меню от 05.11.2026. Порядок в списке не обозначает слои.',missing:'Состав не указан в меню. Уточните у сотрудника.',photo:'AI · разрез'},
 tr:{inside:'İçini gör',outside:'Sunum',range:'Kesitin ne kadarını gösterelim',shown:'Kesit',ingredients:'Menüdeki içerik',all:'Tüm içerik',more:'daha',hint:'Kaydırıcıyı hareket ettir veya görünümü seç',art:'AI kesit örneği. Sunum, katmanlar ve porsiyon boyutu farklı olabilir.',source:'İçerik 05.11.2026 tarihli kaynak menüden. Liste sırası katmanları göstermez.',missing:'İçerik menüde belirtilmemiş. Çalışana danışın.',photo:'AI · kesit'},
 en:{inside:'Inside',outside:'Serving',range:'How much of the cutaway to show',shown:'Cutaway',ingredients:'Menu ingredients',all:'All ingredients',more:'more',hint:'Move the slider or choose a view',art:'AI cutaway illustration. Serving, layers and portion size may differ.',source:'Ingredients from the source menu dated 5 Nov 2026. List order does not indicate layers.',missing:'The menu does not list ingredients. Please ask the staff.',photo:'AI · cutaway'}
};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cakeIngredientInfo(p,lang='tr'){
 if(!hasCakeInterior(p))return null;
 const tokens=(p.description||'').split(',').map(x=>x.trim()).filter(Boolean);
 const label=key=>lang==='tr'?key:ingredients[key]?.[lang==='en'?0:1]||key;
 const preview=(flavors[p.id]||tokens.slice(0,3)).filter(key=>tokens.includes(key));
 return {source:tokens,parts:tokens.map(label),preview:preview.map(label),remaining:Math.max(0,tokens.length-preview.length)};
}
export function cakeViewerMarkup(p,lang,name,variant='focus'){
 if(!hasCakeInterior(p))return '';
 const c=cakeCopy[lang],info=cakeIngredientInfo(p,lang),split=variant==='inside'?100:0;
 return `<div class="cake-viewer" data-cake-viewer="${p.id}"><div class="cake-comparison" role="group" aria-label="${esc(name+' · '+c.inside)}" style="--cake-split:${split}%">
  <img class="cake-outside" src="${photoUrl(p)}" ${photoSet(p,'(max-width: 620px) 100vw, 540px')} width="640" height="480" alt="" decoding="async">
  <div class="cake-inside" aria-hidden="true"><img src="${photoUrl(p,640,'inside')}" ${photoSet(p,'(max-width: 620px) 100vw, 540px','inside')} width="640" height="480" alt="" decoding="async"></div>
  <span class="cake-divider" aria-hidden="true"><span>↔</span></span>
  ${info.parts.length?`<button type="button" class="cake-ingredient-overlay" data-cake-ingredients aria-controls="cake-ingredients-${p.id}" aria-expanded="false"${split===0?' hidden':''}><strong>${c.ingredients}</strong><span>${info.preview.map(esc).join(' · ')}</span><small>${c.all}${info.remaining?` · +${info.remaining} ${c.more}`:''} ↗</small></button>`:`<p class="cake-ingredient-overlay cake-ingredient-missing"${split===0?' hidden':''}>${c.missing}</p>`}
 </div><div class="cake-controls"><div class="cake-view-buttons"><button type="button" data-cake-view="0" aria-pressed="${split===0}">${c.outside}</button><button type="button" data-cake-view="100" aria-pressed="${split===100}">${c.inside}</button></div><label class="cake-range-label"><span>${c.hint}</span><input type="range" min="0" max="100" step="1" value="${split}" data-cake-range aria-label="${c.range}" aria-valuetext="${c.shown}: ${split}%"></label><p class="cake-art-note">${c.art}</p>
 ${info.parts.length?`<details class="cake-ingredients" id="cake-ingredients-${p.id}"><summary>${c.all}</summary><ul>${info.parts.map(part=>`<li>${esc(part)}</li>`).join('')}</ul><small>${c.source}</small></details>`:''}</div></div>`;
}
export function mountCakeViewer(root,lang){
 const viewer=root.querySelector('[data-cake-viewer]');if(!viewer)return ()=>{};
 const range=viewer.querySelector('[data-cake-range]'),photo=viewer.querySelector('.cake-comparison'),overlay=viewer.querySelector('.cake-ingredient-overlay'),disclosure=viewer.querySelector('.cake-ingredients');
 const change=value=>{const n=Math.max(0,Math.min(100,Number(value)||0));range.value=String(n);range.setAttribute('aria-valuetext',cakeCopy[lang].shown+': '+n+'%');photo.style.setProperty('--cake-split',n+'%');photo.classList.toggle('cake-blended',n>0&&n<100);photo.querySelector('.cake-divider').hidden=n===0||n===100;overlay.hidden=n<25;viewer.querySelectorAll('[data-cake-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cakeView)===n)));};
 const input=()=>change(range.value),click=e=>{const button=e.target.closest('button');if(!button)return;if(button.hasAttribute('data-cake-view'))change(button.dataset.cakeView);if(button.hasAttribute('data-cake-ingredients')&&disclosure){disclosure.open=!disclosure.open;button.setAttribute('aria-expanded',String(disclosure.open));}};
 const sync=()=>overlay?.setAttribute('aria-expanded',String(disclosure.open));
 viewer.addEventListener('click',click);range.addEventListener('input',input);disclosure?.addEventListener('toggle',sync);change(range.value);
 return ()=>{viewer.removeEventListener('click',click);range.removeEventListener('input',input);disclosure?.removeEventListener('toggle',sync);};
}

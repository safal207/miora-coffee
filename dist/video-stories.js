// Verified against the public @mioracoffeetr posts on 2026-11-12.
// Covers are existing MENU photos, never represented as frames from the videos.
export const stories = Object.freeze({
  croissant: {code:'DTuzdlJDbe2', cover:'assets/enhanced/430350-160.webp', product:'430356',
    title:{tr:'Kruvasan sandviç, Miora’da',ru:'Круассан-сэндвич в Miora',en:'A croissant sandwich at Miora'},
    note:{tr:'Videoda kruvasan hazırlanıyor. Sandviç oluşturucudaki ekmek ve dolgular ayrı seçilir.',ru:'В ролике готовят круассан. В конструкторе сэндвича хлеб и начинка выбираются отдельно.',en:'The video shows a croissant being prepared. Builder bread and fillings are selected separately.'}},
  breakfast: {code:'DTXNw46jQ5E', cover:'assets/products/431203.jpg', product:'431203',
    title:{tr:'Miora’da bir kahvaltı anı',ru:'Завтрак в Miora',en:'Breakfast at Miora'},
    note:{tr:'Bir servis örneği. Breakfast 2.0 seçiminin tam içeriği değildir; içeriği sen seçersin.',ru:'Пример подачи, а не точный состав Breakfast 2.0. Свой состав выбираешь ты.',en:'Serving inspiration, not your exact Breakfast 2.0 selection. You choose the ingredients.'}},
  dessert: {code:'DVIdcx1jcAN', cover:'assets/products/430198.jpg', category:'46818',
    title:{tr:'Çilekli kup, kat kat lezzet',ru:'Клубничный десерт, слой за слоем',en:'A strawberry dessert, layer by layer'},
    note:{tr:'Miora’nın çilekli kup videosu. Menüdeki tatlıları keşfet; güncel ürünü personelle teyit et.',ru:'Ролик Miora о клубничном десерте в стакане. Выбери десерт в меню; наличие уточни у сотрудника.',en:'Miora’s strawberry cup dessert video. Explore menu desserts; confirm today’s offering with staff.'}}
});
export const videoCopy = {
  tr:{watch:'Instagram’da aç',external:'Yeni sekme · Instagram giriş isteyebilir.',privacy:'Video yalnızca Instagram’da açılır. Tıklamadan Instagram’a bağlantı kurulmaz.',cover:'Menü fotoğrafı · video karesi değil',menu:'Kruvasan sandviçi incele',desserts:'Tatlıları keşfet'},
  ru:{watch:'Открыть Instagram',external:'Новая вкладка · Instagram может запросить вход.',privacy:'Видео откроется в Instagram. До нажатия соединения с Instagram нет.',cover:'Фото меню · не кадр ролика',menu:'Посмотреть круассан-сэндвич',desserts:'Выбрать десерт'},
  en:{watch:'Open Instagram',external:'New tab · Instagram may require sign-in.',privacy:'Video opens on Instagram. No Instagram connection before you click.',cover:'Menu photo · not a video frame',menu:'Explore the croissant sandwich',desserts:'Explore desserts'}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function videoStory(key,language='tr',{compact=false}={}) {
  const story=stories[key]; if(!story)return '';
  const lang=Object.hasOwn(videoCopy,language)?language:'tr',copy=videoCopy[lang];
  const action=!compact&&(key==='croissant'||key==='dessert')
    ?`<button type="button" class="video-menu-link" ${key==='croissant'?`data-detail="${story.product}"`:`data-video-desserts`}>${esc(key==='croissant'?copy.menu:copy.desserts)} →</button>`:'';
  return `<aside class="video-story${compact?' video-story-compact':''}" data-video-story="${key}" aria-label="${esc(story.title[lang])}">
    ${compact?'':`<figure class="video-story-cover"><img src="${story.cover}" width="160" height="160" loading="lazy" decoding="async" alt=""><figcaption>${esc(copy.cover)}</figcaption></figure>`}
    <div class="video-story-copy"><span class="video-story-source">@mioracoffeetr · Instagram</span><strong>${esc(story.title[lang])}</strong><p>${esc(story.note[lang])}</p>
    <a class="video-story-open" href="https://www.instagram.com/p/${story.code}/" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="${esc(story.title[lang]+' · '+copy.watch+' · '+copy.external)}"><span aria-hidden="true">▷</span> ${esc(copy.watch)} ↗</a>
    ${action}<small>${esc(copy.external)} ${esc(copy.privacy)}</small></div></aside>`;
}
export function dessertStoryVisible(category,search='') {
  return !search.trim()&&['all','featured','46818'].includes(category);
}

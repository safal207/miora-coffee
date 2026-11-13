import {photoUrl,photoSet,photoKind} from './photos.js?v=20261113-focus1';
export const DWELL_MS=7000,TRANSITION_MS=650;
export const motionCopy={
 ru:{title:'Присмотрись к вкусу',pause:'Пауза',play:'Продолжить',prev:'Предыдущее',next:'Следующее',details:'Подробнее',swipe:'Листни фото ↔',ai:'AI-пример подачи',original:'Кадр из меню',restyled:'AI-обработка кадра меню',source:'Посмотреть исходный кадр',cover:'Посмотреть обложку'},
 tr:{title:'Lezzete yakından bak',pause:'Duraklat',play:'Devam et',prev:'Önceki',next:'Sonraki',details:'İncele',swipe:'Fotoğrafı kaydır ↔',ai:'AI servis örneği',original:'Menü fotoğrafı',restyled:'AI ile düzenlenmiş menü görseli',source:'Kaynak görseli gör',cover:'Kapak görselini gör'},
 en:{title:'Take a closer look',pause:'Pause',play:'Resume',prev:'Previous',next:'Next',details:'View details',swipe:'Swipe photos ↔',ai:'AI serving illustration',original:'Source menu photo',restyled:'AI-restyled menu image',source:'View source image',cover:'View cover image'}
};
const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const imageLabel=(item,lang,variant='focus')=>{const c=motionCopy[lang];return c[({generated:'ai',illustration:'restyled',original:'original'})[photoKind(item,variant)]];};
export function spotlightItems(items){
 // Curated contrasts are a browsing suggestion, not a popularity or discount claim.
 const preferred=['460119','429808','428772','460120','429822','430356','431203'];
 const ranked=[...items].sort((a,b)=>(preferred.includes(a.id)?preferred.indexOf(a.id):999)-(preferred.includes(b.id)?preferred.indexOf(b.id):999));
 const chosen=[],seen=new Set();
 for(const p of ranked){const src=photoUrl(p,160);if(p.price===null||['430236','430240','431177','431178','431179','431203','431333'].includes(p.id)||seen.has(src))continue;chosen.push(p);seen.add(src);if(chosen.length===3)break;}
 return chosen;
}
export function galleryMarkup(p,lang,name,detailLabel){
 const c=motionCopy[lang];
 return `<div class="product-gallery" data-gallery="${p.id}"><div class="gallery-track" role="group" aria-label="${escape(name)}">${['focus','original'].map((variant,i)=>`<div class="gallery-frame"><button type="button" class="feed-photo-button" data-detail="${p.id}" data-source-view="${variant}" aria-label="${escape(detailLabel+' · '+name+' · '+imageLabel(p,lang,variant))}"><img src="${photoUrl(p,640,variant)}" ${photoSet(p,'(max-width: 359px) 90vw, (max-width: 620px) 43vw, 290px',variant)} width="640" height="480" loading="lazy" decoding="async" alt="${escape(name)}"><span class="gallery-label">${escape(imageLabel(p,lang,variant))} · ${i+1}/2</span></button></div>`).join('')}</div><button type="button" class="gallery-next" aria-label="${escape(c.next+' · '+name)}">${escape(c.swipe)} <span aria-hidden="true">1/2</span></button></div>`;
}
export function mountGalleries(root){
 const cleanups=[];
 let nudged=false;
 const cue=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.intersectionRatio>=.8&&!nudged&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!root.contains(document.activeElement)){
  nudged=true;const animation=entry.target.querySelector('.gallery-frame').animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(0)'}],{duration:650,iterations:1});cleanups.push(()=>animation.cancel());cue.disconnect();break;
 }},{threshold:[0,.8]});
 for(const gallery of root.querySelectorAll('[data-gallery]')){
  const track=gallery.querySelector('.gallery-track'),button=gallery.querySelector('.gallery-next'),frames=[...track.children];
  cue.observe(gallery);
  let index=0,startX=0,startY=0,dragged=false;
  const move=()=>{index=track.scrollLeft>(track.scrollWidth-track.clientWidth)/2?1:0;button.querySelector('span').textContent=`${index+1}/2`;};
  const click=()=>{index=1-index;track.scrollTo({left:index?(track.scrollWidth-track.clientWidth):0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  const down=e=>{startX=e.clientX;startY=e.clientY;dragged=false;};
  const pointerMove=e=>{if(Math.abs(e.clientX-startX)>10||Math.abs(e.clientY-startY)>10)dragged=true;};
  const guard=e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}};
  track.addEventListener('scroll',move,{passive:true});button.addEventListener('click',click);
  track.addEventListener('pointerdown',down);track.addEventListener('pointermove',pointerMove);track.addEventListener('click',guard,true);
  cleanups.push(()=>{track.removeEventListener('scroll',move);button.removeEventListener('click',click);track.removeEventListener('pointerdown',down);track.removeEventListener('pointermove',pointerMove);track.removeEventListener('click',guard,true);});
 }
 return ()=>{cue.disconnect();cleanups.forEach(fn=>fn());};
}
export function mountSpotlight(root,items,{lang,name,money}){
 const selected=spotlightItems(items),c=motionCopy[lang];root.hidden=selected.length<2;
 if(root.hidden){root.replaceChildren();return ()=>{};}
 root.innerHTML=`<section class="menu-spotlight" role="region" aria-roledescription="${lang==='ru'?'карусель':lang==='tr'?'karusel':'carousel'}" aria-labelledby="spotlight-title"><div class="spotlight-heading"><h3 id="spotlight-title">${c.title}</h3><button type="button" data-rotation></button></div><div class="spotlight-window"><div class="spotlight-track">${selected.map((p,i)=>`<div class="spotlight-slide" role="group" aria-roledescription="${lang==='ru'?'слайд':lang==='tr'?'slayt':'slide'}" aria-label="${i+1} / ${selected.length}"><img src="${photoUrl(p,160)}" width="160" height="120" alt="" decoding="async"><div><p>${escape(imageLabel(p,lang))}</p><h4>${escape(name(p))}</h4><strong>${escape(money(p.price))}</strong></div></div>`).join('')}</div></div><div class="spotlight-controls"><button type="button" data-prev aria-label="${c.prev}">←</button><span data-counter></span><button type="button" data-next aria-label="${c.next}">→</button><button type="button" class="spotlight-detail" data-detail="${selected[0].id}">${c.details} ↗</button></div></section>`;
 const section=root.firstElementChild,track=root.querySelector('.spotlight-track'),slides=[...track.children],rotation=root.querySelector('[data-rotation]'),counter=root.querySelector('[data-counter]'),detail=root.querySelector('[data-detail]'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,paused=media.matches,visible=false,hover=false,timer=null,destroyed=false;
 const listeners=[];
 const listen=(el,event,fn,opts)=>{el.addEventListener(event,fn,opts);listeners.push(()=>el.removeEventListener(event,fn,opts));};
 const allowed=()=>!destroyed&&!paused&&visible&&!hover&&!document.hidden&&!document.querySelector('dialog[open]');
 const schedule=()=>{clearTimeout(timer);timer=null;if(allowed())timer=setTimeout(()=>{if(allowed())change(1,false);},DWELL_MS);};
 const update=()=>{
  track.style.transform=`translateX(-${index*100}%)`;
  slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
  rotation.textContent=paused?c.play:c.pause;rotation.setAttribute('aria-label',rotation.textContent);
  counter.textContent=`${index+1} / ${selected.length}`;counter.setAttribute('aria-live',paused?'polite':'off');
  detail.dataset.detail=selected[index].id;detail.setAttribute('aria-label',c.details+' · '+name(selected[index]));
  section.dataset.paused=String(paused);section.dataset.index=String(index);schedule();
 };
 const stop=()=>{paused=true;update();};
 function change(delta,manual=true){if(manual)paused=true;const next=(index+delta+selected.length)%selected.length;const image=slides[next].querySelector('img');if(manual||(image?.complete&&image.naturalWidth>0))index=next;update();}
 listen(rotation,'click',()=>{paused=!paused;update();});
 listen(root.querySelector('[data-prev]'),'click',()=>change(-1));listen(root.querySelector('[data-next]'),'click',()=>change(1));
 listen(section,'focusin',stop);listen(section,'pointerdown',e=>{if(!e.target.closest('[data-rotation]'))stop();});
 listen(section,'mouseenter',()=>{if(matchMedia('(hover: hover)').matches){hover=true;schedule();}});listen(section,'mouseleave',()=>{hover=false;schedule();});
 listen(document,'visibilitychange',schedule);listen(media,'change',()=>{if(media.matches)stop();});
 let x=null,y=null;
 listen(root.querySelector('.spotlight-window'),'pointerdown',e=>{x=e.clientX;y=e.clientY;});
 listen(root.querySelector('.spotlight-window'),'pointerup',e=>{if(x!==null&&Math.abs(e.clientX-x)>45&&Math.abs(e.clientX-x)>Math.abs(e.clientY-y))change(e.clientX<x?1:-1);x=null;});
 const top=[...document.querySelectorAll('.header,#feed-stories,#toolbar')].reduce((n,el)=>n+el.offsetHeight,0);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.65;schedule();},{threshold:[0,.65],rootMargin:`-${top}px 0px 0px 0px`});observer.observe(section);
 const dialogs=new MutationObserver(()=>{if(document.querySelector('dialog[open]'))stop();else schedule();});document.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
 update();return ()=>{destroyed=true;clearTimeout(timer);observer.disconnect();dialogs.disconnect();listeners.forEach(fn=>fn());root.replaceChildren();root.hidden=true;};
}

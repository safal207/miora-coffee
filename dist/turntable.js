import {turntables} from './turntable-data.js';
import {photoUrl,photoSet} from './photos.js?v=20261115-angles1';
export const hasTurntable=item=>Boolean(turntables[item?.id]);
export const spinCopy={
 ru:{open:'Рассмотреть 360°',photos:'Фото',photo:'Вернуться к фото',hint:'Потяни влево или вправо',range:'Повернуть блюдо',previous:'Предыдущий ракурс',next:'Следующий ракурс',reset:'Сначала',loading:'Готовим 360°-обзор…',ready:'Можно поворачивать',error:'Обзор не загрузился. Обычные фото доступны.',retry:'Повторить',note:'AI-обзор · 12 ракурсов. Невидимые стороны воссозданы; реальная подача может отличаться.',view:'Ракурс {n} из {total}',add:'Добавить в заказ',ask:'Уточните цену'},
 tr:{open:'360° incele',photos:'Fotoğraf',photo:'Fotoğrafa dön',hint:'Sola veya sağa sürükle',range:'Ürünü döndür',previous:'Önceki açı',next:'Sonraki açı',reset:'Başa dön',loading:'360° görünüm hazırlanıyor…',ready:'Döndürmeye hazır',error:'Görünüm yüklenemedi. Normal fotoğraflar kullanılabilir.',retry:'Tekrar dene',note:'AI görünüm · 12 açı. Görünmeyen yüzeyler yeniden oluşturulmuştur; gerçek sunum farklı olabilir.',view:'{total} açıdan {n}.',add:'Siparişe ekle',ask:'Fiyatı sorunuz'},
 en:{open:'Explore 360°',photos:'Photos',photo:'Back to photos',hint:'Drag left or right',range:'Rotate the dish',previous:'Previous view',next:'Next view',reset:'Reset',loading:'Preparing the 360° view…',ready:'Ready to rotate',error:'The view could not load. Regular photos are available.',retry:'Try again',note:'AI view · 12 angles. Unseen sides are reconstructed; actual serving may differ.',view:'View {n} of {total}',add:'Add to my list',ask:'Ask for price'}
};
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function wrapFrame(value,count){if(!Number.isInteger(count)||count<1)return 0;const n=Number.isFinite(Number(value))?Math.round(Number(value)):0;return ((n%count)+count)%count;}
export function frameRect(index,record){const n=wrapFrame(index,record.frames),col=n%record.columns,row=Math.floor(n/record.columns),inset=record.inset;const left=Math.round(col*record.width/record.columns),top=Math.round(row*record.height/record.rows),right=Math.round((col+1)*record.width/record.columns),bottom=Math.round((row+1)*record.height/record.rows);return {x:left+inset,y:top+inset,width:right-left-inset*2,height:bottom-top-inset*2};}
export const viewLabel=(lang,frame,total)=>spinCopy[lang].view.replace('{n}',String(frame+1)).replace('{total}',String(total));
async function decodeSheet(blob){
 if(typeof createImageBitmap==='function')return createImageBitmap(blob);
 const image=new Image(),url=URL.createObjectURL(blob);image.src=url;
 try{await image.decode();return image;}finally{URL.revokeObjectURL(url);}
}
export function turntableMarkup(item,lang,name,money=value=>`${value/100} ₺`){
 if(!hasTurntable(item))return '';
 const c=spinCopy[lang];
 return `<section class="spin-viewer" data-spin-viewer="${item.id}" aria-label="${esc(c.open+' · '+name)}"><div class="spin-stage" data-spin-stage data-frame="0" role="img" aria-label="${esc(name+' · '+c.open)}" aria-describedby="spin-help-${item.id}"><img class="spin-poster" src="${photoUrl(item)}" ${photoSet(item,'(max-width: 620px) 100vw, 430px')} width="640" height="480" alt="" decoding="async"><canvas class="spin-canvas" width="512" height="512" aria-hidden="true" hidden></canvas><span class="spin-badge" aria-hidden="true">360° <span>AI</span></span><span class="spin-orbit" aria-hidden="true">↔</span><span class="spin-frame-count" aria-hidden="true">01 / 12</span></div><div class="spin-controls"><div class="spin-sale-row"><div><h3>${esc(name)}</h3><strong${item.price===null?' class="spin-price-missing"':''}>${esc(item.price===null?c.ask:money(item.price))}</strong></div>${item.price!==null?`<button type="button" class="button primary spin-add" data-add="${item.id}">${c.add}</button>`:''}</div><p class="spin-help" id="spin-help-${item.id}">${c.hint}</p><div class="spin-buttons"><button type="button" data-spin-step="-1" aria-label="${c.previous}" disabled>←</button><button type="button" data-spin-reset disabled>${c.reset}</button><button type="button" data-spin-step="1" aria-label="${c.next}" disabled>→</button><button type="button" data-detail="${item.id}" class="spin-back">${c.photo}</button></div><label class="spin-range-label"><span>${c.range}</span><input type="range" min="0" max="11" step="1" value="0" data-spin-range aria-label="${c.range}" aria-valuetext="${esc(viewLabel(lang,0,12))}" disabled></label><p class="spin-status" role="status" aria-live="polite">${c.loading}</p><button type="button" class="spin-retry" data-spin-retry hidden>${c.retry}</button><p class="spin-note">${c.note}</p></div></section>`;
}
export function mountTurntable(root,{lang,name}){
 const viewer=root.querySelector('[data-spin-viewer]');if(!viewer)return ()=>{};
 const record=turntables[viewer.dataset.spinViewer],c=spinCopy[lang],stage=viewer.querySelector('[data-spin-stage]'),canvas=viewer.querySelector('canvas'),poster=viewer.querySelector('.spin-poster'),slider=viewer.querySelector('[data-spin-range]'),status=viewer.querySelector('.spin-status'),retry=viewer.querySelector('[data-spin-retry]');
 let bitmap=null,index=0,alive=true,controller=null,drawId=0,pointer=null,ready=false;
 const context=canvas.getContext('2d');
 const draw=()=>{drawId=0;if(!alive||!bitmap||!context)return;const r=frameRect(index,record);if(canvas.width!==r.width||canvas.height!==r.height){canvas.width=r.width;canvas.height=r.height;}context.clearRect(0,0,r.width,r.height);context.drawImage(bitmap,r.x,r.y,r.width,r.height,0,0,r.width,r.height);};
 const update=value=>{index=wrapFrame(value,record.frames);status.textContent=viewLabel(lang,index,record.frames);slider.value=String(index);slider.setAttribute('aria-valuetext',viewLabel(lang,index,record.frames));stage.dataset.frame=String(index);stage.setAttribute('aria-label',name+' · '+viewLabel(lang,index,record.frames));viewer.querySelector('.spin-frame-count').textContent=String(index+1).padStart(2,'0')+' / '+record.frames;viewer.dataset.interacted='true';if(!drawId)drawId=requestAnimationFrame(draw);};
 const controls=value=>viewer.querySelectorAll('[data-spin-step],[data-spin-reset],[data-spin-range]').forEach(el=>el.disabled=!value);
 const load=async()=>{
  controller?.abort();controller=new AbortController();ready=false;controls(false);retry.hidden=true;status.textContent=c.loading;viewer.dataset.state='loading';
  try{
   if(!context)throw Error('canvas unavailable');
   const response=await fetch(record.src,{signal:controller.signal});if(!response.ok)throw Error('image unavailable');const blob=await response.blob();if(!alive)return;
   const decoded=await decodeSheet(blob);if(!alive){decoded.close?.();return;}if(decoded.width!==record.width||decoded.height!==record.height){decoded.close?.();throw Error('invalid sheet');}
   bitmap?.close?.();bitmap=decoded;ready=true;draw();poster.hidden=true;canvas.hidden=false;controls(true);status.textContent=c.ready;viewer.dataset.state='ready';
  }catch(error){if(!alive||error.name==='AbortError')return;ready=false;controls(false);poster.hidden=false;canvas.hidden=true;status.textContent=c.error;retry.hidden=false;viewer.dataset.state='error';}
 };
 const input=()=>{if(ready)update(slider.value);};
 const click=event=>{const b=event.target.closest('button');if(!b)return;if(b.hasAttribute('data-spin-retry')){load();return;}if(!ready)return;if(b.hasAttribute('data-spin-step')){update(index+Number(b.dataset.spinStep));}if(b.hasAttribute('data-spin-reset')){update(0);}};
 const down=event=>{if(!ready||!event.isPrimary||event.button!==0)return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,frame:index,active:false};stage.setPointerCapture(event.pointerId);};
 const release=()=>{const active=pointer;pointer=null;if(active&&stage.hasPointerCapture(active.id))stage.releasePointerCapture(active.id);stage.classList.remove('is-dragging');};
 const move=event=>{if(!pointer||pointer.id!==event.pointerId)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;if(!pointer.active){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){release();return;}if(Math.abs(dx)<8)return;pointer.active=true;stage.classList.add('is-dragging');}update(pointer.frame-Math.round(dx/(stage.clientWidth/record.frames)));};
 viewer.addEventListener('click',click);slider.addEventListener('input',input);stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 load();return ()=>{alive=false;controller?.abort();cancelAnimationFrame(drawId);release();bitmap?.close?.();bitmap=null;viewer.removeEventListener('click',click);slider.removeEventListener('input',input);stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',release);stage.removeEventListener('pointercancel',release);stage.removeEventListener('lostpointercapture',release);};
}

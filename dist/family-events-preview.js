import {EVENT_IDEAS,FAMILY_EVENTS_COPY,isFamilyEventsPreview,eventIdea} from './family-events.js';

const root=document.getElementById('family-events-preview');
if(root&&isFamilyEventsPreview(window.location.search)){
  root.hidden=false;
  let selected=null;
  const language=()=>{
    const code=document.getElementById('language')?.value;
    return Object.hasOwn(FAMILY_EVENTS_COPY,code)?code:'tr';
  };
  // All copy is packaged static content. No personal data, traffic or RSVP.
  const safe=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const render=(focus=false)=>{
    const c=FAMILY_EVENTS_COPY[language()],idea=eventIdea(selected,language());
    root.setAttribute('aria-label',c.label);
    const cards=EVENT_IDEAS.map(id=>{
      const item=c[id],pressed=selected===id;
      return `<button type="button" class="events-idea" data-events-choice="${id}" aria-pressed="${pressed}">
        <span class="events-idea-mark" aria-hidden="true">${id==='creative'?'✳':id==='meetup'?'◎':'✿'}</span>
        <span class="events-idea-body"><small>${safe(item.tag)}</small><b>${safe(item.title)}</b></span>
        <span class="events-idea-arrow" aria-hidden="true">→</span></button>`;
    }).join('');
    root.innerHTML=`<div class="events-preview-inner"><div class="events-preview-top"><span class="events-preview-state">${safe(c.status)}</span><p class="events-preview-eyebrow">${safe(c.eyebrow)}</p><h2 id="events-preview-title" tabindex="-1">${safe(c.heading)}</h2><p class="events-preview-intro">${safe(c.lead)}</p></div>
      <div class="events-preview-dialogue"><img src="assets/logo-source.jpg" width="36" height="36" alt="" decoding="async"><p>${safe(c.question)}</p></div>
      <div class="events-idea-grid" role="group" aria-label="${safe(c.question)}">${cards}</div>
      ${idea?`<div class="events-preview-detail" role="status" aria-live="polite" aria-atomic="true"><p class="events-preview-kicker">${safe(idea.tag)}</p><h3 id="events-preview-detail-title" tabindex="-1">${safe(idea.title)}</h3><p>${safe(idea.body)}</p><p class="events-preview-warning">${safe(c.detail)}</p><button type="button" data-events-reset>${safe(c.next)}</button></div>`:''}
      <p class="events-preview-floornote">${safe(c.floor)}</p><div class="events-preview-footer"><p>${safe(c.privacy)}</p><a href="#menu">${safe(c.menu)} →</a></div>
    </div>`;
    if(focus)(root.querySelector(idea?'#events-preview-detail-title':'#events-preview-title'))?.focus({preventScroll:true});
  };
  root.addEventListener('click',event=>{
    const target=event.target.closest('button');
    if(!target||!root.contains(target))return;
    if(Object.hasOwn(target.dataset,'eventsReset')){selected=null;render(true);return;}
    const next=target.dataset.eventsChoice;
    if(EVENT_IDEAS.includes(next)){selected=next;render(true);}
  });
  document.getElementById('language')?.addEventListener('change',()=>render());
  render();
}

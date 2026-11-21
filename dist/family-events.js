// Family Events Lab is a private-to-URL concept preview, not an event offering.
// The venue has an upstairs space, but formats, dates, owners' approval,
// admission and bookings have NOT been confirmed.
export const EVENT_PREVIEW_PARAM='family-events';
export const EVENT_IDEAS=Object.freeze(['creative','meetup','celebration']);
export const FAMILY_EVENTS_COPY=Object.freeze({
  tr:{
    status:'SADECE TASLAK · ONAYLANMADI',
    eyebrow:'MIORA · 2. KAT FİKİR ATÖLYESİ',
    heading:'Birlikte geçirilen anlar için yeni fikirler.',
    lead:'Miora’nın ikinci katında bir alan var. Burada ne yapılabileceğini henüz değerlendiriyoruz; aşağıdaki etkinlikler duyuru değildir.',
    question:'Aileniz için hangi buluşma fikri ilginç olurdu?',
    creative:{title:'Yaratıcı buluşma',tag:'Etkinlik fikri',body:'Birlikte resim, el işi veya küçük yaratıcı projeler üretilebilecek bir aile etkinliği fikri.'},
    meetup:{title:'Aile buluşması',tag:'Topluluk fikri',body:'Sohbet, tanışma ve birlikte zaman geçirmek için rahat bir buluşma formatı fikri.'},
    celebration:{title:'Özel gün buluşması',tag:'Kutlama fikri',body:'Ailelerin özel günlerini kutlayabileceği bir düzen için taslak; hizmet olarak sunulmuyor.'},
    choice:'İlgimi çeken fikir',next:'Başka fikre bak',explore:'Fikri incele',menu:'Menüye geç',
    detail:'Bu, yalnızca deneyim taslağıdır. Program, kapasite, ücret, rezervasyon, personel ve tarih onaylanmamıştır.',
    floor:'2. katın gerçek fotoğrafları henüz eklenmedi. Alt kattaki oyun alanını ikinci kat gibi göstermiyoruz.',
    privacy:'Yanıtlar kaydedilmez veya gönderilmez. Burada rezervasyon veya başvuru yoktur.',
    label:'Miora ikinci kat etkinlik fikirleri için deneysel tasarım'
  },
  ru:{
    status:'ТОЛЬКО ПРОТОТИП · НЕ СОГЛАСОВАНО',
    eyebrow:'MIORA · ИДЕИ ДЛЯ ВТОРОГО ЭТАЖА',
    heading:'Место, где семьи могут встречаться.',
    lead:'На втором этаже Miora есть пространство. Мы пока изучаем идеи его использования — это не анонс действующих мероприятий.',
    question:'Какой формат семейной встречи вам был бы интересен?',
    creative:{title:'Творческая мастерская',tag:'Идея занятия',body:'Возможная встреча для семей с рисованием, поделками и небольшими творческими заданиями.'},
    meetup:{title:'Семейная встреча',tag:'Идея сообщества',body:'Возможный формат для общения родителей, знакомства семей и совместного отдыха.'},
    celebration:{title:'Семейный праздник',tag:'Идея события',body:'Концепция камерного семейного праздника — не действующая услуга или предложение бронирования.'},
    choice:'Мне интересна идея',next:'Выбрать другую',explore:'Посмотреть идею',menu:'Перейти в меню',
    detail:'Это только концепция. Расписание, вместимость, стоимость, бронирование и формат работы не утверждены владельцами.',
    floor:'Фотографий второго этажа пока нет. Не показываем игровую зону первого этажа как пространство для мероприятий.',
    privacy:'Ответы никуда не отправляются и не сохраняются. Здесь нельзя записаться или забронировать.',
    label:'Тестовая концепция семейных событий на втором этаже Miora'
  },
  en:{
    status:'CONCEPT ONLY · NOT APPROVED',
    eyebrow:'MIORA · UPSTAIRS IDEAS LAB',
    heading:'A place for families to come together.',
    lead:'Miora has an upstairs space. We are exploring possible uses; these are ideas, not announced or available events.',
    question:'Which kind of family gathering would you find interesting?',
    creative:{title:'Creative workshop',tag:'Workshop idea',body:'A potential family session for drawing, crafts and small creative activities.'},
    meetup:{title:'Family meetup',tag:'Community idea',body:'A possible way for parents and families to chat, connect and enjoy time together.'},
    celebration:{title:'Family celebration',tag:'Celebration idea',body:'A concept for a small family celebration, not a service or booking offer.'},
    choice:'I like this idea',next:'Explore another',explore:'View concept',menu:'Open the menu',
    detail:'Concept only. Schedule, capacity, pricing, reservations and staffing have not been approved by the owners.',
    floor:'No verified photos of the second floor are available yet. The downstairs play town is not presented as the upstairs venue.',
    privacy:'Answers are not sent or stored. No bookings or registrations are taken here.',
    label:'Miora upstairs family events concept preview'
  }
});
export function isFamilyEventsPreview(search){
  try{return new URLSearchParams(search).get('preview')===EVENT_PREVIEW_PARAM;}catch{return false;}
}
export function eventIdea(id,locale){
  const c=FAMILY_EVENTS_COPY[Object.hasOwn(FAMILY_EVENTS_COPY,locale)?locale:'tr'];
  return EVENT_IDEAS.includes(id)?c[id]:null;
}

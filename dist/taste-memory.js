// Taste Memory: explicit, device-only recall of chosen menu items.
// Saved favorites are managed separately by the existing Miora favorites feature.
export const TASTE_STORAGE_KEY='miora:taste-memory:v1';
export const MAX_TASTE_CHOICES=6;
const validId=id=>typeof id==='string'&&/^\d{5,7}$/.test(id);
const available=(catalog,id)=>catalog instanceof Map&&Number.isSafeInteger(catalog.get(id)?.price)&&catalog.get(id).price>0;

export function readTasteMemory(storage,catalog){
  try{
    const raw=JSON.parse(storage?.getItem(TASTE_STORAGE_KEY)||'null');
    if(!raw||raw.enabled!==true||!Array.isArray(raw.recent))return {enabled:false,recent:[]};
    const recent=[];
    for(const id of raw.recent.slice(0,100)){
      if(validId(id)&&available(catalog,id)&&!recent.includes(id))recent.push(id);
      if(recent.length===MAX_TASTE_CHOICES)break;
    }
    return {enabled:true,recent};
  }catch{return {enabled:false,recent:[]};}
}

/** Enable only by the visitor's explicit action; disabling erases recent choices. */
export function setTasteMemoryEnabled(storage,enabled,catalog){
  try{
    if(!storage)return false;
    if(enabled){
      if(typeof storage.setItem!=='function')return false;
      const previous=readTasteMemory(storage,catalog);
      storage.setItem(TASTE_STORAGE_KEY,JSON.stringify({enabled:true,recent:previous.recent}));
    }else{
      if(typeof storage.removeItem!=='function')return false;
      storage.removeItem(TASTE_STORAGE_KEY);
    }
    return true;
  }catch{return false;}
}

export function rememberTasteChoice(storage,id,catalog){
  if(!validId(id)||!available(catalog,id))return false;
  const memory=readTasteMemory(storage,catalog);
  if(!memory.enabled)return false;
  try{
    const recent=[id,...memory.recent.filter(other=>other!==id)].slice(0,MAX_TASTE_CHOICES);
    storage.setItem(TASTE_STORAGE_KEY,JSON.stringify({enabled:true,recent}));
    return true;
  }catch{return false;}
}

/** Favorites first, then explicitly remembered selections. Never infer popularity. */
export function tasteSuggestions({favorites=[],memory={enabled:false,recent:[]},catalog,limit=4}={}){
  if(!(catalog instanceof Map))return [];
  const desired=[...(Array.isArray(favorites)?favorites:favorites instanceof Set?[...favorites]:[]),
    ...(memory.enabled===true&&Array.isArray(memory.recent)?memory.recent:[])];
  const distinct=new Set(),out=[];
  const cap=Number.isInteger(limit)?Math.max(0,Math.min(6,limit)):4;
  for(const id of desired){
    if(!validId(id)||distinct.has(id)||!available(catalog,id))continue;
    distinct.add(id);out.push(catalog.get(id));
    if(out.length>=cap)break;
  }
  return out.slice(0,cap);
}

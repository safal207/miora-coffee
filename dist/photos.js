import {photoSources,photoPlaceholders} from './photo-data.js?v=20261106-photos2';
import {originalPhotos} from './original-photo-data.js';
import {generatedPhotos} from './generated-photo-data.js';
import {focusedPhotos as previousFocusedPhotos} from './focus-photo-data.js?v=20261122-merch1';
import {dessertPhotos} from './dessert-photo-data.js';
import {cakePhotos} from './cake-photo-data.js';
const focusedPhotos=Object.freeze({...previousFocusedPhotos,...dessertPhotos});
export const hasRestagedPhoto=item=>Boolean(focusedPhotos[item?.id]);
// The discovery feed shows real menu photos and useful alternate covers, never AI cutaway comparisons.
// Optional curated cutaway images remain available only inside expanded product information.
export const photoVariants=item=>focusedPhotos[item?.id]?['focus','original']:['focus'];
export const hasAlternatePhoto=item=>photoVariants(item).length>1;
const placeholders=new Set(photoPlaceholders),widths=new Set([160,640,1200]);
export const hasPhoto=item=>Boolean(generatedPhotos[item?.id])||Boolean(item?.image)&&!placeholders.has(item.id);
export function photoUrl(item,width=640,variant='focus') {
  if(!hasPhoto(item))return item?.image?'assets/logo-source.jpg':'favicon.svg';
  if(variant==='inside'&&cakePhotos[item.id])return cakePhotos[item.id].assets[widths.has(width)?width:640].src;
  if(variant!=='original'&&focusedPhotos[item.id])return focusedPhotos[item.id].assets[widths.has(width)?width:640].src;
  if(generatedPhotos[item.id])return generatedPhotos[item.id].assets[widths.has(width)?width:640].src;
  if(originalPhotos[item.id])return originalPhotos[item.id].assets[widths.has(width)?width:640].src;
  const source=photoSources[item.id];
  return source?`assets/enhanced/${source}-${widths.has(width)?width:640}.webp`:`assets/products/${item.id}.jpg`;
}
export function photoSet(item,sizes,variant='focus') {
  const original=hasPhoto(item)&&((variant==='inside'&&cakePhotos[item.id])||(variant!=='original'&&focusedPhotos[item.id])||generatedPhotos[item.id]||originalPhotos[item.id]);
  if(original){const unique=new Map();for(const a of Object.values(original.assets))if(!unique.has(a.width))unique.set(a.width,a.src);return `srcset="${[...unique].map(([w,src])=>`${src} ${w}w`).join(', ')}" sizes="${sizes}"`;}
  const source=hasPhoto(item)&&photoSources[item.id];
  return source?`srcset="assets/enhanced/${source}-160.webp 160w, assets/enhanced/${source}-640.webp 640w, assets/enhanced/${source}-1200.webp 1200w" sizes="${sizes}"`:'';
}
export const photoKind=(item,variant='focus')=>!hasPhoto(item)?'missing':(variant==='inside'&&cakePhotos[item.id])||(variant!=='original'&&focusedPhotos[item.id])||generatedPhotos[item.id]?'generated':originalPhotos[item.id]?'original':photoSources[item.id]?'illustration':'original';

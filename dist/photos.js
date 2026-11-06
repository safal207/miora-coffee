import {photoSources,photoPlaceholders} from './photo-data.js?v=20261106-photos1';
const placeholders=new Set(photoPlaceholders),widths=new Set([160,640,1200]);
export const hasPhoto=item=>Boolean(item?.image)&&!placeholders.has(item.id);
export function photoUrl(item,width=640) {
  if(!hasPhoto(item))return item?.image?'assets/logo-source.jpg':'favicon.svg';
  const source=photoSources[item.id];
  return source?`assets/enhanced/${source}-${widths.has(width)?width:640}.webp`:`assets/products/${item.id}.jpg`;
}
export function photoSet(item,sizes) {
  const source=hasPhoto(item)&&photoSources[item.id];
  return source?`srcset="assets/enhanced/${source}-160.webp 160w, assets/enhanced/${source}-640.webp 640w, assets/enhanced/${source}-1200.webp 1200w" sizes="${sizes}"`:'';
}

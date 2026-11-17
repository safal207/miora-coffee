// User-facing media merchandising policy. Preserve archival assets without pushing unverified AI reconstructions.
import {cakePhotos} from './cake-photo-data.js';

// Only these two desserts have a useful, labeled optional illustration of the inside texture.
const OPTIONAL_CUTAWAYS = new Set(['430226','429808']);
export const hasCuratedCutaway = item => Boolean(item?.id && OPTIONAL_CUTAWAYS.has(item.id) && cakePhotos[item.id]);

// All seven available turntables are AI-estimated geometry, not real 360-degree product photography.
// Do not advertise them in a customer-facing menu.
export const customer360Enabled = false;

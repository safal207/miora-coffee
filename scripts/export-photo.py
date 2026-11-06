#!/usr/bin/env python3
"""Encode built-in image-generation retouches as responsive WebP assets.
Requires ImageMagick 7. Resizing/encoding only; no creative image editing.
Usage: python scripts/export-photo.py PRODUCT_ID /absolute/generated-image.png
"""
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PRODUCTS=json.loads((ROOT/'docs/source-menu-2026-11-05.json').read_text())['products']
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def dimensions(path): return list(map(int,subprocess.check_output(['magick','identify','-format','%w %h',str(path)],text=True).split()))
def main():
    pid,generated=sys.argv[1:]; generated=Path(generated).resolve(strict=True)
    product=next(p for p in PRODUCTS if p['id']==pid); original=ROOT/f'dist/assets/products/{pid}.jpg'; source_hash=digest(original)
    path=ROOT/'docs/photo-refresh-2026-11-06.json'
    manifest=json.loads(path.read_text()) if path.exists() else {'version':'20261106-photos1','baseCommit':'2c0d3d00cc40f06cd291919c24b87d5093a1a959','complete':False,'plannedRealProducts':84,'method':'Built-in image generation; reference-preserving lighting, denoise and editorial restaging','export':'ImageMagick 7: resize and WebP encoding only','photos':{}}
    out=ROOT/'dist/assets/enhanced';out.mkdir(exist_ok=True);assets={}
    for width,quality in [(160,78),(640,83),(1200,85)]:
        dest=out/f'{pid}-{width}.webp'
        subprocess.run(['magick',str(generated),'-resize',f'{width}x{width}>','-strip','-quality',str(quality),str(dest)],check=True)
        assets[str(width)]={'path':dest.relative_to(ROOT/'dist').as_posix(),'dimensions':dimensions(dest),'bytes':dest.stat().st_size,'sha256':digest(dest)}
    manifest['photos'][pid]={'name':product['name'],'sourceSha256':source_hash,'sourceDimensions':dimensions(original),'productIds':[p['id'] for p in PRODUCTS if p.get('image') and digest(ROOT/f"dist/assets/products/{p['id']}.jpg")==source_hash],'generatedSha256':digest(generated),'generatedDimensions':dimensions(generated),'assets':assets,'visualReview':'pending'}
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'id':pid,'photos':len(manifest['photos']),'products':sum(len(p['productIds']) for p in manifest['photos'].values())}))
if __name__=='__main__':main()

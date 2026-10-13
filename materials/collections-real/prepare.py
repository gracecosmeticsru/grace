"""Retain exact source bytes and derive display-sized WebP files; no retouching."""
import hashlib, json, urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[2]
base = root / 'materials/collections-real'
public = root / 'public/images/collections-real'
public.mkdir(parents=True, exist_ok=True)

specs = [
 ('clean','gc002705','gc002705','https://anua.com/products/heartleaf-pore-control-cleansing-oil-200ml','https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-cleanser-heartleaf-pore-control-cleansing-oil-1239193742.jpg?v=1779181871','200 ml; reused exact original from stage 4.'),
 ('clean','gc002718','gc002718','https://beautyofjoseon.com/products/radiance-cleansing-balm','https://cdn.shopify.com/s/files/1/0558/4135/7989/files/radiance-cleansing-balm-1-front.webp?v=1770286511','Official sole 100 ml variant; product JSON retained. Original light ivory studio background with reflection, not pure white; retained unchanged.'),
 ('clean','gc002670','gc002670','https://doctoraltheaglobal.com/products/green-relief-amino-gel-cleanser','https://cdn.shopify.com/s/files/1/0082/1346/3093/files/1b3c480be77cef520e1bc24a4a94a1c2.jpg?v=1789024158','Official Green Relief Amino Gel Cleanser 100 ml.'),
 ('lips','gc003374','gc003374','https://www.rarebeauty.com/products/soft-pinch-tinted-lip-oil?variant=43734835069063','https://cdn.shopify.com/s/files/1/0314/1143/7703/products/soft-pinch-tinted-lip-oil-hope-1440x1952.jpg?v=1679094432','Exact Hope 3 ml; existing source image retained; pale beige studio background.'),
 ('lips','parent-0173','gc002909','https://www.charlottetilbury.com/us/product/lip-cheat-pillowtalk','https://images.ctfassets.net/wlke2cbybljx/2XsE0VmjzyEyD2jg62q7ui/a20ad365710adb4e49f6d01321bfe7c3/LIPCHEAT-PT-LEGENDARY-PDP.png?bg=rgb%3Affffff&fm=png','Official Pillow Talk Original Lip Cheat; page lists SKU LLIN12DX2R, 1.2 g. Current package.'),
 ('lips','parent-0163','gc003423','https://www.clarins.co.uk/lip-comfort-oil/80084587.html','https://www.clarins.co.uk/on/demandware.static/-/Sites-clarins-master-products/default/dw50bee8c8/original/80084587_original_original_PLP.jpg','Exact 01 Honey product SKU 80084587; current official packaging.'),
 ('body','gc004603','gc004603','https://www.treehutshea.com/products/pineapple-shea-sugar-scrub','https://cdn.shopify.com/s/files/1/0543/1594/2065/files/Raven_-_1x1_Size-5.png?v=1789049951','Official Pineapple Shea Sugar Scrub; catalogue title 510 g / variant Standard.'),
 ('body','gc001867','gc001867','https://soldejaneiro.com/products/brazilian-bum-bum-cream','https://cdn.shopify.com/s/files/1/2826/2250/files/01_SDJ_PPage_DTC_BB_BC_240ML_OVERHEAD_RGB_1452X1452_cb5b3d96-578a-4163-8c34-8c815fc465eb.jpg?v=1788873312','Official exact 240 ml image linked to variant by image_id 36627083755622. Cheirosa 62.'),
 ('body','gc001222','gc001222','https://www.lasultanedesaba.com/products/creme-de-douche-ayurvedique-oriental-ambre-vanille-patchouli','https://cdn.shopify.com/s/files/1/0045/5294/9795/files/cremedouche_epices_AR003445_1.png?v=1789569051','Official Ayurvedic Amber Vanilla Patchouli shower cream/foaming gel 200 ml; current package.'),
 ('hair','parent-0234','gc004731','https://gisou.com/products/honey-milk-5-in-1-styling-cream','https://cdn.shopify.com/s/files/1/0361/1987/1619/files/PDP_PG_Stylincream_02_96b9c233-47c3-47ee-b3b5-ac81a8c75d33.jpg?v=1767965663','Official exact 150 ml variant image_id 68312006295882.'),
 ('hair','gc003348','gc003348','https://lador.co.kr/product/%ED%95%98%EC%9D%B4%EB%93%9C%EB%A1%9C-lpp-%EB%8B%A8%EB%B0%B1%EC%A7%88-%ED%8A%B8%EB%A6%AC%ED%8A%B8%EB%A8%BC%ED%8A%B8-150ml-%ED%8A%9C%EB%B8%8C%ED%83%80%EC%9E%85/28/','https://lador.co.kr/web/product/medium/202206/66213e8cbbdcf1dd4f6bfb45dfa6e9f6.png','Official Eco Hydro LPP Treatment 150 ml tube; source product image. OG image was rejected after visual review because it showed only texture.'),
 ('hair','parent-0289','gc004388','https://www.stylekorean.com/product/cp-1-renew-bright-complex-intense-nourishing-conditioner-500ml/1636351008','https://d2c3d01lcpw2ui.cloudfront.net/gl/data/item/1636351008/7Luo65SU.jpg','StyleKorean retailer exact CP-1 Bright Complex Intense Nourishing Conditioner 500 ml; renewed packaging.'),
]

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}),timeout=35).read()

def acquire(spec):
    theme,pid,vid,page,url,notes=spec
    ext=Path(url.split('?')[0]).suffix
    original=base/(vid+ext)
    if not original.exists():
        if vid=='gc002705': data=(root/'materials/hero-real/anua-cleansing-oil-200ml.jpg').read_bytes()
        elif vid=='gc003374': data=(root/'public/images/rare-beauty-lip-oil-hope-3ml.jpg').read_bytes()
        else: data=get(url)
        original.write_bytes(data)
    data=original.read_bytes()
    im=Image.open(original)
    width,height=im.size
    im=ImageOps.exif_transpose(im).convert('RGBA')
    canvas=Image.new('RGBA',im.size,'white'); canvas.alpha_composite(im)
    im=canvas.convert('RGB'); im.thumbnail((900,900),Image.Resampling.LANCZOS)
    dst=public/(vid+'.webp'); im.save(dst,'WEBP',quality=88,method=6)
    return dict(theme=theme,productId=pid,variantId=vid,sourcePage=page,sourceImage=url,originalPath=original.relative_to(root).as_posix(),publicPath=dst.relative_to(root).as_posix(),width=width,height=height,sha256=hashlib.sha256(data).hexdigest(),publicSha256=hashlib.sha256(dst.read_bytes()).hexdigest(),notes=notes+' SHA256 covers the retained original; publicSha256 covers display WebP. Only resize/format conversion/white alpha compositing; no generative edit.')

with ThreadPoolExecutor(max_workers=5) as pool: result=list(pool.map(acquire,specs))
products={p['id']:p for p in json.loads((root/'data/products.json').read_text(encoding='utf-8'))}
for item in result:
    assert any(v['id']==item['variantId'] for v in products[item['productId']]['variants'])
    assert item['width'] >= 500 and item['height'] >= 500
    assert hashlib.sha256((root/item['originalPath']).read_bytes()).hexdigest()==item['sha256']
(root/'docs/step05a-photo-sources.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sheet=Image.new('RGB',(1000,1400),'#f3f3f3'); d=ImageDraw.Draw(sheet)
for index,item in enumerate(result):
    x=index%3*330; y=index//3*350
    im=Image.open(root/item['publicPath']); im.thumbnail((315,310))
    sheet.paste(im,(x+(330-im.width)//2,y+(310-im.height)//2))
    d.text((x+12,y+319),item['theme']+' '+item['variantId'],fill='black')
sheet.save(base/'contact-sheet.jpg',quality=94)
print(json.dumps([{'id':r['variantId'],'size':[r['width'],r['height']],'path':r['publicPath']} for r in result],indent=2))

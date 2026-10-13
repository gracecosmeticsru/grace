import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const definitions = [
  {
    name: 'anua-cleansing-oil-200ml.jpg', sourceName: 'anua-cleansing-oil-200ml.jpg',
    sourcePage: 'https://anua.com/products/heartleaf-pore-control-cleansing-oil-200ml',
    sourceImage: 'https://cdn.shopify.com/s/files/1/0753/1429/9158/files/anua-us-cleanser-heartleaf-pore-control-cleansing-oil-1239193742.jpg?v=1779181871',
    productId: 'gc002705', variantId: 'gc002705', groups: ['k-beauty'],
    label: 'Anua Heartleaf Pore Control Cleansing Oil 200 мл',
    background: 'white', visualReview: 'Whole upright bottle and pump; label reads Heartleaf Pore Control Cleansing Oil, 200 ml. Original existing official photo reused without modification.',
  },
  {
    name: 'beauty-of-joseon-glow-serum-30ml.jpg', sourceName: 'beauty-of-joseon-glow-serum-30ml.jpg',
    sourcePage: 'https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide?variant=51833681772916',
    sourceImage: 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/glow-serum-propolis-niacinamide-1-front.webp?v=1770278801',
    productId: 'gc002217', variantId: 'gc002217', groups: ['k-beauty', 'autumn'],
    label: 'Beauty of Joseon Glow Serum: Propolis + Niacinamide 30 мл',
    background: 'warm ivory studio background with natural reflection',
    visualReview: 'Whole golden serum bottle with white dropper. Label identifies Glow Serum Propolis + Niacinamide. Official default image belongs to the 30 ml variant; 60 ml has a separate variant image. JPEG bytes served from a URL ending in .webp; local extension reflects the actual format. Original composition retained.',
  },
  {
    name: 'beauty-of-joseon-dynasty-cream-50ml.jpg', sourceName: 'beauty-of-joseon-dynasty-cream-50ml.jpg',
    sourcePage: 'https://beautyofjoseon.com/products/dynasty-cream?variant=43222120759461',
    sourceImage: 'https://cdn.shopify.com/s/files/1/0558/4135/7989/files/dynasty-cream-1-front_d45355a2-440a-4100-9ecc-b36c319aa678.webp?v=1774872280',
    productId: 'gc005063', variantId: 'gc005063', groups: ['autumn'],
    label: 'Beauty of Joseon Dynasty Cream 50 мл',
    background: 'warm ivory studio background with natural reflection',
    visualReview: 'Whole cream jar and white lid. Official Shopify variant 43222120759461 explicitly maps this photo to 50 ml; selected 50 ml option independently checked in CUA. JPEG bytes served from .webp URL; local extension corrected without editing bytes. Original composition retained.',
  },
  {
    name: 'tom-ford-nude-dip-03.jpg', sourceName: 'tom-ford-nude-dip-03-hires.jpg',
    sourcePage: 'https://www.sephora.com.mx/products/nude-dip-437561.html',
    sourceImage: 'https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dwf677e57d/images/hi-res/boletos/Karla%20Nieto/TOM%20FORD/888066035118_1.jpg',
    productId: 'gc004108', variantId: 'gc004108', groups: ['luxury'],
    label: 'Tom Ford Eye Color Quad 03 Nude Dip',
    background: 'white',
    visualReview: 'Whole open brown-and-gold palette, four champagne/rose/taupe/brown shades and two applicators. Exact Nude Dip SKU 437561 at Sephora, independently matched to Sephora UK Nude Dip photograph. Original 1500 px photo chosen over rejected 400 px thumbnail. No inferred weight added to catalog.',
  },
];

const assets = [];
for (const definition of definitions) {
  const {name, sourceName, groups, ...record} = definition;
  const originalFile = `materials/hero-real/${sourceName}`;
  const file = `public/images/hero-real/${name}`;
  const bytes = fs.readFileSync(originalFile);
  const metadata = await sharp(bytes).metadata();
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  fs.copyFileSync(originalFile, file);
  for (const group of groups) assets.push({file, originalFile, ...record, sha256, group, width: metadata.width, height: metadata.height, bytes: bytes.length, format: metadata.format});
}

fs.writeFileSync('artifacts/step-4/photo-sources.json', JSON.stringify({
  reviewedAt: '2026-09-22',
  scope: 'Homepage banner photo assets only. Catalog data and catalog photo mapping unchanged.',
  archiveReview: 'Grace_photo_sources_blocks_001_002.zip contains source candidates and scripts, zero downloaded photos; no unverified archive candidate was imported.',
  policy: 'Images are downloaded real product photography; no generation, cutout, recoloring, compositing or local pixel edits. Existing Anua photo reused. Preserve original backgrounds, complete packaging and aspect ratio when displayed.',
  sourceRights: 'Product photography from official brands and Sephora retailer product pages. No transfer of image rights or reuse license is inferred.',
  assets,
}, null, 2) + '\n');
console.log(`MANIFEST_CREATED ${assets.length} theme rows; ${definitions.length} distinct photos`);

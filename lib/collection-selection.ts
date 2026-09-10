import type { Product } from './catalog-types';
import type { CollectionSlug } from './collection-meta';
import { hasPrice } from './pricing';

const koreanBrands = new Set(['Anua', 'Dr. Althea', 'Round Lab', 'Celimax', 'Beauty of Joseon', 'SKIN1004', 'COSRX', 'ma:nyo', 'Biodance', 'Medicube', 'Heimish', 'rom&nd', 'Etude House', 'Missha', 'Holika Holika', 'The Saem', 'Laneige', 'Torriden', 'numbuzin', 'SOME BY MI', 'Dr. Ceuracle', 'Purito', 'VT Cosmetics']);
const luxuryBrands = new Set(['Dior', 'Chanel', 'Tom Ford', 'Charlotte Tilbury', 'Guerlain', 'Giorgio Armani', 'Yves Saint Laurent', 'Givenchy', 'Hourglass', 'Westman Atelier', 'La Sultane de Saba', 'Jo Malone London', 'Byredo', 'Maison Francis Kurkdjian', 'Creed', 'Kilian', 'Parfums de Marly', 'Prada', 'Hermès', 'Gucci', 'Estée Lauder', 'Bobbi Brown']);
const featuredBrands = new Set(['Anua', 'Dr. Althea', 'Biodance', 'Medicube', 'Rare Beauty', 'Rhode', 'Summer Fridays', 'Charlotte Tilbury', 'Sol de Janeiro', 'Gisou', 'rom&nd', 'PATRICK TA']);
const promoBrands = new Set(['Anua', 'Beauty of Joseon', 'Holika Holika', 'Catrice', 'Essence', 'Eveline Cosmetics', 'Relouis', 'Vivienne Sabo', 'The Saem', 'Belita', 'Bielenda', 'SHIK']);
const words = (p: Product) => `${p.name} ${p.variants.map(v => v.label).join(' ')}`.toLocaleLowerCase('ru').replace(/ё/g, 'е');
const inCategory = (p: Product, prefix: string) => p.paths.some(path => path === prefix || path.startsWith(prefix + '/'));
const isBeauty = (p: Product) => inCategory(p, 'skincare') || inCategory(p, 'makeup');
const isSet = (p: Product) => /набор|подароч|\bkit\b|\bset\b/.test(words(p));
const isMini = (p: Product) => /мини|mini|travel|тревел|пробник|дорожн/.test(words(p)) || !!p.decant || (inCategory(p, 'fragrance/personal') && /(?:^|\s)(?:[1-9]|1\d|2\d|30)\s*(?:мл|ml)(?:\s|$|[.,)])/.test(words(p)));
const hasPromo = (p: Product) => /(?:^|\s)(?:sale|promo)(?:\s|$)|скидк|промо|спецпредлож/.test(words(p));

function score(p: Product, slug: CollectionSlug): number {
  const name = words(p);
  // Return zero for records that cannot support this collection's premise.
  if (slug === 'k-beauty') {
    if (!koreanBrands.has(p.brand) || !isBeauty(p)) return 0;
    return 20 + (/345|heartleaf|centella|rice|бирч|берез|relief|pdrn|тинт|glasting/.test(name) ? 12 : 0) + (p.image ? 3 : 0);
  }
  if (slug === 'luxury') {
    if (!luxuryBrands.has(p.brand)) return 0;
    return 20 + (isBeauty(p) ? 8 : 0) + (/flawless|forever|lip glow|parure|rouge|помада|румяна/.test(name) ? 6 : 0) + (p.image ? 3 : 0);
  }
  if (slug === 'gifts') {
    if (!isSet(p) || /^(?:пакет|коробка)|подарочн[а-я ]*упаковк|из набора|воскоплав|депиляц|черных точек|blackhead/.test(name)) return 0;
    if (!p.brand || p.brand === 'Бренд не подтверждён' || p.brand === 'Grace Cosmetics') return 0;
    return 20 + (/подароч/.test(name) ? 20 : 0) + (inCategory(p, 'skincare') || inCategory(p, 'body') ? 8 : 0) + (koreanBrands.has(p.brand) || luxuryBrands.has(p.brand) || featuredBrands.has(p.brand) ? 16 : 0);
  }
  if (slug === 'miniatures') {
    if (!isMini(p)) return 0;
    return 20 + (/мини|mini|travel|тревел/.test(name) ? 12 : 0) + (isSet(p) ? 5 : 0) + (featuredBrands.has(p.brand) || luxuryBrands.has(p.brand) ? 6 : 0);
  }
  if (slug === 'reels') {
    if (!featuredBrands.has(p.brand) || !(isBeauty(p) || inCategory(p, 'hair') || inCategory(p, 'body'))) return 0;
    return 20 + (/soft pinch|345|glazing|lip butter|honey|bio.collagen|flawless|pdrn|блеск|румяна|тинт/.test(name) ? 12 : 0) + (p.image ? 8 : 0);
  }
  if (hasPromo(p)) return 100;
  const prices = p.variants.map(v => v.price).filter(hasPrice);
  if (!promoBrands.has(p.brand) || !isBeauty(p) || !prices.length || Math.min(...prices) > 2500) return 0;
  // Editorial promo selection, never an inferred discount or an invented old price.
  return 20 + (/бальзам|крем|тушь|блеск|маск|тинт/.test(name) ? 8 : 0) + (p.image ? 3 : 0);
}

export function selectCollection(products: Product[], slug: CollectionSlug): Product[] {
  const ranked = products.map(product => ({ product, score: score(product, slug) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id));
  const chosen: Product[] = [];
  const usedBrands = new Set<string>();
  const usedCategories = new Map<string, number>();
  const category = (p: Product) => p.paths[0] || 'other';
  const add = (p: Product) => {
    chosen.push(p); usedBrands.add(p.brand);
    usedCategories.set(category(p), (usedCategories.get(category(p)) || 0) + 1);
  };
  // Include Korean makeup as well as skincare when both are available.
  if (slug === 'k-beauty') {
    for (const category of ['skincare', 'makeup']) {
      const candidates = ranked.filter(({ product }) => inCategory(product, category) && !usedBrands.has(product.brand));
      const item = category === 'makeup' ? candidates.find(({ product }) => inCategory(product, 'makeup/lips') || inCategory(product, 'makeup/eyes')) || candidates[0] : candidates[0];
      if (item) add(item.product);
    }
  }
  for (const requireNewBrand of [true, false]) {
    while (chosen.length < 10) {
      const next = ranked.filter(({ product }) => !chosen.some(p => p.id === product.id) && (!requireNewBrand || !usedBrands.has(product.brand)))
        .map(item => ({ ...item, adjustedScore: item.score - (usedCategories.get(category(item.product)) || 0) * (slug === 'gifts' ? 4 : 12) }))
        .sort((a, b) => b.adjustedScore - a.adjustedScore || a.product.id.localeCompare(b.product.id))[0];
      if (!next) break;
      add(next.product);
    }
  }
  return chosen;
}

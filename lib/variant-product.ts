import type {Product,Variant} from './catalog-types';

// A URL may only select a variant belonging to this product.
export function resolveProductVariant(product:Product, variantId?:string) {
  return product.variants.find(variant=>variant.id===variantId)||product.variants[0];
}

export function variantProductUrl(product:Product, variant:Variant) {
  return `/product/${encodeURIComponent(product.id)}?variant=${encodeURIComponent(variant.id)}`;
}

export function variantProductName(product:Product, variant:Variant) {
  const normalize=(value:string)=>value.toLocaleLowerCase('ru').replace(/\s+/g,'');
  const name=product.brand&&!normalize(product.name).includes(normalize(product.brand))
    ? `${product.brand} ${product.name}` : product.name;
  const label=variant.label.trim();
  if(!label||['стандарт','стандартный','один вариант'].includes(label.toLocaleLowerCase('ru')))return name;
  const description=product.decant&&variant.format!=='Флакон'?`Отливант ${label}`:label;
  return normalize(name).includes(normalize(description))?name:`${name} · ${description}`;
}

export type VerifiedStock='unknown'|'available'|'unavailable';
// Imported availability text is historical. Only a future verified integration may
// supply stock; until then no card promises availability from that string.
export function variantPurchaseState(variant:Variant, stock:VerifiedStock='unknown') {
  const priced=typeof variant.price==='number'&&Number.isFinite(variant.price)&&variant.price>0;
  return {canAdd:priced&&stock!=='unavailable',waiting:!priced||stock==='unavailable',stock};
}

import records from '../data/product-content.json' with {type:'json'};
import type {Product} from './catalog-types';

export type ProductContent={
  productId:string;description:string|null;ingredients:string|null;usage:string|null;
  sources:{url:string;title:string;fields:string[];checkedAt:string}[];
};
export function getProductContent(product:Product) {
  const data=records as Record<string,ProductContent>;
  return Object.fromEntries(product.variants.filter(v=>data[v.id]?.productId===product.id).map(v=>[v.id,data[v.id]]));
}

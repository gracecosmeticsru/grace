import images from '../data/variant-product-images.json' with {type:'json'};
import legacyImages from '../data/product-images.json' with {type:'json'};
import type {Product,Variant} from './catalog-types';

// Legacy photographs also belong to one exact variant, never the whole family.
const legacyVariants:Record<string,string>={gc002705:'gc002705',gc003374:'gc003374','perf-0139':'perf-0139-f96f25b0'};
export function productMedia(product:Product,variant?:Variant) {
  if(!variant||!product.variants.some(v=>v.id===variant.id))return null;
  const image=(images as Record<string,{productId:string;src:string}>)[variant.id];
  if(image?.productId===product.id)return {src:image.src,prepared:true};
  const src=legacyVariants[product.id]===variant.id?(legacyImages as Record<string,string>)[product.id]:null;
  return src?{src,prepared:false}:null;
}

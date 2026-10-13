import rawProducts from '@/data/products.json';
import rawNavigation from '@/data/navigation.json';
import rawBrands from '@/data/brands.json';
import summary from '@/data/summary.json';
import productImages from '@/data/product-images.json';
import type { Product, NavNode, Brand, CatalogFilters, CatalogResult, VariantCatalogItem, VariantCatalogResult } from './catalog-types';
export const products=(rawProducts as Product[]).map(p=>({...p,image:(productImages as Record<string,string>)[p.id]||p.image}));
export const navigation=rawNavigation as NavNode[];
export const brands=rawBrands as Brand[];
export {summary};
export const roots=navigation.filter(n=>!n.parent);
const norm=(s:string)=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').normalize('NFKC');
const searchable=new Map(products.map(p=>[p.id,norm([p.name,p.brand,...p.sourceSkus,...p.variants.map(v=>v.label+' '+(v.sku||''))].join(' '))]));
const productMap=new Map(products.map(p=>[p.id,p]));
const variantItems:VariantCatalogItem[]=products.flatMap(product=>product.variants.map(variant=>({product,variant})));
const variantSearchable=new Map(variantItems.map(({product,variant})=>[variant.id,norm([product.name,product.brand,variant.id,variant.label,variant.sku||''].join(' '))]));
export const variantNavigation=navigation.map(node=>({...node,count:products.reduce((count,p)=>count+(p.paths.some(path=>path===node.path||path.startsWith(node.path+'/'))?p.variants.length:0),0)}));
export const variantBrands=brands.map(brand=>({...brand,count:products.reduce((count,p)=>count+(p.brand===brand.name?p.variants.length:0),0)}));
const featuredBrands=['Anua','Celimax','Dr. Althea','Round Lab','Rare Beauty','Dior','Tom Ford','La Sultane de Saba','Sol de Janeiro','Hempz'];
const compareProducts=(sort?:string)=>(a:Product,b:Product)=>{
  if(sort==='name')return a.name.localeCompare(b.name,'ru');
  if(sort==='brand')return a.brand.localeCompare(b.brand,'ru')||a.name.localeCompare(b.name,'ru');
  const ai=featuredBrands.indexOf(a.brand),bi=featuredBrands.indexOf(b.brand);
  return (ai<0?999:ai)-(bi<0?999:bi)||b.variants.length-a.variants.length;
};
const matchesType=(p:Product,type?:string)=>type==='shade'?p.variants.some(v=>v.type==='Оттенок'):type==='volume'?p.variants.some(v=>v.type==='Объём')&&p.variants.length>1:type==='decant'?Boolean(p.decant):true;
export function getProduct(id:string){return productMap.get(id.toLowerCase());}
export function queryCatalog(f:CatalogFilters={}):CatalogResult{
  const words=norm(f.q||'').split(/\s+/).filter(Boolean);
  const ids=f.ids?new Set(f.ids):undefined;
  let found=products.filter(p=>(!f.path||p.paths.some(x=>x===f.path||x.startsWith(f.path+'/')))&&words.every(w=>searchable.get(p.id)!.includes(w))&&(!ids||ids.has(p.id)));
  const available=new Set(found.map(p=>p.brand));
  const facets=brands.filter(b=>available.has(b.name));
  const brandNames=(f.brand||'').split('|').filter(Boolean);
  if(brandNames.length)found=found.filter(p=>brandNames.includes(p.brand));
  found=found.filter(p=>matchesType(p,f.type));
  found.sort(compareProducts(f.sort));
  const total=found.length,pages=Math.max(1,Math.ceil(total/24)),page=Math.min(pages,Math.max(1,Math.floor(Number(f.page)||1)));
  return {products:found.slice((page-1)*24,page*24),total,page,pages,brands:facets};
}
export function queryVariantCatalog(f:CatalogFilters={}):VariantCatalogResult{
  const words=norm(f.q||'').split(/\s+/).filter(Boolean);
  const ids=f.ids?new Set(f.ids):undefined;
  let found=variantItems.filter(({product,variant})=>(!f.path||product.paths.some(path=>path===f.path||path.startsWith(f.path+'/')))&&(!ids||ids.has(product.id))&&words.every(word=>variantSearchable.get(variant.id)!.includes(word)));
  const counts=new Map<string,number>();
  for(const {product} of found)counts.set(product.brand,(counts.get(product.brand)||0)+1);
  const facets=brands.filter(b=>counts.has(b.name)).map(b=>({...b,count:counts.get(b.name)!}));
  const brandNames=(f.brand||'').split('|').filter(Boolean);
  found=found.filter(({product})=>(!brandNames.length||brandNames.includes(product.brand))&&matchesType(product,f.type));
  const compare=compareProducts(f.sort);
  found.sort((a,b)=>compare(a.product,b.product));
  const total=found.length,pages=Math.max(1,Math.ceil(total/24)),page=Math.min(pages,Math.max(1,Math.floor(Number(f.page)||1)));
  return {items:found.slice((page-1)*24,page*24),total,page,pages,brands:facets};
}
export function featured(path:string,count=8){
 const pool=products.filter(p=>!path||p.paths.some(x=>x===path||x.startsWith(path+'/')));
 const picked:Product[]=[];const used=new Set<string>();
 for(const p of pool)if(!used.has(p.brand)){picked.push(p);used.add(p.brand);}
 for(const p of pool)if(!picked.includes(p))picked.push(p);
 return picked.slice(0,count);
}

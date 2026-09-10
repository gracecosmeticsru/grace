import rawProducts from '@/data/products.json';
import rawNavigation from '@/data/navigation.json';
import rawBrands from '@/data/brands.json';
import summary from '@/data/summary.json';
import productImages from '@/data/product-images.json';
import type { Product, NavNode, Brand, CatalogFilters, CatalogResult } from './catalog-types';
export const products=(rawProducts as Product[]).map(p=>({...p,image:(productImages as Record<string,string>)[p.id]||p.image}));
export const navigation=rawNavigation as NavNode[];
export const brands=rawBrands as Brand[];
export {summary};
export const roots=navigation.filter(n=>!n.parent);
const norm=(s:string)=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').normalize('NFKC');
const searchable=new Map(products.map(p=>[p.id,norm([p.name,p.brand,...p.sourceSkus,...p.variants.map(v=>v.label+' '+(v.sku||''))].join(' '))]));
const productMap=new Map(products.map(p=>[p.id,p]));
export function getProduct(id:string){return productMap.get(id.toLowerCase());}
export function queryCatalog(f:CatalogFilters={}):CatalogResult{
  const words=norm(f.q||'').split(/\s+/).filter(Boolean);
  let found=products.filter(p=>(!f.path||p.paths.some(x=>x===f.path||x.startsWith(f.path+'/')))&&words.every(w=>searchable.get(p.id)!.includes(w))&&(!f.ids||f.ids.includes(p.id)));
  const available=new Set(found.map(p=>p.brand));
  const facets=brands.filter(b=>available.has(b.name));
  const brandNames=(f.brand||'').split('|').filter(Boolean);
  if(brandNames.length)found=found.filter(p=>brandNames.includes(p.brand));
  if(f.type==='shade')found=found.filter(p=>p.variants.some(v=>v.type==='Оттенок'));
  if(f.type==='volume')found=found.filter(p=>p.variants.some(v=>v.type==='Объём')&&p.variants.length>1);
  if(f.type==='decant')found=found.filter(p=>p.decant);
  const featuredBrands=['Anua','Celimax','Dr. Althea','Round Lab','Rare Beauty','Dior','Tom Ford','La Sultane de Saba','Sol de Janeiro','Hempz'];
  if(f.sort==='name')found.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  else if(f.sort==='brand')found.sort((a,b)=>a.brand.localeCompare(b.brand,'ru')||a.name.localeCompare(b.name,'ru'));
  else found.sort((a,b)=>{
    const ai=featuredBrands.indexOf(a.brand),bi=featuredBrands.indexOf(b.brand);
    return (ai<0?999:ai)-(bi<0?999:bi)||b.variants.length-a.variants.length;
  });
  const total=found.length,pages=Math.max(1,Math.ceil(total/24)),page=Math.min(pages,Math.max(1,Math.floor(Number(f.page)||1)));
  return {products:found.slice((page-1)*24,page*24),total,page,pages,brands:facets};
}
export function featured(path:string,count=8){
 const pool=products.filter(p=>!path||p.paths.some(x=>x===path||x.startsWith(path+'/')));
 const picked:Product[]=[];const used=new Set<string>();
 for(const p of pool)if(!used.has(p.brand)){picked.push(p);used.add(p.brand);}
 for(const p of pool)if(!picked.includes(p))picked.push(p);
 return picked.slice(0,count);
}

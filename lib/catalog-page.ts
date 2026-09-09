import type {CatalogFilters} from './catalog-types';
export type PageQuery=Record<string,string|string[]|undefined>;
export function parseFilters(q:PageQuery,path?:string):CatalogFilters{
 const one=(k:string)=>typeof q[k]==='string'?q[k] as string:undefined;
 return {path,q:one('q'),brand:one('brand'),sort:one('sort'),type:one('type'),page:Number(one('page'))||1};
}

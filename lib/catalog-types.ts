export type Variant={id:string;sku:string|null;label:string;type:string;price:number|null;availability:string;format?:string};
export type Product={id:string;slug:string;name:string;brand:string;paths:string[];variants:Variant[];image:string|null;decant?:boolean;sourceSkus:string[]};
export type NavNode={path:string;name:string;label:string;parent:string|null;count:number};
export type Brand={name:string;slug:string;count:number};
export type CatalogResult={products:Product[];total:number;page:number;pages:number;brands:Brand[]};
export type VariantCatalogItem={product:Product;variant:Variant};
export type VariantCatalogResult={items:VariantCatalogItem[];total:number;page:number;pages:number;brands:Brand[]};
export type CatalogFilters={q?:string;path?:string;brand?:string;sort?:string;type?:string;page?:number;ids?:string[]};

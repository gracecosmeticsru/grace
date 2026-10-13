import {notFound} from 'next/navigation';
import CatalogView from '@/components/catalog-view';
import {queryVariantCatalog,variantNavigation,brands} from '@/lib/catalog';
import {parseFilters,type PageQuery} from '@/lib/catalog-page';
type Props={params:Promise<{slug:string}>;searchParams:Promise<PageQuery>};
export async function generateMetadata({params}:Props){const {slug}=await params;return {title:brands.find(b=>b.slug===slug)?.name||'Бренд'};}
export default async function Brand({params,searchParams}:Props){const {slug}=await params;const b=brands.find(b=>b.slug===slug);if(!b)notFound();const filters={...parseFilters(await searchParams),brand:b.name};return <CatalogView title={b.name} result={queryVariantCatalog(filters)} nodes={variantNavigation} filters={filters}/>;}

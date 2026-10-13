import {notFound} from 'next/navigation';
import CatalogView from '@/components/catalog-view';
import {queryVariantCatalog,variantNavigation as navigation} from '@/lib/catalog';
import {parseFilters,type PageQuery} from '@/lib/catalog-page';
type Props={params:Promise<{path:string[]}>;searchParams:Promise<PageQuery>};
export async function generateMetadata({params}:Props){const {path}=await params;return {title:navigation.find(n=>n.path===path.join('/'))?.name||'Каталог'};}
export default async function Category({params,searchParams}:Props){const {path}=await params;const node=navigation.find(n=>n.path===path.join('/'));if(!node)notFound();const filters=parseFilters(await searchParams,node.path);return <CatalogView result={queryVariantCatalog(filters)} nodes={navigation} filters={filters} node={node}/>;}

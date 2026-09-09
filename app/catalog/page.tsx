import CatalogView from '@/components/catalog-view';
import {queryCatalog} from '@/lib/catalog';
import {parseFilters,type PageQuery} from '@/lib/catalog-page';
export const metadata={title:'Каталог'};
export default async function Catalog({searchParams}:{searchParams:Promise<PageQuery>}){const filters=parseFilters(await searchParams);return <CatalogView result={queryCatalog(filters)} filters={filters}/>;}

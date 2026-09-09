import CatalogView from '@/components/catalog-view';
import {queryCatalog} from '@/lib/catalog';
import {parseFilters,type PageQuery} from '@/lib/catalog-page';
export const metadata={title:'Поиск'};
export default async function Search({searchParams}:{searchParams:Promise<PageQuery>}){const filters=parseFilters(await searchParams);return <CatalogView title="Найти своё" result={queryCatalog(filters)} filters={filters}/>;}

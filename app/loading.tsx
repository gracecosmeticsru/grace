import {Skeleton} from '@/components/ui/skeleton';
export default function Loading(){return <main id="main" className="wrap page-loading" aria-busy="true" aria-label="Загружаем страницу"><p role="status">Загружаем товары…</p><Skeleton className="h-10 w-64"/><div className="product-grid">{[1,2,3,4].map(n=><Skeleton key={n} className="h-80"/>)}</div></main>;}

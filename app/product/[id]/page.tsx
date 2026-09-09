import {notFound} from 'next/navigation';
import {getProduct,queryCatalog,navigation} from '@/lib/catalog';
import ProductDetail from '@/components/product-detail';
type Props={params:Promise<{id:string}>};
export async function generateMetadata({params}:Props){const {id}=await params;const p=getProduct(id);return {title:p?.name||'Товар',description:p?`${p.name}. ${p.variants.length>1?'Выбор объёма или оттенка в карточке. ':''}Каталог Grace Cosmetics.`:undefined};}
export default async function Product({params}:Props){const {id}=await params;const p=getProduct(id);if(!p)notFound();const parts=(p.paths[0]||'').split('/');const trail=parts.map((_,i)=>navigation.find(n=>n.path===parts.slice(0,i+1).join('/'))).filter(Boolean) as typeof navigation;const related=queryCatalog({path:p.paths[0]}).products.filter(x=>x.id!==p.id).slice(0,4);return <ProductDetail key={p.id} product={p} trail={trail} related={related}/>;}

import {notFound} from 'next/navigation';
import {getProduct,queryCatalog,navigation} from '@/lib/catalog';
import {defaultCardVariant} from '@/lib/home-variants';
import ProductDetail from '@/components/product-detail';
import {getProductContent} from '@/lib/product-content';
type Props={params:Promise<{id:string}>;searchParams:Promise<{variant?:string|string[]}>};
export async function generateMetadata({params}:Props){const {id}=await params;const p=getProduct(id);return {title:p?.name||'Товар',description:p?`${p.name}. ${p.variants.length>1?'Выбор объёма или оттенка в карточке. ':''}Каталог Grace Cosmetics.`:undefined};}
export default async function Product({params,searchParams}:Props){const {id}=await params;const p=getProduct(id);if(!p)notFound();const query=await searchParams;const requested=typeof query.variant==='string'?query.variant:undefined;const initialVariantId=p.variants.find(v=>v.id===requested)?.id||p.variants[0]?.id;const parts=(p.paths[0]||'').split('/');const trail=parts.map((_,i)=>navigation.find(n=>n.path===parts.slice(0,i+1).join('/'))).filter(Boolean) as typeof navigation;const related=queryCatalog({path:p.paths[0]}).products.filter(item=>item.id!==p.id).slice(0,4).map(product=>({product,variant:defaultCardVariant(product)}));return <ProductDetail key={p.id+':'+initialVariantId} product={p} trail={trail} related={related} initialVariantId={initialVariantId} contentByVariant={getProductContent(p)}/>;}



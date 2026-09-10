import Storefront from '@/components/storefront';
import {featured,brands,products,getProduct} from '@/lib/catalog';
export default function Home(){
 const ids=['gc002705','gc003374','perf-0139','gc005173','gc001774','parent-0012','parent-0007','gc002344','gc004334','parent-0215'];
 const highlights=ids.map(getProduct).filter((p):p is NonNullable<typeof p>=>Boolean(p));
 return <Storefront highlights={highlights} brands={brands} brandProducts={products.filter(p=>p.brand==='Anua').slice(0,10)} selections={{skincare:featured('skincare',10),makeup:featured('makeup',10),fragrance:featured('fragrance',10),hair:featured('hair',10),body:featured('body',10),discover:[...featured('skincare/extra',5),...featured('makeup/lips',5)]}}/>;
}

import Storefront from '@/components/storefront';
import {HomeJournal} from '@/components/journal';
import {featured,products,getProduct} from '@/lib/catalog';
import {graceCollections} from '@/lib/grace-collections';
import photoSources from '@/docs/step05a-photo-sources.json';
import {variantProductName} from '@/lib/variant-product';
export default function Home(){
 const ids=['gc002705','gc003374','perf-0139','gc005173','gc001774','parent-0012','parent-0007','gc002344','gc004334','parent-0215'];
 const highlights=ids.map(getProduct).filter((p):p is NonNullable<typeof p>=>Boolean(p));
 const collectionPhotos=Object.fromEntries(graceCollections.map(collection=>[collection.slug,collection.items.flatMap(([productId,variantId])=>{
  const photo=photoSources.find(item=>item.productId===productId&&item.variantId===variantId);
  const product=getProduct(productId),variant=product?.variants.find(item=>item.id===variantId);
  return photo&&product&&variant?[{src:'/'+photo.publicPath.replace(/^public\//,''),alt:variantProductName(product,variant)}]:[];
 })]));
 return <Storefront journal={<HomeJournal/>} highlights={highlights} collectionPhotos={collectionPhotos} brandProducts={products.filter(p=>p.brand==='Anua').slice(0,10)} selections={{skincare:featured('skincare',10),makeup:featured('makeup',10),fragrance:featured('fragrance',10),hair:featured('hair',10),body:featured('body',10)}}/>;
}

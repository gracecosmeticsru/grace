"use client";
import Link from '@/components/site-link';
import {useEffect,useState,type ReactNode} from 'react';
import {ChevronRight} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import ProductRail from './product-rail';
import Hero from './hero';
import AutumnEditorialPromo from './autumn-editorial-promo';
import GraceCollections from './brand-focus';
import type {CollectionPhoto} from './brand-focus';
import styles from './brand-focus.module.css';
import CategoryIcon from './category-icon';
import type {Product} from '@/lib/catalog-types';
import nodes from '@/data/navigation.json';
import {readSavedProducts,savedProductId,savedProductKey,shopKeys} from '@/lib/shop-state';
import type {SavedProduct} from '@/lib/shop-state';
import {SavedProductCard,useSavedProducts} from './saved-products';

type HomeProps={selections:Record<string,Product[]>;collectionPhotos:Record<string,CollectionPhoto[]>;highlights:Product[];brandProducts:Product[];journal:ReactNode};
const labels:Record<string,string>={skincare:'Уход за лицом',makeup:'Макияж',fragrance:'Парфюмерия',hair:'Волосы',body:'Тело'};
function ViewMore({href,label='Смотреть все'}:{href:string;label?:string}){return <div className="view-more"><Link href={href} className="button secondary">{label}<ChevronRight size={17}/></Link></div>;}
function RecentViewed(){
 const [items,setItems]=useState<SavedProduct[]>([]);
 useEffect(()=>{setItems(readSavedProducts(shopKeys.viewed,12));},[]);
 const {products,loading,error,retry}=useSavedProducts(items);
 return items.length>0?<section className="wrap home-section"><div className="section-heading"><h2>Вы недавно смотрели</h2></div>{error?<div role="status"><p>Не получилось загрузить просмотренные товары.</p><button type="button" className="button secondary" onClick={retry}>Повторить</button></div>:loading?<p role="status">Загружаем просмотренные товары…</p>:<ProductRail label="Недавно просмотренные">{items.map((entry,index)=><div className="rail-item" role="group" aria-roledescription="slide" key={savedProductKey(entry)+index}><SavedProductCard entry={entry} product={products.find(product=>product.id===savedProductId(entry))}/></div>)}</ProductRail>}</section>:null;
}
export default function Storefront({selections,collectionPhotos,highlights,brandProducts,journal}:HomeProps){
 const [category,setCategory]=useState('skincare');
 return <main id="main"><h1 className="sr-only">Grace Cosmetics — косметика и парфюмерия</h1>
 <Hero/>
 <div className="wrap"><nav className="category-shortcuts" aria-label="Быстрый выбор категории">{nodes.filter(n=>!n.parent).map(n=><Link key={n.path} href={'/catalog/'+n.path}><span className={'shortcut-icon icon-'+n.path}><CategoryIcon name={n.path} size={30}/></span><span>{n.name}</span></Link>)}<Link href="/catalog/skincare/extra/7"><span className="shortcut-icon"><CategoryIcon name="spf" size={30}/></span><span>SPF</span></Link><Link href="/catalog/makeup/more/2"><span className="shortcut-icon"><CategoryIcon name="sets" size={30}/></span><span>Наборы</span></Link></nav>
 <AutumnEditorialPromo/></div>
 <section className="wrap home-section" id="grace-picks"><div className="section-heading"><h2>Из наших рилс</h2></div><ProductRail products={highlights} label="Из наших рилс"/><ViewMore href="/catalog" label="Перейти в каталог"/></section>
 <GraceCollections photos={collectionPhotos}/>
 <section className="wrap home-section"><div className="section-heading"><h2>Наши подборки</h2></div><Tabs value={category} onValueChange={setCategory}><TabsList variant="line" className="home-tabs">{Object.entries(labels).map(([k,v])=><TabsTrigger value={k} key={k}>{v}</TabsTrigger>)}</TabsList>{Object.keys(labels).map(k=><TabsContent value={k} key={k}><ProductRail products={selections[k]||[]} label={labels[k]}/></TabsContent>)}</Tabs><ViewMore href={'/catalog/'+category}/></section>
 <section className="wrap home-section" aria-label="Бренд Anua"><div className={styles.anua}><div className={styles.anuaCopy}><span>BRAND FOCUS</span><h2>Anua</h2><p>Соберите ежедневный уход</p><Link href="/brands/anua" className="text-link">Все средства Anua <ChevronRight size={17}/></Link></div><img className={styles.anuaPhoto} src="/images/anua-cleansing-oil-200ml.jpg" alt="Anua Heartleaf Pore Control Cleansing Oil, 200 мл" loading="lazy" decoding="async"/></div><ProductRail products={brandProducts} label="Средства Anua"/></section>
 <section className="wrap home-section"><div className="section-heading"><h2>Парфюмерия</h2><Link href="/catalog/fragrance" className="text-link">Все ароматы <ChevronRight size={17}/></Link></div><ProductRail products={selections.fragrance} label="Парфюмерия"/></section>
 {journal}
 <RecentViewed/>
 </main>;
}

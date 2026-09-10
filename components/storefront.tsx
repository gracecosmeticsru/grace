"use client";
import Link from '@/components/site-link';
import {useEffect,useState} from 'react';
import {ChevronRight,FlaskConical,Heart} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import ProductRail from './product-rail';
import Hero from './hero';
import CategoryIcon from './category-icon';
import {ProductImage} from './product-card';
import type {Product,Brand} from '@/lib/catalog-types';
import nodes from '@/data/navigation.json';

type HomeProps={selections:Record<string,Product[]>;brands:Brand[];highlights:Product[];brandProducts:Product[]};
const labels:Record<string,string>={skincare:'Уход за лицом',makeup:'Макияж',fragrance:'Парфюмерия',hair:'Волосы',body:'Тело'};
function ViewMore({href,label='Смотреть все'}:{href:string;label?:string}){return <div className="view-more"><Link href={href} className="button secondary">{label}<ChevronRight size={17}/></Link></div>;}
function RecentViewed(){
 const [items,setItems]=useState<Product[]>([]);
 useEffect(()=>{let ids:string[]=[];try{ids=JSON.parse(localStorage.getItem('grace-viewed')||'[]');}catch{}if(!Array.isArray(ids)||!ids.length)return;const ctrl=new AbortController();fetch('/api/catalog?ids='+encodeURIComponent(ids.slice(0,12).join(',')),{signal:ctrl.signal}).then(async r=>r.ok?await r.json() as {products:Product[]}:null).then(r=>{if(r?.products)setItems(ids.map(id=>r.products.find((p:Product)=>p.id===id)).filter((p):p is Product=>Boolean(p)));}).catch(()=>{});return()=>ctrl.abort();},[]);
 return items.length>0?<section className="wrap home-section"><div className="section-heading"><h2>Вы недавно смотрели</h2></div><ProductRail products={items} label="Недавно просмотренные"/></section>:null;
}
export default function Storefront({selections,brands,highlights,brandProducts}:HomeProps){
 const [category,setCategory]=useState('skincare');
 const featureBrands=[{name:'Anua',id:'gc002705',note:'Очищение и ежедневный уход',tone:'mint'},{name:'Rare Beauty',id:'gc003374',note:'Тинты, румяна и макияж',tone:'pink'},{name:'Tom Ford',id:'perf-0139',note:'Ароматы и форматы',tone:'sand'}];
 return <main id="main"><h1 className="sr-only">Grace Cosmetics — косметика и парфюмерия</h1><div className="utility-strip wrap"><span><FlaskConical size={17}/>Уход, макияж и парфюмерия</span><a href="/brands"><Heart size={17}/>{brands.length} брендов в каталоге <ChevronRight size={14}/></a></div>
 <Hero/>
 <div className="wrap"><nav className="category-shortcuts" aria-label="Быстрый выбор категории">{nodes.filter(n=>!n.parent).map(n=><Link key={n.path} href={'/catalog/'+n.path}><span className={'shortcut-icon icon-'+n.path}><CategoryIcon name={n.path} size={30}/></span><span>{n.name}</span></Link>)}<Link href="/catalog/skincare/extra/7"><span className="shortcut-icon"><CategoryIcon name="spf" size={30}/></span><span>SPF</span></Link><Link href="/catalog/makeup/more/2"><span className="shortcut-icon"><CategoryIcon name="sets" size={30}/></span><span>Наборы</span></Link></nav>
 <a href="/catalog/fragrance/personal/3" className="wide-promo"><div><strong>Знакомство с ароматами начинается с малого</strong><span>Отливанты 5, 10, 20 и 30 мл</span></div><CategoryIcon name="fragrance" size={42}/><ChevronRight size={23}/></a></div>
 <section className="wrap home-section" id="grace-picks"><div className="section-heading"><h2>Выбор Grace</h2></div><ProductRail products={highlights} label="Выбор Grace"/><ViewMore href="/catalog" label="Перейти в каталог"/></section>
 <section className="wrap home-section"><div className="section-heading"><h2>Бренды в фокусе</h2><Link href="/brands" className="text-link">Все бренды <ChevronRight size={17}/></Link></div><div className="brand-features">{featureBrands.map(b=>{const p=highlights.find(p=>p.id===b.id);const brand=brands.find(x=>x.name===b.name);return brand?<Link href={'/brands/'+brand.slug} key={b.name} className="brand-feature"><div className={'brand-feature-image '+b.tone}>{p&&<ProductImage product={p}/>}</div><h3>{b.name}</h3><p>{b.note}</p><ChevronRight size={19}/></Link>:null;})}</div></section>
 <section className="wrap home-section"><div className="section-heading"><h2>Наши подборки</h2></div><Tabs value={category} onValueChange={setCategory}><TabsList variant="line" className="home-tabs">{Object.entries(labels).map(([k,v])=><TabsTrigger value={k} key={k}>{v}</TabsTrigger>)}</TabsList>{Object.keys(labels).map(k=><TabsContent value={k} key={k}><ProductRail products={selections[k]||[]} label={labels[k]}/></TabsContent>)}</Tabs><ViewMore href={'/catalog/'+category}/></section>
 <section className="wrap home-section"><div className="section-heading"><h2>Вам может понравиться</h2></div><ProductRail products={selections.discover||[]} label="Вам может понравиться"/><ViewMore href="/catalog"/></section>
 <section className="brand-spotlight home-section"><div className="wrap"><div className="spotlight-heading mint"><div><span>BRAND FOCUS</span><h2>Anua</h2><p>Соберите ежедневный уход</p><Link href="/brands/anua" className="text-link">Все средства Anua <ChevronRight size={17}/></Link></div><div className="spotlight-images">{highlights.filter(p=>p.brand==='Anua').slice(0,2).map(p=><ProductImage product={p} key={p.id}/>)}</div></div><ProductRail products={brandProducts} label="Средства Anua"/></div></section>
 <section className="wrap home-section"><div className="section-heading"><h2>Парфюмерия</h2><Link href="/catalog/fragrance" className="text-link">Все ароматы <ChevronRight size={17}/></Link></div><ProductRail products={selections.fragrance} label="Парфюмерия"/></section>
 <RecentViewed/>
 </main>;
}

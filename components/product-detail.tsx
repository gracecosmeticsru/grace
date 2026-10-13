"use client";
import Link from '@/components/site-link';
import {useEffect} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {Heart,ShoppingBag,ArrowUpRight,ChevronRight,ImageOff} from 'lucide-react';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {useShop,brandUrl} from './store-shell';
import {ProductImage} from './product-card';
import VariantProductCard from './variant-product-card';
import type {Product,NavNode,VariantCatalogItem} from '@/lib/catalog-types';
import {formatPrice,hasPrice} from '@/lib/pricing';
import {purchaseQuantityLimit,stockNotice} from '@/lib/demo-inventory';
import {productMedia} from '@/lib/product-media';
import {resolveProductVariant,variantProductName} from '@/lib/variant-product';
import type {ProductContent} from '@/lib/product-content';
import {favoriteMatches,rememberVariantViewed} from '@/lib/shop-state';
import styles from './product-detail.module.css';

type Props={product:Product;related:VariantCatalogItem[];trail:NavNode[];initialVariantId?:string;contentByVariant:Record<string,ProductContent>};
export default function ProductDetail({product:p,related,trail,initialVariantId,contentByVariant}:Props){
 const query=useSearchParams();
 const router=useRouter();
 const needsChoice=query.get('choose')==='1';
 const variant=needsChoice?undefined:resolveProductVariant(p,query.get('variant')||initialVariantId);
 const {favorites,toggleFavorite,addToBag,bag,ready}=useShop();
 const media=variant?productMedia(p,variant):null;
 const content=variant?contentByVariant[variant.id]:undefined;
 const saved=!!variant&&favoriteMatches(favorites,p.id,variant.id);
 const atLimit=!!variant&&(bag.find(line=>line.variant.id===variant.id)?.quantity||0)>=purchaseQuantityLimit;
 const isShade=p.variants.some(v=>v.type==='Оттенок');
 useEffect(()=>{if(variant)rememberVariantViewed(p,variant);},[p,variant]);
 function selectVariant(id:string){
  if(!p.variants.some(v=>v.id===id)||(!needsChoice&&variant?.id===id))return;
  const url=new URL(window.location.href);url.searchParams.set('variant',id);url.searchParams.delete('choose');
  router.push(url.pathname+url.search+url.hash,{scroll:false});
 }
 return <main id="main" className={'wrap detail-main '+styles.main}>
  <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><ChevronRight/><Link href="/catalog">Каталог</Link>{trail.map(n=><span key={n.path}><ChevronRight/><Link href={'/catalog/'+n.path}>{n.name}</Link></span>)}</nav>
  <div className={styles.layout} data-product-id={p.id} data-variant-id={variant?.id}>
   <div className={styles.gallery}>
    <div className={styles.image}>{variant?<ProductImage product={p} variant={variant} large/>:<div className="image-placeholder large"><ImageOff strokeWidth={1}/><span>Выберите вариант</span></div>}</div>
    {p.decant&&variant?.format!=='Флакон'&&media&&<p className={styles.caption}>На фото — оригинальный флакон. Отливант поставляется в отдельном атомайзере.</p>}
   </div>
   <section className={styles.copy} aria-label="Информация о товаре">
    {p.brand&&<p className={styles.brand}>{p.brand}</p>}
    <h1 className={styles.title}>{variant?variantProductName(p,variant):p.name}</h1>
    <div className={styles.price}><strong>{variant?formatPrice(variant.price):'Выберите вариант'}</strong></div>
    <p className={styles.stock}>{stockNotice}</p>
    {needsChoice&&<p className={styles.choice} role="status">В старой записи вариант не сохранён. Выберите нужный объём или оттенок.</p>}
    <div className={styles.variantHeading}><span>{isShade?'Оттенок':p.decant||p.variants.some(v=>v.type==='Объём')?'Объём':'Вариант'}{variant&&<>: <strong>{variant.label}</strong></>}</span>{p.variants.length>1&&<span>{p.variants.length} на выбор</span>}</div>
    <RadioGroup className={styles.options} value={variant?.id||''} onValueChange={selectVariant} aria-label={isShade?'Выберите оттенок':'Выберите вариант товара'}>{p.variants.map(v=><label key={v.id} className={styles.option+(variant?.id===v.id?' '+styles.selected:'')}><RadioGroupItem value={v.id} className="sr-only"/><span>{v.label}</span></label>)}</RadioGroup>
    {p.decant&&<p className={styles.caption}>Отливант — аромат в отдельном атомайзере. Доступность полноразмерного флакона уточняется отдельно.</p>}
    <div className={styles.actions}>
     <button type="button" className={'button primary '+styles.buy} onClick={()=>variant&&addToBag(p,variant)} disabled={!variant||!hasPrice(variant.price)||!ready||atLimit} data-buy-variant={variant?.id}><ShoppingBag size={18}/>{!variant?'Выберите вариант':!hasPrice(variant.price)?'Добавить в лист ожидания':atLimit?'В корзине':'Купить'}</button>
     <button type="button" className={styles.favorite} disabled={!ready||!variant} onClick={()=>variant&&toggleFavorite(p,variant)} aria-label={saved?'Убрать из избранного':'Добавить в избранное'} aria-pressed={saved}><Heart fill={saved?'currentColor':'none'} strokeWidth={1.5}/></button>
    </div>
    {variant&&!hasPrice(variant.price)&&<p className={styles.caption}>Подписка в WhatsApp пока недоступна.</p>}
    <p className={styles.sku}>Артикул: {variant?.sku||'—'}</p>
    <div className={styles.details} key={variant?.id||'choose'}>
     <details open><summary>Описание</summary><p>{needsChoice?'Выберите вариант, чтобы увидеть его описание.':content?.description||'Описание этого варианта пока не добавлено.'}</p></details>
     <details><summary>Способ применения</summary><p>{content?.usage||'Инструкция для этого варианта пока не добавлена.'}</p></details>
     <details><summary>Состав</summary><p>{content?.ingredients||'Полный состав этого варианта пока не подтверждён.'}</p>{content?.ingredients&&<small>Производитель может менять формулу. Перед применением проверьте состав на упаковке.</small>}</details>
     {p.brand&&<details><summary>Бренд</summary><p><Link href={brandUrl(p.brand)}>Все товары {p.brand} в Grace <ArrowUpRight size={14}/></Link></p></details>}
     {!!content?.sources.length&&<details><summary>Источники информации</summary><ul>{content.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={13}/></a></li>)}</ul></details>}
    </div>
   </section>
  </div>
  {related.length>0&&<section className={styles.related}><div className="section-heading"><h2>Ещё в этой категории</h2><Link className="text-link" href={'/catalog/'+(p.paths[0]||'')}>Смотреть все <ArrowUpRight size={18}/></Link></div><div className="product-grid related-grid">{related.map(({product,variant})=><VariantProductCard key={variant.id} product={product} variant={variant}/>)}</div></section>}
 </main>;
}

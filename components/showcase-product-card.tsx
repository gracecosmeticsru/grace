"use client";

import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Heart} from 'lucide-react';
import type {Product} from '@/lib/catalog-types';
import {showcaseAvailability,showcaseName,showcaseParameters,showcasePrice} from '@/lib/showcase-product';
import {useShop} from './store-shell';
import CategoryIcon from './category-icon';
import styles from './showcase-product-card.module.css';

function ShowcaseImage({product}:{product:Product}) {
  const src=product.image?.trim()||'';
  const [failedSource,setFailedSource]=useState('');
  const image=useRef<HTMLImageElement>(null);
  useEffect(()=>{
    if(src&&image.current?.complete&&image.current.naturalWidth===0)setFailedSource(src);
  },[src]);
  return src&&failedSource!==src
    ? <img ref={image} className={styles.image} src={src} alt={product.name} loading="lazy" decoding="async" onError={()=>setFailedSource(src)}/>
    : <div className={styles.fallback}><CategoryIcon name={product.decant?'fragrance':product.paths[0]?.split('/')[0]||'other'} size={42}/><span>Изображение недоступно</span></div>;
}

export default function ShowcaseProductCard({product,promotion}:{product:Product;promotion?:string}) {
  const {favorites,toggleFavorite,ready}=useShop();
  const saved=favorites.includes(product.id);
  const parameters=showcaseParameters(product);
  const price=showcasePrice(product.variants);
  const availability=showcaseAvailability(product.variants);
  const formats=product.decant?(product.variants.some(v=>v.format==='Флакон')?'Флакон и распив':'Распив'):null;
  return <article className={styles.card}>
    <a href={'/product/'+product.id} className={styles.link} aria-label={'Открыть товар: '+product.name}>
      <div className={styles.visual}>
        <ShowcaseImage product={product}/>
        {(promotion||formats)&&<span className={styles.badge}>{promotion||formats}</span>}
      </div>
      <div className={styles.copy}>
        <span className={styles.brand}>{product.brand||'Grace Cosmetics'}</span>
        <h3 className={styles.name} title={product.name}>{showcaseName(product)}</h3>
        <div className={styles.parameters} title={parameters.full||undefined}>{parameters.text}</div>
        <div className={styles.purchase}>
          <span className={styles.price} aria-label={price.text==='— ₽'?'Цена пока не указана':undefined}>{price.text}</span>
          <span className={styles.priceNote} title={price.note||undefined}>{price.note}</span>
          {availability&&<span className={styles.availability}>{availability}</span>}
        </div>
        <span className={styles.cta}>{product.variants.length>1?'Выбрать вариант':'Смотреть товар'}<ArrowUpRight size={17} strokeWidth={1.5}/></span>
      </div>
    </a>
    <button type="button" className={styles.favorite+(saved?' '+styles.saved:'')} onClick={()=>toggleFavorite(product.id)} disabled={!ready} aria-label={(saved?'Убрать из избранного: ':'В избранное: ')+product.name} aria-pressed={saved}><Heart size={21} strokeWidth={1.5} fill={saved?'currentColor':'none'}/></button>
  </article>;
}

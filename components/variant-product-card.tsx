"use client";

import {useEffect,useId,useRef,useState} from 'react';
import {Heart,ImageOff,ShoppingBag} from 'lucide-react';
import type {Product,Variant} from '@/lib/catalog-types';
import {formatPrice} from '@/lib/pricing';
import {variantProductName,variantProductUrl,variantPurchaseState} from '@/lib/variant-product';
import type {VerifiedStock} from '@/lib/variant-product';
import {demoInventory,purchaseQuantityLimit,stockNotice} from '@/lib/demo-inventory';
import {useShop} from './store-shell';
import styles from './variant-product-card.module.css';
import {productMedia} from '@/lib/product-media';
import {favoriteMatches} from '@/lib/shop-state';

export default function VariantProductCard({product,variant,stock='unknown',promotion}:{product:Product;variant:Variant;stock?:VerifiedStock;promotion?:string}) {
  const {favorites,toggleFavorite,addToBag,bag,ready}=useShop();
  const noteId=useId();
  const image=useRef<HTMLImageElement>(null);
  const [failedSource,setFailedSource]=useState('');
  const media=productMedia(product,variant);
  const source=media?.src||'';
  useEffect(()=>{if(source&&image.current?.complete&&image.current.naturalWidth===0)setFailedSource(source);},[source]);
  const name=variantProductName(product,variant);
  const href=variantProductUrl(product,variant);
  const saved=favoriteMatches(favorites,product.id,variant.id);
  const purchase=variantPurchaseState(variant,stock);
  const atLimit=(bag.find(line=>line.variant.id===variant.id)?.quantity||0)>=purchaseQuantityLimit;
  return <article className={styles.card} data-product-id={product.id} data-variant-id={variant.id}>
    <a href={href} className={styles.visual} draggable={false} aria-label={'Открыть товар: '+name}>
      {source&&failedSource!==source
        ? <img ref={image} className={styles.image+(media?.prepared?' '+styles.prepared:'')} src={source} alt={product.decant&&variant.format!=='Флакон'?`Оригинальный флакон ${product.name}`:name} loading="lazy" decoding="async" draggable={false} onError={()=>setFailedSource(source)}/>
        : <span className={styles.placeholder}><ImageOff size={36} strokeWidth={1}/><span>Фото пока нет</span></span>}
      {source&&failedSource!==source&&product.decant&&variant.format!=='Флакон'&&<span className={styles.imageNote}>На фото — флакон</span>}
      {promotion&&<span className={styles.badge}>{promotion}</span>}
    </a>
    <button type="button" className={styles.favorite+(saved?' '+styles.saved:'')} onClick={()=>toggleFavorite(product,variant)} disabled={!ready} aria-label={(saved?'Убрать из избранного: ':'В избранное: ')+name} aria-pressed={saved}><Heart size={21} strokeWidth={1.5} fill={saved?'currentColor':'none'}/></button>
    <div className={styles.copy}>
      <h3 className={styles.name}><a href={href}>{name}</a></h3>
      <div className={styles.purchase}>
        <span className={styles.price} aria-label={purchase.waiting&&variant.price===null?'Цена пока не указана':undefined}>{formatPrice(variant.price)}</span>
        {purchase.waiting
          ? <button type="button" className={styles.waiting} disabled aria-describedby={noteId}>Добавить в лист ожидания</button>
          : <button type="button" className={styles.buy} disabled={!ready||atLimit} aria-label={(atLimit?'В корзине: ':'Купить: ')+name} aria-describedby={noteId} onClick={()=>{if(purchase.canAdd)addToBag(product,variant);}}><ShoppingBag size={16}/>{atLimit?'В корзине':'Купить'}</button>}
        <span className={styles.note} id={noteId}>{purchase.waiting?<>{demoInventory.enabled&&<>{stockNotice}<br/></>}Подписка в WhatsApp пока недоступна</>:demoInventory.enabled?stockNotice:stock==='unknown'?'Наличие уточняется':'Наличие подтверждено'}</span>
      </div>
    </div>
  </article>;
}

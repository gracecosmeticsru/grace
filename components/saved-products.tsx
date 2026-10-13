"use client";

import {useEffect,useState} from 'react';
import {CircleHelp,Trash2} from 'lucide-react';
import Link from '@/components/site-link';
import type {Product} from '@/lib/catalog-types';
import {resolveSavedVariant,savedProductId} from '@/lib/shop-state';
import type {SavedProduct} from '@/lib/shop-state';
import {useShop} from './store-shell';
import VariantProductCard from './variant-product-card';
import styles from './variant-product-card.module.css';

// Callers paginate saved references first: at most 24 families fit one API page.
export function useSavedProducts(entries:SavedProduct[],ready=true){
 const ids=[...new Set(entries.map(savedProductId).filter(id=>/^[a-z0-9-]+$/.test(id)))].join(',');
 const [attempt,setAttempt]=useState(0);
 const request=ids+'#'+attempt;
 const [result,setResult]=useState<{request:string;products:Product[];error:boolean}|null>(null);
 useEffect(()=>{
  if(!ready||!ids)return;
  const controller=new AbortController();
  fetch('/api/catalog?ids='+encodeURIComponent(ids)+'&page=1',{signal:controller.signal})
   .then(async response=>{if(!response.ok)throw Error('Catalog unavailable');const data:unknown=await response.json();if(!data||typeof data!=='object'||!('products' in data)||!Array.isArray(data.products))throw Error('Invalid catalog');return data.products as Product[];})
   .then(products=>{if(!controller.signal.aborted)setResult({request,products,error:false});})
   .catch(error=>{if(error.name!=='AbortError'&&!controller.signal.aborted)setResult({request,products:[],error:true});});
  return()=>controller.abort();
 },[ids,ready,request]);
 const current=result?.request===request?result:null;
 return {products:current?.products||[],loading:!ready||Boolean(ids&&!current),error:Boolean(ids&&current?.error),retry:()=>setAttempt(value=>value+1)};
}

export function SavedProductCard({entry,product,removable=false}:{entry:SavedProduct;product?:Product;removable?:boolean}){
 const {removeFavorite,ready}=useShop();
 const variant=resolveSavedVariant(entry,product);
 if(product&&variant)return <VariantProductCard product={product} variant={variant}/>;
 const legacy=typeof entry==='string';
 const name=product?.name||'Сохранённый товар';
 const status=legacy?'Вариант не сохранён':'Сохранённый вариант недоступен';
 return <article className={styles.card} data-product-id={savedProductId(entry)} data-saved-kind={legacy?'legacy':'unavailable'}>
  <div className={styles.visual}><span className={styles.placeholder}><CircleHelp size={36} strokeWidth={1}/><span>{status}</span></span></div>
  {removable&&<button type="button" className={styles.favorite} onClick={()=>removeFavorite(entry)} disabled={!ready} aria-label={'Удалить сохранённую запись: '+name}><Trash2 size={20}/></button>}
  <div className={styles.copy}>
   <h3 className={styles.name}>{name}</h3>
   <div className={styles.purchase}>
    <span className={styles.note}>{product?status:'Товар не найден в каталоге'}</span>
    <Link className={styles.buy} href={product?`/product/${encodeURIComponent(product.id)}?choose=1`:'/catalog'}>{product?'Выбрать вариант':'Открыть каталог'}</Link>
    <span className={styles.note}>{product?'Выберите вариант, чтобы увидеть его фото и цену.':'Запись сохранена. Возможно, товар появится позже.'}</span>
   </div>
  </div>
 </article>;
}

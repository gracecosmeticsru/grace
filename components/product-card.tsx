"use client";
import {Heart,ImageOff,ArrowUpRight} from 'lucide-react';
import {useShop} from './store-shell';
import type {Product} from '@/lib/catalog-types';
export function ProductImage({product,large=false}:{product:Product;large?:boolean}){
 return product.image?<img src={product.image} alt={product.name} className="real-product-image" loading={large?'eager':'lazy'}/>:<div className={'image-placeholder '+(large?'large':'')}><ImageOff strokeWidth={1}/><span>Фото пока нет</span></div>;
}
export default function ProductCard({product:p}:{product:Product}){
 const {favorites,toggleFavorite}=useShop();const saved=favorites.includes(p.id);
 const options=p.variants.some(v=>v.type==='Оттенок')?'Оттенки':p.decant?'Объёмы':'Варианты';
 const brandIndex=p.brand?p.name.toLowerCase().indexOf(p.brand.toLowerCase()):-1;
 const short=brandIndex<0?p.name:(p.name.slice(0,brandIndex)+p.name.slice(brandIndex+p.brand.length)).trim();
 return <article className="product-card">
  <a href={'/product/'+p.id} className="product-card-link" aria-label={'Открыть товар: '+p.name}>
   <div className="product-visual"><ProductImage product={p}/>{p.decant&&<span className="product-badge">РАСПИВ</span>}<span className="quick-view">Смотреть товар <ArrowUpRight size={16}/></span></div>
   <div className="product-copy"><span className="product-brand">{p.brand||'Grace Cosmetics'}</span><span className="product-name">{short}</span><span className="product-options">{p.variants.length>1?`${options}: ${p.variants.length}`:p.variants[0]?.label!=='Стандарт'?p.variants[0]?.label:'Один вариант'}</span><span className="product-price">Цена по запросу</span></div>
  </a>
  <button className={'favorite-button '+(saved?'is-saved':'')} onClick={()=>toggleFavorite(p.id)} aria-label={(saved?'Убрать из избранного: ':'В избранное: ')+p.name} aria-pressed={saved}><Heart size={21} fill={saved?'currentColor':'none'} strokeWidth={1.6}/></button>
 </article>;
}

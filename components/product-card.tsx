"use client";
import Link from 'next/link';
import {Heart,ImageOff,ArrowUpRight} from 'lucide-react';
import {useShop} from './store-shell';
import type {Product} from '@/lib/catalog-types';
export function ProductImage({product,large=false}:{product:Product;large?:boolean}){
 return product.image?<img src={product.image} alt={product.name} className="real-product-image" loading={large?'eager':'lazy'}/>:<div className={'image-placeholder '+(large?'large':'')}><ImageOff strokeWidth={1}/><span>Фото скоро появится</span></div>;
}
export default function ProductCard({product:p}:{product:Product}){
 const {favorites,toggleFavorite}=useShop();const saved=favorites.includes(p.id);
 const type=p.variants.some(v=>v.type==='Оттенок')?'оттенков':p.decant?'объёмов':'вариантов';
 const short=p.brand?p.name.replace(new RegExp(p.brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),'').trim():p.name;
 return <article className="product-card"><div className="product-visual"><Link href={'/product/'+p.id} tabIndex={-1} aria-hidden="true"><ProductImage product={p}/></Link>{p.decant&&<span className="product-badge">В РАСПИВ</span>}<button className={'favorite-button '+(saved?'is-saved':'')} onClick={()=>toggleFavorite(p.id)} aria-label={(saved?'Убрать из избранного: ':'В избранное: ')+p.name} aria-pressed={saved}><Heart size={20} fill={saved?'currentColor':'none'} strokeWidth={1.5}/></button><Link className="quick-view" href={'/product/'+p.id}>Подробнее <ArrowUpRight size={16}/></Link></div>
  <div className="product-copy">{p.brand&&<span className="product-brand">{p.brand}</span>}<Link href={'/product/'+p.id} className="product-name">{short}</Link><div className="product-options">{p.variants.length>1?<span>{p.variants.length} {type}<span className="option-plus">+</span></span>:<span>{p.variants[0]?.label!=='Стандарт'?p.variants[0]?.label:' '}</span>}</div><Link className="product-price" href={'/product/'+p.id}>Цена по запросу <ArrowUpRight size={14}/></Link></div>
 </article>;
}

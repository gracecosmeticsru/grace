"use client";
import {ImageOff} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import type {Product,Variant} from '@/lib/catalog-types';
import {defaultCardVariant} from '@/lib/home-variants';
import {productMedia} from '@/lib/product-media';
import {variantProductName} from '@/lib/variant-product';
import VariantProductCard from './variant-product-card';
export function ProductImage({product,variant,large=false}:{product:Product;variant:Variant;large?:boolean}){
 const media=productMedia(product,variant);const [failed,setFailed]=useState('');const image=useRef<HTMLImageElement>(null);const source=media?.src;
 useEffect(()=>{if(source&&image.current?.complete&&image.current.naturalWidth===0)setFailed(source);},[source]);
 return media&&failed!==media.src?<img ref={image} src={media.src} alt={variantProductName(product,variant)} className={'real-product-image'+(media.prepared?' prepared-product-image':'')} loading={large?'eager':'lazy'} decoding="async" onError={()=>setFailed(media.src)}/>:<div className={'image-placeholder '+(large?'large':'')}><ImageOff strokeWidth={1}/><span>Фото пока нет</span></div>;
}
export default function ProductCard({product,promotion}:{product:Product;promotion?:string}){
 const variant=defaultCardVariant(product);
 return variant?<VariantProductCard product={product} variant={variant} promotion={promotion}/>:null;
}

"use client";
import {Carousel,CarouselContent,CarouselItem,CarouselPrevious,CarouselNext} from '@/components/ui/carousel';
import ProductCard from './product-card';
import ShowcaseProductCard from './showcase-product-card';
import type {Product} from '@/lib/catalog-types';
export default function ProductRail({products,label,appearance='default'}:{products:Product[];label:string;appearance?:'default'|'showcase'}){
 const Card=appearance==='showcase'?ShowcaseProductCard:ProductCard;
 return <Carousel opts={{align:'start',slidesToScroll:1}} className="product-rail" aria-label={label}><CarouselContent className="rail-track">{products.map(p=><CarouselItem className="rail-item" key={p.id}><Card product={p}/></CarouselItem>)}</CarouselContent><div className="rail-controls"><CarouselPrevious aria-label={'Предыдущие товары: '+label}/><CarouselNext aria-label={'Следующие товары: '+label}/></div></Carousel>;
}

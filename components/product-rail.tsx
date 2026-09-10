"use client";
import {Carousel,CarouselContent,CarouselItem,CarouselPrevious,CarouselNext} from '@/components/ui/carousel';
import ProductCard from './product-card';
import type {Product} from '@/lib/catalog-types';
export default function ProductRail({products,label}:{products:Product[];label:string}){
 return <Carousel opts={{align:'start',slidesToScroll:1}} className="product-rail" aria-label={label}><CarouselContent className="rail-track">{products.map(p=><CarouselItem className="rail-item" key={p.id}><ProductCard product={p}/></CarouselItem>)}</CarouselContent><div className="rail-controls"><CarouselPrevious aria-label={'Предыдущие товары: '+label}/><CarouselNext aria-label={'Следующие товары: '+label}/></div></Carousel>;
}

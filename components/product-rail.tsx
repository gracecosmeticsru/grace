"use client";
import {useEffect,useId,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent,ReactNode} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import ProductCard from './product-card';
import type {Product} from '@/lib/catalog-types';

type MouseDrag={pointerId:number;x:number;y:number;left:number;active:boolean};

export default function ProductRail({products=[],label,children}:{products?:Product[];label:string;children?:ReactNode}){
 const viewport=useRef<HTMLDivElement>(null);
 const track=useRef<HTMLDivElement>(null);
 const drag=useRef<MouseDrag|null>(null);
 const suppressClick=useRef(false);
 const viewportId=useId();
 const [canScroll,setCanScroll]=useState({previous:false,next:false});

 useEffect(()=>{
  const element=viewport.current;
  if(!element)return;
  const update=()=>{
   const maximum=element.scrollWidth-element.clientWidth;
   const next={previous:element.scrollLeft>1,next:element.scrollLeft<maximum-1};
   setCanScroll(old=>old.previous===next.previous&&old.next===next.next?old:next);
  };
  update();
  element.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;
  observer?.observe(element);
  if(track.current)observer?.observe(track.current);
  return ()=>{element.removeEventListener('scroll',update);window.removeEventListener('resize',update);observer?.disconnect();};
 },[products,children]);

 function positions(){
  const slides=Array.from(track.current?.children||[]) as HTMLElement[];
  const origin=slides[0]?.offsetLeft||0;
  const maximum=Math.max(0,(viewport.current?.scrollWidth||0)-(viewport.current?.clientWidth||0));
  return [...new Set(slides.map(slide=>Math.min(maximum,Math.max(0,slide.offsetLeft-origin))))];
 }
 function scrollTo(left:number){
  viewport.current?.scrollTo({left,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 function step(direction:-1|1){
  const current=viewport.current?.scrollLeft||0;
  const points=positions();
  const next=direction===1?points.find(point=>point>current+1):points.reverse().find(point=>point<current-1);
  if(next!==undefined)scrollTo(next);
 }

 function pointerDown(event:ReactPointerEvent<HTMLDivElement>){
  // Touch and pen use the browser's native scrolling: never capture or cancel them.
  suppressClick.current=false;
  if(event.pointerType!=='mouse'||event.button!==0||!event.isPrimary)return;
  if((event.target as HTMLElement).closest('button,input,select,textarea'))return;
  drag.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,left:event.currentTarget.scrollLeft,active:false};
 }
 function pointerMove(event:ReactPointerEvent<HTMLDivElement>){
  const gesture=drag.current;
  if(!gesture||gesture.pointerId!==event.pointerId)return;
  const dx=event.clientX-gesture.x;
  const dy=event.clientY-gesture.y;
  if(!gesture.active){
   if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;
   if(Math.abs(dy)>Math.abs(dx)){drag.current=null;return;}
   gesture.active=true;
   suppressClick.current=true;
   event.currentTarget.style.scrollSnapType='none';
   event.currentTarget.dataset.dragging='true';
   event.currentTarget.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
  event.currentTarget.scrollLeft=gesture.left-dx;
 }
 function pointerEnd(event:ReactPointerEvent<HTMLDivElement>){
  const gesture=drag.current;
  if(!gesture||gesture.pointerId!==event.pointerId)return;
  drag.current=null;
  if(!gesture.active)return;
  const element=event.currentTarget;
  const current=element.scrollLeft;
  const nearest=positions().reduce((best,point)=>Math.abs(point-current)<Math.abs(best-current)?point:best,0);
  delete element.dataset.dragging;
  element.style.removeProperty('scroll-snap-type');
  if(element.hasPointerCapture(event.pointerId))element.releasePointerCapture(event.pointerId);
  scrollTo(nearest);
 }

 return <div className="product-rail variant-rail" role="region" aria-roledescription="carousel" aria-label={label}>
  <div ref={viewport} id={viewportId} className="rail-viewport" data-slot="carousel-content" tabIndex={0} role="group" aria-label={'Прокрутка товаров: '+label}
   onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}
   onPointerLeave={()=>{if(!drag.current?.active)drag.current=null;}}
   onDragStart={event=>event.preventDefault()}
   onClickCapture={event=>{if(suppressClick.current&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
   onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();scrollTo(event.key==='Home'?0:event.currentTarget.scrollWidth);}}}>
   <div ref={track} className="rail-track">{children??products.map(product=><div className="rail-item" role="group" aria-roledescription="slide" key={product.id}><ProductCard product={product}/></div>)}</div>
  </div>
  <div className="rail-controls">
   <button type="button" className="icon-button" data-slot="carousel-previous" disabled={!canScroll.previous} onClick={()=>step(-1)} aria-controls={viewportId} aria-label={'Предыдущие товары: '+label}><ArrowLeft/></button>
   <button type="button" className="icon-button" data-slot="carousel-next" disabled={!canScroll.next} onClick={()=>step(1)} aria-controls={viewportId} aria-label={'Следующие товары: '+label}><ArrowRight/></button>
  </div>
 </div>;
}

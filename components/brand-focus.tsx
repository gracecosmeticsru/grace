"use client";

import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
import Link from '@/components/site-link';
import {graceCollections} from '@/lib/grace-collections';
import styles from './brand-focus.module.css';

export type CollectionPhoto={src:string;alt:string};

export default function GraceCollections({photos}:{photos:Record<string,CollectionPhoto[]>}) {
  const rail=useRef<HTMLDivElement>(null);
  const [edges,setEdges]=useState({previous:false,next:false});
  useEffect(()=>{
    const element=rail.current;
    if(!element)return;
    const update=()=>setEdges({previous:element.scrollLeft>1,next:element.scrollLeft<element.scrollWidth-element.clientWidth-1});
    update();
    element.addEventListener('scroll',update,{passive:true});
    const observer=new ResizeObserver(update);observer.observe(element);
    return()=>{element.removeEventListener('scroll',update);observer.disconnect();};
  },[]);
  const move=(direction:number)=>{
    const element=rail.current;
    if(element)element.scrollBy({left:direction*element.clientWidth*.8,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  return <section className={'wrap home-section '+styles.section} aria-labelledby="grace-collections-title">
    <div className="section-heading"><h2 id="grace-collections-title">Подборки от Grace</h2>
      <div className={styles.controls}>
        <button type="button" className="icon-button" disabled={!edges.previous} onClick={()=>move(-1)} aria-label="Предыдущие подборки" aria-controls="grace-collection-tiles"><ArrowLeft/></button>
        <button type="button" className="icon-button" disabled={!edges.next} onClick={()=>move(1)} aria-label="Следующие подборки" aria-controls="grace-collection-tiles"><ArrowRight/></button>
      </div>
    </div>
    <div id="grace-collection-tiles" ref={rail} className={styles.grid} role="region" aria-label="Тематические подборки Grace" tabIndex={0}>
      {graceCollections.map(collection=><Link key={collection.slug} href={'/collections/'+collection.slug} className={styles.card+' '+styles[collection.tone]}>
        <div className={styles.cover}>
          <div className={styles.copy}><span>{collection.line}</span><h3>{collection.title}</h3></div>
          <div className={styles.products}>{photos[collection.slug]?.map(photo=><img key={photo.src} src={photo.src} alt={photo.alt} loading="lazy" decoding="async" draggable={false}/>)}</div>
        </div>
        <span className={styles.cta}>Смотреть подборку <ArrowUpRight size={20}/></span>
      </Link>)}
    </div>
  </section>;
}

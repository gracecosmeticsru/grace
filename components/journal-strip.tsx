"use client";
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import styles from './journal.module.css';

export default function JournalStrip({children,label,kind}:{children:ReactNode;label:string;kind:'articles'|'brands'}) {
 const rail=useRef<HTMLDivElement>(null),id=useId();
 const [edges,setEdges]=useState({previous:false,next:false});
 useEffect(()=>{
  const element=rail.current;if(!element)return;
  const update=()=>setEdges({previous:element.scrollLeft>1,next:element.scrollLeft<element.scrollWidth-element.clientWidth-1});
  update();element.addEventListener('scroll',update,{passive:true});
  const observer=new ResizeObserver(update);observer.observe(element);
  return()=>{element.removeEventListener('scroll',update);observer.disconnect();};
 },[]);
 function move(direction:number){const element=rail.current;element?.scrollBy({left:direction*element.clientWidth*.8,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 return <div className={styles.strip}>
  <div id={id} ref={rail} className={styles[kind]} role="region" aria-label={label} tabIndex={0}
   onKeyDown={event=>{if(event.target!==event.currentTarget||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();event.currentTarget.scrollTo({left:event.key==='Home'?0:event.currentTarget.scrollWidth,behavior:'instant'});}
   }}>{children}</div>
  <div className={styles.controls}>
   <button type="button" className="icon-button" disabled={!edges.previous} onClick={()=>move(-1)} aria-controls={id} aria-label={'Назад: '+label}><ArrowLeft size={20}/></button>
   <button type="button" className="icon-button" disabled={!edges.next} onClick={()=>move(1)} aria-controls={id} aria-label={'Вперёд: '+label}><ArrowRight size={20}/></button>
  </div>
 </div>;
}

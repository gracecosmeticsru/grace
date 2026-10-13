"use client";
import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ArrowRight,ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import styles from './hero.module.css';

const luxuryMakeup='/catalog/makeup?brand='+encodeURIComponent('Dior|Chanel|Charlotte Tilbury|Tom Ford|Hourglass|Yves Saint Laurent|Givenchy|Giorgio Armani|Westman Atelier|Prada|Guerlain|Bobbi Brown');
const campaigns=[
 {id:'k-beauty',label:'K-Beauty',eyebrow:'КОРЕЙСКИЙ УХОД',title:['Твоё время','сиять.'],description:'Любимые средства для ежедневного ритуала.',cta:'Выбрать уход',href:'/collections/k-beauty',signature:'ANUA / BEAUTY OF JOSEON',photos:[
  {src:'/images/hero-real/anua-cleansing-oil-200ml.jpg',alt:'Anua Heartleaf Pore Control Cleansing Oil, 200 мл'},
  {src:'/images/hero-real/beauty-of-joseon-glow-serum-30ml.jpg',alt:'Beauty of Joseon Glow Serum, 30 мл'},
 ]},
 {id:'luxury',label:'Люкс',eyebrow:'ЛЮКС · МАКИЯЖ',title:['Красота','в деталях.'],description:'Оттенки, с которых начинается настроение.',cta:'Выбрать макияж',href:luxuryMakeup,signature:'TOM FORD / NUDE DIP',photos:[
  {src:'/images/hero-real/tom-ford-nude-dip-03.jpg',alt:'Палетка теней Tom Ford Eye Color Quad, 03 Nude Dip'},
 ]},
 {id:'autumn',label:'Осенний уход',eyebrow:'ОСЕННИЙ УХОД',title:['Сезон','заботы.'],description:'Добавь немного нежности в свой ежедневный уход.',cta:'Собрать уход',href:'/catalog/skincare/daily',signature:'BEAUTY OF JOSEON',photos:[
  {src:'/images/hero-real/beauty-of-joseon-dynasty-cream-50ml.jpg',alt:'Крем Beauty of Joseon Dynasty Cream, 50 мл'},
  {src:'/images/hero-real/beauty-of-joseon-glow-serum-30ml.jpg',alt:'Сыворотка Beauty of Joseon Glow Serum, 30 мл'},
 ]},
] as const;

export default function Hero(){
 const [viewport,api]=useEmblaCarousel({align:'start',loop:true,breakpoints:{'(prefers-reduced-motion: reduce)':{duration:0}}});
 const [current,setCurrent]=useState(0);
 const [paused,setPaused]=useState(false);
 const [hovered,setHovered]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(true);
 const [visible,setVisible]=useState(true);
 const trackId=useId();
 const slideLinks=useRef<Array<HTMLAnchorElement|null>>([]);
 const moveSlideFocus=useRef(false);
 useLayoutEffect(()=>{
  if(!moveSlideFocus.current)return;
  moveSlideFocus.current=false;
  slideLinks.current[current]?.focus({preventScroll:true});
 },[current]);
 useEffect(()=>{
  if(!api)return;
  const sync=()=>setCurrent(api.selectedScrollSnap());
  sync();api.on('select',sync);api.on('reInit',sync);
  return()=>{api.off('select',sync);api.off('reInit',sync);};
 },[api]);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion=()=>setReducedMotion(preference.matches);
  const syncVisibility=()=>setVisible(!document.hidden);
  syncMotion();syncVisibility();
  preference.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncVisibility);
  return()=>{preference.removeEventListener('change',syncMotion);document.removeEventListener('visibilitychange',syncVisibility);};
 },[]);
 useEffect(()=>{
  if(!api||paused||hovered||reducedMotion||!visible)return;
  const timer=window.setInterval(()=>api.scrollNext(),7000);
  return()=>window.clearInterval(timer);
 },[api,paused,hovered,reducedMotion,visible]);
 function step(direction:-1|1){setPaused(true);if(direction===1)api?.scrollNext(reducedMotion);else api?.scrollPrev(reducedMotion);}
 return <section className={styles.hero} aria-label="Главные подборки Grace Cosmetics" aria-roledescription="карусель"
  onFocusCapture={e=>{if(!(e.target instanceof Element)||!e.target.closest('[data-autoplay-toggle]')||e.target.matches(':focus-visible'))setPaused(true);}}
  onPointerDownCapture={e=>{if(!(e.target instanceof Element)||!e.target.closest('[data-autoplay-toggle]'))setPaused(true);}}
  onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true);}} onPointerLeave={e=>{if(e.pointerType==='mouse')setHovered(false);}}
  onKeyDown={e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveSlideFocus.current=!!api&&e.target instanceof Element&&!!e.target.closest('[aria-roledescription="слайд"]');step(e.key==='ArrowLeft'?-1:1);}}}>
  <div ref={viewport} className={styles.viewport}>
   <div id={trackId} className={styles.track}>
    {campaigns.map((campaign,index)=><div key={campaign.id} className={styles.slide} role="group" aria-roledescription="слайд" aria-label={`${index+1} из 3: ${campaign.label}`} aria-hidden={index!==current} inert={index!==current}>
     <a ref={link=>{slideLinks.current[index]=link;}} href={campaign.href} className={`${styles.banner} ${styles[campaign.id]}`} tabIndex={index===current?0:-1} draggable={false}>
      <div className={styles.copy}><span className={styles.eyebrow}>{campaign.eyebrow}</span><h2>{campaign.title[0]}<br/>{campaign.title[1]}</h2><p>{campaign.description}</p><span className={styles.cta}>{campaign.cta}<ArrowRight size={18}/></span></div>
      <div className={`${styles.scene} ${campaign.photos.length===1?styles.solo:''}`}>
       <span className={styles.halo} aria-hidden="true"/>
       {campaign.photos.map((photo,i)=><div className={`${styles.product} ${i===0?styles.first:styles.second}`} key={photo.src}>
        <img src={photo.src} alt={photo.alt} width={1000} height={1000} loading={index===0?'eager':'lazy'} fetchPriority={index===0&&i===0?'high':'auto'} draggable={false}/>
       </div>)}
       <span className={styles.signature}>{campaign.signature}</span>
      </div>
     </a>
    </div>)}
   </div>
  </div>
  <button type="button" className={`${styles.arrow} ${styles.previous}`} aria-label="Предыдущий баннер" aria-controls={trackId} onClick={()=>step(-1)} disabled={!api}><ChevronLeft size={23}/></button>
  <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Следующий баннер" aria-controls={trackId} onClick={()=>step(1)} disabled={!api}><ChevronRight size={23}/></button>
  <div className={styles.navigation}>
   <div className={styles.dots} aria-label="Выбрать баннер">{campaigns.map((campaign,index)=><button type="button" key={campaign.id} aria-label={`Показать баннер: ${campaign.label}`} aria-pressed={current===index} className={current===index?styles.selected:undefined} onClick={()=>{setPaused(true);api?.scrollTo(index,reducedMotion);}} disabled={!api}><span/></button>)}</div>
   <button type="button" data-autoplay-toggle className={styles.pause} aria-label={reducedMotion?'Автосмена отключена: уменьшение движения':paused?'Запустить смену баннеров':'Приостановить смену баннеров'} disabled={!api||reducedMotion} onClick={()=>setPaused(value=>!value)}>{paused||reducedMotion?<Play size={13}/>:<Pause size={13}/>}</button>
  </div>
  <span className="sr-only" aria-live={paused?'polite':'off'}>{campaigns[current].label}</span>
 </section>;
}

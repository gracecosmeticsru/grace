"use client";

import {useState} from 'react';
import {ArrowUpRight, ChevronRight} from 'lucide-react';
import Link from '@/components/site-link';
import type {Brand} from '@/lib/catalog-types';
import styles from './brand-focus.module.css';

const brandStories = [
  {name:'Celimax', tone:'celimax', image:'celimax.png', note:'Точный уход. Естественное сияние.', alt:'Редакционный визуал Grace: сияющая кожа, прозрачное стекло и прохладный свет'},
  {name:'Dior', tone:'dior', image:'dior.jpg', note:'Красота в духе высокой моды', alt:'Архивный кадр Dior 2021: красная помада, чёрный футляр и объёмные цветы в золотом свете'},
  {name:'Anua', tone:'anua', image:'anua.png', note:'Свежесть ежедневного ухода', alt:'Редакционный визуал Grace: свежая кожа, солнечное окно и лёгкие ботанические акценты'},
  {name:'Charlotte Tilbury', tone:'charlotte', image:'charlotte-tilbury.png', note:'Макияж с голливудским сиянием', alt:'Редакционный визуал Grace: бронзовый макияж, розовое золото и бархат'},
] as const;

function BrandVisual({story}:{story:typeof brandStories[number]}) {
  const [failed,setFailed] = useState(false);
  return <div className={styles.visual}>
    {failed
      ? <div className={styles.imageFallback} aria-label={'Подборка '+story.name}><span>{story.name}</span></div>
      : <img src={'/images/brand-focus/'+story.image} width={1536} height={1024} alt={story.alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>}
  </div>;
}

export default function BrandFocus({brands}:{brands:Brand[]}) {
  return <section className={'wrap home-section '+styles.section} aria-labelledby="brand-focus-title">
    <div className="section-heading"><h2 id="brand-focus-title">Бренды в фокусе</h2><Link href="/brands" className="text-link">Все бренды <ChevronRight size={17}/></Link></div>
    <div className={styles.grid}>{brandStories.map(story=>{
      const brand=brands.find(item=>item.name===story.name);
      if(!brand)return null;
      return <Link key={story.name} href={'/brands/'+brand.slug} className={styles.card+' '+styles[story.tone]} aria-label={'Смотреть бренд '+story.name}>
        <BrandVisual story={story}/>
        <div className={styles.copy}>
          <h3 className={styles.name}>{story.name}</h3>
          <p>{story.note}</p>
          <span className={styles.cta}>Смотреть бренд <ArrowUpRight size={19} strokeWidth={1.5}/></span>
        </div>
      </Link>;
    })}</div>
    <p className={styles.credit}>Иллюстрации Grace — ИИ. <a href="https://www.beautyalmanac.com/article/dior-rouge-dior-minaudiere-the-atelier-of-dreams-edition-box-couture-lipstick-case/4300" target="_blank" rel="noreferrer">Dior — архивный кадр, 2021</a>.</p>
  </section>;
}

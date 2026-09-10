"use client";
import Link from '@/components/site-link';
import {useState} from 'react';
import {Search,ArrowUpRight} from 'lucide-react';
import {Empty,EmptyTitle} from '@/components/ui/empty';
import type {Brand} from '@/lib/catalog-types';
export default function BrandsView({brands}:{brands:Brand[]}){
 const [query,setQuery]=useState(''),[letter,setLetter]=useState('Все');
 const initial=(s:string)=>/^[A-ZА-ЯЁ]/i.test(s)?s[0].toUpperCase():'#';
 const letters=Array.from(new Set(brands.map(b=>initial(b.name))));
 const matches=brands.filter(b=>b.name.toLowerCase().includes(query.toLowerCase())&&(letter==='Все'||initial(b.name)===letter));
 const featured=['Anua','Celimax','Dr. Althea','Round Lab','Rare Beauty','Dior'];
 return <main id="main" className="wrap brands-main"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Бренды</span></div><span className="eyebrow">YOUR BEAUTY UNIVERSE</span><div className="catalog-title-row"><h1>Бренды A–Я</h1><span>{brands.length} имён в каталоге</span></div><div className="featured-brands">{featured.map((name,i)=>{const b=brands.find(x=>x.name===name);return b?<Link key={name} href={'/brands/'+b.slug}><span className="eyebrow">0{i+1} / BRAND FOCUS</span><strong className={'brand-'+b.slug}>{name}</strong><span>{b.count} карточек <ArrowUpRight size={20}/></span></Link>:null;})}</div><div className="brand-directory-search"><Search/><input value={query} onChange={e=>{setQuery(e.target.value);setLetter('Все');}} placeholder="Какой бренд ищем?" aria-label="Поиск среди брендов"/></div><nav className="alphabet" aria-label="Алфавит брендов">{['Все',...letters].map(l=><button key={l} className={letter===l?'active':''} onClick={()=>setLetter(l)}>{l}</button>)}</nav><div className="brand-directory">{letters.map(l=>{const list=matches.filter(b=>initial(b.name)===l);return list.length?<section key={l}><h2>{l}</h2><div>{list.map(b=><Link key={b.slug} href={'/brands/'+b.slug}>{b.name}<span>{b.count}</span></Link>)}</div></section>:null;})}{matches.length===0&&<Empty><EmptyTitle>Такой бренд не найден</EmptyTitle><button className="text-link" onClick={()=>{setQuery('');setLetter('Все');}}>Показать все бренды</button></Empty>}</div></main>;
}

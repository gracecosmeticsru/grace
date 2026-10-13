"use client";
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,ChevronRight} from 'lucide-react';
import Link from './site-link';
import nodes from '@/data/navigation.json';
import {mobileCatalogLevel} from '@/lib/mobile-navigation';

export default function MobileCatalogMenu({onNavigate}:{onNavigate:()=>void}){
 const [path,setPath]=useState<string|null>(null);
 const heading=useRef<HTMLHeadingElement>(null);
 const moved=useRef(false);
 const {current,children}=mobileCatalogLevel(nodes,path);
 useEffect(()=>{if(moved.current){heading.current?.closest('[role="dialog"]')?.scrollTo({top:0});heading.current?.focus({preventScroll:true});}},[path]);
 function show(next:string|null){moved.current=true;setPath(next);}
 return <div className="mega-mobile">
  {current&&<button className="mobile-catalog-back" onClick={()=>show(current.parent)}><ArrowLeft size={18}/>Назад</button>}
  <h3 className="mobile-catalog-title" ref={heading} tabIndex={-1}>{current?.name||'Все разделы'}</h3>
  <nav className="mobile-catalog-level" aria-label={current?.name||'Разделы каталога'}>
   {children.map(node=>nodes.some(child=>child.parent===node.path)
    ?<button key={node.path} onClick={()=>show(node.path)}>{node.name}<ChevronRight size={18}/></button>
    :<Link key={node.path} href={'/catalog/'+node.path} onClick={onNavigate}>{node.name}<ArrowUpRight size={18}/></Link>)}
  </nav>
  <Link className="button primary" href={current?'/catalog/'+current.path:'/catalog'} onClick={onNavigate}>{current?'Все товары раздела':'Все товары'}<ArrowUpRight size={18}/></Link>
  {!current&&<Link className="mobile-catalog-brands" href="/brands" onClick={onNavigate}>Бренды A–Я<ArrowUpRight size={18}/></Link>}
 </div>;
}

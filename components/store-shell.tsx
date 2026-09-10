"use client";
import Link from '@/components/site-link';
import {usePathname,useRouter} from 'next/navigation';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {Search,Menu,Heart,ShoppingBag,ArrowUpRight,ArrowRight,ChevronRight,X,Home,Clock,MessageCircle,ArrowUp} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import {Toaster} from '@/components/ui/sonner';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {toast} from 'sonner';
import CategoryIcon from './category-icon';
import nodes from '@/data/navigation.json';
import type {Product,Variant} from '@/lib/catalog-types';
import {collectionMeta} from '@/lib/collection-meta';
import {Flower2,Diamond,Gift,Play,Tag} from 'lucide-react';

type BagLine={product:Product;variant:Variant;quantity:number};
type ShopContext={favorites:string[];toggleFavorite:(id:string)=>void;bag:BagLine[];addToBag:(p:Product,v:Variant)=>void;changeQuantity:(id:string,q:number)=>void;ready:boolean};
const Shop=createContext<ShopContext>({favorites:[],toggleFavorite:()=>{},bag:[],addToBag:()=>{},changeQuantity:()=>{},ready:false});
export const useShop=()=>useContext(Shop);
export const brandUrl=(name:string)=>'/brands?name='+encodeURIComponent(name);
const roots=nodes.filter(n=>!n.parent);

export default function StoreShell({children}:{children:React.ReactNode}){
 const [favorites,setFavorites]=useState<string[]>([]),[bag,setBag]=useState<BagLine[]>([]),[ready,setReady]=useState(false);
 const [menu,setMenu]=useState(false),[active,setActive]=useState('makeup'),[query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[recent,setRecent]=useState<string[]>([]);
 const pathname=usePathname(),router=useRouter();const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{const f=JSON.parse(localStorage.getItem('grace-favorites')||'[]');const b=JSON.parse(localStorage.getItem('grace-bag')||'[]');if(Array.isArray(f))setFavorites(f.filter(x=>typeof x==='string'));if(Array.isArray(b))setBag(b.filter(x=>x?.product?.id&&x?.variant?.id&&Number.isFinite(x.quantity)&&x.quantity>0));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('grace-favorites',JSON.stringify(favorites));localStorage.setItem('grace-bag',JSON.stringify(bag));}catch{}},[favorites,bag,ready]);
 useEffect(()=>{setMenu(false);},[pathname]);
 const toggleFavorite=(id:string)=>setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
 const addToBag=(product:Product,variant:Variant)=>{setBag(b=>{const existing=b.find(x=>x.variant.id===variant.id);return existing?b.map(x=>x.variant.id===variant.id?{...x,quantity:Math.min(99,x.quantity+1)}:x):[...b,{product,variant,quantity:1}];});toast.success('Товар добавлен в корзину',{action:{label:'Открыть',onClick:()=>router.push('/bag')}});};
 const changeQuantity=(id:string,q:number)=>setBag(b=>q<=0?b.filter(x=>x.variant.id!==id):b.map(x=>x.variant.id===id?{...x,quantity:Math.min(99,q)}:x));
 useEffect(()=>{try{const r=JSON.parse(localStorage.getItem('grace-searches')||'[]');if(Array.isArray(r))setRecent(r.filter(x=>typeof x==='string').slice(0,5));}catch{}},[]);
 const rememberSearch=()=>{const q=query.trim();if(q)try{localStorage.setItem('grace-searches',JSON.stringify([q,...recent.filter(x=>x!==q)].slice(0,5)));}catch{}};
 const activeRoot=roots.find(r=>r.path===active)!;
 const groups=nodes.filter(n=>n.parent===active);
 return <Shop.Provider value={{favorites,toggleFavorite,bag,addToBag,changeQuantity,ready}}>
   <a className="skip-link" href="#main">Перейти к содержимому</a>
   <header className="site-header">
    <div className="header-inner wrap">
     <button className="icon-button mobile-menu" aria-label="Открыть каталог" onClick={()=>setMenu(true)}><Menu/></button>
     <Link href="/" className="wordmark header-wordmark" aria-label="Grace Cosmetics — главная">GRACECOSMETICS</Link>
     <div className="search-area" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setSearchOpen(false);}}>
      <form className="header-search" action="/search" role="search" onSubmit={rememberSearch}>
       <input ref={input} name="q" value={query} onFocus={()=>setSearchOpen(true)} onChange={e=>setQuery(e.target.value)} placeholder="Найти товар, бренд или оттенок" aria-label="Поиск по каталогу" autoComplete="off"/>
       {query&&<button type="button" onClick={()=>{setQuery('');input.current?.focus();}} aria-label="Очистить поиск"><X size={17}/></button>}
       <button type="submit" aria-label="Найти"><Search size={22}/></button>
      </form>
      {searchOpen&&<div className="search-suggestions"><div className="suggestion-title">{query?'Искать в каталоге':'Последние запросы'}{!query&&recent.length>0&&<button onClick={()=>{setRecent([]);localStorage.removeItem('grace-searches');}}>Очистить</button>}</div>{query?<a href={'/search?q='+encodeURIComponent(query)} onClick={rememberSearch}><Search size={17}/>{query}<ArrowRight size={16}/></a>:recent.length?recent.map(q=><a key={q} href={'/search?q='+encodeURIComponent(q)}><Clock size={16}/>{q}</a>):<p>Здесь появятся ваши поиски</p>}<div className="suggestion-title">Бренды в каталоге</div><div className="search-brand-chips">{['Anua','Dior','Rare Beauty','Dr. Althea','Tom Ford'].map(b=><a key={b} href={brandUrl(b)}>{b}</a>)}</div></div>}
     </div>
     <div className="header-actions">
      <Link href="/favorites" className="header-action" aria-label={'Избранное, '+favorites.length}><span className="count-icon"><Heart size={25}/>{favorites.length>0&&<b>{favorites.length}</b>}</span><span>Избранное</span></Link>
      <Link href="/bag" className="header-action" aria-label={'Корзина, '+bag.reduce((a,b)=>a+b.quantity,0)}><span className="count-icon"><ShoppingBag size={25}/>{bag.length>0&&<b>{bag.reduce((a,b)=>a+b.quantity,0)}</b>}</span><span>Корзина</span></Link>
      <a href="https://www.instagram.com/grace_cosmetics.ru/" target="_blank" rel="noreferrer" className="header-action header-help" aria-label="Помощь — связаться с Grace"><MessageCircle size={25}/><span>Помощь</span></a>
     </div>
    </div>
    <nav className="main-nav wrap" aria-label="Основная навигация"><button className="catalog-toggle" onClick={()=>setMenu(true)}><Menu size={21}/> Каталог</button><Link href="/#grace-picks" className="nav-featured">Выбор Grace</Link><Link href="/brands">Бренды</Link><span className="nav-divider"/>{roots.map(n=><Link key={n.path} className={pathname.startsWith('/catalog/'+n.path)?'nav-active':''} href={'/catalog/'+n.path}>{n.name}</Link>)}</nav>
   </header>
   <div className="promo-navigation"><nav className="promo-nav wrap" aria-label="Подборки Grace">{collectionMeta.map(c=>{const Icon={flower:Flower2,diamond:Diamond,gift:Gift,bag:ShoppingBag,play:Play,tag:Tag}[c.icon];return <Link key={c.slug} href={'/collections/'+c.slug} className={'promo-entry '+(pathname==='/collections/'+c.slug?'is-current':'')} aria-current={pathname==='/collections/'+c.slug?'page':undefined}><Icon size={17} strokeWidth={1.5}/><span>{c.title}</span></Link>;})}</nav></div>
   <Sheet open={menu} onOpenChange={setMenu}><SheetContent side="top" className="catalog-sheet" showCloseButton={false}>
    <div className="wrap"><div className="sheet-heading"><SheetTitle>Каталог</SheetTitle><SheetClose className="icon-button" aria-label="Закрыть каталог"><X/></SheetClose></div><SheetDescription className="sr-only">Разделы и подкатегории Grace Cosmetics</SheetDescription>
     <div className="mega-desktop"><div className="mega-roots">{roots.map(n=><button key={n.path} className={active===n.path?'active':''} onClick={()=>setActive(n.path)}><CategoryIcon name={n.path}/><span>{n.name}</span><ChevronRight size={17}/></button>)}<Link href="/catalog" onClick={()=>setMenu(false)}>Все товары <ArrowUpRight size={16}/></Link></div>
      <div className="mega-content"><Link className="mega-title" href={'/catalog/'+active} onClick={()=>setMenu(false)}>{activeRoot.name}<ArrowUpRight/></Link><div className="mega-columns">{groups.map(g=>{const leaves=nodes.filter(n=>n.parent===g.path);return <div key={g.path} className={leaves.length?'mega-group':'mega-leaf'}><Link href={'/catalog/'+g.path} onClick={()=>setMenu(false)}>{g.name}</Link>{leaves.map(n=><Link key={n.path} href={'/catalog/'+n.path} onClick={()=>setMenu(false)}>{n.name}</Link>)}</div>;})}</div></div>
     </div>
     <div className="mega-mobile"><Accordion type="single" collapsible>{roots.map(n=><AccordionItem value={n.path} key={n.path}><AccordionTrigger>{n.name}</AccordionTrigger><AccordionContent><Link className="mobile-all" onClick={()=>setMenu(false)} href={'/catalog/'+n.path}>Смотреть всё <ArrowRight size={16}/></Link>{nodes.filter(g=>g.parent===n.path).map(g=><div className="mobile-nav-group" key={g.path}><Link href={'/catalog/'+g.path} onClick={()=>setMenu(false)}>{g.name}</Link>{nodes.filter(l=>l.parent===g.path).map(l=><Link href={'/catalog/'+l.path} key={l.path} onClick={()=>setMenu(false)}>{l.name}</Link>)}</div>)}</AccordionContent></AccordionItem>)}</Accordion><Link className="button primary" href="/catalog" onClick={()=>setMenu(false)}>Все товары</Link></div>
    </div>
   </SheetContent></Sheet>

   {children}
   <section className="service-strip"><div className="wrap service-inner"><MessageCircle size={32} strokeWidth={1.4}/><div><h2>Нужна помощь с выбором?</h2><p>Уточним оттенок, объём, стоимость и наличие</p></div><a href="https://www.instagram.com/grace_cosmetics.ru/" target="_blank" rel="noreferrer" className="button secondary">Написать Grace <ArrowUpRight size={17}/></a></div></section>
   <footer className="site-footer"><div className="wrap footer-main"><div><Link href="/" className="wordmark footer-logo">GRACE<span>COSMETICS</span></Link><p>Косметика и парфюмерия</p></div><div className="footer-links"><strong>Каталог</strong>{roots.slice(0,3).map(n=><Link key={n.path} href={'/catalog/'+n.path}>{n.name}</Link>)}</div><div className="footer-links"><strong>Разделы</strong>{roots.slice(3).map(n=><Link key={n.path} href={'/catalog/'+n.path}>{n.name}</Link>)}</div><div className="footer-links"><strong>Покупателю</strong><Link href="/brands">Все бренды</Link><Link href="/favorites">Избранное</Link><Link href="/bag">Корзина</Link><a href="https://www.instagram.com/grace_cosmetics.ru/" target="_blank" rel="noreferrer">Связаться с нами <ArrowUpRight size={15}/></a></div></div><div className="wrap footer-bottom"><span>© Grace Cosmetics, 2026</span><span>Цену и условия доставки уточняйте перед заказом</span></div></footer>
   <nav className="mobile-bottom" aria-label="Мобильная навигация"><Link href="/" className={pathname==='/'?'active':''}><Home size={22}/>Главная</Link><button onClick={()=>setMenu(true)} className={pathname.startsWith('/catalog')?'active':''}><Menu size={22}/>Каталог</button><Link href="/brands" className={pathname.startsWith('/brands')?'active':''}><CategoryIcon name="skincare" size={22}/>Бренды</Link><Link href="/favorites" className={pathname==='/favorites'?'active':''}><Heart size={22}/>Избранное</Link><Link href="/bag" className={pathname==='/bag'?'active':''}><ShoppingBag size={22}/>Корзина{bag.length>0&&<b>{bag.reduce((a,b)=>a+b.quantity,0)}</b>}</Link></nav>
   <a href="#" className="back-top" aria-label="В начало страницы"><ArrowUp size={20}/><span>Наверх</span></a>
   <Toaster position="bottom-right" theme="light"/>
 </Shop.Provider>;
}

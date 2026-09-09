"use client";
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {Search,Menu,Heart,ShoppingBag,ArrowUpRight,ArrowRight,ChevronRight,X} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import {Toaster} from '@/components/ui/sonner';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {toast} from 'sonner';
import nodes from '@/data/navigation.json';
import type {Product,Variant} from '@/lib/catalog-types';

type BagLine={product:Product;variant:Variant;quantity:number};
type ShopContext={favorites:string[];toggleFavorite:(id:string)=>void;bag:BagLine[];addToBag:(p:Product,v:Variant)=>void;changeQuantity:(id:string,q:number)=>void;ready:boolean};
const Shop=createContext<ShopContext>({favorites:[],toggleFavorite:()=>{},bag:[],addToBag:()=>{},changeQuantity:()=>{},ready:false});
export const useShop=()=>useContext(Shop);
export const brandUrl=(name:string)=>'/brands?name='+encodeURIComponent(name);
const roots=nodes.filter(n=>!n.parent);

export default function StoreShell({children}:{children:React.ReactNode}){
 const [favorites,setFavorites]=useState<string[]>([]),[bag,setBag]=useState<BagLine[]>([]),[ready,setReady]=useState(false);
 const [menu,setMenu]=useState(false),[active,setActive]=useState('makeup'),[query,setQuery]=useState('');
 const pathname=usePathname(),router=useRouter();const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{const f=JSON.parse(localStorage.getItem('grace-favorites')||'[]');const b=JSON.parse(localStorage.getItem('grace-bag')||'[]');if(Array.isArray(f))setFavorites(f.filter(x=>typeof x==='string'));if(Array.isArray(b))setBag(b.filter(x=>x?.product?.id&&x?.variant?.id&&Number.isFinite(x.quantity)&&x.quantity>0));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('grace-favorites',JSON.stringify(favorites));localStorage.setItem('grace-bag',JSON.stringify(bag));}catch{}},[favorites,bag,ready]);
 useEffect(()=>{setMenu(false);},[pathname]);
 const toggleFavorite=(id:string)=>setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
 const addToBag=(product:Product,variant:Variant)=>{setBag(b=>{const existing=b.find(x=>x.variant.id===variant.id);return existing?b.map(x=>x.variant.id===variant.id?{...x,quantity:Math.min(99,x.quantity+1)}:x):[...b,{product,variant,quantity:1}];});toast.success('Товар добавлен в корзину',{action:{label:'Открыть',onClick:()=>router.push('/bag')}});};
 const changeQuantity=(id:string,q:number)=>setBag(b=>q<=0?b.filter(x=>x.variant.id!==id):b.map(x=>x.variant.id===id?{...x,quantity:Math.min(99,q)}:x));
 const activeRoot=roots.find(r=>r.path===active)!;
 const groups=nodes.filter(n=>n.parent===active);
 return <Shop.Provider value={{favorites,toggleFavorite,bag,addToBag,changeQuantity,ready}}>
   <a className="skip-link" href="#main">Перейти к содержимому</a>
   <div className="announcement"><span>ТВОЙ МИР КРАСОТЫ</span><span className="announcement-divider">✦</span><Link href="/catalog">Найди то, что подходит тебе <ArrowUpRight size={14}/></Link></div>
   <header className="site-header">
    <div className="header-inner wrap">
     <button className="icon-button mobile-menu" aria-label="Открыть каталог" onClick={()=>setMenu(true)}><Menu/></button>
     <Link href="/" className="wordmark" aria-label="Grace Cosmetics — главная">grace<span>cosmetics</span></Link>
     <form className="header-search" action="/search" onSubmit={e=>{e.preventDefault();router.push('/search?q='+encodeURIComponent(query.trim()));input.current?.blur();}}>
      <Search size={21}/><input ref={input} name="q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Бренд, продукт или оттенок" aria-label="Поиск по каталогу"/>
      {query?<button type="button" onClick={()=>{setQuery('');input.current?.focus();}} aria-label="Очистить поиск"><X size={18}/></button>:<span className="search-hint">Найти своё</span>}
     </form>
     <div className="header-actions">
      <Link href="/favorites" className="header-action" aria-label={'Избранное, '+favorites.length}><span className="count-icon"><Heart size={23}/>{favorites.length>0&&<b>{favorites.length}</b>}</span><span>Избранное</span></Link>
      <Link href="/bag" className="header-action" aria-label={'Корзина, '+bag.reduce((a,b)=>a+b.quantity,0)}><span className="count-icon"><ShoppingBag size={23}/>{bag.length>0&&<b>{bag.reduce((a,b)=>a+b.quantity,0)}</b>}</span><span>Корзина</span></Link>
     </div>
    </div>
    <nav className="main-nav wrap" aria-label="Основная навигация">
     <button className="catalog-toggle" onClick={()=>setMenu(true)}><Menu size={18}/> Каталог</button>
     {roots.map(n=><Link key={n.path} className={pathname.startsWith('/catalog/'+n.path)?'nav-active':''} href={'/catalog/'+n.path}>{n.name}</Link>)}
     <Link href="/brands" className="brands-nav">Бренды A–Я <ArrowUpRight size={15}/></Link>
    </nav>
   </header>
   <Sheet open={menu} onOpenChange={setMenu}><SheetContent side="top" className="catalog-sheet" showCloseButton={false}>
    <div className="wrap"><div className="sheet-heading"><SheetTitle>Каталог</SheetTitle><SheetClose className="icon-button" aria-label="Закрыть каталог"><X/></SheetClose></div><SheetDescription className="sr-only">Разделы и подкатегории Grace Cosmetics</SheetDescription>
     <div className="mega-desktop"><div className="mega-roots">{roots.map(n=><button key={n.path} className={active===n.path?'active':''} onClick={()=>setActive(n.path)}>{n.name}<ChevronRight size={17}/></button>)}<Link href="/catalog" onClick={()=>setMenu(false)}>Все товары <ArrowUpRight size={16}/></Link></div>
      <div className="mega-content"><Link className="mega-title" href={'/catalog/'+active} onClick={()=>setMenu(false)}>{activeRoot.name}<ArrowUpRight/></Link><div className="mega-columns">{groups.map(g=>{const leaves=nodes.filter(n=>n.parent===g.path);return <div key={g.path} className={leaves.length?'mega-group':'mega-leaf'}><Link href={'/catalog/'+g.path} onClick={()=>setMenu(false)}>{g.name}</Link>{leaves.map(n=><Link key={n.path} href={'/catalog/'+n.path} onClick={()=>setMenu(false)}>{n.name}</Link>)}</div>;})}</div></div>
     </div>
     <div className="mega-mobile"><Accordion type="single" collapsible>{roots.map(n=><AccordionItem value={n.path} key={n.path}><AccordionTrigger>{n.name}</AccordionTrigger><AccordionContent><Link className="mobile-all" onClick={()=>setMenu(false)} href={'/catalog/'+n.path}>Смотреть всё <ArrowRight size={16}/></Link>{nodes.filter(g=>g.parent===n.path).map(g=><div className="mobile-nav-group" key={g.path}><Link href={'/catalog/'+g.path} onClick={()=>setMenu(false)}>{g.name}</Link>{nodes.filter(l=>l.parent===g.path).map(l=><Link href={'/catalog/'+l.path} key={l.path} onClick={()=>setMenu(false)}>{l.name}</Link>)}</div>)}</AccordionContent></AccordionItem>)}</Accordion><Link className="button primary" href="/catalog" onClick={()=>setMenu(false)}>Все товары</Link></div>
    </div>
   </SheetContent></Sheet>
   {children}
   <footer className="site-footer"><div className="wrap footer-main"><div><Link href="/" className="wordmark footer-logo">grace<span>cosmetics</span></Link><p>Красота начинается<br/>с твоего выбора.</p></div><div className="footer-links"><span>КАТАЛОГ</span>{roots.slice(0,3).map(n=><Link key={n.path} href={'/catalog/'+n.path}>{n.name}</Link>)}</div><div className="footer-links"><span>ЕЩЁ БОЛЬШЕ КРАСОТЫ</span>{roots.slice(3).map(n=><Link key={n.path} href={'/catalog/'+n.path}>{n.name}</Link>)}</div><div className="footer-links"><span>GRACE COSMETICS</span><Link href="/brands">Все бренды</Link><Link href="/favorites">Избранное</Link><a href="https://www.instagram.com/grace_cosmetics.ru/" target="_blank" rel="noreferrer">Написать в Instagram <ArrowUpRight size={15}/></a><small>Цену, наличие и условия доставки<br/>уточняйте перед заказом.</small></div></div><div className="wrap footer-bottom"><span>© Grace Cosmetics, 2026</span><span>Макияж. Уход. Твой характер.</span></div></footer>
   <nav className="mobile-bottom" aria-label="Мобильная навигация"><Link href="/" className={pathname==='/'?'active':''}><span className="mini-g">g.</span>Главная</Link><button onClick={()=>setMenu(true)}><Menu size={21}/>Каталог</button><Link href="/favorites"><Heart size={21}/>Избранное</Link><Link href="/bag"><ShoppingBag size={21}/>Корзина{bag.length>0&&<b>{bag.length}</b>}</Link></nav>
   <Toaster position="bottom-right" theme="light" richColors/>
 </Shop.Provider>;
}

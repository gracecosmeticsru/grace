"use client";
import Link from '@/components/site-link';
import SiteFooter from './site-footer';
import {usePathname,useRouter} from 'next/navigation';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {Search,Menu,Heart,ShoppingBag,ArrowUpRight,ArrowRight,ChevronRight,X,Home,Clock,MessageCircle,ArrowUp,UserRound} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import {Toaster} from '@/components/ui/sonner';
import MobileCatalogMenu from './mobile-catalog-menu';
import {toast} from 'sonner';
import CategoryIcon from './category-icon';
import nodes from '@/data/navigation.json';
import type {Product,Variant} from '@/lib/catalog-types';
import {collectionMeta} from '@/lib/collection-meta';
import {Flower2,Diamond,Gift,Play,Tag} from 'lucide-react';
import {shopKeys,loadShopState,readStringList,saveStoredValue,removeStoredValue,addBagLine,updateBagQuantity,toggleVariantFavorite,sameSavedProduct,consumeOrderedItems} from '@/lib/shop-state';
import type {BagLine,SavedProduct} from '@/lib/shop-state';
import {demoInventory,purchaseQuantityLimit} from '@/lib/demo-inventory';

type ShopContext={favorites:SavedProduct[];toggleFavorite:(p:Product,v:Variant)=>void;removeFavorite:(entry:SavedProduct)=>void;bag:BagLine[];addToBag:(p:Product,v:Variant)=>void;changeQuantity:(id:string,q:number)=>void;consumeOrder:(items:Parameters<typeof consumeOrderedItems>[1])=>void;ready:boolean};
const Shop=createContext<ShopContext>({favorites:[],toggleFavorite:()=>{},removeFavorite:()=>{},bag:[],addToBag:()=>{},changeQuantity:()=>{},consumeOrder:()=>{},ready:false});
export const useShop=()=>useContext(Shop);
export const brandUrl=(name:string)=>'/brands?name='+encodeURIComponent(name);
const roots=nodes.filter(n=>!n.parent);

export default function StoreShell({children}:{children:React.ReactNode}){
 const [favorites,setFavorites]=useState<SavedProduct[]>([]),[bag,setBag]=useState<BagLine[]>([]),[ready,setReady]=useState(false);
 const [menu,setMenu]=useState(false),[active,setActive]=useState('makeup'),[query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[recent,setRecent]=useState<string[]>([]);
 const pathname=usePathname(),router=useRouter();const input=useRef<HTMLInputElement>(null);
 const catalogOpener=useRef<HTMLButtonElement>(null),accountOpener=useRef<HTMLButtonElement>(null);
 const [accountOpen,setAccountOpen]=useState(false);
 const openCatalog=(event:React.MouseEvent<HTMLButtonElement>)=>{catalogOpener.current=event.currentTarget;setSearchOpen(false);setMenu(true);};
 const persisted=useRef<{favorites:SavedProduct[];bag:BagLine[]}|null>(null);
 useEffect(()=>{const loaded=loadShopState();persisted.current=loaded;setFavorites(loaded.favorites);setBag(loaded.bag);setReady(true);},[]);
 useEffect(()=>{if(!ready||!persisted.current||favorites===persisted.current.favorites)return;if(saveStoredValue(shopKeys.favorites,favorites))persisted.current.favorites=favorites;else toast.error('Не удалось сохранить избранное в этом браузере.');},[favorites,ready]);
 useEffect(()=>{if(!ready||!persisted.current||bag===persisted.current.bag)return;if(saveStoredValue(shopKeys.bag,bag))persisted.current.bag=bag;else toast.error('Не удалось сохранить корзину в этом браузере.');},[bag,ready]);
 useEffect(()=>{setMenu(false);},[pathname]);
 const toggleFavorite=(product:Product,variant:Variant)=>{if(ready)setFavorites(f=>toggleVariantFavorite(f,product,variant));};
 const removeFavorite=(entry:SavedProduct)=>{if(ready)setFavorites(f=>f.filter(item=>!sameSavedProduct(item,entry)));};
 const addToBag=(product:Product,variant:Variant)=>{if(!product.variants.some(v=>v.id===variant.id))return;if((bag.find(line=>line.variant.id===variant.id)?.quantity||0)>=purchaseQuantityLimit){toast.info(demoInventory.enabled?'Тестовый остаток этого варианта — 1 шт. Она уже в корзине.':'Достигнуто максимальное количество.');return;}setBag(b=>addBagLine(b,product,variant,purchaseQuantityLimit));toast.success('Товар добавлен в корзину',{action:{label:'Открыть',onClick:()=>router.push('/bag')}});};
 const changeQuantity=(id:string,q:number)=>setBag(b=>updateBagQuantity(b,id,q,purchaseQuantityLimit));
 const consumeOrder=(items:Parameters<typeof consumeOrderedItems>[1])=>setBag(current=>consumeOrderedItems(current,items));
 useEffect(()=>{setRecent(readStringList(shopKeys.searches,5));},[]);
 const rememberSearch=()=>{const q=query.trim();if(q)saveStoredValue(shopKeys.searches,[q,...recent.filter(x=>x!==q)].slice(0,5));};
 const activeRoot=roots.find(r=>r.path===active)!;
 const groups=nodes.filter(n=>n.parent===active);
 return <Shop.Provider value={{favorites,toggleFavorite,removeFavorite,bag,addToBag,changeQuantity,consumeOrder,ready}}>
   <a className="skip-link" href="#main">Перейти к содержимому</a>
   <header className="site-header">
    <div className="header-inner wrap">
     <button className="icon-button mobile-menu" aria-label="Открыть каталог" aria-haspopup="dialog" aria-expanded={menu} onClick={openCatalog}><Menu/></button>
     <Link href="/" className="wordmark header-wordmark" aria-label="Grace Cosmetics — главная"><img src="/brand/grace-logo-master.png" width={2022} height={778} alt="" className="brand-logo brand-logo-light" fetchPriority="high"/></Link>
     <div className="search-area" onKeyDown={e=>{if(e.key==='Escape'){setSearchOpen(false);input.current?.focus();}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setSearchOpen(false);}}>
      <form className="header-search" action="/search" role="search" onSubmit={rememberSearch}>
       <input ref={input} name="q" value={query} onFocus={()=>setSearchOpen(true)} onChange={e=>setQuery(e.target.value)} placeholder="Найти товар, бренд или оттенок" aria-label="Поиск по каталогу" autoComplete="off"/>
       {query&&<button type="button" onClick={()=>{setQuery('');input.current?.focus();}} aria-label="Очистить поиск"><X size={17}/></button>}
       <button type="submit" aria-label="Найти"><Search size={22}/></button>
      </form>
      {searchOpen&&<div className="search-suggestions"><div className="suggestion-title">{query?'Искать в каталоге':'Последние запросы'}{!query&&recent.length>0&&<button onClick={()=>{if(removeStoredValue(shopKeys.searches))setRecent([]);else toast.error('Не удалось очистить историю поиска в этом браузере.');}}>Очистить</button>}</div>{query?<a href={'/search?q='+encodeURIComponent(query)} onClick={rememberSearch}><Search size={17}/>{query}<ArrowRight size={16}/></a>:recent.length?recent.map(q=><a key={q} href={'/search?q='+encodeURIComponent(q)}><Clock size={16}/>{q}</a>):<p>Здесь появятся ваши поиски</p>}<div className="suggestion-title">Бренды в каталоге</div><div className="search-brand-chips">{['Anua','Dior','Rare Beauty','Dr. Althea','Tom Ford'].map(b=><a key={b} href={brandUrl(b)}>{b}</a>)}</div></div>}
     </div>
     <div className="header-actions">
      <Link href="/favorites" className="header-action" aria-label={'Избранное, '+favorites.length}><span className="count-icon"><Heart size={25}/>{favorites.length>0&&<b>{favorites.length}</b>}</span><span>Избранное</span></Link>
      <Link href="/bag" className="header-action" aria-label={'Корзина, '+bag.reduce((a,b)=>a+b.quantity,0)}><span className="count-icon"><ShoppingBag size={25}/>{bag.length>0&&<b>{bag.reduce((a,b)=>a+b.quantity,0)}</b>}</span><span>Корзина</span></Link>
      <a href="https://www.instagram.com/grace_cosmetics.ru/" target="_blank" rel="noreferrer" className="header-action header-help" aria-label="Помощь — связаться с Grace"><MessageCircle size={25}/><span>Помощь</span></a>
     </div>
    </div>
    <nav className="main-nav wrap" aria-label="Основная навигация"><button className="catalog-toggle" aria-haspopup="dialog" aria-expanded={menu} onClick={openCatalog}><Menu size={21}/> Каталог</button><span className="nav-divider"/>{roots.map(n=><Link key={n.path} className={pathname.startsWith('/catalog/'+n.path)?'nav-active':''} href={'/catalog/'+n.path}>{n.name}</Link>)}</nav>
   </header>
   <div className="promo-navigation"><nav className="promo-nav wrap" aria-label="Подборки Grace">{collectionMeta.map(c=>{const Icon={flower:Flower2,diamond:Diamond,gift:Gift,bag:ShoppingBag,play:Play,tag:Tag}[c.icon];return <Link key={c.slug} href={'/collections/'+c.slug} className={'promo-entry '+(pathname==='/collections/'+c.slug?'is-current':'')} aria-current={pathname==='/collections/'+c.slug?'page':undefined}><Icon size={17} strokeWidth={1.5}/><span>{c.title}</span></Link>;})}</nav></div>
   <Sheet open={menu} onOpenChange={setMenu}><SheetContent side="top" className="catalog-sheet" showCloseButton={false} onCloseAutoFocus={event=>{event.preventDefault();catalogOpener.current?.focus({preventScroll:true});}}>
    <div className="wrap"><div className="sheet-heading"><SheetTitle>Каталог</SheetTitle><SheetClose className="icon-button" aria-label="Закрыть каталог"><X/></SheetClose></div><SheetDescription className="sr-only">Разделы и подкатегории Grace Cosmetics</SheetDescription>
     <div className="mega-desktop"><div className="mega-roots">{roots.map(n=><button key={n.path} className={active===n.path?'active':''} onClick={()=>setActive(n.path)}><CategoryIcon name={n.path}/><span>{n.name}</span><ChevronRight size={17}/></button>)}<Link href="/catalog" onClick={()=>setMenu(false)}>Все товары <ArrowUpRight size={16}/></Link></div>
      <div className="mega-content"><Link className="mega-title" href={'/catalog/'+active} onClick={()=>setMenu(false)}>{activeRoot.name}<ArrowUpRight/></Link><div className="mega-columns">{groups.map(g=>{const leaves=nodes.filter(n=>n.parent===g.path);return <div key={g.path} className={leaves.length?'mega-group':'mega-leaf'}><Link href={'/catalog/'+g.path} onClick={()=>setMenu(false)}>{g.name}</Link>{leaves.map(n=><Link key={n.path} href={'/catalog/'+n.path} onClick={()=>setMenu(false)}>{n.name}</Link>)}</div>;})}</div></div>
     </div>
     <MobileCatalogMenu onNavigate={()=>setMenu(false)}/>
    </div>
   </SheetContent></Sheet>

   {children}
   <SiteFooter/>
   <nav className="mobile-bottom" aria-label="Мобильная навигация">
    <Link href="/" className={pathname==='/'?'active':''}><Home size={22}/><span>Главная</span></Link>
    <button ref={accountOpener} aria-haspopup="dialog" aria-expanded={accountOpen} onClick={()=>setAccountOpen(true)}><UserRound size={22}/><span>Кабинет</span></button>
    <Link href="/bag" className={pathname==='/bag'?'active':''}><ShoppingBag size={22}/><span>Корзина</span>{bag.length>0&&<b>{bag.reduce((a,b)=>a+b.quantity,0)}</b>}</Link>
    <Link href="/favorites" className={pathname==='/favorites'?'active':''}><Heart size={22}/><span>Избранное</span></Link>
    <button onClick={openCatalog} aria-haspopup="dialog" aria-expanded={menu} className={pathname.startsWith('/catalog')?'active':''}><Menu size={22}/><span>Каталог</span></button>
    <Link href="/collections/sale" className={pathname==='/collections/sale'?'active':''}><Tag size={22}/><span>Акции</span></Link>
   </nav>
   <Sheet open={accountOpen} onOpenChange={setAccountOpen}><SheetContent side="bottom" className="account-sheet" onCloseAutoFocus={event=>{event.preventDefault();accountOpener.current?.focus({preventScroll:true});}}><SheetTitle>Личный кабинет</SheetTitle><SheetDescription>Вход в личный кабинет пока недоступен. Корзина и избранное сохраняются в этом браузере.</SheetDescription><Link className="button primary" href="/bag" onClick={()=>setAccountOpen(false)}>Открыть корзину</Link><Link className="button secondary" href="/favorites" onClick={()=>setAccountOpen(false)}>Моё избранное</Link></SheetContent></Sheet>
   <a href="#" className="back-top" aria-label="В начало страницы"><ArrowUp size={20}/><span>Наверх</span></a>
   <Toaster position="bottom-right" theme="light"/>
 </Shop.Provider>;
}

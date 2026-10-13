import {ArrowUpRight} from 'lucide-react';
import {autumnEditorial,autumnProductVariants} from '@/lib/autumn-editorial';
import {bodyArticles} from '@/lib/body-editorial';
import {brands,getProduct} from '@/lib/catalog';
import collectionPhotos from '@/docs/step05a-photo-sources.json';
import VariantProductCard from './variant-product-card';
import JournalStrip from './journal-strip';
import styles from './journal.module.css';

export const articlePreviews=[{slug:'autumn-skincare',title:autumnEditorial.title,subtitle:autumnEditorial.subtitle,cover:autumnEditorial.cover,coverAlt:'Осенний ритуал ухода в тёплых оттенках',kicker:'СЕЗОННЫЙ УХОД'},...bodyArticles];
export const journalBrandNames=['Celimax','Anua','Dr. Althea','Charlotte Tilbury','Dior','Rare Beauty','Haus Labs'];
export function ArticleCards(){return articlePreviews.map(article=><a key={article.slug} href={'/blog/'+article.slug} className={styles.card}>
 <div className={styles.cardImage}><img src={article.cover} alt={article.coverAlt} width={1536} height={1024} loading="lazy" decoding="async"/></div>
 <span className={styles.kicker}>{article.kicker}</span><h3>{article.title}</h3><span className={styles.read}>Читать статью <ArrowUpRight size={18}/></span>
 </a>);}
export function HomeJournal(){return <>
 <section className="wrap home-section" aria-labelledby="grace-blog-title">
  <div className="section-heading"><h2 id="grace-blog-title">Блог</h2><a href="/blog" className="text-link">Все статьи <ArrowUpRight size={17}/></a></div>
  <JournalStrip label="Статьи Grace" kind="articles"><ArticleCards/></JournalStrip>
 </section>
 <section className={'wrap home-section '+styles.brandSection} aria-labelledby="grace-brands-title">
  <div className="section-heading"><h2 id="grace-brands-title">Бренды Grace</h2><a href="/brands" className="text-link">Все бренды <ArrowUpRight size={17}/></a></div>
  <JournalStrip label="Выбор бренда" kind="brands">{journalBrandNames.map(name=>{const brand=brands.find(brand=>brand.name===name);if(!brand)throw new Error('Unknown journal brand: '+name);return <a key={brand.slug} href={'/brands/'+brand.slug} className={styles.brand}>{brand.name}</a>;})}</JournalStrip>
 </section>
 </>;}
export function ArticleProducts({items=autumnProductVariants}:{items?:ReadonlyArray<{productId:string;variantId:string}>}){return <div className="product-grid">
 {items.map(({productId,variantId})=>{const product=getProduct(productId),variant=product?.variants.find(item=>item.id===variantId);if(!product||!variant)throw new Error('Invalid article product variant: '+productId+'/'+variantId);const photo=collectionPhotos.find(item=>item.productId===productId&&item.variantId===variantId);const illustrated=photo?{...product,image:'/'+photo.publicPath.replace(/^public\//,'')}:product;return <VariantProductCard key={variant.id} product={illustrated} variant={variant}/>;})}
 </div>;}

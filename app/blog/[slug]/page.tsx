import {notFound} from 'next/navigation';
import {ArrowDown,ArrowLeft,ArrowUpRight} from 'lucide-react';
import {bodyArticles} from '@/lib/body-editorial';
import {ArticleProducts} from '@/components/journal';
import styles from '@/components/journal.module.css';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {slug}=await params;const article=bodyArticles.find(item=>item.slug===slug);return {title:article?.title||'Статья не найдена',description:article?.subtitle};}
export default async function BodyArticle({params}:Props){
 const {slug}=await params,article=bodyArticles.find(item=>item.slug===slug);if(!article)notFound();
 return <main id="main" className={'wrap '+styles.article}>
 <article>
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><a href="/blog">Блог</a></nav>
  <header className={styles.articleHeading}><span className={styles.kicker}>{article.kicker}</span><h1>{article.title}</h1><p>{article.subtitle}</p><a href="#article-products" className={styles.back}>К средствам Grace <ArrowDown size={16}/></a></header>
  <figure className={styles.cover}><img src={article.cover} alt={article.coverAlt} width={1536} height={1024} loading="eager" fetchPriority="high"/></figure>
  <div className={styles.body}>
   <nav className={styles.contents} aria-label="В этой статье">{article.sections.map(section=><a key={section.id} href={'#'+section.id}>{section.title}</a>)}</nav>
   {article.sections.map((section,index)=><section className={styles.chapter} id={section.id} key={section.id}>
    <span className={styles.kicker}>{String(index+1).padStart(2,'0')} / НА ПРАКТИКЕ</span><h2>{section.title}</h2>
    {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{'tip' in section&&section.tip&&<p className={styles.tip}>{section.tip}</p>}
    <a className={styles.source} href={section.source.href} target="_blank" rel="noreferrer">{section.source.label}<ArrowUpRight size={13}/></a>
   </section>)}
   <p className={styles.note}>Редакционная иллюстрация создана с помощью ИИ. Упаковки в ней не изображают конкретные товары каталога.</p>
  </div>
 </article>
 <section className={styles.products} id="article-products" aria-labelledby="article-products-title"><h2 id="article-products-title">Средства из каталога Grace</h2><p>{article.productIntro}</p><ArticleProducts items={article.products}/></section>
 <a href="/blog" className={styles.back}><ArrowLeft size={16}/>Все статьи Grace</a>
 </main>;
}

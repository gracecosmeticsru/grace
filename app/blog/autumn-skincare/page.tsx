import type { Metadata } from 'next';
import { ArrowDown, ArrowLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import ProductRail from '@/components/product-rail';
import { getProduct } from '@/lib/catalog';
import { autumnEditorial, autumnChapters, autumnProductIds, editorialSources } from '@/lib/autumn-editorial';
import styles from '@/components/autumn-editorial.module.css';

export const metadata: Metadata = { title: autumnEditorial.title, description: autumnEditorial.subtitle };

function Source({ name }: { name: keyof typeof editorialSources }) {
  const source = editorialSources[name];
  return <a className={styles.source} href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={13}/></a>;
}

export default function AutumnSkincareArticle() {
  const products = autumnProductIds.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return <main id="main" className={styles.journal}>
    <article>
      <header className={styles.articleHeader}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><a href="/">Главная</a><ChevronRight size={14}/><span>Журнал Grace</span></nav>
        <div className={styles.articleHeading}><span className={styles.kicker}>GRACE JOURNAL / THE AUTUMN EDIT</span><h1>{autumnEditorial.title}</h1><p>{autumnEditorial.subtitle}</p><a className={styles.jump} href="#autumn-products">К подборке средств <ArrowDown size={16}/></a></div>
        <figure className={styles.cover}><img src={autumnEditorial.cover} width={1536} height={1024} alt="Уход как осенний ритуал: тёплый свет, кремовые текстуры и бордовый акцент" loading="eager" fetchPriority="high"/></figure>
      </header>

      <section className={styles.intro} id="season">
        <span className={styles.kicker}>НОВЫЙ СЕЗОН / ПРИВЫЧНЫЙ КОМФОРТ</span>
        <h2>Как меняется кожа осенью</h2>
        <p>С приходом холодной, сухой погоды и отопления кожа может быстрее терять влагу. Иногда это ощущается как стянутость, сухость или шелушение.</p>
        <p>Отправная точка — не дата в календаре, а комфорт кожи. Ниже — ориентиры для мягкой сезонной настройки ухода.</p>
        <Source name="winter"/>
      </section>

      <nav className={styles.contents} aria-label="Разделы статьи">{autumnChapters.map(chapter => <a key={chapter.id} href={'#'+chapter.id}>{chapter.eyebrow.split(' / ')[0]} <span>{chapter.title}</span></a>)}</nav>

      <div className={styles.chapters}>{autumnChapters.map((chapter, index) => <section key={chapter.id} id={chapter.id} className={`${styles.chapter} ${index % 2 ? styles.reverse : ''}`}>
        <figure className={styles.chapterImage}><img src={'/images/autumn-editorial/'+chapter.image} width={1536} height={1024} alt={chapter.alt} loading="lazy" decoding="async"/></figure>
        <div className={styles.chapterCopy}><span className={styles.kicker}>{chapter.eyebrow}</span><h2>{chapter.title}</h2><p className={styles.accent}>{chapter.accent}</p><p>{chapter.text}</p><div className={styles.takeaway}><span>НА ПРАКТИКЕ</span><p>{chapter.tip}</p></div><Source name={chapter.source}/></div>
      </section>)}</div>

      <section className={styles.summary} id="summary">
        <img src="/images/autumn-editorial/ritual.png" width={1536} height={1024} alt="Три базовых шага ухода: очищение, крем и солнцезащита" loading="lazy"/>
        <div><span className={styles.kicker}>ЕСЛИ КОРОТКО</span><h2>Не больше средств.<br/>Больше внимания коже.</h2><p>Мягко очищай. Увлажняй. Береги барьер. Не усиливай отшелушивание на фоне сухости. Сохраняй солнцезащиту.</p><a className={styles.summaryLink} href="#autumn-products">Выбрать свой уход <ArrowDown size={18}/></a><div className={styles.summarySources}><Source name="dry"/><Source name="winter"/><Source name="spf"/></div></div>
      </section>

      <aside className={styles.editorialNote}><p>Материал — об общих принципах ухода, не индивидуальная схема лечения. При стойком жжении, зуде или трещинах обратись к дерматологу. <Source name="dry"/></p><p>Редакционные изображения созданы с помощью ИИ. Упаковки в этих сценах не изображают конкретные товары каталога.</p></aside>
    </article>

    <section className={styles.products} id="autumn-products" aria-labelledby="autumn-products-title">
      <div className={styles.productsHeading}><span className={styles.kicker}>ПОДБОРКА GRACE</span><h2 id="autumn-products-title">Уход для нового сезона</h2><p>Очищение, увлажнение, барьерные кремы и SPF из каталога. Это варианты для выбора, а не список обязательных покупок: сверяй состав, инструкцию и потребности кожи.</p></div>
      <ProductRail products={products} label="Средства для осеннего ухода"/>
      <a href="/" className={styles.back}><ArrowLeft size={16}/>На главную Grace</a>
    </section>
  </main>;
}

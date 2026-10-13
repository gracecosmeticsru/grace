import {notFound} from 'next/navigation';
import {legalDocuments} from '@/lib/legal-documents';
import {storeDetails as store} from '@/lib/store-details';
import styles from '@/components/site-footer.module.css';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const document=legalDocuments.find(d=>d.slug===slug);
 return {title:document?.title??'Документ не найден'};
}

export default async function LegalPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const document=legalDocuments.find(d=>d.slug===slug);
 if(!document)notFound();
 return <main id="main" className={'wrap '+styles.info}>
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><a href="/info#requisites">Информация и документы</a></nav>
  <h1>{document.title}</h1><p className={styles.documentDate}>Редакция от 23 сентября 2026 года</p><p>{document.intro}</p>
  <nav className={styles.documentLinks} aria-label="Содержание документа">{document.sections.map((s,i)=><a href={'#section-'+(i+1)} key={s.title}>{s.title}</a>)}</nav>
  {document.sections.map((section,i)=><section id={'section-'+(i+1)} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}
  <section id="seller"><h2>Реквизиты и связь</h2><p>{store.seller}<br/>ИНН {store.inn} · ОГРНИП {store.ogrnip}<br/>Юридический адрес: {store.legalAddress}</p><p><a href={'mailto:'+store.email}>{store.email}</a><br/><a href={'tel:'+store.phone}>{store.phoneLabel}</a></p><p><a href="/info#requisites">Все реквизиты</a> · <a href="/info#contacts">Контакты магазина</a></p></section>
  <nav className={styles.documentLinks} aria-label="Другие документы">{legalDocuments.filter(d=>d.slug!==slug).map(d=><a href={'/legal/'+d.slug} key={d.slug}>{d.title}</a>)}</nav>
 </main>;
}

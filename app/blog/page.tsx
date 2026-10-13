import {ArticleCards} from '@/components/journal';
import styles from '@/components/journal.module.css';
export const metadata={title:'Блог Grace — о повседневном уходе',description:'Три простых гайда Grace: осенний уход, ежедневный уход за телом и забота о сухой коже.'};
export default function Blog(){return <main id="main" className={'wrap '+styles.index}>
 <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><span>Блог</span></nav>
 <header className={styles.indexHeader}><span className={styles.kicker}>ЖУРНАЛ GRACE</span><h1>О времени для себя</h1><p>Понятные шаги ухода, полезные привычки и средства, которые можно выбрать под свой ритм.</p></header>
 <div className={styles.articleGrid}><ArticleCards/></div>
 </main>;}

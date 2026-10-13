import { ArrowUpRight } from 'lucide-react';
import { autumnEditorial } from '@/lib/autumn-editorial';
import styles from './autumn-promo.module.css';

export default function AutumnEditorialPromo() {
  return <a href={autumnEditorial.href} className={styles.promo} aria-label={`${autumnEditorial.title} — читать статью`}>
    <div className={styles.image}><img src={autumnEditorial.cover} width={1536} height={1024} alt="" loading="lazy"/></div>
    <div className={styles.copy}><span className={styles.kicker}>ЖУРНАЛ GRACE · УХОД</span><h2>{autumnEditorial.title}</h2><span className={styles.read}>Читать статью <ArrowUpRight size={18}/></span></div>
  </a>;
}

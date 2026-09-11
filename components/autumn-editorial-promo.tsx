import { ArrowUpRight } from 'lucide-react';
import { autumnEditorial } from '@/lib/autumn-editorial';
import styles from './autumn-editorial.module.css';

export default function AutumnEditorialPromo() {
  return <a href={autumnEditorial.href} className={styles.promo} aria-label={`${autumnEditorial.title} — читать статью`}>
    <div className={styles.promoImage}><img src={autumnEditorial.cover} width={1536} height={1024} alt="Осенняя композиция ухода: кремовые текстуры, стекло и тёплый свет" loading="lazy"/><span className={styles.imageLabel}>THE AUTUMN EDIT</span></div>
    <div className={styles.promoCopy}><span className={styles.kicker}>GRACE JOURNAL / УХОД</span><h2>{autumnEditorial.title}</h2><p>{autumnEditorial.subtitle}</p><span className={styles.read}>Читать статью <ArrowUpRight size={20}/></span></div>
  </a>;
}

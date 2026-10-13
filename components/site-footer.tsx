import Link from '@/components/site-link';
import {ArrowUpRight} from 'lucide-react';
import nodes from '@/data/navigation.json';
import {storeDetails as store} from '@/lib/store-details';
import styles from './site-footer.module.css';

export default function SiteFooter(){
 return <footer className={styles.footer} id="site-footer">
  <div className={'wrap '+styles.columns}>
   <div className={styles.identity}>
    <Link href="/" className={styles.logo} aria-label="Grace Cosmetics — главная"><img src="/brand/grace-logo-master.png" width={2022} height={778} alt="" className="brand-logo brand-logo-light" loading="lazy"/></Link>
    <p>Косметика и парфюмерия</p>
   </div>
   <nav className={styles.group} aria-labelledby="footer-shop-title">
    <h2 id="footer-shop-title">Магазин</h2>
    <Link href="/catalog">Все товары</Link>
    {nodes.filter(n=>!n.parent).map(n=><Link key={n.path} href={'/catalog/'+n.path}>{n.name}</Link>)}
    <Link href="/brands">Все бренды</Link>
   </nav>
   <nav className={styles.group} aria-labelledby="footer-buyer-title">
    <h2 id="footer-buyer-title">Покупателю</h2>
    <Link href="/info#order">Как сделать заказ</Link>
    <Link href="/info#delivery">Доставка</Link>
    <Link href="/info#payment">Оплата</Link>
    <Link href="/legal/returns">Обмен и возврат</Link>
    <Link href="/favorites">Избранное</Link>
    <Link href="/bag">Корзина</Link>
   </nav>
   <nav className={styles.group} aria-labelledby="footer-grace-title">
    <h2 id="footer-grace-title">Grace</h2>
    <Link href="/info#about">О Grace</Link>
    <Link href="/blog">Блог об уходе</Link>
    <Link href="/info#contacts">Контакты</Link>
    <Link href="/info#requisites">Реквизиты</Link>
    <Link href="/legal/offer">Публичная оферта</Link>
    <Link href="/legal/privacy">Политика конфиденциальности</Link>
    <Link href="/legal/consent">Согласие на обработку данных</Link>
   </nav>
   <div className={styles.group}>
    <h2>Контакты</h2>
    <a href={'tel:'+store.phone}>{store.phoneLabel}</a>
    <a href={'mailto:'+store.email}>{store.email}</a>
    <address className={styles.address}>{store.shopAddress}<br/><span>Время работы: {store.hours}</span></address>
    <div className={styles.socials}><a href={store.whatsapp} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={15} aria-hidden="true"/></a><a href={store.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={15} aria-hidden="true"/></a></div>
   </div>
  </div>
  <div className={'wrap '+styles.bottom}>
   <span>© Grace Cosmetics, 2026<br/>{store.seller} · ИНН {store.inn}</span>
   <p>Заявку и оплату согласует менеджер.<br/>Стоимость доставки уточняется после заказа.</p>
  </div>
 </footer>;
}

import styles from '@/components/site-footer.module.css';
import {storeDetails as store} from '@/lib/store-details';

export const metadata={title:'О Grace, доставке и оплате',description:'Grace Cosmetics: каталог косметики и парфюмерии, согласование заказа с менеджером, доставка и оплата.'};

export default function StoreInfo(){
 return <main id="main" className={'wrap '+styles.info}>
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><span>Информация для покупателя</span></nav>
  <h1>О Grace и вашем заказе</h1>
  <section id="about"><h2>О Grace</h2><p>Grace Cosmetics — каталог косметики и парфюмерии. Здесь можно выбрать макияж, уход за лицом, телом и волосами, ароматы и аксессуары.</p><p>Смотрите <a href="/catalog">все товары</a>, ищите любимые <a href="/brands">бренды</a> и читайте <a href="/blog">блог об уходе</a>.</p></section>
  <section id="order"><h2>Как сделать заказ</h2><p>Выберите нужный оттенок или объём товара и добавьте его в корзину. В <a href="/bag">корзине</a> проверьте выбранные варианты и количество, затем перейдите к оформлению. Если отправка через форму недоступна, скопируйте список и передайте его менеджеру через указанную там ссылку.</p><p>Заявку подтверждает менеджер. До оплаты согласуйте с ним наличие выбранных товаров и условия заказа.</p></section>
  <section id="delivery"><h2>Доставка</h2><p>Доставка — СДЭК или почтой. Способ и стоимость доставки уточнит менеджер после заказа. В корзине указана сумма товаров без стоимости доставки.</p><p>Сроки доставки согласовываются с менеджером для вашего адреса.</p></section>
  <section id="payment"><h2>Оплата</h2><p>Способ и порядок оплаты согласовываются с менеджером после подтверждения заявки. Онлайн-оплата на сайте не предусмотрена.</p></section>
  <section id="contacts"><h2>Контакты</h2><dl className={styles.details}>
   <dt>Телефон</dt><dd><a href={'tel:'+store.phone}>{store.phoneLabel}</a></dd>
   <dt>Электронная почта</dt><dd><a href={'mailto:'+store.email}>{store.email}</a></dd>
   <dt>Магазин</dt><dd>{store.shopAddress}</dd>
   <dt>Время работы</dt><dd>{store.hours}</dd>
   <dt>Связаться с нами</dt><dd><a href={store.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a> · <a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a></dd>
  </dl></section>
  <section id="requisites"><h2>Реквизиты продавца</h2><dl className={styles.details}>
   <dt>Продавец</dt><dd>{store.seller}</dd>
   <dt>ИНН</dt><dd>{store.inn}</dd>
   <dt>ОГРНИП</dt><dd>{store.ogrnip}</dd>
   <dt>Юридический адрес</dt><dd>{store.legalAddress}</dd>
   <dt>Фактический адрес ИП</dt><dd>{store.actualAddress}</dd>
   <dt>Расчётный счёт</dt><dd>{store.account}</dd>
   <dt>Банк</dt><dd>{store.bank}</dd>
   <dt>БИК</dt><dd>{store.bik}</dd>
   <dt>Корреспондентский счёт</dt><dd>{store.correspondentAccount} в {store.bankBranch}</dd>
  </dl></section>
  <nav className={styles.documentLinks} aria-label="Документы Grace"><a href="/legal/offer">Публичная оферта</a><a href="/legal/privacy">Политика конфиденциальности</a><a href="/legal/consent">Согласие на обработку данных</a><a href="/legal/returns">Обмен и возврат</a></nav>
 </main>;
}

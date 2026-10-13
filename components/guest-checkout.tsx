"use client";

import {useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes} from 'react';
import Link from '@/components/site-link';
import {ArrowLeft, ArrowRight, ShoppingBag} from 'lucide-react';
import {useShop} from './store-shell';
import {ProductImage} from './product-card';
import {Skeleton} from './ui/skeleton';
import {formatPrice} from '@/lib/pricing';
import {variantProductUrl} from '@/lib/variant-product';
import {demoInventory, stockNotice} from '@/lib/demo-inventory';
import {
  checkoutTotal, checkoutUnavailableMessage, emptyCheckoutFields, prepareGuestOrder, submitGuestOrder,
  type CheckoutErrors, type CheckoutFields,
} from '@/lib/guest-checkout';
import styles from './guest-checkout.module.css';
import {CdekPickupList} from './cdek-pickup-list';
import {confirmOrderQuote, createOrderClient, orderSubmission} from '@/lib/order-client';
import type {OrderQuoteLine, OrderSubmission} from '@/lib/order-contract';
import {storeDetails} from '@/lib/store-details';

export function GuestCheckout({ordersEnabled = false, friendsOrders = false, pickupEnabled = true}: {ordersEnabled?: boolean; friendsOrders?: boolean; pickupEnabled?: boolean}) {
  const {bag, ready, consumeOrder} = useShop();
  const [fields, setFields] = useState<CheckoutFields>({...emptyCheckoutFields, ...(!pickupEnabled ? {delivery: 'cdek-courier' as const} : {})});
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [savedOrder, setSavedOrder] = useState('');
  const [review, setReview] = useState<{basis: OrderSubmission; submission: OrderSubmission; quote: OrderQuoteLine[]} | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const pendingSubmission = useRef<OrderSubmission | null>(null);
  const submitting = useRef(false);
  const client = useRef<ReturnType<typeof createOrderClient> | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const receipt = useRef<HTMLElement>(null);
  const focusRequested = useRef(false);
  useEffect(() => {if (savedOrder) receipt.current?.focus();}, [savedOrder]);
  useEffect(() => {
    if (busy || savedOrder || !focusRequested.current) return;
    focusRequested.current = false;
    const key = Object.keys(errors).find(name => errors[name as keyof CheckoutErrors]);
    const target = key && form.current?.querySelector<HTMLElement>(`[name="${key}"]`);
    if (target) target.focus();
    else if (message) feedback.current?.focus();
  }, [busy, savedOrder, errors, message]);

  function update<K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) {
    setFields(previous => ({...previous, [key]: value, ...(key === 'city' ? {pickupPoint: null} : {})}));
    setErrors(previous => key === 'delivery' ? {} : {...previous, [key]: undefined});
    setMessage('');
    setReview(null);
  }

  function showErrors(next: CheckoutErrors) {
    focusRequested.current = true;
    setErrors(next);
  }

  async function check(event?: FormEvent<HTMLFormElement>, confirmed = false) {
    event?.preventDefault();
    if (submitting.current || savedOrder) return;
    setMessage('');
    const result = pendingSubmission.current ? {ok: true as const, request: pendingSubmission.current.order} : prepareGuestOrder(fields, bag);
    if (!result.ok) {
      showErrors(result.fields);
      return;
    }
    let submission = pendingSubmission.current ?? orderSubmission(result.request, bag);
    const basis = submission;
    if (confirmed && !pendingSubmission.current) {
      if (!review || JSON.stringify(submission) !== JSON.stringify(review.basis)) {
        setReview(null);
        setMessage('Данные или корзина изменились. Отправьте их на повторную проверку.');
        return;
      }
      const adjusted = confirmOrderQuote(review.submission, review.quote);
      if (!adjusted) return;
      submission = adjusted;
    } else if (review && !pendingSubmission.current) return;
    let restoredTerms = '';
    if (ordersEnabled && !pendingSubmission.current) {
      client.current ??= createOrderClient();
      const recovered = client.current.recoverSubmission(submission);
      if (!recovered.ok) {setMessage(recovered.message); return;}
      submission = recovered.submission;
      if (recovered.restored) {
        restoredTerms = 'Повторяем ранее подтверждённый состав и цены; текущая корзина не изменена. ';
        setMessage(restoredTerms);
      }
    }
    setErrors({});
    submitting.current = true;
    setBusy(true);
    let focusFields: CheckoutErrors | undefined;
    try {
      if (!ordersEnabled) {
        const response = await submitGuestOrder(result.request);
        setMessage(response.ok ? checkoutUnavailableMessage : response.message);
        if (!response.ok && response.fields) focusFields = response.fields;
      } else {
        client.current ??= createOrderClient();
        pendingSubmission.current = submission;
        const response = await client.current.submit(submission, basis);
        const unresolved = !response.ok && (['network', 'session'].includes(response.code) || (response.code === 'conflict' && uncertain));
        setUncertain(unresolved);
        if (!unresolved) pendingSubmission.current = null;
        if (response.ok) {
          consumeOrder(submission.order.items);
          setSavedOrder(response.orderId);
          setReview(null);
        } else {
          setMessage(restoredTerms + response.message);
          if (response.code === 'cart_changed') setReview({basis: review?.basis ?? basis, submission, quote: response.quote});
          else if (response.fields) focusFields = response.fields;
        }
      }
    } catch {
      if (ordersEnabled) setUncertain(true);
      setMessage('Подтверждение не получено. Введённые данные и корзина остались на месте. Повторите попытку с теми же данными.');
    } finally {
      focusRequested.current = true;
      submitting.current = false;
      setBusy(false);
      if (focusFields) showErrors(focusFields);
    }
  }

  function input(name: Exclude<keyof CheckoutFields, 'delivery' | 'pickupPoint' | 'comment'>, label: string,
    attributes: InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) {
    const id = `checkout-${name}`;
    return <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input {...attributes} id={id} name={name} value={fields[name]} required={attributes.required ?? true} disabled={busy || uncertain}
        onChange={event => update(name, event.target.value)} aria-invalid={!!errors[name]}
        aria-describedby={[hint && `${id}-hint`, errors[name] && `${id}-error`].filter(Boolean).join(' ') || undefined}/>
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {errors[name] && <p id={`${id}-error`} className={styles.error}>{errors[name]}</p>}
    </div>;
  }

  const total = checkoutTotal(bag);
  const deliveryNote = fields.delivery === 'store-pickup' ? 'Готовность заказа к самовывозу подтвердит менеджер' : 'Стоимость доставки уточнит менеджер';
  return <main id="main" className={`wrap personal-main ${styles.main}`}>
    <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/bag">Корзина</Link><span>/</span><span>Оформление</span></div>
    <span className="eyebrow">GRACE · ТВОЙ ВЫБОР</span>
    <h1>Оформление заказа</h1>
    {!ready ? <Skeleton className="h-72 w-full"/> : savedOrder ? <section ref={receipt} tabIndex={-1} className={styles.receipt} aria-labelledby="order-receipt-title">
      <h2 id="order-receipt-title">{friendsOrders ? 'Заявка принята' : 'Тестовая заявка сохранена'}</h2>
      <p>Номер заявки: <strong>{savedOrder}</strong></p>
      <p>{friendsOrders ? 'Заявка сохранена. Менеджер свяжется с вами в WhatsApp, подтвердит цену, наличие и доставку. Оплачивать сейчас ничего не нужно.' : 'Это изолированная проверка. Реальный заказ не оформлен, сообщения менеджеру и покупателю не отправлялись.'}</p>
      <p>{bag.length ? 'В корзине остались позиции и количество, которые не вошли в эту заявку.' : 'Все отправленные позиции убраны из корзины.'}</p>
      <Link href="/bag" className="button primary">Вернуться в корзину <ArrowRight size={18}/></Link>
    </section> : !bag.length && !uncertain && !busy ? <section className={styles.empty}>
      <ShoppingBag size={36} strokeWidth={1}/><h2>В корзине пока пусто</h2>
      <p>Выберите товары и нужные объёмы или оттенки.</p>
      <Link href="/catalog" className="button primary">Перейти в каталог <ArrowRight size={18}/></Link>
    </section> : <>
      <p className={styles.intro}>Без регистрации. Доставка по России. Подтверждение заказа и оплата — через менеджера.</p>
      <div className={styles.notice}><strong>{friendsOrders ? 'Оформление через менеджера' : ordersEnabled ? 'Изолированная тестовая заявка' : 'Форма для проверки'}</strong><p>{friendsOrders ? 'Оставьте заявку на выбранные товары. Цена, наличие и условия получения требуют подтверждения менеджером. Указанные контакты и данные получения будут переданы менеджеру для обработки заявки.' : ordersEnabled ? 'Данные будут сохранены только в локальную тестовую базу. Не вводите реальные контакты. Реальные заказы и уведомления отключены. После сохранения из корзины вычитаются только заказанные количества.' : 'Заказы через сайт пока не принимаются. Можно проверить заполнение формы. Не вводите реальные контактные данные.'}</p></div>
      <div className={styles.layout}>
        <form ref={form} noValidate onSubmit={check} className={styles.form} aria-label="Данные для заказа" aria-busy={busy}>
          <fieldset disabled={busy || uncertain}><legend>1. Получатель</legend>
            {input('fullName', 'Фамилия, имя, отчество', {autoComplete: 'name', maxLength: 150}, 'Отчество — при наличии.')}
            {input('phone', 'Телефон WhatsApp', {type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 30}, 'Менеджер напишет в WhatsApp. Укажите номер с кодом страны.')}
          </fieldset>
          <fieldset disabled={busy || uncertain}><legend>2. Доставка</legend>
            <div className={styles.methods}>
              <label><input type="radio" name="delivery" value="cdek" disabled={!pickupEnabled} checked={fields.delivery === 'cdek'} onChange={() => update('delivery', 'cdek')}/><span>СДЭК<small>В пункт выдачи</small></span></label>
              <label><input type="radio" name="delivery" value="cdek-courier" checked={fields.delivery === 'cdek-courier'} onChange={() => update('delivery', 'cdek-courier')}/><span>СДЭК<small>Курьер до двери</small></span></label>
              <label><input type="radio" name="delivery" value="store-pickup" checked={fields.delivery === 'store-pickup'} onChange={() => update('delivery', 'store-pickup')}/><span>Самовывоз<small>{storeDetails.shopAddress}</small></span></label>
            </div>
            {!pickupEnabled && <p className={styles.hint}>Пункты выдачи СДЭК временно недоступны. Выберите курьера или самовывоз.</p>}
            {fields.delivery === 'cdek-courier' && input('region', 'Область, край или республика', {autoComplete: 'address-level1', maxLength: 120})}
            {fields.delivery === 'cdek' ? <CdekPickupList city={fields.city} selected={fields.pickupPoint} cityError={errors.city} error={errors.pickupPoint} onCityChange={value => update('city', value)} onSelect={point => {
              setFields(previous => ({...previous, city: point.city, pickupPoint: point}));
              setErrors(previous => ({...previous, city: undefined, pickupPoint: undefined}));setMessage('');setReview(null);
            }}/> : fields.delivery === 'store-pickup' ? null : <>
              {input('city', 'Город или населённый пункт', {autoComplete: 'address-level2', maxLength: 120})}
              {input('address', 'Улица, дом, корпус', {autoComplete: 'address-line1', maxLength: 250})}
              {input('apartment', 'Квартира или офис — необязательно', {autoComplete: 'address-line2', maxLength: 30, required: false})}
            </>}
            <p className={styles.deliveryNote}>{deliveryNote}</p>
          </fieldset>
          <div className={styles.field}>
            <label htmlFor="checkout-comment">Комментарий — необязательно</label>
            <textarea id="checkout-comment" name="comment" rows={2} maxLength={500} value={fields.comment} disabled={busy || uncertain} onChange={event => update('comment', event.target.value)}
              aria-invalid={!!errors.comment} aria-describedby={errors.comment ? 'checkout-comment-error' : undefined} placeholder="Пожелания к заказу или доставке"/>
            {errors.comment && <p className={styles.error} id="checkout-comment-error">{errors.comment}</p>}
          </div>
          {Object.values(errors).some(Boolean) && <p role="alert" className={styles.error}>Проверьте отмеченные поля.{errors.items && ` ${errors.items}`}</p>}
          <div ref={feedback} tabIndex={-1} role="status" className={message ? styles.feedback : undefined}>{message}</div>
          {review && !uncertain && <section className={styles.review} aria-labelledby="order-review-title">
            <h2 id="order-review-title">Проверьте изменения</h2>
            <p>Сервер уточнил цену или доступное количество. Заявка ещё не сохранена.</p>
            <ul>{review.quote.map(line => <li key={line.variantId}>
              <strong>{line.name} · {line.label}</strong>
              <span>Количество: {line.requestedQuantity} → {line.quantity} шт.{line.quantity === 0 && ' — не войдёт в заявку'}</span>
              <span>Цена за штуку: {formatPrice((review.submission.expectedPrices.find(item => item.variantId === line.variantId)?.unitPriceKopecks ?? 0) / 100 || null)} → {formatPrice(line.unitPriceKopecks === null ? null : line.unitPriceKopecks / 100)}</span>
            </li>)}</ul>
            <p>Сумма товаров: <strong>{formatPrice(review.quote.reduce((total, line) => total + (line.unitPriceKopecks || 0) * line.quantity, 0) / 100 || null)}</strong></p>
            {confirmOrderQuote(review.submission, review.quote) ? <button type="button" className="button primary" disabled={busy} onClick={() => check(undefined, true)}>{friendsOrders ? 'Подтвердить изменения и отправить заявку' : 'Подтвердить изменения и сохранить тестовую заявку'}</button> : <p>Нет доступных позиций для подтверждения. Измените корзину.</p>}
            <button type="button" className="button" disabled={busy} onClick={() => {setReview(null);setMessage('Изменения не приняты. Корзина и данные формы сохранены.');}}>Не принимать изменения</button>
          </section>}
          {(!review || uncertain) && <button type="submit" className="button primary" disabled={busy}>{busy ? 'Проверяем…' : uncertain ? 'Повторить неподтверждённую отправку' : friendsOrders ? 'Отправить заявку' : ordersEnabled ? 'Сохранить тестовую заявку' : 'Проверить данные'}<ArrowRight size={18}/></button>}
          <p className={styles.hint}>{ordersEnabled ? 'Успех будет показан только после сохранения. При ошибке повторите отправку с теми же данными. Контакты не сохраняются в браузере и пропадут после перезагрузки.' : 'Проверка не отправляет заказ. Данные остаются только в открытой форме и не сохраняются после перезагрузки.'}</p>
          <a href="/legal/privacy" className={styles.privacy}>Политика конфиденциальности</a>
        </form>
        <aside className={styles.summary} aria-labelledby="checkout-summary-title">
          <div className={styles.summaryHeading}><h2 id="checkout-summary-title">Твой заказ</h2><Link href="/bag">Изменить</Link></div>
          <ul className={styles.items}>{bag.map(line => <li key={line.variant.id}>
            <Link className={styles.image} href={variantProductUrl(line.product, line.variant)} aria-label={`${line.product.name}, ${line.variant.label}`}><ProductImage product={line.product} variant={line.variant}/></Link>
            <div className={styles.itemCopy}><span className="product-brand">{line.product.brand}</span><Link href={variantProductUrl(line.product, line.variant)}>{line.product.name}</Link>
              <p>{line.variant.label} · {line.quantity} шт.</p><p className={styles.hint}>Код: {line.variant.sku || line.variant.id}</p>
              <strong>{formatPrice(line.variant.price)}{line.quantity > 1 && ' / шт.'}</strong>
            </div>
          </li>)}</ul>
          <div className={styles.total}><span>Сумма товаров · {bag.reduce((count, line) => count + line.quantity, 0)} шт.</span><strong>{formatPrice(total)}</strong></div>
          {total === null && <p className={styles.hint}>Цена есть не у всех товаров. Сумму уточнит менеджер.</p>}
          <p className={styles.deliveryNote}>{deliveryNote}</p>
          <p className={styles.hint}>{demoInventory.enabled && `${stockNotice} `}Цену и наличие подтвердит менеджер.</p>
          <Link href="/bag" className={styles.back}><ArrowLeft size={16}/> Вернуться в корзину</Link>
        </aside>
      </div>
    </>}
  </main>;
}

import type {GuestOrderRequest, CheckoutErrors} from './guest-checkout';
import type {OrderResult, OrderSubmission, OrderQuoteLine} from './order-contract';
import type {BagLine} from './shop-state';

export const orderAttemptKey = 'grace-order-attempt';
type AttemptCart = {items: OrderSubmission['order']['items']; expectedPrices: OrderSubmission['expectedPrices']};
type Attempt = {key: string; hash: string; cart?: AttemptCart; basisCart?: AttemptCart};
type AttemptStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const uuid = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, limit: number): value is string => typeof value === 'string' && value.length > 0 && value.length <= limit;
const integer = (value: unknown, max: number): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const networkFailure = (): OrderResult => ({ok: false, code: 'network', message: 'Подтверждение не получено. Заказ мог сохраниться. Повторите отправку с теми же данными: сохранённый номер попытки используется для защиты от дублей.'});
const storageFailure = () => ({ok: false as const, code: 'unavailable' as const, message: 'Не удалось безопасно сохранить номер попытки в браузере. Заказ не отправлен. Проверьте доступ к хранилищу браузера; не удаляйте данные неподтверждённой отправки.'});
const retryConflict = () => ({ok: false as const, code: 'conflict' as const, message: 'Предыдущая отправка ещё не подтверждена. Восстановите те же данные и состав заказа и повторите её. Новый заказ не отправлен, чтобы избежать дубля.'});
const exactKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const identifier = (value: unknown): value is string => text(value, 150) && !/[\u0000-\u001f\u007f]/.test(value);
function validCart(value: unknown): value is AttemptCart {
  if (!record(value) || !exactKeys(value, ['items', 'expectedPrices']) || !Array.isArray(value.items) || !Array.isArray(value.expectedPrices) ||
    !value.items.length || value.items.length > 100 || value.expectedPrices.length !== value.items.length) return false;
  const seen = new Set<string>();
  for (const item of value.items) {
    if (!record(item) || !exactKeys(item, ['productId', 'variantId', 'quantity']) || !identifier(item.productId) || !identifier(item.variantId) ||
      !integer(item.quantity, 99) || item.quantity < 1 || seen.has(item.variantId)) return false;
    seen.add(item.variantId);
  }
  for (const price of value.expectedPrices) {
    if (!record(price) || !exactKeys(price, ['variantId', 'unitPriceKopecks']) || !identifier(price.variantId) || !seen.delete(price.variantId) ||
      !(price.unitPriceKopecks === null || (integer(price.unitPriceKopecks, Number.MAX_SAFE_INTEGER) && price.unitPriceKopecks > 0))) return false;
  }
  return !seen.size;
}
function cartOf(submission: OrderSubmission): AttemptCart {
  return {items: submission.order.items.map(({productId, variantId, quantity}) => ({productId, variantId, quantity})),
    expectedPrices: submission.expectedPrices.map(({variantId, unitPriceKopecks}) => ({variantId, unitPriceKopecks}))};
}
function readAttempt(store: AttemptStorage): Attempt | null {
  const raw = store.getItem(orderAttemptKey);
  if (raw === null) return null;
  if (raw.length > 200_000) throw Error('Oversized attempt');
  const value: unknown = JSON.parse(raw);
  if (!record(value) || typeof value.key !== 'string' || !uuid.test(value.key) || typeof value.hash !== 'string' || !/^[\da-f]{64}$/.test(value.hash)) throw Error('Invalid attempt');
  if (exactKeys(value, ['key', 'hash'])) return value as Attempt;
  if (!exactKeys(value, ['key', 'hash', 'cart', 'basisCart']) || !validCart(value.cart) || !validCart(value.basisCart)) throw Error('Invalid attempt cart');
  const basisCart = value.basisCart;
  if (value.cart.items.some(item => !basisCart.items.some(basis => basis.productId === item.productId && basis.variantId === item.variantId && basis.quantity >= item.quantity))) throw Error('Invalid accepted cart');
  return value as Attempt;
}

export function orderSubmission(order: GuestOrderRequest, bag: BagLine[]): OrderSubmission {
  return {order, expectedPrices: order.items.map(item => {
    const price = bag.find(line => line.product.id === item.productId && line.variant.id === item.variantId)?.variant.price;
    const kopecks = typeof price === 'number' ? Math.round(price * 100) : null;
    return {variantId: item.variantId, unitPriceKopecks: kopecks !== null && Number.isSafeInteger(kopecks) && kopecks > 0 ? kopecks : null};
  })};
}

function parseResult(value: unknown, submission: OrderSubmission): OrderResult | null {
  if (!record(value)) return null;
  if (value.ok === true) return text(value.orderId, 80) && /^[a-z\d-]+$/i.test(value.orderId) ? {ok: true, orderId: value.orderId} : null;
  if (value.ok !== false || !text(value.message, 1000)) return null;
  if (value.code === 'cart_changed') {
    if (!Array.isArray(value.quote) || value.quote.length !== submission.order.items.length) return null;
    const seen = new Set<string>();
    for (const line of value.quote) {
      if (!record(line) || !text(line.variantId, 200) || seen.has(line.variantId)) return null;
      const requested = submission.order.items.find(item => item.productId === line.productId && item.variantId === line.variantId);
      if (!requested || line.requestedQuantity !== requested.quantity || !integer(line.quantity, requested.quantity) ||
        !(line.unitPriceKopecks === null || (integer(line.unitPriceKopecks, Number.MAX_SAFE_INTEGER) && line.unitPriceKopecks > 0)) ||
        !(line.available === null || integer(line.available, Number.MAX_SAFE_INTEGER)) ||
        (line.available !== null && line.quantity > line.available) || ((line.available === null || line.unitPriceKopecks === null) && line.quantity !== 0) ||
        !text(line.name, 500) || typeof line.label !== 'string' || line.label.length > 500 ||
        !(line.sku === null || (typeof line.sku === 'string' && line.sku.length <= 150)) || !text(line.revision, 200) ||
        !['isolated-test', 'inventory', 'catalog-review'].includes(String(line.source))) return null;
      seen.add(line.variantId);
    }
    return {ok: false, code: 'cart_changed', message: value.message, quote: value.quote as OrderQuoteLine[]};
  }
  if (!['validation', 'unavailable', 'network', 'conflict', 'rate_limited', 'session'].includes(String(value.code))) return null;
  const fields: CheckoutErrors = {};
  if (value.fields !== undefined) {
    if (!record(value.fields)) return null;
    for (const [key, message] of Object.entries(value.fields)) {
      if (!['fullName', 'phone', 'delivery', 'city', 'pickupPoint', 'region', 'postcode', 'address', 'apartment', 'comment', 'items'].includes(key) || !text(message, 1000)) return null;
      fields[key as keyof CheckoutErrors] = message;
    }
  }
  return {ok: false, code: value.code as Exclude<OrderResult, {ok: true} | {code: 'cart_changed'}>['code'], message: value.message, ...(value.fields ? {fields} : {})};
}

export function confirmOrderQuote(submission: OrderSubmission, quote: OrderQuoteLine[]): OrderSubmission | null {
  if (!parseResult({ok: false, code: 'cart_changed', message: 'review', quote}, submission)) return null;
  const accepted = quote.filter(line => line.quantity > 0 && line.unitPriceKopecks !== null);
  if (!accepted.length) return null;
  let total = 0;
  for (const line of accepted) {
    total += line.quantity * line.unitPriceKopecks!;
    if (!Number.isSafeInteger(total)) return null;
  }
  return {order: {...submission.order, items: accepted.map(({productId, variantId, quantity}) => ({productId, variantId, quantity}))},
    expectedPrices: accepted.map(({variantId, unitPriceKopecks}) => ({variantId, unitPriceKopecks}))};
}

export function createOrderClient({fetcher = fetch, storage = () => window.sessionStorage, timeoutMs = 12000}: {
  fetcher?: typeof fetch; storage?: () => AttemptStorage; timeoutMs?: number;
} = {}) {
  let pending: Promise<OrderResult> | null = null;
  let pendingBody = '';

  async function json(path: string, body: string, key?: string) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        (async () => {
          const response = await fetcher(path, {method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error',
            headers: {'Content-Type': 'application/json', ...(key ? {'Idempotency-Key': key} : {})}, body, signal: controller.signal});
          if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw Error('Invalid response');
          return {ok: response.ok, value: await response.json() as unknown};
        })(),
        new Promise<never>((_, reject) => {timer = setTimeout(() => {controller.abort(); reject(Error('Timeout'));}, timeoutMs);}),
      ]);
    } finally {clearTimeout(timer!);}
  }

  async function send(submission: OrderSubmission, basis: OrderSubmission): Promise<OrderResult> {
    const body = JSON.stringify(submission);
    let attempt: Attempt;
    let store: AttemptStorage;
    try {
      store = storage();
      const saved = readAttempt(store);
      const key = saved ? saved.key : crypto.randomUUID();
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key + body));
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (saved && saved.hash !== hash) return retryConflict();
      // Keep the original basis during retries, even after an accepted quote.
      attempt = saved ?? {key, hash, cart: cartOf(submission), basisCart: cartOf(basis)};
      store.setItem(orderAttemptKey, JSON.stringify(attempt));
      if (store.getItem(orderAttemptKey) !== JSON.stringify(attempt)) throw Error('Attempt was not saved');
      readAttempt(store);
    } catch {
      return storageFailure();
    }
    try {
      const session = await json('/api/orders/session', '{}');
      if (!session.ok || !record(session.value) || session.value.ok !== true) return networkFailure();
      const response = await json('/api/orders', body, attempt.key);
      const result = parseResult(response.value, submission);
      if (!result || (result.ok && !response.ok) || (!result.ok && response.ok)) return networkFailure();
      if (result.ok || !['network', 'conflict', 'session'].includes(result.code)) {
        // A definitive reply ends this attempt; uncertain replies must retain its key.
        try {store.removeItem(orderAttemptKey);} catch {/* Keep the key for a safe replay. */}
      }
      return result;
    } catch {return networkFailure();}
  }

  return {recoverSubmission(current: OrderSubmission) {
    try {
      const saved = readAttempt(storage());
      if (!saved?.cart || !saved.basisCart) return {ok: true as const, submission: current, restored: false};
      const currentCart = JSON.stringify(cartOf(current));
      const accepted = JSON.stringify(saved.cart);
      if (currentCart !== accepted && currentCart !== JSON.stringify(saved.basisCart)) return retryConflict();
      return {ok: true as const, submission: {...current, order: {...current.order, items: saved.cart.items}, expectedPrices: saved.cart.expectedPrices}, restored: currentCart !== accepted};
    } catch {return storageFailure();}
  }, submit(submission: OrderSubmission, basis: OrderSubmission = submission): Promise<OrderResult> {
    if (pending) return JSON.stringify(submission) === pendingBody ? pending : Promise.resolve({ok: false, code: 'conflict', message: 'Другая отправка ещё не завершена. Дождитесь подтверждения.'});
    pendingBody = JSON.stringify(submission);
    pending = send(submission, basis).finally(() => {pending = null;});
    return pending;
  }};
}

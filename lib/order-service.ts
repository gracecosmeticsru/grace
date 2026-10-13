import {z} from 'zod';
import {emptyCheckoutFields, normalizePhone, validateCheckoutFields} from './guest-checkout.ts';
import {parseCdekPoint, type CdekPickupPoint} from './cdek-pickup.ts';
import type {OrderCatalogVariant, OrderResult, OrderSubmission} from './order-contract.ts';

const maxBodyBytes = 32_768;
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const rateWindow = 10 * 60 * 1000;
const identifier = z.string().min(1).max(150).regex(/^[^\u0000-\u001f\u007f]+$/);
const text = (max: number) => z.string().max(max).regex(/^[^\u0000-\u001f\u007f]*$/);
const pickupSchema = z.object({
  code: text(50).min(1), city: text(120).min(2), address: text(250).min(1), countryCode: z.literal('RU'),
  cityCode: z.number().int().positive().safe().optional(), region: text(120).optional(), workTime: text(500).optional(),
}).strict();
const addressShape = {countryCode: z.literal('RU'), region: text(120), city: text(120), address: text(250), apartment: text(30).optional()};
const priceSchema = z.number().int().positive().safe().nullable();
const submissionSchema = z.object({
  order: z.object({
    schemaVersion: z.literal(1),
    customer: z.object({fullName: text(150), phone: text(40)}).strict(),
    delivery: z.union([
      z.object({method: z.literal('cdek'), mode: z.literal('pickup'), countryCode: z.literal('RU'), pickupPoint: pickupSchema}).strict(),
      z.object({method: z.literal('cdek'), mode: z.literal('courier'), ...addressShape}).strict(),
      z.object({method: z.literal('post'), ...addressShape, postcode: z.string().regex(/^\d{6}$/)}).strict(),
    ]),
    items: z.array(z.object({productId: identifier, variantId: identifier, quantity: z.number().int().min(1).max(99)}).strict()).min(1).max(100),
    comment: z.string().max(500).optional(),
  }).strict(),
  expectedPrices: z.array(z.object({variantId: identifier, unitPriceKopecks: priceSchema}).strict()).min(1).max(100),
}).strict();
const catalogSchema = z.object({
  productId: identifier, variantId: identifier, name: text(500).min(1), label: text(500), sku: text(150).nullable(),
  unitPriceKopecks: priceSchema, available: z.number().int().nonnegative().safe().nullable(),
  revision: text(200).min(1), source: z.enum(['isolated-test', 'inventory', 'catalog-review']),
}).strict();
type SavedOrder = {id: string; request_hash: string; session_hash: string};
type Options = {
  db?: D1Database;
  enabled: boolean;
  lookupVariant: (productId: string, variantId: string) => Promise<OrderCatalogVariant | null> | OrderCatalogVariant | null;
  verifyPickup?: (point: CdekPickupPoint) => Promise<CdekPickupPoint | null>;
  now?: () => number;
};

function respond(body: OrderResult | {ok: true}, status = 200, headers?: Record<string, string>) {
  return Response.json(body, {status, headers: {'Cache-Control': 'no-store', ...headers}});
}
function error(code: Exclude<OrderResult, {ok: true} | {code: 'cart_changed'}>['code'], message: string, status: number) {
  return respond({ok: false, code, message}, status);
}
const unavailable = () => error('unavailable', 'Приём заказов пока недоступен. Данные остались в форме.', 503);
const invalid = () => error('validation', 'Проверьте данные заказа и состав корзины.', 400);

async function hash(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function readJson(request: Request): Promise<unknown> {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes)) throw new Error('body');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 5000);
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (timedOut) throw new Error('body');
      if (done) break;
      size += value.length;
      if (size > maxBodyBytes) throw new Error('body');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
  } finally {
    clearTimeout(timeout);
    void reader.cancel().catch(() => {});
  }
}

function cookieToken(request: Request, cookieName: string) {
  const values = (request.headers.get('cookie') ?? '').split(';').map(part => part.trim())
    .filter(part => part.startsWith(cookieName + '='));
  if (values.length !== 1) return null;
  const token = values[0].slice(cookieName.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

async function withinLimit(db: D1Database, key: string, now: number, limit: number) {
  const row = await db.prepare(`INSERT INTO order_rate_limits (key, window_start, attempts) VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN window_start <= ? THEN 1 ELSE MIN(attempts + 1, ?) END,
      window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END
    RETURNING attempts`).bind(key, now, now - rateWindow, limit + 1, now - rateWindow).first<{attempts: number}>();
  return !!row && row.attempts <= limit;
}

function replay(saved: SavedOrder, requestHash: string, sessionHash: string) {
  if (saved.session_hash !== sessionHash) {
    return error('conflict', 'Защищённая сессия прежней попытки утрачена. Не создавайте новый заказ, пока не проверена предыдущая отправка.', 409);
  }
  return saved.request_hash === requestHash
    ? respond({ok: true, orderId: saved.id})
    : error('conflict', 'Эта попытка уже сохранена с другими данными. Восстановите данные прежней попытки и повторите её.', 409);
}

export function createOrderService({db, enabled, lookupVariant, verifyPickup, now = Date.now}: Options) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (!['/api/orders', '/api/orders/session'].includes(url.pathname)) return invalid();
    if (request.method !== 'POST') return error('validation', 'Используйте отправку формы заказа.', 405);
    if (!enabled || !db) return unavailable();
    if (request.headers.get('origin') !== url.origin ||
      !/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '') ||
      ![null, 'same-origin', 'none'].includes(request.headers.get('sec-fetch-site'))) {
      return error('validation', 'Отправьте заказ через форму на сайте.', 403);
    }
    try {
      const timestamp = now();
      // Cloudflare supplies this header; loopback tests never trust forwarded client identity.
      const ip = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'loopback' : (request.headers.get('cf-connecting-ip') ?? 'unknown');
      if (!await withinLimit(db, 'ip:' + await hash(ip), timestamp, 120)) {
        return error('rate_limited', 'Слишком много попыток. Попробуйте через 10 минут.', 429);
      }
      const cookieName = url.protocol === 'https:' ? '__Host-grace_guest' : 'grace_guest';
      const token = cookieToken(request, cookieName);
      const sessionHash = token ? await hash(token) : null;
      const session = sessionHash ? await db.prepare('SELECT token_hash FROM guest_sessions WHERE token_hash = ? AND expires_at > ?')
        .bind(sessionHash, timestamp).first<{token_hash: string}>() : null;
      let body: unknown;
      try { body = await readJson(request); } catch { return invalid(); }

      if (url.pathname === '/api/orders/session') {
        if (!z.object({}).strict().safeParse(body).success) return invalid();
        if (session) return respond({ok: true});
        if (!await withinLimit(db, 'new-session:' + await hash(ip), timestamp, 20)) {
          return error('rate_limited', 'Слишком много попыток. Попробуйте через 10 минут.', 429);
        }
        const random = crypto.getRandomValues(new Uint8Array(32));
        const nextToken = Array.from(random, byte => byte.toString(16).padStart(2, '0')).join('');
        await db.prepare('INSERT INTO guest_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
          .bind(await hash(nextToken), timestamp, timestamp + sessionLifetime).run();
        return respond({ok: true}, 200, {'Set-Cookie': `${cookieName}=${nextToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetime / 1000}${url.protocol === 'https:' ? '; Secure' : ''}`});
      }

      if (!session) return error('session', 'Обновите защищённую сессию и повторите отправку.', 401);
      const idempotencyKey = request.headers.get('idempotency-key');
      if (!z.string().uuid().safeParse(idempotencyKey).success) return invalid();
      const parsed = submissionSchema.safeParse(body);
      if (!parsed.success) return invalid();
      const submission: OrderSubmission = parsed.data;
      const {order, expectedPrices} = submission;
      const variantIds = new Set(order.items.map(item => item.variantId));
      if (variantIds.size !== order.items.length || expectedPrices.length !== order.items.length ||
        new Set(expectedPrices.map(item => item.variantId)).size !== expectedPrices.length ||
        expectedPrices.some(item => !variantIds.has(item.variantId))) return invalid();
      const {delivery, customer} = order;
      const pickup = delivery.method === 'cdek' && delivery.mode === 'pickup';
      const fields = validateCheckoutFields({...emptyCheckoutFields,
        fullName: customer.fullName, phone: customer.phone, comment: order.comment ?? '',
        ...('pickupPoint' in delivery ? {delivery: 'cdek', city: delivery.pickupPoint.city, pickupPoint: delivery.pickupPoint} : {
          delivery: delivery.method === 'post' ? 'post' : 'cdek-courier', region: delivery.region,
          city: delivery.city, address: delivery.address, apartment: delivery.apartment ?? '',
          postcode: delivery.method === 'post' ? delivery.postcode : '',
        }),
      });
      if (Object.keys(fields).length) return respond({ok: false, code: 'validation', message: 'Проверьте заполнение формы.', fields}, 400);

      const requestHash = await hash(JSON.stringify(submission));
      const findSaved = () => db.prepare('SELECT id, request_hash, session_hash FROM guest_orders WHERE idempotency_key = ?')
        .bind(idempotencyKey).first<SavedOrder>();
      const existing = await findSaved();
      if (existing) return replay(existing, requestHash, session.token_hash);
      if (!await withinLimit(db, 'order:' + session.token_hash, timestamp, 10)) {
        return error('rate_limited', 'Слишком много попыток. Попробуйте через 10 минут.', 429);
      }

      const quote = [];
      for (const item of order.items) {
        const checked = catalogSchema.safeParse(await lookupVariant(item.productId, item.variantId));
        if (!checked.success || checked.data.productId !== item.productId || checked.data.variantId !== item.variantId ||
          checked.data.unitPriceKopecks === null || checked.data.available === null) {
          return error('unavailable', 'Не удалось подтвердить цену или наличие товара. Проверьте корзину позднее.', 409);
        }
        const variant = checked.data;
        quote.push({...variant, quantity: Math.min(item.quantity, variant.available!), requestedQuantity: item.quantity});
      }
      if (quote.some(line => line.quantity !== line.requestedQuantity ||
        line.unitPriceKopecks !== expectedPrices.find(expected => expected.variantId === line.variantId)!.unitPriceKopecks)) {
        return respond({ok: false, code: 'cart_changed', message: 'Цена или доступное количество изменились. Проверьте новый состав и подтвердите его.', quote}, 409);
      }
      let total = 0;
      for (const item of quote) {
        total += item.unitPriceKopecks! * item.quantity;
        if (!Number.isSafeInteger(total)) return unavailable();
      }
      if (pickup) {
        if (!verifyPickup) return error('unavailable', 'Не удалось проверить пункт СДЭК. Выберите другой способ доставки или повторите позднее.', 503);
        const canonical = parseCdekPoint(await verifyPickup(delivery.pickupPoint));
        if (!canonical) return error('unavailable', 'Пункт СДЭК не подтверждён. Выберите пункт заново или повторите позднее.', 503);
        if (canonical.code !== delivery.pickupPoint.code || canonical.city !== delivery.pickupPoint.city ||
          canonical.address !== delivery.pickupPoint.address ||
          (delivery.pickupPoint.cityCode !== undefined && canonical.cityCode !== delivery.pickupPoint.cityCode)) {
          return respond({ok: false, code: 'validation', message: 'Данные пункта СДЭК изменились. Выберите его заново.',
            fields: {pickupPoint: 'Выберите подтверждённый пункт СДЭК заново.'}}, 400);
        }
        delivery.pickupPoint = canonical;
      }
      const snapshot = {
        schemaVersion: 1, customer: {fullName: customer.fullName.trim().replace(/\s+/g, ' '), phone: normalizePhone(customer.phone)!},
        delivery, items: quote, ...(order.comment?.trim() ? {comment: order.comment.trim()} : {}), totalKopecks: total,
      };
      const orderId = crypto.randomUUID();
      // The migration trigger creates the notification job atomically with this insert.
      await db.prepare(`INSERT INTO guest_orders (id, session_hash, idempotency_key, request_hash, snapshot_json, total_kopecks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(idempotency_key) DO NOTHING`)
        .bind(orderId, session.token_hash, idempotencyKey, requestHash, JSON.stringify(snapshot), total, timestamp).run();
      const saved = await findSaved();
      if (!saved) throw new Error('save');
      return replay(saved, requestHash, session.token_hash);
    } catch {
      // A lost storage response can follow a committed insert; the client must keep the same attempt key.
      return error('network', 'Не удалось подтвердить сохранение. Повторите отправку этой же попытки; данные остались в форме.', 503);
    }
  };
}

// Server-only module: no browser imports, public trigger or ambient secret loading.
import {z} from 'zod';

const plain = (max: number) => z.string().max(max).regex(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/);
const address = {countryCode: z.literal('RU'), region: plain(120), city: plain(120), address: plain(250), apartment: plain(30).optional()};
const snapshotSchema = z.object({
  schemaVersion: z.literal(1), customer: z.object({fullName: plain(150).min(1), phone: plain(40).min(1)}),
  delivery: z.union([
    z.object({method: z.literal('post'), ...address, postcode: z.string().regex(/^\d{6}$/)}),
    z.object({method: z.literal('cdek'), mode: z.literal('courier'), ...address}),
    z.object({method: z.literal('cdek'), mode: z.literal('pickup'), countryCode: z.literal('RU'),
      pickupPoint: z.object({code: plain(50), city: plain(120), address: plain(250), countryCode: z.literal('RU')})}),
  ]),
  items: z.array(z.object({productId: plain(150).min(1), variantId: plain(150).min(1), name: plain(500).min(1),
    label: plain(500), sku: plain(150).nullable(), quantity: z.number().int().min(1).max(99),
    unitPriceKopecks: z.number().int().positive().safe(), source: z.enum(['isolated-test', 'inventory', 'catalog-review'])})).min(1).max(100),
  totalKopecks: z.number().int().positive().safe(), comment: plain(500).optional(),
});
const money = (value: number) => `${Math.floor(value / 100).toLocaleString('ru-RU')},${String(value % 100).padStart(2, '0')} ₽`;

export function formatTelegramOrder(orderId: string, input: unknown): string[] {
  if (!z.string().uuid().safeParse(orderId).success) throw Error('invalid_snapshot');
  const order = snapshotSchema.parse(input);
  const total = order.items.reduce((sum, item) => sum + item.unitPriceKopecks * item.quantity, 0);
  if (!Number.isSafeInteger(total) || total !== order.totalKopecks || new Set(order.items.map(item => item.variantId)).size !== order.items.length) throw Error('invalid_snapshot');
  const {delivery} = order;
  const lines = [`Покупатель: ${order.customer.fullName}`, `Телефон / WhatsApp: ${order.customer.phone}`,
    ...('pickupPoint' in delivery ? [`Доставка: СДЭК, пункт ${delivery.pickupPoint.code}`, `${delivery.pickupPoint.city}, ${delivery.pickupPoint.address}`] : [
      `Доставка: ${delivery.method === 'post' ? 'Почта России' : 'СДЭК, курьер'}`,
      `${delivery.region}, ${delivery.city}${delivery.method === 'post' ? ', ' + delivery.postcode : ''}`,
      `${delivery.address}${delivery.apartment ? ', кв. ' + delivery.apartment : ''}`,
    ]), 'Состав заявки:', ...order.items.map((item, index) => `${index + 1}. ${item.name} — ${item.label || 'без отдельного названия варианта'}\nВариант: ${item.variantId}${item.sku ? '; артикул: ' + item.sku : ''}\n${item.quantity} шт. × ${money(item.unitPriceKopecks)} = ${money(item.unitPriceKopecks * item.quantity)}`),
    `Сумма товаров: ${money(total)}`, 'Цена, наличие, доставка и оплата подтверждаются менеджером.', ...(order.comment ? [`Комментарий: ${order.comment}`] : [])];
  const bodies: string[] = [];
  let current = '';
  for (const line of lines) {
    if (line.length > 3600) throw Error('invalid_snapshot');
    if (current && current.length + line.length + 2 > 3600) { bodies.push(current); current = ''; }
    current += (current ? '\n\n' : '') + line;
  }
  if (current) bodies.push(current);
  const marker = order.items.some(item => item.source === 'isolated-test') ? 'ТЕСТ — вымышленная заявка, не обрабатывать\n' : '';
  return bodies.map((body, index) => `${marker}Заявка № ${orderId}\nЧасть ${index + 1}/${bodies.length}\n\n${body}`);
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const validConfig = (token?: string, chatId?: string) => !!token && /^\d{5,15}:[A-Za-z0-9_-]{20,100}$/.test(token) && !!chatId && /^-[1-9]\d*$/.test(chatId) && Number.isSafeInteger(Number(chatId));
type ApiResult = {kind: 'ok'; result: Record<string, unknown> | unknown[]} | {kind: 'rejected'; code: number; retryAfter?: number} | {kind: 'unknown'};
type TelegramConfig = {token?: string; chatId?: string; fetcher?: typeof fetch; expectedTitle?: string};
async function api(token: string, method: 'getMe' | 'getChat' | 'getChatMember' | 'getUpdates' | 'sendMessage', data: object, fetcher: typeof fetch): Promise<ApiResult> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async (): Promise<ApiResult> => {
        const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
        // The local network accepts GET polling reliably; message bodies remain POST-only.
        if (method === 'getUpdates') for (const [key, value] of Object.entries(data)) url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        const response = await fetcher(url.href, {
          method: method === 'getUpdates' ? 'GET' : 'POST', headers: {'Content-Type': 'application/json'},
          ...(method === 'getUpdates' ? {} : {body: JSON.stringify(data)}), redirect: 'manual', signal: controller.signal,
        });
        const value: unknown = await response.json();
        if (!record(value)) return {kind: 'unknown'};
        if (response.ok && value.ok === true && (record(value.result) || Array.isArray(value.result))) return {kind: 'ok', result: value.result};
        if (!response.ok && value.ok === false && positive(value.error_code)) {
          const retryAfter = record(value.parameters) && positive(value.parameters.retry_after) ? value.parameters.retry_after : undefined;
          return {kind: 'rejected', code: value.error_code, retryAfter};
        }
        return {kind: 'unknown'};
      })(),
      new Promise<ApiResult>(resolve => { timer = setTimeout(() => {controller.abort(); resolve({kind: 'unknown'});}, 10_000); }),
    ]);
  } catch { return {kind: 'unknown'}; }
  finally { clearTimeout(timer); }
}

export async function preflightTelegram({token, chatId, fetcher = fetch, expectedTitle}: TelegramConfig) {
  if (!validConfig(token, chatId)) return {ok: false as const, code: 'configuration'};
  const me = await api(token!, 'getMe', {}, fetcher);
  if (me.kind !== 'ok' || !record(me.result) || me.result.is_bot !== true || !positive(me.result.id)) return {ok: false as const, code: 'bot_unverified'};
  const chat = await api(token!, 'getChat', {chat_id: chatId}, fetcher);
  if (chat.kind !== 'ok' || !record(chat.result) || chat.result.id !== Number(chatId) || !['group', 'supergroup'].includes(String(chat.result.type)) ||
    (expectedTitle !== undefined && chat.result.title !== expectedTitle)) return {ok: false as const, code: 'group_unverified'};
  if (chat.result.is_forum === true) return {ok: false as const, code: 'forum_requires_decision'};
  const member = await api(token!, 'getChatMember', {chat_id: chatId, user_id: me.result.id}, fetcher);
  if (member.kind !== 'ok' || !record(member.result) || !record(member.result.user) || member.result.user.id !== me.result.id) return {ok: false as const, code: 'membership_unverified'};
  const status = member.result.status;
  const allowed = status === 'creator' || status === 'administrator' ||
    (status === 'member' && !(record(chat.result.permissions) && chat.result.permissions.can_send_messages === false)) ||
    (status === 'restricted' && member.result.is_member === true && member.result.can_send_messages === true);
  return allowed ? {ok: true as const} : {ok: false as const, code: 'write_forbidden'};
}

export async function discoverTelegramGroup({token, fetcher = fetch, expectedTitle}: TelegramConfig) {
  if (!validConfig(token, '-1') || !expectedTitle) return {ok: false as const, code: 'configuration'};
  const me = await api(token!, 'getMe', {}, fetcher);
  if (me.kind !== 'ok' || !record(me.result) || me.result.is_bot !== true || typeof me.result.username !== 'string' || !/^[A-Za-z0-9_]{5,32}$/.test(me.result.username)) return {ok: false as const, code: 'bot_unverified'};
  const setupCommand = `/grace_connect@${me.result.username}`;
  const updates = await api(token!, 'getUpdates', {allowed_updates: ['my_chat_member', 'message'], timeout: 0, limit: 100}, fetcher);
  if (updates.kind !== 'ok' || !Array.isArray(updates.result)) return {ok: false as const, code: 'discovery_unavailable'};
  const candidates = new Set<string>();
  for (const update of updates.result) {
    if (!record(update)) continue;
    const chat = record(update.my_chat_member) ? update.my_chat_member.chat :
      record(update.message) && update.message.text === setupCommand ? update.message.chat : undefined;
    if (record(chat) && chat.title === expectedTitle && ['group', 'supergroup'].includes(String(chat.type)) && typeof chat.id === 'number' && Number.isSafeInteger(chat.id) && chat.id < 0) candidates.add(String(chat.id));
  }
  if (candidates.size !== 1) return {ok: false as const, code: candidates.size ? 'group_ambiguous' : 'group_not_found'};
  const chatId = [...candidates][0];
  const check = await preflightTelegram({token, chatId, fetcher, expectedTitle});
  return check.ok ? {ok: true as const, chatId} : check;
}

type Job = {order_id: string; message_ids_json: string; message_parts_json: string | null; target_chat_id: string | null; attempts: number; retry_count: number; claim_token: string};
type DispatchResult = {state: 'disabled' | 'blocked' | 'idle' | 'sent' | 'pending' | 'failed' | 'unknown'; code?: string; orderId?: string; part?: number};
type Options = TelegramConfig & {db: D1Database; enabled: boolean; now?: () => number};

export function createTelegramOutbox({db, enabled, token, chatId, fetcher = fetch, expectedTitle, now = Date.now}: Options) {
  async function finish(job: Job, state: string, failure: string | null, ids: number[], next: number, retries = job.retry_count) {
    const result = await db.prepare(`UPDATE order_outbox SET state=?, failure_code=?, message_ids_json=?, next_attempt_at=?,
      retry_count=?, claim_token=NULL, lease_until=NULL, accepted_at=? WHERE order_id=? AND state='sending' AND claim_token=?`)
      .bind(state, failure, JSON.stringify(ids), next, retries, state === 'sent' ? now() : null, job.order_id, job.claim_token).run();
    return result.meta.changes === 1;
  }

  return {
    async processOne(orderId?: string): Promise<DispatchResult> {
      if (!enabled) return {state: 'disabled'};
      if (!validConfig(token, chatId) || (orderId !== undefined && !z.string().uuid().safeParse(orderId).success)) return {state: 'blocked', code: 'configuration'};
      let job: Job | undefined;
      let ids: number[] = [];
      try {
        await db.prepare(`UPDATE order_outbox SET state='failed', failure_code='delivery_unknown', claim_token=NULL, lease_until=NULL
          WHERE state='sending' AND lease_until <= ? AND (? IS NULL OR order_id=?)`).bind(now(), orderId ?? null, orderId ?? null).run();
        const preflight = await preflightTelegram({token, chatId, fetcher, expectedTitle});
        if (!preflight.ok) return {state: 'blocked', code: preflight.code};
        const claim = crypto.randomUUID();
        const timestamp = now();
        const results = await db.batch([
          db.prepare(`UPDATE telegram_dispatch SET token=?, next_send_at=? WHERE id=1 AND next_send_at<=?
            AND EXISTS(SELECT 1 FROM order_outbox WHERE state='pending' AND next_attempt_at<=? AND (? IS NULL OR order_id=?))`)
            .bind(claim, timestamp + 4000, timestamp, timestamp, orderId ?? null, orderId ?? null),
          db.prepare(`UPDATE order_outbox SET state='sending', attempts=attempts+1, claim_token=?, lease_until=?,
            target_chat_id=COALESCE(target_chat_id, ?) WHERE order_id=(SELECT order_id FROM order_outbox
            WHERE state='pending' AND next_attempt_at<=? AND (? IS NULL OR order_id=?) ORDER BY next_attempt_at, order_id LIMIT 1)
            AND EXISTS(SELECT 1 FROM telegram_dispatch WHERE id=1 AND token=?) RETURNING *`)
            .bind(claim, timestamp + 60_000, chatId!, timestamp, orderId ?? null, orderId ?? null, claim),
        ]);
        job = results[1].results[0] as Job | undefined;
        if (!job) return {state: 'idle'};
        let parts: string[];
        try {
          const rawIds: unknown = JSON.parse(job.message_ids_json);
          if (!Array.isArray(rawIds) || !rawIds.every(positive) || new Set(rawIds).size !== rawIds.length) throw Error();
          ids = rawIds;
          const order = await db.prepare('SELECT snapshot_json FROM guest_orders WHERE id=?').bind(job.order_id).first<{snapshot_json: string}>();
          if (!order) throw Error();
          parts = job.message_parts_json ? z.array(z.string().min(1).max(4096)).min(1).max(200).parse(JSON.parse(job.message_parts_json))
            : formatTelegramOrder(job.order_id, JSON.parse(order.snapshot_json));
          if (ids.length >= parts.length) throw Error();
        } catch {
          await finish(job, 'failed', 'invalid_snapshot', ids, now());
          return {state: 'failed', code: 'invalid_snapshot', orderId: job.order_id};
        }
        if (job.target_chat_id !== chatId) {
          await finish(job, 'failed', 'destination_changed', ids, now());
          return {state: 'failed', code: 'destination_changed', orderId: job.order_id};
        }
        if (!job.message_parts_json) {
          const stored = await db.prepare("UPDATE order_outbox SET message_parts_json=? WHERE order_id=? AND state='sending' AND claim_token=?")
            .bind(JSON.stringify(parts), job.order_id, job.claim_token).run();
          if (stored.meta.changes !== 1) return {state: 'unknown', code: 'claim_lost', orderId: job.order_id};
        }
        const result = await api(token!, 'sendMessage', {chat_id: chatId, text: parts[ids.length], link_preview_options: {is_disabled: true}}, fetcher);
        if (result.kind === 'ok' && record(result.result) && positive(result.result.message_id) && record(result.result.chat) && result.result.chat.id === Number(chatId) &&
          ['group', 'supergroup'].includes(String(result.result.chat.type)) && !ids.includes(result.result.message_id)) {
          const acknowledged = [...ids, result.result.message_id];
          const state = acknowledged.length === parts.length ? 'sent' : 'pending';
          if (!await finish(job, state, null, acknowledged, now() + 4000, 0)) return {state: 'unknown', code: 'claim_lost', orderId: job.order_id};
          return {state, orderId: job.order_id, part: acknowledged.length};
        }
        if (result.kind === 'rejected') {
          const retryable = result.code === 429 || result.code >= 500;
          const retries = job.retry_count + 1;
          const delay = result.code === 429 ? (result.retryAfter ?? 30) * 1000 : Math.min(60_000, 1000 * 2 ** retries);
          const next = now() + delay;
          if (retryable && retries <= 5 && Number.isSafeInteger(next)) {
            await finish(job, 'pending', result.code === 429 ? 'rate_limited' : 'provider_rejected', ids, next, retries);
            if (result.code === 429) await db.prepare('UPDATE telegram_dispatch SET next_send_at=MAX(next_send_at, ?) WHERE id=1').bind(next).run();
            return {state: 'pending', code: result.code === 429 ? 'rate_limited' : 'provider_rejected', orderId: job.order_id, part: ids.length + 1};
          }
          const code = retryable ? 'retry_exhausted' : 'provider_rejected';
          await finish(job, 'failed', code, ids, now(), retries);
          return {state: 'failed', code, orderId: job.order_id};
        }
        await finish(job, 'failed', 'delivery_unknown', ids, now());
        return {state: 'unknown', code: 'delivery_unknown', orderId: job.order_id, part: ids.length + 1};
      } catch {
        // A storage failure after a send must never make the part eligible for blind replay.
        if (job) { try { await finish(job, 'failed', 'delivery_unknown', ids, now()); } catch {} }
        return {state: job ? 'unknown' : 'blocked', code: job ? 'delivery_unknown' : 'storage_unavailable', ...(job ? {orderId: job.order_id} : {})};
      }
    },

    async reconcile(input: {orderId: string; part: number; checkedGroup: true; chatId: string; action: 'confirmed' | 'retry'; messageId?: number}) {
      if (!enabled || !validConfig(token, chatId) || input.checkedGroup !== true || input.chatId !== chatId ||
        !z.string().uuid().safeParse(input.orderId).success || !positive(input.part) || !['confirmed', 'retry'].includes(input.action) ||
        (input.action === 'confirmed' && !positive(input.messageId))) return false;
      const row = await db.prepare(`SELECT o.message_ids_json, o.message_parts_json, o.failure_code, g.snapshot_json FROM order_outbox o JOIN guest_orders g ON g.id=o.order_id
        WHERE o.order_id=? AND o.state='failed' AND o.failure_code IN ('delivery_unknown', 'provider_rejected', 'retry_exhausted', 'destination_changed') AND o.target_chat_id=?`)
        .bind(input.orderId, chatId!).first<{message_ids_json: string; message_parts_json: string | null; snapshot_json: string; failure_code: string}>();
      if (!row) return false;
      if (input.action === 'confirmed' && row.failure_code !== 'delivery_unknown') return false;
      const ids: number[] = JSON.parse(row.message_ids_json);
      const parts = row.message_parts_json ? z.array(z.string().min(1).max(4096)).min(1).max(200).parse(JSON.parse(row.message_parts_json))
        : formatTelegramOrder(input.orderId, JSON.parse(row.snapshot_json));
      if (!ids.every(positive) || input.part !== ids.length + 1 || input.part > parts.length || (input.messageId && ids.includes(input.messageId))) return false;
      if (input.action === 'confirmed') ids.push(input.messageId!);
      const state = ids.length === parts.length ? 'sent' : 'pending';
      const result = await db.prepare(`UPDATE order_outbox SET state=?, failure_code=NULL, message_ids_json=?, next_attempt_at=?, retry_count=0,
        accepted_at=? WHERE order_id=? AND state='failed' AND failure_code=? AND message_ids_json=? AND target_chat_id=?`)
        .bind(state, JSON.stringify(ids), now(), state === 'sent' ? now() : null, input.orderId, row.failure_code, row.message_ids_json, chatId!).run();
      return result.meta.changes === 1;
    },
  };
}

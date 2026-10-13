import {env} from 'cloudflare:workers';
import {after} from 'next/server';
import {getProduct} from './catalog';
import {createOrderService} from './order-service';
import {friendsOrdersEnabled, reviewCatalogVariant} from './friend-orders';
import {purchaseQuantityLimit} from './demo-inventory';
import {createTelegramOutbox} from './telegram-outbox';
import {createCdekService} from './cdek-service';

export function localOrderTestEnabled(host: string) {
  return env.GRACE_ORDER_TEST_MODE === '1' && /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host);
}
export function hostedOrdersEnabled(host: string) {
  return !!env.DB && friendsOrdersEnabled(host, env);
}
export function hostedPickupEnabled() {return env.GRACE_CDEK_PICKUP_ENABLED === '1';}
let cdek: ReturnType<typeof createCdekService> | undefined;
async function dispatchNotifications() {
  if (!env.DB) return;
  const outbox = createTelegramOutbox({db: env.DB, enabled: true, token: env.GRACE_TELEGRAM_BOT_TOKEN,
    chatId: env.GRACE_TELEGRAM_CHAT_ID, expectedTitle: 'Тест группа'});
  // shortcut: bounded retries run on checkout traffic; add a hosted scheduler before unattended production operation.
  const deadline = Date.now() + 20_000;
  do {
    const result = await outbox.processOne();
    if (['blocked', 'failed', 'unknown', 'disabled'].includes(result.state)) {
      console.error('Order notification stopped', {state: result.state, code: result.code});
      return;
    }
    const pending = await env.DB.prepare("SELECT MIN(next_attempt_at) AS next FROM order_outbox WHERE state='pending'").first<{next: number | null}>();
    if (pending?.next == null) return;
    const delay = Math.max(4000, pending.next - Date.now());
    if (Date.now() + delay >= deadline) return;
    await new Promise(resolve => setTimeout(resolve, delay));
  } while (Date.now() < deadline);
}
export async function handleOrderRequest(request: Request) {
  const host = new URL(request.url).host;
  const local = localOrderTestEnabled(host);
  const hosted = hostedOrdersEnabled(host);
  const response = await createOrderService({
    db: env.DB, enabled: local || hosted,
    lookupVariant: (productId, variantId) => {
      const variant = reviewCatalogVariant(getProduct(productId), variantId, purchaseQuantityLimit);
      return variant && local ? {...variant, revision: 'isolated-local-test', source: 'isolated-test'} : variant;
    },
    verifyPickup: hosted ? async point => {
      if (!hostedPickupEnabled() || !point.cityCode) return null;
      cdek ??= createCdekService({account: env.CDEK_ACCOUNT, secret: env.CDEK_SECURE});
      const result = await cdek(new Request('https://cdek.local/?' + new URLSearchParams({action: 'points', cityCode: String(point.cityCode), q: point.code})));
      if (!result.ok) return null;
      const data = await result.json() as {items?: unknown[]};
      return (data.items as typeof point[] | undefined)?.find(item => item.code === point.code) ?? null;
    } : undefined,
  })(request);
  if (hosted && response.ok) after(dispatchNotifications);
  return response;
}

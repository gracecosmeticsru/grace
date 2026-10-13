import type {OrderCatalogVariant} from './order-contract.ts';

type Settings = {GRACE_ORDERS_ENABLED?: string; GRACE_ORDER_HOST?: string; GRACE_TELEGRAM_BOT_TOKEN?: string; GRACE_TELEGRAM_CHAT_ID?: string};
export function friendsOrdersEnabled(host: string, settings: Settings) {
  return settings.GRACE_ORDERS_ENABLED === '1' && !!settings.GRACE_ORDER_HOST &&
    host === settings.GRACE_ORDER_HOST && !!settings.GRACE_TELEGRAM_BOT_TOKEN && !!settings.GRACE_TELEGRAM_CHAT_ID;
}

export function reviewCatalogVariant(product: {id: string; name: string; variants: {id: string; label: string; sku?: string | null; price?: number | null}[]} | undefined, variantId: string, limit: number): OrderCatalogVariant | null {
  const variant = product?.variants.find(item => item.id === variantId);
  if (!product || !variant) return null;
  // shortcut: the owner-approved demo limit is not stock; manager confirmation remains required until 1C is connected.
  return {productId: product.id, variantId: variant.id, name: product.name, label: variant.label, sku: variant.sku ?? null,
    unitPriceKopecks: variant.price == null ? null : Math.round(variant.price * 100),
    available: limit, revision: 'catalog-manager-confirmation', source: 'catalog-review'};
}

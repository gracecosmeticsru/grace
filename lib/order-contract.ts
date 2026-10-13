import type {CheckoutErrors, GuestOrderRequest} from './guest-checkout';

export type OrderSubmission = {
  order: GuestOrderRequest;
  expectedPrices: {variantId: string; unitPriceKopecks: number | null}[];
};
export type OrderCatalogVariant = {
  productId: string; variantId: string; name: string; label: string; sku: string | null;
  unitPriceKopecks: number | null; available: number | null; revision: string;
  source: 'isolated-test' | 'inventory' | 'catalog-review';
};
export type OrderQuoteLine = OrderCatalogVariant & {quantity: number; requestedQuantity: number};
export type OrderResult =
  | {ok: true; orderId: string}
  | {ok: false; code: 'cart_changed'; message: string; quote: OrderQuoteLine[]}
  | {ok: false; code: 'validation' | 'unavailable' | 'network' | 'conflict' | 'rate_limited' | 'session'; message: string; fields?: CheckoutErrors};

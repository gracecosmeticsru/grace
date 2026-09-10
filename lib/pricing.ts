import type { Variant } from './catalog-types';

const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export function hasPrice(price: number | null | undefined): price is number {
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
}
export function formatPrice(price: number | null | undefined) {
  return hasPrice(price) ? `${rubles.format(price)} ₽` : '— ₽';
}
export function productPrice(variants: Variant[]) {
  const prices = variants.map(v => v.price).filter(hasPrice);
  if (!prices.length) return formatPrice(null);
  const minimum = Math.min(...prices);
  const from = prices.length !== variants.length || prices.some(p => p !== minimum);
  return `${from ? 'от ' : ''}${formatPrice(minimum)}`;
}

import type {BagLine} from './shop-state';
import {parseCdekPoint, type CdekPickupPoint} from './cdek-pickup.ts';

export type CheckoutFields = {
  fullName: string;
  phone: string;
  delivery: 'cdek' | 'cdek-courier' | 'post';
  city: string;
  pickupPoint: CdekPickupPoint | null;
  region: string;
  postcode: string;
  address: string;
  apartment: string;
  comment: string;
};
export type CheckoutErrors = Partial<Record<keyof CheckoutFields | 'items', string>>;
export type GuestOrderRequest = {
  schemaVersion: 1;
  customer: {fullName: string; phone: string};
  delivery: {method: 'cdek'; mode: 'pickup'; countryCode: 'RU'; pickupPoint: CdekPickupPoint} |
    {method: 'cdek'; mode: 'courier'; countryCode: 'RU'; region: string; city: string; address: string; apartment?: string} |
    {method: 'post'; countryCode: 'RU'; region: string; city: string; postcode: string; address: string; apartment?: string};
  items: {productId: string; variantId: string; quantity: number}[];
  comment?: string;
};
export type GuestOrderResult =
  | {ok: true; orderId: string}
  | {ok: false; code: 'validation' | 'cart_changed' | 'unavailable' | 'network'; message: string; fields?: CheckoutErrors};

export const emptyCheckoutFields: CheckoutFields = {
  fullName: '', phone: '', delivery: 'cdek', city: '', pickupPoint: null,
  region: '', postcode: '', address: '', apartment: '', comment: '',
};
export const checkoutUnavailableMessage = 'Приём заказов через сайт пока недоступен. Заказ не отправлен. Введённые данные остались в форме.';
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

export function normalizePhone(value: string): string | null {
  if (!/^[+\d\s().-]+$/.test(value.trim()) || value.trim().lastIndexOf('+') > 0) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8') && !value.trim().startsWith('+')) digits = '7' + digits.slice(1);
  if (!value.trim().startsWith('+') && !(digits.length === 11 && digits.startsWith('7'))) return null;
  if (!/^[1-9]\d{7,14}$/.test(digits) || (digits.startsWith('7') && digits.length !== 11)) return null;
  return '+' + digits;
}

export function validateCheckout(fields: CheckoutFields, bag: BagLine[]): CheckoutErrors {
  const errors = validateCheckoutFields(fields);
  const seen = new Set<string>();
  if (!bag.length) errors.items = 'Добавьте товары в корзину.';
  for (const line of bag) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 99 ||
      !line.product.variants.some(v => v.id === line.variant.id) || seen.has(line.variant.id)) {
      errors.items = 'Проверьте выбранные варианты и количество в корзине.';
    }
    seen.add(line.variant.id);
  }
  return errors;
}

export function validateCheckoutFields(fields: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const fullName = clean(fields.fullName);
  if (fullName.length > 150 || !/^[\p{L}\p{M}’'\-]+(?: [\p{L}\p{M}’'\-]+)+$/u.test(fullName) ||
    fullName.split(' ').some(part => !/\p{L}/u.test(part))) {
    errors.fullName = 'Укажите фамилию и имя, отчество — при наличии.';
  }
  if (!normalizePhone(fields.phone)) errors.phone = 'Укажите телефон с кодом страны, например +7 и ещё 10 цифр.';
  const requiredText = (key: 'city' | 'region' | 'address', min: number, max: number, message: string) => {
    const value = clean(fields[key]);
    if (value.length < min || value.length > max || /[\u0000-\u001f\u007f]/.test(fields[key])) errors[key] = message;
  };
  requiredText('city', 2, 120, 'Укажите город или населённый пункт (от 2 до 120 символов).');
  if (fields.delivery === 'cdek') {
    const point = parseCdekPoint(fields.pickupPoint);
    if (!point || point.city !== clean(fields.city)) errors.pickupPoint = 'Выберите пункт СДЭК из списка для указанного города.';
  } else if (fields.delivery === 'post' || fields.delivery === 'cdek-courier') {
    requiredText('region', 2, 120, 'Укажите область, край или республику.');
    if (fields.delivery === 'post' && !/^\d{6}$/.test(fields.postcode.trim())) errors.postcode = 'Почтовый индекс должен содержать 6 цифр.';
    requiredText('address', 4, 250, 'Укажите улицу и дом (от 4 до 250 символов).');
    if (fields.apartment.trim().length > 30 || /[\u0000-\u001f\u007f]/.test(fields.apartment)) errors.apartment = 'Не больше 30 символов.';
  } else {
    errors.delivery = 'Выберите СДЭК или почту.';
  }
  if (fields.comment.trim().length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(fields.comment)) errors.comment = 'Не больше 500 символов.';
  return errors;
}

export function prepareGuestOrder(fields: CheckoutFields, bag: BagLine[]):
  {ok: true; request: GuestOrderRequest} | {ok: false; fields: CheckoutErrors} {
  const errors = validateCheckout(fields, bag);
  if (Object.keys(errors).length) return {ok: false, fields: errors};
  return {ok: true, request: {
    schemaVersion: 1,
    customer: {fullName: clean(fields.fullName), phone: normalizePhone(fields.phone)!},
    delivery: fields.delivery === 'cdek'
      ? {method: 'cdek', mode: 'pickup', countryCode: 'RU', pickupPoint: parseCdekPoint(fields.pickupPoint)!}
      : {...(fields.delivery === 'post' ? {method: 'post' as const, postcode: fields.postcode.trim()} : {method: 'cdek' as const, mode: 'courier' as const}),
        countryCode: 'RU', region: clean(fields.region), city: clean(fields.city),
        address: clean(fields.address), ...(fields.apartment.trim() ? {apartment: clean(fields.apartment)} : {})},
    items: bag.map(line => ({productId: line.product.id, variantId: line.variant.id, quantity: line.quantity})),
    ...(fields.comment.trim() ? {comment: fields.comment.trim()} : {}),
  }};
}

// A missing price makes the total unknown. Never count it as a free item.
export function checkoutTotal(bag: BagLine[]): number | null {
  if (!bag.length) return null;
  let kopecks = 0;
  for (const line of bag) {
    const price = line.variant.price;
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0 ||
      !Number.isSafeInteger(line.quantity) || line.quantity < 1) return null;
    kopecks += Math.round(price * 100) * line.quantity;
    if (!Number.isSafeInteger(kopecks)) return null;
  }
  return kopecks / 100;
}

// shortcut: no network until 10B provides durable storage and server validation.
export async function submitGuestOrder(_request: GuestOrderRequest): Promise<GuestOrderResult> {
  return {ok: false, code: 'unavailable', message: checkoutUnavailableMessage};
}

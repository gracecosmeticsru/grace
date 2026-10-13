import type { Product, Variant } from './catalog-types';

export type BagLine = { product: Product; variant: Variant; quantity: number };
export type SavedProduct = string | { productId: string; variantId: string };
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const browserStorage: StorageAccess = () => window.localStorage;

export const shopKeys = {
  favorites: 'grace-favorites', bag: 'grace-bag',
  searches: 'grace-searches', viewed: 'grace-viewed',
} as const;

function readStoredValue(key: string, storage: StorageAccess): unknown {
  try {
    const raw = storage().getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readStringList(key: string, limit?: number, storage = browserStorage): string[] {
  const value = readStoredValue(key, storage);
  const items = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  return limit === undefined ? items : items.slice(0, limit);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

export function readSavedProducts(key: string, limit?: number, storage = browserStorage): SavedProduct[] {
  const value = readStoredValue(key, storage);
  const items = Array.isArray(value) ? value.filter((item): item is SavedProduct =>
    typeof item === 'string' || (isRecord(item) && typeof item.productId === 'string' &&
      item.productId.length > 0 && typeof item.variantId === 'string' && item.variantId.length > 0)) : [];
  return limit === undefined ? items : items.slice(0, limit);
}

export const savedProductId = (entry: SavedProduct) => typeof entry === 'string' ? entry : entry.productId;
export const savedProductKey = (entry: SavedProduct) => JSON.stringify(entry);
export function sameSavedProduct(a: SavedProduct, b: SavedProduct) {
  return typeof a === 'string' || typeof b === 'string' ? a === b
    : a.productId === b.productId && a.variantId === b.variantId;
}
export function favoriteMatches(favorites: SavedProduct[], productId: string, variantId: string) {
  return favorites.some(entry => typeof entry !== 'string' && entry.productId === productId && entry.variantId === variantId);
}
export function resolveSavedVariant(entry: SavedProduct, product?: Product) {
  return typeof entry !== 'string' && product?.id === entry.productId
    ? product.variants.find(variant => variant.id === entry.variantId) : undefined;
}
export function toggleVariantFavorite(favorites: SavedProduct[], product: Product, variant: Variant): SavedProduct[] {
  if (!product.variants.some(item => item.id === variant.id)) return favorites;
  const entry = { productId: product.id, variantId: variant.id };
  return favoriteMatches(favorites, product.id, variant.id)
    ? favorites.filter(item => !sameSavedProduct(item, entry)) : [...favorites, entry];
}

function isVariant(value: unknown): value is Variant {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 &&
    (value.sku === null || typeof value.sku === 'string') &&
    typeof value.label === 'string' && typeof value.type === 'string' &&
    (value.price === null || (typeof value.price === 'number' && Number.isFinite(value.price))) &&
    typeof value.availability === 'string' &&
    (value.format === undefined || typeof value.format === 'string');
}

function isProduct(value: unknown): value is Product {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.slug === 'string' && typeof value.name === 'string' &&
    typeof value.brand === 'string' && isStringList(value.paths) &&
    Array.isArray(value.variants) && value.variants.length > 0 && value.variants.every(isVariant) &&
    (value.image === null || typeof value.image === 'string') &&
    (value.decant === undefined || typeof value.decant === 'boolean') && isStringList(value.sourceSkus);
}

function isBagLine(value: unknown): value is BagLine {
  if (!isRecord(value) || !isProduct(value.product) || !isVariant(value.variant)) return false;
  const variantId = value.variant.id;
  return value.product.variants.some(variant => variant.id === variantId) &&
    typeof value.quantity === 'number' && Number.isInteger(value.quantity) &&
    value.quantity >= 1 && value.quantity <= 99;
}

export function loadShopState(storage = browserStorage): { favorites: SavedProduct[]; bag: BagLine[] } {
  // Each key is independent: a broken favorite list must not discard a valid bag.
  const favorites = readSavedProducts(shopKeys.favorites, undefined, storage);
  const rawBag = readStoredValue(shopKeys.bag, storage);
  return { favorites, bag: Array.isArray(rawBag) ? rawBag.filter(isBagLine) : [] };
}

export function saveStoredValue(key: string, value: unknown, storage = browserStorage): boolean {
  try { storage().setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function removeStoredValue(key: string, storage = browserStorage): boolean {
  try { storage().removeItem(key); return true; }
  catch { return false; }
}

export function rememberViewed(id: string, storage = browserStorage) {
  const previous = readSavedProducts(shopKeys.viewed, undefined, storage);
  return saveStoredValue(shopKeys.viewed, [id, ...previous.filter(item => !sameSavedProduct(item, id))].slice(0, 12), storage);
}

export function rememberVariantViewed(product: Product, variant: Variant, storage = browserStorage) {
  if (!product.variants.some(item => item.id === variant.id)) return false;
  const entry = { productId: product.id, variantId: variant.id };
  const previous = readSavedProducts(shopKeys.viewed, undefined, storage);
  return saveStoredValue(shopKeys.viewed, [entry, ...previous.filter(item => !sameSavedProduct(item, entry))].slice(0, 12), storage);
}

export function addBagLine(bag: BagLine[], product: Product, variant: Variant, limit=99): BagLine[] {
  if (!product.variants.some(item => item.id === variant.id)) return bag;
  if ((bag.find(line=>line.variant.id===variant.id)?.quantity||0)>=limit) return bag;
  return bag.some(line => line.variant.id === variant.id)
    ? bag.map(line => line.variant.id === variant.id ? { ...line, quantity: Math.min(99, limit, line.quantity + 1) } : line)
    : [...bag, { product, variant, quantity: 1 }];
}

export function updateBagQuantity(bag: BagLine[], id: string, quantity: number, limit=99): BagLine[] {
  if (!Number.isInteger(quantity)) return bag;
  const previous=bag.find(line=>line.variant.id===id)?.quantity||0;
  if (quantity>previous&&previous>=limit) return bag;
  const nextQuantity=quantity>previous?Math.min(quantity,limit):quantity;
  return quantity <= 0 ? bag.filter(line => line.variant.id !== id)
    : bag.map(line => line.variant.id === id ? { ...line, quantity: Math.min(99, nextQuantity) } : line);
}

export function consumeOrderedItems(bag: BagLine[], items: {productId: string; variantId: string; quantity: number}[]): BagLine[] {
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return bag;
    const key = JSON.stringify([item.productId, item.variantId]);
    if (quantities.has(key)) return bag;
    quantities.set(key, item.quantity);
  }
  return bag.flatMap(line => {
    const consumed = quantities.get(JSON.stringify([line.product.id, line.variant.id])) || 0;
    if (!consumed) return [line];
    const quantity = line.quantity - consumed;
    return quantity > 0 ? [{...line, quantity}] : [];
  });
}

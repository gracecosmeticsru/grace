import { products } from './catalog';
import { collectionMeta } from './collection-meta';
import { selectCollection } from './collection-selection';
import { graceCollections } from './grace-collections';
import type { Product } from './catalog-types';

// Prepared once per server instance; only ten selected records reach each page.
export const collections = [...collectionMeta.map(collection => ({
  ...collection,
  products: selectCollection(products, collection.slug),
  variantIds: undefined as Record<string,string> | undefined,
})), ...graceCollections.map(collection => ({
  ...collection,
  products: collection.items.map(([id])=>products.find(product=>product.id===id)).filter((product):product is Product=>Boolean(product)),
  variantIds: Object.fromEntries(collection.items),
}))];
export function getCollection(slug: string) {
  return collections.find(collection => collection.slug === slug);
}

import { products } from './catalog';
import { collectionMeta } from './collection-meta';
import { selectCollection } from './collection-selection';

// Prepared once per server instance; only ten selected records reach each page.
export const collections = collectionMeta.map(collection => ({
  ...collection,
  products: selectCollection(products, collection.slug),
}));
export function getCollection(slug: string) {
  return collections.find(collection => collection.slug === slug);
}

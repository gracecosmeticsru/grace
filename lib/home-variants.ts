import type {Product} from './catalog-types';

// The approved home card is shared by every product list. Preserve its pinned
// choices everywhere; other families use their first stored variant, never one
// chosen by price or availability. All options remain on the product detail page.
export const homeVariantIds:Record<string,string>={
  'perf-0139':'perf-0139-f96f25b0',
  'parent-0012':'gc004904', 'parent-0007':'gc003444', 'parent-0215':'gc005055',
  'parent-0001':'gc004371',
  'perf-0001':'perf-0001-960372f7', 'perf-0011':'perf-0011-960372f7',
  'perf-0029':'perf-0029-960372f7', 'perf-0041':'perf-0041-f96f25b0',
  'perf-0072':'perf-0072-960372f7', 'perf-0082':'perf-0082-960372f7',
  'parent-0234':'gc004731', 'parent-0298':'gc000432', 'parent-0060':'gc002391',
  'parent-0061':'gc002788', 'parent-0071':'gc003408',
};
export function defaultCardVariant(product:Product) {
  return product.variants.find(variant=>variant.id===homeVariantIds[product.id])||product.variants[0];
}
export const homeVariant=defaultCardVariant;

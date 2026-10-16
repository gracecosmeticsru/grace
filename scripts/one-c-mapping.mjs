// Offline identity rehearsal only. XML parsing, storage and storefront activation belong to later stages.
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = value => typeof value === 'string' && value.length > 0 && value.trim() === value;
const decimal = value => typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)
  && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= Number.MAX_SAFE_INTEGER;
const group = (rows, key) => {
  const result = new Map();
  for (const row of rows) {
    const value = key(row);
    if (!result.has(value)) result.set(value, []);
    result.get(value).push(row);
  }
  return result;
};

export function rehearseMappings({sourceId, registry, offers, products}) {
  if (!id(sourceId) || !record(registry) || registry.schema !== 1 || registry.sourceId !== sourceId
    || !id(registry.priceTypeId) || !Array.isArray(registry.bindings)
    || !Array.isArray(offers) || !Array.isArray(products)) throw new Error('Invalid input or source mismatch');
  if (products.some(p => !record(p) || !id(p.id) || !Array.isArray(p.variants)
    || p.variants.some(v => !record(v) || !id(v.id)))) throw new Error('Malformed website catalog');

  const productIds = group(products, p => p.id);
  const variants = group(products.flatMap(p => p.variants.map(v => ({productId: p.id, variantId: v.id}))), v => v.variantId);
  const bindingIds = group(registry.bindings.filter(record), b => b.externalId);
  const bindingTargets = group(registry.bindings.filter(record), b => b.variantId);
  const validBindings = new Map(), registryIssues = [];
  registry.bindings.forEach((binding, index) => {
    const reasons = [];
    if (!record(binding) || !id(binding.externalId) || !id(binding.productId) || !id(binding.variantId)) {
      registryIssues.push({index, externalId: record(binding) && id(binding.externalId) ? binding.externalId : null, reasons: ['malformed_binding']});
      return;
    }
    if (binding.status !== 'OWNER_CONFIRMED' || binding.confirmation?.by !== 'USER'
      || !id(binding.confirmation?.quote) || !Number.isFinite(Date.parse(binding.confirmation?.at))) reasons.push('unconfirmed_binding');
    if (bindingIds.get(binding.externalId).length !== 1) reasons.push('duplicate_external_binding');
    if (bindingTargets.get(binding.variantId).length !== 1) reasons.push('duplicate_variant_binding');
    const targets = variants.get(binding.variantId) ?? [];
    if (targets.length === 0) reasons.push('missing_site_variant');
    else if (targets.length !== 1) reasons.push('ambiguous_site_variant');
    else if (targets[0].productId !== binding.productId) reasons.push('wrong_site_product');
    if ((productIds.get(binding.productId) ?? []).length !== 1) reasons.push('missing_or_ambiguous_site_product');
    if (reasons.length) registryIssues.push({index, externalId: binding.externalId, reasons});
    else validBindings.set(binding.externalId, binding);
  });

  const offeredIds = group(offers.filter(record), o => o.externalId);
  const matched = [], excluded = [];
  const seen = new Set();
  offers.forEach((offer, index) => {
    const externalId = record(offer) && id(offer.externalId) ? offer.externalId : null;
    const reject = reason => excluded.push({index, externalId, reason});
    if (!externalId) return reject('missing_or_invalid_external_id');
    seen.add(externalId);
    if (offeredIds.get(externalId).length !== 1) return reject('duplicate_offer_id');
    const binding = validBindings.get(externalId);
    if (!binding) return reject(bindingIds.has(externalId) ? 'invalid_or_ambiguous_binding' : 'unmapped_external_id');

    const issues = [];
    if (offer.status != null && offer.status !== '') issues.push('source_status_unverified');
    if (offer.catalogStatus != null && offer.catalogStatus !== '') issues.push('catalog_status_unverified');
    if (offer.unit !== 'PCE') issues.push('unsupported_quantity_unit');
    const rawQuantity = typeof offer.quantity === 'string' ? offer.quantity : null;
    if (rawQuantity === null) issues.push('missing_quantity');
    else if (!decimal(rawQuantity)) issues.push('invalid_quantity');
    else if (rawQuantity.startsWith('-')) issues.push('negative_quantity');
    const prices = Array.isArray(offer.prices) ? offer.prices.filter(p => record(p) && p.typeId === registry.priceTypeId) : [];
    let price = null;
    if (prices.length === 0) issues.push('missing_retail_price');
    else if (prices.length !== 1) issues.push('ambiguous_retail_price');
    else {
      const selected = prices[0];
      if (!decimal(selected.amount) || Number(selected.amount) <= 0) issues.push('invalid_retail_price');
      else if (selected.currency !== 'RUB') issues.push('unsupported_currency');
      else if (selected.unit !== 'PCE' || selected.coefficient !== '1') issues.push('unsupported_price_unit');
      else price = {amount: selected.amount, currency: selected.currency};
    }
    matched.push({externalId, productId: binding.productId, variantId: binding.variantId,
      price, rawQuantity, quantity: decimal(rawQuantity) && !rawQuantity.startsWith('-') && offer.unit === 'PCE' ? rawQuantity : null,
      issues, applied: false});
  });
  const missingMappedIds = [...validBindings.keys()].filter(externalId => !seen.has(externalId));
  return {sourceId, applied: false, registryIssues, matched, excluded, missingMappedIds,
    summary: {inputOffers: offers.length, validBindings: validBindings.size, matched: matched.length, excluded: excluded.length,
      matchedWithIssues: matched.filter(row => row.issues.length > 0).length, missingMapped: missingMappedIds.length}};
}

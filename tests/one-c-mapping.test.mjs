import test from 'node:test';
import assert from 'node:assert/strict';
import {rehearseMappings} from '../scripts/one-c-mapping.mjs';

function input() {
  const confirmation = {by: 'USER', quote: 'Both shades confirmed', at: '2026-10-17T00:00:00Z'};
  return {sourceId: 'copy', registry: {schema: 1, sourceId: 'copy', priceTypeId: 'retail', bindings: [
    {externalId: 'item-a', productId: 'lipstick', variantId: 'shade-101', status: 'OWNER_CONFIRMED', confirmation},
    {externalId: 'item-b', productId: 'lipstick', variantId: 'shade-104', status: 'OWNER_CONFIRMED', confirmation},
  ]}, products: [{id: 'lipstick', name: 'Website name', variants: [{id: 'shade-101', sku: 'repeated'}, {id: 'shade-104', sku: 'repeated'}, {id: 'shade-107', sku: null}]}],
  offers: ['item-a', 'item-b'].map((externalId, i) => ({externalId, name: 'Different source name', unit: 'PCE', quantity: String(i + 1),
    prices: [{typeId: 'retail', amount: String(300 + i * 50), currency: 'RUB', unit: 'PCE', coefficient: '1'}]}))};
}

test('independent source items map to exact shades without SKU fallback, mutation or sibling expansion', () => {
  const data = input(), original = structuredClone(data), result = rehearseMappings(data);
  assert.deepEqual(result.matched.map(r => [r.variantId, r.price.amount, r.quantity]), [['shade-101', '300', '1'], ['shade-104', '350', '2']]);
  assert.equal(result.summary.matched, 2);
  assert.equal(result.matched.some(r => r.variantId === 'shade-107'), false);
  assert.equal(result.applied, false);
  assert.deepEqual(data, original);
  data.offers[0].name = 'Renamed';
  data.products[0].name = 'Also renamed';
  assert.deepEqual(rehearseMappings(data), result);
});

test('wrong source and malformed top-level/catalog inputs fail before rehearsal', () => {
  for (const change of [d => d.sourceId = 'primary', d => d.registry.sourceId = 'primary', d => d.registry.schema = 2,
    d => d.registry.priceTypeId = '', d => d.offers = null, d => d.products[0].variants = null]) {
    const data = input(); change(data); assert.throws(() => rehearseMappings(data));
  }
});

test('duplicate source bindings and duplicate variant targets quarantine every affected binding', () => {
  for (const field of ['externalId', 'variantId']) {
    const data = input(); data.registry.bindings[1][field] = data.registry.bindings[0][field];
    const result = rehearseMappings(data);
    assert.equal(result.registryIssues.length, 2);
    assert.equal(result.matched.length, 0);
    assert.equal(result.excluded.length, 2);
  }
});

test('unknown IDs cannot inherit a mapping by identical name or SKU; missing IDs are reported', () => {
  const data = input(); data.offers[0].externalId = 'unmapped'; data.offers[0].sku = 'repeated';
  data.offers.push({name: data.offers[1].name, sku: 'repeated'});
  const result = rehearseMappings(data);
  assert.deepEqual(result.excluded.map(r => r.reason), ['unmapped_external_id', 'missing_or_invalid_external_id']);
  assert.deepEqual(result.missingMappedIds, ['item-a']);
  assert.equal(result.matched[0].variantId, 'shade-104');
});

test('pending or undocumented bindings and missing/wrong site variants stay isolated', () => {
  for (const change of [b => b.status = 'PENDING_OWNER_REVIEW', b => b.confirmation = null, b => b.confirmation = {by: 'USER'},
    b => b.variantId = 'unknown', b => b.productId = 'wrong']) {
    const data = input(); change(data.registry.bindings[0]); const result = rehearseMappings(data);
    assert.equal(result.registryIssues.length, 1);
    assert.equal(result.matched.length, 1);
    assert.equal(result.excluded[0].reason, 'invalid_or_ambiguous_binding');
  }
});

test('duplicate website variant or parent IDs are ambiguous', () => {
  const variant = input(); variant.products[0].variants.push({id: 'shade-101'});
  assert.equal(rehearseMappings(variant).registryIssues[0].reasons.includes('ambiguous_site_variant'), true);
  const parent = input(); parent.products.push({id: 'lipstick', variants: []});
  assert.equal(rehearseMappings(parent).matched.length, 0);
});

test('duplicate offers are not chosen by order, and absent mapped rows are not turned into zero stock', () => {
  const data = input(); data.offers.push(structuredClone(data.offers[0]));
  let result = rehearseMappings(data);
  assert.equal(result.matched.length, 1);
  assert.equal(result.excluded.filter(r => r.reason === 'duplicate_offer_id').length, 2);
  data.offers = [];
  result = rehearseMappings(data);
  assert.equal(result.matched.length, 0);
  assert.deepEqual(result.missingMappedIds, ['item-a', 'item-b']);
});

test('zero, negative, missing, invalid and unsupported quantities remain distinct', () => {
  for (const [quantity, unit, issue] of [['0', 'PCE', null], ['-3', 'PCE', 'negative_quantity'],
    [null, 'PCE', 'missing_quantity'], ['', 'PCE', 'invalid_quantity'], ['NaN', 'PCE', 'invalid_quantity'],
    ['1e3', 'PCE', 'invalid_quantity'], ['9007199254740992', 'PCE', 'invalid_quantity'], ['2', 'MLT', 'unsupported_quantity_unit']]) {
    const data = input(); Object.assign(data.offers[0], {quantity, unit}); const row = rehearseMappings(data).matched[0];
    if (issue) {assert.ok(row.issues.includes(issue)); assert.equal(row.quantity, null);}
    else {assert.equal(row.quantity, '0'); assert.deepEqual(row.issues, []);}
  }
});

test('only the configured retail price is inspected; missing/duplicate/invalid prices do not become zero', () => {
  const data = input(); const good = structuredClone(data.offers[0].prices[0]);
  for (const [prices, issue] of [[[], 'missing_retail_price'], [[{...good, typeId: 'wholesale'}], 'missing_retail_price'],
    [[good, good], 'ambiguous_retail_price'], [[{...good, amount: '0'}], 'invalid_retail_price'],
    [[{...good, amount: '-2'}], 'invalid_retail_price'], [[{...good, amount: 'NaN'}], 'invalid_retail_price'],
    [[{...good, currency: 'USD'}], 'unsupported_currency'], [[{...good, coefficient: '100'}], 'unsupported_price_unit'],
    [[{...good, unit: 'MLT'}], 'unsupported_price_unit']]) {
    data.offers[0].prices = prices; const row = rehearseMappings(data).matched[0];
    assert.equal(row.price, null); assert.ok(row.issues.includes(issue));
  }
  data.offers[0].prices = [{...good, typeId: 'wholesale', amount: '1'}, good];
  assert.equal(rehearseMappings(data).matched[0].price.amount, '300');
});

test('deletion or unknown source statuses are flagged even when identity, price and quantity match', () => {
  for (const field of ['status', 'catalogStatus']) {
    const data = input(); data.offers[0][field] = 'Удален';
    const row = rehearseMappings(data).matched[0];
    assert.ok(row.issues.includes(field === 'status' ? 'source_status_unverified' : 'catalog_status_unverified'));
    assert.equal(row.applied, false);
  }
});

test('deterministic repeated rehearsal does not accumulate or change results', () => {
  const data = input(); assert.deepEqual(rehearseMappings(data), rehearseMappings(data));
});

test('decimal rounding cannot disguise an unsupported conversion coefficient', () => {
  const data = input();
  data.offers[0].prices[0].coefficient = '1.0000000000000001';
  const row = rehearseMappings(data).matched[0];
  assert.equal(row.price, null);
  assert.ok(row.issues.includes('unsupported_price_unit'));
});

test('negative quantity underflow stays negative in the report rather than becoming usable zero', () => {
  const data = input();
  data.offers[0].quantity = '-0.' + '0'.repeat(400) + '1';
  const row = rehearseMappings(data).matched[0];
  assert.equal(row.rawQuantity, data.offers[0].quantity);
  assert.equal(row.quantity, null);
  assert.ok(row.issues.includes('negative_quantity'));
});

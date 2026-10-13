import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeVariant,homeVariantIds,defaultCardVariant} from '../lib/home-variants.ts';
import {resolveProductVariant,variantProductUrl,variantProductName,variantPurchaseState} from '../lib/variant-product.ts';
import {addBagLine,updateBagQuantity,loadShopState,shopKeys} from '../lib/shop-state.ts';
import {formatPrice} from '../lib/pricing.ts';
import {demoInventory,purchaseQuantityLimit} from '../lib/demo-inventory.ts';

const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url),'utf8'));
const product=products.find(p=>p.id==='parent-0215');
const large=product.variants.find(v=>v.id==='gc005055');
const small=product.variants.find(v=>v.id==='gc005056');

test('two real volumes retain their own prices, titles and URL selection',()=>{
  for(const [variant,label,price] of [[large,'100 мл','2\u00a0800 ₽'],[small,'30 мл','1\u00a0200 ₽']]){
    assert.equal(formatPrice(variant.price),price);
    assert.ok(variantProductName(product,variant).includes(label));
    const url=new URL(variantProductUrl(product,variant),'http://grace.test');
    assert.equal(resolveProductVariant(product,url.searchParams.get('variant')).id,variant.id);
  }
  assert.equal(resolveProductVariant(product,'variant-from-another-product').id,product.variants[0].id);
  assert.equal(resolveProductVariant(product).id,product.variants[0].id);
});

test('home choices are existing fixed variants, including the pictured unpriced bottle',()=>{
  for(const [id,variantId] of Object.entries(homeVariantIds)){
    const item=products.find(p=>p.id===id);
    assert.ok(item.variants.some(v=>v.id===variantId));
    assert.equal(homeVariant(item).id,variantId);
  }
  const bottle=products.find(p=>p.id==='perf-0139');
  assert.equal(homeVariant(bottle).label,'Флакон 50 мл');
  assert.equal(homeVariant(bottle).price,null);
  // Reordering or changing prices must not change an explicitly pinned choice.
  assert.equal(homeVariant({...product,variants:[small,large]}).id,large.id);
});

test('missing price and verified absence never offer purchase; unknown stays unknown',()=>{
  for(const price of [null,0,-1,NaN,Infinity])assert.equal(variantPurchaseState({...large,price}).canAdd,false);
  const unavailable=variantPurchaseState(large,'unavailable');
  assert.equal(unavailable.waiting,true);
  assert.equal(large.price,2800);
  assert.deepEqual(variantPurchaseState(large),{canAdd:true,waiting:false,stock:'unknown'});
  assert.equal(products.every(p=>p.variants.every(v=>v.availability==='unknown')),true);
});

test('shared catalog card preserves its explicit variant instead of borrowing a sibling price',()=>{
  assert.equal(defaultCardVariant(product).id,large.id);
  const family=products.find(p=>p.id==='perf-0003');
  assert.ok(family.variants.some(v=>v.price>0));
  const chosen=defaultCardVariant(family);
  assert.equal(chosen.id,family.variants[0].id);
  assert.equal(chosen.price,null);
  assert.equal(variantPurchaseState(chosen).canAdd,false);
  assert.ok(variantProductName(family,chosen).includes(chosen.label));
  const url=new URL(variantProductUrl(family,chosen),'http://grace.test');
  assert.equal(resolveProductVariant(family,url.searchParams.get('variant')).id,chosen.id);
});

test('isolated bag keeps two variants separate and increments repeats when no stock cap is supplied',()=>{
  let bag=addBagLine([],product,large);
  bag=addBagLine(bag,product,small);
  bag=addBagLine(bag,product,small);
  assert.deepEqual(bag.map(b=>[b.variant.id,b.quantity,b.variant.price]),[[large.id,1,2800],[small.id,2,1200]]);
});

test('owner-requested demo cap is one per variant and preserves legacy quantities',()=>{
  assert.equal(demoInventory.enabled,true);
  assert.equal(purchaseQuantityLimit,1);
  let bag=addBagLine([],product,large,purchaseQuantityLimit);
  assert.strictEqual(addBagLine(bag,product,large,purchaseQuantityLimit),bag);
  assert.strictEqual(updateBagQuantity(bag,large.id,2,purchaseQuantityLimit),bag);
  bag=addBagLine(bag,product,small,purchaseQuantityLimit);
  assert.equal(bag.length,2);
  const legacy=[{product,variant:large,quantity:3}];
  const stored={getItem:key=>key===shopKeys.bag?JSON.stringify(legacy):JSON.stringify([product.id]),setItem(){throw Error('load must not write');},removeItem(){}};
  assert.deepEqual(loadShopState(()=>stored),{bag:legacy,favorites:[product.id]});
  assert.strictEqual(addBagLine(legacy,product,large,1),legacy);
  assert.equal(updateBagQuantity(legacy,large.id,2,1)[0].quantity,2);
  assert.deepEqual(updateBagQuantity(legacy,large.id,0,1),[]);
});

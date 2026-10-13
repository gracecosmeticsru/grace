import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShopState,readSavedProducts,favoriteMatches,toggleVariantFavorite,resolveSavedVariant,
  savedProductId,sameSavedProduct,rememberViewed,rememberVariantViewed,saveStoredValue,shopKeys} from '../lib/shop-state.ts';

const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url),'utf8'));
const product=products.find(item=>item.id==='parent-0215');
const [first,second]=product.variants;
const reference=variant=>({productId:product.id,variantId:variant.id});
function storage(values={},failWrite=false){
 const data=new Map(Object.entries(values)),writes=[];
 return {data,writes,access:()=>({getItem:key=>data.get(key)??null,setItem(key,value){if(failWrite)throw Error('Quota');writes.push(key);data.set(key,value);},removeItem:key=>data.delete(key)})};
}

test('two favorites of one family remain independent and preserve old family and unknown entries',()=>{
 const legacy=[product.id,'unknown-family',{productId:'unknown-family',variantId:'unknown-variant'}];
 let favorites=toggleVariantFavorite(legacy,product,first);
 favorites=toggleVariantFavorite(favorites,product,second);
 assert.deepEqual(favorites,[...legacy,reference(first),reference(second)]);
 assert.equal(favoriteMatches(legacy,product.id,first.id),false);
 assert.equal(favoriteMatches(favorites,product.id,first.id),true);
 assert.equal(favoriteMatches(favorites,product.id,second.id),true);
 assert.equal(favoriteMatches(favorites,'different-family',first.id),false);
 favorites=toggleVariantFavorite(favorites,product,first);
 assert.deepEqual(favorites,[...legacy,reference(second)]);
 assert.equal(favoriteMatches(favorites,product.id,first.id),false);
 assert.equal(favoriteMatches(favorites,product.id,second.id),true);
 const store=storage();
 assert.equal(saveStoredValue(shopKeys.favorites,favorites,store.access),true);
 assert.deepEqual(loadShopState(store.access).favorites,favorites);
 assert.equal(toggleVariantFavorite(favorites,product,{...first,id:'foreign-variant'}),favorites);
});

test('legacy and exact references never guess a sibling, even for a singleton family',()=>{
 const singleton=products.find(item=>item.variants.length===1);
 assert.equal(resolveSavedVariant(product.id,product),undefined);
 assert.equal(resolveSavedVariant(singleton.id,singleton),undefined);
 assert.equal(resolveSavedVariant(reference(second),product),second);
 assert.equal(resolveSavedVariant({...reference(first),variantId:'missing'},product),undefined);
 assert.equal(resolveSavedVariant(reference(first),{...product,id:'different-family'}),undefined);
 assert.equal(resolveSavedVariant(reference(first)),undefined);
 assert.equal(sameSavedProduct(product.id,reference(first)),false);
 assert.equal(sameSavedProduct(reference(first),reference(second)),false);
 assert.equal(sameSavedProduct(reference(first),{variantId:first.id,productId:product.id}),true);
 assert.equal(savedProductId(product.id),product.id);
 assert.equal(savedProductId(reference(second)),product.id);
});

test('mixed storage and legacy bag snapshots survive reads without writes or migration',()=>{
 const favorites=[product.id,reference(first),reference(second),'unknown-family',{productId:'unknown-family',variantId:'missing'},''];
 const bag=[{product,variant:second,quantity:7}];
 const values={[shopKeys.favorites]:JSON.stringify(favorites),[shopKeys.bag]:JSON.stringify(bag),[shopKeys.viewed]:JSON.stringify(favorites)};
 const store=storage(values);
 assert.deepEqual(loadShopState(store.access),{favorites,bag});
 assert.deepEqual(readSavedProducts(shopKeys.viewed,undefined,store.access),favorites);
 assert.deepEqual(store.writes,[]);
 assert.deepEqual(Object.fromEntries(store.data),values);
 const updated=toggleVariantFavorite(favorites,product,first);
 saveStoredValue(shopKeys.favorites,updated,store.access);
 assert.equal(store.data.get(shopKeys.bag),values[shopKeys.bag]);
 assert.deepEqual(loadShopState(store.access).bag,bag);
});

test('invalid records are excluded from rendering while raw storage remains unchanged on reads',()=>{
 const entries=[null,42,{},[],{productId:product.id},{productId:product.id,variantId:''},{productId:17,variantId:first.id},product.id,reference(second),'unknown'];
 const raw=JSON.stringify(entries);
 const store=storage({[shopKeys.favorites]:raw});
 assert.deepEqual(loadShopState(store.access).favorites,[product.id,reference(second),'unknown']);
 assert.equal(store.data.get(shopKeys.favorites),raw);
 assert.deepEqual(store.writes,[]);
 for(const raw of ['{broken','null','{}']){
  const broken=storage({[shopKeys.viewed]:raw});
  assert.deepEqual(readSavedProducts(shopKeys.viewed,12,broken.access),[]);
  assert.equal(broken.data.get(shopKeys.viewed),raw);
  assert.deepEqual(broken.writes,[]);
 }
 assert.deepEqual(readSavedProducts(shopKeys.favorites,undefined,()=>{throw Error('Blocked');}),[]);
});

test('history records exact variants in view order and retains legacy and unknown references',()=>{
 const old=[product.id,'unknown-family',{productId:'unknown-family',variantId:'missing'}];
 const store=storage({[shopKeys.viewed]:JSON.stringify(old)});
 assert.equal(rememberVariantViewed(product,first,store.access),true);
 assert.equal(rememberVariantViewed(product,second,store.access),true);
 assert.deepEqual(readSavedProducts(shopKeys.viewed,12,store.access),[reference(second),reference(first),...old]);
 rememberVariantViewed(product,first,store.access);
 assert.deepEqual(readSavedProducts(shopKeys.viewed,12,store.access),[reference(first),reference(second),...old]);
 rememberViewed(product.id,store.access);
 assert.deepEqual(readSavedProducts(shopKeys.viewed,12,store.access),[product.id,reference(first),reference(second),...old.slice(1)]);
 const before=store.data.get(shopKeys.viewed);
 assert.equal(rememberVariantViewed(product,{...first,id:'foreign'},store.access),false);
 assert.equal(store.data.get(shopKeys.viewed),before);
});

test('history keeps the most recent 12 references and does not grow on repeated views',()=>{
 const store=storage({[shopKeys.viewed]:JSON.stringify(Array.from({length:12},(_,i)=>'old-'+i))});
 rememberVariantViewed(product,first,store.access);
 rememberVariantViewed(product,second,store.access);
 rememberVariantViewed(product,first,store.access);
 const history=readSavedProducts(shopKeys.viewed,undefined,store.access);
 assert.equal(history.length,12);
 assert.deepEqual(history,[reference(first),reference(second),...Array.from({length:10},(_,i)=>'old-'+i)]);
 assert.deepEqual(readSavedProducts(shopKeys.viewed,2,store.access),[reference(first),reference(second)]);
});

test('failed writes preserve the previous exact/legacy records and leave bag data untouched',()=>{
 const raw=JSON.stringify([product.id,reference(first)]);
 const bag=JSON.stringify([{product,variant:second,quantity:3}]);
 const store=storage({[shopKeys.favorites]:raw,[shopKeys.viewed]:raw,[shopKeys.bag]:bag},true);
 assert.equal(rememberVariantViewed(product,second,store.access),false);
 assert.equal(saveStoredValue(shopKeys.favorites,[reference(second)],store.access),false);
 assert.equal(store.data.get(shopKeys.favorites),raw);
 assert.equal(store.data.get(shopKeys.viewed),raw);
 assert.equal(store.data.get(shopKeys.bag),bag);
 assert.deepEqual(store.writes,[]);
});

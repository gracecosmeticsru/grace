import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadShopState,readStringList,saveStoredValue,removeStoredValue,rememberViewed,addBagLine,updateBagQuantity,shopKeys} from '../lib/shop-state.ts';
import {formatPrice,productPrice} from '../lib/pricing.ts';

const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url),'utf8'));
function memoryStorage(values={}, {readFailure,writeFailure}={}) {
  const entries=new Map(Object.entries(values));
  const writes=[];
  const storage={
    getItem(key){if(key===readFailure)throw Error('Unavailable');return entries.get(key)??null;},
    setItem(key,value){if(key===writeFailure)throw Error('Quota');writes.push(key);entries.set(key,value);},
    removeItem(key){if(key===writeFailure)throw Error('Unavailable');entries.delete(key);},
  };
  return {access:()=>storage,entries,writes};
}
const sample=products.find(p=>p.variants.length>1);
const line={product:sample,variant:sample.variants[1],quantity:2};

test('broken or inaccessible favorites do not hide a valid bag or overwrite storage on load',()=>{
  for(const readFailure of [undefined,shopKeys.favorites]){
    const store=memoryStorage({[shopKeys.favorites]:'{broken',[shopKeys.bag]:JSON.stringify([line])},{readFailure});
    assert.deepEqual(loadShopState(store.access),{favorites:[],bag:[line]});
    assert.deepEqual(store.writes,[]);
    assert.equal(store.entries.get(shopKeys.favorites),'{broken');
  }
  const store=memoryStorage({[shopKeys.favorites]:'["gc002705"]',[shopKeys.bag]:'{broken'});
  assert.deepEqual(loadShopState(store.access),{favorites:['gc002705'],bag:[]});
});

test('valid legacy snapshots for every catalog variant retain IDs, prices and quantities',()=>{
  const bag=products.flatMap(product=>product.variants.map(variant=>({product,variant,quantity:1})));
  const store=memoryStorage({[shopKeys.bag]:JSON.stringify(bag)});
  assert.deepEqual(loadShopState(store.access).bag,bag);
  assert.equal(bag.length,6089);
});

test('malformed lines and cross-product variants cannot reach the bag UI',()=>{
  const invalid=[null,{product:{id:42},variant:{id:7},quantity:1},
    {...line,quantity:0.5},{...line,quantity:100},
    {...line,product:{...sample,name:{}}},
    {...line,variant:{...line.variant,id:'not-a-variant-of-this-product'}}];
  const store=memoryStorage({[shopKeys.bag]:JSON.stringify([...invalid,line])});
  assert.deepEqual(loadShopState(store.access).bag,[line]);
  assert.equal(JSON.parse(store.entries.get(shopKeys.bag)).length,invalid.length+1);
});

test('a failed favorite write does not prevent saving the bag',()=>{
  const store=memoryStorage({}, {writeFailure:shopKeys.favorites});
  assert.equal(saveStoredValue(shopKeys.favorites,['gc002705'],store.access),false);
  assert.equal(saveStoredValue(shopKeys.bag,[line],store.access),true);
  assert.deepEqual(JSON.parse(store.entries.get(shopKeys.bag)),[line]);
  assert.equal(removeStoredValue(shopKeys.favorites,store.access),false);
  assert.equal(saveStoredValue(shopKeys.bag,[line],()=>{throw Error('Storage blocked');}),false);
});

test('view history handles invalid JSON/elements and retains order and the 12-item limit',()=>{
  const store=memoryStorage({[shopKeys.viewed]:'{broken'});
  assert.equal(rememberViewed('first',store.access),true);
  assert.deepEqual(readStringList(shopKeys.viewed,12,store.access),['first']);
  store.entries.set(shopKeys.viewed,JSON.stringify([{toString:0},null,123,...Array.from({length:12},(_,i)=>'p'+i)]));
  assert.equal(rememberViewed('p5',store.access),true);
  const history=readStringList(shopKeys.viewed,12,store.access);
  assert.deepEqual(history,['p5','p0','p1','p2','p3','p4','p6','p7','p8','p9','p10','p11']);
  assert.doesNotThrow(()=>history.join(','));
});

test('adding and changing quantity preserves the exact selected variant and missing price',()=>{
  const product=products.find(p=>p.variants.some(v=>v.price===null)&&p.variants.some(v=>v.price>0));
  const unpriced=product.variants.find(v=>v.price===null);
  const priced=product.variants.find(v=>v.price>0);
  let bag=addBagLine([],product,unpriced);
  bag=addBagLine(bag,product,priced);
  bag=addBagLine(bag,product,unpriced);
  assert.deepEqual(bag.map(b=>[b.variant.id,b.variant.price,b.quantity]),[[unpriced.id,null,2],[priced.id,priced.price,1]]);
  assert.equal(formatPrice(bag[0].variant.price),'— ₽');
  assert.ok(formatPrice(bag[1].variant.price).endsWith(' ₽'));
  assert.equal(productPrice([unpriced]),'— ₽');
  assert.equal(updateBagQuantity(bag,unpriced.id,200)[0].quantity,99);
  assert.equal(updateBagQuantity(bag,unpriced.id,0.5),bag);
  assert.deepEqual(updateBagQuantity(bag,unpriced.id,0),[bag[1]]);
  assert.equal(addBagLine(bag,product,{...priced,id:'foreign-variant'}),bag);
});

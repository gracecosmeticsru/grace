import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';

// Execute the production module with the existing TypeScript compiler; resolve only its JSON aliases.
const require=createRequire(new URL('../lib/catalog.ts',import.meta.url));
const source=readFileSync(new URL('../lib/catalog.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
const catalog={};
new Function('require','exports',compiled.outputText)(id=>{
  assert.ok(id.startsWith('@/data/')&&id.endsWith('.json'),'Unexpected catalog runtime dependency: '+id);
  return require('../'+id.slice(2));
},catalog);
const {queryCatalog,queryVariantCatalog,variantNavigation,variantBrands}=catalog;
const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url),'utf8'));
const rows=products.flatMap(product=>product.variants.map(variant=>({product,variant})));
const ids=items=>items.map(item=>item.variant.id);
function all(filters={}){
  const first=queryVariantCatalog(filters),items=[...first.items];
  for(let page=2;page<=first.pages;page++)items.push(...queryVariantCatalog({...filters,page}).items);
  return items;
}
const anua=products.find(p=>p.id==='parent-0215');

test('all pages contain every source variant exactly once, including unpriced and uncategorized rows',()=>{
  const first=queryVariantCatalog(),last=queryVariantCatalog({page:999});
  assert.equal(first.total,rows.length);
  assert.equal(first.total,6089);
  assert.equal(first.pages,Math.ceil(rows.length/24));
  assert.equal(first.pages,254);
  assert.equal(last.items.length,17);
  const found=all(),seen=ids(found);
  assert.equal(new Set(seen).size,rows.length);
  assert.deepEqual(new Set(seen),new Set(ids(rows)));
  const sourceById=new Map(rows.map(r=>[r.variant.id,r]));
  for(const item of found){
    const original=sourceById.get(item.variant.id);
    assert.equal(item.product.id,original.product.id);
    assert.deepEqual(item.variant,original.variant);
  }
  assert.equal(found.filter(r=>r.variant.price===null).length,rows.filter(r=>r.variant.price===null).length);
  assert.equal(found.filter(r=>!r.product.paths.length).length,rows.filter(r=>!r.product.paths.length).length);
});

test('exact SKU and variant ID find their own volume, with no sibling SKU leakage',()=>{
  for(const variant of anua.variants){
    for(const q of [variant.id,variant.sku,'  '+variant.sku.toLowerCase()+'  ']){
      const result=queryVariantCatalog({q});
      assert.equal(result.total,1);
      assert.deepEqual(ids(result.items),[variant.id]);
      assert.equal(result.items[0].variant.price,variant.price);
    }
  }
  assert.deepEqual(ids(queryVariantCatalog({q:'Anua Hyaluronic Mist 30 мл'}).items),['gc005056']);
});

test('shade search matches the selected shade instead of another shade in its family',()=>{
  const family=products.find(p=>p.id==='parent-0007');
  for(const label of ['0.5N','0N']){
    const variant=family.variants.find(v=>v.label===label);
    assert.ok(variant);
    assert.deepEqual(ids(queryVariantCatalog({q:family.name+' '+label}).items),[variant.id]);
  }
  // Existing substring search still permits 0N inside 00N, but never borrows a sibling's label.
  const glow=products.find(p=>p.id==='parent-0010');
  assert.deepEqual(ids(queryVariantCatalog({q:glow.name+' 0N'}).items),glow.variants.filter(v=>v.label.includes('0N')).map(v=>v.id));
});

test('shared name finds all sibling variants; Russian and Unicode search normalization remains available',()=>{
  assert.deepEqual(ids(queryVariantCatalog({q:anua.name}).items),anua.variants.map(v=>v.id));
  assert.equal(queryVariantCatalog({q:'ＡＮＵＡ'}).total,queryVariantCatalog({q:'anua'}).total);
  const russian=products.find(p=>p.name.includes('ё'));
  assert.ok(russian);
  assert.deepEqual(ids(all({q:russian.name})),ids(all({q:russian.name.replaceAll('ё','е').toUpperCase()})));
});

test('category, multiple brands and family-level variant filters preserve their original meaning',()=>{
  const filters=[{path:'skincare'},{brand:'Anua|Celimax'},{type:'shade'},{type:'volume'},{type:'decant'},
    {path:'skincare',brand:'Anua|Celimax',type:'volume'},{ids:[anua.id]}, {type:'unknown'}];
  for(const f of filters){
    const expected=rows.filter(({product:p})=>(!f.path||p.paths.some(x=>x===f.path||x.startsWith(f.path+'/')))
      &&(!f.brand||f.brand.split('|').includes(p.brand))&&(!f.ids||f.ids.includes(p.id))
      &&(f.type==='shade'?p.variants.some(v=>v.type==='Оттенок'):f.type==='volume'?p.variants.length>1&&p.variants.some(v=>v.type==='Объём'):f.type==='decant'?p.decant:true));
    const actual=all(f);
    assert.equal(actual.length,expected.length,JSON.stringify(f));
    assert.deepEqual(new Set(ids(actual)),new Set(ids(expected)),JSON.stringify(f));
  }
});

test('sorts keep stable source variant order and the established default brand ranking',()=>{
  const brands=['Anua','Celimax','Dr. Althea','Round Lab','Rare Beauty','Dior','Tom Ford','La Sultane de Saba','Sol de Janeiro','Hempz'];
  const ranked=p=>brands.includes(p.brand)?brands.indexOf(p.brand):999;
  const subset=products.filter(p=>['Anua','Celimax','Dior'].includes(p.brand));
  for(const sort of ['selection','name','brand']){
    const ordered=[...subset].sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ru'):sort==='brand'?a.brand.localeCompare(b.brand,'ru')||a.name.localeCompare(b.name,'ru'):ranked(a)-ranked(b)||b.variants.length-a.variants.length);
    assert.deepEqual(ids(all({brand:'Anua|Celimax|Dior',sort})),ordered.flatMap(p=>p.variants.map(v=>v.id)));
  }
});

test('category and brand presentation counts agree with variant queries and do not alter family counts',()=>{
  for(const node of variantNavigation)assert.equal(node.count,queryVariantCatalog({path:node.path}).total,node.path);
  for(const brand of variantBrands)assert.equal(brand.count,queryVariantCatalog({brand:brand.name}).total,brand.name);
  assert.equal(variantBrands.find(b=>b.name==='Anua').count,29);
  const originalBrands=JSON.parse(readFileSync(new URL('../data/brands.json',import.meta.url),'utf8'));
  const originalNavigation=JSON.parse(readFileSync(new URL('../data/navigation.json',import.meta.url),'utf8'));
  assert.deepEqual(catalog.brands,originalBrands);
  assert.deepEqual(catalog.navigation,originalNavigation);
  const result=queryVariantCatalog({q:anua.name,brand:'not-a-brand',type:'shade'});
  assert.equal(result.total,0);
  assert.equal(result.brands.find(b=>b.name==='Anua').count,2,'Facets remain available before brand/type filters');
});

test('page bounds and empty queries return consistent counts and slices',()=>{
  for(const page of [0,-1,NaN,-Infinity])assert.equal(queryVariantCatalog({page}).page,1);
  assert.equal(queryVariantCatalog({page:2.9}).page,2);
  assert.equal(queryVariantCatalog({page:Infinity}).page,254);
  const empty=queryVariantCatalog({q:'no-such-grace-variant-zzzz',page:100});
  assert.deepEqual([empty.total,empty.page,empty.pages,empty.items.length],[0,1,1,0]);
  assert.deepEqual(ids(queryVariantCatalog({page:2}).items),ids(all()).slice(24,48));
});

test('legacy family query keeps the existing API shape, ID selection and family search behavior',()=>{
  const result=queryCatalog();
  assert.deepEqual(Object.keys(result).sort(),['brands','page','pages','products','total']);
  assert.equal(result.total,products.length);
  assert.equal(result.total,4526);
  assert.equal(result.pages,Math.ceil(products.length/24));
  const selected=queryCatalog({ids:[anua.id,anua.id],page:999});
  assert.deepEqual([selected.total,selected.page,selected.pages],[1,1,1]);
  assert.deepEqual(selected.products.map(p=>p.id),[anua.id]);
  assert.equal(queryCatalog({q:'GC005056'}).products[0].id,anua.id);
  assert.deepEqual(queryCatalog({q:'GC005056'}).products[0].variants,anua.variants);
});

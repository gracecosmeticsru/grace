import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {productMedia} from '../lib/product-media.ts';
import {getProductContent} from '../lib/product-content.ts';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const products=read('../data/products.json');
const product=id=>products.find(p=>p.id===id);
const media=(id,vid)=>{const p=product(id);return productMedia(p,p.variants.find(v=>v.id===vid));};
test('exact prepared pairs resolve; sibling sizes and shades do not inherit',()=>{
 assert.equal(media('parent-0215','gc005055').src,'/images/products/gc005055.webp');
 assert.equal(media('parent-0215','gc005056'),null);
 assert.equal(media('parent-0007','gc003444').src,'/images/products/gc003444.webp');
 const dior=product('parent-0007');
 const unpictured={...dior.variants[0],id:'unpictured-sibling'};
 assert.equal(productMedia({...dior,variants:[...dior.variants,unpictured]},unpictured),null);
 const perfume=product('perf-0139');
 assert(productMedia(perfume,perfume.variants.find(v=>v.format==='Флакон')));
 for(const v of perfume.variants.filter(v=>v.format!=='Флакон'))assert.equal(productMedia(perfume,v),null);
 assert.equal(productMedia(product('parent-0215'),product('parent-0007').variants[0]),null);
 assert.equal(productMedia(product('parent-0215')),null);
});
test('existing Hope photo survives the new photo skip',()=>{
 assert.equal(media('gc003374','gc003374').src,'/images/rare-beauty-lip-oil-hope-3ml.jpg');
 assert.equal(media('gc003374','gc003374').prepared,false);
});
test('content belongs only to exact selected IDs, no sibling or foreign content',()=>{
 const content=getProductContent(product('parent-0215'));
 assert(content.gc005055?.description);
 assert.equal(content.gc005056,undefined);
 const forged={...product('parent-0215'),id:'parent-0007'};
 assert.deepEqual(getProductContent(forged),{});
 assert(getProductContent(product('gc003282')).gc003282.description===null);
});

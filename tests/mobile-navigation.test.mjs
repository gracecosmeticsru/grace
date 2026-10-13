import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mobileCatalogLevel} from '../lib/mobile-navigation.ts';
const nodes=JSON.parse(readFileSync(new URL('../data/navigation.json',import.meta.url)));

test('every catalog category is reachable and returns to its real parent',()=>{
 const visited=new Set();
 function walk(path){
  const {children}=mobileCatalogLevel(nodes,path);
  for(const node of children){
   assert(!visited.has(node.path),'duplicate or cyclic category');visited.add(node.path);
   const level=mobileCatalogLevel(nodes,node.path);
   assert.equal(level.current.name,node.name);
   assert.equal(level.current.parent,path);
   assert(mobileCatalogLevel(nodes,level.current.parent).children.some(child=>child.path===node.path));
   walk(node.path);
  }
 }
 walk(null);assert.equal(visited.size,nodes.length);assert(visited.size>50);
});
test('unknown and empty paths safely show the root catalog',()=>{
 const roots=nodes.filter(node=>node.parent===null).map(node=>node.path);
 assert(roots.length>0);
 for(const path of [null,'','missing/category']){
  const level=mobileCatalogLevel(nodes,path);
  assert.equal(level.current,undefined);assert.deepEqual(level.children.map(node=>node.path),roots);
 }
 assert.deepEqual(mobileCatalogLevel([],null).children,[]);
});

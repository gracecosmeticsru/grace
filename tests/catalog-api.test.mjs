import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url),'utf8'));
const base=process.env.GRACE_BASE_URL||'http://127.0.0.1:5173';
async function catalog(params){
  const response=await fetch(base+'/api/catalog?'+new URLSearchParams(params),{signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200);
  return response.json();
}
test('all 501 saved product IDs remain reachable through the real paginated API',async()=>{
  const ids=products.slice(0,501).map(p=>p.id);
  const first=await catalog({ids:ids.join(',')});
  assert.equal(first.total,501);
  const seen=new Set(first.products.map(p=>p.id));
  for(let page=2;page<=first.pages;page++){
    const result=await catalog({ids:ids.join(','),page:String(page)});
    for(const product of result.products)seen.add(product.id);
  }
  assert.deepEqual(seen,new Set(ids));
});
test('API rejects malformed IDs, deduplicates matches and clamps an emptied last page',async()=>{
  const id=products[0].id;
  const filtered=await catalog({ids:[id,id,'../not-an-id','<invalid>'].join(','),page:'-3'});
  assert.equal(filtered.total,1);
  assert.equal(filtered.page,1);
  const result=await catalog({ids:products.slice(0,48).map(p=>p.id).join(','),page:'3'});
  assert.equal(result.total,48);
  assert.equal(result.page,2);
  assert.equal(result.pages,2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createCdekService,cdekSettingsReady} from '../lib/cdek-service.ts';
import {parseCdekPoint} from '../lib/cdek-pickup.ts';
const settings={account:'unit-account',secret:'unit-secret'};
const url='http://localhost/api/delivery/cdek/service';
const cities='?action=cities&q='+encodeURIComponent('Тестоград');
const points='?action=points&cityCode=123';
const office=(code='TEST1',address='Тестовая улица, 1')=>({code,type:'PVZ',is_handout:true,work_time:'Пн-Пт 10:00-20:00',location:{country_code:'RU',city_code:123,city:'Тестоград',region:'Тестовая область',address}});
const token=()=>Response.json({access_token:'unit-token',expires_in:3600});

test('only CDEK pair is required; absent configuration never calls upstream',async()=>{
  assert.equal(cdekSettingsReady(settings),true);
  for(const missing of ['account','secret']){
    let called=false;const config={...settings,[missing]:''};
    assert.equal(cdekSettingsReady(config),false);
    const handler=createCdekService(config,async()=>{called=true;throw Error('Must not call');});
    assert.equal((await handler(new Request(url+cities))).status,503);assert.equal(called,false);
  }
});
test('only GET and bounded city/point search are accepted; arbitrary upstream actions fail',async()=>{
  let calls=0;const handler=createCdekService(settings,async()=>{calls++;throw Error('Must not call');});
  assert.equal((await handler(new Request(url+points,{method:'POST'}))).status,405);
  for(const query of ['?action=orders','?action=byCoordinate','?action=cities&q=a',points+'&page=-1',points+'&page=501',points+'&q='+encodeURIComponent('x\n'),'?action=points&cityCode=0','?action=points&cityCode=https://bad.invalid','?action=cities&q='+'a'.repeat(121)])assert.equal((await handler(new Request(url+query))).status,400,query);
  assert.equal(calls,0);
});
test('city search preserves region and CDEK IDs, enforces RU and ignores arbitrary upstream URL',async()=>{
  const calls=[];const handler=createCdekService(settings,async(address,options)=>{
    calls.push({address,options});if(address.endsWith('oauth/token'))return token();
    return Response.json([{code:123,city:'Тестоград',region:'Первый регион',sub_region:'Первый район',country_code:'RU'},{code:456,city:'Тестоград',region:'Второй регион',country_code:'RU'},{code:789,city:'Тестоград',country_code:'KZ'}]);
  });
  const r=await handler(new Request(url+cities+'&url=https://bad.invalid&country_codes=KZ'));
  assert.equal(r.status,200);const data=await r.json();assert.deepEqual(data.items.map(c=>[c.code,c.region]),[[123,'Первый регион'],[456,'Второй регион']]);
  const upstream=new URL(calls[1].address);assert.equal(upstream.origin,'https://api.cdek.ru');assert.equal(upstream.pathname,'/v2/location/cities');assert.equal(upstream.searchParams.get('country_codes'),'RU');assert.equal(upstream.searchParams.get('size'),'6');assert.equal(upstream.searchParams.has('url'),false);
  assert.equal(calls[0].options.method,'POST');assert.equal(calls[0].options.body.get('client_secret'),'unit-secret');
});
test('pickup list projects public fields, filters foreign cities/types, supports address search and six-item pages',async()=>{
  let oauth=0,reads=0;const good=Array.from({length:8},(_,i)=>office('T'+i,'Тестовая улица, '+i));
  const invalid=[{...office('FOREIGN'),location:{...office().location,country_code:'KZ'}},{...office('WRONGCITY'),location:{...office().location,city_code:999}},{...office('BOX'),type:'POSTAMAT'},{...office('CLOSED'),is_handout:false}];
  const handler=createCdekService(settings,async(address)=>{if(address.endsWith('oauth/token')){oauth++;return token();}reads++;return Response.json([...good,...invalid]);});
  const first=await (await handler(new Request(url+points))).json();assert.equal(first.items.length,6);assert.equal(first.total,8);assert.equal(first.hasMore,true);assert.equal(first.items[0].workTime,'Пн-Пт 10:00-20:00');assert.equal(first.items[0].cityCode,123);
  const second=await(await handler(new Request(url+points+'&page=1'))).json();assert.equal(second.items.length,2);assert.equal(second.hasMore,false);
  const found=await(await handler(new Request(url+points+'&q=T7'))).json();assert.deepEqual(found.items.map(p=>p.code),['T7']);
  const empty=await(await handler(new Request(url+points+'&q=unknown'))).json();assert.equal(empty.total,0);
  assert.equal(oauth,1);assert.equal(reads,1);assert.equal(JSON.stringify(first).includes('unit-secret'),false);
});
test('failed authorization, malformed response, timeout and oversized response give safe retryable errors',async()=>{
  for(const upstream of [async()=>{throw Error('unit-secret');},async()=>new Response('unit-secret',{status:401}),async(address)=>address.endsWith('oauth/token')?token():Response.json(null),async(address)=>address.endsWith('oauth/token')?token():new Response('x'.repeat(5_000_001))]){
    const response=await createCdekService(settings,upstream)(new Request(url+points));assert.equal(response.status,503);assert.equal((await response.text()).includes('unit-secret'),false);
  }
});
test('expired upstream authorization clears cached token, next attempt authorizes again',async()=>{
  let auth=0,reads=0;const handler=createCdekService(settings,async(address)=>{if(address.endsWith('oauth/token')){auth++;return token();}reads++;return reads===1?new Response(null,{status:401}):Response.json([]);});
  assert.equal((await handler(new Request(url+points))).status,503);assert.equal((await handler(new Request(url+points))).status,200);assert.equal(auth,2);
});
test('point parser rejects foreign/malformed input and preserves real location metadata',()=>{
  const point={countryCode:'RU',code:'TEST1',city:'Тестоград',address:'Тестовая улица, 1',cityCode:123,region:'Тестовая область',workTime:'10:00-20:00'};
  assert.deepEqual(parseCdekPoint(point),point);
  for(const invalid of [null,{},'TEST1',{...point,countryCode:'KZ'},{...point,address:''},{...point,code:'x'.repeat(51)},{...point,city:'x\n'}])assert.equal(parseCdekPoint(invalid),null);
});

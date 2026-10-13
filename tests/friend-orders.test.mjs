import {buildSync} from 'esbuild';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {Miniflare, Log, LogLevel, createFetchMock} from 'miniflare';
import {friendsOrdersEnabled, reviewCatalogVariant} from '../lib/friend-orders.ts';
import {createOrderService} from '../lib/order-service.ts';
import {createTelegramOutbox} from '../lib/telegram-outbox.ts';
import {fakeTelegram} from '../scripts/telegram-local.mjs';

test('hosted intake requires its exact host, explicit flag and both notification settings', () => {
  const settings = {GRACE_ORDERS_ENABLED: '1', GRACE_ORDER_HOST: 'friends.example', GRACE_TELEGRAM_BOT_TOKEN: 'set', GRACE_TELEGRAM_CHAT_ID: 'set'};
  assert.equal(friendsOrdersEnabled('friends.example', settings), true);
  for (const key of Object.keys(settings)) assert.equal(friendsOrdersEnabled('friends.example', {...settings, [key]: ''}), false);
  for (const host of ['127.0.0.1:5173', 'another.example', 'friends.example.evil']) assert.equal(friendsOrdersEnabled(host, settings), false);
});

test('catalog review keeps missing prices unknown and distinguishes the demo limit from real inventory', () => {
  const product = {id:'p',name:'Товар',variants:[{id:'v',label:'50 мл',price:123.45},{id:'unknown',label:'100 мл'}]};
  assert.deepEqual(reviewCatalogVariant(product,'v',1),{productId:'p',variantId:'v',name:'Товар',label:'50 мл',sku:null,unitPriceKopecks:12345,available:1,revision:'catalog-manager-confirmation',source:'catalog-review'});
  assert.equal(reviewCatalogVariant(product,'unknown',1).unitPriceKopecks,null);
  assert.equal(reviewCatalogVariant(product,'absent',1),null);
});

test('fresh hosted migrations preserve order/outbox atomicity, session isolation and single Telegram delivery', async () => {
  const mf = new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:{DB:'fresh-friends-test'},log:new Log(LogLevel.NONE)});
  try {
    const db = await mf.getD1Database('DB');
    const journal = JSON.parse(await readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
    for (const entry of journal.entries) {
      const sql = await readFile(new URL(`../drizzle/${entry.tag}.sql`,import.meta.url),'utf8');
      for (const statement of sql.split('--> statement-breakpoint').filter(x=>x.trim())) await db.prepare(statement).run();
    }
    const variant = reviewCatalogVariant({id:'p',name:'Тестовый товар',variants:[{id:'v',label:'50 мл',price:123.45}]},'v',1);
    const service=createOrderService({db,enabled:true,lookupVariant:()=>variant});
    const origin='https://friends.example';
    const send=(path,body,headers={})=>service(new Request(origin+path,{method:'POST',headers:{origin,'Content-Type':'application/json',...headers},body:JSON.stringify(body)}));
    const session=await send('/api/orders/session',{});
    const cookie=session.headers.get('set-cookie').split(';')[0];
    assert.ok(cookie.startsWith('__Host-grace_guest='));
    assert.match(session.headers.get('set-cookie'),/HttpOnly; SameSite=Strict;.*Secure/);
    const submission={order:{schemaVersion:1,customer:{fullName:'Тестовая Заявка',phone:'+70000000000'},delivery:{method:'post',countryCode:'RU',region:'Тестовая область',city:'Тестовый город',postcode:'000000',address:'Тестовый адрес'},items:[{productId:'p',variantId:'v',quantity:1}],comment:'ТЕСТ. Не обрабатывать.'},expectedPrices:[{variantId:'v',unitPriceKopecks:12345}]};
    const headers={cookie,'idempotency-key':crypto.randomUUID()};
    assert.equal((await send('/api/orders',submission)).status,401);
    assert.equal((await send('/api/orders',submission,{...headers,origin:'https://evil.example'})).status,403);
    const saved=await (await send('/api/orders',submission,headers)).json();
    assert.equal(saved.ok,true);
    assert.deepEqual(await (await send('/api/orders',submission,headers)).json(),saved);
    const rows=await db.prepare('SELECT (SELECT count(*) FROM guest_orders) AS orders, (SELECT count(*) FROM order_outbox) AS jobs, (SELECT count(*) FROM telegram_dispatch) AS dispatch').first();
    assert.deepEqual(rows,{orders:1,jobs:1,dispatch:1});
    const calls=[];
    const outbox=createTelegramOutbox({db,enabled:true,token:'123456789:isolated_fixture_no_external_network',chatId:'-1001234567890',expectedTitle:'Тест группа',fetcher:fakeTelegram(calls),now:()=>Date.now()+10000});
    assert.equal((await outbox.processOne(saved.orderId)).state,'sent');
    assert.equal((await outbox.processOne(saved.orderId)).state,'idle');
    const messages=calls.filter(x=>x.method==='sendMessage');
    assert.equal(messages.length,1);
    assert.match(messages[0].body.text,/Цена, наличие, доставка и оплата подтверждаются менеджером/);
    assert.ok(!messages[0].body.text.startsWith('ТЕСТ —'));
    assert.equal((await db.prepare('SELECT attempts FROM order_outbox WHERE order_id=?').bind(saved.orderId).first()).attempts,1);
  } finally {await mf.dispose();}
});


test('actual Workers runtime can verify Telegram and rejects redirects without following them', async () => {
  const script=buildSync({stdin:{contents:`import {preflightTelegram} from './lib/telegram-outbox.ts'; export default {async fetch(request,env){return Response.json(await preflightTelegram({token:env.TOKEN,chatId:env.CHAT,expectedTitle:'Тест группа'}));}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',target:'es2022',write:false}).outputFiles[0].text;
  const token='123456789:isolated_fixture_no_external_network',chat='-1001234567890';
  for (const redirect of [false,true]) {
    const mock=createFetchMock();mock.disableNetConnect();const pool=mock.get('https://api.telegram.org');
    pool.intercept({path:'/bot'+token+'/getMe',method:'POST'}).reply(redirect?302:200,redirect?'':{ok:true,result:{id:123456789,is_bot:true}},{headers:redirect?{location:'https://never-follow.invalid/'}:{'Content-Type':'application/json'}});
    if(!redirect){
      pool.intercept({path:'/bot'+token+'/getChat',method:'POST'}).reply(200,{ok:true,result:{id:Number(chat),type:'supergroup',title:'Тест группа'}});
      pool.intercept({path:'/bot'+token+'/getChatMember',method:'POST'}).reply(200,{ok:true,result:{user:{id:123456789},status:'member'}});
    }
    const mf=new Miniflare({modules:true,script,bindings:{TOKEN:token,CHAT:chat},fetchMock:mock,compatibilityDate:'2026-05-15',log:new Log(LogLevel.NONE)});
    try{const r=await mf.dispatchFetch('https://local/');assert.deepEqual(await r.json(),redirect?{ok:false,code:'bot_unverified'}:{ok:true});mock.assertNoPendingInterceptors();}finally{await mf.dispose();await mock.close();}
  }
});

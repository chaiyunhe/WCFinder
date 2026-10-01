import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, normalize } from './index.mjs';
const poi={id:'a',name:'公共厕所',type:'公共设施;公共厕所',location:'121.47,31.23',address:'入口',adname:'黄浦区'};
test('只保留上海有效厕所点位，并按供应商 ID 去重',()=>{
 assert.equal(normalize([poi,poi,{...poi,id:'b',location:'0,0'},{...poi,id:'c',type:'餐饮服务'}]).length,1);
 assert.equal(normalize([poi])[0].address,'黄浦区 入口');
});
async function serve(t, options){const server=createServer(options); await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));return `http://127.0.0.1:${server.address().port}`;}
test('未配置服务不能返回虚构结果',async t=>{const base=await serve(t,{key:''});const r=await fetch(base+'/api/restrooms?q=公园');assert.equal(r.status,503);assert.equal((await r.json()).results,undefined);});
test('真实接口参数、坐标校验、响应及密钥不泄露',async t=>{
 let calls=0;
 const base=await serve(t,{key:'test-only',fetcher:async url=>{calls++;const u=new URL(url);assert.equal(u.pathname,'/v3/place/around');assert.equal(u.searchParams.get('location'),'121.470000,31.230000');return {ok:true,json:async()=>({status:'1',pois:[poi]})};}});
 assert.equal((await fetch(base+'/api/restrooms?latitude=0&longitude=0')).status,400);
 const r=await fetch(base+'/api/restrooms?latitude=31.23&longitude=121.47');const body=await r.text();assert.equal(r.status,200);assert.equal(calls,1);assert.ok(!body.includes('test-only'));assert.equal(JSON.parse(body).results.length,1);
});
test('供应商失败返回错误且不暴露供应商响应',async t=>{const base=await serve(t,{key:'test',fetcher:async()=>({ok:true,json:async()=>({status:'0',info:'sensitive'})})});const r=await fetch(base+'/api/restrooms?q=厕所');assert.equal(r.status,502);assert.ok(!(await r.text()).includes('sensitive'));});

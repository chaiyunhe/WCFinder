import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, normalize } from './index.mjs';
const poi={id:'a',name:'公共厕所',type:'公共设施;公共厕所',location:'121.47,31.23',address:'入口',adname:'黄浦区'};
test('只保留有效厕所点位，并按供应商 ID 去重',()=>{
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
test('全国多类点位按真实坐标直线距离排序，不把普通医院当作 AED',()=>{
 const origin={longitude:116.4,latitude:39.9};
 const near={...poi,id:'bj1',location:'116.401,39.9'},far={...poi,id:'bj2',location:'116.42,39.9'};
 const rows=normalize([far,near,near],'toilet',origin);
 assert.deepEqual(rows.map(r=>r.id),['bj1','bj2']);assert.ok(rows[0].distanceMeters>0);assert.ok(rows[0].distanceMeters<100);
 assert.equal(normalize([{...near,name:'医院',type:'医疗保健服务'},{...far,name:'AED自动体外除颤器',type:'医疗保健服务'}],'aed').length,1);
 assert.equal(normalize([{...near,type:'交通设施服务;停车场'}],'parking').length,1);
});
test('跨城查询保留选择的城市，坐标只用于排序；AED按关键词搜索',async t=>{
 const urls=[];const base=await serve(t,{key:'test',fetcher:async url=>{urls.push(new URL(url));return {ok:true,json:async()=>({status:'1',pois:[]})};}});
 for(const category of ['toilet','parking','aed']){
 const r=await fetch(base+'/api/restrooms?city=110000&scope=city&category='+category+'&longitude=121.47&latitude=31.23');assert.equal(r.status,200);
 }
 assert.ok(urls.every(u=>u.pathname==='/v3/place/text'&&u.searchParams.get('city')==='110000'));
 assert.equal(urls[1].searchParams.get('types'),'停车场');assert.equal(urls[2].searchParams.get('keywords'),'AED');assert.equal(urls[2].searchParams.has('types'),false);
 assert.equal((await fetch(base+'/api/restrooms?city=北京&category=invalid')).status,400);
 assert.equal((await fetch(base+'/api/restrooms?scope=nearby')).status,400);
 assert.equal((await fetch(base+'/api/restrooms?longitude=&latitude=31')).status,400);
 assert.equal(urls.length,3);
});
test('逆地理解析直辖市及一般城市到市级区域码',async t=>{
 let address={province:'北京市',city:[],district:'朝阳区',adcode:'110105'};
 const base=await serve(t,{key:'test',fetcher:async url=>{assert.equal(new URL(url).pathname,'/v3/geocode/regeo');return {ok:true,json:async()=>({status:'1',regeocode:{addressComponent:address}})};}});
 const url=base+'/api/restrooms?action=locate&longitude=116.4&latitude=39.9';
 assert.deepEqual((await (await fetch(url)).json()).city,{name:'北京市',adcode:'110000'});
 address={province:'江苏省',city:'苏州市',adcode:'320505'};
 assert.deepEqual((await (await fetch(url)).json()).city,{name:'苏州市',adcode:'320500'});
});

test('厕所类型只展示明确名称标注，未知和无障碍不推断',()=>{
 for(const [name,expected] of [['公共厕所',[]],['公园男厕所',['男厕']],['女卫生间',['女厕']],['第三卫生间',['第三卫生间']],['无障碍卫生间',[]],['公共厕所(无女厕)',[]]]){
  assert.deepEqual(normalize([{...poi,name}])[0].restroomTypes,expected);
 }
 assert.equal(normalize([{...poi,type:'交通设施服务;停车场'}],'parking')[0].restroomTypes,undefined);
});

test('同址男女厕及第三卫生间合并并保留标签',()=>{
 const rows=normalize([
 {...poi,id:'m',name:'公园公共厕所(男厕)'},
 {...poi,id:'f',name:'公园公共厕所(女厕)',location:'121.47005,31.23'},
 {...poi,id:'t',name:'公园公共厕所(第三卫生间)'}
 ],'toilet',{longitude:121.47,latitude:31.23});
 assert.equal(rows.length,1);assert.equal(rows[0].name,'公园厕所');
 assert.deepEqual(rows[0].restroomTypes,['男厕','女厕','第三卫生间']);
 assert.equal(rows[0].mergedCount,3);assert.equal(rows[0].longitude,121.47);
});
test('不同楼层入口、不同名称及较远位置不合并，其他类别不受影响',()=>{
 const male={...poi,name:'商场男厕所'};
 for(const other of [
 {...poi,id:'f',name:'商场女厕所',address:'二层'},
 {...poi,id:'f',name:'另一商场女厕所'},
 {...poi,id:'f',name:'商场女厕所',location:'121.471,31.23'}
 ])assert.equal(normalize([male,other]).length,2);
 assert.equal(normalize([{...male,type:'交通设施服务;停车场'},{...male,id:'b',type:'交通设施服务;停车场'}],'parking').length,2);
});
test('通用名称缺少地址不合并，相邻点不进行链式合并',()=>{
 assert.equal(normalize([{...poi,name:'男厕',address:'',adname:''},{...poi,id:'b',name:'女厕',address:'',adname:''}]).length,2);
 const rows=normalize([0,1,2].map((n)=>({...poi,id:String(n),name:n===1?'女厕':'男厕',location:'121.47,'+(31.23+n*0.00013)})));
 assert.equal(rows.length,2);
});
test('指定地点先解析坐标，再查周边并按目标而非用户位置排序',async t=>{
 const urls=[];const base=await serve(t,{key:'test',fetcher:async url=>{
  const u=new URL(url);urls.push(u);
  return {ok:true,json:async()=>({status:'1',pois:u.pathname.endsWith('/text')?[{name:'人民广场地铁站',location:'121.47,31.23'}]:[
   {...poi,id:'far',location:'121.48,31.23'}, {...poi,id:'near',location:'121.4701,31.23'}]})};
 }});
 const response=await fetch(base+'/api/restrooms?scope=target&q=人民广场站&city=上海&longitude=116.4&latitude=39.9');
 const data=await response.json();assert.equal(response.status,200);
 assert.equal(urls[0].searchParams.get('keywords'),'人民广场站');
 assert.equal(urls[1].pathname,'/v3/place/around');
 assert.equal(urls[1].searchParams.get('location'),'121.470000,31.230000');
 assert.equal(data.searchOrigin.name,'人民广场地铁站');
 assert.equal(data.results[0].id,'near');assert.ok(data.results[0].distanceMeters<20);
});
test('指定地点无法定位不退回当前位置',async t=>{
 const base=await serve(t,{key:'test',fetcher:async()=>({ok:true,json:async()=>({status:'1',pois:[]})})});
 assert.equal((await fetch(base+'/api/restrooms?scope=target&q=不存在的地点&city=上海')).status,404);
});

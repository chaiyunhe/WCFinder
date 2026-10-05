const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
let page; const calls = [];
vm.runInNewContext(fs.readFileSync('miniprogram/pages/index/index.js','utf8'), {
  require:()=>({cloudEnv:'test',functionName:'restroomSearch'}), Page:p=>page=p,
  wx:{showModal(){},cloud:{callFunction:o=>calls.push(o)}}
});
page.setData=function(p){Object.assign(this.data,p);}; page.onLoad();
page.load({q:'甲'}); page.load({q:'乙'});
calls[0].success({result:{statusCode:200,data:{results:[{name:'旧',latitude:31,longitude:121}]}}});
assert.equal(page.data.results.length,0);
calls[1].success({result:{statusCode:503,data:{error:'未配置'}}}); calls[1].complete();
assert.equal(page.data.error,'未配置'); assert.equal(page.data.loading,false);
page.load({q:'丙'});page.onUnload();calls[2].success({result:{statusCode:200,data:{results:[{name:'迟到',latitude:31,longitude:121}]}}});
assert.equal(page.data.results.length,0);
console.log('PASS cloud response envelope, errors and stale responses');
// Exact client coordinates determine order even when viewing a different city.
page.onLoad();page.userLocation={latitude:31,longitude:121};page.setData({city:'苏州市'});
page.load({q:''});const sorted=calls[calls.length-1];
assert.equal(sorted.data.scope,'city');assert.equal(sorted.data.city,'苏州市');
sorted.success({result:{statusCode:200,data:{results:[{id:'far',name:'远',latitude:31.1,longitude:121},{id:'near',name:'近',latitude:31.001,longitude:121}]}}});
assert.equal(page.data.results[0].id,'near');assert.ok(page.data.results[0].distanceText.includes('米'));
page.select(1);assert.equal(page.userLocation.latitude,31,'map selection must not move user');
page.userLocation=null;page.load({q:'无定位'});calls[calls.length-1].success({result:{statusCode:200,data:{results:[{name:'距离不可用',latitude:31,longitude:121,distanceMeters:99}]}}});
assert.equal(page.data.results[0].distanceText,'','no inferred user distance');
page.onCategoryChange({currentTarget:{dataset:{category:'aed'}}});assert.equal(calls[calls.length-1].data.category,'aed');
console.log('PASS actual distance ordering, cross-city context, no-location and category switching');
// Location consent is mandatory; delayed location callbacks cannot override manual selection.
let consent,locateCallback,locationCalls=0;const queue=[];let p;
vm.runInNewContext(fs.readFileSync('miniprogram/pages/index/index.js','utf8'),{
 require:()=>({cloudEnv:'test',functionName:'restroomSearch'}),Page:v=>p=v,
 wx:{showModal:o=>consent=o,getLocation:o=>{locationCalls++;locateCallback=o;},cloud:{callFunction:o=>queue.push(o)}}
});
p.setData=function(v){Object.assign(this.data,v);};p.onLoad();assert.equal(locationCalls,0);
consent.success({confirm:false});assert.equal(locationCalls,0);
p.locateCity();consent.success({confirm:true});assert.equal(locationCalls,1);
p.onCityChange({detail:{value:['浙江省','宁波市']}});locateCallback.success({latitude:31,longitude:121});
assert.equal(p.data.cityName,'宁波市');assert.equal(queue.length,1,'stale location cannot start reverse geocode');
p.locateCity();consent.success({confirm:true});locateCallback.success({latitude:31,longitude:121});
const reverse=queue[queue.length-1];assert.equal(reverse.data.action,'locate');
p.onCityChange({detail:{value:['广东省','深圳市']}});reverse.success({statusCode:200,data:{city:{name:'上海市',adcode:'310000'}}});
assert.equal(p.data.cityName,'深圳市');
console.log('PASS consent and manual city/location callback races');
p.nearby();consent.success({confirm:true});locateCallback.success({latitude:30,longitude:120});
const nearbyCity=queue[queue.length-1];nearbyCity.success({result:{statusCode:200,data:{city:{name:'杭州市',adcode:'330100'}}}});
// callFunction callbacks unwrap the cloud response envelope.
assert.equal(queue[queue.length-1].data.scope,'nearby');
assert.equal(queue[queue.length-1].data.latitude,30);
console.log('PASS nearby query scope');

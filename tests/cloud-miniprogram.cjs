const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
let page; const calls = [];
vm.runInNewContext(fs.readFileSync('miniprogram/pages/index/index.js','utf8'), {
  require:()=>({cloudEnv:'test',functionName:'restroomSearch'}), Page:p=>page=p,
  wx:{cloud:{callFunction:o=>calls.push(o)}}
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

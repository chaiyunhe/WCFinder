const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve('miniprogram'),cache=new Map();let page;
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 assert.equal(path.extname(file),'.js','Mini-program runtime modules must be JavaScript');
 const module={exports:{}};cache.set(file,module);
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{module,exports:module.exports,
 require:relative=>{assert.ok(relative.startsWith('.'));let target=path.resolve(path.dirname(file),relative);if(!path.extname(target))target+='.js';return load(target);},
 Page:value=>page=value,App:()=>{},wx:{showModal(){},cloud:{init(){}}}
 },{filename:file});
 return module.exports;
}
load(path.join(root,'app.js'));load(path.join(root,'pages/index/index.js'));
assert.ok(page);page.setData=function(values){Object.assign(this.data,values);};page.onLoad();
page.setData({cityName:'上海市'});page.resetMetro();assert.ok(page.data.metroLines.includes('2号线'));
console.log('PASS actual JS module graph, page registration, startup and metro data');

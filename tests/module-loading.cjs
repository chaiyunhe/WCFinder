const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve('miniprogram'),cache=new Map();let page;const opened=[];
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 assert.equal(path.extname(file),'.js','Mini-program runtime modules must be JavaScript');
 const module={exports:{}};cache.set(file,module);
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{module,exports:module.exports,
 require:relative=>{assert.ok(relative.startsWith('.'));let target=path.resolve(path.dirname(file),relative);if(!path.extname(target))target+='.js';return load(target);},
 Page:value=>page=value,App:()=>{},wx:{showModal(){},openLocation:options=>opened.push(options),cloud:{init(){}}}
 },{filename:file});
 return module.exports;
}
load(path.join(root,'app.js'));load(path.join(root,'pages/index/index.js'));
assert.ok(page);page.setData=function(values){Object.assign(this.data,values);};page.onLoad();
page.setData({cityName:'上海市'});page.resetMetro();assert.ok(page.data.metroLines.includes('2号线'));
console.log('PASS actual JS module graph, page registration, startup and metro data');

page.setData({results:[{name:'目标厕所',latitude:31.2,longitude:121.4,address:'入口'}]});
page.onMarker({detail:{markerId:0}});
assert.equal(opened.length,1);assert.equal(opened[0].latitude,31.2);assert.equal(opened[0].longitude,121.4);
page.onMarker({detail:{markerId:99}});assert.equal(opened.length,1);
console.log('PASS marker tap opens correct navigation destination, invalid marker ignored');

const coordinates=require('../miniprogram/data/metro-coordinates')['上海']['人民广场'];
page.userLocation={longitude:coordinates[0],latitude:coordinates[1]};page.locationCity='上海';page.resetMetro();
assert.equal(page.data.metroStation,'人民广场');
assert.ok(page.data.metroStations.includes('人民广场'));
page.setData({cityName:'北京市'});page.resetMetro();assert.equal(page.data.metroStation,'');
console.log('PASS nearest metro default and cross-city manual selection');

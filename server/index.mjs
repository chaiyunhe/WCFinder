import http from 'node:http';
import https from 'node:https';
import { pathToFileURL } from 'node:url';
// Use Node's built-in HTTPS client so cloud runtimes do not need global fetch.
export function fetchJson(url, {timeoutMs = 8000} = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, response => {
      const chunks = [];
      let size = 0;
      response.on('data', chunk => {
        size += chunk.length;
        if (size > 1024 * 1024) { response.destroy(new Error('response too large')); return; }
        chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          resolve({ok: response.statusCode >= 200 && response.statusCode < 300, json: async () => data});
        } catch (error) { reject(error); }
      });
    });
    const timer = setTimeout(() => request.destroy(new Error('upstream timeout')), timeoutMs);
    request.on('error', reject);
    request.on('close', () => clearTimeout(timer));
  });
}
const categories = {toilet: {type: '公共厕所'}, parking: {type: '停车场'}, aed: {keyword: 'AED'}, charging: {type:'充电站'}, repair: {type:'汽车维修'}};
const validCoordinates = (longitude, latitude) => Number.isFinite(longitude) && Number.isFinite(latitude) && longitude >= 73 && longitude <= 136 && latitude >= 3 && latitude <= 54;
export function distanceMeters(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h))));
}
// Only explicit facility labels in the provider's POI name; no inference from generic toilets.
export function restroomTypes(name) {
  const text=String(name || '');
  return [
    ['男厕', /男(?:厕(?:所)?|卫生间|洗手间)/],
    ['女厕', /女(?:厕(?:所)?|卫生间|洗手间)/],
    ['第三卫生间', /第三(?:卫生间|厕所)/]
  ].filter(([,pattern])=>pattern.test(text) && !new RegExp('(?:无|没有|不设|未设|非)' + pattern.source).test(text)).map(([label])=>label);
}
function restroomIdentity(name) {
  return name.replace(/第三(?:卫生间|厕所)|[男女](?:厕(?:所)?|卫生间|洗手间)/g, '厕所')
    .replace(/公共卫生间|公共厕所|卫生间|洗手间/g, '厕所')
    .replace(/[（(]厕所[)）]/g, '').replace(/[\s·—_()（）-]/g, '')
    .replace(/(?:厕所)+/g, '厕所');
}
export function mergeRestrooms(items) {
  const groups = [];
  for (const item of items) {
    const key = restroomIdentity(item.name);
    // Require the same facility name and address. Compare every member to avoid chain merging.
    const group = groups.find(g => g.key === key && g.address === item.address &&
      (item.address || key !== '厕所') &&
      g.members.every(other => distanceMeters(other, item) <= 20) &&
      (item.restroomTypes.length || g.members.some(other => other.restroomTypes.length)));
    if (group) group.members.push(item);
    else groups.push({key, address:item.address, members:[item]});
  }
  return groups.map(g => {
    if (g.members.length === 1) return g.members[0];
    const representative = g.members.find(p => !p.restroomTypes.length) || g.members[0];
    const types = new Set(g.members.flatMap(p => p.restroomTypes));
    return {...representative, name:representative.restroomTypes.length ? g.key : representative.name,
      restroomTypes:['男厕','女厕','第三卫生间'].filter(t => types.has(t)),
      mergedCount:g.members.length};
  });
}
function textIdentity(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s·•，,。()（）]/g, '');
}
export function mergeDuplicatePlaces(items) {
  const groups=[];
  for(const item of items){
    const name=textIdentity(item.name),address=textIdentity(item.address);
    // Full-pair distance checks prevent a chain of nearby distinct locations being collapsed.
    const group=groups.find(g=>g.name===name && g.category===item.category &&
      g.address===address && g.items.every(p=>distanceMeters(p,item)<=(address?20:3)));
    if(group)group.items.push(item);
    else groups.push({name,address,category:item.category,items:[item]});
  }
  return groups.map(g=>{
    if(g.items.length===1)return g.items[0];
    const representative=g.items[0];
    const result={...representative,mergedCount:g.items.reduce((sum,p)=>sum+(p.mergedCount||1),0)};
    if(representative.category==='toilet'){
      const types=new Set(g.items.flatMap(p=>p.restroomTypes||[]));
      result.restroomTypes=['男厕','女厕','第三卫生间'].filter(t=>types.has(t));
    }
    return result;
  });
}
export function normalize(pois, category = 'toilet', origin) {
  const seen = new Set();
  let results = pois.flatMap(p => {
    const [longitude, latitude] = String(p.location || '').split(',').map(Number);
    const matches = category === 'aed' ? /AED|自动体外除颤|自动除颤/i.test(String(p.name || '')) : String(p.type || '').includes(categories[category].type);
    if (!matches || !p.id || !p.name || !validCoordinates(longitude, latitude) || seen.has(p.id)) return [];
    seen.add(p.id);
    const item = { id: String(p.id), name: String(p.name), address: [p.cityname, p.adname, typeof p.address === 'string' ? p.address : ''].filter(v => typeof v === 'string' && v).join(' '), longitude, latitude, source: '高德地图', category };
    if (category === 'toilet') item.restroomTypes = restroomTypes(p.name);
    if (origin) item.distanceMeters = distanceMeters(origin, item);
    return [item];
  });
  if (category === 'toilet') results = mergeRestrooms(results);
  results = mergeDuplicatePlaces(results);
  if (origin) results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return results;
}
export function normalizeCity(address) {
  const province = typeof address.province === 'string' ? address.province : '';
  const name = typeof address.city === 'string' && address.city ? address.city : (/^(北京|上海|天津|重庆)/.test(province) ? province : address.district);
  const code = String(address.adcode || '');
  if (!name || !/^\d{6}$/.test(code)) throw new Error('missing city');
  const adcode = /^(11|12|31|50)/.test(code) ? code.slice(0, 2) + '0000' : /^(4190|4290|4690|6590)/.test(code) ? code : code.slice(0, 4) + '00';
  return {name, adcode};
}
export function createHandler({ key = process.env.AMAP_WEB_KEY, fetcher = fetchJson } = {}) {
  let day = '', used = 0;
  const clients = new Map();
  return async (req, res) => {
    const reply = (status, data) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
    if (req.method !== 'GET') return reply(405, {error:'仅支持 GET 请求'});
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health') return reply(key ? 200 : 503, {ready: Boolean(key)});
    if (url.pathname !== '/api/restrooms') return reply(404, {error:'接口不存在'});
    if (!key) return reply(503, {error:'查询服务尚未配置，请稍后再试'});
    const query = (url.searchParams.get('q') || '').trim();
    if (query.length > 80) return reply(400, {error:'搜索词过长'});
    const action = url.searchParams.get('action') || 'search';
    const category = url.searchParams.get('category') || 'toilet';
    const scope = url.searchParams.get('scope') || '';
    const city = (url.searchParams.get('city') || '上海').trim();
    if (!Object.hasOwnProperty.call(categories, category) || !['search','locate'].includes(action) || !['','city','nearby','target'].includes(scope) || !/^[\u3400-\u9fffA-Za-z0-9·\s-]{1,40}$/.test(city)) return reply(400, {error:'查询参数无效'});
    const hasCoords = url.searchParams.has('longitude') || url.searchParams.has('latitude');
    const longitude = Number(url.searchParams.get('longitude')), latitude = Number(url.searchParams.get('latitude'));
    if (hasCoords && (!url.searchParams.get('longitude')?.trim() || !url.searchParams.get('latitude')?.trim() || !validCoordinates(longitude, latitude))) return reply(400, {error:'位置坐标无效，请重新定位'});
    if ((action === 'locate' || scope === 'nearby') && !hasCoords) return reply(400, {error:'请先授权获取当前位置'});
    if (action === 'search' && !query && !hasCoords && !url.searchParams.has('city')) return reply(400, {error:'请输入地点或选择城市'});
    if (scope === 'target' && !query) return reply(400, {error:'请输入地址或选择地铁站点'});
    const now = Date.now(), today = new Date().toISOString().slice(0,10);
    if (day !== today) { day = today; used = 0; }
    for (const [id, value] of clients) if (value.reset < now) clients.delete(id);
    const ip = req.socket.remoteAddress;
    const rate = clients.get(ip) || {count:0,reset:now+60000};
    clients.set(ip, rate);
    if (++rate.count > 30 || used >= Number(process.env.DAILY_QUERY_LIMIT || 1000)) return reply(429, {error:'查询较频繁，请稍后再试'});
    const endpoint = scope === 'nearby' || (!scope && hasCoords && !query) ? 'around' : 'text';
    const config = categories[category];
    const params = new URLSearchParams({ key, keywords: [query, config.keyword].filter(Boolean).join(' '), city, citylimit:'true', offset:'20', page:'1', extensions:'base', output:'JSON' });
    if (config.type) params.set('types', config.type);
    if (endpoint === 'around') { params.set('location', `${longitude.toFixed(6)},${latitude.toFixed(6)}`); params.set('radius','3000'); params.set('sortrule','distance'); }
    let upstreamUrl = `https://restapi.amap.com/v3/place/${endpoint}?${params}`;
    if (action === 'locate') upstreamUrl = 'https://restapi.amap.com/v3/geocode/regeo?' + new URLSearchParams({key, location:`${longitude.toFixed(6)},${latitude.toFixed(6)}`, extensions:'base', output:'JSON'});
    used++;
    try {
      let searchOrigin = hasCoords ? {longitude,latitude} : undefined;
      if (scope === 'target' && action === 'search') {
        const targetParams = new URLSearchParams({key,keywords:query,city,citylimit:'true',offset:'1',page:'1',extensions:'base',output:'JSON'});
        const targetResponse = await fetcher('https://restapi.amap.com/v3/place/text?' + targetParams,{timeoutMs:8000});
        if (!targetResponse.ok) throw new Error('target');
        const targetData = await targetResponse.json();
        if(targetData.status !== '1') throw new Error('target');
        const target = targetData.pois && targetData.pois[0];
        const [lng,lat] = String(target && target.location || '').split(',').map(Number);
        if (!target || !validCoordinates(lng,lat)) return reply(404,{error:'未找到指定地点，请补充更准确的地址或站名'});
        searchOrigin={longitude:lng,latitude:lat,name:target.name || query};
        params.set('keywords',config.keyword || '');
        params.set('location',lng.toFixed(6)+','+lat.toFixed(6));params.set('radius','3000');params.set('sortrule','distance');
        upstreamUrl='https://restapi.amap.com/v3/place/around?'+params;
        if(used >= Number(process.env.DAILY_QUERY_LIMIT || 1000)) return reply(429,{error:'查询较频繁，请稍后再试'});
        used++;
      }
      const upstream = await fetcher(upstreamUrl, {timeoutMs:8000});
      if (!upstream.ok) throw new Error('upstream');
      const data = await upstream.json();
      if (data.status === '1' && action === 'locate') return reply(200, {city:normalizeCity(data.regeocode?.addressComponent || {})});
      if (data.status !== '1' || !Array.isArray(data.pois)) throw new Error('provider');
      reply(200, {results:normalize(data.pois, category, searchOrigin), source:'高德地图', limited:true, category, searchOrigin:searchOrigin || null, distanceType:searchOrigin ? 'straight-line' : null});
    } catch { reply(502, {error:'地图查询暂时不可用，请稍后重试'}); }
  };
}
export function createServer(options) { return http.createServer(createHandler(options)); }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) createServer().listen(Number(process.env.PORT || 8080), '0.0.0.0');

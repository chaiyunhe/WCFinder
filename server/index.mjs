import http from 'node:http';
import { pathToFileURL } from 'node:url';
export function normalize(pois) {
  const seen = new Set();
  return pois.flatMap(p => {
    const [longitude, latitude] = String(p.location || '').split(',').map(Number);
    if (!String(p.type || '').includes('公共厕所') || !p.id || !p.name || !Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < 120.8 || longitude > 122.1 || latitude < 30.6 || latitude > 31.9 || seen.has(p.id)) return [];
    seen.add(p.id);
    return [{ id: String(p.id), name: String(p.name), address: [p.adname, typeof p.address === 'string' ? p.address : ''].filter(Boolean).join(' '), longitude, latitude, source: '高德地图' }];
  });
}
export function createServer({ key = process.env.AMAP_WEB_KEY, fetcher = fetch } = {}) {
  let day = '', used = 0;
  const clients = new Map();
  return http.createServer(async (req, res) => {
    const reply = (status, data) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
    if (req.method !== 'GET') return reply(405, {error:'仅支持 GET 请求'});
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health') return reply(key ? 200 : 503, {ready: Boolean(key)});
    if (url.pathname !== '/api/restrooms') return reply(404, {error:'接口不存在'});
    if (!key) return reply(503, {error:'查询服务尚未配置，请稍后再试'});
    const query = (url.searchParams.get('q') || '').trim();
    if (query.length > 80) return reply(400, {error:'搜索词过长'});
    const hasCoords = url.searchParams.has('longitude') || url.searchParams.has('latitude');
    const longitude = Number(url.searchParams.get('longitude')), latitude = Number(url.searchParams.get('latitude'));
    if (hasCoords && (!url.searchParams.has('longitude') || !url.searchParams.has('latitude') || !Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < 120.8 || longitude > 122.1 || latitude < 30.6 || latitude > 31.9)) return reply(400, {error:'首版仅支持上海，请输入上海的地点名称'});
    if (!query && !hasCoords) return reply(400, {error:'请输入地点或使用附近搜索'});
    const now = Date.now(), today = new Date().toISOString().slice(0,10);
    if (day !== today) { day = today; used = 0; }
    for (const [id, value] of clients) if (value.reset < now) clients.delete(id);
    const ip = req.socket.remoteAddress;
    const rate = clients.get(ip) || {count:0,reset:now+60000};
    clients.set(ip, rate);
    if (++rate.count > 30 || used >= Number(process.env.DAILY_QUERY_LIMIT || 1000)) return reply(429, {error:'查询较频繁，请稍后再试'});
    const endpoint = hasCoords && !query ? 'around' : 'text';
    const params = new URLSearchParams({ key, types:'公共厕所', keywords:query, city:'上海', citylimit:'true', offset:'20', page:'1', extensions:'base', output:'JSON' });
    if (endpoint === 'around') { params.set('location', `${longitude.toFixed(6)},${latitude.toFixed(6)}`); params.set('radius','3000'); params.set('sortrule','distance'); }
    used++;
    try {
      const upstream = await fetcher(`https://restapi.amap.com/v3/place/${endpoint}?${params}`, {signal:AbortSignal.timeout(8000)});
      if (!upstream.ok) throw new Error('upstream');
      const data = await upstream.json();
      if (data.status !== '1' || !Array.isArray(data.pois)) throw new Error('provider');
      reply(200, {results:normalize(data.pois), source:'高德地图', limited:true});
    } catch { reply(502, {error:'地图查询暂时不可用，请稍后重试'}); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) createServer().listen(Number(process.env.PORT || 8080), '0.0.0.0');

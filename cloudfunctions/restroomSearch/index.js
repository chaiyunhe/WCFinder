const cloud = require('wx-server-sdk');
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV});
let handler;
exports.main = async (event = {}) => {
  const {OPENID, APPID} = cloud.getWXContext();
  if (!OPENID || APPID !== 'wx7f158580754f0989') return {statusCode:403,data:{error:'请从小程序发起查询'}};
  handler = handler || (await import('./handler.mjs')).createHandler();
  const params = new URLSearchParams();
  for (const name of ['q','longitude','latitude']) {
    if (event[name] !== undefined) {
      if (!['string','number'].includes(typeof event[name])) return {statusCode:400,data:{error:'查询参数无效'}};
      params.set(name, String(event[name]));
    }
  }
  let statusCode;
  let data;
  await handler({method:'GET',url:'/api/restrooms?' + params,socket:{remoteAddress:OPENID}}, {
    writeHead(status) { statusCode = status; },
    end(body) { data = JSON.parse(body); }
  });
  return {statusCode,data};
};

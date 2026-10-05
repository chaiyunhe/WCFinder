# 微信云函数部署

环境：cloud1-d0gxalmfj8dc5afe7；函数：restroomSearch。
小程序使用 wx.cloud.callFunction，云端验证微信 OPENID / APPID 后调用高德。

部署前将 server/index.mjs 复制为 restroomSearch/handler.mjs，保证与 HTTP 服务逻辑一致。
函数使用 Node.js 内置 HTTPS 客户端，兼容当前 Node.js 16.13 运行环境；执行超时设为 15 秒。
在云函数配置的环境变量中设置 AMAP_WEB_KEY；不要将密钥写入代码、聊天或提交。
DAILY_QUERY_LIMIT 默认 1000，是单实例限制，不能替代高德平台配额或云平台费用限额。

2026-10-03：本地适配及测试完成；云函数代码已通过官方 CLI 成功部署（3 个文件，2.8 KB）；仍需配置环境变量、确认运行时与超时并真机验证。尚未正式发布。

全国多类别迭代：云函数透传 city/category/action/scope，接口与 server/README.md 一致。当前本地变更未部署；不要影响已提审的 0.2.0。部署时同时上传 index.js 与 handler.mjs，保持两份后端逻辑一致。

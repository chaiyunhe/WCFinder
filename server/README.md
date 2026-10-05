# WCFinder 真实查询服务（待部署）

Node.js 16.13+，使用内置 HTTPS，无第三方运行依赖。仅使用高德实时查询，不保存地点数据库或用户位置。禁止在小程序中配置高德密钥。

## 尚需提供

1. 在高德开放平台创建应用，申请「Web服务」Key，确认当前账号的服务权限、配额及适用授权。
2. 选择可运行 Docker 或 受支持 Node.js 版本的后端环境，绑定 HTTPS 域名；部署费用需由账号所有者确认。大陆域名及服务的备案、微信后台要求应以实际审核页面为准。
3. 服务端配置 `AMAP_WEB_KEY` 环境变量（不要放进 Git）。可配置 `DAILY_QUERY_LIMIT=1000`，这是进程内上限，重启会重置，不替代平台配额控制。
4. 在 `miniprogram/services/api-config.js` 中填写服务的 HTTPS 根地址，并在微信后台添加 request 合法域名。
5. 微信后台核对定位接口权限、隐私保护指引、服务类目及备案状态。指引需如实说明位置通过本服务传给高德用于附近搜索；不使用定位也能搜索地点。

## 本地与部署

```sh
cd server
# 用部署平台的环境变量界面设置密钥；本地测试可使用被忽略的 .env 文件。
node --env-file=.env index.mjs
```

Dockerfile 不复制 .env。部署平台设置健康检查 `/health`；只有设置 Key 时返回 ready=true，这不代表供应商调用已经验证成功。

接口：`GET /api/restrooms?q=人民广场`，或 `GET /api/restrooms?longitude=121.4737&latitude=31.2304`。

支持全国城市查询，未传 city 时默认上海以兼容旧客户端；周边半径 3 公里，最多 20 条。地点名称搜索不保证返回站内厕所。不推断性别、无障碍、营业状态、楼层、收费、评分或站台。结果使用高德分类过滤，按高德 ID 去重。百度聚合待授权及接口核实后再接入。

安全配置：生产网关设置请求频率、供应商配额和费用提醒，不记录查询 URL、精确位置或高德请求 URL（含 Key）。应用不信任客户端的 X-Forwarded-For；位于反向代理后时，进程内每分钟 30 次限制可能按代理共享。部署时用可信网关做访客限流并合理调整；多实例和重启会使进程内计数重置。当前未配置 CORS，接口用于小程序，不代表网页版已接入。

## 上线验收（未完成）

- 使用实际 Key 验证健康检查和上海真实查询；检查返回地点、分类和坐标。
- HTTPS 证书和合法域名校验开启时，在真机运行。
- 拒绝定位仍可搜索；同意定位得到附近真实点位；导航落点正确。
- 验证空结果、供应商失败和限流；不出现演示结果。
- 完善隐私设置并验证微信的实际隐私授权流程；确认 getLocation 能力可用。
- 上传新开发版并真机验收，再提审；审核通过后发布。未完成这些步骤前不可声称已上线。

自动测试使用模拟供应商响应：`node --test index.test.mjs`。没有调用真实高德服务。

## 全国多类别迭代（本地实现，尚未部署）

`GET /api/restrooms?city=320500&category=parking&scope=city&q=商场`。
参数 category 为 toilet（默认）、aed、parking。city 接受城市名或区域码；scope=city 使用城市检索，坐标仅用于返回结果的距离排序；scope=nearby 需要坐标并检索附近 3 公里。没有 scope 保持旧版行为。
`action=locate&longitude=...&latitude=...` 使用逆地理编码，返回 city{name,adcode}，直辖市空 city 正确回退到省名。仅在用户授权位置后传入坐标。
提供坐标时 distanceMeters 是约计直线距离，返回批次升序排列，不代表步行路线距离或全城市最近的全部点位。未提供位置不伪造距离。每次最多 20 条，无持久化点位库。
AED 使用关键词搜索，并仅保留名称明确含 AED / 自动体外除颤 / 自动除颤的点位；不把一般医院当作 AED，也不保证设备实时可用。数据覆盖由供应商决定。
官方接口参考： https://developer.amap.com/api/webservice/guide/api/search/ 和 https://developer.amap.com/api/webservice/guide/api/georegeo 。
本地 `--env-file` 命令需现代 Node.js；16.13 运行时通过宿主环境变量注入 Key。

/* Offline demo provider. Coordinates x/y are illustration percentages, not GPS. */
const WCFinder = (() => {
  function createDemoService() {
const toilets = [
  {
    id: "mall-b1",
    name: "万象街区 B1 西侧女厕",
    x: 42,
    y: 48,
    floor: "B1",
    near: "靠近星巴克与西门服务台",
    sign: "跟随蓝色 WC 导视牌，扶梯下行后右转",
    type: "female",
    typeLabel: "女厕",
    typeNote: "女厕在西侧通道，男厕需继续向北约 60 米",
    eta: 4,
    distance: "260m",
    rating: 4.8,
    reviews: 326,
    updated: "今天 14:20",
    status: "营业中",
    confidence: "高",
    tags: ["female", "free", "baby", "accessible", "open"],
    labels: ["女厕", "免费", "母婴室", "无障碍", "有烘手机"],
    quote: "位置准确，排队少，婴儿护理台很干净。"
  },
  {
    id: "mall-b1-men",
    name: "万象街区 B1 北侧男厕",
    x: 49,
    y: 42,
    floor: "B1",
    near: "靠近运动品牌集合店",
    sign: "从西门服务台沿蓝色导视牌继续向北，消防门前左转",
    type: "male",
    typeLabel: "男厕",
    typeNote: "与 B1 西侧女厕不在同一通道",
    eta: 5,
    distance: "320m",
    rating: 4.4,
    reviews: 142,
    updated: "今天 13:50",
    status: "营业中",
    confidence: "高",
    tags: ["male", "free", "open"],
    labels: ["男厕", "免费", "有烘手机"],
    quote: "男厕在另一侧，跟着 WC 导视容易误以为男女厕同区。"
  },
  {
    id: "park-east",
    name: "中央公园东门公共卫生间",
    x: 78,
    y: 35,
    floor: "地面层",
    near: "东门游客中心背后",
    sign: "看到绿色游客中心牌后沿右侧小路 30 米",
    type: "all-gender",
    typeLabel: "男女同区",
    typeNote: "男女厕入口相邻，第三卫生间在游客中心内侧",
    eta: 7,
    distance: "510m",
    rating: 4.3,
    reviews: 118,
    updated: "昨天 18:05",
    status: "营业中",
    confidence: "中",
    tags: ["male", "female", "free", "accessible", "open"],
    labels: ["男厕", "女厕", "免费", "无障碍", "户外", "夜间照明"],
    quote: "夜间也能找到，但洗手液偶尔缺。"
  },
  {
    id: "park-family",
    name: "中央公园游客中心第三卫生间",
    x: 82,
    y: 30,
    floor: "地面层",
    near: "游客中心咨询台右后方",
    sign: "进入游客中心后看见亲子与无障碍共用标识",
    type: "family",
    typeLabel: "第三卫生间",
    typeNote: "亲子、无障碍与陪护可用，入口与男女厕分开",
    eta: 8,
    distance: "560m",
    rating: 4.6,
    reviews: 64,
    updated: "今天 10:30",
    status: "营业中",
    confidence: "中",
    tags: ["family", "baby", "accessible", "free", "open"],
    labels: ["第三卫生间", "亲子", "无障碍", "免费"],
    quote: "适合带孩子或需要陪护的人，门口标识比普通 WC 更小。"
  },
  {
    id: "metro-a",
    name: "地铁 A 口站厅男厕",
    x: 28,
    y: 31,
    floor: "站厅层",
    near: "A 口安检通道内侧",
    sign: "进站后不要下扶梯，沿客服中心左侧通道前行",
    type: "male",
    typeLabel: "男厕",
    typeNote: "女厕在对侧站厅，需绕过客服中心",
    eta: 5,
    distance: "340m",
    rating: 4.5,
    reviews: 204,
    updated: "今天 11:40",
    status: "营业中",
    confidence: "高",
    tags: ["male", "free", "open"],
    labels: ["男厕", "免费", "需过安检", "人流较大"],
    quote: "准确，但高峰期排队比较明显。"
  },
  {
    id: "metro-a-women",
    name: "地铁 A 口对侧站厅女厕",
    x: 35,
    y: 27,
    floor: "站厅层",
    near: "客服中心对侧，自动售票机后方",
    sign: "进站后从客服中心前方绕行，沿紫色女厕标识前行",
    type: "female",
    typeLabel: "女厕",
    typeNote: "与男厕隔着客服中心和闸机通道",
    eta: 6,
    distance: "390m",
    rating: 4.2,
    reviews: 176,
    updated: "今天 12:15",
    status: "营业中",
    confidence: "高",
    tags: ["female", "free", "open"],
    labels: ["女厕", "免费", "需过安检", "排队较多"],
    quote: "女厕不在男厕旁边，第一次来容易走反方向。"
  },
  {
    id: "riverside",
    name: "河滨步道游客驿站卫生间",
    x: 56,
    y: 72,
    floor: "地面层",
    near: "骑行租赁点旁",
    sign: "驿站橙色顶棚下，面对河道左手边",
    type: "all-gender",
    typeLabel: "男女同区",
    typeNote: "男女厕入口相邻，暂无第三卫生间确认",
    eta: 9,
    distance: "720m",
    rating: 4.1,
    reviews: 72,
    updated: "3 小时前",
    status: "待核实",
    confidence: "待核实",
    tags: ["male", "female", "free", "accessible"],
    labels: ["男厕", "女厕", "免费", "无障碍", "待核实"],
    quote: "上次看到临时维修牌，建议到场前看最新反馈。"
  },
  {
    id: "gallery-2f",
    name: "美术馆 2F 北廊第三卫生间",
    x: 63,
    y: 18,
    floor: "2F",
    near: "北廊展厅出口",
    sign: "从 2F 电梯出来后左转，经过纪念品店",
    type: "family",
    typeLabel: "第三卫生间",
    typeNote: "第三卫生间与母婴室相邻，男女厕在南廊另一侧",
    eta: 8,
    distance: "610m",
    rating: 4.7,
    reviews: 96,
    updated: "今天 09:12",
    status: "营业中",
    confidence: "高",
    tags: ["family", "baby", "accessible", "open"],
    labels: ["第三卫生间", "母婴室", "无障碍", "馆内", "需入馆"],
    quote: "馆内导视清楚，带孩子很方便。"
  }
];

// Fictional metro fixtures; not Shanghai transit or verified restroom locations.
const metroStations = [
  { id: "central", name: "中心广场站", lines: ["示例1号线", "示例2号线"] },
  { id: "park", name: "公园站", lines: ["示例1号线"] },
  { id: "river", name: "滨江站", lines: ["示例2号线"] }
];
const metroLocations = {
  "metro-a": { station: "central", area: "站厅", platform: "A口安检内" },
  "metro-a-women": { station: "central", area: "站台", platform: "示例1号线 · 1号站台" },
  "park-family": { station: "park", area: "站外", platform: "游客中心方向" },
  "riverside": { station: "river", area: "站外", platform: "滨江步道方向" }
};
for (const item of toilets) {
  item.metro = metroLocations[item.id] || null;
}
const platformDemo = toilets.find((item) => item.id === "metro-a-women");
Object.assign(platformDemo, {
  name: "中心广场站 1号站台女厕（示例）", floor: "站台层",
  near: "1号站台中部电梯旁", sign: "沿站台 WC 标志前往中部电梯旁（示例指引）",
  typeNote: "与站厅男厕分层设置", quote: "演示站台位置搜索，实际设施待核实。"
});
function metroText(item) {
  const station = metroStations.find((station) => station.id === item.metro?.station);
  return station ? `${station.lines.join(" / ")} · ${station.name} · ${item.metro.area} · ${item.metro.platform}` : "";
}


function search({ query = "", filters = [], line = "", station = "", area = "" } = {}) {
  const words = query.trim().toLowerCase().split(/\s+/);
  return toilets.filter((item) => {
    const stop = metroStations.find((stop) => stop.id === item.metro?.station);
    const text = `${item.name} ${item.floor} ${item.near} ${item.sign} ${item.typeLabel} ${item.typeNote} ${item.labels.join(" ")} ${metroText(item)}`.toLowerCase();
    return filters.every((filter) => item.tags.includes(filter))
      && (!line || stop?.lines.includes(line))
      && (!station || item.metro?.station === station)
      && (!area || item.metro?.area === area)
      && words.every((word) => text.includes(word));
  }).map((item) => structuredClone(item));
}
for (const item of toilets) {
  item.source = { provider: "demo", id: item.id };
}
return Object.freeze({
  mode: "demo",
  search,
  getStations: () => structuredClone(metroStations),
  describeMetro: metroText,
  addFeedback(report) {
    const item = structuredClone({ ...report, source: { provider: "user", id: report.id } });
    toilets.unshift(item);
    return structuredClone(item);
  }
});
  }
  return Object.freeze({ createDemoService });
})();

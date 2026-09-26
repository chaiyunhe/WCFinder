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

const typeConfig = {
  male: { label: "男厕", marker: "男" },
  female: { label: "女厕", marker: "女" },
  family: { label: "第三卫生间", marker: "3" },
  "all-gender": { label: "男女同区", marker: "WC" }
};

const userPoint = { x: 18, y: 62 };
let selectedId = toilets[0].id;
const activeFilters = new Set();
let activeTab = "list";

const pinsLayer = document.querySelector("#pinsLayer");
const selectedCard = document.querySelector("#selectedCard");
const listPanel = document.querySelector("#listPanel");
const reviewsPanel = document.querySelector("#reviewsPanel");
const routePath = document.querySelector("#routePath");
const nearbyCount = document.querySelector("#nearbyCount");
const bestEta = document.querySelector("#bestEta");
const searchInput = document.querySelector("#searchInput");
const reportDialog = document.querySelector("#reportDialog");

function filteredToilets() {
  const query = searchInput.value.trim().toLowerCase();
  return toilets.filter((item) => {
    const matchesFilter = [...activeFilters].every((filter) => item.tags.includes(filter));
    const haystack = `${item.name} ${item.floor} ${item.near} ${item.sign} ${item.typeLabel} ${item.typeNote} ${item.labels.join(" ")}`.toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
}

function selectedToilet() {
  const visible = filteredToilets();
  return visible.find((item) => item.id === selectedId) || visible[0] || null;
}

function setSelected(id) {
  selectedId = id;
  render();
}

function renderPins(items, selected) {
  pinsLayer.innerHTML = "";
  items.forEach((item) => {
    const pin = document.createElement("button");
    pin.className = `toilet-pin ${item.confidence === "待核实" ? "pending" : ""} ${item.id === selected?.id ? "selected" : ""}`;
    pin.style.left = `${item.x}%`;
    pin.style.top = `${item.y}%`;
    pin.title = item.name;
    pin.setAttribute("aria-label", item.name);
    pin.innerHTML = `<span>${typeConfig[item.type]?.marker || "WC"}</span>`;
    pin.addEventListener("click", () => setSelected(item.id));
    pinsLayer.appendChild(pin);
  });
}

function renderRoute(item) {
  if (!item) {
    routePath.setAttribute("d", "");
    return;
  }
  const start = { x: userPoint.x * 12, y: userPoint.y * 8.4 };
  const end = { x: item.x * 12, y: item.y * 8.4 };
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 70;
  routePath.setAttribute("d", `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`);
}

function renderSelected(item) {
  if (!item) {
    selectedCard.innerHTML = `
      <div class="empty-state">
        <h2>没有符合条件的点位</h2>
        <p>试着减少一个筛选条件，或提交新的现场反馈。</p>
      </div>
    `;
    return;
  }
  selectedCard.innerHTML = `
    <div class="place-title">
      <h2>${item.name}</h2>
      <span class="rating">★ ${item.rating}</span>
    </div>
    <p>${item.quote}</p>
    <ul class="detail-list">
      <li><strong>楼层：</strong>${item.floor}</li>
      <li><strong>类型：</strong>${item.typeLabel}，${item.typeNote}</li>
      <li><strong>靠近：</strong>${item.near}</li>
      <li><strong>标志牌：</strong>${item.sign}</li>
      <li><strong>距离：</strong>${item.distance}，步行约 ${item.eta} 分钟</li>
      <li><strong>状态：</strong>${item.status}，${item.updated} 更新，可信度 ${item.confidence}</li>
    </ul>
    <div class="chips">${item.labels.map((label) => `<span class="chip">${label}</span>`).join("")}</div>
    <button class="navigate-button">查看路线与室内指引</button>
  `;
}

function renderList(items, selected) {
  if (!items.length) {
    listPanel.innerHTML = `<div class="empty-state compact">暂无符合组合条件的卫生间</div>`;
    return;
  }
  listPanel.innerHTML = items
    .map(
      (item) => `
        <button class="place-card ${item.id === selected?.id ? "active" : ""}" data-id="${item.id}">
          <div class="place-title">
            <h3>${item.name}</h3>
            <span class="rating">★ ${item.rating}</span>
          </div>
          <div class="place-meta">
            <span class="type-badge">${item.typeLabel}</span>
            <span>${item.floor}</span>
            <span>${item.distance}</span>
            <span>${item.eta} 分钟</span>
            <span>${item.status}</span>
          </div>
        </button>
      `
    )
    .join("");
  listPanel.querySelectorAll(".place-card").forEach((button) => {
    button.addEventListener("click", () => setSelected(button.dataset.id));
  });
}

function renderReviews(items) {
  if (!items.length) {
    reviewsPanel.innerHTML = `<div class="empty-state compact">当前筛选下暂无评价</div>`;
    return;
  }
  reviewsPanel.innerHTML = items
    .map(
      (item) => `
        <article class="review-card">
          <div class="place-title">
            <h3>${item.name}</h3>
            <span class="rating">★ ${item.rating}</span>
          </div>
          <p>${item.quote}</p>
          <div class="review-meta">
            <span>${item.typeLabel}</span>
            <span>${item.reviews} 条评价</span>
            <span>${item.updated}</span>
            <span>可信度 ${item.confidence}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderMetrics(items) {
  nearbyCount.textContent = items.length;
  if (!items.length) {
    bestEta.textContent = "--";
    return;
  }
  const fastest = items.reduce((best, item) => (item.eta < best.eta ? item : best), items[0] || toilets[0]);
  bestEta.textContent = `${fastest.eta} 分`;
}

function renderFilters() {
  document.querySelectorAll(".filter").forEach((button) => {
    const filter = button.dataset.filter;
    const isActive = filter === "all" ? activeFilters.size === 0 : activeFilters.has(filter);
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function render() {
  const items = filteredToilets();
  const selected = selectedToilet();
  selectedId = selected?.id ?? null;
  renderFilters();
  renderPins(items, selected);
  renderRoute(selected);
  renderSelected(selected);
  renderList(items, selected);
  renderReviews(items);
  renderMetrics(items);
}

document.querySelectorAll(".filter").forEach((button) => {
  button.setAttribute("aria-pressed", button.dataset.filter === "all" ? "true" : "false");
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    if (filter === "all") {
      activeFilters.clear();
    } else if (activeFilters.has(filter)) {
      activeFilters.delete(filter);
    } else {
      activeFilters.add(filter);
    }
    render();
  });
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    document.querySelector(".tab-panel.active").classList.remove("active");
    button.classList.add("active");
    activeTab = button.dataset.tab;
    document.querySelector(`#${activeTab}Panel`).classList.add("active");
  });
});

searchInput.addEventListener("input", render);

document.querySelector("#locateBtn").addEventListener("click", () => {
  document.querySelector(".user-pin").animate(
    [
      { transform: "translate(-50%, -50%) scale(1)" },
      { transform: "translate(-50%, -50%) scale(1.35)" },
      { transform: "translate(-50%, -50%) scale(1)" }
    ],
    { duration: 520, easing: "ease-out" }
  );
});

document.querySelector("#reportOpenBtn").addEventListener("click", () => reportDialog.showModal());

document.querySelector("#submitReportBtn").addEventListener("click", (event) => {
  event.preventDefault();
  const name = document.querySelector("#reportName").value.trim() || "用户新增卫生间";
  const hint = document.querySelector("#reportHint").value.trim() || "等待更多用户补充楼层、标志物和路线提示";
  const rating = Number(document.querySelector("#reportRating").value) || 4.5;
  const type = document.querySelector("#reportType").value;
  const typeInfo = typeConfig[type] || typeConfig["all-gender"];
  const typeTags = type === "all-gender" ? ["male", "female"] : [type];
  toilets.unshift({
    id: `user-${Date.now()}`,
    name,
    x: 36 + Math.random() * 32,
    y: 38 + Math.random() * 28,
    floor: "用户反馈",
    near: hint,
    sign: hint,
    type,
    typeLabel: typeInfo.label,
    typeNote: "由用户新增，等待更多现场反馈确认具体类型与相邻设施",
    eta: 6,
    distance: "约 430m",
    rating: Math.min(5, Math.max(1, rating)),
    reviews: 1,
    updated: "刚刚",
    status: document.querySelector("#reportStatus").value,
    confidence: "待核实",
    tags: [...typeTags, "free"],
    labels: [typeInfo.label, "用户反馈", "待核实"],
    quote: "感谢反馈，系统会根据更多现场确认提升可信度。"
  });
  selectedId = toilets[0].id;
  reportDialog.close();
  event.target.form.reset();
  render();
});

render();

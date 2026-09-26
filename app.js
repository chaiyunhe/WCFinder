const restroomService = WCFinder.createDemoService();
const metroStations = restroomService.getStations();
const metroText = (item) => restroomService.describeMetro(item);

const typeConfig = {
  male: { label: "男厕", marker: "男" },
  female: { label: "女厕", marker: "女" },
  family: { label: "第三卫生间", marker: "3" },
  "all-gender": { label: "男女同区", marker: "WC" }
};

const userPoint = { x: 18, y: 62 };
let selectedId = null;
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

const metroLine = document.querySelector("#metroLine");
const metroStation = document.querySelector("#metroStation");
const metroArea = document.querySelector("#metroArea");
for (const line of [...new Set(metroStations.flatMap((station) => station.lines))]) {
  metroLine.add(new Option(line, line));
}
function updateStationOptions() {
  const previous = metroStation.value;
  metroStation.replaceChildren(new Option("全部站点", ""));
  for (const station of metroStations.filter((station) => !metroLine.value || station.lines.includes(metroLine.value))) {
    metroStation.add(new Option(station.name, station.id));
  }
  if ([...metroStation.options].some((option) => option.value === previous)) metroStation.value = previous;
}
updateStationOptions();
metroLine.addEventListener("change", () => { updateStationOptions(); render(); });
metroStation.addEventListener("change", render);
metroArea.addEventListener("change", render);
document.querySelector("#clearMetro").addEventListener("click", () => {
  metroLine.value = "";
  metroStation.value = "";
  metroArea.value = "";
  updateStationOptions();
  render();
});

function filteredToilets() {
  return restroomService.search({
    query: searchInput.value,
    filters: [...activeFilters],
    line: metroLine.value,
    station: metroStation.value,
    area: metroArea.value
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
      ${item.metro ? `<li><strong>地铁：</strong>${metroText(item)}</li>` : ""}
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
            ${item.metro ? `<span>${metroText(item)}</span>` : ""}
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
  const fastest = items.reduce((best, item) => (item.eta < best.eta ? item : best), items[0]);
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
  const scope = [metroLine.value, metroStation.selectedOptions[0]?.value ? metroStation.selectedOptions[0].text : "", metroArea.value].filter(Boolean).join(" · ");
  document.querySelector("#metroSummary").textContent = `${scope || "全部点位"}：${items.length} 个结果${items.length ? "" : "，请调整线路、站点或其他筛选条件"}`;
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
  const report = restroomService.addFeedback({
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
  selectedId = report.id;
  reportDialog.close();
  event.target.form.reset();
  render();
});

render();

const supportDialog = document.querySelector("#supportDialog");
document.querySelector("#supportOpenBtn").addEventListener("click", () => supportDialog.showModal());

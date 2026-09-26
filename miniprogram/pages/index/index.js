const { createDemoService } = require('../../services/restroom-service');
const types = [
  { id: 'male', label: '男厕' }, { id: 'female', label: '女厕' },
  { id: 'family', label: '第三卫生间' }, { id: 'all-gender', label: '男女同区' }
];
Page({
  data: {
    query: '', lines: ['全部线路'], lineIndex: 0,
    stations: [{ id: '', name: '全部站点' }], stationIndex: 0,
    areas: ['全部位置', '站厅', '站台', '站外'], areaIndex: 0,
    filters: ['男厕', '女厕', '第三卫生间', '母婴室', '无障碍', '免费', '营业中'].map((label, i) => ({ label, id: ['male', 'female', 'family', 'baby', 'accessible', 'free', 'open'][i], active: false })),
    results: [], selected: null, selectedId: '', mobileView: 'list', showReport: false,
    reportName: '', reportHint: '', reportType: 0, types,
    statuses: ['待核实', '营业中', '临时关闭'], reportStatus: 0, reportError: ''
  },
  onLoad() {
    this.service = createDemoService();
    this.allStations = this.service.getStations();
    const lines = ['全部线路'];
    this.allStations.forEach(station => station.lines.forEach(line => { if (!lines.includes(line)) lines.push(line); }));
    this.setData({ lines, stations: [{ id: '', name: '全部站点' }].concat(this.allStations) });
    this.refresh();
  },
  refresh() {
    const d = this.data;
    const results = this.service.search({ query: d.query, filters: d.filters.filter(f => f.active).map(f => f.id),
      line: d.lineIndex ? d.lines[d.lineIndex] : '', station: d.stations[d.stationIndex].id,
      area: d.areaIndex ? d.areas[d.areaIndex] : ''
    }).map(item => Object.assign(item, { metroLabel: this.service.describeMetro(item) }));
    const selected = results.find(item => item.id === d.selectedId) || results[0] || null;
    this.setData({ results, selected, selectedId: selected ? selected.id : '' });
  },
  onSearch(e) { this.setData({ query: e.detail.value }); this.refresh(); },
  onLine(e) {
    const lineIndex = Number(e.detail.value);
    const stations = [{ id: '', name: '全部站点' }].concat(this.allStations.filter(s => !lineIndex || s.lines.includes(this.data.lines[lineIndex])));
    this.setData({ lineIndex, stations, stationIndex: 0 }); this.refresh();
  },
  onStation(e) { this.setData({ stationIndex: Number(e.detail.value) }); this.refresh(); },
  onArea(e) { this.setData({ areaIndex: Number(e.detail.value) }); this.refresh(); },
  onFilter(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ filters: this.data.filters.map(f => Object.assign({}, f, { active: f.id === id ? !f.active : f.active })) }); this.refresh();
  },
  clearAll() {
    this.setData({ query: '', lineIndex: 0, stationIndex: 0, areaIndex: 0,
      stations: [{ id: '', name: '全部站点' }].concat(this.allStations),
      filters: this.data.filters.map(f => Object.assign({}, f, { active: false })) }); this.refresh();
  },
  onSelect(e) { this.setData({ selectedId: e.currentTarget.dataset.id, mobileView: 'map' }); this.refresh(); },
  switchView(e) { this.setData({ mobileView: e.currentTarget.dataset.view }); },
  openReport() { this.setData({ showReport: true, reportError: '' }); },
  closeReport() { this.setData({ showReport: false }); },
  stopTap() {},
  onReportName(e) { this.setData({ reportName: e.detail.value }); },
  onReportHint(e) { this.setData({ reportHint: e.detail.value }); },
  onReportType(e) { this.setData({ reportType: Number(e.detail.value) }); },
  onReportStatus(e) { this.setData({ reportStatus: Number(e.detail.value) }); },
  submitReport() {
    const name = this.data.reportName.trim(), hint = this.data.reportHint.trim();
    if (!name || !hint) { this.setData({ reportError: '请填写位置名称和楼层／入口说明' }); return; }
    const type = types[this.data.reportType], status = this.data.statuses[this.data.reportStatus];
    const tags = type.id === 'all-gender' ? ['male', 'female'] : [type.id];
    if (status === '营业中') tags.push('open');
    const report = this.service.addFeedback({ id: 'user-' + Date.now(), name, floor: '用户反馈', near: hint, sign: hint,
      type: type.id, typeLabel: type.label, typeNote: '用户补充，待现场核实', tags, labels: [type.label, '待核实'],
      x: 50, y: 50, distance: '待核实', eta: null, rating: null, reviews: 0, updated: '刚刚', status,
      confidence: '待核实', quote: '仅保存在本次演示中；图中位置为占位，不代表实际坐标。', metro: null });
    this.clearAll();
    this.setData({ selectedId: report.id, showReport: false, reportName: '', reportHint: '', reportType: 0, reportStatus: 0, mobileView: 'map' });
    this.refresh(); wx.showToast({ title: '已加入本次演示', icon: 'none' });
  }
});

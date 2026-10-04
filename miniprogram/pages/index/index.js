const { baseUrl, cloudEnv, functionName } = require('../../services/api-config');
Page({
  data: { query:'', results:[], selected:null, markers:[], loading:false, error:'', searched:false, mobileView:'list', latitude:31.2304, longitude:121.4737 },
  onLoad() { this.requestId = 0; },
  onUnload() { this.requestId++; if (this.task && this.task.abort) this.task.abort(); },
  onSearch(e) { this.setData({query:e.detail.value}); },
  search() {
    const query = this.data.query.trim();
    if (!query) { this.setData({error:'请输入上海的地点、地铁站或厕所名称'}); return; }
    this.load({q:query});
  },
  nearby() {
    wx.showModal({title:'查找附近厕所', content:'将获取你当前的位置，并通过查询服务发送给高德地图，用于搜索附近厕所。也可以取消并输入地点搜索。', success: answer => {
      if (!answer.confirm) return;
      wx.getLocation({type:'gcj02', success:pos => {
        this.setData({query:'', latitude:pos.latitude,longitude:pos.longitude});
        this.load({latitude:pos.latitude,longitude:pos.longitude});
      },fail:() => this.setData({error:'未能获取位置，请输入上海的地点名称搜索'})});
    }});
  },
  load(params) {
    const id = ++this.requestId;
    if (this.task && this.task.abort) this.task.abort();
    this.setData({loading:false,error:'',results:[],markers:[],selected:null,searched:true});
    if (!cloudEnv && !/^https:\/\//.test(baseUrl)) { this.setData({error:'线上查询服务尚未开通，请稍后再试'}); return; }
    this.setData({loading:true});
    const callbacks = {
      success:res => {
        if(id !== this.requestId) return;
        if(res.statusCode !== 200 || !res.data || !Array.isArray(res.data.results)) { this.setData({error:res.data && res.data.error || '查询失败，请重试'}); return; }
        const results = res.data.results.filter(p => p && typeof p.name === 'string' && Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
        const markers = results.map((p,i)=>({id:i,latitude:p.latitude,longitude:p.longitude,title:p.name,callout:{content:p.name,display:'BYCLICK',padding:8,borderRadius:8}}));
        const first = results[0];
        this.setData({results,markers,selected:first || null,...(first ? {latitude:first.latitude,longitude:first.longitude}: {})});
      },fail:() => { if(id === this.requestId) this.setData({error:'网络连接失败，请重试'}); },
      complete:() => { if(id === this.requestId) this.setData({loading:false}); }
    };
    if (cloudEnv) {
      if (!wx.cloud) { callbacks.fail(); callbacks.complete(); return; }
      wx.cloud.callFunction({name:functionName,config:{env:cloudEnv},data:params,success:res=>callbacks.success(res.result || {}),fail:callbacks.fail,complete:callbacks.complete});
      this.task = null;
    } else {
      this.task = wx.request({url:baseUrl.replace(/\/$/,'')+'/api/restrooms',data:params,timeout:10000,...callbacks});
    }
  },
  onSelect(e) { this.select(Number(e.currentTarget.dataset.index)); },
  onMarker(e) { this.select(Number(e.detail.markerId)); },
  select(index) { const selected = this.data.results[index]; if(selected) this.setData({selected,latitude:selected.latitude,longitude:selected.longitude,mobileView:'map'}); },
  switchView(e) { this.setData({mobileView:e.currentTarget.dataset.view}); },
  navigate() { const p=this.data.selected; if(p) wx.openLocation({latitude:p.latitude,longitude:p.longitude,name:p.name,address:p.address,scale:17,fail:()=>wx.showToast({title:'无法打开地图，请稍后再试',icon:'none'})}); }
});

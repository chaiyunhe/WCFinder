const metroCoordinates = require('../../data/metro-coordinates');
const metroData = require('../../data/metro');
const { baseUrl, cloudEnv, functionName } = require('../../services/api-config');
const labels = {toilet:'厕所',parking:'停车场',aed:'AED',charging:'充电站',repair:'汽修店'};
function distance(a,b) {
  const rad=Math.PI/180, dlat=(b.latitude-a.latitude)*rad,dlon=(b.longitude-a.longitude)*rad;
  const h=Math.sin(dlat/2)**2+Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin(dlon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
function valid(p) { return p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude)<=90 && Math.abs(p.longitude)<=180; }
Page({
  data: { distanceOriginLabel:'',metroLines:[],metroStations:[],metroLineIndex:0,metroStationIndex:0,searchMode:'nearby',metroLine:'',metroStation:'',query:'',city:'',cityName:'请选择城市',region:[],category:'toilet',categoryLabel:'厕所',hasLocation:false,locating:false,results:[], selected:null, markers:[], loading:false, error:'', searched:false, mobileView:'list', latitude:31.2304, longitude:121.4737 },
  onLoad() { this.requestId=0;this.locationId=0;this.cityRevision=0;this.alive=true;this.nearby(); },
  onUnload() { this.alive=false;this.requestId++;this.locationId++;if(this.task&&this.task.abort)this.task.abort(); },
  onSearch(e) { this.setData({query:e.detail.value}); },
  switchSearchMode(e) { const mode=e.currentTarget.dataset.mode;if(!['nearby','address','metro'].includes(mode))return;this.locationId++;this.clearResults();this.setData({searchMode:mode,locating:false});if(mode==='metro')this.resetMetro();if(mode==='nearby')this.search(); },
  resetMetro() {
    this.metroCityLines=metroData[(this.data.cityName||this.data.city).replace(/市$/,'')]||[];
    this.setData({metroLines:this.metroCityLines.map(l=>l.name),metroStations:[],metroLine:'',metroStation:'',metroLineIndex:0,metroStationIndex:0});
    const city=(this.data.cityName||'').replace(/市$/,'');
    const coordinates=metroCoordinates[city]||{};
    if(!valid(this.userLocation)||city!==this.locationCity)return;
    let nearest=null;
    this.metroCityLines.forEach((line,li)=>line.stations.forEach((name,si)=>{
      const c=coordinates[name];if(!c)return;
      const meters=distance(this.userLocation,{longitude:c[0],latitude:c[1]});
      if(!nearest||meters<nearest.meters)nearest={li,si,name,meters};
    }));
    if(nearest){const line=this.metroCityLines[nearest.li];this.setData({metroLineIndex:nearest.li,metroStationIndex:nearest.si,metroLine:line.name,metroStation:nearest.name,metroStations:line.stations});}

  },
  onMetroLine(e) {
    const index=Number(e.detail.value),line=(this.metroCityLines||[])[index];if(!line)return;
    this.clearResults();this.setData({metroLineIndex:index,metroLine:line.name,metroStations:line.stations,metroStation:'',metroStationIndex:0});
  },
  onMetroStation(e) {
    const index=Number(e.detail.value),station=this.data.metroStations[index];if(!station)return;
    this.clearResults();this.setData({metroStationIndex:index,metroStation:station});
  },
  clearResults() { this.requestId++;if(this.task&&this.task.abort)this.task.abort();this.setData({results:[],markers:[],selected:null,distanceOriginLabel:'',error:'',loading:false,searched:false}); },
  onCityChange(e) {
    const region=e.detail.value, city=region[1]==='市辖区'||region[1]==='县'?region[0]:region[1];
    this.cityRevision++;this.locationId++;this.clearResults();
    this.setData({region,city,cityName:city,searchMode:this.data.searchMode==='nearby'?'address':this.data.searchMode,locating:false,metroLine:'',metroStation:''});this.resetMetro();if(this.data.searchMode==='address')this.search();
  },
  onCategoryChange(e) {
    const category=e.currentTarget.dataset.category;if(!labels[category]||category===this.data.category)return;
    this.locationId++;this.clearResults();this.setData({category,categoryLabel:labels[category],locating:false});
    if(this.data.city||this.data.searchMode==='nearby')this.search();
  },
  search() {
    if(this.data.searchMode==='nearby'){if(this.userLocation)this.load({scope:'nearby'});else this.nearby();return;}
    if(!this.data.city){this.setData({error:'请先选择城市，或定位当前城市'});return;}
    let query=this.data.query.trim();
    if(this.data.searchMode==='metro'){
      const line=this.data.metroLine.trim(),station=this.data.metroStation.trim();
      if(!line||!station){this.setData({error:'请依次选择地铁线路和站点'});return;}
      query=[line,station.endsWith('站')?station:station+'站'].filter(Boolean).join(' ');
    }
    this.load({scope:query?'target':'city',q:query});
  },
  locateCity() { this.locate(this.data.searchMode==='nearby'); },
  nearby() { this.locate(true); },
  locate(nearby) {
    const token=++this.locationId, revision=this.cityRevision;
    wx.showModal({title:'使用当前位置',content:'经你同意后获取位置，通过查询服务发送给高德地图，用于识别当前城市、查找附近厕所、停车场、AED、充电站、汽修店，并估算距离。取消后仍可手动选择城市搜索。',success:answer=>{
      if(!this.alive||token!==this.locationId||!answer.confirm)return;
      this.setData({locating:true,error:''});
      wx.getLocation({type:'gcj02',success:pos=>{
        if(!this.alive||token!==this.locationId||revision!==this.cityRevision)return;
        if(!valid(pos)){this.setData({locating:false,error:'位置无效，请手动选择城市'});return;}
        this.userLocation={latitude:pos.latitude,longitude:pos.longitude};this.setData({hasLocation:true});
        this.clearResults();
        this.request({action:'locate',...this.userLocation},{success:res=>{
          if(!this.alive||token!==this.locationId||revision!==this.cityRevision)return;
          const city=res.data&&res.data.city;
          if(res.statusCode!==200||!city||!city.name){this.setData({error:res.data&&res.data.error||'未能识别城市，请手动选择'});return;}
          this.locationCity=city.name.replace(/市$/,'');
          this.setData({city:city.adcode||city.name,cityName:city.name,...(nearby?{query:''}:{})});
          this.resetMetro();
          if(nearby)this.load({scope:'nearby'});else this.search();
        },fail:()=>{if(this.alive&&token===this.locationId)this.setData({error:'城市定位失败，请手动选择城市'});},complete:()=>{if(this.alive&&token===this.locationId)this.setData({locating:false});}});
      },fail:()=>{if(this.alive&&token===this.locationId)this.setData({locating:false,error:'未能获取位置，请手动选择城市搜索'});}});
    }});
  },
  request(params,callbacks) {
    if(cloudEnv&&wx.cloud){wx.cloud.callFunction({name:functionName,config:{env:cloudEnv},data:params,success:res=>callbacks.success(res.result||{}),fail:callbacks.fail,complete:callbacks.complete});return null;}
    if(!cloudEnv&&/^https:\/\//.test(baseUrl))return wx.request({url:baseUrl.replace(/\/$/,'')+'/api/restrooms',data:params,timeout:15000,...callbacks});
    callbacks.fail();callbacks.complete();return null;
  },
  load(params) {
    const id=++this.requestId;if(this.task&&this.task.abort)this.task.abort();
    this.setData({loading:true,error:'',results:[],markers:[],selected:null,searched:true});
    // User coordinates are independent of map center and selected city.
    const query={scope:'city',city:this.data.city,category:this.data.category,...params,...(params.scope==='nearby' ? this.userLocation||{} : {})};
    const callbacks={success:res=>{
      if(id!==this.requestId||!this.alive)return;
      if(res.statusCode!==200||!res.data||!Array.isArray(res.data.results)){this.setData({error:res.data&&res.data.error||'查询失败，请重试'});return;}
      const origin=valid(res.data.searchOrigin)?res.data.searchOrigin:(query.scope==='nearby'?this.userLocation:null);
      this.setData({distanceOriginLabel:origin?(query.scope==='nearby'?'当前位置':origin.name||params.q||'搜索位置'):''});
      const results=res.data.results.filter(p=>valid(p)&&typeof p.name==='string').map(p=>{
        const meters=origin?distance(origin,p):null;
        const cityName=(this.data.cityName||'').replace(/市$/,'');
        const address=typeof p.address==='string'?p.address:'';
        const displayAddress=cityName && address.startsWith(cityName)
          ? address.slice(cityName.length).replace(/^市/,'').trim() : address;
        return {...p,displayAddress,distanceMeters:meters,distanceText:meters===null?'':meters<1000?'约 '+Math.round(meters/10)*10+' 米':'约 '+(meters/1000).toFixed(1)+' 公里'};
      });
      if(origin)results.sort((a,b)=>a.distanceMeters-b.distanceMeters);
      const markers=results.map((p,i)=>({id:i,latitude:p.latitude,longitude:p.longitude,title:p.name,callout:{content:p.name,display:'BYCLICK',padding:8,borderRadius:8}}));
      const first=results[0];this.setData({results,markers,selected:first||null,...(first?{latitude:first.latitude,longitude:first.longitude}:{})});
    },fail:()=>{if(id===this.requestId&&this.alive)this.setData({error:'查询服务连接失败，请稍后重试'});},complete:()=>{if(id===this.requestId&&this.alive)this.setData({loading:false});}};
    this.task=this.request(query,callbacks);
  },
  onSelect(e) { this.select(Number(e.currentTarget.dataset.index)); },
  onMarker(e) { const index=Number(e.detail.markerId);if(!Number.isInteger(index)||!this.data.results[index])return;this.select(index);this.navigate(); },
  select(index) { const selected=this.data.results[index];if(selected)this.setData({selected,latitude:selected.latitude,longitude:selected.longitude,mobileView:'map'}); },
  switchView(e) { this.setData({mobileView:e.currentTarget.dataset.view}); },
  copyWechat() { wx.setClipboardData({data:'HiYunhe',fail:()=>wx.showToast({title:'复制失败，请手动添加 HiYunhe',icon:'none'})}); },
  navigate() { const p=this.data.selected;if(p)wx.openLocation({latitude:p.latitude,longitude:p.longitude,name:p.name,address:p.address,scale:17,fail:()=>wx.showToast({title:'无法打开地图，请稍后再试',icon:'none'})}); }
});

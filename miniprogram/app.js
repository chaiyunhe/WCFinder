const { cloudEnv } = require('./services/api-config');
App({onLaunch() { if (wx.cloud) wx.cloud.init({env:cloudEnv,traceUser:false}); }});

//app.js
App({
  onLaunch: function () {
    if (wx.canIUse('getUpdateManager')){
      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '旧版本不可用，是否重启应用更新？',
          success(res) {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        console.log("SDKVersion: "+res.SDKVersion);
      }
    })
  },
  getOpenid: function () {
    let _this = this
    return new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.request({
              url: _this.globalData.serverUrl + '/wx/session',
              data: { "code": res.code },
              method: 'GET',
              header: {
                'Content-type': 'application/json'
              },
              success: function (res) {
                if(res.statusCode == 200){
                  wx.setStorageSync('openid', res.data.openid);//存储openid
                  var res = {
                    status: res.statusCode,
                    data: res.data.openid
                  }
                  _this.globalData.launchFail = false
                  resolve(res);
                }else{
                  var res = {
                    status: res.statusCode
                  }
                  resolve(res);
                  console.log('获取用户登录态失败！' + res.status)
                }
              }
            });
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
            reject('error');
          }
        }
      })
    });
  },
  globalData: {
    userInfo: null,
    vip: false,
    serverUrl: 'https://127.0.0.1',
    timerJob: null,
    code: null,
    openId: null,
    unionId: null,
    sessionKey: null,
    authorize: false,
    sdk:null,
    launchFail:true
  }
})
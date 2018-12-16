//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.code = res.code;
        if (this.codeReadyCallback) {
          this.codeReadyCallback(res)
        }
      }
    })

    wx.getSystemInfo({
      success: function (res) {
        console.log("SDKVersion: "+res.SDKVersion);
      }
    })
    // 查看用户是否授权
    // wx.getSetting({
    //   success: res => {
    //   }
    // })
  },
  globalData: {
    userInfo: null,
    serverUrl: 'https://wxapp.olook.me',
    timerJob: null,
    code: null,
    openId: null,
    unionId: null,
    sessionKey: null,
    authorize: false,
    sdk:null
  }
})
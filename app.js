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
    if (wx.getUpdateManager()){
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
    // 查看用户是否授权
    // wx.getSetting({
    //   success: res => {
    //   }
    // })
  },
  globalData: {
    userInfo: null,
    serverUrl: 'https://127.0.0.1',
    timerJob: null,
    code: null,
    openId: null,
    unionId: null,
    sessionKey: null,
    authorize: false,
    sdk:null
  }
})
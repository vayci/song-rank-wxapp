//app.js
App({
  onLaunch: function () {

    wx.login({
      success: res => {
        this.globalData.code = res.code;
        if (this.codeReadyCallback) {
          this.codeReadyCallback(res)
        }
      }
    })
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
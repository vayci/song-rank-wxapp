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
        // 登录时查询该openid是否绑定爬虫任务
        this.globalData.code = res.code;
        if (this.codeReadyCallback) {
          this.codeReadyCallback(res)
        }
        
      }
    })
    // 查看用户是否授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.log(5555);
          wx.getUserInfo({
            success: res => {
              console.log(444);
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }else{
          console.log("弹授权");
          var appJs = this;
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              console.log(appJs.userAuthorizeCallback)
              if (appJs.userAuthorizeCallback) {
                appJs.userAuthorizeCallback(res)
              }
            },
            fail(){
              wx.showModal({
                title: '纳尼?',
                content: '头像昵称都不给我！',
                confirmText: '我错了',
                confirmColor: '#aaa',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        res.authSetting = {
                          "scope.userInfo": true,
                        }
                      }
                    })
                  }
                }
              })
              
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    serverUrl: 'https://wxapp.olook.me',
    timerJob: null,
    code: null,
    openId: null,
    unionId: null,
    sessionKey: null,
    authorize: false
  }
})
const app = getApp()
Page({
  data: {
    text: 'This is page data.'
  },
  onLoad(options) {
    // Do some initialize when page load.
  },
  onReady() {
    // Do something when page ready.
  },
  onShow() {
    this.getTargetUsers()
  },
  onShareAppMessage() {
    // return custom share data when user share.
  },
  //获取用户关联爬虫任务
  getTargetUsers() {
    let self = this;
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      openid = app.globalData.openid;
      if (!openid) {
        wx.showToast({
          title: "出错啦！没获取到您的身份信息~",
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      data: {
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          userList: res.data
        });

      }
    })
  },
  addSubscribe(e){
    var self = this;
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      method: 'POST',
      data: {
        formId: e.detail.formId,
        isValid: 0,
        openid: app.globalData.openId,
        targetUserId: e.target.dataset.userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '订阅成功,Ta下次听歌您将收到通知!',
            icon: 'none',
            duration: 2000
          })
          self.getTargetUsers()
        }else{
          wx.showToast({
            title: res.data,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  data: {
    userList: []
  }
})
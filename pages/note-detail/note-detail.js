const app = getApp()
Page({
  data: {
    showNav: true,
    index: 1,
    sponsor:[]
  },

  onLoad: function (options) {
    let _this = this
    this.setData({
      index: options.index
    })
    wx.setNavigationBarTitle({
      title: options.title
    })

    if (options.index=='2'){
      wx.request({
        url: app.globalData.serverUrl + '/user/sponsor',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          _this.setData({
            sponsor: res.data
          })
        }
      })
    }
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
Page({

  data: {
    showNav: true,
    index: 1,
    sponsor:[]
  },

  onLoad: function (options) {

    this.setData({
      index: options.index
    })
    wx.setNavigationBarTitle({
      title: options.title
    })

    if (options.index=='2'){
      console.log('请求数据')
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
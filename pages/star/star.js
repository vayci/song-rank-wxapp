const app = getApp()
Page({
  data: {
    proxyCount: 0,
    dailyCount:0,
    top:[],
    latest:[],
    timer:null
  },
  onLoad(options) {
  },
  onHide() {
    console.log('清理定时任务'+this.timer)
    clearInterval(this.timer)
  },
  onShow() {
    let _this = this
    this.getReport()
    let num = setInterval(function () {
      _this.getReport()
    }, 5000)
    this.timer = num
    console.log('创建定时任务'+this.timer)
  },
  onPullDownRefresh: function () {
    this.getReport()
  },
  getReport() {
    let _this = this;
    wx.request({
      url: app.globalData.serverUrl + '/health/report/info',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        let data = res.data
        _this.setData({
          proxyCount: data.proxyCount,
          dailyCount: data.dailyCount,
          top: data.top,
          latest:data.latest
        })
      }
    })
  },
  data: {
    userList: []
  }
})
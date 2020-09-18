const app = getApp()
const utils = require('../../utils/util.js')
Page({
  data: {
    proxyCount: 0,
    proxyText:'',
    dailyCount:0,
    top:[],
    latest:[],
    timer:null,
    proxyColor:'red'
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
          latest: _this.parseLatest(data.latest),
          proxyText: _this.getStatus(data.proxyCount),
          proxyColor: _this.getColor(data.proxyCount)
        })
      }
    })
  },
  parseLatest(latest){
    var now = new Date();
    latest.forEach(function (value, i) {
      let changetime = utils.str2Date(value.changeTime)
      let sub = (now.getTime()-changetime.getTime())/1000
      if (sub < 60){
        if (sub < 0) {sub = 1}
        value.changeTime = parseInt(sub) + '秒'
      }
      if (sub>=60){
        let min = parseInt(sub/60)
        let s = parseInt(sub%60)
        value.changeTime = min + '分' + s + '秒'
      }
    })
    return latest;
  },
  getStatus(count){
    if(app.globalData.vip===true)
    return '极好'
    if (count == 0) 
    return '极差'
    if (count <= 4)
    return'较差'
    if (count > 4 && count <= 10) 
    return '一般'
    if (count > 10 && count <= 20) 
    return '良好'
    if (count > 20) 
    return '极好'
  },
  getColor(count){
    if(app.globalData.vip===true)
    return '#45CE90'
    if (count == 0)
      return '#FD7070'
    if (count <= 4)
      return '#FFAE00'
    if (count > 4 && count <= 10)
      return '#45CE90'
    if (count > 10)
      return '#45CE90'
  },
  data: {
    userList: []
  }
})
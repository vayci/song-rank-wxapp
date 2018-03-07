//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '您还没添加订阅的人',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    jobs: []
  },
  //事件处理函数
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  searchUser: function(){
    console.log(app.globalData.code);
    wx.navigateTo({
      url: '../search/search'
    })
  },
  //显示主页面时刷新用户任务数据
  onShow: function(){
    if (app.globalData.openId!=null){
      this.getTimerJobs(app.globalData.openId);
    }else{
      this.openIdReadyCallback = res => {
        this.getTimerJobs(app.globalData.openId);
      }
    }
  },
  onLoad: function () {
    //判断登录凭证code 调用获取用户关联任务
    if(app.globalData.code){
      console.log(app.globalData.code);
      this.jsCode2Session(app.globalData.code);
    } else if (this.data.canIUse){
      app.codeReadyCallback = res => {
        console.log("codeReadyCallback:"+res.code);
        this.jsCode2Session(res.code);
      }
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
   
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //获取用户关联爬虫任务
  getTimerJobs(openid){
    var indexPage = this;
    wx.request({
      url: app.globalData.serverUrl + '/wx/getUerJob',
      data: {
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        indexPage.showTimerJobs(res.data);
      }
    })
  },
  //根据返回关联任务数据显示
  showTimerJobs(timerJobs){
      if(timerJobs.length>0){
        this.setData({
          motto: "您已订阅" + timerJobs.length+"名用户",
          jobs: timerJobs
        })
      }else{
        this.setData({
          motto: "您尚未添加订阅用户"
        })
      }
  },
  getRankRecord(e){
    var targetid = e.currentTarget.id;
    wx.navigateTo({
      url: '../record/record?userId=' + targetid
    })
  },
  jsCode2Session(code){
    var indexPage = this;
    wx.request({
      url: app.globalData.serverUrl + '/wx/jsCode2Session',
      data: {
        code: app.globalData.code
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        app.globalData.openId = res.data.openid;
        app.globalData.sessionKey = res.data.session_key;
        console.log(indexPage.openIdReadyCallback)
        if (indexPage.openIdReadyCallback) {
          indexPage.openIdReadyCallback(res.data.openid);
        }
      }
    })
  },onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '想不到吧，你听歌都会被我抓到噢！',
      path: 'pages/index/index',
      imageUrl: './1.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})

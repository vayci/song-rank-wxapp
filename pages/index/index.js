//index.js
const app = getApp()

Page({
  data: {
    motto: '您尚未关注任何用户',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    jobs: [],
    subscribe: []
  },
  //点击个人头像
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  //点击添加
  searchUser: function(){
    console.log(app.globalData.code);
    wx.navigateTo({
      url: '../search/search'
    })
  },
  
  onShow: function(){
    //appjs获取到openid后回调获取用户任务
    if (app.globalData.openId!=null){
        this.getTimerJobs(app.globalData.openId);
    }else{
      this.openIdReadyCallback = res => {
        this.getTimerJobs(app.globalData.openId);
      }
    }
  },

  onLoad: function () {

    //appjs获取到code后回调获取openid sessionKey
    if(app.globalData.code){
        this.jsCode2Session(app.globalData.code);
    } else if (this.data.canIUse){
      app.codeReadyCallback = res => {
        this.jsCode2Session(res.code);
      }
    }

    //若用户未授权，添加授权后回调获取用户信息
    if (app.globalData.authorize==false){
      app.userAuthorizeCallback = res => {
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
    }

    //加载用户信息
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
        indexPage.data.jobs = res.data;
        indexPage.getSubscribe(openid);
        //indexPage.showTimerJobs(res.data);
      }
    })
  },
  getSubscribe(openid) {
    var indexPage = this;
    wx.request({
      url: app.globalData.serverUrl + '/msg/getSubscribe',
      data: {
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        for(var i = 0 ; i < res.data.length ; i++){
            for (var j = 0; j < indexPage.data.jobs.length; j++) {
              if (indexPage.data.jobs[j].targetUserId == res.data[i].targetUserId){
                indexPage.data.jobs[j].s_flag = true
            }
          }
        }
        indexPage.setData({
          jobs: indexPage.data.jobs
        })
        indexPage.showTimerJobs(indexPage.data.jobs);
      }
    })
  },
  //根据返回关联任务数据显示
  showTimerJobs(timerJobs){
      if(timerJobs.length>0){
        this.setData({
          motto: "您已经关注" + timerJobs.length+"名用户",
          jobs: timerJobs
        })
      }else{
        this.setData({
          motto: "您尚未关注任何用户"
        })
      }
  },
  //点击关注头像 跳转至听歌记录页面
  getRankRecord(e){
    var targetid = e.currentTarget.id;
    wx.navigateTo({
      url: '../record/record?userId=' + targetid
    })
  },
  //code换取openid sessionKey
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
        if (indexPage.openIdReadyCallback) {
          indexPage.openIdReadyCallback(res.data.openid);
        }
      }
    })
  },
  //点击转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '想不到吧，你听歌都会被我抓到噢！',
      path: 'pages/index/index',
      imageUrl: './1.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})

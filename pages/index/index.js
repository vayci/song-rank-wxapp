//index.js
const app = getApp()

Page({
  data: {
    motto: '您尚未关注任何好友',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    jobs: [],
    subscribe: [],
    lock: false
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
  
    app.globalData.openId = wx.getStorageSync('openid');
    //appjs获取到openid后回调获取用户任务
    if (app.globalData.openId != null && app.globalData.openId != ''){
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
      this.tryUploadUserInfo("global data");
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.tryUploadUserInfo("userinfo callback");
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
          this.tryUploadUserInfo("auto get");
        }
      })
    }
  },
  tryUploadUserInfo(from){
    console.log("try upload user info : "+from)
    //判断是否需上传用户信息
    var isUpload = wx.getStorageSync('isUpload');
    if (!isUpload) {
      //用户信息已准备完成
      if (app.globalData.userInfo != null && app.globalData.openId != null) {
        console.log("upload user info success...")
        //提交用户信息
        this.uploadUserInfo(app.globalData.openId, app.globalData.userInfo)
      }else{
        console.log("user info not ready!")
      }
    }else{
      console.log("user info already upload")
    } 
  },
  uploadUserInfo(openid, userInfo) {
    console.log(userInfo)
    userInfo.openId = openid;
    //提交用户信息
    wx.request({
      url: app.globalData.serverUrl + '/user',
      method: 'POST',
      data: JSON.stringify(userInfo),
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log("用户信息提交成功");
      }
    })
    wx.setStorage({
      key: "isUpload",
      data: true
    })
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
          motto: "您已经关注" + timerJobs.length+"名好友",
          jobs: timerJobs
        })
      }else{
        this.setData({
          motto: "您尚未关注任何好友"
        })
      }
  },
  //点击关注头像 跳转至听歌记录页面
  getRankRecord(e){
    if(!this.data.lock){
      var targetid = e.currentTarget.id;
      console.log(e.currentTarget.dataset);
      var tusername = e.currentTarget.dataset.tusername;
      wx.navigateTo({
        url: '../record/record?userId=' + targetid + '&tusername=' + tusername +'&fromApp=true'
      })
    }
    
  },
  deleteJob(e){

    var indexPage = this;
    indexPage.data.lock = true;
    wx.showModal({
      title: '提示',
      content: '确定要取消关注Ta吗?',
      success: function (res) {
        if (res.confirm) {
          console.log(e.currentTarget.dataset.jobid);
          wx.request({
            url: app.globalData.serverUrl + '/userjob/' + e.currentTarget.dataset.jobid,
            method: 'DELETE',
            data: {
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              indexPage.data.lock = false;
              indexPage.getTimerJobs(app.globalData.openId);
              wx.showToast({
                title: res.data,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
        indexPage.data.lock = false;
      }
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
        wx.setStorage({
          key: "openid",
          data: res.data.openid
        })
        if (indexPage.openIdReadyCallback) {
          indexPage.openIdReadyCallback(res.data.openid);
        }
      }
    })
  },
  getNote: function(e){
    wx.navigateTo({
      url: '../note/note'
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
      // imageUrl: './1.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})

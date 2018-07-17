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
    lock: false,
    offline: false
  },

  onLoad: function () {
    //appjs获取到code后回调获取openid sessionKey
    if (app.globalData.code) {
      this.jsCode2Session(app.globalData.code);
    } else if (this.data.canIUse) {
      app.codeReadyCallback = res => {
        this.jsCode2Session(res.code);
      }
    }
    this.getAppNotice();
  },

  onShow: function(){
    app.globalData.openId = wx.getStorageSync('openid');
    //jsCode2Session 获取到openid后回调获取用户任务
    if (app.globalData.openId != null && app.globalData.openId != ''){
        this.getTimerJobs(app.globalData.openId);
    }else{
      this.openIdReadyCallback = res => {
        this.getTimerJobs(app.globalData.openId);
      }
    }
  },

  //code换取openid sessionKey
  jsCode2Session(code) {
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
        indexPage.setData({
          offline: false
        })
      },
      fail: function (res) {
        indexPage.setData({
          offline: true
        })
      }
    })
  },

  //点击添加按钮 上报用户信息 跳转搜索页
  onGotUserInfo(userInfo){
    app.globalData.userInfo = userInfo.detail.rawData;
    var isUpload = wx.getStorageSync('isUpload');
    if (!isUpload) {
      //用户信息已准备完成
      if (app.globalData.userInfo != null && app.globalData.openId != null) {
        this.uploadUserInfo(app.globalData.openId, app.globalData.userInfo)
      }
    } 
    wx.navigateTo({
        url: '/pages/search/search'
      })
  },

  //上传用户信息
  uploadUserInfo(openid, userInfo) {
    userInfo = JSON.parse(userInfo);
    userInfo.openId = openid;
    wx.request({
      url: app.globalData.serverUrl + '/user',
      method: 'POST',
      data: JSON.stringify(userInfo),
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.statusCode == 200){
          console.log("用户信息提交成功");
          wx.setStorage({
            key: "isUpload",
            data: true
          })
        } else if (res.statusCode == 500){
          console.log(res.data);
          wx.setStorage({
            key: "isUpload",
            data: false
          })
        }
      }
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

  //显示关注好友数量
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
      var tusername = e.currentTarget.dataset.tusername;
      wx.navigateTo({
        url: '../record/record?userId=' + targetid + '&tusername=' + tusername +'&fromApp=true'
      })
    }
    
  },

  // 长按删除任务
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

  //获取系统公告
  getAppNotice(){
    var indexPage = this;
    wx.request({
      url: app.globalData.serverUrl + '/notice/all',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var notice_arr = [];
        res.data.forEach(function (value) {
          notice_arr.push({id: value.id,url:"url", title: value.content});
        });
        indexPage.setData({
          msgList: notice_arr
        });
      }
    })
  },

  //小程序说明跳转
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
      imageUrl: './share.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})

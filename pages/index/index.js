const app = getApp()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    jobs: [],
    subscribe: [],
    lock: false,
    addBtntouched: false,
    loginLock: false,
    runDays:0,
    proxyWarn:false
  },
  setGlobalOpenid() {
    if(this.loginLock){return}
    this.loginLock = true
    let _this = this
    app.getOpenid().then(function (res) {
      if (res.status == 200 && res.data) {
        console.log('openid ok ' + res.data)
        app.globalData.openId = res.data
        app.globalData.launchFail = false
        if (_this.openIdReadyCallback) {
          console.log('invoke openid callback')
          _this.openIdReadyCallback(res.data.openid);
        }
      } else {
        wx.showToast({
          title: "获取您的身份信息失败\r\n请稍后再试~",
          icon: 'none',
          duration: 2000
        })
      }
      _this.loginLock = false
    });
  },
  onLoad: function () {
    console.log('page index onLoad')
    this.setGlobalOpenid()
    this.getAppNotice()
  },
 
  onShow: function () {
    console.log('page index onShow launchFaile:' + app.globalData.launchFail + ' openid:' + app.globalData.openId)
    this.getDateDiff()
    this.getProxyInfo()
    if (app.globalData.launchFail){
      this.setGlobalOpenid()
    }
    if (app.globalData.openId) {
      this.getTimerJobs(app.globalData.openId);
    } else {
      console.log('set openid callback')
      this.openIdReadyCallback = res => {
        this.getTimerJobs(app.globalData.openId);
      }
    }
  },
  onGotUserInfo(userInfo) {
    app.globalData.userInfo = userInfo.detail.rawData;
    var isUpload = wx.getStorageSync('isUpload');
    if (!isUpload) {
      if (app.globalData.userInfo != null && app.globalData.openId != null) {
        this.uploadUserInfo(app.globalData.openId, app.globalData.userInfo)
      }
    }
    wx.vibrateShort({})
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
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
        wx.setStorage({
          key: "isUpload",
          data: true
        })
        if (res.statusCode == 200) {
          console.log("用户信息提交成功");
        } else if (res.statusCode == 500) {
          console.log("用户信息提交失败");
        }
      }
    })
  },
  getProxyInfo(){
    let _this = this
    wx.request({
      url: app.globalData.serverUrl + '/health/proxy/info',
      header: {'content-type': 'application/json'},
      success: function (res) {
        if (res.statusCode == 200) {
          let size = res.data.activeSize
          if(size < 8){
            _this.setData({
              proxyWarn:true
            })
          }
        }
      }
    })
  },
  getTimerJobs(openid) {
    if(!openid){
      openid = wx.getStorageSync('openid')
    }
    var _this = this;
    wx.request({
      url: app.globalData.serverUrl + '/task',
      data: {
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        _this.setData({
          jobs: res.data
        })
      }
    })
  },
  getRankRecord(e) {
    let isUpload = wx.getStorageSync('isUpload');
    if (!isUpload) {
      wx.showToast({
        title: '请先点击右侧添加关注按钮进行用户授权',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (!this.data.lock) {
      var targetid = e.currentTarget.id;
      var tusername = e.currentTarget.dataset.tusername;
      wx.navigateTo({
        url: '../record/record?userId=' + targetid + '&tusername=' + tusername + '&fromApp=true'
      })
    }

  },
  getDateDiff(){
    let now = new Date().getTime()
    let start = new Date(2018,2,19).getTime()
    let date = parseInt((now - start) / (1000 * 60 * 60 * 24))
    this.setData({
      runDays: date
    })
  },
  //长按删除任务
  deleteJob(e) {
    var _this = this;
    _this.data.lock = true;
    wx.showModal({
      title: '提示',
      content: '确定要取消关注Ta吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.serverUrl + '/task/' + e.currentTarget.dataset.jobid,
            method: 'DELETE',
            data: {
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              _this.data.lock = false;
              _this.getTimerJobs(_this.openid);
              wx.showToast({
                title: res.data,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
        _this.data.lock = false;
      }
    })
  },
  //弃用
  getSubscribe(openid) {
    var _this = this;
    wx.request({
      url: app.globalData.serverUrl + '/msg/getSubscribe',
      data: {
        openid: openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        for (var i = 0; i < res.data.length; i++) {
          for (var j = 0; j < _this.data.jobs.length; j++) {
            if (_this.data.jobs[j].targetUserId == res.data[i].targetUserId) {
              _this.data.jobs[j].s_flag = true
            }
          }
        }
        _this.setData({
          jobs: _this.data.jobs
        })
        _this.showTimerJobs(_this.data.jobs);
      }
    })
  },

  //显示关注好友数量
  showTimerJobs(timerJobs) {
    if (timerJobs.length > 0) {
      this.setData({
        jobs: timerJobs
      })
    }
  },
  //获取系统公告
  getAppNotice() {
    var _this = this;
    wx.request({
      url: app.globalData.serverUrl + '/notice/type/warn',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          var notice_arr = [];
          res.data.forEach(function (value) {
            notice_arr.push({ id: value.id, url: "url", title: value.content });
          });
          _this.setData({
            msgList: notice_arr
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '服务器连接失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onButtonTap(e) {
    this.setData({
      addBtntouched: true
    })
  },
  onButtonTapCancel(e) {
    this.setData({
      addBtntouched: false
    })
  },
  //点击转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '我有一份你在网易云音乐的听歌记录!',
      path: 'pages/index/index',
      imageUrl: '../images/pic1.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  }
})
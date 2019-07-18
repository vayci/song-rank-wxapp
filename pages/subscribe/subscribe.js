const app = getApp()
// 在页面中定义激励视频广告
let videoAd = null

Page({
  data: {
    text: 'This is page data.'
  },
  onShow() {
    this.getTargetUsers()
  },
  //获取用户关联爬虫任务
  getTargetUsers() {
    let _this = this;
    let openid = app.globalData.openid;
    if (!openid) {
      openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.showToast({
          title: "获取您的身份信息失败\r\n请稍后再试~",
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
        _this.setData({
          userList: res.data
        });

      }
    })
  },
  addSubscribe(e){
    var _this = this;
    let openid = app.globalData.openid;
    if (!openid) {
      openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.showToast({
          title: "获取您的身份信息失败\r\n请稍后再试~",
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      method: 'POST',
      data: {
        formId: e.detail.formId,
        isValid: 0,
        openid: openid,
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
          _this.getTargetUsers()
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
  addSmsCount(e){
    let _this = this
    let ad_notice = wx.getStorageSync('ad_notice');
    if(!ad_notice){
      wx.showModal({
        title: '提示',
        content: '播放广告获得免费短信通知次数',
        confirmText: '好的',
        cancelText: '算了',
        success(res) {
          if (res.confirm) {
            _this.playAd(e)
          }
        },
        complete(res) {
          wx.setStorageSync('ad_notice', true)
        }
      })
    }else{
      _this.playAd(e)
    }
  },
  playAd(e){
    this.data.targetUserId = e.currentTarget.dataset.userid
    let openid = app.globalData.openid;
    if (!openid) {
      openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.showToast({
          title: "获取您的身份信息失败\r\n请稍后再试~",
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    if(!videoAd){
      if (wx.createRewardedVideoAd) {
        videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-a6f3ab1cbaf9f74d'
        })
        videoAd.onClose((res) => {
          if (res.isEnded) {
            wx.request({
              url: app.globalData.serverUrl + '/sms/subscribe',
              method: 'POST',
              data: {
                openId: openid,
                targetUserId: this.data.targetUserId
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log(res)
              }
            })
          }
        })
      }
    }

    if (videoAd) {
      videoAd.show().catch(() => {
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
  },
  data: {
    userList: [],
    targetUserId:''
  }
})
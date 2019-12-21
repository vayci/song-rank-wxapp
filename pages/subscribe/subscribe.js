const app = getApp()
// 在页面中定义激励视频广告
let videoAd = null

Page({
  data: {
    text: 'This is page data.'
  },
  onShow() {
    this.getTargetUsers()
    this.loadBindInfo()
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
  wxSubscribe(e){
    var _this = this
    let limit = false
    this.data.userList.forEach(v=>{
      if (v.userId == e.currentTarget.dataset.userid){
        console.log(v.subscribe)
        if (v.subscribe>=20){
          limit = true
        }
      }
    })
    if(limit){
      wx.showToast({
        title: '订阅次数已达上限！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: ['jYc5pnVgv42aN2yKTAQHWwNB8FJTZXFtwBwQrBvIgOQ'],
      success(res) {
        let result = res['jYc5pnVgv42aN2yKTAQHWwNB8FJTZXFtwBwQrBvIgOQ']
        if ('accept' == result){
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
          wx.vibrateShort({})
          wx.request({
            url: app.globalData.serverUrl + '/msg',
            method: 'POST',
            data: {
              isValid: 0,
              openid: openid,
              targetUserId: e.currentTarget.dataset.userid
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res)
              if (res.statusCode == 200) {
                wx.showToast({
                  title: '订阅成功,Ta下次听歌您将收到通知!',
                  icon: 'none',
                  duration: 2000
                })
                _this.getTargetUsers()
              } else {
                wx.showToast({
                  title: res.data,
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
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
    wx.vibrateShort({})
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      method: 'POST',
      data: {
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
    wx.vibrateShort({})
    let bindPhone = wx.getStorageSync('bind_phone')
    if(!bindPhone){
      wx.showToast({
        title: "请先到 关于->程序设置 中添加接收通知的手机号",
        icon: 'none',
        duration: 2000
      })
      return;
    }

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
      let _this = this
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
                let list = _this.data.userList
                for (let i of list) {
                  if (i.userId == res.data.targetUserId) {
                    i.smsSubscribe = res.data.remainCount
                  }
                }
                _this.setData({
                  userList: list
                })
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
            wx.showToast({
              title: "该功能暂不可用",
              icon: 'none',
              duration: 2000
            })
          })
      })
    }
  },
  changeSendFlag(e){
    let _this = this
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
      url: app.globalData.serverUrl + '/sms/send/flag?openId=' + openid + '&targetUserId=' + e.currentTarget.dataset.targetUserId,
      method: 'PUT',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        let list = _this.data.userList
        for (let i of list) {
          if (i.userId == res.data.targetUserId){
            i.smsSendFlag = res.data.sendFlag
          }
        }
        _this.setData({
          userList: list
        })
      }
    })


      
  },
  loadBindInfo(){
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
      url: app.globalData.serverUrl + '/sms/phone',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openId: openid
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.setStorageSync('bind_phone', res.data.phone)
        }

      }
    })
  },
  data: {
    userList: [],
    targetUserId:''
  }
})
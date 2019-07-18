const app = getApp()
Page({
  data: {
    showNav: true,
    index: 1,
    sponsor:[],
    unkownData:false,
    bindPhone:false,
    phone:'',
    isWhiteList:false
  },

  onLoad: function (options) {
    let _this = this
    this.setData({index: options.index})
    wx.setNavigationBarTitle({
      title: options.title
    })
    if(options.index=='3'){
      const unkownData = wx.getStorageSync('unkownData')
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
          if(res.statusCode==200){
            _this.setData({
              bindPhone:true,
              phone:res.data.phone,
              isWhiteList:res.data.isWhiteList
            })
          }

        }
      })


      this.setData({
        unkownData: unkownData
      })
    }
    if (options.index=='2'){
      wx.request({
        url: app.globalData.serverUrl + '/user/sponsor',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          _this.setData({
            sponsor: res.data
          })
        }
      })
    }
  },

  onReady: function () {

  },

  onShow: function () {

  },
  openUnkownData(e) {
    wx.setStorage({
      key: 'unkownData',
      data: e.detail.value
    })
  },
})
const app = getApp()
Page({
  data: {
    showNav: true,
    index: 1,
    sponsor:[],
    unkownData:false,
    bindPhone:false,
    phone:'',
    isWhiteList:false,
    showPhoneBox:false
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
  addBindPhone(e){
    this.setData({
      showPhoneBox:true
    })
  },
  submitPhone(e){
    let phone = e.detail.value.phone
    let _this =this
    if (!/^1(3|4|5|7|8|9)\d{9}$/.test(phone)&&""!=phone) {
      wx.showToast({
        title: "手机号有误，请重新填写",
        icon: 'none',
        duration: 2000
      })
    }else{
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
        method: 'POST',
        data: {
          phone: phone,
          openId: openid
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.statusCode == 200) {
            if ("" != res.data.phone){
              _this.setData({
                bindPhone: true,
                phone: res.data.phone
              })
              wx.setStorageSync('bind_phone', res.data.phone)
              wx.showToast({
                title: '手机号修改成功',
                icon: 'none',
                duration: 2000
              })
            }else{
              _this.setData({
                bindPhone: false,
                phone: ""
              })
              wx.removeStorageSync('bind_phone')
              wx.showToast({
                title: '手机号解绑成功',
                icon: 'none',
                duration: 2000
              })
            }
         
          } else {
            wx.showToast({
              title: res.data,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
      _this.setData({
        showPhoneBox:false
      })
    }

  }
})
const app = getApp()
var utils = require('../../utils/util.js')
Page({
  data: {
    showNav: true,
    index: 1,
    sponsor:[],
    unkownData:false,
    bindPhone:false,
    phone:'',
    isWhiteList:false,
    showPhoneBox:false,
    phoneInput:''
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
            wx.setStorageSync('bind_phone', res.data.phone)
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
          res.data.forEach(v => {
            if (v.gender == 1){
              v.avatarUrl ="../images/men.png"
            }else if(v.gender == 2){
              v.avatarUrl ="../images/women.png"
            }else{
              v.avatarUrl ="../images/unkown.png"
            }
            v.formatUpdateTime = utils.formatTimeStamp(utils.str2Date(v.updTime));
          })  
          _this.setData({
            sponsor: res.data.reverse()
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
  phoneInput(e){
    this.data.phoneInput = e.detail.value;
  },
  addBindPhone(e){
    wx.vibrateShort({})
    this.setData({
      showPhoneBox:true
    })
  },
  submitPhone(e){
    let phone = this.data.phoneInput
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
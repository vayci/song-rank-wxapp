
const app = getApp();
var utils = require('../../utils/util.js')
Page({
  onLoad: function (options) {
    this.setData({
      userId: options.userId
    })  
    var recordPage = this;
    wx.request({
      url: app.globalData.serverUrl + '/wx/getRecord',
      data: {
        userId: options.userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.list==undefined){
          recordPage.data.tips = "暂时还没有Ta的听歌记录，再等等噢~";
          recordPage.setData({
            tips: recordPage.data.tips
          })
          return;
        }
        for (var i = 0; i < res.data.list.length; i++) {
          res.data.list[i].changeTime = utils.formatTimeStamp(res.data.list[i].changeTime);
        }  
        recordPage.data.recordList = res.data.list;
        recordPage.data.isBatchUpdate = res.data.isBatchUpdate;
        recordPage.setData({
          isBatchUpdate: res.data.isBatchUpdate,
          recordList: res.data.list
        }) 
      }
    })
  },
  formSubmit: function (e) {
    console.log(e.detail.formId);
    var recordPage =this;
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      method: 'POST',
      data: {
        formId: e.detail.formId,
        isValid: 0,
        openid: app.globalData.openId,
        targetUserId: recordPage.data.userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: res.data,
          icon: 'none',
          duration: 2000
        })

      }
    })
  },
  data: {
    userId:null,
    isBatchUpdate:0,
    recordList:[],
    tips: "Ta最近在听:"
  }
})  
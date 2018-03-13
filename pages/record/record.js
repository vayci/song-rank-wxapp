const app = getApp();
var utils = require('../../utils/util.js')

Page({
  onShow: function () {
    this.data.showTmpMsg = false;
    var recordPage = this;
    //是否显示订阅按钮
    wx.request({
      url: app.globalData.serverUrl + '/msg/check?openid=' 
      + app.globalData.openId + "&targetUserId=" + recordPage.data.userId,
      data: {
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.statusCode==200){
          recordPage.data.showTmpMsg = true;
          recordPage.setData({
            showTmpMsg: true
          })
        }
      }
    })
  },
  onLoad: function (options) {
    console.log(options);
    this.setData({
      userId: options.userId,
      tuserName: options.tusername,
      tips: options.tusername+'最近在听'
    })  
    var recordPage = this;
    //获取听歌记录
    wx.request({
      url: app.globalData.serverUrl + '/wx/getRecord',
      data: {
        userId: options.userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.list==undefined||res.data.list.length==0){
          recordPage.data.tips = "目前还没有听歌记录，再等等吧~\n 您可以点击下方 \"订阅通知\" \nTa听歌后我会第一时间通知您";
          recordPage.setData({
            tips: recordPage.data.tips
          })
          return;
        }
        //根据是否为系统自动批量更新的记录，对时间进行不同的format
        for (var i = 0; i < res.data.list.length; i++) {
          if (res.data.list[i].isBatchUpdate==0){
            res.data.list[i].changeTime 
              = utils.formatTimeStamp(res.data.list[i].changeTime);
          }else{
            res.data.list[i].changeTime 
              = utils.formatTimeStampToDate(res.data.list[i].changeTime);
          }
          
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
  //点击订阅，生成模板消息记录
  formSubmit: function (e) {
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
          title: '订阅成功！Ta下次听歌我会通知您噢~',
          icon: 'none',
          duration: 2000
        })
        recordPage.data.showTmpMsg = false;
        recordPage.setData({
          showTmpMsg: false
        })
      }
    })
  },
  backIndex: function(e){
    wx.navigateBack({
      url: '../index/index'
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title:'给你分享一份听歌记录',
      path: 'pages/record/record?userId=' + this.data.userId + '&tusername=' + this.data.tuserName,
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },
  data: {
    userId:null,
    tuserName: null,
    isBatchUpdate:0,
    recordList:[],
    tips: "Ta最近在听:",
    showTmpMsg: false
  }
})  
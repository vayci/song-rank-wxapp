
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
          recordPage.data.tips = "最近好像没有听歌噢~";
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
  data: {
    userId:null,
    isBatchUpdate:0,
    recordList:[],
    tips: "Ta最近在听:"
  }
})  
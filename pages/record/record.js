const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()
var utils = require('../../utils/util.js')

Page({
  onShow: function () {
    this.data.showTmpMsg = false;
    var recordPage = this;
    //是否显示订阅按钮
    // wx.request({
    //   url: app.globalData.serverUrl + '/msg/check?openid=' 
    //   + app.globalData.openId + "&targetUserId=" + recordPage.data.userId,
    //   data: {
    //   },
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   success: function (res) {
    //     if(res.statusCode==200){
    //       recordPage.data.showTmpMsg = true;
    //       recordPage.setData({
    //         showTmpMsg: true
    //       })
    //     }
    //   }
    // })
  },
  onLoad: function (options) {
    //注册播放错误回调
    innerAudioContext.onError((res) => {
      wx.showToast({
        title: "好像没版权,播放出错啦!",
        icon: 'none',
        duration: 2000
      })
    })
    innerAudioContext.onEnded((res)=>{
      this.setData({
        playing: ''
      })
    })
    this.setData({
      userId: options.userId,
      tuserName: options.tusername,
      tips: options.tusername+'最近在听',
      fromApp: options.fromApp,
    })  
    var recordPage = this;
    //获取听歌记录
    wx.request({
      url: app.globalData.serverUrl + '/rank/record',
      data: {
        userId: options.userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data==undefined||res.data.length==0){
          recordPage.data.tips = "正在努力获取Ta的听歌记录，请耐心等待...";
          recordPage.setData({
            tips: recordPage.data.tips,
            showImg: true
          })
          return;
        }
        //根据是否为系统自动批量更新的记录，对时间进行不同的format
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].isBatchUpdate==0){
            res.data[i].changeTime 
              = utils.formatTimeStamp(new Date(res.data[i].changeTime));
          }else{
            res.data[i].changeTime 
              = utils.formatTimeStampToDate(new Date(res.data[i].changeTime));
          }
          
        }  
        recordPage.data.recordList = res.data;
        //recordPage.data.isBatchUpdate = res.data.isBatchUpdate;
        recordPage.setData({
          //isBatchUpdate: res.data.isBatchUpdate,
          recordList: res.data
        }) 
      }
    })
  },
  click:function(e){
    var songId = e.target.dataset.songId
    var songUrl = "https://music.163.com/song/media/outer/url?id="+songId+".mp3"
    if (innerAudioContext.src==''){
      innerAudioContext.src = songUrl
      innerAudioContext.play()
      this.setData({
        playing: songId
      })
      wx.vibrateShort({})
    }else{
      if (innerAudioContext.src==songUrl){
        if (innerAudioContext.paused){
          innerAudioContext.play()
          this.setData({
            playing: songId
          })
          wx.vibrateShort({})
        }
        else{
          innerAudioContext.pause()
          this.setData({
            playing: ''
          })
        }
      }else{
        innerAudioContext.stop()
        innerAudioContext.src = songUrl
        innerAudioContext.play()
        this.setData({
          playing: songId
        })
        wx.vibrateShort({})
      }
    }
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
    wx.redirectTo({
      url: '/pages/index/index'
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
    showTmpMsg: false,
    showImg: false,
    playing: '',
    fromApp: ''
  }
})  
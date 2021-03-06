const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()
var utils = require('../../utils/util.js')

Page({
  onShow: function () {
    this.data.showTmpMsg = false;
    var recordPage = this;
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
    innerAudioContext.onEnded((res) => {
      this.setData({
        playing: ''
      })
    })
    this.setData({
      userId: options.userId,
      tuserName: options.tusername,
      tips: '',
      fromApp: options.fromApp,
    })
    wx.setNavigationBarTitle({
      title: '♥ ' + options.tusername,
    })
    this.loadData(this.data.offset)

  },
  loadData: function(offset){
    var _this = this;
    const unkownData = wx.getStorageSync('unkownData')
    wx.showLoading({})
    //获取听歌记录
    wx.request({
      url: app.globalData.serverUrl + '/rank/record',
      data: {
        userId: _this.data.userId,
        isBatchUpdate: unkownData ? 1 : 0,
        offset: offset,
        limit: 10
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.statusCode!=200){
          wx.hideLoading()
          wx.showToast({
            title: res.data,
            icon: 'none',
            duration: 2000
          })
          return;
        }
        if (res.data == undefined || res.data.length == 0) {
          _this.data.tips = "TA下次听歌才会获取到记录，耐心等一等吧...";
          _this.setData({
            tips: _this.data.tips,
            showImg: true
          })
          return;
        }
        //根据是否为系统自动批量更新的记录，对时间进行不同的format
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].changeTime == undefined) {
            res.data[i].changeTime = '';
          } else if (res.data[i].isBatchUpdate == 0) {
            res.data[i].changeTime
              = utils.formatTimeStamp(utils.str2Date(res.data[i].changeTime));
          } else {
            res.data[i].changeTime
              = utils.formatTimeStampToDate(utils.str2Date(res.data[i].changeTime));
          }

        }
        let records = _this.data.recordList.concat(res.data)
        _this.setData({
          recordList: records
        })
      },
      complete:function(res){
        wx.hideLoading()
      }
    })
  },
  click: function (e) {
    var songId = e.target.dataset.songId
    var songUrl = "https://music.163.com/song/media/outer/url?id=" + songId + ".mp3"
    if (innerAudioContext.src == '') {
      innerAudioContext.src = songUrl
      innerAudioContext.play()
      this.setData({
        playing: songId
      })
      wx.vibrateShort({})
    } else {
      if (innerAudioContext.src == songUrl) {
        if (innerAudioContext.paused) {
          innerAudioContext.play()
          this.setData({
            playing: songId
          })
          wx.vibrateShort({})
        }
        else {
          innerAudioContext.pause()
          this.setData({
            playing: ''
          })
        }
      } else {
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
  copyname:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.song,
      success(res) {
        wx.showToast({
          title: "复制歌名成功",
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '我有一份你在网易云音乐的听歌记录!',
      path: 'pages/record/record?userId=' + this.data.userId + '&tusername=' + this.data.tuserName,
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },
  lower:function(e){
    this.data.offset = this.data.offset + 1
    this.loadData(this.data.offset)
  },
  data: {
    userId: null,
    tuserName: null,
    isBatchUpdate: 0,
    recordList: [],
    tips: "Ta最近在听:",
    showTmpMsg: false,
    showImg: false,
    playing: '',
    fromApp: '',
    offset:0
  }
})  
const app = getApp()
Page({
  onLoad(e) {
    wx.showShareMenu({
      withShareTicket: true
    })
  }, onShow(e) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  nickNameInput:function(e){
    this.data.nickname = e.detail.value;
  },
  searchButtonTap:function(offset){
    if (typeof offset == 'object'){
        offset = 0
        this.data.array = []
    }
    if ('' == this.data.nickname){
      wx.showToast({
        title: "昵称都不输入，肯定找不到对象~",
        icon: 'none',
        duration: 2000
      })
      return;
    } 
    wx.showLoading({})
    var _this = this;
    wx.request({
      url: app.globalData.serverUrl + '/wx/netease/user',
      data: {
        keyWord: this.data.nickname,
        offset: offset*this.data.limit
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.length==0){
          _this.setData({
            show_img: true
          });
        }else{
          let array = _this.data.array.concat(res.data)
          _this.setData({
            array: array,
            show_img: false
          });
        }
      }
    })
  },
  addSubscribe(e) {
    let openid = app.globalData.openId
    if(!openid){
      openid = wx.getStorageSync('openid')
    }
    wx.request({
      url: app.globalData.serverUrl + '/msg',
      method: 'POST',
      data: {
        formId: e.detail.formId,
        isValid: 0,
        openid: openid,
        targetUserId: e.currentTarget.dataset.id
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          
        } else {
          
        }
      }
    })
  },
  //选择订阅用户
  selectUser: function(e){
    var _this = this;
    var targetid = e.currentTarget.dataset.id;
    var targetNickName = e.currentTarget.dataset.nickname;
    var targetAvatar = e.currentTarget.dataset.avatar;

    if (true){
      if (targetid=="")return;
      let openid = app.globalData.openid;
      if(!openid){
        openid = wx.getStorageSync('openid');
        if(!openid){
          wx.showToast({
            title: "获取您的身份信息失败\r\n请稍后再试!",
            icon: 'none',
            duration: 2000
          })
          return;
        }
      }
      wx.request({
        url: app.globalData.serverUrl + '/rank/check',
        data: {
          userId: targetid
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.statusCode == 200) {
            wx.request({
              url: app.globalData.serverUrl + '/task',
              method: 'POST',
              data: {
                jobAlias: targetNickName + "的爬虫任务",
                openId: openid,
                targetAvatar: targetAvatar + '?param=180y180',
                targetNickname: targetNickName,
                targetUserId: targetid,
                unionId: app.globalData.unionId
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
                _this.addSubscribe(e)
              },
              fail:function(res){
                console.log('添加关注失败' + res )
              }
            })
          } else {
            wx.showToast({
              title: "Ta隐藏了自己的听歌记录噢~",
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
    //查询谁关注了我
    else{
      var share_count = wx.getStorageSync('share_count');
      // if (share_count >= 2){
      //   wx.showToast({
      //     title: "你的分享查询次数已耗尽，请联系开发者",
      //     icon: 'none',
      //     duration: 2000
      //   })
      //   return;
      // }
      wx.request({
        url: app.globalData.serverUrl + '/user/getFollow',
        data: {
          targetUserId: targetid,
          delFlag: 0
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.statusCode == 200) {
            var array = [];
            for(var i = 0 ; i< res.data.length;i++){
                var item = {};
                item.avatar = res.data[i].avatarUrl
                item.nickName = res.data[i].nickName
                array.push(item);
            }
            console.log(array)
            _this.setData({
              array: array,
              tip_words: '以下微信用户关注了你噢~'
            })
            wx.setStorage({
              key: "share_count",
              data: ++share_count
            })
          }
        }
      })
    }
    
  },
  lower: function (e) {
    this.data.offset = this.data.offset + 1
    this.searchButtonTap(this.data.offset)
  },
  shareTip: function(e){
    wx.showToast({
      title: "转发在右上角，点我干什么",
      icon: 'none',
      duration: 1000
    })
  },
  //点击转发
  onShareAppMessage: function (res) {
    var searchJs = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '你最近听的歌我都非常喜欢',
      path: 'pages/index/index',
      imageUrl: '../index/share.jpg',
      success: function (res) {
        if (res.shareTickets) {
          wx.showToast({
            title: "分享成功，喜提彩蛋~",
            icon: 'none',
            duration: 4000
          })
          searchJs.setData({
            tip_words: "输入自己的微信昵称，查看谁关注了你"
          })

          // 获取转发详细信息
          // wx.getShareInfo({
          //   shareTicket: res.shareTickets[0],
          //   success(res) {
          //     res.errMsg; // 错误信息
          //     res.encryptedData;  //  解密后为一个 JSON 结构（openGId    群对当前小程序的唯一 ID）
          //     res.iv; // 加密算法的初始向量
          //   }
          // });
        }else{
          wx.showToast({
            title: "分享到群聊有彩蛋噢~",
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (res) {
      }
    }
  },
  data:{
    nickname:'',
    array:[],
    show_img: true,
    tip_words:'点击搜索结果添加关注',
    flag: true,
    wx_user: null,
    share_count: 0,
    offset: 0,
    limit: 5
  }
})
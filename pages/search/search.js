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
  searchButtonTap:function(){
    if ('' == this.data.nickname){
      wx.showToast({
        title: "昵称都不输入，肯定找不到对象~",
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var pageobj = this;
    wx.request({
      url: app.globalData.serverUrl + '/wx/getNeteaseUser',
      data: {
        keyWord: this.data.nickname
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        if (res.data.length==0){
          pageobj.setData({
            show_img: true
          });
        }else{
          pageobj.setData({
            array: res.data,
            show_img: false
          });
        }
      }
    })
  },
  //选择订阅用户
  selectUser: function(e){
    var thisJs = this;
    var targetid = e.currentTarget.id;
    var targetNickName = e.currentTarget.dataset.nickname;
    var targetAvatar = e.currentTarget.dataset.avatar;

    if (this.data.request_url == 1){
      if (targetid=="")return;
      wx.request({
        url: app.globalData.serverUrl + '/wx/checkSongRank',
        data: {
          userId: targetid
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.statusCode == 200) {
            wx.request({
              url: app.globalData.serverUrl + '/userjob',
              method: 'POST',
              data: {
                jobAlias: targetNickName + "的爬虫任务",
                openId: app.globalData.openId,
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
            thisJs.setData({
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

    this.setData({
      tip_words: '点击搜索结果添加关注',
      request_url: 1
    })
    
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
          searchJs.setData({
            request_url: 2
          })
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
    show_img: false,
    tip_words:'点击搜索结果添加关注',
    flag: true,
    wx_user: null,
    request_url: 1,
    share_count: 0
  }
})
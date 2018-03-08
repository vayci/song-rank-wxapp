const app = getApp()

Page({
  nickNameInput:function(e){
    this.data.nickname = e.detail.value;
  },
  searchButtonTap:function(){
    console.log(this.data.nickname);
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
        console.log(res.data);

        pageobj.setData({
          array: res.data
        });
      }
    })
  },
  //选择订阅用户
  selectUser: function(e){
    var targetid = e.currentTarget.id;
    var targetNickName = e.currentTarget.dataset.nickname;
    var targetAvatar = e.currentTarget.dataset.avatar;
    wx.request({
      url: app.globalData.serverUrl + '/wx/checkSongRank',
      data: {
        userId: targetid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode==200){
          wx.request({
            url: app.globalData.serverUrl + '/userjob',
            method: 'POST',
            data: {
              jobAlias: targetNickName+"的爬虫任务",
              openId: app.globalData.openId,
              targetAvatar: targetAvatar +'?param=180y180',
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
        }else{
          wx.showToast({
            title: "Ta隐藏了自己的听歌记录噢~",
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  data:{
    nickname:'',
    array:[]
  }
})
const app = getApp()

Page({
  nickNameInput:function(e){
    this.data.nickname = e.detail.value;
  },
  searchButtonTap:function(){
    console.log(this.data.nickname);
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
  data:{
    nickname:'',
    array:[]
  }
})
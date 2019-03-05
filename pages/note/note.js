Page({
  jump:function(param){
    //console.log(param.target.dataset.index)
    wx.navigateTo({
      url: '/pages/note-detail/note-detail?index=' + param.target.dataset.index
        + '&title=' + param.target.dataset.title
    })
  }
})
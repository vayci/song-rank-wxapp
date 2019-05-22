Page({
  jump:function(param){
    //console.log(param.target.dataset.index)
    if (param.target.dataset.index == undefined){
      return;
    }
    wx.navigateTo({
      url: '/pages/note-detail/note-detail?index=' + param.target.dataset.index
        + '&title=' + param.target.dataset.title
    })
  } 
  ,previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
})
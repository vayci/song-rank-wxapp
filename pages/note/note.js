Page({
  jump:function(param){
    if (!param.target.dataset.index)return;
    this.setData({
      showNav: false,
      index: param.target.dataset.index
    })
  },
  back:function(){
    this.setData({
      showNav: true
    })
  },
  data: {
    showNav: true,
    index: 1
  }
})
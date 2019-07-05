//app.js
App({
  onLaunch: function () {
      
  },

  onShow: function(){
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  
  // 全局数据
  globalData: {
    domain: "https://oapi.zhuniu.com"
  },
})
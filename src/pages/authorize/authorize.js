var login = require('../../utils/login.js');
var utils = require('../../utils/util.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    from: '/pages/index/index'
  },
  onLoad: function (e) {
    console.log(e.from)
    if (e.from) {
      this.setData({
        from: e.from
      });
    }

    // 在没有 open-type=getUserInfo 版本的兼容处理
      if (!this.data.canIUse) {
      wx.getUserInfo({
        success: res => {
          login.login().then(function(results){
              console.log(results);
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  // 用户已经同意小程序相册功能，后续调用 wx.saveImageToPhotosAlbum 接口不会弹窗询问
                  //that.startSaveImage()
                  wx.reLaunch({
                    url: _this.data.from,
                  })
                }
              })
              
          });
        },
      })
    }
  },
  //open-type=getUserInfo 版本处理
  getUserInfo: function (e) {
    let _this = this;
    login.login().then(function(results){
        console.log(results);
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            // 用户已经同意小程序相册功能，后续调用 wx.saveImageToPhotosAlbum 接口不会弹窗询问
            //that.startSaveImage()
            wx.reLaunch({
              url: _this.data.from,
            })
          }
        })
        
    });
  }
})
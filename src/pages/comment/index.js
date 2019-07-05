const app = getApp();
var utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    platIndex: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh();
    this.getCollectList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 收藏列表
   */
  getCollectList() {
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/comment/my_lists',
      method: 'GET',
      data: {
        token: wx.getStorageSync('userInfo').token,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          let list=[];
          let datalist = res.data.response; 
          for(var i=0;i<datalist.length;i++){
            if(datalist[i].news){
              list.push(datalist[i])
            }
          }
          that.setData({
            list: list.map(item=>{
              if (item.news) {
                item.news.tags = [
                  "置顶", item.news.text_type == "text" ? "图文" : item.news.text_type == "video" ? "视频" : ""
                ];
                item.news.cover_img = JSON.parse(item.news.cover_img);
                return item
              }
            })
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  /**
     * 点击进入详情
     */
  bindshowdetailTap(event) {
    let id = event.currentTarget.dataset.new.news_id;
    let textType = event.currentTarget.dataset.new.news.text_type;
    wx.navigateTo({ url: "../../pages/textdetail/index?id=" + id + "&text_type=" + textType });
    var videoContextPrev = wx.createVideoContext('video' + this.data.playIndex);
    videoContextPrev.pause();
    this.setData({
      playIndex: null,
    })
  },

  /**
   * 咨询点赞
   */
  voteNews(event) {
    let id = event.currentTarget.dataset.id;
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/text/vote',
      method: 'POST',
      data: {
        token: wx.getStorageSync('userInfo').token,
        id: id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          wx.showToast({
            title: "点赞成功",
            icon: 'success',
            duration: 2000
          })
          that.getCollectList();
          utils.textCount(id, "vote", text_type);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }

})
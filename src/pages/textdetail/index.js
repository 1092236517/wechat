const app = getApp();
const WxParse = require('../../wxParse/wxParse.js')
var login = require('../../utils/login.js')
var utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    text_type:"",
    title:"",
    creat_at:"",
    content: "",
    fSize:15,
    cover_img:"",
    tips:"",
    commentid:null,
    inputplace:"优质评论优先展示...",
    inputfocus:false,
    inputvlaue:"",
    commentList:[],
    iscollect:false,
    //cavanse
    previewHidden: true,
    winWidth:"",
    winHeight:"",
    //视频
    videoUrl:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.stopPullDownRefresh();
    _this.setData({//this.setData的方法用于把传递过来的id转化成小程序模
      id: options.id,//id是a页面传递过来的名称，a_id是保存在本页面的全局变量   {{b_id}}方法使用
      text_type: options.text_type
    });
    if (!login.isLogin()) {
      login.isAuthorize().then(function (isAuthorize) {
        if (isAuthorize) {
          login.login().then(function () {
            _this.getDetailData();
            _this.getCommentList();
            _this.drawCavanse(options);
            
          });
        } else {
          wx.redirectTo({
            url: '../authorize/authorize' + '?from=/pages/index/index'
            //url:"/page/textdetail"
          });
          return false;
        }
      });
    } else {
      _this.getDetailData();
      _this.getCommentList();
      _this.drawCavanse(options);
    }
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
    // this.getDetailData();
    // this.getCommentList();
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
   * 分享朋友
   */
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    utils.textCount(this.data.id, "transmit", this.data.text_type);
    console.log({path: '/pages/textdetail/index?id=' + this.data.id})
    return {
      title: this.data.title,
      desc: this.data.tips,
      path: '/pages/index/index?id='+this.data.id+"&text_type="+this.data.text_type // 路径，传递参数到指定页面。
    }
  },
  /**
   * 分享朋友圈
   */
  //第一步，获取屏幕宽高
  drawCavanse(options){
    let that = this;
    // 测试数据
    let real_name = 'xxxx';
    let id_card = '123123';
    let school_id = 666
    let winWidth = wx.getSystemInfoSync().windowWidth;// 获取当前设备的可视宽度
    let winHeight = wx.getSystemInfoSync().windowHeight;// 获取当前设备的可视高度
    that.setData({
      winWidth: winWidth,
      winHeight: winHeight
    })

    //绘制canvas图
    let promise1 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../resources/images/mabg.png',
        success: function (res) {
          // console.log(res)
          resolve(res);
        }
      })
    });
    let promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: 'https://oapi.zhuniu.com/img/1550815500.png',
        success: function (res) {
          // console.log(res)
          resolve(res);
        }
      })
    });
    Promise.all([
      promise1, promise2
    ]).then(res => {
      // console.log(res)
      const ctx = wx.createCanvasContext('shareImg')

      //主要就是计算好各个图文的位置，利用当前设备的宽高度对图片和文字进行居中
      ctx.drawImage('../../' + res[0].path, 0, 0, 1.1 * that.data.winWidth, 1.1 *that.data.winHeight)
      ctx.drawImage(res[1].path, 100, .6*that.data.winWidth, 200, 200)
      ctx.draw()
    })
  },
  /**
   * 保存到相册
  */
  save: function () {
    var that = this
    that.startSaveImage()
  },
  stopPageScroll() {
    return
  },

  startSaveImage: function () {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.preurl,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: '#72B9C3',
          success: function (res) {
            if (res.confirm) {
              // console.log('用户点击确定');
              that.setData({
                previewHidden: true
              })
            }
          }
        })
      }
    })
  },

  sharepyq: function () {
    var that = this
    wx.showLoading({
      title: '努力生成中...'
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: 606,
      destWidth: 375,
      destHeight: 606,
      canvasId: 'shareImg',
      success: function (res) {
        // console.log(res.tempFilePath);
        that.setData({
          preurl: res.tempFilePath,
          previewHidden: false,
        })
        wx.hideLoading()
      },
      fail: function (res) {
        // console.log(res)
      }
    })
  },
 
  /**
   * 增加字体
   */
  bindaddfontTap(){
    let fSize = this.data.fSize + 5
    if(fSize<=25){
      this.setData({
        fSize: fSize,
      })
    }else{
      wx.showToast({
        title:"已是最大字体",
        icon:"none",
        duration:2000
      })
    }
    
  },
   /**
   * 减小字体
   */
  bindreducefontTap(){
    let fSize = this.data.fSize - 5
    if(fSize>=10){
      this.setData({
        fSize: fSize,
      })
    }else{
      wx.showToast({
        title: "已是最小字体",
        icon: "none",
        duration: 2000
      })
    }
  },
   /**
   * 加载详情
   */
  getDetailData(){
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/text/lists',
      method: 'GET',
      data: {
        token: wx.getStorageSync('userInfo').token,
        text_type:that.data.text_type,
        id: that.data.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          let detailData = res.data.response.data[0];
          that.setData({
            "title" : detailData.title,
            "creat_at": detailData.created_at,
            "content": detailData.content,
            "cover_img":JSON.parse(detailData.cover_img)[0],
            "tips": detailData.seo_description,
            "iscollect": detailData.collect.length!=0?true:false,
          })
          WxParse.wxParse('content', 'html', detailData.content, that, 5)
          utils.textCount(that.data.id,"read",that.data.text_type);
          
          if (that.data.text_type=="video"){
            that.getVideoInfo(that.getvideoid(detailData.video_url));
            utils.textCount(that.data.id, "play", that.data.text_type);
          }
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
   * 加载评论
   */
  getCommentList(){
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/comment/lists',
      method: 'GET',
      data: {
        token: wx.getStorageSync('userInfo').token,
        text_type: that.data.text_type,
        news_id: that.data.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          that.setData({
            commentList: res.data.response,
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
   * input  value
   */
  bindKeyInput(e){
    this.setData({
      inputvlaue: e.detail.value
    })
  },
  /**
   * 发送评论
   */
  sendbtn(){
    let that= this;
    let url = "/api/frontend/news/text/comment";
    let data = {
      token: wx.getStorageSync('userInfo').token,
      id: that.data.id,
      text_type: that.data.text_type,
      comment: that.data.inputvlaue
    };
    if (that.data.commentid){
      url = "/api/frontend/news/comment/comment"
      data.id = that.data.commentid;
    }
    wx.request({
      url: app.globalData.domain + url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 2000
            });
          that.getCommentList();
          that.setData({
            "inputvlaue":"",
          })
          utils.textCount(that.data.id, "comment", that.data.text_type);
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
   * 点击单个评论
   */
  docomment(event){
    let item = event.currentTarget.dataset.item;
    this.setData({
      commentid:item.id,
      inputplace:"回复@"+item.user.name,
      inputfocus:true,
    })
  },

  /**
   * 点赞评论
   */
  commentvote(event){
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/comment/vote',
      method: 'POST',
      data: {
        token: wx.getStorageSync('userInfo').token,
        text_type: that.data.text_type,
        id: event.currentTarget.dataset.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 2000
          });
          that.getCommentList();
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
   * 收藏
   */
  collect(){
    let that = this;
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/collect/add',
      method: 'POST',
      data: {
        token: wx.getStorageSync('userInfo').token,
        text_type: that.data.text_type,
        news_id: that.data.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.msg_code === 100000) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          });
          that.setData({
            "iscollect":true,
          })
          utils.textCount(that.data.id, "collect", that.data.text_type);
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
   * 截取视频字符串
   */
  getvideoid(video_url){
    let arrvid=[];
    arrvid = video_url.split("vid=");
    return arrvid[1];
  },
  /**
   * 视频播放
   */
  getVideoInfo: function (vid) {
    var that = this;
    var urlString = 'https://vv.video.qq.com/getinfo?otype=json&appver=3.2.19.333&platform=11&defnpayver=1&vid=' + vid;
    wx.request({
      url: urlString,
      success: function (res) {
        var dataJson = res.data.replace(/QZOutputJson=/, '') + "qwe";
        var dataJson1 = dataJson.replace(/;qwe/, '');
        var data = JSON.parse(dataJson1);
        var fn_pre = data.vl.vi[0].lnk
        var host = data['vl']['vi'][0]['ul']['ui'][0]['url']
        var streams = data['fl']['fi']
        var seg_cnt = data['vl']['vi'][0]['cl']['fc']
        if (parseInt(seg_cnt) == 0) {
          seg_cnt = 1
        }
        var best_quality = streams[streams.length - 1]['name']
        var part_format_id = streams[streams.length - 1]['id']
        // var pageArr=[];
        for (var i = 1; i < (seg_cnt + 1); i++) {
          var filename = fn_pre + '.p' + (part_format_id % 10000) + '.' + i + '.mp4';
          // console.log(filename);
          // pageArr.push(i);
          that.requestVideoUrls(part_format_id, vid, filename, 'index' + i,host);

        }

      }
    })
  },
  requestVideoUrls: function (part_format_id, vid, fileName, index, host) {
    var keyApi = "https://vv.video.qq.com/getkey?otype=json&platform=11&format=" + part_format_id + "&vid=" + vid + "&filename=" + fileName + "&appver=3.2.19.333"
    var that = this;
    wx.request({
      url: keyApi,
      success: function (res) {
        var dataJson = res.data.replace(/QZOutputJson=/, '') + "qwe";
        var dataJson1 = dataJson.replace(/;qwe/, '');
        var data = JSON.parse(dataJson1);
        if (data.key != undefined) {
          var vkey = data['key']
          var url = host + fileName + '?vkey=' + vkey;
          var part_urls;
          part_urls = String(url);
          // console.log(part_urls)
          that.setData({
            videoUrl: part_urls
          });
        }
      }
    });
    var videoContext = wx.createVideoContext('myvideo');

    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if (networkType == "wifi") {
          videoContext.play()
        } else if (networkType == "none") {
          wx.showToast({
            title: "暂无网络",
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '非wifi',
            success(res) {
              if (res.confirm) {
                videoContext.play();
              } else if (res.cancel) {
                videoContext.pause();
              }
            }
          })
        }
      }
    })
  },
})
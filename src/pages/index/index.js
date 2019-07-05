var login = require('../../utils/login.js');
const app = getApp();
Page({
    data: {
        tabTouch: false, //tab点击会触发swiper的滚动，会导致调用两次相同的服务，使用此tag来阻止swiper调用服务，只是切换page
        window_width: wx.getSystemInfoSync().windowWidth || 375,// 单位是px
        tab_config: {
            tabs: [],// tabs
            active_tab: 0, //当前激活的tab
            item_width: 80,// 单位是px
            tab_left: 0, // 如果tabbar不是固定宽度，则目前左移的位置
            underline: {
                offset: 0, //下划线的位移
                margins: 20,  //下划线的左右间距
            }
        }, // 顶部导航栏配置
        swipe_config: {
            current: 0, // 当前激活的panel
            height: 0
        },
        all_news_list:[],
        news_list: [],
        news_list_current_page: 1,
        news_list_total_page: 0,
        news_list_total:0,
        //视频播放
        //playIndex: null,//用于记录当前播放的视频的索引值
        nomoreData:false,
        showdefaultimg:false
    },

    /**
     * 页面加载时触发
     */
    onLoad(options) {
        let _this = this;
        if (!login.isLogin()) {
            login.isAuthorize().then(function(isAuthorize){
                if (isAuthorize) {
                    login.login().then(function(){
                      wx.showLoading({
                        title: '加载中',
                      });
                        _this.loadTabs();
                    });
                } else {
                    wx.redirectTo({
                        url: '../authorize/authorize' + '?from=/pages/index/index',
                    });
                    return false;
                }
            });
        }else{
          _this.loadTabs();
        }

        if(options.id&&options.text_type){
          wx.navigateTo({
            url: "/pages/textdetail/index?id=" + id + "&text_type=" + textType
          });
        }
    },

    /**
     * 页面显示/切入前台时触发
     */
    onShow() {
      // wx.showLoading({
      //   title: '加载中',
      // });
      //this.loadTabs();
    },

    /**
     * 页面初次渲染完成时触发
     */
    onReady(){
      // wx.showLoading({
      //   title: '加载中',
      // });
      // this.loadTabs();
    },

    /**
     * 上拉刷新
     */
    onPullDownRefresh(){
        //TODO 模拟加载
      //wx.showNavigationBarLoading();
      let that = this;
      let current_page = that.data.news_list_current_page - 1;
      if (current_page == 0) {
        wx.stopPullDownRefresh();
      } else {
        that.loadNews(current_page);
      }
    },

    /**
     * 到达底部刷新
     */
    onReachBottom(){
        let that = this;
      let tab_index = that.data.tab_config.active_tab;
        // 显示加载图标
      if (that.data.news_list_total != that.data.news_list[tab_index].length){
        wx.showLoading({
          title: '玩命加载中',
        })
        // 页数+1
        let current_page = that.data.news_list_current_page + 1;
        that.loadNews(current_page);
      }else{
        that.setData({
          "nomoreData": true,
        })
      }
        
    },

    /**
     * 加载顶部导航栏TabList
     */
    loadTabs(){
        let that = this;
        wx.request({
            url: app.globalData.domain + '/api/frontend/news/plate/lists',
            method: 'GET',
            data: {
                token: wx.getStorageSync('userInfo').token
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                if (res.data.msg_code === 100000) {
                    let tab_config = {
                        tabs: res.data.response,// tabs
                        active_tab: that.data.tab_config.active_tab, //当前激活的tab
                        item_width: 80,// 单位是px
                        tab_left: that.data.tab_config.tab_left, // 如果tabbar不是固定宽度，则目前左移的位置
                        underline: {
                            offset: that.data.tab_config.underline.offset, //下划线的位移
                            margins: 20,  //下划线的左右间距
                        }
                    }
                    that.setData({
                        "tab_config": tab_config
                    })
                    that.initSwiperData();
                    that.loadNews(1);
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
     * 加载新闻列表
     */
  loadNews(current_page){
        let that = this;
        let tab_index = that.data.tab_config.active_tab;
        wx.request({
            url: app.globalData.domain + '/api/frontend/news/text/lists',
            method: 'GET',
            data: {
                token: wx.getStorageSync('userInfo').token,
                plate_id: that.data.tab_config.tabs[tab_index].id,
                current_page: current_page,
                per_page:8
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                if (res.data.msg_code === 100000) {
                  that.setData({
                     "news_list_total" : res.data.response.total,
                  })
                  if (res.data.response.data.length != 0) {
                    let resData = res.data.response.data.map(item => {
                      item.tags = [
                        "置顶", item.text_type == "text" ? "图文" : item.text_type == "video" ? "视频" : ""
                      ];
                      if (item.cover_img!=0){
                        item.cover_img = JSON.parse(item.cover_img);
                      }else{
                        item.cover_img = [];
                      }
                      if (item.text_type == "text" && item.cover_type == "single") {
                        item.show_type = "IMG_RIGHT"
                      } else if (item.text_type == "text" && item.cover_type == "multiple") {
                        item.show_type = "IMG_BOTTOM"
                      } else if (item.text_type == "video" && item.cover_type == "single") {
                        item.show_type = "VIDEO_RIGHT";
                      } else if (item.text_type == "video" && item.cover_type == "multiple"){
                        item.show_type = "VIDEO_BOTTOM";
                      }
                      return item
                    });
                    // 清除其他tab的内容
                    that.data.news_list = that.data.news_list.map(function(news, index){
                        if(index == tab_index) {
                          return news.concat(resData);
                        } else {
                          return [];
                        }
                    });
                    // that.dataSplit(that.data.news_list[tab_index]);
                    //that.data.news_list[tab_index] = that.data.news_list[tab_index].concat(resData);
                  }
                  that.setData({
                      "tabTouch": false,
                      "news_list": that.data.news_list,
                      "news_list_current_page": res.data.response.current_page,
                      "news_list_total_page": res.data.response.total
                  });

                  if(that.data.news_list.length>0){
                    that.setData({
                      "showdefaultimg":false
                    })
                  }
                  // 隐藏导航栏加载框
                  //wx.hideNavigationBarLoading();
                  // 停止下拉动作
                  wx.stopPullDownRefresh();
                  wx.hideLoading();
                  that.resetSwiperHeight();
                  that.setData({
                    "nomoreData": false,
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
     * 数据截取
     */
    // dataSplit(data){
    //   let prepage = (this.data.news_list_current_page -1)*8;
    //   let lastpage = (this.data.news_list_current_page + 1)*8;
    //   console.log(data,prepage,lastpage);
    //   if(data.length>24){
    //     data = data.slice(prepage,lastpage)
    //   }
    //   return data;
    // },


    /**
     * 初始化swiper data
     */
    initSwiperData(){
        let news_list = new Array();
        for (let i = 0; i < this.data.tab_config.tabs.length; i++) {
            news_list.push([]);
        }
        this.setData({
            "news_list": news_list
        });
    },

    /**
     * 重置swiper的高度
     */
    resetSwiperHeight(){
        let img_right_height = 240;
        let img_bottom_height = 240;
        let video_right_height = 240;
        let video_bottom_height = 420;
        let height = 260;
        this.data.news_list[this.data.swipe_config.current].map(function (item) {
          switch (item.show_type) {
            case "VIDEO_BOTTOM":
              height += video_bottom_height;
              break;
            case "VIDEO_RIGHT":
              height += video_right_height;
              break;
            case "IMG_RIGHT":
              height += img_right_height;
              break;
            case "IMG_BOTTOM":
              height += img_bottom_height;
              break;
            default:
              height += 0;
          }
        });
        this.setData({
            "swipe_config.height": height<1200?1200:height
        })
    },

    /**
     * 更换页面到指定page ，从0开始
     */
    updateSelectedPage(page) {
        let that = this;
        let { window_width, tab_config, swipe_config } = this.data;
        let underline_offset = tab_config.item_width * page;

        tab_config.active_tab = page;
        swipe_config.current = page;
        tab_config.underline.offset = underline_offset;
        if (!tab_config.fixed) {
            // 如果tab不是固定的 就要 检测tab是否被遮挡
            let show_item_num = Math.round(window_width / tab_config.item_width); // 一个界面完整显示的tab item个数
            let min_left_item = tab_config.item_width * (page - show_item_num + 1); // 最小scroll-left
            let max_left_item = tab_config.item_width * page; //  最大scroll-left
            if (tab_config.tab_left < min_left_item || tab_config.tab_left > max_left_item) {
                // 如果被遮挡，则要移到当前元素居中位置
                tab_config.tab_left = max_left_item - (window_width - tab_config.item_width) / 2;
            }
        }
        that.setData({
            "tab_config": tab_config,
            "swipe_config": swipe_config
        });
        //调用页面的接口更新页面
        // wx.showLoading({
        //   title: '加载中',
        // })
        that.loadNews(1);
    },

    /**
     * tab的点击事件
     */
    handlerTabTap(e) {
        this.setData({
            tabTouch: true,
            news_list_current_page: 1
        })
        this.updateSelectedPage(e.currentTarget.dataset.index);
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
    },

    /**
     * swiper的滑动事件
     */
    bindChange(e) {
      this.setData({
        news_list_current_page: 1
      })
      
      if (!this.data.tabTouch) {
          this.updateSelectedPage(e.detail.current);
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          })
      }
    },

    /**
     * 点击进入详情
     */
    bindshowdetailTap(event){
        let id = event.currentTarget.dataset.new.id;
        let textType = event.currentTarget.dataset.new.text_type;
        wx.navigateTo({ 
          url: "/pages/textdetail/index?id=" + id + "&text_type=" + textType
        });
        //var videoContextPrev = wx.createVideoContext('video' + this.data.playIndex);
        //videoContextPrev.pause();
        this.setData({
          playIndex:null,
        })
    },
    /**
     * 视频播放
     */
  // videoPlay: function (e) {
  //   var curIdx = e.currentTarget.dataset.index;
  //   // 没有播放时播放视频
  //   if (!this.data.playIndex) {
  //     this.setData({
  //       playIndex: curIdx
  //     })
  //     var videoContext = wx.createVideoContext('video' + curIdx) //这里对应的视频id
  //     wx.getNetworkType({
  //       success: function (res) {
  //         // 返回网络类型, 有效值：
  //         // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
  //         var networkType = res.networkType;
  //         if (networkType == "wifi"){
  //           videoContext.play()
  //         } else if (networkType == "none"){
  //           wx.showToast({
  //             title: "暂无网络",
  //             icon: 'none',
  //             duration: 2000
  //           })
  //         }else{
  //           wx.showModal({
  //             title: '提示',
  //             content: '非wifi',
  //             success(res) {
  //               if (res.confirm) {
  //                 videoContext.play();
  //               } else if (res.cancel) {
  //                 videoContext.pause();
  //               }
  //             }
  //           })
  //         }
  //       }
  //     })
      
  //   } else { // 有播放时先将prev暂停，再播放当前点击的current
  //     var videoContextPrev = wx.createVideoContext('video' + this.data.playIndex)
  //     if (this.data.playIndex != curIdx) {
  //       videoContextPrev.pause()
  //     }
  //     this.setData({
  //       playIndex: curIdx
  //     })
  //     var videoContextCurrent = wx.createVideoContext('video' + curIdx)
  //     wx.getNetworkType({
  //       success: function (res) {
  //         // 返回网络类型, 有效值：
  //         // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
  //         var networkType = res.networkType;
  //         if (networkType == "wifi") {
  //           videoContextCurrent.play()
  //         } else if (networkType == "none") {
  //           wx.showToast({
  //             title: "暂无网络",
  //             icon: 'none',
  //             duration: 2000
  //           })
  //         } else {
  //           wx.showModal({
  //             title: '提示',
  //             content: '非wifi',
  //             success(res) {
  //               if (res.confirm) {
  //                 videoContextCurrent.play();
  //               } else if (res.cancel) {
  //                 videoContextCurrent.pause();
  //               }
  //             }
  //           })
  //         }
  //       }
  //     })
  //   }
  // }
})

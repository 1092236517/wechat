const app = getApp();

// 判断是否已登录
const isLogin = () => {
  // 本地无用户缓存数据
  if (!wx.getStorageSync('userInfo')) {
      return false;
  }
  return true;
}

// 判断是否授权
const isAuthorize = () => {
  var isAuthorize = new Promise(function (resolve, reject) {
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.writePhotosAlbum']) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    })
  }); 
  return isAuthorize;
}
 
// 用户登录
const login = () => {
  // 微信登录
  var wxLogin = new Promise(function (resolve, reject) {
    wx.login({
      success: res => {
        resolve(res);
      }
    });
  });

  // 获取微信授权用户信息
  var wxGetUserInfo = new Promise(function (resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        console.log(res);
        resolve(res);
      }
    });
  });

  // 登录
  var doLogin = Promise.all([wxLogin, wxGetUserInfo]).then(function (results) {
    wx.request({
      url: app.globalData.domain + '/api/frontend/news/login',
      method: 'POST',
      data: {
        code: results[0].code,
        encrypted_data: results[1].encryptedData,
        iv: results[1].iv,
        raw_data: results[1].rawData,
        signature: results[1].signature,
        user_info: results[1].userInfo
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        // 缓存用户信息
        wx.setStorageSync('userInfo', res.data.response);
        Promise.resolve(true);
      }
    })
  });
  return doLogin;
}

module.exports = {
  isLogin: isLogin,
  isAuthorize: isAuthorize,
  login: login
}

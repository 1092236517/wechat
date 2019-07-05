const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const textCount = (id,type,text_type) => {
  wx.request({
    url: app.globalData.domain + '/api/frontend/news/text/count',
    method: 'POST',
    data: {
      token: wx.getStorageSync('userInfo').token,
      id:id,
      type:type,
      text_type:text_type
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success(res) {
      // console.log(res)
    }
  })
}

const count_cancel = (id, type, text_type) => {
  wx.request({
    url: app.globalData.domain + '/api/frontend/news/text/count_cancel',
    method: 'POST',
    data: {
      token: wx.getStorageSync('userInfo').token,
      id: id,
      type: type,
      text_type: text_type
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success(res) {
      // console.log(res)
    }
  })
}

module.exports = {
  formatTime: formatTime,
  textCount: textCount,
  count_cancel: count_cancel
}

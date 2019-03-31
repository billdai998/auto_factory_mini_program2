// const regeneratorRuntime = require('../utils/runtime.js')
import regeneratorRuntime from './runtime.js'
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



const wxRequest = async(url, data = {}, method = 'POST', isHideLoading = true) => {

  // 所有的请求，header默认携带token
  let header = {
    'Content-Type': 'application/json',
    'factory-car-token': wx.getStorageSync('token') || ''
  }
  // data = data || {}
  // method = method || 'GET'
  // hideLoading可以控制是否显示加载状态
  if (!isHideLoading) {
    wx.showLoading({
      title: '加载中...',
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        // console.log("wxRequest--res", res.data)
        if (res && res.statusCode == 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      },
      complete: (e) => {
        wx.hideLoading()
      }
    })
  })

}

//检查是否登录
function checkOpenidExits(){
  let flag = true
  let openid = wx.getStorageSync('openid')
  console.log("openid", openid)
  if ((openid == undefined) || (openid == '')) {
    console.log("请先在我的页面授权！")
    // wx.showToast({
    //   title: '请先在我的页面授权！',
    // })
    flag = false
  }
  return flag;
}

//货币格式方法
function formatMoney(number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : "¥";
  thousand = thousand || ",";
  decimal = decimal || ".";
  var negative = number < 0 ? "-" : "",
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}


module.exports = {
  formatTime: formatTime,
  wxRequest: wxRequest,
  checkOpenidExits: checkOpenidExits,
  formatMoney:formatMoney,

}
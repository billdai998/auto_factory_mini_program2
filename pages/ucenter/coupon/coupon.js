// pages/ucenter/coupon/coupon.js
const api = require('../../../utils/api.js')
import {
  wxRequest,
  formatMoney
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'

const {
  $Message
} = require('../../../module/iview/dist/base/index');

const {
  $Toast
} = require('../../../module/iview/dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: false,
    current: 'tab1',
    currentPage: 1,
    status: 0,
    hasMoreData: true,
    list: [],
    member: {}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getCouponList()
  },

  handleChange({
    detail
  }) {
    let key = detail.key
    let status = 0
    switch (key) {
      case 'tab1':
        status = 0
        break;
      case 'tab2':
        status = 1
        break;
      case 'tab3':
        status = 2
        break;
    }

    this.setData({
      current: key,
      status: status,
    });

  },

  async getCouponList(){
    let data = {
      openid:wx.getStorageSync('openid')
    }
    let list = await wxRequest(api.getCouponList, data)
    console.log("list",list)
    this.setData({
      list:list.data
    })
  }

})
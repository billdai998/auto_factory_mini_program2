// pages/goodList/goodList.js
const api = require('../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits,
  formatMoney
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage: 1,
    hasMoreData: true,
    spinShow: true,
    list: [],

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
    this.getGroupList();
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
    console.log("下拉动作")
    this.getGroupList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("上拉触底事件")
    this.getGroupList();

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

  async getGroupList() {
    let data = {
      page: this.data.currentPage
    }

    let tmpList = this.data.list
    let res = await wxRequest(api.getGroupMallByPage, data)
    console.log("res",res)
    if (res.data.data.length > 0) {

      //货币格式
      for (const item of res.data.data) {
        item.price_cn = formatMoney(item.price)
        item.cn_group_price = formatMoney(item.group_price)
        item.price = formatMoney(item.price)
      }

      tmpList.push.apply(tmpList, res.data.data)

      this.setData({
        list: tmpList,
        currentPage: this.data.currentPage + 1,
      })
    } else {
      this.setData({
        hasMoreData: false,
      })
    }

    this.setData({
      spinShow: false,
    })

    // console.log("formatMoney", formatMoney(1000))

  },

})
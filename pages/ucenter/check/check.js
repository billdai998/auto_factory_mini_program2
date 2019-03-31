const api = require('../../../utils/api.js')
import {
  wxRequest
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 'tab1',
    icon_manual: '/static/images/icon_manual.png',
    carInfo:{},
    list: [],
    currentPage: 1,
    hasMoreData: true,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
     
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("下拉动作")
    this.getCheckReportList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("上拉触底事件")
    this.getCheckReportList();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getCarInfo();
    this.getCheckReportList();
  },

  getCarInfo: function() {
    let car = wx.getStorageSync("car")
    console.log("aaaa",car)
    this.setData({
      carInfo:car
    })
  },
  checkChange({
    detail
  }) {
    this.setData({
      current: detail.key
    });
  },

  async getCheckReportList(){
    let car = wx.getStorageSync("car")
    let data = {
      openid: wx.getStorageSync('openid'),
      carno: car.no,
      page:this.data.currentPage
    }
    let tmpList = this.data.list
    let res = await wxRequest(api.getCheckReportList, data)
    console.log("res", res)
    if (res.data.data.length > 0) {
 
 
      tmpList.push.apply(tmpList, res.data.data)
      console.log("tmpList", this.data.tmpList)
      this.setData({
        list: tmpList,
        currentPage: this.data.currentPage + 1,
      })
    } else {
      this.setData({
        hasMoreData: false,
      })
    }

    console.log("list",this.data.list)

  }

})
const api = require('../../utils/api.js')
import {
  wxRequest
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 1,
    currentPage: 1,
    list: [],
    hasMoreData:true,
    spinShow: true,
    isLoading:false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getContentList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function() {
    console.log("--监听用户下拉动作")
    // wx.startPullDownRefresh()
    this.setData({
      isLoading: true,
    })
    this.getMoreData('down')
    

    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function() {
    console.log("--页面上拉触底事件")
    this.getMoreData('up')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getContentList: async function() {
    let list = await wxRequest(api.getContentList, {})
    console.log("list", list)
    
    let tmpList = this.data.list;
    if (list.data.data.length > 0) {
      console.log("---len>0----")
      tmpList.unshift.apply(tmpList, list.data.data)
      console.log("tmpList", tmpList)
      this.setData({
        list: tmpList,
        spinShow: false,
      })
    }
  },

  getMoreData:async function(type){
    let data = {
      page: this.data.currentPage + 1
    }
    let list = await wxRequest(api.getContentList, data)
    console.log("list", list)

    this.setData({
      isLoading: false,
    })

  wx.stopPullDownRefresh();

    if (list.data.data.length == 0) {
      console.log("没有更多数据....")
      this.setData({
        hasMoreData: false,
      })
    } else {
      let tmpList = this.data.list;
      if(type =='up'){
        tmpList.unshift.apply(tmpList, list.data.data)
      }else{
        tmpList.push.apply(tmpList, list.data.data)
      }
      
      console.log("tmpList", tmpList)
      this.setData({
        list: tmpList,
        currentPage: data.page
      })
    }
  }

})
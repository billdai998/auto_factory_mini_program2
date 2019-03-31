// pages/ucenter/comment/comment.js
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
    orderid:0,
    mallid:0,
    spinShow: true,
    mall:{},
    startMall:5,
    startService:5,
    comment:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderid: options.orderid,
      mallid: options.mallid,
    })
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
    this.getInitData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  // onHide: function () {

  // },

  /**
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function () {

  // },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }

  async getInitData(){
    let that = this;
    let car = wx.getStorageSync('car')
    let res = await wxRequest(api.getMallDetailById, {
      id: this.data.mallid,
      serialid: car.serialid
    })
    console.log("mallData",res)
    this.setData({
      mall:res.data,
      spinShow:false,
    })
  },
   
  getScore(e){
    let item = e.currentTarget.dataset.item
    console.log('item',item)
    this.setData({
      startMall:item
    })
  },
  getScoreService(e) {
    let item = e.currentTarget.dataset.item
    console.log('item', item)
    this.setData({
      startService: item
    })
  },
  
  getComment(e){
    let comment = e.detail.value
    console.log("comment",comment)
    this.setData({
      comment: comment,
    })
  },
  async submitComment(){
    let data = {
      orderid: this.data.orderid,
      mallid: this.data.mallid,
      openid:wx.getStorageSync('openid'),
      score_commodity:this.data.startMall,
      score_service:this.data.startService,
      comment:this.data.comment
    }
    
    console.log("data",data)

    let res = await wxRequest(api.addComment,data)
    if(res.errno ==0){
      $Message({
        content: '提交成功',
        type: 'success'
      });
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        })
        // wx.switchTab({
        //   url: '/pages/ucenter/index/index',
        // })
      },3000)
    }else{
      $Message({
        content: '提交失败，请稍后再试！',
        type: 'error'
      });
    }
  }
})
// pages/questionSelect/questionSelect.js
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
    times:0,
    title: '请选择题型等级',
    items: [{
      id: 0,
      name: '普通',
      checked: false,
    }, {
      id: 1,
      name: '高级',
      checked: false,
    }]

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
    
    this.getUserInfo()
    this.selectElement()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getTimes()
  },

  async getTimes(){
    let data = {
      openid:wx.getStorageSync('openid')
    }
    let res = await wxRequest(api.checkQuestionTimes, data)
    console.log("getTimes",res)
    this.setData({
      times:res.data.times
    })
  },

  async getUserInfo() {
    let openid = wx.getStorageSync('openid')
    let res = await wxRequest(api.getMemberByOpenid, {
      openid: openid
    })
    console.log("res", res)
    this.setData({
      userInfo: res.data
    })
  },

  //选择
  selectItem(e) {
    console.log("selectItem...", e.currentTarget.dataset.idx)
    let items = this.data.items
    let idx = e.currentTarget.dataset.idx
    let id = e.currentTarget.dataset.id

    let checkIdx = idx==0?1:0
    let val1 = 'items[' + checkIdx + '].checked'
    this.setData({
      [val1]: false
    })
    // let hasCheck = false
    // items.forEach(item => {
    //   if (item.checked) {
    //     hasCheck = true
    //   }
    // })
    // if (hasCheck) {
    //   return;
    // }
    
    console.log("id",id)
    
    this.playAudio()

    
   

    let val = 'items[' + idx + '].checked'
    this.setData({
      [val]: true
    })

    wx.navigateTo({
      url: '/pages/question/question?type='+id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })


 


  },

  //播放音乐
  playAudio() {
    console.log("播放音乐....")
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = '/static/audio/din.wav'
    // innerAudioContext.play()
    innerAudioContext.autoplay = true
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  selectElement(){
    let qry = wx.createSelectorQuery();
    let elements = qry.select('.question')
    console.log("elements", elements)
  },

  goBack(){
    wx.navigateBack({
      delta:1,
    })
  }


  // /**
  //  * 生命周期函数--监听页面隐藏
  //  */
  // onHide: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面卸载
  //  */
  // onUnload: function () {

  // },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }
})
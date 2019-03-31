// pages/ucenter/subscribe/subscribe.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 'tab1',
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

  },
  handleChange({ detail }) {
    this.setData({
      current: detail.key
    });
  },
})
// pages/payResult/payResult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: false,
    orderId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options.status)
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.orderId || 24,
      status: options.status == 'true' ? true : false
    })

    console.log(this.data.status)
    console.log("status == true", this.data.status == true)
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

 
})
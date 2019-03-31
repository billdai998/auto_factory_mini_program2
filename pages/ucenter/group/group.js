// pages/ucenter/group/group.js
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
    spinShow: true,
    current: 'tab1',
    currentPage: 1,
    status: 9,
    hasMoreData: true,
    list: [],
    member: {},
    clearTimer:false,
    targetTime: new Date().getTime() + 10000,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    this.getGroupListByPage();
    let member = await wxRequest(api.getMemberByOpenid, {
      openid: wx.getStorageSync("openid")
    })
    console.log("member", member)

    this.setData({
      member: member.data
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // console.log(this.data.goods.name)
    // if (res.from === 'button') {
    // 来自页面内转发按钮
    console.log(res.target)
    let id = res.target.dataset.id;
    let name = res.target.dataset.name;
    let url = res.target.dataset.url
    let groupid = res.target.dataset.groupid

    console.log("id",id)

    // }
    return {
      title: "我在超级工厂发起了一个【" + name + "】的拼团",
      imageUrl: url,
      path: '/pages/groupDetail/groupDetail?id=' + id + "&initiator=" + this.data.member.id + '&groupid=' + groupid
    }

  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getGroupListByPage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getGroupListByPage()
  },
  handleChange({
    detail
  }) {
    let key = detail.key
    let status = ''
    switch (key) {
      case 'tab1':
        status = 9
        break;
      case 'tab2':
        status = 0
        break;
      case 'tab3':
        status = 1
        break;
    }

    this.setData({
      current: key,
      currentPage: 1,
      status: status,
      hasMoreData: true,
      amount: 0,
      amount_cn: formatMoney(0),
      list: []
    });

    this.getGroupListByPage()
  },

  async getGroupListByPage() {
    
    console.log("status:", this.data.status)
    let data = {
      openid: wx.getStorageSync('openid'),
      status: this.data.status,
      page: this.data.currentPage
    }

    let res = await wxRequest(api.getGroupListByPage, data)
    this.setSpinShow()
    if (res.errno != 0) {
      $Message({
        content: res.errmsg,
        type: 'error'
      });
      return;
    }
    console.log("getGroupListByPage", res)
    if (res.data.data.length > 0) {
      let tmpList = this.data.list
      tmpList.push.apply(tmpList, res.data.data)
      this.setData({
        list: tmpList,
        currentPage: this.data.currentPage + 1
      })

    } else {
      this.setData({
        hasMoreData: false,
      })
    }

    this.setSpinShow()

  },

  setSpinShow() {
    this.setData({
      spinShow: false, 
    })
  },
  changeBooking(e) {
    let id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: '/pages/bookTime/time?orderid=' + id + '&from=order',
    })

  }


})
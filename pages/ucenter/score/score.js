// pages/ucenter/score/score.js
const api = require('../../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'

const {
  $Message
} = require('../../../module/iview/dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    score:0,
    list:[
      { id: 1, opt: '+10000', date: '2018-11-11', type: '消费'},
      { id: 2, opt: '+10000', date: '2018-11-10',type:'消费' },
      { id: 3, opt: '+12000', date: '2018-11-09', type: '消费'},
      { id: 4, opt: '+13000', date: '2018-11-08', type: '消费' },
      { id: 5, opt: '+14000', date: '2018-11-07', type: '消费'},
      { id: 6, opt: '+15000', date: '2018-11-06', type: '消费' },
    ]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      score: options.score
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
    this.getInitData()
  },

  async getInitData(){
    let data = {
      openid: wx.getStorageSync('openid')
    }
    let list = await wxRequest(api.getMemberScoreList,data)
    console.log("list", list)
    this.setData({
      list:list.data
    })
  }

   
})
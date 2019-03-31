// pages/ucenter/orderDetail/orderDetail.js
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
    id:0,
    detail:{},
    amount:0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })

    this.getOrderDetail()
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

   async getOrderDetail(){
     let res = await wxRequest(api.getOrderDetailById,{id:this.data.id})
     console.log("getOrderDetail...",res)
     
    let amount = 0
     res.data.malls.forEach(item =>{
       amount = amount + (Number(item.price)*Number(item.nums))
     })

     this.setData({
       spinShow:false,
       detail:res.data,
       amount: amount
     })
   }
})
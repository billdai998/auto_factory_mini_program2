// pages/bookDetail/bookDetail.js
const api = require('../../utils/api.js')
import {
  wxRequest
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'

const moment = require('../../utils/moment.min.js');
const {
  $Toast
} = require('../../module/iview/dist/base/index');
const {
  $Message
} = require('../../module/iview/dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    amount: 0,
    nums:1,
    car: {},
    booking: {},
    member:{},
    carts:[],
    mall:{},
    linkName:'',
    linkMobile:'',
    btnLoading:false,
    btnText:'去付款',
    orderid: 0,
    prepay_id: '',
    fromPage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("fromPage",options.from)
    this.setData({
      fromPage:options.from
    })
    this.getInitData();
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
  getInitData: async function() {
    let that = this;

    let booking = wx.getStorageSync("booking")
    // let car = wx.getStorageSync("car")
    let res = await wxRequest(api.getDefaultCar, {
      openid: wx.getStorageSync("openid")
    })
    let car = res.data
    let amount = wx.getStorageSync("amount")
    let nums = 1;
    
    let member = await wxRequest(api.getMemberByOpenid, {
      openid: wx.getStorageSync("openid")
    })
    console.log("fromPage",this.data.fromPage)
    let item = []
    if (this.data.fromPage =='cart'){
      let cartList = wx.getStorageSync('cartList')
      item = cartList;
      console.log("cartList", cartList)
      nums = cartList.length
      amount = 0
      cartList.forEach(item=>{
        amount = amount + Number(item.nums) * Number(item.price)
      })

    }else{
      console.log(".......")
      let cartList = wx.getStorageSync('mallInfo')
      item = cartList;
      // let mall = await wxRequest(api.getMallInfoById, {
      //   id: wx.getStorageSync("mallid"),
      //   serialid: car.serialid,
      // })
      // console.log(".......mall", mall)
      // mall.data.nums = 1;
      // item.push(mall.data)
    }
    

    console.log("---getInitData-booking--", booking)
    console.log("---getInitData-car--", car)
    console.log("---getInitData-member--", member)
    // console.log("---getInitData-mall--", mall)
   
    that.setData({
      booking: booking,
      car: car,
      amount: amount,
      nums: nums,
      member: member.data,
      // mall: mall.data,
      carts: item,
      linkName:member.data.name,
      linkMobile:member.data.mobile
    })




  },
  getUserName:function(e){
    this.setData({
      linkName: e.detail.value
    })
  },
  getUserMobile:function(e){
    this.setData({
      linkMobile: e.detail.value
    })
  },
  getOrder:async function(){
    let that = this;
    this.setData({
      btnLoading:true,
      btnText:'付款中'
    })

    // getOrderByWexin
    let data = {
      openid: wx.getStorageSync('openid'),
      // mallid: this.data.carts[0].id,  //商品数据，
      malls: wx.getStorageSync('mallInfo'),
      carts: this.data.carts,   //购物车数据
      carno: this.data.car.no,
      linkMan: this.data.linkName,
      linkPhone:this.data.linkMobile,
      bookDate: moment(this.data.booking.bookingDate,'MM-DD').format('YYYY-MM-DD'),
      bookTime: this.data.booking.bookingTime,
      amount: this.data.amount,
      service_type:1,
    }
    let res = null
    //从购物车来的数据，
    console.log("frompage=", this.data.fromPage)
    console.log("data",data) 
 

    if(this.data.fromPage == 'cart'){
      console.log("从购物车来的数据，")   
      res = await wxRequest(api.getServiceOrderByCart, data)    
    }else{
      //下接下单的数据
      res = await wxRequest(api.getOrderByWexin, data)
    }
    

    console.log("res",res)
    console.log("timeStamp",moment().valueOf())

    //如果订单信息写入正确，则调用微信支付
    if (res.errno == 0) {
      this.setData({
        orderid: res.data.orderid,
        prepay_id: res.data.prepay_id
      })
      wx.requestPayment({
        timeStamp: res.data.timeStamp.toString(),
        nonceStr: res.data.nonceStr,
        package: res.data.package,
        signType: res.data.signType,
        paySign: res.data.paySign,
        success(res) {
          console.log("res---", res)

          that.paySuccess();
          wx.navigateTo({
            url: '../payResult/payResult?status=true',
          })
        },
        fail(res) {
          console.log("res", res)
          $Message({
            content: '支付失败，请重新发起',
            type: 'error'
          });
          wx.navigateTo({
            url: '../payResult/payResult?status=false',
          })
        }
      })
    } else {
      $Message({
        content: res.errmsg,
        type: 'error'
      });
      this.setData({
        btnLoading: false,
        btnText: '去付款',
      })
    }
  },
  async paySuccess() {
    console.log("-----paySuccess-----")
    let pp = await wxRequest(api.paySuccessResult, {
      orderid: this.data.orderid,
      prepay_id: this.data.prepay_id
    })
    console.log("pp=---", pp)
  }

})
// pages/cart/car.js
const api = require('../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits,
  formatMoney

} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'

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
    currentPage: 1,
    hasMoreData: true,
    list: [],
    tmpNums: 0,
    counts: 0,
    amount_cn: formatMoney(0),
    amount: 0,
    no_car_img: '/static/images/noCar.png',
    icon_uncheck: '/static/images/service/check_box.png',
    icon_checked: '/static/images/service/check_box_checked.png',
    address: {},
    hasAddress: false,
    isLoading: false,
    orderid: 0,
    prepay_id: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCartList()
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
    this.getDefaultAddress();
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
  onPullDownRefresh: function() {
    console.log("用户下拉动作")
    // this.getCartListByPage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log("页面上拉触底事件")
    // this.getCartListByPage()
  },

  getCartList: async function() {

    let list = wx.getStorageSync('cartList')
    console.log("getCartList", list)

    let amount = 0
    list.forEach(item => {
      amount += Number(item.nums) * Number(item.price)
    })

    this.setData({
      list: list,
      amount: amount,
      amount_cn: formatMoney(amount)
    })



  },
  handleChangeNums: function({
    detail
  }) {
    console.log(detail.value)
    this.setData({
      tmpNums: detail.value
    })
  },

  getIndex: function(e) {
    let that = this
    let idx = e.currentTarget.dataset.idx


    let amount = 0
    let counts = 0
    let list = this.data.list
    list.forEach(item => {

      amount = amount + (Number(this.data.tmpNums) * Number(item.price))
      counts += Number(item.nums)

    })

    let amount_cn = formatMoney(amount)
    let num = 'list[' + idx + '].nums'
    that.setData({
      amount: amount,
      amount_cn: amount_cn,
      [num]: this.data.tmpNums
    })

  },
  async makeBooking() {
    let that = this;
    let list = this.data.list
    let car = wx.getStorageSync("car")
    if(car.id ==undefined){
      $Message({
        content: '请完善我的车辆信息！',
        type: 'error'
      });
      return;
    }
    if (!this.data.hasAddress) {
      $Message({
        content: '请选择地址！',
        type: 'warning'
      });
      return;
    }

    let data = {
      address: this.data.address,
      mallList: list,
      openid: wx.getStorageSync('openid'),
      amount: this.data.amount,
      car: car,
    }
    this.setData({
      isLoading: true,
    })

    let res = await wxRequest(api.getOrderByMoreMall, data)
    console.log("----getOrderByMoreMall:", res)

    //订单处理成功，则调用微信支付交易

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
    }

    // wx.navigateTo({
    //   url: '',
    // })
  },
  async getDefaultAddress() {
    let res = await wxRequest(api.getDefaultAddress, {
      openid: wx.getStorageSync('openid')
    })

    // console.log("getDefaultAddress...", res.data)

    let hasAddress = res.data.name == undefined ? false : true

    this.setData({
      address: res.data,
      hasAddress: hasAddress,
    })

    // console.log("dddddd", this.data.address.name == undefined)

  },
  selectAddress() {
    wx.navigateTo({
      url: '../ucenter/address/address'
    })
  },
  async paySuccess(){
    console.log("-----paySuccess-----")
    let pp = await wxRequest(api.paySuccessResult, {
      orderid: this.data.orderid,
      prepay_id: this.data.prepay_id
    })
    console.log("pp=---",pp)
  }


})
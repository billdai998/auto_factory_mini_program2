// pages/ucenter/order/order.js
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
    status: '',
    hasPay: false,
    hasMoreData: true,
    checkAddress: false,
    list: [],
    icon_uncheck: '/static/images/service/check_box.png',
    icon_checked: '/static/images/service/check_box_checked.png',
    amount_cn: formatMoney(0),
    amount: 0,
    pay_title: '去结算',
    isLoanding: false,
    out_trade_no: '',

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
    
    wx.setStorageSync('hasCheckAddress', false)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(e) {
    console.log("e", e)
    this.getOrderListByPage()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log("下拉动作")
    this.getOrderListByPage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log("上拉触底事件")
    this.getOrderListByPage()

  },

  handleChange({
    detail
  }) {
    console.log(" detail.ke", detail.key)
    let key = detail.key
    let hasPay = false
    let status = ''
    switch (key) {
      case 'tab1':
        status = ''
        break;
      case 'tab2':
        hasPay = this.data.list.length > 0 ? true : false
        status = 0
        break;
      case 'tab3':
        status = 1
        break;
      case 'tab4':
        status = 2
        break;
      case 'tab5':
        status = 5
        break;
    }
    this.setData({
      current: key,
      hasPay: hasPay,
      currentPage: 1,
      status: status,
      hasMoreData: true,
      amount: 0,
      amount_cn: formatMoney(0),
      list: []
    });

    this.getOrderListByPage()
  },

  async getOrderListByPage() {
    console.log("status:", this.data.status, )
    let data = {
      openid: wx.getStorageSync('openid'),
      status: this.data.status,
      page: this.data.currentPage
    }

    let res = await wxRequest(api.getOrderListByPage, data)
    console.log("getOrderListByPage111111", res)
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
    this.setData({
      spinShow: false,
    })

  },

  //选择待付款订单·
  selectItem(e) {
    let idx = e.currentTarget.dataset.idx
    let list = this.data.list
    let isChecked = list[idx].checked
    isChecked = isChecked == undefined ? false : isChecked
    console.log("isChecked", isChecked)
    let val = 'list[' + idx + '].checked'
    this.setData({
      [val]: !isChecked
    })
    list = []
    list = this.data.list
    let amount = 0
    list.forEach(item => {
      if (item.checked) {
        amount = amount + Number(item.all_amount)
      }
    })
    this.setData({
      amount: amount,
      amount_cn: formatMoney(amount)
    })
    console.log("amount",amount)
  },

  //makeBooking结算
  async makeBooking() {
    let that = this;
    let checkAddress = false
    let list = this.data.list
    let buyArray = []
    list.forEach(item => {

      if (item.checked) {
        buyArray.push(item.id)
        if (item.mall_type == 2) {
          checkAddress = true
        }
      }
    })

    this.setData({
      checkAddress: checkAddress
    })
    let hasCheckAddress = wx.getStorageSync("hasCheckAddress")
    //有实物商品+未检测地址
    // if (this.data.checkAddress && !hasCheckAddress){
    //   wx.navigateTo({
    //     url: '../address/address',
    //   })
    //   return;
    // }else{
    this.setData({
      isLoanding: true,
      // amount: 0,
      pay_title: '支付中',
    })

    $Toast({
      content: '支付中...',
      type: 'loading',
      duration: 0,
    });
 
    let payData = {
      orderIds: buyArray,
      amount: this.data.amount,
      openid: wx.getStorageSync('openid')
    }

    let res = await wxRequest(api.continuedPayment, payData)
    if (res.errno == 0) {
      this.setData({
        out_trade_no: res.data.out_trade_no,
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
            url: '../../payResult/payResult?status=true',
          })
        },
        fail(res) {
          console.log("res", res)
          $Message({
            content: '支付失败，请重新发起',
            type: 'error'
          });
          wx.navigateTo({
            url: '../../payResult/payResult?status=false',
          })
        }
      })
    } else {
      $Message({
        content: res.errmsg,
        type: 'error'
      });

      this.setData({
        isLoanding: fale,
        pay_title: '去结算',
      })
    }

    console.log("buyArray", buyArray)


    // }
  },
  async paySuccess() {
    console.log("-----paySuccess-----")
    let pp = await wxRequest(api.paySuccessResult, {
      out_trade_no: this.data.out_trade_no,
      prepay_id: this.data.prepay_id
    })
    console.log("pp=---", pp)
  },

  changeBooking(e){
    let id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: '/pages/bookTime/time?orderid=' + id +'&from=order',
    })

  },
  //服务评价
  commentData(e){
    let id = e.currentTarget.dataset.id
    let mallid = e.currentTarget.dataset.mallid
    wx.navigateTo({
      url: '../comment/comment?orderid=' + id + '&mallid=' + mallid,
    })

    // wx.navigateTo({
    //   url: '../rate/index?orderid=' + id + '&mallid=' + mallid,
    // })
  }

})
var app = getApp();
const api = require('../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits,
  formatMoney
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'
const moment = require('../../utils/moment.min.js')
const {
  $Toast
} = require('../../module/iview/dist/base/index');
const {
  $Message
} = require('../../module/iview/dist/base/index');


Page({
  data: {
    spinShow: true,
    id: 0,
    goods: {},
    images: [],
    openAttr: false,
    nums: 1,
    goodsCount: 0,
    myFormat: ['天', '时', '分', '秒'],
    targetTime: '',
    tmpTime: '',
    clearTimer: false,
    address: '',
    hasAddress: false,
    groupid: 0,
    orderid: 0,
    prepay_id: '',
    clearFlag: false,
    countDown: {
      day: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    member: {},
    initiator: 0, //接团发起人
    groupid:0,//拼团ID 团长
    initiatorMember: {},
    diffMan:0,
  },



  onLoad: async function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // console.log("time", new Date().getTime())
    // let targetTime = moment('2019-02-10 12:00:00', 'YYYY-MM-DD HH:mm:ss').valueOf()
    let id = options.id
    let initiator = options.initiator || 0
    let groupid = options.groupid || 0
    console.log("id=", id)
    console.log("initiator=", initiator)
    this.setData({
      id: id,
      initiator: initiator,
      groupid: groupid
      // targetTime: targetTime,
    })



    await this.getGoodsInfo();
    this.getDefaultAddress()

    this.getDiffTime();

    let member = await wxRequest(api.getMemberByOpenid, {
      openid: wx.getStorageSync("openid")
    })
    console.log("member", member)
    //如果没有系统信息，则跳到注册页面
    if(member.errno !=0){
      wx.showToast({
        title: '请您先注册！',
      })
      setTimeout(()=>{
        wx.switchTab({
          url: '/pages/ucenter/index/index',
        })
      },1000)
    }

    this.setData({
      member: member.data
    })

    this.getInitiatorById()

  },
  onReady: function() {
    // 页面渲染完成

    this.getCartCount();

  },
  onShow: function() {
    // 页面显示

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    console.log(this.data.goods.name)

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: "我在超级工厂发起了一个【" + this.data.goods.name + "】的拼团",
      imageUrl: this.data.images[0].url,
      path: '/pages/groupDetail/groupDetail?id=' + this.data.id + "&initiator=" + this.data.member.id
    }

  },

  //查询被邀请人
  async getInitiatorById() {
    let id = this.data.initiator
    if (id > 0) {
      let res = await wxRequest(api.getMemberById, {
        id: id
      })
      console.log("getInitiatorById", res)
      this.setData({
        initiatorMember: res.data
      })

      let diff = await wxRequest(api.getDiffGroupMan, {
        mallid: this.data.goods.id,
        initiator: this.data.initiator,
        min_membs: this.data.goods.min_membs
      })
      console.log("diff",diff)
      this.setData({
        diffMan:diff.data
      })
    }
  },
   

  getGoodsInfo: async function() {
    let that = this;



    let res = await wxRequest(api.getMallDetailById, {
      id: this.data.id
    })



    console.log("res", res)
    res.data.cn_price = formatMoney(res.data.price)
    res.data.cn_group_price = formatMoney(res.data.group_price)
    console.log("end_time", res.data.end_time)
    let targetTime = moment(res.data.end_time, 'YYYY-MM-DD HH:mm:ss').valueOf()

    console.log("targetTime111111", targetTime)
    this.setData({
      goods: res.data,
      images: res.data.images,
      spinShow: false,
    })

    console.log("tmpTime111111", this.data.tmpTime)

    this.getDiffTime(res.data.end_time)

  },

  getDiffTime(endDateTime) {
    let that = this;
    // console.log("endDateTime", endDateTime)
    // let endDateTime = '2019-01-05 12:00:00'


    let intervalId = setInterval(() => {
      let now = moment()
      let end = moment(endDateTime)
      let day = end.diff(now, 'days')
      let day2 = ('00' + day).substr(-2)
      end = moment(end).subtract(day2, 'days')

      let hours = end.diff(now, 'hours')
      // console.log("hours22222", hours)
      let hours2 = ('00' + hours).substr(-2)
      end = moment(end).subtract(hours2, 'hours')

      let minutes = end.diff(now, 'minutes')
      let minutes2 = ('00' + minutes).substr(-2)
      end = moment(end).subtract(minutes2, 'minutes')

      let seconds = end.diff(now, 'seconds')
      let seconds2 = ('00' + seconds).substr(-2)
      // console.log("----------getDiffTime--------")
      // console.log("day", day2)
      // console.log("hours", hours2)
      // console.log("minutes", minutes2)
      // console.log("seconds", seconds2)

      if ((day + hours + minutes + seconds) <= 0) {
        clearInterval(intervalId)
        day2 = '00'
        hours2 = '00'
        minutes2 = '00'
        seconds2 = '00'
      }

      //退出页面，关闭计时器
      if (that.data.clearFlag) {
        clearInterval(intervalId)
      }
      let countDown = {
        day: day2,
        hours: hours2,
        minutes: minutes2,
        seconds: seconds2,
      }
      that.setData({
        countDown: countDown
      })

    }, 1000)






  },



  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  addToCart: async function() {
    var that = this;

    this.setData({
      goodsCount: this.data.goodsCount + this.data.nums,
    })

    let data = {
      mallid: this.data.id,
      openid: wx.getStorageSync('openid'),
      nums: this.data.nums
    }
    let res = await wxRequest(api.addToCart, data)
    console.log("addToCart", res)


  },

  handleChangeNums: function({
    detail
  }) {
    this.setData({
      nums: detail.value
    })
  },

  //取得购物车总数
  getCartCount: async function() {
    let res = await wxRequest(api.getCartCount, {
      openid: wx.getStorageSync('openid')
    })
    console.log("getCartCount", res)
    if (res.errno == 0) {
      this.setData({
        goodsCount: res.data.counts
      })
    }
  },
  //打开购物车
  openCartPage: function() {
    console.log("openCartPage")
    wx.navigateTo({
      url: '../cart/cart',
    })
  },

  //直接购买
  buyNow: function() {
    if (!checkOpenidExits()) {
      $Message({
        content: '请先在[我的]界面进行授权确认！',
        type: 'error'
      });
      return;
    }
    let data = this.data.goods

    let mallid = this.data.goods.id
    let amount = Number(this.data.nums) * Number(this.data.goods.price)
    console.log("data", data)
    //如果是服务商品 则跳到预约页面 
    if (this.data.goods.type == 1) {
      wx.setStorageSync("amount", amount)
      wx.setStorageSync("mallid", mallid)
      wx.navigateTo({
        url: '/pages/bookTime/time?mallid=' + mallid,
      })
    }
    let goods = {
      // id:data.id,
      images: data.images,
      // img_url: this.data.images[0].url,
      mallid: data.id,
      memo: data.memo,
      name: data.name,
      nums: this.data.nums,
      price: data.price,
      status: 0

    }
    console.log("goods", goods)
    let array = []
    array.push(goods)
    wx.setStorageSync('cartList', array)
    wx.navigateTo({
      url: '../pay/pay',
    })

  },
  myLinsterner(e) {
    this.setData({
      status: '结束',
      clearTimer: true,
    });
  },
  async getDefaultAddress() {
    let res = await wxRequest(api.getDefaultAddress, {
      openid: wx.getStorageSync('openid')
    })

    // console.log("getDefaultAddress...", res.data)

    let hasAddress = res.data.name == undefined ? false : true

    this.setData({
      address: res.data.province_txt + res.data.city_txt + res.data.county_txt + res.data.detail,
      hasAddress: hasAddress,
    })

    // console.log("dddddd", this.data.address.name == undefined)

  },
  selectAddress() {
    wx.navigateTo({
      url: '../ucenter/address/address'
    })
  },

  goPingDan(){
    // if(this.data.initiator == this.data.member.id){
    //   $Message({
    //     content: '本人发起的团不能再次参与！',
    //     type: 'error'
    //   });
    //   return;
    // }
    this.addToGroup()
  },

  async addToGroup() {
    let that = this;
    let list = this.data.list
    let car = wx.getStorageSync("car")
    if (car.id == undefined) {
      $Message({
        content: '请完善我的车辆信息！',
        type: 'error'
      });
      return;
    }

    if ((!this.data.hasAddress) && (this.data.goods.type == 2)) {
      $Message({
        content: '请选择地址！',
        type: 'warning'
      });
      return;
    }
    let data = {
      openid: wx.getStorageSync('openid'),
      mallid: this.data.goods.id,
      nums: this.data.nums,
      price: this.data.goods.group_price,
      car: car,
      initiator: this.data.initiator,
      groupid:this.data.groupid,
      isleader:0,//此处显示非团长
    }
    let res = await wxRequest(api.addToGroup, data)
    console.log("addToGroup", res)
    if (res.errno != 0) {
      $Message({
        content: res.errmsg,
        type: 'error'
      });
    } else {
      //1-调用微信支付
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
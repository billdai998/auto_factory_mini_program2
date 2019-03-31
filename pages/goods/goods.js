var app = getApp();
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
  data: {
    spinShow: true,
    id: 0,
    goods: {},
    images: [],
    openAttr: false,
    nums: 1,
    goodsCount: 0,

  },



  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let id = options.id
    console.log("id=",id)
    this.setData({
      id: id
    })

  },
  onReady: function() {
    // 页面渲染完成
    this.getGoodsInfo();
    this.getCartCount();

  },
  onShow: function() {
    // 页面显示

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function (res) {
    console.log(this.data.goods.name)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.goods.name,
      imageUrl: this.data.images[0].url
    }

  },

  getGoodsInfo: async function() {
    let that = this;
    let car = wx.getStorageSync('car')
    let res = await wxRequest(api.getMallDetailById, {
      id: this.data.id,
      serialid: car.serialid
    })
    console.log("res", res)
    res.data.cn_price = formatMoney(res.data.price)
    this.setData({
      goods: res.data,
      images: res.data.images,
      spinShow: false,
    })


  },
  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart',
    });
  },
  addToCart: async function() {
    if (this.data.goods.price <= 0) {
      return false;
    }
    if (!checkOpenidExits()) {
      $Message({
        content: '请先在[我的]界面进行授权确认！',
        type: 'error'
      });
      return;
    }
   

    var that = this;

    this.setData({
      goodsCount: this.data.goodsCount + this.data.nums,
    })

    let data = {
      mallid: this.data.id,
      openid: wx.getStorageSync('openid'),
      nums:this.data.nums,
      price: this.data.goods.price,
    }
    let res = await wxRequest(api.addToCart,data)
    console.log("addToCart",res)
    if(res.errno !=0){
      $Message({
        content: res.errmsg,
        type: 'error'
      });
    }else{
      $Message({
        content: '添加成功！',
        type: 'success'
      });
    }


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
  openCartPage:function(){
    console.log("openCartPage")
    wx.navigateTo({
      url: '../cart/cart',
    })
  },

  //直接购买
  buyNow:function(){
    if (this.data.goods.price<=0){
      return false;
    }
    if (!checkOpenidExits()) {
      $Message({
        content: '请先在[我的]界面进行授权确认！',
        type: 'error'
      });
      return;
    }

    let mallid = this.data.goods.id
    let amount = Number(this.data.nums) * Number(this.data.goods.price)

//如果是服务商品  
    if (this.data.goods.type==1){
      wx.setStorageSync("amount", amount)
      wx.setStorageSync("mallid", mallid)
      wx.navigateTo({
        url: '/pages/bookTime/time?mallid=' + mallid,
      })
    }

    let data = this.data.goods
    let goods = {
      // id:data.id,
      images:data.images,
      img_url:this.data.images[0].url,
      mallid: data.id,
      memo:data.memo,
      name:data.name,
      nums:this.data.nums,
      price:data.price,
      status:0

    }
    console.log("goods", goods)
    let array = []
    array.push(goods)
    wx.setStorageSync('cartList', array)
    wx.navigateTo({
      url: '../pay/pay',
    })

  },

  goHomeTab(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }

})
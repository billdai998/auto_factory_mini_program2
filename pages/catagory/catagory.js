// pages/catagory/catagory.js
const api = require('../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits,
  formatMoney
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'

const {
  $Message
} = require('../../module/iview/dist/base/index');
const {
  $Toast
} = require('../../module/iview/dist/base/index');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    spinShow: true,
    icon_uncheck: '/static/images/service/check_box.png',
    icon_checked: '/static/images/service/selected.png',
    navList: [],
    contents: [],
    carInfo: [],
    currentCategoryId: 2,
    amoutn: 0.00,
    mallid: 0,

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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getCarInfo()
    this.getNavList();
    this.getServiceListByType()
  },
  getCarInfo: async function () {
    let openid = wx.getStorageSync('openid')
    if (openid != undefined && openid != '') {
      let res = await wxRequest(api.getDefaultCar, {
        openid: openid
      })

      let carInfo = res.data
      console.log("carInfo99999", carInfo)
      if (carInfo.id != undefined) {
        carInfo.name = carInfo.brand_name
        console.log("carInfo.serial", carInfo.serial)
        console.log("carInfo.name", carInfo.name)
        let isInclude = carInfo.serial.includes(carInfo.name)
        console.log("isInclude", isInclude)
        if (!isInclude) {
          carInfo.serial = carInfo.name + carInfo.serial
        }
        this.setData({
          carInfo: carInfo
        })
      }
      
    }
  },

  switchCate: function(e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      currentCategoryId: id
    })

    this.getServiceListByType()
  },
  selectItem: function(e) {
    console.log("---selectItem--")
    let idx = e.currentTarget.dataset.idx
    let id = e.currentTarget.dataset.id
    console.log("idx",idx)

    let hasChecked = this.data.contents[idx].checked

    let price = this.data.contents[idx].price

    if(Number(price)==0){
      return false;
    }

  
    let val = 'contents[' + idx + '].checked';
    this.setData({
      [val]: !hasChecked,
    })
 
    let amount = 0;
    for (const item of this.data.contents) {
      if (item.checked) {
      
        amount = Number(amount) + Number(item.price)

      }
    }
    console.log("amount", amount.toFixed(2))
    this.setData({
      amount: amount.toFixed(2),
    })

  },
  getNavList: async function() {
    let res = await wxRequest(api.getDictDetail, {
      code: 'service_type'
    })
    this.setData({
      navList: res.data
    })
    // console.log("res",res)
  },
  getServiceListByType: async function() {
    let car = wx.getStorageSync('car')
    console.log("car",car)
    let data = {
      type: this.data.currentCategoryId,
      serialid: car.serialid
    }
    let res = await wxRequest(api.getServiceListByType, data)
  
    this.setData({
      contents: res.data,
      spinShow: false,
      amount:0,
    })
    console.log("res", res)
  },

  //确认到店时间
  makeBooking: function() {
    let amount = this.data.amount
    let mallid = this.data.mallid
    // console.log("checkOpenidExits", checkOpenidExits());return;

    if (!checkOpenidExits()) {
      $Message({
        content: '请先在[我的]界面进行授权确认！',
        type: 'error'
      });
      return;
    }
  let mallInfo = []
    for (const item of this.data.contents) {
      if (item.checked) {
        console.log("item.logo", item.logo)
        let mall = {
          id:item.id,
          type:item.type,
          name:item.name,
          memo:item.memo,
          price:item.price,
          nums:1,
          img_url: item.logo.length == 0 ? '' : item.logo[0].url
        }

        mallInfo.push(mall)

      }
    }


    if (mallInfo.length == 0) {

      $Message({
        content: '请选择服务类型！',
        type: 'error'
      });
      return;
    }


    wx.setStorageSync("amount", amount)
    wx.setStorageSync("mallInfo", mallInfo)
    wx.navigateTo({
      url: '/pages/bookTime/time?mallid=' + mallid,
    })
  },
  addCar: function () {
    wx.navigateTo({
      url: '/pages/addCar/index/index?from=booking',
    })
  },

})
// pages/booking/booking.js
const api = require('../../utils/api.js')
import {
  wxRequest, 
  checkOpenidExits
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
    add_img: '/static/images/add.png',
    check_box_checked: '/static/images/service/selected.png',
    check_box: '/static/images/service/check_box.png',
    type: 1,
    carInfo: [],
    amount: '0',
    mallid: 0,
    itemData: [],

    services: [],

    contents: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let type = options.type
    console.log("type",type)
    this.setData({
      type: type
    })

    let exits = checkOpenidExits();
    console.log("exits==", exits)

    console.log("type:", type)
    
    
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

    this.getCarInfo();
    
    this.getNavList()
    this.getServiceListByType();

  },
  getCarInfo:async function() {
    let openid = wx.getStorageSync('openid')
    if (openid != undefined && openid != '') {
      let res = await wxRequest(api.getDefaultCar, {
        openid: openid
      })
      let carInfo = res.data
      console.log("carInfo99999", carInfo)
      if (carInfo.id != undefined) {
        carInfo.name = carInfo.brand_name
        carInfo.pic = carInfo.brand_pic
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
  addCar: function() { 
    wx.navigateTo({
      url: '/pages/addCar/index/index?from=booking',
    })
  },

  getType: function(e) {
    let type = e.currentTarget.dataset.type
    console.log("type:", type)
    this.setData({
      type: type
    })
    this.getServiceListByType();
  },

  selectItem: function (e) {
    console.log("---selectItem--")
    let idx = e.currentTarget.dataset.idx
    let id = e.currentTarget.dataset.id
    console.log("idx", idx)

    let hasChecked = this.data.contents[idx].checked

    let price = this.data.contents[idx].price

    if (Number(price) == 0) {
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

        // mallid = Number(item.id)
      }
    }
    console.log("amount", amount.toFixed(2))
    this.setData({
      amount: amount.toFixed(2),
      // mallid: mallid
    })

  },

  //显示子项
  showSubItem: function(e) {
    let idx = e.currentTarget.dataset.idx
    console.log("idx", idx)
    let hasOpen = this.data.contents[idx].hasOpen
    console.log("hasOpen", hasOpen)

    let val = 'contents[' + idx + '].hasOpen';

    this.setData({
      [val]: !hasOpen
    })

  },

  //确认到店时间
  makeBooking: function() {
    let amount = this.data.amount
    let mallid = this.data.mallid

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
        let mall = {
          id: item.id,
          type: item.type,
          name: item.name,
          memo: item.memo,
          price: item.price,
          nums: 1,
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

  getNavList: async function() {
    let res = await wxRequest(api.getDictDetail, {
      code: 'service_type'
    })
    let tmpData = res.data
    let outTmpData = []
    for (const item of tmpData) {
      // console.log("item", item.val)
      switch (Number(item.val)) {
        case 1:
          item.icon = '/static/images/icon_tp_wa.png'
          break;
        case 2:
          item.icon = '/static/images/wash_fine2.png'
          break;
        case 3:
          item.icon = '/static/images/icon_tp_mr.png'
          break;
        case 4:
          item.icon = '/static/images/icon_tp_ba.png'
          break;
        case 5:
          item.icon = '/static/images/icon_tp_ga.png'
          break;
      }
      if (Number(item.val) <=5){
        outTmpData.push(item)
      }
      
    }
    console.log("tmpData", outTmpData)
    this.setData({
      itemData: outTmpData
    })
    // console.log("res", res)
  },
  getServiceListByType: async function() {
    let car = wx.getStorageSync('car')
    console.log("car", car)
    let data = {
      type: this.data.type,
      serialid: car.serialid,
    }
    let res = await wxRequest(api.getServiceListByType, data)
    this.setData({
      contents: res.data,
      spinShow: false,
      amount: 0,
    })
    console.log("getServiceListByType", res)
  },

})
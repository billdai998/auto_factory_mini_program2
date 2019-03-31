// pages/addCar/index/index.js

const api = require('../../../utils/api.js')
import {
  wxRequest
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'

let carList = require('./carList')
const {
  $Message
} = require('../../../module/iview/dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showRight: false,
    showModal: false,
    bindAction: [{
      name: '确认绑定',
      color: '#2d8cf0',
    }],
    navFrom: '',
    carList: [],
    serialList: [],
    hot: [],
    allCar: [],
    words: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    numbers: ["渝", "京", "沪", "津", "冀", "豫", "云", "辽", "黑", "湘", "皖", "鲁", "新", "苏", "浙", "赣", "鄂", "桂", "甘", "晋", "蒙", "陕", "吉", "闽", "贵", "粤", "川", "青", "藏", "琼", "宁"],
    select_car_name: '',
    select_car_pic: '',
    select_serial_name: '',
    select_car_no: '',
    select_brandId:0,
    select_serialId:0,
    jian: '渝',
    car_no: '',
    isDefault:true,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let navFrom = options.from
    console.log("navFrom:", navFrom)
    console.log("carList:", carList)

    this.setData({
      navFrom: navFrom,
      carList: carList.list,
      hot: carList.list[0].brandHot
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
    // console.log("carList", this.carList)
    this.setData({
      car: wx.getStorageSync('car')
    })
  },


  getCarList: function() {
    console.log("getCarList")
    let that = this;
    wx.request({
      url: api.brandlistUrl,
      success(res) {
        console.log("res:", res.data)
        if (res.data.retcode == 0) {
          that.setData({
            hot: res.data.hot,
            carList: res.data.data
          })

        }
      }
    })

  },
  showSerialList: function(t) {
    let that = this;
    let id = t.currentTarget.dataset.id;
    let name = t.currentTarget.dataset.name;
    let pic = t.currentTarget.dataset.pic;
    this.setData({
      showRight: true,
      select_car_name: name,
      select_car_pic: pic,
    })
    console.log("id:", id, "|name:", name, "|pic:", pic)

    wx.request({
      url: api.serialListUrl,
      data: {
        brandid: id
      },
      success(res) {
        console.log("res:", res.data.data)
        that.setData({
          serialList: res.data.data
        })

      }
    })

  },
  toggleRight() {
    this.setData({
      showRight: !this.data.showRight
    });
  },

  selectSerialCar: function(t) {
    let serialName = t.currentTarget.dataset.name;
    let item = t.currentTarget.dataset.item
    console.log("serialName:", serialName)
    console.log("item:", item)

    this.setData({
      showRight: false,
      select_serial_name: serialName,
      select_brandId: item.brandId,
      select_serialId: item.serialId,
      showModal: true,
    })


  },
  getJian: function(t) {
    let jian = t.currentTarget.dataset.jian;
    console.log("jian", jian)
    this.setData({
      jian: jian
    })
  },
  finishClick: async function() {
    console.log("handleClick...")
    let jian = this.data.jian;
    let car_no = this.data.car_no;
    console.log("car_no:", car_no)
    if (car_no.length != 6 && car_no.length != 7) {
      $Message({
        content: '车牌号码长度不正确！',
        type: 'error'
      });
      return;
    }

    let str = jian + car_no;
    console.log("str", str)
    if (!this.isLicensePlate(str)) {
      $Message({
        content: '车牌号码不正确！',
        type: 'error'
      });
      return;
    } else {
      //处理正确
      let select = {
        name: this.data.select_car_name,
        pic: this.data.select_car_pic,
        serial: this.data.select_serial_name,
        serialid: this.data.select_serialId,
        no: str,
        checked: false,
      }
      let tmpList = []
      // tmpList = wx.getStorageSync('carList')
      console.log("select",select)
      tmpList.push(select)
      wx.setStorageSync('carList', tmpList)

      //提交后台处理
      let data = {
        openid:wx.getStorageSync("openid"),
        no:select.no,
        brand_name:select.name,
        brand_pic:select.pic,
        serial:select.serial,
        brandid:this.data.select_brandId,
        serialid:this.data.select_serialId
      }
      let res = await wxRequest(api.addCars,data)
      if (res.errno ==0 ){
        wx.setStorageSync('car', select)
      }
      


      wx.navigateBack({
        delta: 1
      })

    }

  },
  getCarNo: function(e) {
    console.log("getCarNo:", e.detail.value.toUpperCase())
    this.setData({
      car_no: e.detail.value.toUpperCase()
    })
  },

  // 正则验证车牌,验证通过返回true,不通过返回false
  isLicensePlate: function(str) {
    return /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(str);
  }


})
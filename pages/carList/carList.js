// pages/carList/carList.js
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
    list: [],
    select_icon: '/static/images/service/check_box.png',
    select_icon_checked: '/static/images/service/selected.png',
    selectIdx: 0,
    showDelDialog: false,
    delMsg: '',
    delIdx: '',
    car:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.checkCurrentCar();
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
    console.log("----carList onshow--------")
    this.getCarList();

    // this.checkCurrentCar();

  },

  addCar: function() {
    wx.navigateTo({
      url: '/pages/addCar/index/index?from=my',
    })
  },

  //取得汽车列表
  getCarList: async function() {
    console.log("------getCarList----")
    
    let that = this
    // let list = wx.getStorageSync('carList')
    let list = await wxRequest(api.getCarsByOpenid, {
      openid: wx.getStorageSync('openid')
    })
    console.log("list", list.data.length)
    that.setData({
      list: list.data,
    })
    if (list.data.length == 0) {
      wx.removeStorageSync('car')
    }
 

    this.checkCurrentCar();







  },

   
  //选择汽车
  selectCar: function(e) {
    let idx = e.currentTarget.dataset.idx;
    let old_idx = this.data.selectIdx
    let old_val = 'list[' + old_idx + '].isdefault'
    let now_val = 'list[' + idx + '].isdefault'
    let car = this.data.list[idx]

    this.setData({
      [old_val]: 0,
      [now_val]: 1,
      selectIdx: idx,
      car: car
    })
    wx.setStorageSync('car', car)
    console.log("car",car)

    this.setData({
      car:car
    })

    this.setDefaultCar();

    setTimeout(()=>{
      wx.navigateBack({
        delta:1
      })
    },1000)

  },

  //检查当前汽车
  checkCurrentCar: function() {
    console.log("-----checkCurrentCar-----")
    let that = this
    let car = wx.getStorageSync('car')
    let carList = this.data.list
    if (carList.length == 0) {
      let tmpList = []
      tmpList.push(car)
      carList = tmpList
    }
    let tmpList = []
    let tmpIdx = 0
    if (carList.length > 0) {
      carList.forEach((item, idx) => {
        console.log("item",item)
        if (item.isdefault ==1) {
            tmpIdx = idx
        } 
      })
    }

    this.setData({
      list: carList,
      selectIdx: tmpIdx
    })

    // wx.setStorageSync('carList', carList)



  },

  delCar: function(e) {
    console.log("---delCar---")
    let idx = e.currentTarget.dataset.idx
    let list = this.data.list;
    let delCar = this.data.list[idx]
    let car = wx.getStorageSync('car')
    console.log("delCar", delCar)
    let str = '请确认是否删除车牌号码为：' + delCar.no + '的数据？'
    this.setData({
      delMsg: str,
      showDelDialog: true,
      delIdx: idx
    })
  },

  handleDelCar: async function() {
    let list = this.data.list;
    let idx = this.data.delIdx
    let delCar = this.data.list[idx]
    let car = wx.getStorageSync('car')
    // console.log("delCar", delCar)
    let res = await wxRequest(api.deleteCarById,{id:delCar.id})
    if(res.errno ==0 ){
      list.splice(idx, 1)
      if (car.no == delCar.no) {
        wx.removeStorageSync('car')
        wx.setStorageSync('car', list[0])
      }
      this.setData({
        showDelDialog: false,
        list: list
      })
    }
    

    // wx.setStorageSync('carList', list)



  },
  handleDelCarCancel: function() {
    this.setData({
      showDelDialog: false,
    })
  },

  async setDefaultCar(){
    let car = this.data.car
    // console.log("car", car.id == undefined)
    if(car.id ==undefined){
      $Message({
        content: '请选择车辆！',
        type: 'error'
      });
      return;
    }
    let data = {
      id:car.id,
      openid:wx.getStorageSync('openid')
    }
    let res = await wxRequest(api.setDefaultCar, data)
    console.log("setDefaultCar,",res)
    if(res.errno ==0){
      $Message({
        content: '设置成功',
        type: 'success'
      });
      setTimeout(()=>{
        wx.navigateBack({
          delta:1,
        })
      },2000)
    }else{
      $Message({
        content: res.errmsg,
        type: 'error'
      });
    }
    
  }




})
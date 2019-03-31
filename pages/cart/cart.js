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
    spinShow: true,
    currentPage: 1,
    hasMoreData: true,
    list: [],
    tmpNums:0,
    counts:0,
    amount_cn: formatMoney(0),
    amount:0,
    no_car_img: '/static/images/noCar.png',
    icon_uncheck: '/static/images/service/check_box.png',
    icon_checked: '/static/images/service/check_box_checked.png',


    // visible2: false,
    // //小程序没有refs，所以只能用动态布尔值控制关闭
    // toggle: false,
    // toggle2: false,
    // actions2: [
    //   {
    //     name: '删除',
    //     color: '#ed3f14'
    //   }
    // ],
    // actions: [
    //   {
    //     name: '喜欢',
    //     color: '#fff',
    //     fontsize: '20',
    //     width: 100,
    //     icon: 'like',
    //     background: '#ed3f14'
    //   },
    //   {
    //     name: '返回',
    //     width: 100,
    //     color: '#80848f',
    //     fontsize: '20',
    //     icon: 'undo'
    //   }
    // ]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getCartListByPage()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("用户下拉动作")
    this.getCartListByPage()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("页面上拉触底事件")
    this.getCartListByPage()
  },

  getCartListByPage: async function () {
    let data = {
      page: this.data.currentPage,
      openid: wx.getStorageSync('openid')
    }
    let res = await wxRequest(api.getCartListByPage, data)
    console.log("res",res)
    let tmpArray = this.data.list
    if (res.data.data.length > 0) {

      for (const item of res.data.data){
        item.price_cn = formatMoney(item.price)
        item.showDelete = false
      }

 

      tmpArray.push.apply(tmpArray, res.data.data)
      console.log("tmpArray", tmpArray)
      this.setData({
        list: tmpArray,
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
  handleChangeNums:function({detail}){
    console.log(detail.value)
    this.setData({
      tmpNums: detail.value
    })
  },
  getIndex:function(e){
    let that = this
    console.log("index", e.currentTarget.dataset.idx)
    let idx = e.currentTarget.dataset.idx
    let list = this.data.list
    let checked = this.data.list[idx].checked
    console.log("checked", checked)
    for(const index in list){
      if(index == idx){
        let val = 'list[' + idx +'].nums' 
        that.setData({
          [val]: this.data.tmpNums
        })
      }
    }
    let amount = 0
    let counts = 0
    list.forEach(item => {
      console.log("item.checked", item.checked)
      if (item.checked) {
        amount = amount + (Number(item.nums) * Number(item.price))
        counts += Number(item.nums)
      }
    })

    let amount_cn = formatMoney(amount)
    that.setData({
      amount: amount,
      amount_cn: amount_cn,
      counts: counts
    })
  },
  selectItem:function(e){
    let that = this
    console.log("index", e.currentTarget.dataset.idx)
    let idx = e.currentTarget.dataset.idx
    let isChecked = this.data.list[idx].checked
    let list = this.data.list
    for (const index in list) {
      if (index == idx) {
        let val = 'list[' + idx + '].checked'
        that.setData({
          [val]: !isChecked
        })
      }
    }

    let amount = 0
    let counts=0
    list.forEach(item=>{
      console.log("item.checked", item.checked)
      if (item.checked){
        amount = amount+(  Number(item.nums) * Number(item.price))
        counts += Number(item.nums)
      }
    }) 

    let amount_cn = formatMoney(amount)
    that.setData({
      amount: amount,
      amount_cn: amount_cn,
      counts: counts
    })

  },
  makeBooking:function(){
    let list = this.data.list
    let tmpList = []
    list.forEach(item =>{
      if(item.checked){
        tmpList.push(item)
      }
    })
    // console.log("tmpList", tmpList)

    let checkArray = tmpList.map(res =>{
      return res.mall_type == '1'?true:false
    })

    // console.log("checkArray", checkArray)
    let hasService = checkArray.includes(true)
    // console.log("hasService", hasService)
    let hasNoService = checkArray.includes(false)
    // console.log("hasService", hasFalse)

    if (hasService && hasNoService){
      $Message({
        content: '服务商品与实物商品请分开结算！！！',
        type: 'error'
      });
      return;
    }

    wx.setStorageSync('cartList', tmpList)

    if (hasService && !hasNoService){
      console.log("服务商品")
      
      wx.navigateTo({
        url: '/pages/bookTime/time?mallid=1&from=cart' ,
      })
    }

    if (!hasService && hasNoService) {
      console.log("实物商品")
      wx.navigateTo({
        url: '../pay/pay',
      })
    }
    
    
  },
  showDeleteView(e){
    let idx = e.currentTarget.dataset.idx
    let val = 'list[' + idx +'].showDelete'
    this.setData({
      [val]: true
    })

  },
  hiddenDeleteView(e){
    let idx = e.currentTarget.dataset.idx
    let val = 'list[' + idx + '].showDelete'
    this.setData({
      [val]: false
    })
  },
  async deleteItem(e){
    let idx = e.currentTarget.dataset.idx
    let id = e.currentTarget.dataset.id
    let res = await wxRequest(api.deleteCartById,{id:id})
    console.log("res",res)
    if(res.errno ==0 ){
      let tmpList = this.data.list
      tmpList.splice(idx,1)
      this.setData({
        list:tmpList,
 
      })
    }
  },
  goHome(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }


})
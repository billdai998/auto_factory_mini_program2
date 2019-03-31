const api = require('../../../utils/api.js')
import {
  wxRequest
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'

const {
  $Message
} = require('../../../module/iview/dist/base/index');


Page({
  data: {
    addressList: [],
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.getAddressList();

  },
  async getAddressList() {
    let list = await wxRequest(api.getMemberAddress, {
      openid: wx.getStorageSync("openid")
    })
    console.log("getAddressList",list)
    if(list.data.length>0){
      this.setData({
        addressList:list.data
      })
    
      wx.setStorageSync('hasCheckAddress', true)
    }

  },
  addressAddOrUpdate(event) {
    console.log(event)
    wx.navigateTo({
      url: '/pages/ucenter/addressAdd/addressAdd?id=' + event.currentTarget.dataset.addressId
    })  
  },
  deleteAddress(event) {
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function(res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          let idx = event.target.dataset.idx
          let res = wxRequest(api.delAddressById, { id: addressId})
          that.getAddressList();
        }
      }
    })
    return false;

  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})
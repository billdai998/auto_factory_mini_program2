// pages/ucenter/contact/contact.js
const api = require('../../../utils/api.js')
import {
  wxRequest
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
    address: {
      name: '',
      mobile: '',
      detail:'',
      county_code:''
    },
    addressId: 0,
    openSelectRegion: false,
    provinceList: [],
    cityList: [],
    countyList: [],
    selectRegion: '',
    isLoading: false,
    cancelName:'取消'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.id) {
      this.setData({
        addressId: options.id
      });
      this.getAddressDetail();
    } else {
      this.getMemberInfo()
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getProvinceData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //取得用户基本信息
  async getMemberInfo() {
    let res = await wxRequest(api.getMemberByOpenid, {
      openid: wx.getStorageSync('openid')
    })
    console.log("res", res)
    let address = this.data.address
    address.name = res.data.name,
      address.mobile = res.data.mobile
    this.setData({
      address: address
    })
  },
  //取得地址详细信息
  async getAddressDetail() {
    let res = await wxRequest(api.getAddressDetailById, {
      id: this.data.addressId
    })
    let region = res.data.province_txt + '/' + res.data.city_txt + '/' + res.data.county_txt
    this.setData({
      address: res.data,
      selectRegion: region,
    })
  },

  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.mobile = event.detail.value;
    this.setData({
      address: address
    });
  },

  bindinputAddress(event) {
    let address = this.data.address;
    address.detail = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault() {
    let address = this.data.address;
    address.isdefault = !address.isdefault;
    this.setData({
      address: address
    });
  },

  chooseRegion() {
    this.setData({
      openSelectRegion: !this.data.openSelectRegion
    })
  },
  cancelSelectRegion() {
    this.setData({
      openSelectRegion: !this.data.openSelectRegion
    })
  },

  //取得省的数据
  async getProvinceData() {
    let res = await wxRequest(api.getProvinceData)
    console.log("getProvinceData", res)
    this.setData({
      provinceList: res.data
    })
  },
  selectProvince(e) {
    let item = e.currentTarget.dataset.item
    console.log("item", item)
    let address = this.data.address
    address.province_code = item.code
    address.province_txt = item.name

    address.city_code = ''
    address.city_txt = ''
    address.county_code = ''
    address.county_txt = ''
    this.setData({
      address: address,
      countyList: []
    })
    this.getCityData();
  },
  //取得市的数据
  async getCityData() {
    let res = await wxRequest(api.getCityData, {
      code: this.data.address.province_code
    })
    console.log("getCityData", res)
    this.setData({
      cityList: res.data
    })
  },
  selectCity(e) {
    let item = e.currentTarget.dataset.item
    console.log("item", item)
    let address = this.data.address
    address.city_code = item.code
    if ((item.name == '市辖区') || (item.name == '县')){
      address.city_txt = ''
    }else{
      address.city_txt = item.name
    }
    
    address.county_code = ''
    address.county_txt = ''
    this.setData({
      address: address,

    })
    this.getCountyData()
  },
  //取得区的数据
  async getCountyData() {
    let res = await wxRequest(api.getDistrictData, {
      code: this.data.address.city_code
    })
    console.log("getCityData", res)
    this.setData({
      countyList: res.data
    })
  },
  selectCounty(e) {
    let item = e.currentTarget.dataset.item
    console.log("item", item)
    let address = this.data.address
    address.county_code = item.code
    address.county_txt = item.name
    this.setData({
      address: address
    })
  },

  doneSelectRegion() {
    let region = this.data.address.province_txt + '/' + this.data.address.city_txt + '/' + this.data.address.county_txt
    // console.log("region", region)
    this.setData({
      selectRegion: region,
      openSelectRegion: !this.data.openSelectRegion
    })
  },
  cancelAddress() {
    wx.navigateBack({
      delta: 1
    })
  },
  async saveAddress() {
    let address = this.data.address
    address.openid = wx.getStorageSync('openid')
    if ((address.detail == "") || (address.county_code =="")) {

      $Message({
        content: '请输入详细地址',
        type: 'warning'
      });
      return;
    }
    this.setData({
      isLoading:true,
    })
    let res = await wxRequest(api.updateThenMemberAdd, address)
    console.log(res)
    if (res.errno==0){
      $Message({
        content: '提交成功',
        type: 'success'
      });
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        })
      },2000)
      this.setData({
        cancelName:'返回'
      })
    }
  }



})
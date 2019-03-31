// pages/ucenter/index/index.js
const api = require('../../../utils/api.js')
import {
  wxRequest,
  checkOpenidExits
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'

const {
  $Message
} = require('../../../module/iview/dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    add_img: '/static/images/add.png',
    hasUser: false,
    carInfo: [],
    carList: [],
    car: {},
    userInfo: {},
    visible: false,
    openid: '',
    name: '',
    mobile: '',
    code: '',
    score: 0,
    canSendFlag: false,
    verName: '取验证码',
    my_item: [{
        id: 1,
        name: '我的订单',
        img: '/static/images/icon_order.png',
        url: '/pages/ucenter/order/order',
        desc: '详细信息'
      },
      {
        id: 2,
        name: '我的拼团',
        img: '/static/images/icon_group.png',
        url: '/pages/ucenter/group/group',
        desc: '详细信息'
      },
      {
        id: 5,
        name: '我的优惠券',
        img: '/static/images/coupon.png',
        url: '/pages/ucenter/coupon/coupon',
        desc: '详细信息'
      },
      {
        id: 3,
        name: '购物车',
        img: '/static/images/icon_cart.png',
        url: '/pages/cart/cart',
        desc: '详细信息'
      },
      {
        id: 4,
        name: '地址管理',
        img: '/static/images/icon_address.png',
        url: '/pages/ucenter/address/address',
        desc: '详细信息'
      },
      {
        id: 5,
        name: '我的爱车',
        img: '/static/images/icon_mycar.png',
        url: '/pages/carList/carList',
        desc: '详细信息'
      },
      
    ]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("my----")
    let check = checkOpenidExits();
    console.log("check=", check)
    this.setData({
      hasUser: check
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
    console.log("---my---show", checkOpenidExits())
    this.checkUserInfo();
    if (checkOpenidExits()) {
      this.getCarInfo();
    }

    this.setData({
      car: wx.getStorageSync("car")
    })

  },


  getCarInfo: async function() {
    let openid = wx.getStorageSync('openid')
    if (openid != undefined && openid != '') {
      let res = await wxRequest(api.getCarsByOpenid, {
        openid: openid
      })
      console.log("res", res)
      let car = wx.getStorageSync("car")
      let tmpData = res.data
      //把默认的放在第一个
      for (let idx in tmpData){
        if (tmpData[idx].no == car.no){
          tmpData.splice(idx,1)
          tmpData.unshift(car)
        }
      }
      this.setData({
        carList: tmpData
      })
    }


  },
  getNav: function(e) {
    let id = e.currentTarget.dataset.id
    let url = ''
    console.log(id);
    switch (id) {
      case 1:
        url = '/pages/ucenter/order/order'
        break;
      case 2:
        url = '/pages/ucenter/score/score'
        break;
      case 3:
        url = '/pages/cart/cart'
        break;


    }

    wx.navigateTo({
      url: url,
    })
  },
  selectCar: function(e) {
    let car = e.currentTarget.dataset.car;
    console.log("selectCar", car)
    wx.setStorageSync("car", car)
    this.setData({
      car: car
    })
  },

  checkUserInfo: function() {
    let that = this;
    wx.getSetting({
      success(res) {
        console.log("scope.userInfo", res.authSetting['scope.userInfo'])
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
              that.setData({
                userInfo: res.userInfo,
                hasUser:true
              })
              that.login();
              //用户已经授权过
            }
          })
        }

      }
    })





  },

  login: async function() {
    let that = this

    wx.login({
      success(res) {
        if (res.code) {
          // 发起网络请求
          console.log("login", res)
          that.getCode2Session(res.code)

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  getCode2Session: async function(code) {
    console.log("getCode2Session,userInfo", this.data.userInfo)
    let res = await wxRequest(api.loginByWeixin, {
      code: code,
      userInfo: this.data.userInfo
    })
    console.log("getCode2Session", res)
    if (res.errno == 0) {
      //保存用户openid
      wx.setStorageSync('openid', res.data.openid)
      this.setData({
        openid: res.data.openid,
        visible: !res.data.hasRecord
      })
      //如果有用户数据
      if (res.data.user.id != undefined) {
        this.setData({
          mobile: res.data.user.mobile,
          score: res.data.user.score || 0,
          visible: false,
        })
      }

    } else {
      $Message({
        content: '登录失败！',
        type: 'error'
      });
    }
  },

  bindGetUserInfo: function(e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      this.setData({
        userInfo: userInfo
      })
    } else {
      //用户按了拒绝按钮
      $Message({
        content: '您拒绝了授权，您可能无法查询相关数据！',
        type: 'error'
      });
    }
  },
  handleClose: function() {
    $Message({
      content: '请输入您的姓名与手机号码，以便于更好的服务！',
      type: 'error',
      duration: 5
    });
    // this.setData({
    //   visible: false,
    // })
  },
  handleSubmit: async function() {
    let openid = this.data.openid
    let name = this.data.userInfo.nickName
    let mobile = this.data.mobile
    let code = this.data.code
    // if(name ==''){
    //   $Message({
    //     content: '请输入您的姓名',
    //     type: 'error'
    //   });
    //   return false;
    // }
    if (mobile == '') {
      $Message({
        content: '请输入您的手机号码',
        type: 'error'
      });
      return false;
    }
    if (code == '') {
      $Message({
        content: '请输入验证码！',
        type: 'error'
      });
      return false;
    }
    console.log("------userInfo----", this.data.userInfo)
    let user = this.data.userInfo
    user.openid = this.data.openid
    user.name = name
    user.mobile = this.data.mobile
    user.code = this.data.code
    let data = {
      user: user
    }

    console.log("updateMemberInfo",data)

    let res = await wxRequest(api.updateMemberInfo, data)
    if (res.errno == 0) {
      $Message({
        content: '提交完成，请录入车辆信息',
        // type: 'success'
      });
      this.setData({
        visible: false,
      })
    } else {
      $Message({
        content: res.errmsg,
        type: 'error'
      });
      return false;
    }


  },
  getName: function(e) {
    console.log(e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  getPhone: function(e) {
    console.log("length=", e.detail.value.length)
    if (e.detail.value.length == 11) {
      this.setData({
        mobile: e.detail.value,
        canSendFlag: true,
      })
    } else {
      this.setData({
        canSendFlag: false,
      })
    }

  },
  getVercode: function(e) {
    console.log(e.detail.value)
    this.setData({
      code: e.detail.value
    })
  },
  async getSmsCode() {
    // this.countTimes()
    if (this.data.canSendFlag) {
      let data = {
        mobile: this.data.mobile
      }
      let res = await wxRequest(api.getVerCode, data)
      if (res.errno == 0) {
        $Message({
          content: '已下发手机短信，请注意查收！',
          type: 'success'
        });
        this.countTimes()
      }
    }

  },
  //倒计时
  countTimes() {
    let that = this
    let i = 60;
    let it = setInterval(() => {
      i--;
      that.setData({
        canSendFlag: false,
        verName: '取验证码(' + i + ')'
      })
      console.log("i=", i)
      if (i <= 0) {
        clearInterval(it)
        that.setData({
          canSendFlag: true,
          verName: '取验证码'
        })
      }
    }, 1000)


  },
  addCars: function() {
    let openid = wx.getStorageSync("openid")
    if (!checkOpenidExits()) {
      $Message({
        content: '请先授权取得用户信息！',
        type: 'error'
      });
      return false;
    }
    wx.navigateTo({
      url: "/pages/addCar/index/index?from=my"
    })
  }


})
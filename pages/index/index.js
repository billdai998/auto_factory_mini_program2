const api = require('../../utils/api.js')
import {
  wxRequest
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'
const {
  $Message
} = require('../../module/iview/dist/base/index');
const app = getApp()

Page({
  data: {
    spinShow:true,
    itemData: [],
    group_img: '/static/images/group.png',
    answer_img: '/static/images/answer.png',
    isGroup: 0,
    mallData: {},
    adData: {},
    bannerList: [],
    showUserInfo: false,
    showInputUser: false,
    userInfo: {},
    openid: '',
    name: '',
    mobile: '',
    code: '',
    score: 0,
    canSendFlag: false,
    verName: '取验证码',
  },

  //事件处理函数
  bindViewTap: function () {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getAuthSetting()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getOrgAndPartner()
    this.getIndexMallByPage()
    this.getItemData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getItemData: async function () {
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
      if (Number(item.val) <= 5) {
        outTmpData.push(item)
      }

    }
    console.log("tmpData", outTmpData)
    this.setData({
      itemData: outTmpData
    })
    console.log("itemData", outTmpData)
  },


  getNav: function (e) {
    let item = e.currentTarget.dataset.item
    // console.log("item", item)
    let lt = item.lt.split(',')
    let latitude = lt[0];
    let longitude = lt[1];
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: item.name,
      address: item.address
    })
  },

  getOrgAndPartner: async function () {
    let res = await wxRequest(api.getOrgAndPartner, {})
    console.log("res", res)
    this.setData({
      orgs: res.data.org,
      partner: res.data.partner
    })
  },
  async getIndexMallByPage() {
    let res = await wxRequest(api.getIndexMallByPage, {})
    console.log("res", res)
    console.log("res", res.data.isGroup)
    this.setData({
      isGroup: res.data.isGroup,
      mallData: res.data.mallList,
      adData: res.data.adList,
      bannerList: res.data.bannerList,
      spinShow:false,
    })
  },
  getBannerItem: function (e) {
    let item = e.currentTarget.dataset.item
    console.log("item", item)
    console.log("id=", item.id)
    let url = '/pages/goods/goods?id=' + item.id
    if (item.is_group == 1) {
      url = '/pages/groupList/groupList'
    }
    wx.navigateTo({
      url: url,
    })
  },

  //取得用户权限
  getAuthSetting() {
    console.log("getAuthSetting")
    wx.getSetting({
      success(res) {
        // console.log(res.authSetting)
        // console.log(res.authSetting['scope.userInfo'])
        let showUserInfo = res.authSetting['scope.userInfo'] == true ? true : false
        console.log("showUserInfo", showUserInfo)
        if (!showUserInfo) {
          wx.hideTabBar()
        }

      }
    })

  },
  bindGetUserInfo: function (e) {
    console.log("bindGetUserInfo", e)
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      this.setData({
        userInfo: userInfo,
        showUserInfo: true,
        showInputUser: true,
      })
    } else {
      //用户按了拒绝按钮
      $Message({
        content: '您拒绝了授权，您可能无法查询相关数据！',
        type: 'error'
      });
      this.setData({
        hasUserInfo: !this.data.hasUserInfo
      })
      wx.showTabBar()
    }

  },

  handleClose: function () {
    $Message({
      content: '请输入您的姓名与手机号码，以便于更好的服务！',
      type: 'error',
      duration: 5
    });
    // this.setData({
    //   visible: false,
    // })
  },
  handleSubmit: async function () {
    let openid = this.data.openid
    let name = this.data.name
    let mobile = this.data.mobile
    let code = this.data.code
    if (name == '') {
      $Message({
        content: '请输入您的姓名',
        type: 'error'
      });
      return false;
    }
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
    let user = this.data.userInfo
    user.openid = this.data.openid
    user.name = this.data.name
    user.mobile = this.data.mobile
    user.code = this.data.code
    let data = {
      user: user
    }

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
  getName: function (e) {
    console.log(e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  getPhone: function (e) {
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
  getVercode: function (e) {
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


})
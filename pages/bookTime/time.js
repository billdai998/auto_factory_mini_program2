// pages/bookTime/time.js
const api = require('../../utils/api.js')
import {
  wxRequest
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'

const moment = require('../../utils/moment.min.js');
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
    addr_icon: '/static/images/service/addr.png',
    phone_icon: '/static/images/service/phone.png',
    selected_icon: '/static/images/service/selected.png',
    days: [],
    times: [{
        time: '9:00',
        hasOver: false,
        check: false
      },
      {
        time: '9:30',
        hasOver: false,
        check: false
      },
      {
        time: '10:00',
        hasOver: false,
        check: false
      },
      {
        time: '10:30',
        hasOver: false,
        check: false
      },
      {
        time: '11:00',
        hasOver: false,
        check: false
      },
      {
        time: '11:30',
        hasOver: false,
        check: false
      },
      {
        time: '12:00',
        hasOver: false,
        check: false
      },
      {
        time: '12:30',
        hasOver: false,
        check: false
      },
      {
        time: '13:00',
        hasOver: false,
        check: false
      },
      {
        time: '13:30',
        hasOver: false,
        check: false
      },
      {
        time: '14:00',
        hasOver: false,
        check: false
      },
      {
        time: '14:30',
        hasOver: false,
        check: false
      },
      {
        time: '15:00',
        hasOver: false,
        check: false
      },
      {
        time: '15:30',
        hasOver: false,
        check: false
      },
      {
        time: '16:00',
        hasOver: false,
        check: false
      },
      {
        time: '16:30',
        hasOver: false,
        check: false
      },
      {
        time: '17:00',
        hasOver: false,
        check: false
      },
      {
        time: '17:30',
        hasOver: false,
        check: false
      },
      {
        time: '18:00',
        hasOver: false,
        check: false
      },
      {
        time: '18:30',
        hasOver: false,
        check: false
      },
      {
        time: '19:00',
        hasOver: false,
        check: false
      },
      {
        time: '到店等待',
        hasOver: false,
        check: false
      },
    ],
    time_len: 0,
    // wait:'到店等待',
    nowHour: '0',
    checkIdx: 0,
    checkDay: '',
    checkWeek: '',
    checkTimeIdx: 0,
    checkTime: '',
    mallid: 0,
    amount: 0,
    fromPage: '',
    orderId: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let mallid = options.mallid || 0
    let fromPage = options.from || ''
    let orderId = options.orderid || 0
    console.log("fromPage", fromPage)
    console.log('orderId', orderId)
    this.getDays();
    this.setData({
      time_len: Number(this.data.times.length) - 1,
      mallid: mallid,
      amount: wx.getStorageSync("amount"),
      fromPage: fromPage,
      orderId: orderId,
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

  },

  btnMakeSure: async function() {
    console.log('btnMakeSure---')
    let bookingDate = this.data.checkDay;
    let bookingTime = this.data.checkTime;
    let bookingWeek = this.data.checkWeek;
    console.log("bookingDate", bookingDate, " bookingWeek", bookingWeek)
    if (bookingTime == '') {
      $Message({
        content: '请选择预约时间！',
        type: 'error'
      });

      return;
    }

    // wx.setStorageSync('bookingTime', bookingTime)
    // wx.setStorageSync('bookingDate', bookingDate )
    wx.setStorage({
      key: 'booking',
      data: {
        bookingDate: bookingDate,
        bookingTime: bookingTime,
        bookingWeek: bookingWeek,
        mallid: this.data.mallid,
        amount: wx.getStorageSync("amount")
      },
    })

    if (this.data.fromPage == 'order') {
      console.log("来自订单预约修改")
      let data = {
        id: this.data.orderId,
        book_date: moment(bookingDate,'MM-DD').format('YYYY-MM-DD'),
        book_time: bookingTime,
        openid: wx.getStorageSync('openid')
      }
      let res = await wxRequest(api.uptServiceOrderTime, data)
      if (res.errno == 0) {
        $Message({
          content: '预约成功！',
          type: 'success'
        }); 
        setTimeout(()=>{
          wx.switchTab({
            url: '/pages/ucenter/index/index'
          })
        },3000)
      }else{
        $Message({
          content: res.errmsg,
          type: 'error'
        }); 
      }
      return;
    }

    wx.navigateTo({
      url: '/pages/bookDetail/bookDetail?from=' + this.data.fromPage,
    })


  },
  setNav: function() {
    let latitude = '29.507580';
    let longitude = '106.449240';
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: "重庆简索汽车",
      address: '重庆市九龙坡区创业大道123号1层'
    })
  },
  callPhone: function() {
    wx.makePhoneCall({
      phoneNumber: '15310253555'
    })
  },
  getDays: function() {
    //只预约四天数据
    let days = [{
        date: moment().format('MM-DD'),
        week: '今天'
      },
      {
        date: moment().add(1, 'd').format('MM-DD'),
        week: this.chgNumToChn(moment().add(1, 'd').format('d'))
      },
      {
        date: moment().add(2, 'd').format('MM-DD'),
        week: this.chgNumToChn(moment().add(2, 'd').format('d'))
      },
      {
        date: moment().add(3, 'd').format('MM-DD'),
        week: this.chgNumToChn(moment().add(3, 'd').format('d'))
      },
    ]

    // console.log("11112",moment().add(3, 'd').format('d'))

    console.log("dates", days)

    this.setData({
      days: days,
      nowHour: moment().format('HH:mm'),
      checkDay: moment().format('MM-DD'),
      checkWeek: '今天'
    })


    //调用检查时间
    this.checkTimeIsOut();

  },

  //1-7转中文 
  chgNumToChn: function(num) {
    let weeks = ['天', '一', '二', '三', '四', '五', '六']
    let idx = Number(num);
    return '周' + weeks[idx];
  },
  //选择日期
  selectDay: function(e) {
    let idx = e.currentTarget.dataset.idx;
    let day = this.data.days[idx].date
    let week = this.data.days[idx].week
    console.log("week:", week)
    this.setData({
      checkIdx: idx,
      checkDay: day,
      checkWeek: week,
    })

    this.checkTimeIsOut();
  },
  //选择时间
  selectTime: function(e) {
    let current_idx = e.currentTarget.dataset.idx;
    let parent_idx = this.data.checkTimeIdx

    console.log("current_idx", current_idx)
    console.log("parent_idx", parent_idx)

    let checked = this.data.times[current_idx].check
    let hasOver = this.data.times[current_idx].hasOver
    let time = this.data.times[current_idx].time

    //要先清除之前的数据
    if (!hasOver) {

      let parent_val = 'times[' + parent_idx + '].check'
      this.setData({
        [parent_val]: false,
      })

      let val = 'times[' + current_idx + '].check'
      this.setData({
        [val]: !hasOver,
        checkTime: time,
        checkTimeIdx: current_idx,
      })
    }
  },

  //检查时间是否超出前时间
  checkTimeIsOut: function() {
    let that = this
    let times = this.data.times;
    let checkDay = this.data.checkDay
    let today = moment().format('MM-DD')

    let a = moment(today, "MM-DD");
    let b = moment(checkDay, "MM-DD");;
    let out = a.diff(b, 'days')
    console.log("out:", out)

    //重置时间
    this.resetTimes();

    //只匹配当天数据
    if (out == 0) {
      console.log("当天...")
      let nowHour = moment().format('HH:mm');
      let now = moment(nowHour, "HH:mm");
      // console.log("nowHour:",nowHour,"now:",now)
      times.forEach((item, idx) => {
        //如果超过19点则不接受预约
        if (item.time == '到店等待') {
          item.time = '19:00'
        }
        let tmpTime = moment(item.time, "HH:mm");
        let diffTime = tmpTime.diff(now, 'minutes')
        // console.log("time:", item.time, "tmpTime:", tmpTime)
        // console.log("diffTime:", diffTime)
        //提前30分才可预约
        if (diffTime >= 30) {
          // console.log("可预约....")
        } else {
          // console.log("不可预约....")
          let over = 'times[' + idx + '].hasOver'
          that.setData({
            [over]: true,
          })
        }



      })

      // console.log("times:",this.data.times)

    }

  },

  //重置日期
  resetTimes: function() {
    let template = [{
        time: '9:00',
        hasOver: false,
        check: false
      },
      {
        time: '9:30',
        hasOver: false,
        check: false
      },
      {
        time: '10:00',
        hasOver: false,
        check: false
      },
      {
        time: '10:30',
        hasOver: false,
        check: false
      },
      {
        time: '11:00',
        hasOver: false,
        check: false
      },
      {
        time: '11:30',
        hasOver: false,
        check: false
      },
      {
        time: '12:00',
        hasOver: false,
        check: false
      },
      {
        time: '12:30',
        hasOver: false,
        check: false
      },
      {
        time: '13:00',
        hasOver: false,
        check: false
      },
      {
        time: '13:30',
        hasOver: false,
        check: false
      },
      {
        time: '14:00',
        hasOver: false,
        check: false
      },
      {
        time: '14:30',
        hasOver: false,
        check: false
      },
      {
        time: '15:00',
        hasOver: false,
        check: false
      },
      {
        time: '15:30',
        hasOver: false,
        check: false
      },
      {
        time: '16:00',
        hasOver: false,
        check: false
      },
      {
        time: '16:30',
        hasOver: false,
        check: false
      },
      {
        time: '17:00',
        hasOver: false,
        check: false
      },
      {
        time: '17:30',
        hasOver: false,
        check: false
      },
      {
        time: '18:00',
        hasOver: false,
        check: false
      },
      {
        time: '18:30',
        hasOver: false,
        check: false
      },
      {
        time: '19:00',
        hasOver: false,
        check: false
      },
      {
        time: '到店等待',
        hasOver: false,
        check: false
      },
    ]
    // console.log("template", template)
    this.setData({
      times: template,
      checkTimeIdx: 0,
      checkTime: '',
    })
  }

})
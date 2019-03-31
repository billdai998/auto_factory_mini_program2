// pages/ucenter/checkReport/report.js
const api = require('../../../utils/api.js')
import {
  wxRequest
} from '../../../utils/util.js'
import regeneratorRuntime from '../../../utils/runtime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:'状态良好',
    check:{},
    icon_check:'/static/images/icon_check.png',
    checkResult: [],
    checkImgs:[],
    current: 'tab1',
    orderid:0,
    videoList:[{},{}],
    id:0,
    videoId:'',
    checkText:'',
    showCheckText:false,
    showImg:false,
    showImgUrl:'',
    closeImg:'/static/images/error-sign.png',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let check = {
      date: options.date, 
      km: options.km, 
      addr: options.addr
    }
    this.setData({
      id: options.id,
      check: check,
      orderid: options.orderid,
    })
    this.getCarInfo();

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
    this.getCheckDetail()
    this.getVideoFile();
  },
  getCarInfo: function () {
    let that = this;
    wx.getStorage({
      key: 'car',
      success: function (res) {
        console.log("res", res.data)

        that.setData({
          carInfo: res.data,
        })
      },
    })
  },

  showDetail:function(e){
    let idx = e.currentTarget.dataset.idx;
    let appealFlag = this.data.checkResult[idx].appealFlag
    let val = 'checkResult[' + idx +'].appealFlag'
    this.setData({
      [val]: !appealFlag
    })
  },

  showImgFunc(e){
    let url = e.currentTarget.dataset.url
    this.setData({
      showImg:true,
      showImgUrl:url,
    })
  },

  closeImg(){
    this.setData({
      showImg: false,
    })
  },

  //取得明细
  async getCheckDetail() {
 
 
    let res = await wxRequest(api.getCheckDetail, {id:this.data.id})
    console.log("getCheckDetail", res)
    if (res.data.check_result != undefined){
      this.setData({
        checkResult: res.data.check_result,
        checkImgs:res.data.imgs,
      })
    }
    

  },
  checkChange({
    detail
  }) {
    this.setData({
      current: detail.key
    });
  },
  
  videoPlay(e){
    let videoId = e.currentTarget.dataset.id
 
    if (this.data.videoId != ''){
      console.log(".data.videoId", this.data.videoId)

      var videoContextPrev = wx.createVideoContext(this.data.videoId)
      console.log("videoContextPrev",videoContextPrev)
      videoContextPrev.stop();
      

      setTimeout(function () {
        //将点击视频进行播放
        var videoContext = wx.createVideoContext(videoId)
        console.log("videoContext", videoContext)
        videoContext.play();
      }, 500)


    }
    this.setData({
      videoId: videoId
    });
  },
 async  getVideoFile(){
   let res = await wxRequest(api.getMemberVideo,{orderid:this.data.orderid})
   console.log("res",res)
   this.setData({
     videoList:res.data
   })
  },
  showCheckTxt(e){
    let flag = e.currentTarget.dataset.flag
    let txt = e.currentTarget.dataset.txt
    console.log("flag",flag)
    console.log("txt",txt)
    if(flag ==1){
      this.setData({
        showCheckText: true,
        checkText: txt,
      })
    }
    
  },
  handleClose(){
    this.setData({
      showCheckText:false,
    })
  }

})
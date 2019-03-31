// pages/question/question.js
const api = require('../../utils/api.js')
import {
  wxRequest
} from '../../utils/util.js'
import regeneratorRuntime from '../../utils/runtime.js'



Page({

  /**
   * 页面的初始数据
   */
  data: {
    check_box_checked: '/static/images/service/check_box_checked.png',
    check_box: '/static/images/service/check_box.png',
    list: [],
    idx: 0,
    item: {},
    userInfo: {},
    animationTitleData: {},
    animationItemData: {},
    hiddenTitle: false,
    hiddenItem: false,
    rightArray: [],
    isEnd:false,
    type:0, //等级
    prize:{},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("type", options.type)
    this.setData({
      type:options.type
    })
    this.getUserInfo()
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
    this.getQuestion()
    let that = this
    // that.setAnimationTitleOut()

    let animationTitle = wx.createAnimation({
      //持续时间800ms
      duration: 100,
      timingFunction: 'ease',
    });
    console.log("animationTitle", animationTitle)
    animationTitle.scale(0).step().opacity(0).step()
    this.setData({
      animationTitleData: animationTitle.export()
    })

    that.setAnimationItemOut();

    setTimeout(() => {

      that.setAnimationTitleIn()
    }, 1000)

    setTimeout(() => {

      that.setAnimationItemIn()
    }, 2000)

  },


  async getQuestion() {
    let list = await wxRequest(api.getQuestion,{type:this.data.type})
    console.log("list", list)
    let item = list.data[0]
    console.log("item", item)
    item.checked = false
    item.wrong = false
    this.setData({
      list: list.data,
      item: item
    })
    console.log("item=", this.data.item)
    let that = this


  },

  async getUserInfo() {
    let openid = wx.getStorageSync('openid')
    let res = await wxRequest(api.getMemberByOpenid, {
      openid: openid
    })
    console.log("res", res)
    this.setData({
      userInfo: res.data
    })
  },

  setAnimationTitleOut() {

    let animationTitle = wx.createAnimation({
      //持续时间800ms
      duration: 800,
      timingFunction: 'ease',
    });
    console.log("animationTitle", animationTitle)
    animationTitle.scale(0).step({
      duration: 800
    }).opacity(0).step()
    this.setData({
      animationTitleData: animationTitle.export()
    })
  },

  setAnimationTitleIn() {

    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 500,
      timingFunction: 'linear',
    });
    // animation.opacity(0).step()
    animation.opacity(1).step({
      duration: 1000
    }).scale(1).step({
      duration: 1000
    })
    this.setData({
      animationTitleData: animation.export()
    })
  },

  setAnimationItemOut() {

    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 800,
      timingFunction: 'ease',
    });
    animation.scale(0).step({
      duration: 800
    }).opacity(0).step()
    this.setData({
      animationItemData: animation.export()
    })
  },

  setAnimationItemIn() {

    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 800,
      timingFunction: 'ease',
    });
    // animation.scale(0).step().opacity(1).step({ duration: 800 }).scale(1).step({ duration: 1000 })
    animation.opacity(1).step().scale(1).step({
      duration: 1000
    })

    // animation.opacity(1).step({ duration: 1000 }).scale(1).step()
    this.setData({
      animationItemData: animation.export()
    })
  },

  //选择
  selectItem(e) {
    let items = this.data.item.items
    let hasCheck = false
    items.forEach(item => {
      if (item.checked) {
        hasCheck = true
      }
    })
    if (hasCheck) {
      return;
    }
    let idx = e.currentTarget.dataset.idx
    let checkAnswer = this.data.item.items[idx].seq
    let answer = this.data.item.answer
    console.log('selectItem', idx)
    console.log("checkAnswer", checkAnswer)
    console.log("answer", answer)
    this.playAudio()

    //如果答对
    if (answer == checkAnswer) {
      let tmpArray = this.data.rightArray
      tmpArray.push(this.data.item.id)
      this.setData({
        rightArray: tmpArray
      })

      let index = 0
      for (index in items) {
        if (answer == items[index].seq) {
          console.log("index", index)
          console.log("seq", items[index].seq)
          let val = 'item.items[' + index + '].right'
          this.setData({
            [val]: true
          })
        }
      }

    } else {
      //如果不正确，要显示错误的那个选项目 
      console.log("不正确")
      let index = 0

      for (index in items) {
        if (answer == items[index].seq) {
          console.log("index", index)
          console.log("seq", items[index].seq)
          let val = 'item.items[' + index + '].wrong'
          this.setData({
            [val]: true
          })
        }
      }
    }

    let val = 'item.items[' + idx + '].checked'
    this.setData({
      [val]: true
    })



    //先隐藏标题
    this.setAnimationTitleOut()

    //再隐藏选项

    setTimeout(() => {
      this.setAnimationItemOut()

    }, 1500)

    //选择下一题
    if (this.data.idx < 9) {


      //显示标题
      setTimeout(() => {
        console.log("取下一题...")
        //取下一题
        let itemIdx = this.data.idx + 1
        console.log("list", this.data.list)
        let item = this.data.list[itemIdx]
        console.log("next-item", item)
        item.checked = false
        item.wrong = false
        this.setData({
          item: item,
          idx: itemIdx
        })

      }, 1500)
      //显示选项
      setTimeout(() => {
        this.setAnimationTitleIn()
      }, 2000)

      //显示选项
      setTimeout(() => {
        this.setAnimationItemIn()
      }, 3000)



    } else {
      //做完10题
      console.log("做完10题,正确的有", this.data.rightArray.length)
      setTimeout(()=>{
        this.setData({
          isEnd: true,
        })
      },3000)

      //处理结果
      this.getPrice();

    }


  },

  async getPrice(){
    let data = {
      openid: wx.getStorageSync('openid'),
      type: this.data.type,
      len: this.data.rightArray.length
    }

    let res = await wxRequest(api.getQuestionPrize, data);
    console.log("getQuestionPrize", res)
    this.setData({
      prize:res.data
    })
  },

  //播放音乐
  playAudio() {
    console.log("播放音乐....")
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = '/static/audio/din.wav'
    // innerAudioContext.play()
    innerAudioContext.autoplay = true
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  }








})
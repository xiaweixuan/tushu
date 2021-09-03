// miniprogram/pages/toolbox/currentScore/currentScore.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    studentInfo: app.globalData.studentInfo,
    multiArray: [
      ['2015', '2016', '2017', '2018', '2019', '2020'],
      ['一', '二']
    ],
    multiIndex: [3, 1],
    xq: ['3', '12'],
    showData: '',
    loadModal: false,
    toggleDelay: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (!app.globalData.studentInfo) {
      wx.showModal({
        title: '提示',
        content: '您没有登录，该功能需要登录才能正常使用，请返回首页登录!',
        showCancel: false,
        success: function(res) {
          wx.navigateBack({});
        }
      });
    }
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  showMore(e) {
    let index = e.currentTarget.id;
    let res = this.data.showData.scoreList[index].hide;
    if (res == 0) {
      var c = 1;
    } else {
      var c = 0;
    }
    this.setData({
      ['showData.scoreList[' + index + '].hide']: c
    });
  },
  bindMultiPickerChange: function(e) {
    this.setData({
      multiIndex: e.detail.value
    })
    console.log(this.data.multiArray[0][this.data.multiIndex[0]])
    console.log(this.data.xq[this.data.multiIndex[1]])
  },
  queryScore: function(e) {
    var that = this;
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'filterScore', //云函数名为http
      data: {
        xnm: this.data.multiArray[0][this.data.multiIndex[0]],
        xqm: this.data.xq[this.data.multiIndex[1]]
      }
    }).then(res => {　　　　　　 //Promise
      this.setData({
        loadModal: false
      })
      this.setData({
        showData: res.result
      });

      console.log(res.result.scoreList.length)

      that.setData({
        toggleDelay: true
      })
      setTimeout(function() {
        that.setData({
          toggleDelay: false
        })
      }, 10000)

      console.log(res.result)
    })

  },
  backQuery() {
    this.setData({
      showData: ''
    })
  }
})
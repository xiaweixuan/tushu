// miniprogram/pages/toolbox/currentScore/currentScore.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    showData:'',
    loadModal:false,
    toggleDelay:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.studentInfo) {
      this.data.studentInfo = app.globalData.studentInfo
      this.setData({
        loadModal: true
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'allScore', //云函数名为http
      }).then(res => {
        console.log(res.result)
        this.setData({
          loadModal: false
        })　　　　　　 //Promise
        this.setData({
          showData: res.result
        });
        that.setData({
          toggleDelay: true
        })
        setTimeout(function () {
          that.setData({
            toggleDelay: false
          })
        }, 10000)
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您没有登录，该功能需要登录才能正常使用，请返回首页登录!',
        showCancel: false,
        success: function (res) {
          wx.navigateBack({});
        }
      });
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showMore(e){
    let index = e.currentTarget.id;
    let res = this.data.showData.scoreList[index].hide;
    if (res == 0) {
      var c = 1;
    } else {
      var c = 0;
    }
    this.setData({ ['showData.scoreList[' + index + '].hide']: c });
    
  }
})
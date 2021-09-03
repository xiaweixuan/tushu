// miniprogram/pages/toolbox/currentScore/currentScore.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    showData: '',
    sno: '',
    pwd: '',
    loadModal: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.studentInfo) {
      this.setData({
        sno: app.globalData.studentInfo.sno
      });
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
  queryScore: function() {
    var that = this;
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'extendScore', //云函数名为http
      data: {
        sno: this.data.sno,
        pwd: this.data.pwd
      }
    }).then(res => {　　　　　　 //Promise
      this.setData({
        loadModal: false,
      })
      if(res.result.code==1){
        this.setData({
          showData: res.result
        })
      }else{
        wx.showToast({
          title: '用户名或密码错误',
          icon:'none',
          duration:2500
        })
      }
      console.log(res.result)
    })
  },
  inputSno: function(e) {
    this.setData({
      sno: e.detail.value
    })
  },
  inputPwd: function(e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  backQuery(){
    this.setData({
      showData:''
    })
  },
  showMore(e) {
    let index = e.currentTarget.id;
    console.log(this.data.showData.scoreList[index])
    let res = this.data.showData.scoreList[index].hide;
    console.log(res)
    if (res == 0) {
      var c = 1;
    } else {
      var c = 0;
    }
    this.setData({ ['showData.scoreList[' + index + '].hide']: c });
  }
})
// miniprogram/pages/toolbox/calendar/calendar.js
const dataUrl ="cloud://ylmc2019.796c-ylmc2019/calendar/"
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  preview1718(){
    wx.previewImage({
      urls: [dataUrl+"2017-2018.png"],
      current:dataUrl+"2017-2018.png"
    })
  },
  preview1819() {
    wx.previewImage({
      urls: [dataUrl+"2018-2019.png"],
      current: dataUrl+"2018-2019.png"
    })
  },
  preview1920() {
    wx.previewImage({
      urls: [dataUrl+"2019-2020.png"],
      current: dataUrl+"2019-2020.png"
    })
  }
})
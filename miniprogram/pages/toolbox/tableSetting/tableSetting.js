// miniprogram/pages/toolbox/tableSetting/tableSetting.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchChecked1: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var value = wx.getStorageSync('switchChecked1')
    if (value !== "") {
      this.setData({
        switchChecked1: value
      });
    }
    var value = wx.getStorageSync('switchChecked2')
    if (value !== "") {
      this.setData({
        switchChecked2: value
      });
    }
    var value = wx.getStorageSync('switchChecked3')
    if (value !== "") {
      this.setData({
        switchChecked3: value
      });
    }
  },
  switch1Change: function (e) {
    wx.setStorageSync("switchChecked1", e.detail.value)
  },
  switch2Change: function (e) {
    wx.setStorageSync("switchChecked2", e.detail.value)
  },
  switch3Change: function (e) {
    wx.setStorageSync("switchChecked3", e.detail.value)
  },
  deleFriend: function (e) {
    wx.removeStorageSync("firendtableInfo");
    wx.showModal({
      title: '删除成功提醒',
      content: '好友课表已删除！',
    })
  },
  userImg: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths[0])
        var base64 = 'data:image/jpg;base64,' + wx.getFileSystemManager().readFileSync(tempFilePaths[0], "base64");
        wx.setStorageSync('userPic', base64)
        //console.log(base64);
      }
    })
  },
  deleImg: function () {
    wx.removeStorageSync("userPic");
    wx.showModal({
      title: '删除图片',
      content: '自定义课表背景已删除！',
    })
  },
  reTable(){
    app.getTableInfo((res) => {
      if (res.code == 1) {
        wx.showToast({
          title: '下载课表成功'
        })
      } else {
        wx.showToast({
          title: '下载课表失败',
          icon: 'none'
        })
      }
    });
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

  }
})
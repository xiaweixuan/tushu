// miniprogram/pages/toolbox/libraryBook/libraryBook.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sno: '',
    pwd: '',
    showData: '',
    type:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.type = parseInt(options.type)
    console.log(options.type)
  },
  renew(e){
    let barcode = e.currentTarget.dataset.barcode;
    console.log(barcode)
    wx.showLoading({
      title: '正在执行',
    })

    wx.cloud.callFunction({ //调用云函数
      name: 'renewBook',
      data: {
        sno: this.data.sno,
        pwd: this.data.pwd,
        barcode: barcode
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      wx.showModal({
        title: '续借结果',
        content: res.result.msg,
        showCancel:false
      })
      console.log(res.result)
    })
    console.log(e)
  },
  getList(){
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'borrowInfo', //云函数名为http
      data: {
        sno: this.data.sno,
        pwd: this.data.pwd,
        method:this.data.type
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      if (res.result.code == 0) {
        this.setData({
          showData: res.result
        })
      } else {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateBack({})
        }, 2000)
      }

      console.log(res.result)
    })
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
    let sno = wx.getStorageSync("librarysno");
    let pwd = wx.getStorageSync("librarypwd");
    if (sno) {
      this.data.sno = sno
      this.data.pwd = pwd
      this.getList();
    } else {
      wx.showModal({
        title: '提示',
        content: '您没有绑定图书馆账号',
        confirmText: '去绑定',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../bindLibrary/bindLibrary',
            })
          } else if (res.cancel) {
            wx.navigateBack({})
          }
        }
      });
    }
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
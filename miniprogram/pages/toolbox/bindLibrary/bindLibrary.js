// miniprogram/pages/toolbox/bindLibrary/bindLibrary.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sno: '',
    pwd: '',
    hasUser:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sno=wx.getStorageSync("librarysno");
    if(sno){
      this.setData({
        sno:sno,
        hasUser:true
      })
    }

  },
  inputSno(e) {
    this.data.sno = e.detail.value
  },
  inputPwd(e) {
    this.data.pwd = e.detail.value
  },
  login(){
    var that=this;
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'bindLibrary', 
      data: {
        sno: this.data.sno,
        pwd: this.data.pwd
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      if(res.result.code==1){
        wx.setStorageSync("librarysno", this.data.sno)
        wx.setStorageSync("librarypwd", this.data.pwd)
        app.autoLibrary((res) => {
          console.log('自动登录图书馆结果')
          console.log(res)
          if (res) {
            console.log('获取到图书馆cookie')
            wx.showToast({
              title: '绑定成功',
            })
            this.setData({
              hasUser: true,
              sno:this.data.sno
            })    
          }
        });
        
      }else{
        wx.showToast({
          title: '绑定失败,用户名或密码错误',
          icon:'none'
        })
      }
      console.log(res.result)
    })
  },
  unLogin(){
    var that=this;
    wx.showModal({
      title: '确认',
      content: '是否解除绑定？',
      success(res) {
        if (res.confirm) {
          wx.removeStorageSync("librarysno")
          wx.removeStorageSync("librarypwd")
          that.setData({
            hasUser: false
          })
          app.globalData.libraryCookie='';
          wx.showToast({
            title: '解绑成功',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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
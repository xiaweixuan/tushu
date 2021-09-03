// miniprogram/pages/toolbox/article/article.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    article: '',
    scrollTop: 0,
    stop:0,
    theme:'light',
    themeButton:'夜间模式',
    fontSize:35,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const type=options.type
    if(type==-1){
      if (app.globalData.articleInfo) {
        this.setData({
          article: app.globalData.articleInfo.latest.article
        })
      } else {
        wx.navigateBack({})
      }
    }else{
      if (app.globalData.articleInfo) {
        this.setData({
          article: app.globalData.articleInfo.history[type].article
        })
      } else {
        wx.navigateBack({})
      }
    }
   
  },

  scollPage(e) {
    this.data.scrollTop = e.detail.scrollTop;
  },
  maxSize(){
    let size = this.data.fontSize;
    console.log(size)
    size=size+2;
    console.log(size)
    this.setData({
      fontSize:size
    })
  },
  minSize() {
    let size = this.data.fontSize;
    size -= 2;
    this.setData({
      fontSize: size
    })
  },
  themeChange(){
    console.log('mode')
    if (this.data.theme=="light"){
      this.setData({
        theme:'dark',
        themeButton:'护眼模式'
      })
    }else{
      this.setData({
        theme: 'light',
        themeButton: '夜间模式'
      })
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
    let title = wx.getStorageSync("readTitle");
    if(title){
      if(title==this.data.article.title){
        let s = wx.getStorageSync("readPosition");
        let size = wx.getStorageSync("readSize");
        if (size) {
          console.log('还原上次字号')
          this.setData({
            fontSize: size
          })
        }
        if (s) {
          this.setData({
            stop: s
          })
          wx.showToast({
            title: '自动定位上次位置',
            icon: 'none'
          })
        }
       
      }
    }

    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    let scrollTop=this.data.scrollTop;
    let title = this.data.article.title;
    let size=this.data.fontSize;
    wx.setStorageSync("readPosition", scrollTop);
    wx.setStorageSync("readTitle", title);
    wx.setStorageSync("readSize", size);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let scrollTop = this.data.scrollTop;
    let title = this.data.article.title;
    let size = this.data.fontSize;
    console.log(scrollTop)
    wx.setStorageSync("readPosition", scrollTop);
    wx.setStorageSync("readTitle", title);
    wx.setStorageSync("readSize", size);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
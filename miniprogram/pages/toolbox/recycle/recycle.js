// miniprogram/pages/toolbox/recycle/recycle.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showData:'',
    recycleText:'',
    loadModal:false,
    TabCur: 0,
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
  inputRecycle(e){
    this.setData({
      recycleText: e.detail.value
    })
  },
  queryRecycle(){
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'rubbish', 
      data: {
        name: this.data.recycleText
      }
    }).then(res => {　　　　　　 //Promise
      this.setData({
        showData: res.result,
        loadModal: false
      })
      console.log(res.result)

    })

    // wx.request({
    //   url: 'https://www.waface7.cn/php/TrashSorting/sort.php?name=' +encodeURI(this.data.recycleText),
    //   method: 'POST',
    //   data: {
    //     method: this.data.searchMethod,
    //     value: this.data.searchText,
    //     page: this.data.searchPage
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded' // 默认值
    //   },
    //   success: res => {
    //     this.setData({
    //       showData: res.data,
    //     });
    //     console.log(res.data)

    //   },
    //   complete: res => {
    //     this.setData({
    //       loadModal: false
    //     })
    //   }
    // })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  backQuery(){
    this.setData({showData:''})
  }
})
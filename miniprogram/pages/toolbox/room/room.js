// miniprogram/pages/toolbox/room/room.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    showData: '',
    loadModal: false,
    weekData: [
      ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
      ["公共教学楼A", "公共教学楼B", "公共教学楼C", "公共教学楼D", "公共教学楼E"]
    ],
    weekIndex: [0, 0],
    jc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    jcValue: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  selectJc: function(e) {
    let index = e.currentTarget.dataset.id;
    let value = 1 - this.data.jcValue[index];
    this.setData({
      ['jcValue[' + index + ']']: value
    });
  },
  bindWeekAddrChange(e) {
    this.setData({
      weekIndex: e.detail.value
    })
  },
  queryRoom() {
    let jcd = 0;
    for (var i = 0; i < 13; i++) {
      var tmp = this.data.jcValue[i];
      jcd += tmp * Math.pow(2, this.data.jc[i] - 1)
    }
    let wk = this.data.weekIndex[0] + 1
    let rm = "0" + (this.data.weekIndex[1] + 1);
    console.log(rm)
    this.getRoom(wk, jcd, rm)
  },
  getRoom(xqj, jcd, rm) {
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'room', 
      data: {
        rm: rm,
        xqj: xqj,
        jcd: jcd
      }
    }).then(res => {　　　　　　 //Promise
    console.log(res.result)
      this.setData({
        loadModal: false,
        showData: res.result
      })
    })
  },
})
// miniprogram/pages/toolbox/scoreState/scoreState.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    showData: '',
    loadModal: false
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
    } else {
      this.setData({
        loadModal: true
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'scoreState',
      }).then(res => {　　　　　　 //Promise
        this.setData({
          loadModal: false
        })
        this.setData({
          showData: res.result
        });
        console.log(res.result)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  showMore: function(e) {
    var cid = e.currentTarget.dataset.cid;
    var index = e.currentTarget.id;
    var res = this.data.showData.scoreList[cid].list[index].hide;
    console.log('cid' + cid);
    console.log('index' + index);
    console.log('res' + res);
    if (res == 0) {
      var c = 1;
    } else {
      var c = 0;
    }
    this.setData({
      ['showData.scoreList[' + cid + '].list[' + index + '].hide']: c
    });

  },
  showBigMore: function(e) {
    var index = e.currentTarget.id;
    var res = this.data.showData.scoreList[index].hide;
    if (res == 0) {
      var c = 1;
    } else {
      var c = 0;
    }
    this.setData({
      ['showData.scoreList[' + index + '].hide']: c
    });
  }

})
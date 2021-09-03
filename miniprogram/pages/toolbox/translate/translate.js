// miniprogram/pages/toolbox/translate/translate.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    sourceData: '',
    targetData: '',
    index: 0,
    index2: 0,
    userData: '',
    translateData: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '初始化',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'translateType', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res.result)
      this.setData({
        targetData: res.result.Target,
        sourceData: res.result.Source
      });

    })

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
  sourceInput: function(e) {
    this.setData({
      userData: e.detail.value
    });
  },
  selSource: function(e) {
    this.setData({
      index: e.detail.value
    });
  },
  selTarget: function(e) {
    this.setData({
      index2: e.detail.value
    });
  },
  translateButton: function() {

    var Psource = this.data.sourceData[this.data.index].code;
    var Ptarget = this.data.targetData[this.data.index2].code;
    console.log(Psource)
    wx.showLoading({
      title: '正在翻译',
      mask: true
    })

    wx.cloud.callFunction({ //调用云函数
      name: 'translateLang', //云函数名为http
      data: {
        SourceText: this.data.userData,
        Source: Psource,
        Target: Ptarget,
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res.result)
      this.setData({
        translateData: res.result.TargetText
      });
    })

  },
  clean: function() {
    this.setData({
      userData: ''
    });
  }
})
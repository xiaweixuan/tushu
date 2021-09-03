// miniprogram/pages/toolbox/seatManager/seatManager.js
const app = getApp();
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    showData: '',
    showData2: '',
    cookie: '',
    lid: '',
    sid: '未选择',
    datakey: '',
    QRModal: false,
    canShow:false
  },
  onLoad: function(options) {
    
  },
  onShow: function () {
    if (app.globalData.libraryCookie) {
      this.data.cookie = app.globalData.libraryCookie;
      this.getList();
      console.log(this.data.cookie)
      console.log('从app中毒cookie')
    }else{
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
  onReady: function() {

  },
  getList() {
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getSeatList',
      data: {
        cookie: this.data.cookie
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      this.setData({
        showData: res.result
      })
      console.log(res.result)
    })
  },
  refreshPage() {
    this.setData({
      showData: '',
      showData2: ''
    })
    this.getList();
  },
  showQRCode(e) {
    var that=this;
    this.getList();
    this.setData({
      QRModal: true,
      canShow:true
    })
    setTimeout(function (res) {
      that.setData({
        canShow: false
      })
    }, 30000)
  },
  hideQRModal() {
    this.setData({
      QRModal: false
    })
  },
  refreshQRCode() {
    var that = this;
    this.getList();
    this.setData({
      canShow: true
    })
    setTimeout(function (res) {
      that.setData({
        canShow: false
      })
    }, 30000)
  },
  sureSeat(){
    this.getList();
    this.setData({
      QRModal: false
    })
  },
  cancelSeat(e) {
    var that =this;
    wx.showModal({
      title: '提示',
      content: '是否取消座位？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在取消',
          })
          wx.cloud.callFunction({ //调用云函数
            name: 'cancelSeat',
            data: {
              cookie: that.data.cookie
            }
          }).then(res => {　　　　　　 //Promise
            wx.hideLoading();
            if(res.result.code==0){
              wx.showToast({
                title: '退座成功',
              })
              setTimeout(()=>{
                that.refreshPage();
              },1000)
            }else{
              wx.showToast({
                title: '退座失败',
                icon:'none'
              })
            }
            console.log(res.result)
          })
        }
      }
    })
  },
  orderSeat(e) {
    let uri = e.currentTarget.dataset.uri;
    let lid = e.currentTarget.dataset.libid; 
    this.data.lid = lid;
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getRoomSeat', 
      data: {
        cookie: this.data.cookie,
        uri: uri,
        lid: lid
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      this.setData({
        showData2: res.result
      })
      console.log(res.result)
    })
    console.log(e)
  },
  selSeat(e) {
    let sid = e.currentTarget.dataset.num;
    let datakey = e.currentTarget.dataset.key;
    console.log(datakey)
    if (this.data.sid == sid) {
      this.setData({
        sid: '未选择'
      })
    } else {
      this.setData({
        sid: sid,
        datakey: datakey
      })
    }
    console.log(e)
  },
  getFormId(e) {
    let formIds = app.globalData.formId;
    formIds.push(e.detail.formId);
    app.globalData.formId = formIds;
    console.log(app.globalData.formId);
  },
  creatSeat(e) {
    console.log('开始选座')
    var that=this;
    if(this.data.sid !='未选择'){
      wx.showLoading({
        title: '正在加载',
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'getSeat',
        data: {
          cookie: this.data.cookie,
          datakey: this.data.datakey,
          libid: this.data.lid,
          key: this.data.showData2.key,
          formid: [app.globalData.formId.pop(), app.globalData.formId.pop()]
        }
      }).then(res => {　　　　　　 //Promise
        wx.hideLoading();
        if (res.result.code == 0) {
          wx.showToast({
            title: '选座成功',
          })
          setTimeout(()=>{
            that.refreshPage();
          },1000)
        } else {
          wx.showToast({
            title: '选座失败，' + res.result.msg,
            icon: 'none',
            duration:2500
          })
        }
        console.log(res.result)
      })
      console.log(this.data.sid)
    }else{
      wx.showToast({
        title: '您还没有选座',
        icon:'none'
      })
    }
  },
  //暂留处理
  holdSeat() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否暂离座位？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在执行',
          })
          wx.cloud.callFunction({ //调用云函数
            name: 'seatHold',
            data: {
              cookie: that.data.cookie
            }
          }).then(res => {　　　　　　 //Promise
            wx.hideLoading();
            if (res.result.code == 0) {
              wx.showToast({
                title: '暂离成功',
              })
              setTimeout(() => {
                that.loadLibrary();
              }, 1000)
            } else {
              wx.showToast({
                title: '暂离失败',
                icon: 'none'
              })
            }
            console.log(res.result)
          })
        }
      }
    })
  },
  cancelHold() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否取消暂离座位？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在执行',
          })
          wx.cloud.callFunction({ //调用云函数
            name: 'cancelHold',
            data: {
              cookie: that.data.cookie
            }
          }).then(res => {　　　　　　 //Promise
            wx.hideLoading();
            if (res.result.code == 0) {
              wx.showToast({
                title: '取消成功',
              })
              setTimeout(() => {
                that.loadLibrary();
              }, 1000)
            } else {
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              })
            }
            console.log(res.result)
          })
        }
      }
    })
  },
    //暂留处理
  //已签到退座
  cancelHadSeat() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否取消座位？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在退座',
          })
          wx.cloud.callFunction({ //调用云函数
            name: 'cancelSeat',
            data: {
              cookie: that.data.cookie
            }
          }).then(res => {　　　　　　 //Promise
            wx.hideLoading();
            if (res.result.code == -1) {
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              })
            } else if (res.result.code == 1) {
              wx.showModal({
                title: '退座成功',
                content: '您本次学习' + res.result.hour + '小时' + res.result.minute + '分，打败全国' + res.result.percent + '%的同学。',
                showCancel:false
              })
              setTimeout(() => {
                that.loadLibrary();
              }, 1000)
            }
            console.log(res.result)
          })
        }
      }
    })
  },
  backList(){
    this.setData({
      showData2:''
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
 
})
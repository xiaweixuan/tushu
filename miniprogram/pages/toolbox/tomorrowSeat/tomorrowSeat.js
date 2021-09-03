// miniprogram/pages/toolbox/tomorrowSeat/tomorrowSeat.js
const app = getApp()
const db = wx.cloud.database()
let videoAd = null
Page({

  /**
   * 页面的初始数据1
   */
  data: {
    sno:'',
    pwd:'',
    listData: '',
    roomData: '',
    userData:'',
    selLibId: '',
    libname:'',
    sid: '未选择',
    bid: '未选择',
    sidkey:'',
    bidkey:'',
    mode: 1,
    isVip:false
  },

//wi
  onLoad: function(options) {
    let _this=this;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'isVip',
    }).then(res => {
      // output: res.result === 3
      if(res.result.code==1){
        this.setData({
          isVip:true
        })
      }else{
        this.setData({
          isVip: false
        })
      }
      console.log(res.result)
    }).catch(err => {
      // handle error
    })

    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-7e7c62618e60c1b0'
      })
      videoAd.onLoad(() => { })
      videoAd.onError((err) => { })
      videoAd.onClose((res) => {
        let _id = this.data.userData._id;
        let priority=this.data.userData.priority;
        priority+=10;
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          console.log('正常')

          db.collection('prereserveList').doc(_id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
              priority: priority
            }
          })
            .then(
              _this.onLoad()
            )
            .catch(console.error)
        } else {
          // 播放中途退出，不下发游戏奖励
          console.log('提前退出')
        }
      })
    }

    let sno = wx.getStorageSync("librarysno");
    let pwd = wx.getStorageSync("librarypwd");
    if (sno) {
      this.data.sno=sno;
      this.data.pwd=pwd;
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

    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection('prereserveList').field({
      pwd: false
    })
    .where({
      sno:sno
    })
    .get().then(res => {
      console.log(res.data)
      if(res.data.length>0){
        _this.setData({
          userData: res.data[0],
          mode:3
        })
      }
      wx.hideLoading();
    })

    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection('tomorrow_seat').field({
      seat: false
    }).get().then(res => {
      console.log(res.data)
      _this.setData({
        listData: res.data
      })
      wx.hideLoading();
    })
  },
  orderSeat(e) {
    console.log(e)
    let _this = this;
    let libid = e.currentTarget.dataset.libid;
    let libname = e.currentTarget.dataset.libname;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    db.collection('tomorrow_seat').where({
      rid: libid
    }).get().then(res => {
      console.log(res.data)
      _this.setData({
        libname: libname,
        roomData: res.data,
        selLibId:libid,
        mode: 2
      })
      wx.hideLoading();
    })
  },
  selSeat(e) {
    let _this=this;
    let zid = e.currentTarget.dataset.num;
    let datakey = e.currentTarget.dataset.key;
    wx.showModal({
      title: '座位类型',
      content: '请选择您的座位类型，主选为优先抢座，备选为主选抢座失败备用座位，系统不能保证100%抢座成功，请做好心理准备，服务器将尽量为您抢到合适座位。',
      confirmText: '主选座位',
      cancelText: '备选座位',
      success(res) {
        if (res.confirm) {
          _this.setData({
            sid:zid,
            sidkey: datakey
          })
        } else if (res.cancel) {
          _this.setData({
            bid: zid,
            bidkey: datakey
          })
        }
      }
    })
  },
  backList(){
    this.setData({
      mode:1,
      roomData:''
    })
  },
  creatSeat(){
    let _this=this;
    const datakey1=this.data.sidkey;
    const datakey2=this.data.bidkey;
    const dataname1=this.data.sid;
    const dataname2 = this.data.bid;
    const libid = this.data.selLibId;
    const libname = this.data.libname;
    // formid: [app.globalData.formId.pop(), app.globalData.formId.pop()]
    const sno=this.data.sno;
    const pwd=this.data.pwd;
    if (this.data.sid == '未选择') {
      wx.showToast({
        title: '主选座位未选择',
        icon:'none'
      })
    }else{
      if (this.data.bid == '未选择') {
        wx.showToast({
          title: '备选座位未选择',
          icon: 'none'
        })
      }else{
        wx.showLoading({
          title: '正在排队',
          mask:true
        })
        let priority =10;
        console.log("vip:"+_this.data.isVip)
        if(_this.data.isVip){
          priority=999;
        }
        db.collection('prereserveList').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            sno: sno,
            pwd: pwd,
            datakeys: [datakey1, datakey2],
            nums:[dataname1,dataname2],
            libid: libid,
            libname:libname,
            finish:false,
            priority: priority,
            formid: [app.globalData.formId.pop(), app.globalData.formId.pop()],
          }
        })
          .then(res => {
            wx.hideLoading();
            if (res.errMsg =='collection.add:ok'){
              wx.showModal({
                title: '预约成功',
                content: '预约成功，您已成功加入抢座队列，请耐心等待场馆开放，抢座结果我们将以服务通知的方式发送给您。',
                showCancel:false,
                success(e){
                  if(e.confirm){
                    _this.onLoad();
                  }
                }
              })
            }else{
              wx.showToast({
                title: '服务器忙，请稍后再试',
                icon: 'none'
              })
            }
            console.log(res)
          })
          .catch(console.error)
      }
    }
  },
  getFormId(e) {
    let formIds = app.globalData.formId;
    formIds.push(e.detail.formId);
    app.globalData.formId = formIds;
    console.log(app.globalData.formId);
  },
  cancelSeat(){
    console.log(this.data.userData._id)
    const _id = this.data.userData._id;
    let _this=this;
    db.collection('prereserveList').doc(_id).remove()
      .then(res=>{
        if (res.errMsg == "document.remove:ok"){
          wx.showToast({
            title: '取消成功',
          })
          
          setTimeout(()=>{
            _this.setData({
              mode:1
            })
            _this.onLoad();
          },1000)
          this
        }else{
          wx.showToast({
            title: '取消失败',
            icon: 'none'
          })
        }
      })
      .catch(console.error)
  },
  powerSeat(){
    wx.showModal({
      title: '抢座加速',
      content: '抢座功能耗费大量服务器资源，您是否愿意观看一段广告提升您的排位？',
      success(res){
        if(res.confirm){
          if (videoAd) {
            videoAd.show().catch(() => {
              // 失败重试
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                })
            })
          }else{
            wx.showToast({
              title: '服务器异常',
              icon: 'none'
            })
          }
        }
      }
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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
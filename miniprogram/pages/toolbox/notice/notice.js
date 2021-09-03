// miniprogram/pages/notice/notice.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    noticeData: ''
  },
  attached() {
    if (app.globalData.noticeInfo) {
      this.setData({
        noticeData: app.globalData.noticeInfo
      })
    } else {
      wx.showLoading({
        title: '正在加载',
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'notice',
      }).then(res => {　　　　　　 //Promise
        wx.hideLoading();
        this.setData({
          noticeData: res.result
        })
        app.globalData.noticeInfo = res.result;
        console.log(res.result)
      })
    }
  }
})
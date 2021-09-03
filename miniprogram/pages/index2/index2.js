//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },
  uploadImage(){
    wx.cloud.callFunction({ //调用云函数
      name: 'test', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  normalLogin(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'normalLogin', //云函数名为http
      data: {
        sno: '2016014923',
        pwd: 'f174748'
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  scoreState(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'scoreState', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  extendScore(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'extendScore', //云函数名为http
      data: {
        sno: '2016014923',
        pwd: 'f174748'
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  peScore() {
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'peScore', //云函数名为http
      data: {
        sno: '2016014908',
        pwd: 'CYH19970811'
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  brrowInfo(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'borrowInfo', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  getSeatList(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getSeatList', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  autoLogin(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'autoLogin', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  room(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'room', //云函数名为http
      data: {
        rm: '01',
        xqj: 1,
        jcd:2
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  exitLogin() {
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'exitLogin', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  notice(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'notice', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  getTable(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getTable', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  currentScore(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'currentScore', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  toolbox(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'toolbox', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  allScore(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'allScore', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  filterScore(){
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'filterScore', //云函数名为http
      data: {
        xnm: '2017',
        xqm: '12'
      }
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      console.log(res)
    })
  },
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})

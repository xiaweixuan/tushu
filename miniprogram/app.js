//app.js
App({
  onLaunch: function() {
    this.globalData = {
      studentInfo: '',
      userInfo: '',
      tableInfo: '',
      noticeInfo: '',
      toolInfo: '',
      articleInfo:'',
      libraryCookie:'',
      formId:[]
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'zaohui-wk65c',
        traceUser: true,
      })
    }

    let table = wx.getStorageSync('tableInfo')
    if (table) {
      this.globalData.tableInfo = table
    }

    //更新检查
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.showLoading({
            title: '正在登录',
            mask: true
          })
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(res.userInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回     
              wx.hideLoading()
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                wx.hideLoading()
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // wx.getSystemInfo({
    //   success: e => {
    //     this.globalData.StatusBar = e.statusBarHeight;
    //     let custom = wx.getMenuButtonBoundingClientRect();
    //     this.globalData.Custom = custom;
    //     this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
    //   }
    // })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })

    // this.autoLibrary();

  },
  autoLogin(cb) {
    wx.showLoading({
      title: '正在登录',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'autoLogin', //云函数名为http
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      if (res.result.code == 1) {
        this.globalData.studentInfo = res.result;
      } else {
        wx.showToast({
          title: '新用户未登录',
          icon: 'none'
        })
      }
      cb(res.result)
      console.log(res.result)
    })
  },
  exitLogin(cb) {
    wx.showLoading({
      title: '正在登出',
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'exitLogin',
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      if (res.result.code == 1) {
        this.globalData.studentInfo = '';
      } else {
        wx.showToast({
          title: '下线失败',
          icon: 'none'
        })
      }
      cb(res.result)
      console.log(res.result)
    })
  },
  getTableInfo(cb) {
    wx.showLoading({
      title: '下载课表',
      mask: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getTable',
    }).then(res => {　　　　　　 //Promise
      wx.hideLoading();
      if (res.result.code == 1) {
        this.globalData.tableInfo = res.result;
        wx.setStorageSync("tableInfo", res.result)
      }
      cb(res.result)
      console.log(res.result)
    })

  },
  autoLibrary(cb){
    let sno = wx.getStorageSync("librarysno");
    let pwd = wx.getStorageSync("librarypwd");
    if (sno) {
      wx.cloud.callFunction({ //调用云函数
        name: 'libraryBase',
        data: {
          sno: sno,
          pwd: pwd
        }
      }).then(res => {　　　　　　 //Promise
        if (res.result.code == 1) {
          this.globalData.libraryCookie=res.result.cookie;
          cb(res.result.cookie)
          console.log(this.globalData.libraryCookie)
          console.log('---图书馆自动')
        } else {
          wx.showToast({
            title: '图书馆登录失败,用户名或密码错误',
            icon: 'none'
          })
          wx.removeStorageSync("librarysno")
          wx.removeStorageSync("librarypwd")
          cb('')
        }
        console.log(res.result)
      })
    }else{
      cb('')
    }
  }
})
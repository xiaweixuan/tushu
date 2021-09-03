// miniprogram/pages/home/home.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    CustomBar: app.globalData.CustomBar,
    sno: '',
    pwd: '',
    studentInfo: '',
    tableInfo: '',
    userInfo: '',
    teachWeek: 1, //教学周
    week: 1, //今天周几
    leaseTime: 0, //开学倒计时
    bothInfo: false,
    canNext: true,
    numList: [{
      name: '登录',
      icon: 'myfill'
    }, {
      name: '授权',
      icon: 'radioboxfill'
    }, {
      name: '完成',
      icon: 'roundcheckfill'
    }, ],
    num: 0,
    libraryData: '',
    libraryCookie: '',
    libraryLoad: false,
    QRModal: false,
    weather: '',
    canShow: false,
    noticeData:'',
    showAllItem:false,
    msgList: []
  },

  attached() {
    // 兼容旧版本
    let oldVersion = wx.getStorageSync('oldVersion')
    if (!oldVersion) {
      wx.showModal({
        title: '版本更新',
        content: '由于新版本改动较大，您的课表将被删除并在下次重启中重新获取。',
        showCancel: false,
        success(e) {
          wx.setStorageSync("oldVersion", "1")
          wx.removeStorageSync("tableInfo");
        }
      })
    }
    // 兼容
    if (app.globalData.studentInfo) {
      this.setData({
        studentInfo: app.globalData.studentInfo
      })
    } else {
      app.autoLogin((res) => {
        if (res.code == 1) {
          this.setData({
            studentInfo: res
          })
          this.checkPermission();
        } else {
          console.log("自动失败")
        }
      });
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
        })
        this.checkPermission();
        console.log("来晚了")
      }
    }
    //星期计算器
    let a = new Array(7, 1, 2, 3, 4, 5, 6);
    let w = new Date().getDay();
    //a[w]
    let tmp = 2
    this.setData({
      week: a[w]
    }); //斤斤计较军军军军军
    console.log(this.data.week)
    //教学周计算器
    let t = this.dateDiff("2020-01-11");
    let ft = parseInt(Math.abs(t))
    this.setData({
      leaseTime: ft
    })
    let ss = parseInt(t / 7) + 1;
    if (ss >= 1) {
      this.setData({
        teachWeek: ss
      });
    } else {
      this.setData({
        teachWeek: 1
      });
    }
    console.log(this.data.teachWeek)

    // this.loadOne();
  },
  ready() {
    this.checkPermission();
    this.loadWeather();
    this.loadNotice();
    console.log('Home Ready')
    this.libraryInit();
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      this.libraryInit();
      console.log('Home Show')
    }
  },
  methods: {
    changeItem(){
      wx.vibrateShort({})
      let statu=!this.data.showAllItem;
      this.setData({
        showAllItem:statu
      })
    },
    dateDiff(date1) {
      var d = new Date();
      return (d.getTime() - this.stringToTime(date1)) / (1000 * 60 * 60 * 24); //结果是小时 
    },
    stringToTime(string) {
      var f = string.split(' ', 2);
      var d = (f[0] ? f[0] : '').split('-', 3);
      var t = (f[1] ? f[1] : '').split(':', 3);
      return (new Date(parseInt(d[0], 10) || null, (parseInt(d[1], 10) || 1) - 1, parseInt(d[2], 10) || null, parseInt(t[0], 10) || null, parseInt(t[1], 10) || null, parseInt(t[2], 10) || null)).getTime();
    },
    numSteps() {
      this.setData({
        num: this.data.num == this.data.numList.length - 1 ? 0 : this.data.num + 1,
        canNext: true
      })
      if (this.data.num == 1) {
        if (this.data.userInfo) {
          this.setData({
            canNext: false
          })
        }
      }
    },
    libraryInit() {
      //判断是否绑定图书馆
      if (app.globalData.libraryCookie) {
        this.data.libraryCookie = app.globalData.libraryCookie;
        this.loadLibrary();
        console.log("从本地读取图书馆cookie")
      } else {
        app.autoLibrary((res) => {
          console.log('自动登录图书馆结果')
          console.log(res)
          if (res) {
            console.log('获取到图书馆cookie')
            this.data.libraryCookie = res;
            this.loadLibrary();
          }
        });
      }
    },
    loadLibrary() {
      let cookie = this.data.libraryCookie;
      if (cookie) {
        this.setData({
          libraryLoad: true
        })
        wx.cloud.callFunction({ //调用云函数
          name: 'getSeatList',
          data: {
            cookie: cookie
          }
        }).then(res => {　　　　　　 //Promise
          wx.hideLoading();
          this.setData({
            libraryLoad: false,
            libraryData: res.result
          })
          console.log(res.result)
        })
      }
    },
    showQRCode(e) {
      var that = this;
      this.loadLibrary();
      this.setData({
        QRModal: true,
        canShow: true
      })
      setTimeout(function(res) {
        that.setData({
          canShow: false
        })
      }, 30000)
    },
    refreshQRCode() {
      var that = this;
      this.loadLibrary();
      this.setData({
        canShow: true
      })
      setTimeout(function(res) {
        that.setData({
          canShow: false
        })
      }, 30000)
    },
    sureSeat() {
      this.loadLibrary();
      this.setData({
        QRModal: false
      })
    },
    hideQRModal() {
      this.setData({
        QRModal: false
      })
    },
    cancelSeat() {
      var that = this;
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
                cookie: that.data.libraryCookie
              }
            }).then(res => {　　　　　　 //Promise
              wx.hideLoading();
              if (res.result.code == 0) {
                wx.showToast({
                  title: '退座成功',
                })
                setTimeout(() => {
                  that.loadLibrary();
                }, 1000)
              } else {
                wx.showToast({
                  title: '退座失败',
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
                cookie: that.data.libraryCookie
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
                cookie: that.data.libraryCookie
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
                cookie: that.data.libraryCookie
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
                  showCancel: false
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
    loadWeather() {
      wx.request({
        url: 'https://v2.jinrishici.com/info',
        success: res => {
          if (res.data.status == "success") {
            this.setData({
              weather: res.data.data
            })
            console.log(res.data.data);
          } else {
            console.log("今日天气失败，错误原因：" + res.data.errMessage)
          }
        },
        fail: () => {
          console.log("今日天气失败，可能是网络问题或者您没有添加到域名白名单")
        }
      })
    },
    loadNotice() {
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
    },
    useTool(e) {
      console.log(e)
      let tid = e.currentTarget.dataset.tid

      if (tid == 1) {
        wx.navigateTo({
          url: '../toolbox/calendar/calendar',
        })
      } else if (tid == 2) {
        wx.navigateTo({
          url: '../toolbox/library/library',
        })
      } else if (tid == 3) {
        wx.navigateTo({
          url: '../toolbox/room/room',
        })
      } else if (tid == 4) {
        wx.showActionSheet({
          itemList: ['期末成绩', '学年成绩', '历年成绩'],
          success(res) {
            if (res.tapIndex == 0) {
              wx.navigateTo({
                url: '../toolbox/currentScore/currentScore',
              })
            } else if (res.tapIndex == 1) {
              wx.navigateTo({
                url: '../toolbox/filterScore/filterScore',
              })
            } else {
              wx.navigateTo({
                url: '../toolbox/allScore/allScore',
              })
            }
          },
          fail(res) {
            console.log(res.errMsg)
          }
        })
      } else if (tid == 5) {
        wx.navigateTo({
          url: '../toolbox/extendScore/extendScore',
        })
      } else if (tid == 6) {
        wx.navigateTo({
          url: '../toolbox/peScore/peScore',
        })
      } else if (tid == 7) {
        wx.navigateTo({
          url: '../toolbox/translate/translate',
        })
      } else if (tid == 8) {
        wx.navigateTo({
          url: '../toolbox/recycle/recycle',
        })
      } else if (tid == 9) {
        wx.navigateTo({
          url: '../toolbox/ifix/ifix',
        })
      } else if (tid == 10) {
        wx.navigateTo({
          url: '../toolbox/scoreState/scoreState',
        })
      }

    },
    helpDev() {
      wx.previewImage({
        current: 'cloud://ylmc2019.796c-ylmc2019-1256364330/helpDev.jpeg', // 当前显示图片的http链接
        urls: ['cloud://ylmc2019.796c-ylmc2019-1256364330/helpDev.jpeg'] // 需要预览的图片http链接列表
      })
    },
    checkPermission() {
      console.log("检查卡")
      if (this.data.studentInfo && this.data.userInfo) {
        this.setData({
          bothInfo: true
        })
        console.log("1+2全部获取")
        if (app.globalData.tableInfo) {
          this.setData({
            tableInfo: app.globalData.tableInfo
          })
          console.log(this.data.tableInfo)
        } else {
          app.getTableInfo((res) => {
            if (res.code == 1) {
              this.setData({
                tableInfo: res
              })
              wx.showToast({
                title: '下载课表成功'
              })
            } else {
              wx.showToast({
                title: '下载课表失败',
                icon: 'none'
              })
            }
          });
        }
      } else {
        if (this.data.studentInfo) {
          console.log("1.用户已登录")
          this.setData({
            num: 1
          })
          if (this.data.userInfo) {
            console.log("2.用户已授权")
            this.setData({
              num: 2
            })
          }
        }
      }
    },
    getUserInfo(e) {
      console.log(e)
      app.globalData.userInfo = e.detail.userInfo
      if (e.detail.userInfo) {
        this.setData({
          userInfo: e.detail.userInfo,
          canNext: false
        })
      }
    },
    startApp() {
      this.checkPermission();
    },
    inputSno(e) {
      this.data.sno = e.detail.value
    },
    inputPwd(e) {
      this.data.pwd = e.detail.value
    },
    normalLogin() {
      wx.showLoading({
        title: '正在登录',
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'normalLogin', //云函数名为http
        data: {
          sno: this.data.sno,
          pwd: this.data.pwd
        }
      }).then(res => {　　　　　　 //Promise
        wx.hideLoading();
        if (res.result.code == 1) {
          app.globalData.studentInfo = res.result
          this.setData({
            studentInfo: res.result,
            canNext: false
          })
        } else if (res.result.code == 0) {
          wx.showToast({
            title: '用户名或密码错误',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '网络异常',
            icon: 'none'
          })
        }
        console.log(res.result)
      })
    },
    exitLogin() {
      app.exitLogin((res) => {
        if (res.code == 1) {
          this.setData({
            studentInfo: '',
            canNext: true,
            num: 0,
            bothInfo: false
          })
          this.checkPermission();
        }
      });
    }
  }

})
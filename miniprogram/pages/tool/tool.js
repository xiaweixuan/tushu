// miniprogram/pages/tool/tool.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    CustomBar: app.globalData.CustomBar,
    oneData: '',
    noticeData: '',
    poem: '',
    article:'',
    showPoem: false,
    modalContent:'',
    showModal:false
  },

  attached() {
    this.loadOne();
    this.loadSentence();
    this.loadNotice();
    this.loadArticle();
  },
  methods: {
    loadNotice(){
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
    loadArticle() {
      if (app.globalData.articleInfo) {
        this.setData({
          article: app.globalData.articleInfo.latest
        })
      } else {
        wx.showLoading({
          title: '正在加载',
        })
        wx.cloud.callFunction({ //调用云函数
          name: 'oneArticle',
        }).then(res => {　　　　　　 //Promise
          wx.hideLoading();
          this.setData({
            article: res.result.latest
          })
          app.globalData.articleInfo = res.result;
          console.log(res.result)
        })
      }
    },
    readArticle(){
      wx.navigateTo({
        url: '../toolbox/article/article?type=-1',
      })
    },
    readMessage(e){
      let id = e.currentTarget.dataset.id
      let content=this.data.noticeData.notice[id]
      this.setData({
        showModal:true,
        modalContent:content
      })
      console.log(e)
    },
    hideModal(){
      this.setData({
        showModal: false
      })
    },
    allMessage(){
      wx.navigateTo({
        url: '../toolbox/notice/notice',
      })
    },
    loadOne() {
      wx.cloud.callFunction({ //调用云函数
        name: 'one', //云函数名为http
      }).then(res => {　　　　　　 //Promise
        this.setData({
          oneData: res.result
        })
        console.log(res.result)
      })
    },
    modePoem() {
      let r = !this.data.showPoem
      this.setData({
        showPoem:r
      })
    },
    loadSentence() {
      wx.request({
        url: 'https://v2.jinrishici.com/one.json?client=npm-sdk/1.0',
        success: res => {
          if (res.data.status === "success") {
            this.setData({poem : res.data.data})
            console.log(res.data.data);
          } else {
            console.log("今日诗词API 获取古诗词 失败，错误原因：" + res.data.errMessage)
          }
        },
        fail: () => {
          console.log("今日诗词-小程序SDK 获取古诗词失败，可能是网络问题或者您没有添加到域名白名单")
        }
      })
    },
    historyArticle(){
      wx.navigateTo({
        url: '../toolbox/historyArticle/historyArticle',
      })
    }
  },

})
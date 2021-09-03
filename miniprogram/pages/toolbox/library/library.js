// miniprogram/pages/toolbox/library/library.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    loadModal: false,
    bookModal:'',
    showData: '',
    bookData:'',
    borrowData: '',
    searchText: '',
    searchTotal: 0,
    searchMethod: 'title',
    searchPage: 1,
    bookCover:'/images/app.svg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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

  },
  searchBook: function() {
    this.data.searchMethod = 'title'
    this.data.searchPage = 1
    this.queryBook()
  },
  searchAuthor: function() {
    this.data.searchMethod = "author"
    this.data.searchPage = 1
    this.queryBook()
  },
  inputContent: function(e) {
    this.setData({
      searchText: e.detail.value
    })
  },
  queryBook(e) {
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getBookList', 
      data: {
        method: this.data.searchMethod,
        value: this.data.searchText,
        page: this.data.searchPage
      }
    }).then(res => {　　　　　　 //Promise
      console.log(res.result)
      this.setData({
        loadModal: false,
        showData: res.result,
        searchTotal: res.result.num
      });
    })
  },
  pullData() {
    console.log("loadme")
    var that = this;
    var total = parseInt(this.data.showData.num);
    var searchPage = this.data.searchPage;
    if (searchPage >= total) {
      wx.showToast({
        title: '已经到最后了哦',
        icon: 'none',
        duration: 1000
      })
    } else {
      this.data.searchPage++;
      this.setData({
        loadModal: true
      })
      wx.cloud.callFunction({ //调用云函数
        name: 'getBookList',
        data: {
          method: this.data.searchMethod,
          value: this.data.searchText,
          page: this.data.searchPage
        }
      }).then(res => {　　　　　　 //Promise
          let source = that.data.showData.book;
          source = source.concat(res.result.book);
          let count = that.data.searchTotal
          count += res.result.book.length
          that.setData({
            'showData.book': source,
            searchTotal: count,
            loadModal: false,
          });
      })
    }
  },
  showInfo(e){
    var that=this;
    let fid = e.currentTarget.dataset.fid;
    let iden = e.currentTarget.dataset.iden
    let book = this.data.showData.book[fid];
    console.log(book)
    this.setData({bookData:book})
    this.setData({
      loadModal: true
    })
    wx.cloud.callFunction({ //调用云函数
      name: 'getBookInfo',
      data: {
        iden: iden
      }
    }).then(res => {　　　　　　 //Promise
      console.log(res.result)
      this.setData({
        loadModal: false,
        borrowData: res.result,
        bookModal: 'show'
      });
      wx.cloud.callFunction({ //调用云函数
        name: 'getBookCover',
        data: {
          isbn: that.data.borrowData.anotherinfo.isbn
        }
      }).then(res => {　　　　　　 //Promise
        console.log(res.result)
        this.setData({
          bookCover: res.result,
        });

      })
    })
  },
  hideBook(){
    this.setData({
      bookModal: ''
    })
  },
  reQuery(){
    this.setData({
      showData: '',
      searchText:''
    })
  },
  useTool(e){
    let tid = e.currentTarget.dataset.tid

    if (tid == 1) {
      wx.navigateTo({
        url: '../libraryInfo/libraryInfo',
      })
    } else if (tid == 2) {
      wx.showActionSheet({
        itemList: ['当前借阅', '历史借阅'],
        success(res) {
          if (res.tapIndex==0){
            wx.navigateTo({
              url: '../libraryBook/libraryBook?type=2',
            })
          }else{
            wx.navigateTo({
              url: '../libraryBook/libraryBook?type=3',
            })
          }
          console.log(res.tapIndex)
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    } else if (tid == 3) {
      wx.showActionSheet({
        itemList: ['今日座位', '预约抢座'],
        success(res) {
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: '../seatManager/seatManager',
            })
          } else {
            wx.navigateTo({
              url: '../tomorrowSeat/tomorrowSeat',
            })
          }
          console.log(res.tapIndex)
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    } else if (tid == 4) {
      wx.navigateTo({
        url: '../bindLibrary/bindLibrary',
      })
    }
  }
})
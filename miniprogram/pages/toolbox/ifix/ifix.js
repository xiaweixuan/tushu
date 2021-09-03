// miniprogram/pages/toolbox/ifix/ifix.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index1: -1,
    index2: -1,
    index3: -1,
    picker1: [
      { area: "公寓楼", code: 117 },
      { area: "行政楼", code: 111 },
      { area: "留学生公寓", code: 114 },
      { area: "师生活动中心", code: 113 },
      { area: "理科群", code: 110 },
      { area: "公共教学楼", code: 109 },
      { area: "文科群", code: 106 },
      { area: "音乐学院", code: 107 },
      { area: "体育", code: 108 },
      { area: "中央空调", code: 103 },
      { area: "美术", code: 104 },
      { area: "职业技术学院与旅游学院", code: 105 },
      { area: "图书馆", code: 102 },
      { area: "会议中心", code: 101 },
      { area: "档案馆", code: 115 },
      { area: "浴室", code: 96 },
      { area: "后勤集团", code: 97 },
      { area: "电梯故障", code: 98 },
      { area: "校医院", code: 99 },
      { area: "真知讲堂", code: 100 },
      { area: "开水房", code: 95 },
      { area: "博物馆", code: 116 },
      ],
    picker2: [4, 5, 6],
    picker3: [
      {fixPro:"水",code:65},
      { fixPro: "电", code: 66 },
      { fixPro: "路面", code: 67 },
      { fixPro: "电梯", code: 68 },
      { fixPro: "吊顶", code: 69 },
      { fixPro: "中央空调", code: 70 },
      { fixPro: "暖气", code: 71 },
      { fixPro: "公共设备设施", code: 72 },
      { fixPro: "非公共设备设施", code: 73 },
      { fixPro: "停电", code: 74 },
    ],
    modalName: null,
    textareaBvalue: '',
    imgList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  pickerChange1(e) {
    let sel = e.detail.value;
    this.setData({
      index1: sel
    })
    console.log(this.data.picker1[sel].code)
  },
  pickerChange2: function (e) {
    this.index3 = e.detail.value;
  },
  pickerChange3: function (e) {
    let sel=e.detail.value;
    this.setData({
      index3:sel
    })
    console.log(this.data.picker3[sel].code)
  },
  
  textareaBInput(e) {
    this.textareaBvalue = e.detail.value;
  },
})
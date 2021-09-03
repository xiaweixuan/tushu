// miniprogram/pages/table/table.js
const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    CustomBar: app.globalData.CustomBar,
    WeekItem: [1, 2, 3, 4, 5, 6, 7],
    WeekItemCN: ['一', '二', '三', '四', '五', '六', '日'],
    WeekSel: 5,
    WeekDate:[],
    Month:'',
    tableInfo:'',
    Color: ["89,240,164", "255,161,125", "255,157,216", "134,176,254", "248,222,91", "174,236,53", "255,147,147", "171,144,255", "113,235,85","212,141,250",
      "89,240,164", "255,161,125", "255,157,216", "134,176,254", "248,222,91", "174,236,53", "255,147,147", "171,144,255", "113,235,85", "212,141,250"
    ],
    Opacity:0.85,
    teachWeek: 1, //教学周
    week: 1,//今天周几
    tableModal:'',
    selItem:'',
    backimgData:'',
    turnBack:false,//翻转课表
  },

  attached() {
    if (app.globalData.tableInfo) {
      this.setData({
        tableInfo: app.globalData.tableInfo
      })
      console.log(this.data.tableInfo)
    }
    let a = new Array(7, 1, 2, 3, 4, 5, 6);
    let w = new Date().getDay();
    let week=a[w];
    let list=[];
    for(let i=1;i<=7;i++){
      list.push(this.getDay(i - week))
    }
    let month =new Date().getMonth() + 1;
    this.setData({
      WeekDate:list,
      Month:month
    })
    console.log(list)
    //星期计算器
    let rq = new Array(7, 1, 2, 3, 4, 5, 6);
    let wd = new Date().getDay();
    this.setData({ week: rq[wd] });
    console.log(this.data.week)
    //教学周计算器
    let t = this.dateDiff("2019-09-01");
    
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
    //显示隐藏周六日
    var value = wx.getStorageSync('switchChecked1')
    if (value !== "") {
      if(value){
        this.setData({
          WeekSel: 7
        });
      }else{
        this.setData({
          WeekSel: 5
        });
      }
    }
    //显示非本周
    var value = wx.getStorageSync('switchChecked3')
    if (value !== "") {
      this.setData({
        turnBack: value
      });
    }

    //课程表背景
    this.dealBackground()

  },
  ready(){
    
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      //刷新课表
      if (app.globalData.tableInfo) {
        this.setData({
          tableInfo: app.globalData.tableInfo
        })
        console.log(this.data.tableInfo)
      }
      //显示隐藏周六日
      let value = wx.getStorageSync('switchChecked1')
      if (value !== "") {
        if (value) {
          this.setData({
            WeekSel: 7
          });
        } else {
          this.setData({
            WeekSel: 5
          });
        }
      }
      //显示非本周
      value = wx.getStorageSync('switchChecked3')
      if (value !== "") {
        this.setData({
          turnBack: value
        });
      }
      //课程表背景
      this.dealBackground()
     
    }
  },
  methods: {
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
    getDay(day) {　　
      let today = new Date();　　
      let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;　　
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      let tYear = today.getFullYear();
      let tMonth = today.getMonth();
      let tDate = today.getDate();　　
      tMonth = this.doHandleMonth(tMonth + 1);　　
      tDate = this.doHandleMonth(tDate);　　
      return tMonth + "/" + tDate;
      // return tYear + "-" + tMonth + "-" + tDate;
    },
    doHandleMonth(month) {　　
      var m = month;　　
      if (month.toString().length == 1) {　　　　
        m = "0" + month;　　
      }　　
      return m;
    },
    selItem(e){
      let item = e.currentTarget.dataset.id
      let itemData=this.data.tableInfo.subject[item]
      this.setData({
        selItem: itemData,
        tableModal:'show'
      })
      console.log(itemData)
    },
    hideTableModal(){
      this.setData({
        tableModal:''
      })
    },
    dealBackground(){
      //课程表背景
      let value = wx.getStorageSync('switchChecked2');
      let imgData = wx.getStorageSync('userPic');
      if (value == "") { //没有控制，显示背景
        if (imgData == "") {
          var rnd = parseInt(Math.random() * (50)) + 1;
          var imgurl = " https://ylmc2018-1256413011.cos.ap-beijing.myqcloud.com/student/table/bg" + rnd + ".jpg";
          this.setData({
            backimgData: imgurl
          });
        } else {
          //加载用户图片
          this.setData({
            backimgData: imgData
          });
        }
      } else { //
        if (value !== true) {
          //显示课表背景
          if (imgData == "") {
            let rnd = parseInt(Math.random() * (10)) + 1;
            let imgurl = " https://ylmc2018-1256413011.cos.ap-beijing.myqcloud.com/student/table/bg" + rnd + ".jpg";
            this.setData({
              backimgData: imgurl
            });
          } else {
            //加载用户图片
            this.setData({
              backimgData: imgData
            });
          }
        } else {
          this.setData({
            backimgData: null
          });
        }
      }
    }
   
  }

})
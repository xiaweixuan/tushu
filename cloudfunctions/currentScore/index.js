// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  var showData = {
    code: '',
    scoreList: []
  };
  let userData = await db.collection('wx_user').where({
    openid: wxContext.OPENID // 填入当前用户 openid
  }).get()
  if (userData.data.length == 0) {
    showData.code = 0
  } else {
    const usersno = userData.data[0].sno
    const userpwd = userData.data[0].pwd
    const base = await cloud.callFunction({
      name: 'zfjwBase',
      data: {
        sno: usersno,
        pwd: userpwd
      }
    })
    const baseData = base.result;
    console.log(baseData)
    if (baseData.code == 1) {
      showData.code = 1;
      console.log('进来了')
      let xscjmxUrl = 'http://202.206.100.217/cjcx/cjcx_cxXsKccjList.html?gnmkdm=N305007&su=' + usersno;
      const queryScore = queryString.stringify({
        xnm: 2018,
        xqm: 12,
        xh_id: usersno,
        _search: false,
        nd: Date.now(),
        'queryModel.showCount': 150,
        'queryModel.currentPage': 1,
        'queryModel.sortName': '',
        'queryModel.sortOrder': 'asc',
        time: 1
      });
      console.log(queryScore)//'baseData.cookie'
      let cjData = await got(xscjmxUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': baseData.cookie
          // jw=49737.7726.7938.0000; JSESSIONID=78D2837B3BB0C1E8427D9E157DEDC4BF
        },
        body: queryScore
      })
      console.log(cjData.body)

      let parseCjData = JSON.parse(cjData.body);
      var score = new Object();

      var y = -1;
      var tykch = '0';
      for (var x = 0; x < parseCjData.items.length; x++) {
        var tmp = parseCjData.items[x];
        console.log(tmp)
        if (tmp.kch_id !== tykch) {
          y++;
          tykch = tmp.kch_id;
          showData.scoreList[y] = new Object();
        }
        showData.scoreList[y].kcm = tmp.kcmc;
        showData.scoreList[y].kch = tmp.kch;
        showData.scoreList[y].xf = tmp.xf;
        showData.scoreList[y].hide = 1;
    
        kcType = tmp.xmblmc;
        console.log(kcType)
        if (kcType.indexOf("平时") !== -1) {
          showData.scoreList[y].pscj = tmp.xmcj;
          showData.scoreList[y].pscjbq = kcType;
        } else if (kcType.indexOf("期末") !== -1) {
          showData.scoreList[y].qmcj = tmp.xmcj;
          showData.scoreList[y].qmcjbq = kcType;
        } else { //总评
          showData.scoreList[y].zpcj = tmp.xmcj;
          showData.scoreList[y].zpcjbq = kcType;
        }
      }

      xscjmxUrl = "http://202.206.100.217/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005";
      let cjData2 = await got(xscjmxUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': baseData.cookie
        },
        body: queryScore
      })
      let parseCjData2 = JSON.parse(cjData2.body);

      for (var x = 0; x < parseCjData2.items.length; x++) {
        var tmp = parseCjData2.items[x];
        var kch = tmp.kch;
        for (var y = 0; y < showData.scoreList.length; y++) {
          if (showData.scoreList[y].kch == kch) {
            showData.scoreList[y].jd = tmp.jd;
            showData.scoreList[y].teacher = tmp.jsxm;
            showData.scoreList[y].category = tmp.kcxzmc;
            showData.scoreList[y].cjsfzf = tmp.cjsfzf;
            showData.scoreList[y].kkbm = tmp.kkbmmc;
            showData.scoreList[y].kcxz = tmp.ksxz;
            break;
          }
        }
      }
    } else {
      showData.code = baseData.code;
    }
  }
  return showData;
}
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

    if (baseData.code == 1) {
      showData.code = 1;
      const xscjmxUrl = 'http://202.206.100.217/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N100801&su=' + usersno;
      const queryScore = queryString.stringify({
        xnm: '',
        xqm: '',
        xh_id: usersno,
        _search: false,
        nd: Date.now(),
        'queryModel.showCount': 500,
        'queryModel.currentPage': 1,
        'queryModel.sortName': '',
        'queryModel.sortOrder': 'asc',
        time: 2
      });
      let cjData = await got(xscjmxUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': baseData.cookie
        },
        body: queryScore
      })
      let parseCjData = JSON.parse(cjData.body);
      var score = new Object();
      for (var x = 0; x < parseCjData.items.length; x++) {
        var tmp = parseCjData.items[x];
        showData.scoreList[x] = new Object();
        showData.scoreList[x].kcm = tmp.kcmc;
        showData.scoreList[x].teacher = tmp.jsxm;
        showData.scoreList[x].category = tmp.kcxzmc;
        showData.scoreList[x].zpcj = tmp.bfzcj;
        showData.scoreList[x].xf = tmp.xf;
        showData.scoreList[x].jd = tmp.jd;
        showData.scoreList[x].xn = tmp.xnmmc;
        showData.scoreList[x].xq = tmp.xqmmc;
        showData.scoreList[x].kch = tmp.kch;
      }
    } else {
      showData.code = baseData.code;
    }
  }
  return showData;
}
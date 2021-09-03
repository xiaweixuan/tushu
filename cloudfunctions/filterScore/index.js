// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');
// const NodeRSA = require('node-rsa');
// const key = new NodeRSA();
// key.setOptions({
//   encryptionScheme: 'pkcs1'
// })
cloud.init()
const db = cloud.database()
// 云函数入口函数

exports.main = async(event, context) => {
  const xnm = event.xnm
  const xqm = event.xqm
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
      const xscjmxUrl = 'http://202.206.100.217/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005';
      const queryScore = queryString.stringify({
        xnm: parseInt(xnm),
        xqm: parseInt(xqm),
        xh_id: usersno,
        _search: false,
        nd: Date.now(),
        'queryModel.showCount': 150,
        'queryModel.currentPage': 1,
        'queryModel.sortName': '',
        'queryModel.sortOrder': 'asc',
        time: 0
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
        showData.scoreList[y].jd = tmp.jd;
        showData.scoreList[y].zpcj = tmp.cj;
        showData.scoreList[y].teacher = tmp.jsxm;
        showData.scoreList[y].category = tmp.kcxzmc;
        showData.scoreList[y].cjsfzf = tmp.cjsfzf;
        showData.scoreList[y].kkbm = tmp.kkbmmc;
        showData.scoreList[y].kcxz = tmp.ksxz;
      }
    } else {
      showData.code = baseData.code;
    }
  }
  return showData;
}
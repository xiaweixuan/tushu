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
      var list = [];
      for (var x = 0; x < parseCjData.items.length; x++) {
        var tmp = parseCjData.items[x];
        list[x] = new Object();
        list[x].kcm = tmp.kcmc;
        list[x].teacher = tmp.jsxm;
        list[x].category = tmp.kcxzmc;
        list[x].zpcj = tmp.bfzcj;
        list[x].xf = tmp.xf;
        list[x].jd = tmp.jd;
        list[x].xn = tmp.xnmmc;
        list[x].xq = tmp.xqmmc;
        list[x].kch = tmp.kch;
        list[x].kclb = tmp.kclbmc;
        list[x].hide = 1;
      }
      var tsbx = []; //通识平台课程 必修
      var tsbxs = 0;
      var tsxx = []; //通识平台课程 选修
      var tsxxs = 0;
      var zhsz = []; // 综合素质课程 素质类
      var zhszs = 0;
      var dlbx = []; // 大类平台课程 必修
      var dlbxs = 0;
      var sjbx = []; // 实践教学课程 必修
      var sjbxs = 0;
      var sjxx = []; // 实践教学课程 选修
      var sjxxs = 0;
      var xkpt = []; // 学科平台课程 必修
      var xkpts = 0;
      var zybx = []; // 专业平台课程 必修
      var zybxs = 0;
      var zyxx = []; // 专业平台课程 选修
      var zyxxs = 0;
      var other = []; //其他课程
      var others = 0;
      let jdsum=0;
      for (var x = 0; x < list.length; x++) {
        var tmp = list[x];
        jdsum += parseFloat(tmp.jd);
        if (tmp.zpcj >= 60) {
          var cxf = tmp.xf;
        } else {
          var cxf = 0;
        }
        if (tmp.kclb == "通识平台课程" && tmp.category.indexOf("必修") !== -1) {
          tsbx.push(tmp);
          tsbxs += parseFloat(cxf);
        } else if (tmp.kclb == "通识平台课程" && tmp.category.indexOf("选修") !== -1) {
          tsxx.push(tmp);
          tsxxs += parseFloat(cxf);
        } else if (tmp.kclb == "综合素质课程" && tmp.category.indexOf("素质类") !== -1) {
          zhsz.push(tmp);
          zhszs += parseFloat(cxf);
        } else if (tmp.kclb == "大类平台课程" && tmp.category.indexOf("必修") !== -1) {
          dlbx.push(tmp);
          dlbxs += parseFloat(cxf);
        } else if (tmp.kclb == "实践教学课程" && tmp.category.indexOf("必修") !== -1) {
          sjbx.push(tmp);
          sjbxs += parseFloat(cxf);
        } else if (tmp.kclb == "实践教学课程" && tmp.category.indexOf("选修") !== -1) {
          sjxx.push(tmp);
          sjxxs += parseFloat(cxf);
        } else if (tmp.kclb == "学科平台课程" && tmp.category.indexOf("必修") !== -1) {
          xkpt.push(tmp);
          xkpts += parseFloat(cxf);
        } else if (tmp.kclb == "专业平台课程" && tmp.category.indexOf("必修") !== -1) {
          zybx.push(tmp);
          zybxs += parseFloat(cxf);
        } else if (tmp.kclb == "专业平台课程" && tmp.category.indexOf("选修") !== -1) {
          zyxx.push(tmp);
          zyxxs += parseFloat(cxf);
        } else {
          other.push(tmp);
          others += parseFloat(cxf);
        }

      }
      showData.scoreList.push(lb("通识必修", tsbx, tsbxs, tsbx.length))
      showData.scoreList.push(lb("通识选修", tsxx, tsxxs, tsxx.length))
      showData.scoreList.push(lb("大类必修", dlbx, dlbxs, dlbx.length))
      showData.scoreList.push(lb("学科必修", xkpt, xkpts, xkpt.length))
      showData.scoreList.push(lb("专业必修", zybx, zybxs, zybx.length))
      showData.scoreList.push(lb("专业选修", zyxx, zyxxs, zyxx.length))
      showData.scoreList.push(lb("实践必修", sjbx, sjbxs, sjbx.length))
      showData.scoreList.push(lb("实践选修", sjxx, sjxxs, sjxx.length))
      showData.scoreList.push(lb("综合素质", zhsz, zhszs, zhsz.length))
      showData.scoreList.push(lb("其他课程", other, others, other.length))
      showData.total = tsbxs + tsxxs + dlbxs + xkpts + zybxs + zyxxs + sjbxs + sjxxs + others;
      showData.jd = jdsum.toFixed(2);

    } else {
      showData.code = baseData.code;
    }

  }
  return showData;

  function lb(a, b, c, d) {
    var ls = new Object();
    ls.lbmc = a;
    ls.list = b;
    ls.score = c;
    ls.count = d;
    ls.hide = 1;
    return ls;
  }
}
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
    subject: [],
    subjectCnt: [0, 0, 0, 0, 0, 0, 0, 0]
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
      let startTime = ["", "08:00", "", "09:45", "10:35", "", "14:00", "", "15:45", "16:35", "", "19:00"];
      let endTime = ["", "", "09:30", "10:20", "11:15", "12:05", "", "15:30", "16:20", "", "18:05", "", "20:30", "21:00"];

      const tableUrl = 'http://202.206.100.217/kbcx/xskbcx_cxXsKb.html?gnmkdm=N2151';
      const queryTable = queryString.stringify({
        xnm: 2019,
        xqm: 3,
      });
      let tableData = await got(tableUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': baseData.cookie
        },
        body: queryTable
      })
      let parseTBData = JSON.parse(tableData.body);
      var table = new Object();
      for (var x = 0; x < parseTBData.kbList.length; x++) {
        var tmp = parseTBData.kbList[x];
        showData.subject[x] = new Object();

        showData.subject[x].course = tmp.kcmc;
        showData.subject[x].week = parseInt(tmp.xqj);
        showData.subject[x].weekstart = parseInt(tmp.zcd.substring(0, tmp.zcd.indexOf('-')));

        temp = tmp.zcd.replace("周", "");
        showData.subject[x].weekend = parseInt(temp.substring(temp.indexOf('-') + 1));
        showData.subject[x].teacher = tmp.xm;
        showData.subject[x].address = tmp.cdmc;
        showData.subject[x].start = parseInt(tmp.jcs.substring(0, tmp.jcs.indexOf('-')));
        showData.subject[x].span = parseInt(tmp.jcs.substring(tmp.jcs.indexOf('-') + 1)) - showData.subject[x].start + 1;
        showData.subject[x].time = startTime[showData.subject[x].start] + '-' + endTime[showData.subject[x].start + showData.subject[x].span - 1];
        showData.subject[x].category = tmp.xslxbj;
        showData.subjectCnt[showData.subject[x].week]++;
      }
      showData.xnm = parseTBData.xsxx.XNM;
      showData.xnmc = parseTBData.xsxx.XNMC;
      showData.xqmc = parseTBData.xsxx.XQMMC;
      showData.xm = parseTBData.xsxx.XM;
    } else {
      showData.code = baseData.code;
    }
  }
  return showData;
}
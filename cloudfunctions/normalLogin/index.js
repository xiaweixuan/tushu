// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');
const moment = require('moment');

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const usersno = event.sno
  const userpwd = event.pwd
  let showData = new Object();

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
    const grxxUrl = 'http://202.206.100.217/xsxxxggl/xsgrxxwh_cxXsgrxx.html?gnmkdm=N100801&layout=default&su=' + usersno;
    const infoData = await got(grxxUrl, {
      headers: {
        cookie: baseData.cookie
      }
    });

    const reg = /<p class="form-control-static">([\s\S]*?)<\/p>/g
    var info = [];
    while (res = reg.exec(infoData.body)) {
      info.push(res[1])
    }

    showData.sno = info[0];
    showData.pwd = userpwd;
    showData.studentName = info[1];
    showData.idCard = info[9];
    showData.sex = info[7].trim();
    showData.college = info[24].trim();
    showData.tlass = info[28].trim();

    try {
      await db.collection('wx_user').where({
        openid: wxContext.OPENID
      }).remove()
    } catch (e) {
      console.error(e)
    }
    let uptime = moment(new Date()).add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
    showData.loginCount = 1;
    showData.lastedLogin = uptime;
    try {
      await db.collection('wx_user').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          openid: wxContext.OPENID,
          sno: showData.sno,
          pwd: showData.pwd,
          studentName: showData.studentName,
          idCard: showData.idCard,
          sex: showData.sex,
          college: showData.college,
          tlass: showData.tlass,
          loginCount: 1,
          lastedLogin: uptime
        }
      })
    } catch (e) {
      console.error(e)
    }
  } else {
    showData.code = baseData.code;
  }

  return showData;
}
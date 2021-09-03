// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment');
cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  var userInfo = new Object();
  try {
    let userData = await db.collection('wx_user').where({
      openid: wxContext.OPENID // 填入当前用户 openid
    }).get()
    if (userData.data.length >= 1) {
      userInfo.code = 1;
      userInfo.sno = userData.data[0].sno;
      userInfo.sex = userData.data[0].sex;
      userInfo.college = userData.data[0].college;
      userInfo.tlass = userData.data[0].tlass;
      userInfo.studentName = userData.data[0].studentName;
      userInfo.loginCount = userData.data[0].loginCount;
      userInfo.lastedLogin = userData.data[0].lastedLogin;

      let uptime = moment(new Date()).add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
      try {
        await db.collection('wx_user').where({
            openid: wxContext.OPENID
          })
          .update({
            data: {
              loginCount: _.inc(1),
              lastedLogin: uptime
            },
          })
      } catch (e) {
        console.error(e)
      }
    } else {
      userInfo.code = 0;
    }

  } catch (e) {
    userInfo.code = 2;
  }
  return userInfo;
}
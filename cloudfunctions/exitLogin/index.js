// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  var infoData = new Object();
  try {
    let delData = await db.collection('wx_user').where({
      openid: wxContext.OPENID
    }).remove()
    if (delData.stats.removed >= 1) {
      infoData.code = 1;
    } else {
      infoData.code = 0;
    }
  } catch (e) {
    console.log(e)
    infoData.code = 2;
  }
  return infoData;
}
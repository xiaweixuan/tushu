// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const open_id = wxContext.OPENID;
  let result = await db.collection('vip_list').where({
    open_id: open_id // 填入当前用户 openid
  }).get();
  let ret = new Object();

  console.log(result.data)
  if (result.data.length > 0) {
    ret.code = 1;
  } else {
    ret.code = 0;
  }
  return ret;
}
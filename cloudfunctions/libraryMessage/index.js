// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment');

cloud.init()
const db = cloud.database(); //初始化数据库
const _ = db.command //初始化条件查询


// 云函数入口函数
exports.main = async(event, context) => {

  let to = moment().unix();
  console.log(to)

  const result = await db.collection('SeatNotice').where({
    expireTime: _.lt(to + 20 * 60)
  }).get();

  const noticeList = result.data;

  for (var i = 0; i < noticeList.length; i++) {
    console.log(noticeList[i]);
    const sendResult=await cloud.callFunction({
      name: 'sendMessage',
      data: {
        FORMID: noticeList[i].formid,
        OPENID: noticeList[i].openid,
        TEMPLATEID: noticeList[i].templateid,
        PAGE: noticeList[i].page,
        VALUE1: noticeList[i].value1,
        VALUE2: noticeList[i].value2
      }
    });
    console.log(sendResult);
  }

  const rmRes = await db.collection('SeatNotice').where({
    expireTime: _.lt(to + 20 * 60)
  }).remove();
  console.log("--------此次更新结果------");
  console.log(rmRes);
}
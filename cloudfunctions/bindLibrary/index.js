// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const usersno = event.sno;
  const userpwd = event.pwd;
  const base = await cloud.callFunction({
    name: 'libraryBase',
    data: {
      sno: usersno,
      pwd: userpwd
    }
  })
  const baseData = base.result;

  let showData = new Object();
  if (baseData.code == 1) {
    showData.code = 1;
  } else {
    showData.code = 0;
  }
  return showData;
}
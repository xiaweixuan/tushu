// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs');
const path = require('path');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var data = fs.readFileSync(path.join(__dirname, 'notice.json'));
  console.log("同步读取: " + data.toString());

  return JSON.parse(data.toString());
}
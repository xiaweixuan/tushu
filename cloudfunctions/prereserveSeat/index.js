// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const fs = require('fs');

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async(event, context) => {

  let preList = await db.collection('prereserveList').orderBy('priority', 'desc').where({
    finish: false
  }).get();
  preList = preList.data;
  console.log("当前未完成的数据有");
  console.log(preList);
  let succNum = 0;
  let sum = preList.length;
  console.log("总共需要操作" + sum + "条");
  return new Promise((resolve, reject) => {

    for (var index = 0; index < preList.length; index++) {
      console.log("即将call第" + (index + 1) + "条")
      cloud.callFunction({
        name: 'getPreSeat',
        data: {
          data: preList[index]
        }
      }).then(res => {
        succNum++;
        console.log("完成了" + succNum + "条，一共" + sum + "条")
        if (succNum >= sum) resolve();
      }).catch(err => {
        console.log("promise错误");
        console.log(err)
      })
    }
  })


}
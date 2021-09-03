// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const result = await db.collection('prereserveList').get();
  const list = result.data;
  return new Promise((resolve, reject) =>{
    let count = 0;
    for (var i = 0; i < list.length; i++) {
      console.log('开始了' + list[i].sno)
      cloud.callFunction({
        name: 'libraryBase',
        data: {
          sno: list[i].sno,
          pwd: list[i].pwd
        }
      }).then(res => {
        console.log(res.result)
        db.collection('prereserveList').where({
          sno: res.result.sno
        }).update({
          data: {
            cookie: res.result.cookie
          }
        })
        cloud.callFunction({
          name: 'parsePrereserveSeat',
          data: {
            cookie: res.result.cookie
          }
        }).then( ress => {
          console.log("调用第二个完成")
          count = count + 1;
          console.log("count = " + count + "，length = " + list.length)
          if (count >= list.length) {
            resolve(0);
          }
        })
        
      }).catch(err => {
        console.log("Promise错误:")
        console.log(err);
        reject(1);
      })
    }
  })
}
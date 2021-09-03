// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const moment = require('moment');

cloud.init()
const db = cloud.database(); //初始化数据库

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID;
  const cookie = updateCookie(event.cookie);
  const formid = event.formid; //数组['abc','asdf']
  const tempid = 'Ult5l2HNQjwHjbj1hFy7MUklgxek9-rD2KmMneAnZUk';
  const libid = event.libid;
  const key = event.key;
  const datakey = event.datakey;

  const csUrl = 'https://wechat.v2.traceint.com/index.php/reserve/get/libid=' + libid + "&" + key + "=" + datakey + "&yzm=";


  console.log(csUrl);
  console.log(updateCookie(cookie))
  let result = await got(csUrl, {
    baseUrl: csUrl,
    headers: {
      'Accept': 'application / json, text/javascript, */ *; q=0.01',
      'Sec-Fetch-Mode': 'cors',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Mobile Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      cookie: cookie,
    }
  });

  console.log(result.body);
  //0成功，1失败
  resultJson = JSON.parse(result.body);

  if (resultJson.code == 0) {
    // 访问getSeatList获得座位信息
    const seat = await cloud.callFunction({
      name: 'getSeatList',
      data: {
        cookie: cookie
      }
    });

    console.log("此次发的openId" + openid)
    //发通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        FORMID: event.formid[0],
        OPENID: openid,
        TEMPLATEID: tempid,
        PAGE: "pages/index/index",
        VALUE1: seat.result.data.selectedSite,
        VALUE2: seat.result.data.timeWarn
      }
    });

    await db.collection('SeatNotice').add({
      data: {
        openid: openid,
        formid: event.formid[1],
        templateid: tempid,
        page: "pages/index/index",
        value1: seat.result.data.selectedSite,
        value2: seat.result.data.timeWarn,
        expireTime: moment().add(45, "minutes").unix()
      }
    });
  }


  return {
    code: resultJson.code,
    msg: resultJson.msg
  }

}

function updateCookie(data) {
  const reg = /\|(\d+?)\|/;
  return data.replace(reg, '|' + parseInt(Date.now() / 1000) + '|')
}
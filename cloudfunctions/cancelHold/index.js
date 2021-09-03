// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const queryString = require('query-string');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const cookie = event.cookie;

  //先取取消暂离的token
  const tokenUrl = 'https://wechat.v2.traceint.com/index.php/reserve/token.html';
  const queryToken = queryString.stringify({
    type: 'hold_cancle'
  });

  let token = await got(tokenUrl, {
    type: 'POST',
    headers: {
      'cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: queryToken
  })

  token = JSON.parse(token.body).msg;
  console.log(token);

  // 真正的取消暂离
  const CancleHoldUrl = 'https://wechat.v2.traceint.com/index.php/hold/cancle.html';
  const queryCHold = queryString.stringify({
    token: token
  });

  const result = await got(CancleHoldUrl, {
    type: 'POST',
    headers: {
      'cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: queryCHold
  });

  const json = JSON.parse(result.body);

  return {
    code: json.code,
    msg: json.msg
  };
}
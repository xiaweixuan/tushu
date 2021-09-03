// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');
const queryString = require('query-string');

cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const cookie = event.cookie;
  //取出暂离需要的token
  const tokenUrl = 'https://wechat.v2.traceint.com/index.php/hold/ajaxsubmit/doit=confirm.html';
  let token = await got(tokenUrl, {
    headers: {
      cookie: cookie
    }
  });

  token = JSON.parse(token.body);
  token = token.data.token;

  //暂离操作
  const holdUrl = 'https://wechat.v2.traceint.com/index.php/hold/ajaxsubmit.html';
  const queryHold = queryString.stringify({
    token: token
  });


  const result = await got(holdUrl, {
    type: 'POST',
    headers: {
      'cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: queryHold
  })

  //会自动转Unicode
  const json = JSON.parse(result.body);

  const code = json.code;
  const msg = json.msg;

  return {
    code: code,
    msg: msg
  };

}
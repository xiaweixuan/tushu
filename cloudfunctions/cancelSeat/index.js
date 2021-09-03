// 云函数入口文件
const cloud = require('wx-server-sdk');
const queryString = require('query-string');
const got = require('got');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  //只用cookie把当前选的座位退了
  const cookie = event.cookie;

  const baseUrl = "https://wechat.v2.traceint.com";

  //先取token
  const tokenUrl = baseUrl + "/index.php/reserve/token.html";

  const queryCancel = queryString.stringify({
    type: 'cancle', //他们写错了
  });

  const tokenJson = await got(tokenUrl, {
    type: 'POST',
    headers: {
      'cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: queryCancel
  });

  const token = JSON.parse(tokenJson.body).msg;

  const cancelUrl = baseUrl + "/index.php/cancle/index?t=" + token;

  const result = await got(cancelUrl, {
    headers: {
      'cookie': cookie
    }
  });

  //取成功或失败信息
  const infoReg = /0">(.+?)<\/h2>/;
  const info = infoReg.exec(result.body);

  //没取到，说明是学习中已退坐
  if (info == null) {
    const timeReg = /&nbsp;(.+?)&nbsp;/g;
    const hour = timeReg.exec(result.body)[1];
    const minute = timeReg.exec(result.body)[1];
    const percent = timeReg.exec(result.body)[1];
    return {
      code: 1,
      hour: hour,
      mimute: minute,
      percent: percent
    }
  }

  let code = -1;
  let msg = "令牌失效，有效期为2分钟";
  if (info[1] == "主动退座成功[1]") {
    code = 0;
    msg = "已退座";
  }

  return {
    code: code,
    info: msg
  };

}
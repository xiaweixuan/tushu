// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');
const queryString = require('query-string');

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const sno = event.sno;
  const pwd = event.pwd;

  const loginUrl = 'https://wechat.v2.traceint.com/index.php/user/loginSubmit.html';

  const queryLogin = queryString.stringify({
    stud_no: sno,
    user_passwd: pwd,
    isajax: 1
  });
  let cookie = 'FROM_CODE=WwsBBFEC;FROM_TYPE=h5;';
  let loginData = await got(loginUrl, {
    method: 'POST',
    baseUrl: 'https://wechat.v2.traceint.com/index.php/user/login.html',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie: cookie,
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Mobile Safari/537.36',
      'sec-fetch-mode': 'cors',
    },
    body: queryLogin
  })
  let parseLoginData = JSON.parse(loginData.body);
  console.log(parseLoginData)
  let showData = new Object();
  showData.sno = sno;
  if (parseLoginData.code == 0) { //0代表登录成功
    const wechatReg = /wechatSESS_ID=([\s\S]*?);/;
    cookie = cookie + 'wechatSESS_ID=' + wechatReg.exec(loginData.headers['set-cookie'][0])[1] + ';';
    const serverReg = /SERVERID=([\s\S]*?);/
    cookie = cookie + 'SERVERID=' + serverReg.exec(loginData.headers['set-cookie'][1])[1] + ';';
    showData.code = 1;
    showData.cookie = cookie;
  } else {
    showData.code = 0;
  }
  return showData;
}
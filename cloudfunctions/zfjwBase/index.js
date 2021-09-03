// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');
const NodeRSA = require('node-rsa');
const key = new NodeRSA();
key.setOptions({
  encryptionScheme: 'pkcs1'
})
cloud.init()
// 云函数入口函数
// code 1成功 0 失败 -1参数缺少
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const usersno = event.sno
  const userpwd = event.pwd
  // const usersno = '2016014923'
  // const userpwd = 'f1747481'

  let showData = new Object();
  if (typeof usersno == "undefined" || usersno == null || usersno == "" || userpwd == "undefined" || userpwd == null || userpwd == "") {
    showData.code = -1;
  } else {
    const cookieUrl = 'http://jwgl.hebtu.edu.cn/xtgl/login_slogin.html?language=zh_CN&_t=' + Date.now();

    let result = await got(cookieUrl);
    const jwReg = /(.*) path=/;
    let cookie = jwReg.exec(result.rawHeaders[1])[1];
    const sessionReg = /(.*) Path=\/; HttpOnly/;
    cookie += sessionReg.exec(result.rawHeaders[5])[1];
    const tokenReg = /name="csrftoken" value="(.*)"/;
    const csrftoken = tokenReg.exec(result.body)[1];
    console.log(csrftoken)
    console.log(cookie)

    const rsaUrl = 'http://202.206.100.217/xtgl/login_getPublicKey.html?time=' + Date.now() + '&_=' + Date.now();
    result = await got(rsaUrl, {
      headers: {
        cookie: cookie
      }
    });

    const exponent = Buffer.from(JSON.parse(result.body).exponent, 'base64').toString('hex');
    const modulus = Buffer.from(JSON.parse(result.body).modulus, 'base64').toString('hex');
    console.log(exponent)
    console.log(modulus)

    key.importKey({
      n: Buffer.from(modulus, 'hex'),
      e: Buffer.from(exponent, 'hex'),
    }, 'components-public');

    const query = queryString.stringify({
      yhm: usersno,
      mm: key.encrypt(userpwd, 'base64'),
      csrftoken: csrftoken
    });
    console.log(query)
    const loginUrl = 'http://jwgl.hebtu.edu.cn/xtgl/login_slogin.html?time=' + Date.now();
    result = await got(loginUrl, {
      method: 'POST',
      followRedirect: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      body: query
    })
    
    //jw = 49737.7722.7938.0000; JSESSIONID = 012F3C4E812D3500E24AB459AF1FD13A;

    if (result.statusCode == 302) {
      const newSess = sessionReg.exec(result.headers['set-cookie'][2])[1];
      console.log(newSess)
      cookie = cookie.replace(/JSESSIONID=.+/, newSess);
      console.log(cookie)

      showData.code = 1;
      showData.cookie = cookie;
    } else {
      showData.code = 0;
    }
  }

  return showData;
}
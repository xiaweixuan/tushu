// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const queryString = require('query-string');
cloud.init();
const db = cloud.database();

// 云函数入口函数
//  传学号密码和barcode条码号
// 返回值：code = 0 代表登陆成功 msg还书结果 ,code = 1登陆失败, msg 错误信息
exports.main = async (event, context) => {

  // 数据库取一条jession
  let aJess = await db.collection('JsessionAndCode').where({
    doing: false
  }).limit(1).get();

  if (aJess.data.length == 0) {
    console.log("此次没有闲置的连接");
    return {
      code: 1,
      msg: "服务器繁忙，请稍后访问"
    }
  }

  aJess = aJess.data[0];
  console.log("此次使用的Jession = " + aJess);

  //改成正在执行状态，防止并发使用同一条session
  await db.collection('JsessionAndCode').where({
    _id: aJess._id
  }).update({
    data: {
      doing: true
    }
  });

  const sno = event.sno;
  const pwd = event.pwd;
  const barcode = event.barcode;


  const loginUrl = 'http://202.206.108.2:8082/m/reader/check_login.action'; //登录地址

  let jsession = aJess.jsession;; //数据库取

  const queryLogin = queryString.stringify({
    name: sno, //用户名
    passwd: pwd, //借阅（图书馆）密码
    type: 1, //证件类型 学号方式
    verifyCode: aJess.code //jesission对应的验证码
  });

  let bData = await got(loginUrl, { //登录认证
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie: 'JSESSIONID=' + jsession + ';'
    },
    body: queryLogin
  })

  let parsebData = JSON.parse(bData.body); //转换认证结果格式

  //返回值
  let code = "";
  let msg = "";

  if (parsebData.success == true) {
    code = "0";
    const renewUrl = "http://202.206.108.2:8082/m/reader/renew.action?barcode=" + barcode;
    let result = await got(renewUrl, {
      headers: {
        cookie: 'JSESSIONID=' + jsession + ';'
      }
    });
    //关键信息
    const msgReg = /"weui_msg_title">(.+?)<\/h2>/;
    msg = msgReg.exec(result.body)[1];
  } else {
    code = "1";
    msg = "用户名或密码错误"
  }

  //改成未执行状态 放出此条session
  await db.collection('JsessionAndCode').where({
    _id: aJess._id
  }).update({
    data: {
      doing: false
    }
  });

  return {
    code: code,
    msg: msg
  }

}
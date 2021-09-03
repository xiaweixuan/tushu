// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const fs = require('fs');

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async(event, context) => {


  console.log("本次操作的是" + event.data.sno)
  return new Promise((resolve, reject) => {
    chooseUser(event.data).then(res => {
      console.log("抢座结果：");
      console.log(res);
      //修改数据库标记
      updateDb(res.data.sno).then(ress => {
        if (res.code == 0) {
          //发成功通知
          console.log("即将向" + res.data.sno + "发送成功通知");
          const suTemId = "nKNSMskInlr_vITqOzhSf1WcPqOgofxSDed5FXSEZg4";
          cloud.callFunction({
            name: 'sendMessage',
            data: {
              FORMID: res.data.formid[0],
              OPENID: res.data._openid,
              TEMPLATEID: suTemId,
              PAGE: "pages/index/index",
              VALUE1: res.place,
              VALUE2: res.seat,
              VALUE3: "请在次日打开小程序查看签到时间"
            }
          });
        } else {
          //发失败通知
          console.log("即将向" + res.data.sno + "发送失败通知");
          const faTemId = "YOqp5INiWJdqzvVzlh3yUCHHusOVH_MSbXEBdqy7ufY";
          cloud.callFunction({
            name: 'sendMessage',
            data: {
              FORMID: res.data.formid[1],
              OPENID: res.data._openid,
              TEMPLATEID: faTemId,
              PAGE: "pages/index/index",
              VALUE1: "无",
              VALUE2: res.msg
            }
          });
        }
      })
    })
  })
}

async function updateDb(sno) {
  await db.collection('prereserveList').where({
    sno: sno
  }).update({
    data: {
      finish: true
    }
  });
}


async function chooseUser(data) {

  let cookie = updateCookie(data.cookie);
  for (let i = 0; i < data.datakeys.length; i++) {

    const res = await chooseSeat(data.libid, data.datakeys[i], cookie);

    if (res.code == 0) {
      //await opDataBase(data.sno);
      console.log(data.sno + "抢座" + data.libname + data.nums[i] + "号座位成功，这是Ta的第" + (i + 1) + "个座位");
      return {
        code: 0,
        place: data.libname,
        seat: data.nums[i],
        msg: "请在次日规定时间内到馆签到",
        data: data
      };
    }

  }

  console.log(data.sno + "抢座失败");
  return {
    code: 1,
    msg: "今天的图书馆真是太火爆了呢",
    data: data
  };

}



async function chooseSeat(libid, datakey, cookie) {

  console.log("本次抢的libid = " + libid + "，datakey = " + datakey + "，cookie = " + cookie);
  // return {
  //   code:0,
  //   msg:"测试抢座成功"
  // }

  //const roomUrl = 'https://wechat.v2.traceint.com/index.php/reserve/layoutApi/action=prereserve_event&libid=' + libid;
  const roomUrl = 'https://wechat.v2.traceint.com/index.php/prereserve/index.html';

  //取出key
  let key = "";
  let m = 0;
  while (true) {
    if (++m > 10) {
      return {
        code: 1,
        msg: "key找不着"
      }
    }
    console.log('进入解密循环')
    let mainBody = await got(roomUrl, {//去掉自动重试，适量缩小时间
      headers: {
        cookie: cookie
      }
    });

    console.log('请求主页请求了' + (mainBody.retryCount + 1) + '次');
    mainBody = mainBody.body;
    key = await parseKey(mainBody, cookie);

    if (key == null) {
      console.log(mainBody)
      console.log("没有找到key，再找一次");
      continue;
    }
    console.log('已经解密')
    break;
  }

  console.log("key = " + key);

  const preSeat = 'https://wechat.v2.traceint.com/index.php/prereserve/save/libid=' + libid + "&" + key + "=" + datakey + "&yzm=";

  //抢座循环
  m = 0;
  while (true) {
    const result = await got(preSeat, {//抢座添加最大超时
      headers: {
        cookie: cookie
      },
      json: true,
      timeout: 1000
    });

    let jsonRes = result.body;
    console.log('这次抢的座' + datakey);
    console.log('本次网址' + preSeat);
    console.log("抢座结果 = ");
    console.log(jsonRes);

    if (++m > 10 || (jsonRes.code != 0 && jsonRes.code != 1)) {//添加最多次数
      console.log("抢座异常，结果是");
      console.log(jsonRes);
    } else {
      console.log("本次抢座已结束，结果是");
      console.log(jsonRes);
      return jsonRes;
    }
  }

}


async function opDataBase(sno) {
  return await db.collection('prereserveList').where({
    sno: sno
  }).remove();
}




//取本次进入教室随机的Key，用来选座(Key = datakey)
async function parseKey(data, cookie) {
  //取获取Key访问的url

  const keyUrlReg = new RegExp("https://static.wechat.v2.traceint.com/template/theme2/cache/layout/(.+?).js");

  let keyUrl = keyUrlReg.exec(data);
  //console.log(data);
  // console.log("找到的keyUrl = " + keyUrl[0])

  if (keyUrl == null) {
    return null;
  }

  keyUrl = keyUrl[0];

  console.log(" keyUrl = " + keyUrl);
  //获得官方取key的js文件
  let js = await got(keyUrl, {
    headers: {
      cookie: updateCookie(cookie)
    }
  });

  js = js.body;

  //取出关键的方法名
  const keyFuncReg = /&"\+(.*?)\+/;
  const keyFunc = keyFuncReg.exec(js)[1];
  const tAjax = /T.ajax.*\)/;

  //把整个大方法替换，只要小方法
  js = js.replace(tAjax, "return " + keyFunc + ";");
  //把选座方法导出
  js += "module.exports.getKey=reserve_seat;";

  const rnd = Math.random();

  //新建一个js文件
  const jsFile = js;
  await fs.writeFileSync('/tmp/writeMe.js' + rnd, jsFile);

  //引入新建的文件
  const myJs = require('/tmp/writeMe.js' + rnd);

  console.log("一顿操作后取到的方法名 =" + myJs.getKey());
  return myJs.getKey();

}

function updateCookie(data) {
  const reg = /\|(\d+?)\|/;
  return data.replace(reg, '|' + parseInt(Date.now() / 1000) + '|')
}
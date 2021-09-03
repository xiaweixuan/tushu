// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');
const queryString = require('query-string');
const fs = require('fs');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const cookie = updateCookie(event.cookie);
  const uri = event.uri;

  const domain = 'https://wechat.v2.traceint.com';

  let showData = new Object();
  showData.code = 1;
  console.log(domain + uri);
  


  let seatData = await got(domain + uri, {
    baseUrl:'https://wechat.v2.traceint.com/index.php/reserve/index.html',
    headers: {
      cookie: cookie,
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9',
      'referer': 'https://wechat.v2.traceint.com/index.php/reserve/index.html',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    },
  });
  showData.seatList = pareseSeatData(seatData.body);

  const key = await parseKey(seatData.body, cookie);
  console.log(key);
  showData.key = key;
  return showData;
}

function pareseSeatData(data) { //  1座位   2桌子  3门  4人座   5暂离   6 未签到
  let resultData = new Object();
  let list = [];
  const seatReg = /<div class="grid_cell  grid_1" data-key="(.*),(.*)" style=".*">[\s\S]*?<em>(.*)<\/em>[\s\S]*?<\/div>/g

  while (result = seatReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);
    const num = parseInt(result[3]);

    list.push({
      x: x,
      y: y,
      num: num,
      type: 1
    })
  }

  const deskReg = /<div class="grid_cell grid_2" data-key="(.*),(.*)" style=".*">[\s\S]*?<em><\/em>[\s\S]*?<\/div>/g
  while (result = deskReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);

    list.push({
      x: x,
      y: y,
      type: 2
    })
  }

  const doorReg = /<div class="grid_cell grid_3" data-key="(.*),(.*)" style=".*">[\s\S]*?<em><\/em>[\s\S]*?<\/div>/g
  while (result = doorReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);

    list.push({
      x: x,
      y: y,
      type: 3
    })
  }

  const peopleReg = /<div class="grid_cell  grid_active grid_status3" data-key="(.*),(.*)" style=".*">[\s\S]*?<em>(.*)<\/em>[\s\S]*?<\/div>/g
  while (result = peopleReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);
    const num = parseInt(result[3]);
    list.push({
      x: x,
      y: y,
      num: num,
      type: 4
    })
  }

  const leaveReg = /<div class="grid_cell  grid_active grid_status4" data-key="(.*),(.*)" style=".*">[\s\S]*?<em>(.*)<\/em>[\s\S]*?<\/div>/g
  while (result = leaveReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);
    const num = parseInt(result[3]);
    list.push({
      x: x,
      y: y,
      num: num,
      type: 5
    })
  }

  const noSignReg = /<div class="grid_cell  grid_active grid_status2" data-key="(.*),(.*)" style=".*">[\s\S]*?<em>(.*)<\/em>[\s\S]*?<\/div>/g
  while (result = noSignReg.exec(data)) {
    const x = parseInt(result[1]);
    const y = parseInt(result[2]);
    const num = parseInt(result[3]);
    list.push({
      x: x,
      y: y,
      num: num,
      type: 6
    })
  }

  let maxX = 0;
  let maxY = 0;
  for (let item of list) {
    if (item.x > maxX) {
      maxX = item.x;
    }
    if (item.y > maxY) {
      maxY = item.y;
    }
  }
  resultData.list = list;
  resultData.maxX = maxX;
  resultData.maxY = maxY;
  return resultData;

}

//取本次进入教室随机的Key，用来选座(Key = datakey)
async function parseKey(data, cookie) {
  //取获取Key访问的url
  const keyUrlReg = new RegExp("https://static.wechat.v2.traceint.com/template/theme2/cache/layout/(.+?).js");
  const keyUrl = keyUrlReg.exec(data)[0];
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

  // //删除旧文件
  // try{
  //   await fs.unlinkSync('/tmp/writeMe.js');
  // }catch(e){
  //   console.log(e)
  // }
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
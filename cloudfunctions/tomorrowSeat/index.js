// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  let seatData = await got('https://wechat.v2.traceint.com/index.php/reserve/layout/libid=477.html&1568111003', {
    headers: {
      cookie: 'FROM_CODE=WwsBBFEC;FROM_TYPE=h5;wechatSESS_ID=bd9c163a6c60d774c6e1b36c2681f16df732029b79f93ff7;SERVERID=d3936289adfff6c3874a2579058ac651|1568514656|1568514656;'
    }
  })
  seatData=seatData.body;

  //console.log(seatData)
  let result = pareseSeatData(seatData);
  try {
    return await db.collection('tomorrow_seat').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        seat: result,
        rname: '报刊阅览室 (2楼)',
        rid: 477,
      }
    })
  } catch (e) {
    console.error(e)
  }
  console.log(result);


  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
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
      type: 1
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
      type: 1
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
      type: 1
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
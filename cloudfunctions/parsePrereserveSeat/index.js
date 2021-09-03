// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const cookie = updateCookie(event.cookie);
  const mainUrl = 'https://wechat.v2.traceint.com/index.php/reserve/index.html';

  let result = await got(mainUrl, {
    headers: {
      cookie: cookie
    }
  });

  result = result.body;
  const noUsuallySeatReg = /<td lib_id="" seat_key="">/g;
  const noUsuallySeat = result.match(noUsuallySeatReg);

  //=2说明没有设置常用座位

  if (noUsuallySeat == null || noUsuallySeat.length != 2) {
    console.log('这位同学有常用座位，不用操作');
    return true;
  }

  //图书借阅2区66号座位
  const setUsuallySeatUrl = 'https://wechat.v2.traceint.com/index.php/settings/seatsubmit.html?libid=1027&id=0&key=14,7&yzm='
  console.log('这位同学没有设置常用座位，需要帮它设置一个，即将设置');
  let setResult = await got(setUsuallySeatUrl, {
    headers: {
      cookie: cookie
    },
    json: true
  });
  setResult = setResult.body;

  console.log('设置结果如下:');
  console.log(setResult);

  return true;
}

function updateCookie(data) {
  const reg = /\|(\d+?)\|/;
  return data.replace(reg, '|' + parseInt(Date.now() / 1000) + '|')
}
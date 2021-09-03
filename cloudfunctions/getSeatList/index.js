// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');
const queryString = require('query-string');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const cookie = event.cookie;
  let showData = new Object();

  //主页地址
  const mainUrl = 'https://wechat.v2.traceint.com/index.php/reserve/index.html';

  let mainData = await got(mainUrl, {
    baseUrl:'https://wechat.v2.traceint.com/index.php/user/login.html',
    headers: {
      cookie: updateCookie(cookie),
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'max-age=0',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Mobile Safari/537.36'

    },
  });
  //主页html
  mainData = mainData.body;
  console.log(mainData)

  const statusReg = /block-header">(.+?)<\/div>/;
  const status = statusReg.exec(mainData)[1];

  //判断账号状态，根据不同状态编辑信息
  switch (status) {
    case "座位预订":
      showData.status = 0;
      showData.data = parseRoomData(mainData);
      break;
    case "到馆签到":
      showData.status = 1;
      showData.data = await parseSelected(mainData, cookie);
      break;
    case "学习中":
      showData.status = 2;
      showData.data = await parseStudying(mainData, cookie);
      break;
    case "暂留中":
      showData.status = 3;
      showData.data = await parseHolding(mainData);
  }
  return showData;
}

//已经预订座位（还没有签到），返回退订token和二维码url
async function parseSelected(data, cookie) {

  const selectedSiteReg = /<h3>(.+?)<\/h3>/;
  const timeWarnReg = /<\/h3>\n(.+?)<br>/;

  const selectedSite = selectedSiteReg.exec(data)[1];
  const timeWarn = timeWarnReg.exec(data)[1];

  //其他子网址加这个
  const baseUrl = "https://wechat.v2.traceint.com";


  //找寻二维码网址
  const signReg = /href="(.+?)">签到/;
  const signUrl = signReg.exec(data)[1];

  const qrUrl = baseUrl + signUrl;
  const qrBase = await got(qrUrl, {
    headers: {
      cookie: cookie
    }
  });

  const qrCodeReg = /qrcode'\ssrc="(.+?)"/;
  const qrCodeUrl = baseUrl + qrCodeReg.exec(qrBase.body)[1];

  const selectData = {};

  selectData.selectedSite = selectedSite;
  selectData.timeWarn = timeWarn;
  selectData.qrCodeUrl = qrCodeUrl;

  return selectData;

}

//当前状态没选座：取阅览室信息
function parseRoomData(data) {
  let list = [];
  const titleReg = /<h4 class="list-group-item-heading">(.*)<span class="badge" style="background: none; color:.*; font-size: 16px;">(.*)\/(.*)<\/span>/g
  const dataReg = /data-url="([\s\S]*?)"/g;
  const libIdReg = /libid=(.+?).html/;
  const contentReg = /<p class="list-group-item-text">(.*)<\/p>/g
  const warnReg = /red'>(.*)</;
  while (result = titleReg.exec(data)) {
    const room = result[1].trim();
    const used = parseInt(result[2]);
    const total = parseInt(result[3]);
    const uri = dataReg.exec(data)[1];
    const libId = libIdReg.exec(uri)[1];
    const content = contentReg.exec(data);
    const time = content[1].replace(/<br.*span>/, '').trim();
    const warn = warnReg.exec(content[1]);
    let warnTitle = '';
    if (warn != null) {
      warnTitle = warn[1];
    }

    list.push({
      libId: libId,
      room: room,
      used: used,
      total: total,
      uri: uri,
      time: time,
      warn: warnTitle,
      statu: 1
    })
  }

  const titleCloseReg = /<h4 class="list-group-item-heading">(.*)<span class="badge">(.*)<\/span>/g
  while (result = titleCloseReg.exec(data)) {
    const room = result[1].trim();
    const uri = dataReg.exec(data)[1];
    const content = contentReg.exec(data);
    const time = content[1].replace(/<br.*span>/, '').trim();
    const warn = warnReg.exec(content[1]);
    let warnTitle = '';
    if (warn != null) {
      warnTitle = warn[1];
    }

    list.push({
      room: room,
      uri: uri,
      time: time,
      warn: warnTitle,
      statu: 0
    })
  }

  return list;
}

function updateCookie(data) {
  const reg = /\|(\d+?)\|/;
  return data.replace(reg, '|' + parseInt(Date.now() / 1000) + '|')
}


async function parseStudying(data, cookie) {
  const selectedSiteReg = /<h3>(.+?)<\/h3>/;
  const studiedTimeReg = /<\/h3>\n(.+?)\s*<br>/;
  const timeWarningReg = /<br>\s*(.+?)<div/;


  const selectedSite = selectedSiteReg.exec(data)[1];
  const studiedTime = studiedTimeReg.exec(data)[1];
  const timeWarning = timeWarningReg.exec(data)[1];

  //假装它真能取出来图片网址
  const signReg = /暂离.+?href="(.*?)">扫码续时/;
  const sign = signReg.exec(data)[1];

  const baseUrl = "https://wechat.v2.traceint.com";

  const qrUrl = baseUrl + sign;

  //访问二维码那个页面，取出来二维码地址
  const qrBase = await got(qrUrl, {
    headers: {
      cookie: cookie
    }
  });

  const qrCodeReg = /qrcode'\ssrc="(.+?)"/;
  const qrCodeUrl = baseUrl + qrCodeReg.exec(qrBase.body)[1];

  const result = {};

  result.qrCodeUrl = qrCodeUrl;
  result.selectedSite = selectedSite;
  result.studiedTime = studiedTime;
  result.timeWarning = timeWarning;

  return result;
}

function parseHolding(data) {
  const selectedSiteReg = /<h3>(.+?)<\/h3>/;
  const timeWarnReg = /<\/h3>\n(.+?)<br>/;

  const selectedSite = selectedSiteReg.exec(data)[1];
  const timeWarn = timeWarnReg.exec(data)[1];

  let result = {};
  result.selectedSite = selectedSite;
  result.timeWarn = timeWarn;
  return result;
}
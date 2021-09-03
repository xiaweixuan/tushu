// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');

cloud.init()
const db = cloud.database()
// 云函数入口函数

exports.main = async(event, context) => {
  const rm = event.rm;
  const xqj = event.xqj;
  const jcd = event.jcd;
  const wxContext = cloud.getWXContext()

  var showData = {
    code: '',
    roomList: []
  };
  let userData = await db.collection('wx_user').where({
    openid: wxContext.OPENID // 填入当前用户 openid
  }).get()
  if (userData.data.length == 0) {
    showData.code = 0
  } else {
    const usersno = userData.data[0].sno
    const userpwd = userData.data[0].pwd

    const base = await cloud.callFunction({
      name: 'zfjwBase',
      data: {
        sno: usersno,
        pwd: userpwd
      }
    })
    const baseData = base.result;

    if (baseData.code == 1) {
      showData.code = 1;
      const roomUrl = 'http://202.206.100.217/cdjy/cdjy_cxKxcdlb.html?doType=query&gnmkdm=N2155';
      const queryRoom = queryString.stringify({
        xnm: 2019,
        xqm: 3,
        xqh_id: 4,
        jyfs: 0,
        zcd: 1,
        fwzt: 'cx',
        lh: rm,
        xqj: xqj,
        jcd: jcd,
        _search: false,
        nd: Date.now(),
        'queryModel.showCount': 100,
        'queryModel.currentPage': 1,
        'queryModel.sortName': 'cdbh',
        'queryModel.sortOrder': 'asc',
        time: 5
      });
      let roomData = await got(roomUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': baseData.cookie
        },
        body: queryRoom
      })
      let parseRmData = JSON.parse(roomData.body);
      showData
      for (var x = 0; x < parseRmData.items.length; x++) {
        var tmp = parseRmData.items[x];
        showData.roomList[x] = new Object();
        showData.roomList[x].address = tmp.cdbh;
        showData.roomList[x].category = tmp.cdlbmc;
        showData.roomList[x].area = tmp.jzmj;
        showData.roomList[x].kszw = tmp.kszws1;
      }
    } else {
      showData.code = baseData.code;
    }
  }
  return showData;
}
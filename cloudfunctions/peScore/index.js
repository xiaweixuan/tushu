// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const usersno = event.sno
  const userpwd = event.pwd
  var showData = {
    code: '',
    scoreList: []
  }

  const url = 'http://202.206.100.234:6011/Student/StudentLogin';
  const query = queryString.stringify({
    userCode: usersno,
    userPwd: userpwd
  });

  let getResponse = await got(url, {
    method: 'POST', //post请求
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: query
  });

  let parsePe = JSON.parse(getResponse.body);
  if (parsePe.IsOk) {
    showData.code = 1;
    var reg = /(.*) expires/
    var str = getResponse.rawHeaders[15];
    var cookie = reg.exec(str)[1];
    var str = getResponse.rawHeaders[13];
    var cookie = cookie + reg.exec(str)[1];
    const peUrl = 'http://202.206.100.234:6011/TestScore/TestScoreForm';

    var y = 0;
    for (var x = 2016; x < 2020; x++) {
      var scoreQuery = queryString.stringify({
        'SUnCode': x.toString()
      });
      var scoreData = await got(peUrl, {
        method: 'POST', //post请求
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          cookie: cookie
        },
        body: scoreQuery
      });
      var str = scoreData.body;
      var reg = /<li>([\s\S]*?)<\/li>/g
      var info = [];
      while (res = reg.exec(str)) {
        info.push(res[1].trim())
      }
      if (info.length > 0) {
        showData.scoreList[y] = new Object();
        showData.scoreList[y].shengao = info[3];
        showData.scoreList[y].tizhong = info[4];
        showData.scoreList[y].bmi = info[5];
        showData.scoreList[y].feihuoliang = info[9];
        showData.scoreList[y].run50 = info[11]
        showData.scoreList[y].jump = info[13]
        showData.scoreList[y].sitdown = info[15]
        showData.scoreList[y].run800 = info[17]
        showData.scoreList[y].run1000 = info[19]
        showData.scoreList[y].ywqz = info[21]
        showData.scoreList[y].ytxs = info[23]
        showData.scoreList[y].title = "第" + x.toString() + "学年体测成绩";
        y++;
      }
    }
  } else {
    showData.code = 0;
  }

  return showData;
}
// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');
const md5 = require('md5');
cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const usersno = event.sno
  const userpwd = event.pwd
  var showData = {
    code: ''
  }
  var url = 'http://202.206.100.221:8080/StuExpbook/index/login.jsp?no=' + md5(usersno) + '&password=' + md5(userpwd);
  console.log(url)
  let getResponse = await got(url, {
    followRedirect: false
  });
  var str = getResponse.rawHeaders[5];
  var reg = /(.*) Path/;
  let cookie = reg.exec(str)[1];
  console.log(getResponse.statusCode)
  if (getResponse.statusCode == 302) {
    showData.code = 1;
    let cjUrl = 'http://202.206.100.221:8080/StuExpbook/two/creadit.jsp';
    let cjData = await got(cjUrl, {
      headers: {
        cookie: cookie
      },
      followRedirect: false
    });
    var reg = /<td>(.*)<\/td>/g;
    var str = cjData.body;
    var info = [];
    while (res = reg.exec(str)) {
      console.log(res)
      info.push(res[1])
    }
    var y = 0;
    var score = [];
    for (var x = 6; x < info.length; x += 6) {
      score[y] = new Object();

      score[y].name = info[x];
      score[y].category = info[x + 1];
      score[y].time = info[x + 2];
      score[y].method = info[x + 3];
      score[y].score = info[x + 5];
      score[y].hide = 1;
      y++;
    }
    showData.scoreList = score;

    var tmp=[];
    var reg = /<td .*style="font-weight:bold">.*：(.*)<\/td>/g;
    while (res = reg.exec(str)) {
      tmp.push(res[1])
    }
    showData.college = tmp[0];
    showData.major = tmp[1];
    showData.class = tmp[2];
    showData.student = tmp[3];
    showData.needScore = tmp[4];
    showData.totalScore = tmp[5];
    showData.exScore = tmp[6];

  } else {
    showData.code = 0;
  }
  return showData;
 
}
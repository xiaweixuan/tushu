// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const fs = require('fs'); //流
const imageDownload = require('image-download'); //图片转buffer
const moment = require('moment'); //时间format
const COS = require('cos-nodejs-sdk-v5');
cloud.init();

const db = cloud.database(); //初始化数据库

async function upload(result){
  var today = moment(new Date()).add(8, 'hours').format('YYYY-MM-DD');
  var cos = new COS({
    SecretId: 'AKID5Ndpv5x3rY8fCbp7EC3CtTtfqnglD8Ri',
    SecretKey: 'Nds164A94nU4XyfKoEUn6NRNE2lbJqGc'
  });
  let imgUrl = result.img;
  var tmpbuffer;
  await imageDownload(imgUrl).then(function (buffer) {
    tmpbuffer=buffer;
  });
  let response = await new Promise(resolve => {
    cos.putObject({
      Bucket: 'zaohui-1300421124', /* 必须 */
      Region: 'ap-beijing',    /* 必须 */
      Key: '/one/' + today + '.jpg',              /* 必须 */
      Body: tmpbuffer, /* 必须 */
      CacheControl: 'max-age=86400'
    }, function (err, data) {
      console.log(err || data);
      resolve(data.Location);
    });       
  });
  return response;
}


//存数据库的方法
async function inDataBase(result, date) {

  let cloudUrl = await upload(result);
  result.img='https://'+cloudUrl
  console.log(result.img)
 
  await db.collection('One').add({
    data: {
      date: date,
      author: result.author,
      content: result.content,
      img: result.img
    }
  }).catch(err => { })
}

// 云函数入口函数
exports.main = async (event, context) => {

  //取今天日期
  var today = moment(new Date()).add(8, 'hours').format('YYYY-MM-DD');
  console.log(today);

  //先从数据库中查询今天的
  var data = await db.collection('One').where({
    date: today //条件今天
  }).field({
    _id: false //不查_id
  }).get();

  if (data.data.length != 0) {
    return data.data[0]; //查到了返回数据库结果
  }

  //如果没查到
  console.log("今天第一次访问，即将get网站");

  //第一次访问，需要从res中取出token和phpsessid;
  var res = await got('http://m.wufazhuce.com/one');
  var reg = /PHPSESSID=(.+);/

  //从访问m.wufazhuce.com/one的请求头cookie中取phpsession，后面鉴权用
  var phpsessid = reg.exec(res.headers['set-cookie'][0])[1];

  //从访问m.wufazhuce.com/one的body中取token，后面鉴权用
  var reg = /One\.token = '(.+)';/
  var token = reg.exec(res.body)[1];

  //将token组装至数据接口
  var url = 'http://m.wufazhuce.com/one/ajaxlist/0?_token=' + token;

  //将phpsessid组装至cookie并发起请求
  var res2 = await got(url, {
    headers: {
      'cookie': 'PHPSESSID=' + phpsessid
    }
  });

  //结果转对象，因为是JSON可以直接转
  var result = JSON.parse(res2.body);

  //取最新一条消息的日期，去除前后左右所有空格
  var latestDateStr = result.data[0].date.replace(/\s/g, "");

  //封装好最新一条信息的结果
  var rtnResult = {};
  rtnResult.author = result.data[0]['text_authors'];
  rtnResult.content = result.data[0].content;
  rtnResult.img = result.data[0]['img_url'];
  rtnResult.date = latestDateStr;

  //字符串转日期
  latestDate = new Date(Date.parse(latestDateStr));

  //硬log显示出来有时区问题，但不知道为啥getDay,getHours没有。
  //看网站是否更新到今天，是否存入数据库
  if (new Date().getDay() == latestDate.getDay()) {
    await inDataBase(rtnResult, latestDateStr);
  }

  return rtnResult;

}
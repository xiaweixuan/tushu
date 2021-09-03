// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
const moment = require('moment');

cloud.init();
const db = cloud.database(); //初始化数据库

// 云函数入口函数
exports.main = async(event, context) => {

  //今天日期的字符串格式
  const today = new moment(new Date()).add(8, 'hours').format('YYYY/MM/DD');

  //日期最近的三条记录
  const firstThree = await db.collection('OneArticle').orderBy('date', 'desc').field({
    _id: false
  }).limit(5).get();

  //最新一条记录是今天的
  if (firstThree.data[0].date == today) {
    console.log('数据库已有数据了，省了一次连接');
    return {
      latest: firstThree.data[0],
      history: [firstThree.data[1], firstThree.data[2], firstThree.data[3], firstThree.data[4]]
    }
  }

  //最新一条记录不是今天的
  console.log('--------准备查询新文章--------');
  const res = await got('http://www.wufazhuce.com/');

  //最新一个文章号
  const volNumReg = /"titulo">VOL\.(.+?)<\/p>/;

  const volNum = volNumReg.exec(res.body)[1];

  const day = moment("2012-10-06"); //作为起始时间，跟今天比较看是否新文章
  const sureNum = (moment().add(8, "hours").diff(day, 'days')); //正确的文章号

  console.log('查到的文章号' + volNum);
  console.log('正确的今天的文章号' + sureNum);

  //如果新文章还没发
  if (volNum != sureNum) {
    console.log('-------查询的数据并不是最新的-------');
    return {
      latest: firstThree.data[0],
      history: [firstThree.data[1], firstThree.data[2], firstThree.data[3],firstThree.data[4]]
    }
  }

  const topReg = /one-articulo-titulo">\n\s*([\w\W]*?)\s*<\/p>/;
  const urlReg = /href="(.+)"/;

  let top = topReg.exec(res.body)[1];
  let articleUrl = urlReg.exec(top)[1];

  //去文章首页，取文章
  const articlePage = await got(articleUrl);
  return {
    latest: await parseArticle((htmlDecode(articlePage.body))),
    history: [firstThree.data[0], firstThree.data[1],firstThree.data[2],firstThree.data[3]]
  }

}

//从html整理信息，isSave是否存数据库
async function parseArticle(html) {

  console.log("---是新文章，要存数据库了----");

  const gSentenceReg = /comilla-cerrar">\n\s*(.+?)\s*<\/d/;
  const titleReg = /articulo-titulo">\n\s*(.+?)\s*<\/h2>/
  const authorReg = /autor">\n\s*作者\/(.+?)\s*<\/p>/;
  const pReg = /p\s*[align="justify"]?>(.+?)<\/p>/g;

  //名言
  const gSentence = gSentenceReg.exec(html)[1];
  //标题
  const title = titleReg.exec(html)[1];
  const autor = authorReg.exec(html)[1];
  //所有段落
  const p = [];
  let length = 0; //文章长度
  while (aP = pReg.exec(html)) {
    let realP = aP[1].replace(/<.+?>/, "").replace(/<\/.+?>/, "");
    p.push(realP);
    length += realP.length;
  }

  let article = {};
  article.gSentence = gSentence;
  article.title = title;
  article.autor = autor;
  article.p = p;

  await db.collection('OneArticle').add({
    data: {
      article: article,
      date: new moment(new Date()).add(8, 'hours').format('YYYY/MM/DD'),
      length: length
    }
  })

  return {
    article: article,
    date: new moment(new Date()).add(8, 'hours').format('YYYY/MM/DD'),
    length: length
  }
}

//转网站的html实体，转成正常汉字
function htmlDecode(str) {
  str = str.replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”").replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&hellip;/g, "…");
  return str;
}
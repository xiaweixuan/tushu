// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const method = event.method;
  const value = event.value;
  const page = event.page;

  var url = "http://202.206.108.2:8080/opac/openlink.php?sort=M_PUB_YEAR&orderby=DESC&";
  //组装url，三参数必不可少
  url += method + "=" + encodeURI(value) + "&page=" + encodeURI(page);

  var res = await got(url);
  res = htmlDecode(res.body);

  var books = {};
  books.num = getNum(res);
  if (books.num != 0) {
    books.book = getBook(res);
  }

  return books;

}

//根据html取出目标书总数
function getNum(html) {
  //let reg = /(?<=class="red">)\d+(?=<\/st)/;
  let reg = /class="red">(\d+)<\/st/;
  let num = reg.exec(html);

  if (num == null) {
    return 0;
  }
  return num[1];
}

//根据html取出相关信息
function getBook(html) {
  //匹配书名 最多可到9999

  //各个正则表达式，一定是.*防止某些书没有作者空指针的情况
  const nameReg = />\d+\.(.*)<\/a>/g;
  const authorReg = /an>\s+(.*)\s+<b/g;
  const publishReg = /<br \/>\s+(.*)\s+<b/g;
  const callnoReg = /\/a>\s+(.*)\s{2}<\/h/g;
  const typeReg = /<span>(.*)<\/s/g;
  const totalReg = /：(\d*)\s+<br/g;
  const availableReg = /：(\d*)<\/sp/g;
  const detailReg = /showDetail\(\'(\w*)\'\)/g;

  //要返回的数组对象
  let book = [];

  //用书名做第一次匹配，有几个书名就有几个其他信息
  while (result = nameReg.exec(html)) {

    const name = result[1];
    const author = authorReg.exec(html)[1];
    const publish = publishReg.exec(html)[1];
    const callno = callnoReg.exec(html)[1];
    const type = typeReg.exec(html)[1];
    const total = totalReg.exec(html)[1];
    const available = availableReg.exec(html)[1];
    const detail = detailReg.exec(html)[1];

    book.push({
      name: name,
      author: author,
      publish: publish,
      callno: callno,
      type: type,
      total: total,
      available: available,
      detail: detail
    });

  }
  return book;
}


//转网站的html实体，转成正常汉字
function htmlDecode(str) {
  // 一般可以先转换为标准 unicode 格式（有需要就添加：当返回的数据呈现太多\\\u 之类的时）
  //str = unescape(str.replace(/\\u/g, "%u"));
  // 再对实体符进行转义
  // 有 x 则表示是16进制，$1 就是匹配是否有 x，$2 就是匹配出的第二个括号捕获到的内容，将 $2 以对应进制表示转换
  str = str.replace(/&#(x)?(\w+);/g, function ($, $1, $2) {
    return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
  });

  //&nbsp转空格
  var arrEntities = {
    'nbsp': ' '
  };
  str = str.replace(/&(nbsp);/ig, function (all, t) {
    return arrEntities[t]
  })

  return str;
}
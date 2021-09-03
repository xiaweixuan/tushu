// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {

  const iden = event.iden;
  const url = "http://202.206.108.2:8080/opac/item.php?marc_no=" + iden;

  var res = await got(url);
  res = htmlDecode(res.body);

  var info = {};
  info.borrowinfo = getBorrowInfo(res);
  info.anotherinfo = getAnotherInfo(res);

  return info;

}

//正则匹配结果是否存在，不存在返回null
function isExist(result) {
  return (result == null) ? null : result[1];
}

//获得借阅信息
function getBorrowInfo(html) {

  //各个表达式
  const callnoReg = /10%\">(.*)<\/t/g;
  const barcodeReg = /15%\">(\w*)<\/t/g;
  const placeReg = /gif">\s(.*)<\/span>/g;
  const stateReg = /25%">(.*)<\/td>/g;

  let borrowInfo = [];

  while (callno = isExist(callnoReg.exec(html))) {

    const barcode = isExist(barcodeReg.exec(html));
    const place = isExist(placeReg.exec(html));
    let state = isExist(stateReg.exec(html));

    //绿字（可借）font color="green"
    if (state.substr(0, 2) == "<f") {
      //把grenn中间的取出来
      const noGrennReg = /green>(.*)<\//;
      state = isExist(noGrennReg.exec(state)); //把green跳过取中间的字
    }
    borrowInfo.push({
      callno: callno,
      barcode: barcode,
      place: place,
      state: state
    });
  }
  return borrowInfo;
}

//获得ISBN、作者相关信息、文章摘要
function getAnotherInfo(html) {
  //
  const isbnReg = /dd>([\d-]*)\//;
  const authorNoteReg = /责任者附注:<\/dt>([\w\W]*?)<\/dd/;
  const noteReg = /提要文摘附注:<\/dt>\r\n\s+<dd>([\w\W]*?)<\/dd/;

  let result = {};
  result.isbn = isExist(isbnReg.exec(html));
  result.authorNote = isExist(authorNoteReg.exec(html));
  result.note = isExist(noteReg.exec(html));

  return result;
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
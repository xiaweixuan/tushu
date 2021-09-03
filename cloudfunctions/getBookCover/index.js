const cloud = require('wx-server-sdk');
const imageDownload = require('image-download'); //图片转buffer
const got = require('got');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {

  const isbn = event.isbn;
  var url = "https://book.douban.com/isbn/" + isbn + "/";

  return await got(url).then(res => {
    res = res.body;
    let imgUrl = getImage(res);

    //如果是默认图片，权当没有（太难看）
    if (imgUrl.substr(-3, 3) == "gif") {
      return null;
    }
    return urlToBase64(imgUrl);
  }).catch(err => {
    return null;
  });
}

//html取图片链接
function getImage(html) {
  const imageReg = /src=\"(.*)\"\st/;
  const image = imageReg.exec(html)[1];
  return image;
}

//流转base64
function urlToBase64(imgUrl) {
  return imageDownload(imgUrl).then(function (buffer) {
    let data = buffer.toString('base64');
    let base64 = "data:image/jpg;base64," + data;
    return base64;
  }).catch(err => {
    return null;
  });
}
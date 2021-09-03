// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
const queryString = require('query-string');
cloud.init();
const db = cloud.database();

// 数据接口格式 code 0 登录成功  1登录失败  msg登录信息(密码错,其他错误)
//  {code:1,countAll: "12", borrowAll: Array(10)}//

// 云函数入口函数
exports.main = async (event, context) => {

  // 数据库取一条jession
  let aJess = await db.collection('JsessionAndCode').where({
    doing: false
  }).limit(1).get();

  if (aJess.data.length == 0) {
    console.log("此次没有闲置的连接");
    return {
      code: 1,
      msg: "服务器繁忙，请稍后访问"
    }
  }

  aJess = aJess.data[0];
  console.log("此次使用的Jession = " + aJess);

  //改成正在执行状态，防止并发使用同一条session
  await db.collection('JsessionAndCode').where({
    _id: aJess._id
  }).update({
    data: {
      doing: true
    }
  });

  //const method=event.method; //本接口方法 1：获取个人信息  2:获取当前借阅 3:获取历史借阅

  const method = event.method;
  const sno = event.sno;
  const pwd = event.pwd;

  const loginUrl = 'http://202.206.108.2:8082/m/reader/check_login.action'; //登录地址
  //个人信息地址
  const infoUrl = 'http://202.206.108.2:8082/m/reader/info.action';
  //当前借阅图书信息地址
  const curBorrowUrl = 'http://202.206.108.2:8082/m/reader/lend_list.action'; //get

  let jsession = aJess.jsession;

  const queryLogin = queryString.stringify({
    name: sno, //用户名
    passwd: pwd, //借阅（图书馆）密码
    type: 1, //证件类型 学号方式
    verifyCode: aJess.code //jesission对应的验证码
  });


  let bData = await got(loginUrl, { //登录认证
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      cookie: 'JSESSIONID=' + jsession + ';'
    },
    body: queryLogin
  })


  let parsebData = JSON.parse(bData.body); //转换认证结果格式


  var showData = new Object(); //总返回信息定义

  if (parsebData.success == true) { //登录成功

    showData.code = 0;
    if (method == 1) { //获取个人信息
      let allData = await got(infoUrl, {
        headers: {
          cookie: 'JSESSIONID=' + jsession + ';'
        }
      });
      //   console.log(allData.body);
      showData.data = parsePersonalInfo(allData.body);

    } else if (method == 2) { //获取当前借阅
      let allData = await got(curBorrowUrl, {
        headers: {
          cookie: 'JSESSIONID=' + jsession + ';'
        }
      });
      showData.data = parseCurrentBook(allData.body);

    } else if (method == 3) { //获取历史借阅
      showData.data = await parseBookData(jsession);
    }

  } else { //登录失败
    showData.code = 0;
    showData.msg = '用户名或密码错误';
    //parsebData.msg;存储了错误信息，后期对错误信息进行格式化放showData.msg
  }

  //改成未执行状态 放出此条session
  await db.collection('JsessionAndCode').where({
    _id: aJess._id
  }).update({
    data: {
      doing: false
    }
  });

  return showData; //总返回

}

function parsePersonalInfo(data) {
  const baseReg = '</p>\\r\\n\\s*</div>\\r\\n\\s*<div class="weui_cell_ft">(.*)</div>';
  const dataArr = ['到期', '超期', '预约到书', '委托到书', '荐购', '读者姓名', '读者证件', '读者条码', '读者类型', '工作单位', '办证日期', '生效日期', '失效日期', '读者押金', '手续费用', '累计借书', '总积分', '可用积分', 'Email地址', '电话', '地址', '邮政编码'];
  let result = [];
  dataArr.forEach((name, index) => {
    let reg = new RegExp(name + baseReg);
    var value = reg.exec(data)[1];
    result.push({
      name: name,
      value: value
    });
  });

  return result;
}

function parseCurrentBook(data) {
  const bdReg = /media_bd">([\s\S]*?)<\/div>/g;

  const titleReg = /title">(.+)<\/h4>/;
  const descReg = /desc">(.+)<\/p>/;
  const infoMetaReg = /info_meta">\s*(.+?)<\/li>/g;
  const barcodeReg = /renew\('(.+?)'\)/g;

  let Currentbook = [];
  var num = 0;

  while (bd = bdReg.exec(data)) {
    num++;
    bd = bd[1];
    let title = titleReg.exec(bd)[1];
    let desc = descReg.exec(bd)[1];
    let info = [];
    while (infoMeta = infoMetaReg.exec(bd)) {
      info.push(infoMeta[1]);
    }
    let barcode = barcodeReg.exec(data)[1];
    Currentbook.push({
      title: title,
      desc: desc,
      info: info,
      barcode: barcode
    })

  }

  const result = {};
  result.Currentbook = Currentbook;
  result.num = num;

  return result;
}



async function parseBookData(jsession) { //处理历史记录 历史记录不包含续借按钮

  const totalReg = /借阅历史\[(.*)\]<\/d/; //看一共多少本
  const pagesReg = /\/(.+?)<\/div>/;  //一共几页


  //历史借阅图书信息地址
  const allBorrowUrl = 'http://202.206.108.2:8082/m/reader/lend_hist.action'; // get

  let allData = await got(allBorrowUrl, {
    headers: {
      cookie: 'JSESSIONID=' + jsession + ';'
    },
  })

  let countAll = totalReg.exec(allData.body)[1] //历史借阅本数
  let pages = pagesReg.exec(allData.body)[1];

  console.log(pages);



  let book = [];

  for (var i = 1; i <= pages; i++) {
    console.log(i);

    let data = await got(allBorrowUrl + "?page=" + i, {
      headers: {
        cookie: 'JSESSIONID=' + jsession + ';'
      },
    })

    data = data.body;

    //不写在循环里面就失效了
    const detailReg = /id=(.*)" class/g;
    const titleReg = /<h4 class="weui_media_title">(.*)<\/h4>/g;
    const bDateReg = /ss="weui_media_desc">.*：(.*)</g;
    const rDateReg = /还书日期：(.*)<\/li>/g;
    const adrReg = /馆藏地点：(.*)<\/li>/g;


    while (result = detailReg.exec(data)) {

      const detail = result[1];
      const title = titleReg.exec(data)[1];
      const bdate = bDateReg.exec(data)[1];
      const rdate = rDateReg.exec(data)[1];
      const addr = adrReg.exec(data)[1];

      book.push({
        detail: detail,
        title: title,
        bdate: bdate,
        rdate: rdate,
        addr: addr
      });

    }

  }
  return {
    count: countAll,
    book: book
  };

}
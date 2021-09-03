// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got'); //引用 got;

cloud.init();
const db = cloud.database(); //初始化数据库？
// 云函数入口函数
exports.main = async(event, context) => {
  let url = 'https://www.metalgearjoe.cn/mn/search?search=' + encodeURI(event.name);
  //console.log(url);
  var response = await got(url);
  response = response.body; //又臭又烂的一行

  //  # 0:湿垃圾，1：干垃圾，2：可回收物，3：有害垃圾

  var datas = []; //存格式化之前的结果

  //循环查四种垃圾
  for (i = 0; i <= 3; i++) {
    var count = 0; //存某类垃圾的数量
    var data = []; //存某类垃圾的列表
    var reg = new RegExp("cat-" + i + "\">\\n\\s{12}(.+?)&nbsp;", "g");
    while (result = reg.exec(response)) {
      count++;
      data.push(result[1]);

      //为每条结果插入数据库
      try{
        await db.collection('TrashSorting').add({
          data: {
            name: result[1],
            type: i
          }
        });
      }catch(e){
        console.log(e)
      }
      
    }
    datas[i] = {}; //为每一次查到的结果和Rubbish里的做一个映射
    datas[i].list = data;
    datas[i].count = count;
  }
  // 0123按照对应顺序赋值
  var rubbish = new Rubbish();
  rubbish.wet = datas[0];
  rubbish.dry = datas[1]
  rubbish.recycle = datas[2];
  rubbish.danger = datas[3];
  rubbish.total = rubbish.wet.count + rubbish.dry.count + rubbish.recycle.count + rubbish.danger.count;

  return rubbish;

  function Rubbish() {
    this.wet = {}; //湿垃圾
    this.dry = {}; //干垃圾  
    this.recycle = {}; //可回收
    this.danger = {}; //有害
    this.total = 0; //总数
  }


}
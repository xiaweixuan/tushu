// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  let data = await got("http://whq.weiguanjia.net/app/index.php?i=3&c=entry&op=getbuild&do=repair&m=xfeng_community&regionid=108", {
    headers: {
      'Accept':'application/json, text/javascript, */*; q=0.01',
      'Referer':'http://whq.weiguanjia.net/app/index.php?i=3&c=entry&op=add&do=repair&m=xfeng_community&wxref=mp.weixin.qq.com',
      'cookie': 'PHPSESSID=7fe151c2c404504d40716d500be26d0e;',
      // 'Location':'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf7efcb2633746e53&redirect_uri=http%3A%2F%2Fwhq.weiguanjia.net%2Fapp%2Findex.php%3Fi%3D3%26c%3Dauth%26a%3Doauth%26scope%3Dsnsapi_base&response_type=code&scope=snsapi_base&state=we7sid-87130c2d5833405e0d56a98d8d3042b8#wechat_redirect'
    }
  });
  return data;
  //首页 http://whq.weiguanjia.net/app/index.php?i=3&c=entry&op=add&do=repair&m=xfeng_community
//'cookie': 'PHPSESSID=5ccb319b4099bf65db9fb0fcd648d345',
  // const wxContext = cloud.getWXContext()
//http://whq.weiguanjia.net/app/index.php?i=3&c=entry&op=getbuild&do=repair&m=xfeng_community&regionid=108
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}
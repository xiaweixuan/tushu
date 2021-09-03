// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got');
const moment = require('moment');

cloud.init()
const db = cloud.database(); //初始化数据库
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  const formId =event.FORMID;
  const openId = event.OPENID;
  const templateId=event.TEMPLATEID;
  const pagePath=event.PAGE;
  const value1=event.VALUE1;
  const value2 = event.VALUE2;
  const value3 = event.VALUE3;
  const value4 = event.VALUE4;

  const nowDate = moment().unix();
  console.log('当前时间↓')
  console.log(nowDate);
  console.log('开始从数据库读取token↓')
  let sdata=await db.collection('wx_token').get();
  let access_token = sdata.data[0].access_token;
  let expires_in = sdata.data[0].expires_in;
  console.log('数据库中的token信息↓')
  console.log(access_token);
  console.log(expires_in);
  if (nowDate >= expires_in){
    console.log('token过期重新获取')
    const APPID = "wx9fa691bc026eed3b";
    const APPSECRET = "7fbd60c26dfe1ef9847d1d15a93130f5";
    let token = await got('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APPID + '&secret=' + APPSECRET);
    token = JSON.parse(token.body);
    access_token = token.access_token;
    expires_in = token.expires_in;
    expires_in =moment().add(expires_in, "seconds").unix();
    console.log('下次过期时间')
    console.log(expires_in)
    console.log('写入新token进入数据库')
    try {
      await db.collection('wx_token')
        .update({
          data: {
            access_token: access_token,
            expires_in: expires_in
          },
        })
    } catch (e) {
      console.log('写入新token出现问题')
      console.error(e)
    }
  }else{
    console.log('token未过期正常使用')
  }

  let query=new Object();
  query.touser = openId;
  query.template_id = templateId;
  query.page = pagePath;
  query.form_id = formId;
  query.data=new Object();
  query.data.keyword1=new Object();
  query.data.keyword2 = new Object();
  query.data.keyword3 = new Object();
  query.data.keyword4 = new Object();
  query.data.keyword1.value = value1;
  query.data.keyword2.value= value2;
  query.data.keyword3.value = value3;
  query.data.keyword4.value = value4;
  console.log(JSON.stringify(query));

  let sendResult = await got('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + access_token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: JSON.stringify(query)
  })
  // console.log(sendResult);
  let rData = JSON.parse(sendResult.body);

  if (rData.errcode==0){
    return{
      code:0
    }
  }else{
    return {
      code: 1
    }
  }
  // try {
  //   const result = await cloud.openapi.templateMessage.send({
  //     touser: openId,
  //     page: pagePath,
  //     data: {
  //       keyword1: {
  //         value: value1
  //       },
  //       keyword2: {
  //         value: value2
  //       },
  //       keyword3: {
  //         value: value3
  //       },
  //       keyword4: {
  //         value: value4
  //       }
  //     },
  //     templateId: templateId,
  //     formId: formId
  //   })
  //   console.log(result)
  //   return result
  // } catch (err) {
  //   console.log(err)
  //   return err
  // }

}
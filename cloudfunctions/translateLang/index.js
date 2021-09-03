// 云函数入口文件
const cloud = require('wx-server-sdk');
const tencentcloud = require("tencentcloud-sdk-nodejs");
cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const SourceText = event.SourceText;
  const Source = event.Source;
  const Target = event.Target;

  //以下来自腾讯云官方SDK
  const TmtClient = tencentcloud.tmt.v20180321.Client;
  const models = tencentcloud.tmt.v20180321.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  let cred = new Credential("AKIDBCClW5fpK6kDSjy7i5FEySquth99lM6n", "d2DO8BYgpkbp66C3mhWSjtytXheOs8f5");
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = "tmt.tencentcloudapi.com";
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new TmtClient(cred, "ap-beijing", clientProfile);

  let req = new models.TextTranslateRequest();

  let params = {
    "SourceText": SourceText,
    "Source": Source,
    "Target": Target,
    "ProjectId": 0
  };
  req.from_json_string(JSON.stringify(params));

  let exec = await new Promise(resolve => {
    client.TextTranslate(req, function (errMsg, response) {
      if (errMsg) {
        console.log(errMsg);
        resolve();
      } else {
        resolve(response);
        console.log(response.to_json_string());
      }
    });
  })

  return exec;
}
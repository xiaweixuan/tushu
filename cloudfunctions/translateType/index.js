// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const Source = ['自动', '中文', '英文', '日语', '韩语', '德语', '法语', '西班牙文', '意大利文', '土耳其文', '俄文', '葡萄牙文', '越南文', '印度尼西亚文', '马来西亚文', '泰文'];
  const SourceCode = ['auto', 'zh', 'en', 'jp', 'kr', 'de', 'fr', 'es', 'it', 'tr', 'ru', 'pt', 'vi', 'id', 'ms', 'th'];
  const Target = ['中文', '英文', '日语', '韩语', '德语', '法语', '西班牙文', '意大利文', '土耳其文', '俄文', '葡萄牙文', '越南文', '印度尼西亚文', '马来西亚文', '泰文'];
  const TargetCode = ['zh', 'en', 'jp', 'kr', 'de', 'fr', 'es', 'it', 'tr', 'ru', 'pt', 'vi', 'id', 'ms', 'th'];

  var result = {};

  result.Source = [];
  result.Target = [];

  Source.forEach((value, index) => {
    result.Source.push({
      name: value,
      code: SourceCode[index]
    });
  });

  Target.forEach((value, index) => {
    result.Target.push({
      name: value,
      code: TargetCode[index]
    });
  });

  return result;
}
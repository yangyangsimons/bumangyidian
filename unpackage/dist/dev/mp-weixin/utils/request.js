"use strict";
const common_vendor = require("../common/vendor.js");
const request = (url, method = "GET", data = {}, header = {}) => {
  const token = common_vendor.index.getStorageSync("token") || "";
  const defaultHeader = {
    "Content-Type": "application/json",
    Authorization: token ? `bearer ${token}` : "",
    // 常见的token携带方式
    is_yk: token ? "0" : "1",
    ...header
    // 允许自定义header覆盖默认设置
  };
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url,
      method,
      data,
      header: defaultHeader,
      success(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          resolve(res.data);
        } else {
          reject(res.data || res);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map

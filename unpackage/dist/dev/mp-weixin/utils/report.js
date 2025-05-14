"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "stream/consumers" has been externalized for browser compatibility. Cannot access "stream/consumers.${key}" in client code.  See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
});
let commonParams = null;
getApp().globalData._pages;
async function dmReport(type, data = {}, options = {}) {
  getCurrentPages();
  const token = common_vendor.index.getStorageSync("token") || "";
  const defaultHeader = {
    "Content-Type": "application/json",
    Authorization: token ? `bearer ${token}` : "",
    // 常见的token携带方式
    is_yk: token ? "0" : "1"
  };
  JSON.stringify({
    event: type,
    lob: data,
    // lastpage: _pages_[_pages_.length - 1] || '',
    ...await getCommonParams(),
    // 公共参数
    ...options
  });
  common_vendor.index.request({
    method: "POST",
    url: `${utils_config.baseUrl}/track/send`,
    data: JSON.stringify({
      lastp: "index",
      event: type,
      lob: data,
      network: await getNetworkType(),
      // lastpage: _pages_[_pages_.length - 1] || '',
      ...await getCommonParams(),
      // 公共参数
      ...options
    }),
    header: defaultHeader
  });
}
async function getNetworkType() {
  return new Promise((resolve) => {
    common_vendor.index.getNetworkType({
      complete: (res) => resolve(res.networkType || "")
    });
  });
}
async function getCommonParams() {
  if (commonParams)
    return commonParams;
  return new Promise((resolve) => {
    common_vendor.index.getSystemInfo({
      success: async (res) => {
        var _a, _b, _c;
        const sessionid = Date.now() + Math.random().toString(36).substring(2);
        const launchParams = common_vendor.index.getLaunchOptionsSync();
        const rch = ((_a = launchParams == null ? void 0 : launchParams.query) == null ? void 0 : _a.rch) || "";
        commonParams = {
          sessionid,
          rch,
          dist_ch: "SHXZ-WX",
          platform: "miniprogram",
          did: res.deviceId,
          width: res.screenWidth,
          height: res.screenHeight,
          ts: Date.now(),
          app_ver: res.appVersion,
          os: (_b = res.system) == null ? void 0 : _b.split(" ")[0],
          os_ver: (_c = res.system) == null ? void 0 : _c.split(" ")[1],
          model: res.model,
          net: await getNetworkType()
        };
        resolve(commonParams);
      }
    });
  });
}
exports.dmReport = dmReport;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/report.js.map

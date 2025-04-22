"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/hello/hello.js";
  "./pages/questionnaire/questionnaire.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    } else {
      common_vendor.index.request({
        url: "https://mang.5gradio.com.cn:443/user/user_info",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        method: "GET",
        success: (res) => {
          common_vendor.index.__f__("log", "at App.vue:20", "获取用户信息", res);
          if (res.data.code === 0 && res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:22", "用户已注册生日是：", res.data.data.birth);
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          } else if (res.data.code === 0 && !res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:27", "用户未注册");
            common_vendor.index.reLaunch({
              url: "/pages/hello/hello"
            });
          } else {
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        },
        fail: (error) => {
        }
      });
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:45", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:48", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map

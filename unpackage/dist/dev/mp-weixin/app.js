"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/hello/hello.js";
  "./pages/questionnaire/questionnaire.js";
  "./pages/index/index.js";
  "./pages/agreement/agreement.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.__f__("log", "at App.vue:8", "游客身份体验");
      common_vendor.index.setStorage({
        key: "tourist",
        data: true,
        success: (result) => {
          common_vendor.index.__f__("log", "at App.vue:14", "游客身份存储成功:", result);
        }
      });
      common_vendor.index.setStorage({
        key: "isFirst",
        data: true,
        success: (result) => {
          common_vendor.index.__f__("log", "at App.vue:22", "首次使用存储成功:", result);
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        },
        fail: (error) => {
          common_vendor.index.__f__("log", "at App.vue:28", "首次使用存储失败:", error);
          common_vendor.index.showToast({
            title: "游客身份体验失败",
            icon: "none"
          });
        }
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
          common_vendor.index.__f__("log", "at App.vue:44", "获取用户信息", res);
          if (res.data.code === 0 && res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:46", "用户已注册生日是：", res.data.data.birth);
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          } else if (res.data.code === 0 && !res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:51", "用户未注册");
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
    common_vendor.index.__f__("log", "at App.vue:69", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:72", "App Hide");
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

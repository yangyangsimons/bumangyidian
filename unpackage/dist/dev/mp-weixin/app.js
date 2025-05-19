"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/hello/hello.js";
  "./pages/questionnaire/questionnaire.js";
  "./pages/index/index.js";
  "./pages/agreement/agreement.js";
  "./pages/ad/ad.js";
}
const _sfc_main = {
  onLaunch: function() {
    const updateManager = common_vendor.wx$1.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {
      common_vendor.index.__f__("log", "at App.vue:8", "版本更新的回调", res.hasUpdate);
    });
    updateManager.onUpdateReady(function() {
      common_vendor.wx$1.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    updateManager.onUpdateFailed(function() {
    });
    common_vendor.index.__f__("log", "at App.vue:28", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.__f__("log", "at App.vue:32", "游客身份体验");
      common_vendor.index.setStorage({
        key: "tourist",
        data: true,
        success: (result) => {
          common_vendor.index.__f__("log", "at App.vue:38", "游客身份存储成功:", result);
        }
      });
      common_vendor.index.setStorage({
        key: "isFirst",
        data: true,
        success: (result) => {
          common_vendor.index.__f__("log", "at App.vue:46", "首次使用存储成功:", result);
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        },
        fail: (error) => {
          common_vendor.index.__f__("log", "at App.vue:52", "首次使用存储失败:", error);
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
          common_vendor.index.__f__("log", "at App.vue:68", "获取用户信息", res);
          if (res.data.code === 0 && res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:70", "用户已注册生日是：", res.data.data.birth);
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          } else if (res.data.code === 0 && !res.data.data.birth) {
            common_vendor.index.__f__("log", "at App.vue:75", "用户未注册");
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
    common_vendor.index.__f__("log", "at App.vue:93", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:96", "App Hide");
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

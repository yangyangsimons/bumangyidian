"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/enrollment/enrollment.js";
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

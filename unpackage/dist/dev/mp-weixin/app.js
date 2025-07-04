"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/enrollment/enrollment.js";
  "./pages/loading/loading.js";
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/hello/hello.js";
  "./pages/questionnaire/questionnaire.js";
  "./pages/agreement/agreement.js";
  "./pages/ad/ad.js";
}
const _sfc_main = {
  // onLaunch: function () {
  //   const updateManager = wx.getUpdateManager()
  //   updateManager.onCheckForUpdate(function (res) {
  //     // 请求完新版本信息的回调
  //     uni.__f__('log','at App.vue:8','版本更新的回调', res.hasUpdate)
  //   })
  //   updateManager.onUpdateReady(function () {
  //     wx.showModal({
  //       title: '更新提示',
  //       content: '新版本已经准备好，是否重启应用？',
  //       success(res) {
  //         if (res.confirm) {
  //           // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
  //           updateManager.applyUpdate()
  //         }
  //       },
  //     })
  //   })
  //   updateManager.onUpdateFailed(function () {
  //     // 新版本下载失败
  //   })
  //   uni.__f__('log','at App.vue:28','App Launch')
  //   // 判断用户是否授权
  //   const token = uni.getStorageSync('token')
  //   if (!token) {
  //     uni.__f__('log','at App.vue:32','游客身份体验')
  //     //游客身份体验
  //     uni.setStorage({
  //       key: 'tourist',
  //       data: true,
  //       success: (result) => {
  //         uni.__f__('log','at App.vue:38','游客身份存储成功:', result)
  //       },
  //     })
  //     //新手引导页设置token
  //     uni.setStorage({
  //       key: 'isFirst',
  //       data: true,
  //       success: (result) => {
  //         uni.__f__('log','at App.vue:46','首次使用存储成功:', result)
  //         uni.reLaunch({
  //           url: '/pages/index/index',
  //         })
  //       },
  //       fail: (error) => {
  //         uni.__f__('log','at App.vue:52','首次使用存储失败:', error)
  //         uni.showToast({
  //           title: '游客身份体验失败',
  //           icon: 'none',
  //         })
  //       },
  //     })
  //   } else {
  //     uni.request({
  //       url: 'https://mang.5gradio.com.cn:443/user/user_info',
  //       header: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       method: 'GET',
  //       success: (res) => {
  //         uni.__f__('log','at App.vue:68','获取用户信息', res)
  //         if (res.data.code === 0 && res.data.data.birth) {
  //           uni.__f__('log','at App.vue:70','用户已注册生日是：', res.data.data.birth)
  //           uni.reLaunch({
  //             url: '/pages/index/index',
  //           })
  //         } else if (res.data.code === 0 && !res.data.data.birth) {
  //           uni.__f__('log','at App.vue:75','用户未注册')
  //           uni.reLaunch({
  //             url: '/pages/hello/hello',
  //           })
  //         } else {
  //           uni.reLaunch({
  //             url: '/pages/login/login',
  //           })
  //         }
  //       },
  //       fail: (error) => {},
  //     })
  //     // uni.reLaunch({
  //     //   url: '/pages/questionnaire/questionnaire',
  //     // })
  //   }
  // },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:93", "App Show");
    common_vendor.index.loadFontFace({
      global: true,
      family: "SmileySans-Oblique",
      source: "url(https://mang.5gradio.com.cn/static/SmileySans-Oblique.ttf)",
      success: (result) => {
        common_vendor.index.__f__("log", "at App.vue:101", "字体加载成功", result);
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at App.vue:104", "字体加载失败", error);
      }
    });
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:109", "App Hide");
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

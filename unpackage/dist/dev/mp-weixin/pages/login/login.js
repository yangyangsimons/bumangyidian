"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const stores_user = require("../../stores/user.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    common_vendor.storeToRefs(userStore);
    const agreeProtocol = common_vendor.ref(false);
    const token = common_vendor.ref("");
    const clickBtn = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:66", "点击了微信登录按钮");
      if (!agreeProtocol.value) {
        return common_vendor.index.showToast({
          title: "请先阅读并同意协议",
          icon: "none"
        });
      }
    };
    const handleWechatLogin = async (e) => {
      const phoneCode = e.detail.code;
      common_vendor.index.__f__("log", "at pages/login/login.vue:76", "获取到的手机号code", phoneCode);
      if (!agreeProtocol.value) {
        return common_vendor.index.showToast({
          title: "请先阅读并同意协议",
          icon: "none"
        });
      }
      try {
        const loginRes = await common_vendor.wx$1.login();
        common_vendor.index.__f__("log", "at pages/login/login.vue:89", "登录返回", loginRes.code);
        const serverRes = await utils_request.request(`${utils_config.baseUrl}/user/code2token`, "POST", {
          code: loginRes.code
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:93", "服务器返回", serverRes);
        token.value = serverRes.data.token;
        userStore.setToken(serverRes.token);
        common_vendor.index.__f__("log", "at pages/login/login.vue:98", "登录成功", serverRes.data);
        common_vendor.index.__f__("log", "at pages/login/login.vue:99", "token", serverRes.data.token);
        common_vendor.index.setStorage({
          key: "token",
          data: serverRes.data.token,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:105", "token存储成功", result);
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:109", "token存储失败", error);
          }
        });
        const registerResult = await common_vendor.index.request({
          url: "https://mang.5gradio.com.cn:443/user/user_info",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`
          },
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:122", "获取用户注册信息", registerResult);
        if (registerResult.data.code === 0 && registerResult.data.data.birth) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:124", "用户已注册生日是：", registerResult.data.data.birth);
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        } else {
          if (phoneCode) {
            common_vendor.index.__f__("log", "at pages/login/login.vue:131", "获取到的手机号code", e.detail.code);
            await common_vendor.index.request({
              url: `${utils_config.baseUrl}/user/update_phone`,
              method: "POST",
              header: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${serverRes.data.token}`
              },
              data: {
                code: phoneCode
              }
            });
            common_vendor.index.reLaunch({ url: "/pages/hello/hello" });
          } else {
            common_vendor.index.__f__("log", "at pages/login/login.vue:148", "获取手机号失败", e.detail.errMsg);
            return common_vendor.index.showToast({
              title: "获取手机号失败",
              icon: "none",
              duration: 2e3
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/login/login.vue:157", "error", error);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_assets._imports_1,
        c: common_assets._imports_2,
        d: !agreeProtocol.value
      }, !agreeProtocol.value ? {
        e: common_assets._imports_3,
        f: common_vendor.o(clickBtn)
      } : {
        g: common_assets._imports_3,
        h: common_vendor.o(handleWechatLogin)
      }, {
        i: agreeProtocol.value,
        j: common_vendor.o(($event) => agreeProtocol.value = !agreeProtocol.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map

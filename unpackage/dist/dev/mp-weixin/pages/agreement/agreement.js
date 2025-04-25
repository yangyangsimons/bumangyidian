"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "agreement",
  setup(__props) {
    const agreementUrl = common_vendor.ref("");
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const type = currentPage.options.type || "user";
      if (type === "user") {
        agreementUrl.value = "https://mang.5gradio.com.cn/protocol/user_agreement";
      } else {
        agreementUrl.value = "https://mang.5gradio.com.cn/protocol/privacy";
      }
    });
    return (_ctx, _cache) => {
      return {
        a: agreementUrl.value
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/agreement/agreement.js.map

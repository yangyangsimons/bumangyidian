"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "ad",
  setup(__props) {
    const adUrl = common_vendor.ref("");
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      adUrl.value = currentPage.options.address;
      common_vendor.index.__f__("log", "at pages/ad/ad.vue:17", "广告链接:", adUrl.value);
    });
    return (_ctx, _cache) => {
      return {
        a: adUrl.value
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ad/ad.js.map

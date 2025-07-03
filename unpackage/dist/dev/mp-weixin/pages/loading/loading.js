"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  onLoad() {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    common_vendor.index.__f__("log", "at pages/loading/loading.vue:40", "设备信息:", systemInfo);
    setTimeout(() => {
      common_vendor.index.__f__("log", "at pages/loading/loading.vue:43", "骨架屏加载完成");
    }, 500);
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f(5, (item, k0, i0) => {
      return {
        a: item
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-13a8254b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/loading/loading.js.map

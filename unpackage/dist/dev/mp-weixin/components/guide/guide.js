"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "guide",
  setup(__props) {
    const guideShow = common_vendor.ref(false);
    common_vendor.onShow(async () => {
      common_vendor.index.__f__("log", "at components/guide/guide.vue:38", "新手引导页页面显示");
      const isFirstOpen = await common_vendor.index.getStorageSync("isFirst");
      if (isFirstOpen) {
        guideShow.value = true;
      } else {
        guideShow.value = false;
      }
    });
    const guideShowClick = () => {
      common_vendor.index.__f__("log", "at components/guide/guide.vue:48", "点击了新手引导页");
      guideShow.value = false;
      common_vendor.index.setStorageSync("isFirst", false);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: guideShow.value
      }, guideShow.value ? {
        b: common_assets._imports_0$3,
        c: common_assets._imports_1$5,
        d: common_assets._imports_2$4,
        e: common_vendor.o(guideShowClick),
        f: common_assets._imports_3$3,
        g: common_assets._imports_4$2
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b17e17e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/guide/guide.js.map

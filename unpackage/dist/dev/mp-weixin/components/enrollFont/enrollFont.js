"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const maxSloganCount = 9;
const _sfc_main = {
  __name: "enrollFont",
  setup(__props, { expose: __expose }) {
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at components/enrollFont/enrollFont.vue:36", "组件已显示");
    });
    common_vendor.ref("月光是我的补光灯");
    common_vendor.ref("午夜光合作用者");
    common_vendor.ref(false);
    common_vendor.ref(false);
    common_vendor.ref("");
    common_vendor.ref("");
    const currentSloganIndex = common_vendor.ref(1);
    const currentSloganImage = common_vendor.computed(() => {
      return `../../static/enrollment/slogan/slogan-${currentSloganIndex.value}.png`;
    });
    const switchSloganPrev = () => {
      if (currentSloganIndex.value > 1) {
        currentSloganIndex.value--;
      } else {
        currentSloganIndex.value = maxSloganCount;
      }
    };
    const switchSloganNext = () => {
      if (currentSloganIndex.value < maxSloganCount) {
        currentSloganIndex.value++;
      } else {
        currentSloganIndex.value = 1;
      }
    };
    const getCurrentSloganImage = () => {
      return currentSloganImage.value;
    };
    __expose({
      getCurrentSloganImage
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$5,
        b: common_assets._imports_1$7,
        c: common_vendor.o(switchSloganPrev),
        d: currentSloganImage.value,
        e: common_assets._imports_2$6,
        f: common_vendor.o(switchSloganNext)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f1e3606"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/enrollFont/enrollFont.js.map

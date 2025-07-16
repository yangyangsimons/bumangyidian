"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const maxSloganCount = 14;
const _sfc_main = {
  __name: "enrollFont",
  setup(__props, { expose: __expose }) {
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at components/enrollFont/enrollFont.vue:36", "组件已显示");
    });
    const currentSloganIndex = common_vendor.ref(1);
    const showTip = common_vendor.ref(true);
    const touchStartX = common_vendor.ref(0);
    const touchStartY = common_vendor.ref(0);
    const touchEndX = common_vendor.ref(0);
    const touchEndY = common_vendor.ref(0);
    const minSwipeDistance = common_vendor.ref(50);
    const maxVerticalDistance = common_vendor.ref(100);
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
    const handleTouchStart = (e) => {
      showTip.value = false;
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
    };
    const handleTouchEnd = (e) => {
      touchEndX.value = e.changedTouches[0].clientX;
      touchEndY.value = e.changedTouches[0].clientY;
      handleSwipe();
    };
    const handleSwipe = () => {
      const deltaX = touchEndX.value - touchStartX.value;
      const deltaY = Math.abs(touchEndY.value - touchStartY.value);
      if (Math.abs(deltaX) > minSwipeDistance.value && deltaY < maxVerticalDistance.value) {
        if (deltaX > 0) {
          switchSloganPrev();
        } else {
          switchSloganNext();
        }
      }
    };
    const getCurrentSloganImage = () => {
      return currentSloganImage.value;
    };
    __expose({
      getCurrentSloganImage
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$7,
        b: currentSloganImage.value,
        c: showTip.value
      }, showTip.value ? {
        d: common_assets._imports_1$8
      } : {}, {
        e: common_vendor.o(handleTouchStart),
        f: common_vendor.o(handleTouchMove),
        g: common_vendor.o(handleTouchEnd)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f1e3606"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/enrollFont/enrollFont.js.map

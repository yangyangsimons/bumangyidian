"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_barrage = require("../../stores/barrage.js");
const _sfc_main = {
  __name: "barrage",
  setup(__props) {
    const instance = common_vendor.getCurrentInstance();
    const barrageStore = stores_barrage.useBarrageStore();
    const scrollTop = common_vendor.ref(0);
    const scrollToBottom = async () => {
      await common_vendor.nextTick$1();
      try {
        const query = common_vendor.index.createSelectorQuery().in(instance);
        query.select(".messages-wrapper").boundingClientRect((wrapperRect) => {
          if (!wrapperRect)
            return;
          query.select(".scroll-view").boundingClientRect((scrollRect) => {
            if (!scrollRect)
              return;
            const heightDifference = wrapperRect.height - scrollRect.height;
            scrollTop.value = Math.max(0, heightDifference + 50);
          }).exec();
        }).exec();
      } catch (error) {
        common_vendor.index.__f__("error", "at components/barrage/barrage.vue:68", "滚动计算出错:", error);
      }
    };
    const stopWatch = common_vendor.watch(
      () => barrageStore.messages.length,
      (newVal, oldVal) => {
        if (newVal > oldVal) {
          scrollToBottom();
        }
      }
    );
    common_vendor.onUnmounted(() => {
      stopWatch();
    });
    const messages = common_vendor.computed(() => {
      if (barrageStore.messages.length % 5 === 0) {
        common_vendor.index.__f__("log", "at components/barrage/barrage.vue:90", "消息数量:", barrageStore.messages.length);
      }
      return barrageStore.messages;
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(messages.value, (msg, k0, i0) => {
          return {
            a: common_vendor.t(msg.content),
            b: msg.id,
            c: msg.type === "user" ? 1 : ""
          };
        }),
        b: scrollTop.value
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cddbe1be"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/barrage/barrage.js.map

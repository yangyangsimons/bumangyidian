"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_tabbar = require("../../stores/tabbar.js");
const _sfc_main = {
  __name: "tabbar",
  setup(__props) {
    const tabbarStore = stores_tabbar.useTabbarStore();
    const showTip = common_vendor.ref(false);
    const tipIndex = common_vendor.ref(-1);
    const tipMessage = common_vendor.ref("");
    const tipMessages = [
      "功能即将开放，敬请期待！",
      "新功能正在开发中~",
      "精彩内容即将上线！",
      "敬请期待更多惊喜！",
      "功能升级中，请耐心等待"
    ];
    const handleTabClick = (index) => {
      if (index !== tabbarStore.activeIndex) {
        tabbarStore.activeIndex = index;
      }
      showTip.value = true;
      tipIndex.value = index;
      tipMessage.value = tipMessages[Math.floor(Math.random() * tipMessages.length)];
      setTimeout(() => {
        showTip.value = false;
        tipIndex.value = -1;
      }, 2e3);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(common_vendor.unref(tabbarStore).tabList, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.unref(tabbarStore).activeIndex === index ? item.iconSelected : item.icon,
            b: common_vendor.n({
              "tab-icon-large": item.isLarge
            }),
            c: common_vendor.t(item.name),
            d: common_vendor.n({
              "tab-text-active": common_vendor.unref(tabbarStore).activeIndex === index
            }),
            e: showTip.value && tipIndex.value === index
          }, showTip.value && tipIndex.value === index ? {
            f: common_vendor.t(tipMessage.value),
            g: common_vendor.n({
              "tip-arrow-large": item.isLarge
            }),
            h: common_vendor.n({
              "tip-bubble-large": item.isLarge
            })
          } : {}, {
            i: index,
            j: common_vendor.n({
              active: common_vendor.unref(tabbarStore).activeIndex === index
            }),
            k: common_vendor.o(($event) => handleTabClick(index), index)
          });
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e9b92a61"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/tabbar/tabbar.js.map

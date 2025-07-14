"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const useTabbarStore = common_vendor.defineStore("tabbar", {
  state: () => ({
    activeIndex: 2,
    tabList: [
      {
        name: "首页",
        path: "/pages/hello/hello",
        icon: common_assets.Home,
        iconSelected: common_assets.HomeSelect
      },
      {
        name: "互动",
        path: "/pages/enrollment2025/enrollment2025",
        icon: common_assets.Chat,
        iconSelected: common_assets.ChatSelect
      },
      {
        name: "",
        // 空字符串，不显示文字
        path: "/pages/index/index",
        icon: common_assets.Main,
        iconSelected: common_assets.Main,
        isLarge: true
        // 添加标识符
      },
      {
        name: "活动",
        path: "/pages/lottery/lottery",
        icon: common_assets.Activity,
        iconSelected: common_assets.ActivitySelect
      },
      {
        name: "我的",
        path: "/pages/profile/index",
        icon: common_assets.My,
        iconSelected: common_assets.MySelect
      }
    ]
  }),
  actions: {
    setActiveIndex(index) {
      this.activeIndex = index;
    },
    switchTab(index) {
      this.setActiveIndex(index);
      const targetPage = this.tabList[index];
      common_vendor.index.switchTab({
        url: `${targetPage.path}?tabIndex=${index}`
      });
    }
  }
});
exports.useTabbarStore = useTabbarStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/tabbar.js.map

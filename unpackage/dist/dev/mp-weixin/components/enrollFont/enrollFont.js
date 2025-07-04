"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "enrollFont",
  setup(__props) {
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at components/enrollFont/enrollFont.vue:51", "组件已显示");
    });
    const slogan = common_vendor.ref("月光是我的补光灯");
    const userName = common_vendor.ref("午夜光合作用者");
    const isEditingSlogan = common_vendor.ref(false);
    const isEditingName = common_vendor.ref(false);
    const tempSlogan = common_vendor.ref("");
    const tempUserName = common_vendor.ref("");
    const startEditSlogan = () => {
      tempSlogan.value = slogan.value;
      isEditingSlogan.value = true;
    };
    const finishEditSlogan = () => {
      if (tempSlogan.value.trim()) {
        slogan.value = tempSlogan.value.trim();
      }
      isEditingSlogan.value = false;
    };
    const startEditName = () => {
      tempUserName.value = userName.value;
      isEditingName.value = true;
    };
    const finishEditName = () => {
      if (tempUserName.value.trim()) {
        userName.value = tempUserName.value.trim();
      }
      isEditingName.value = false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$2,
        b: !isEditingSlogan.value
      }, !isEditingSlogan.value ? {
        c: common_vendor.t(slogan.value),
        d: common_vendor.o(startEditSlogan)
      } : {
        e: isEditingSlogan.value,
        f: common_vendor.o(finishEditSlogan),
        g: common_vendor.o(finishEditSlogan),
        h: tempSlogan.value,
        i: common_vendor.o(($event) => tempSlogan.value = $event.detail.value)
      }, {
        j: !isEditingName.value
      }, !isEditingName.value ? {
        k: common_vendor.t(userName.value),
        l: common_vendor.o(startEditName)
      } : {
        m: isEditingName.value,
        n: common_vendor.o(finishEditName),
        o: common_vendor.o(finishEditName),
        p: tempUserName.value,
        q: common_vendor.o(($event) => tempUserName.value = $event.detail.value)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1f1e3606"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/enrollFont/enrollFont.js.map

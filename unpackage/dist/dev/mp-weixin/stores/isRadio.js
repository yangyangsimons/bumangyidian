"use strict";
const common_vendor = require("../common/vendor.js");
const useIsRadioStore = common_vendor.defineStore("isRadio", {
  state: () => ({
    isRadio: false
  }),
  actions: {
    setIsRadio(isRadio) {
      common_vendor.index.__f__("log", "at stores/isRadio.js:9", "更新前是radio模式吗:", this.isRadio);
      this.isRadio = isRadio;
      common_vendor.index.__f__("log", "at stores/isRadio.js:11", "更新后是radio模式吗:", this.isRadio);
    }
  }
});
exports.useIsRadioStore = useIsRadioStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/isRadio.js.map

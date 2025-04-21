"use strict";
const common_vendor = require("../common/vendor.js");
const useModelStore = common_vendor.defineStore("model", {
  state: () => ({
    model: "常规模式"
  }),
  actions: {
    setModel(model) {
      this.model = model;
    }
  }
});
exports.useModelStore = useModelStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/model.js.map

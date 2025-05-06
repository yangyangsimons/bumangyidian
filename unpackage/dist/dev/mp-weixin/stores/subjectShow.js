"use strict";
const common_vendor = require("../common/vendor.js");
const subjectShowStore = common_vendor.defineStore("subjectShow", {
  state: () => ({
    subjectShow: false
  }),
  actions: {
    setSubjectShow(subjectShow) {
      common_vendor.index.__f__("log", "at stores/subjectShow.js:9", "更新前subject是否显示:", this.subjectShow);
      this.subjectShow = subjectShow;
      common_vendor.index.__f__("log", "at stores/subjectShow.js:11", "更新后subject是否显示:", this.subjectShow);
    }
  }
});
exports.subjectShowStore = subjectShowStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/subjectShow.js.map

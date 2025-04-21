"use strict";
const common_vendor = require("../common/vendor.js");
const useSubjectStore = common_vendor.defineStore("subject", {
  state: () => ({
    subject: "关于所有一切的话题"
  }),
  actions: {
    setSubject(subject) {
      common_vendor.index.__f__("log", "at stores/subject.js:9", "更新前:", this.subject);
      this.subject = subject;
      common_vendor.index.__f__("log", "at stores/subject.js:11", "更新后:", this.subject);
    }
  }
});
exports.useSubjectStore = useSubjectStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/subject.js.map

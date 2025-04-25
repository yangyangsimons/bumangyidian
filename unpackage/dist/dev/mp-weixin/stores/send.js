"use strict";
const common_vendor = require("../common/vendor.js");
const useSendStore = common_vendor.defineStore("send", {
  state: () => ({
    send: true
  }),
  actions: {
    setSend(okToSend) {
      common_vendor.index.__f__("log", "at stores/send.js:9", "更新前sendable:", this.send);
      this.send = okToSend;
      common_vendor.index.__f__("log", "at stores/send.js:11", "更新后sendable:", this.send);
    }
  }
});
exports.useSendStore = useSendStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/send.js.map

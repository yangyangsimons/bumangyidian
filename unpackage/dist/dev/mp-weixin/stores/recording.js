"use strict";
const common_vendor = require("../common/vendor.js");
const useRecordingStore = common_vendor.defineStore("recording", {
  state: () => ({
    isRecording: false
  }),
  actions: {
    startRecording() {
      this.isRecording = true;
    },
    stopRecording() {
      this.isRecording = false;
    }
  }
});
exports.useRecordingStore = useRecordingStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/recording.js.map

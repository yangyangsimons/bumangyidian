"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_recording = require("../../stores/recording.js");
const _sfc_main = {
  __name: "record-animation",
  setup(__props) {
    const recordingStore = stores_recording.useRecordingStore();
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(recordingStore).isRecording
      }, common_vendor.unref(recordingStore).isRecording ? {
        b: common_assets._imports_0$4
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c35cfa7d"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/record-animation/record-animation.js.map

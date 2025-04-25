"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_websocket = require("../../stores/websocket.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
const stores_barrage = require("../../stores/barrage.js");
const _sfc_main = {
  __name: "guide",
  setup(__props) {
    const barrageStore = stores_barrage.useBarrageStore();
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    const wsStore = stores_websocket.useWebSocketStore();
    const guideShow = common_vendor.ref(false);
    const token = common_vendor.ref("");
    const istourist = common_vendor.ref(true);
    const isYkClick = async () => {
      common_vendor.index.getStorage({
        key: "token",
        success: async (res) => {
          common_vendor.index.__f__("log", "at components/guide/guide.vue:48", "获取token成功", res.data);
          if (res.data) {
            token.value = res.data;
            common_vendor.index.setStorage({
              key: "isFirst",
              data: false
            });
            common_vendor.index.setStorage({
              key: "tourist",
              data: false
            });
            common_vendor.index.__f__("log", "at components/guide/guide.vue:60", "注册用户");
            guideShow.value = false;
          } else {
            common_vendor.index.__f__("log", "at components/guide/guide.vue:63", "游客点击了页面");
            const isFirst = await common_vendor.index.getStorage({
              key: "isFirst"
            });
            const tourist = await common_vendor.index.getStorage({
              key: "tourist"
            });
            istourist.value = tourist.data;
            common_vendor.index.__f__(
              "log",
              "at components/guide/guide.vue:72",
              "游客点击了页面isFirst,tourist",
              isFirst.data,
              tourist.data
            );
            if (tourist.data) {
              common_vendor.index.showModal({
                title: "",
                content: "登录后体验完整功能",
                success: async (res2) => {
                  if (res2.confirm) {
                    await wsStore.close();
                    audioPlayerStore.stopAllAudio();
                    barrageStore.clearMessages();
                    common_vendor.index.__f__("log", "at components/guide/guide.vue:86", "用户点击确定");
                    setTimeout(() => {
                      common_vendor.index.reLaunch({
                        url: "/pages/login/login"
                      });
                    }, 1e3);
                  } else if (res2.cancel) {
                    common_vendor.index.__f__("log", "at components/guide/guide.vue:94", "用户点击取消");
                  }
                }
              });
            }
          }
        },
        fail: async (error) => {
          common_vendor.index.__f__("log", "at components/guide/guide.vue:102", "获取token失败", error);
          common_vendor.index.__f__("log", "at components/guide/guide.vue:106", "游客用户");
          common_vendor.index.__f__("log", "at components/guide/guide.vue:108", "游客点击了页面");
          const isFirst = await common_vendor.index.getStorage({
            key: "isFirst"
          });
          const tourist = await common_vendor.index.getStorage({
            key: "tourist"
          });
          common_vendor.index.__f__("log", "at components/guide/guide.vue:116", "游客点击了页面isFirst,tourist", isFirst.data, tourist.data);
          if (tourist.data) {
            common_vendor.index.showModal({
              title: "",
              content: "登录后体验完整功能",
              success: async (res) => {
                if (res.confirm) {
                  common_vendor.index.__f__("log", "at components/guide/guide.vue:123", "用户点击确定");
                  await wsStore.close();
                  audioPlayerStore.stopAllAudio();
                  barrageStore.clearMessages();
                  common_vendor.index.__f__("log", "at components/guide/guide.vue:127", "用户点击确定");
                  setTimeout(() => {
                    common_vendor.index.reLaunch({
                      url: "/pages/login/login"
                    });
                  }, 1e3);
                  common_vendor.index.reLaunch({
                    url: "/pages/login/login"
                  });
                } else if (res.cancel) {
                  common_vendor.index.__f__("log", "at components/guide/guide.vue:138", "用户点击取消");
                }
              }
            });
          }
        }
      });
      if (token && token.data) {
        common_vendor.index.__f__("log", "at components/guide/guide.vue:146", "token", token.data);
      }
    };
    common_vendor.onShow(async () => {
      common_vendor.index.__f__("log", "at components/guide/guide.vue:152", "新手引导页页面显示");
      const isFirstOpen = await common_vendor.index.getStorageSync("isFirst");
      if (isFirstOpen) {
        guideShow.value = true;
      } else {
        guideShow.value = false;
      }
    });
    const guideShowClick = () => {
      common_vendor.index.__f__("log", "at components/guide/guide.vue:161", "新手引导页点击", istourist.value);
      if (istourist.value) {
        guideShow.value = true;
        return;
      } else {
        common_vendor.index.__f__("log", "at components/guide/guide.vue:167", "点击了新手引导页");
        guideShow.value = false;
        common_vendor.index.setStorageSync("isFirst", false);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: guideShow.value
      }, guideShow.value ? {
        b: common_assets._imports_0$3,
        c: common_assets._imports_1$5,
        d: common_assets._imports_2$3,
        e: common_vendor.o(guideShowClick),
        f: common_assets._imports_3$3,
        g: common_assets._imports_4$3,
        h: common_vendor.o(isYkClick)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b17e17e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/guide/guide.js.map

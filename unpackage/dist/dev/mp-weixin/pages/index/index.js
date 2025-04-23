"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const stores_websocket = require("../../stores/websocket.js");
const stores_barrage = require("../../stores/barrage.js");
const stores_model = require("../../stores/model.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
const stores_subject = require("../../stores/subject.js");
const stores_isRadio = require("../../stores/isRadio.js");
if (!Math) {
  (recordAnimation + barrage + chat)();
}
const barrage = () => "../../components/barrage/barrage.js";
const chat = () => "../../components/chat/chat.js";
const recordAnimation = () => "../../components/record-animation/record-animation.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const systemColor = common_vendor.ref("rgba(26, 28, 30, 1);");
    const isRadioStore = stores_isRadio.useIsRadioStore();
    const isRadio = common_vendor.computed(() => isRadioStore.isRadio);
    const changeModelSrc = common_vendor.ref("../../static/changeModel.png");
    common_vendor.ref(0);
    common_vendor.ref(null);
    common_vendor.ref(0);
    const bgSrc = common_vendor.ref("../../static/index-bg.png");
    common_vendor.ref([]);
    const subejctText = common_vendor.computed(() => sbStore.subject);
    const sbStore = stores_subject.useSubjectStore();
    subejctText.value = sbStore.subject;
    const wsStore = stores_websocket.useWebSocketStore();
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    const barrageStore = stores_barrage.useBarrageStore();
    const modelStore = stores_model.useModelStore();
    const currentModel = common_vendor.ref("常规模式");
    const isGoldModeAvailable = common_vendor.ref(false);
    const systemModelConfig = common_vendor.reactive({
      常规模式: {
        pic_id: 0,
        pic_url: ""
      },
      金种子杯模式: {
        pic_id: 0,
        pic_url: "",
        valid: false
      }
    });
    const shinePointConfig = common_vendor.reactive({
      text: "",
      valid: 0,
      x_ratio: 0,
      y_ratio: 0
    });
    const shinePointVisible = common_vendor.computed(() => {
      if (typeof shinePointConfig.valid === "boolean") {
        return shinePointConfig.valid;
      } else {
        return !!shinePointConfig.valid;
      }
    });
    const isTogglingModel = common_vendor.ref(false);
    const toggleSystemModel = async () => {
      common_vendor.index.showToast({
        title: "切换中...",
        icon: "loading",
        duration: 2500
      });
      if (isTogglingModel.value) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:199", "切换模式操作进行中，请勿重复点击");
        common_vendor.index.showToast({
          title: "操作进行中，请稍候",
          icon: "none"
        });
        return;
      }
      try {
        isTogglingModel.value = true;
        currentModel.value = currentModel.value === "常规模式" ? "金种子杯模式" : "常规模式";
        bgSrc.value = systemModelConfig[currentModel.value].pic_url;
        common_vendor.index.__f__("log", "at pages/index/index.vue:215", `切换到${currentModel.value}`);
        audioPlayerStore.reportCurrentProgress();
        audioPlayerStore.stopAllAudio();
        common_vendor.index.__f__("log", "at pages/index/index.vue:220", "停止并清空所有音频队列");
        barrageStore.clearMessages();
        common_vendor.index.__f__("log", "at pages/index/index.vue:222", "清空消息列表");
        if (currentModel.value === "金种子杯模式") {
          modelStore.setModel("金种子杯模式");
          isRadioStore.setIsRadio(false);
        } else {
          modelStore.setModel("常规模式");
        }
        await wsStore.close();
        common_vendor.index.__f__("log", "at pages/index/index.vue:233", "模式切换WebSocket连接已关闭");
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        try {
          await wsStore.connect();
          common_vendor.index.__f__("log", "at pages/index/index.vue:241", "切换模式的socket重新连接成功");
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          if (currentModel.value === "金种子杯模式") {
            changeModelSrc.value = "../../static/changeModel-2.png";
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 3,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:254", "模式切换消息发送成功");
          } else {
            changeModelSrc.value = "../../static/changeModel.png";
            modelStore.setModel("常规模式");
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 1,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:263", "模式切换消息发送成功");
          }
          common_vendor.index.showToast({
            title: "模式切换成功",
            icon: "success",
            duration: 1500
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:272", "WebSocket操作失败:", error);
          common_vendor.index.showToast({
            title: "切换失败，请稍后再试",
            icon: "none"
          });
          currentModel.value = currentModel.value === "常规模式" ? "金种子杯模式" : "常规模式";
          bgSrc.value = systemModelConfig[currentModel.value].pic_url;
          if (currentModel.value === "金种子杯模式") {
            modelStore.setModel("金种子杯模式");
          } else {
            modelStore.setModel("常规模式");
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:288", "切换模式过程中出错:", error);
        common_vendor.index.showToast({
          title: "切换失败，请稍后再试",
          icon: "none"
        });
      } finally {
        isTogglingModel.value = false;
      }
    };
    const handleSubmit = (message) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:299", message, "handleSubmit");
    };
    const fetchSystemConfig = async () => {
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/system/get_system_setting`, "GET");
        common_vendor.index.__f__("log", "at pages/index/index.vue:306", "获取系统配置", res);
        if (res.data && res.data.shine_point) {
          Object.assign(shinePointConfig, res.data.shine_point);
        }
        if (res.data && res.data.system_model) {
          if (res.data.system_model["常规模式"]) {
            systemModelConfig["常规模式"] = res.data.system_model["常规模式"];
          }
          if (res.data.system_model["金种子杯模式"]) {
            systemModelConfig["金种子杯模式"] = res.data.system_model["金种子杯模式"];
            isGoldModeAvailable.value = !!res.data.system_model["金种子杯模式"].valid;
          }
          bgSrc.value = systemModelConfig[currentModel.value].pic_url;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:333", "获取系统配置失败:", error);
      }
    };
    common_vendor.onShow(async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:340", "主页面显示");
        const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
        common_vendor.index.__f__("log", "at pages/index/index.vue:343", "获取当前主题", currentSubject.data.topic);
        sbStore.setSubject(currentSubject.data.topic);
        await fetchSystemConfig();
        if (isRadio.value) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:352", "电台模式下执行的onShow逻辑", isRadio.value);
          common_vendor.index.__f__("log", "at pages/index/index.vue:353", "背景音乐是否正在播放", audioPlayerStore.bgIsPlaying);
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/index/index.vue:358", "socket连接成功");
          }
        } else {
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/index/index.vue:366", "socket连接成功");
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 3,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:374", "发送input_type=3的初始消息成功");
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:378", "页面显示时发生错误:", error);
        common_vendor.index.showToast({
          title: "连接失败，请重试",
          icon: "none"
        });
      }
    });
    common_vendor.onHide(async () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:388", "onHide主页面隐藏");
      audioPlayerStore.reportCurrentProgress();
      common_vendor.index.__f__("log", "at pages/index/index.vue:392", "音频播放状态已上报");
      if (isRadio.value) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:397", "电台模式下不停止背景音乐onHide", isRadio.value);
        audioPlayerStore.stopTtsAudio();
      } else {
        audioPlayerStore.stopAllAudio();
        barrageStore.clearMessages();
        common_vendor.index.__f__("log", "at pages/index/index.vue:402", "停止并清空所有音频队列", "非电台模式下停止背景音乐");
        common_vendor.index.__f__("log", "at pages/index/index.vue:404", "清空消息列表");
      }
      await wsStore.close();
      common_vendor.index.__f__("log", "at pages/index/index.vue:409", "Hidesocket连接关闭");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: isGoldModeAvailable.value
      }, isGoldModeAvailable.value ? {
        c: changeModelSrc.value,
        d: common_vendor.t(currentModel.value === "常规模式" ? "创业金种子" : "常规模式"),
        e: common_vendor.t(currentModel.value === "常规模式" ? "来湘创业全掌握" : "退出创业问答"),
        f: common_vendor.o(toggleSystemModel)
      } : {}, {
        g: bgSrc.value,
        h: shinePointVisible.value
      }, shinePointVisible.value ? {
        i: common_assets._imports_1$1,
        j: common_vendor.t(shinePointConfig.text),
        k: `${shinePointConfig.x_ratio * 100}%`,
        l: `${shinePointConfig.y_ratio * 100}%`
      } : {}, {
        m: currentModel.value === "常规模式"
      }, currentModel.value === "常规模式" ? common_vendor.e({
        n: common_vendor.t(subejctText.value),
        o: _ctx.needScroll
      }, _ctx.needScroll ? {} : {}, {
        p: _ctx.needScroll
      }, _ctx.needScroll ? {
        q: common_vendor.t(subejctText.value)
      } : {}, {
        r: `translateX(${-_ctx.scrollPosition}px)`,
        s: systemColor.value
      }) : {}, {
        t: common_vendor.o(handleSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map

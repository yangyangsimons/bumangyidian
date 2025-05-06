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
const stores_subjectShow = require("../../stores/subjectShow.js");
const stores_placeholderStore = require("../../stores/placeholderStore.js");
const stores_toggleModelStore = require("../../stores/toggleModelStore.js");
if (!Math) {
  (recordAnimation + barrage + chat + guide)();
}
const barrage = () => "../../components/barrage/barrage.js";
const chat = () => "../../components/chat/chat.js";
const guide = () => "../../components/guide/guide.js";
const recordAnimation = () => "../../components/record-animation/record-animation.js";
const scrollSpeed = 1;
const scrollDelay = 10;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const toggleModelStore = stores_toggleModelStore.useToggleModelStore();
    common_vendor.watch(
      () => toggleModelStore.shouldToggleModel,
      (newValue) => {
        if (newValue) {
          toggleSystemModel();
          toggleModelStore.resetModelChangeFlag();
        }
      }
    );
    const placeholderStore = stores_placeholderStore.usePlaceholderStore();
    const systemColor = common_vendor.ref("rgba(26, 28, 30, 1);");
    const subjectshowStore = stores_subjectShow.subjectShowStore();
    const subjectShow = common_vendor.computed(() => {
      return isRadioStore.isRadio || subjectshowStore.subjectShow ? true : false;
    });
    const isRadioStore = stores_isRadio.useIsRadioStore();
    const isRadio = common_vendor.computed(() => isRadioStore.isRadio);
    const changeModelSrc = common_vendor.ref("../../static/changeModel.png");
    const scrollPosition = common_vendor.ref(0);
    const needScroll = common_vendor.ref(false);
    let scrollTimer = null;
    let textWidth = 0;
    common_vendor.onShow(() => {
      common_vendor.nextTick$1(() => {
        initScroll();
      });
    });
    common_vendor.onHide(() => {
      stopScroll();
    });
    const initScroll = () => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".subject").boundingClientRect((textRect) => {
        query.select(".subject-scroll-view").boundingClientRect((containerRect) => {
          if (textRect && containerRect) {
            textWidth = textRect.width;
            if (textRect.width > containerRect.width) {
              needScroll.value = true;
              startScroll();
            }
          }
        }).exec();
      }).exec();
    };
    const startScroll = () => {
      stopScroll();
      scrollTimer = setInterval(() => {
        scrollPosition.value += scrollSpeed;
        if (scrollPosition.value >= textWidth + 60) {
          scrollPosition.value = 0;
        }
      }, scrollDelay);
    };
    const stopScroll = () => {
      if (scrollTimer) {
        clearInterval(scrollTimer);
        scrollTimer = null;
      }
    };
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:253", "切换模式操作进行中，请勿重复点击");
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:269", `切换到${currentModel.value}`);
        audioPlayerStore.reportCurrentProgress();
        audioPlayerStore.stopAllAudio();
        common_vendor.index.__f__("log", "at pages/index/index.vue:274", "停止并清空所有音频队列");
        barrageStore.clearMessages();
        common_vendor.index.__f__("log", "at pages/index/index.vue:276", "清空消息列表");
        if (currentModel.value === "金种子杯模式") {
          modelStore.setModel("金种子杯模式");
          placeholderStore.setRandomSpecialPlaceholder();
          isRadioStore.setIsRadio(false);
        } else {
          modelStore.setModel("常规模式");
          placeholderStore.setRandomNormalPlaceholder();
        }
        await wsStore.close();
        common_vendor.index.__f__("log", "at pages/index/index.vue:291", "模式切换WebSocket连接已关闭");
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        try {
          await wsStore.connect();
          common_vendor.index.__f__("log", "at pages/index/index.vue:299", "切换模式的socket重新连接成功");
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          if (currentModel.value === "金种子杯模式") {
            changeModelSrc.value = "../../static/changeModel-2.png";
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 3,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:312", "模式切换消息发送成功");
          } else {
            changeModelSrc.value = "../../static/changeModel.png";
            modelStore.setModel("常规模式");
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 1,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:321", "模式切换消息发送成功");
          }
          common_vendor.index.showToast({
            title: "模式切换成功",
            icon: "success",
            duration: 1500
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:330", "WebSocket操作失败:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:346", "切换模式过程中出错:", error);
        common_vendor.index.showToast({
          title: "切换失败，请稍后再试",
          icon: "none"
        });
      } finally {
        isTogglingModel.value = false;
      }
    };
    const handleSubmit = (message) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:357", message, "handleSubmit");
    };
    const fetchSystemConfig = async () => {
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/system/get_system_setting`, "GET");
        common_vendor.index.__f__("log", "at pages/index/index.vue:364", "获取系统配置", res);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:391", "获取系统配置失败:", error);
      }
    };
    common_vendor.onShow(async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:398", "主页面显示");
        const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
        common_vendor.index.__f__("log", "at pages/index/index.vue:401", "获取当前主题", currentSubject.data.topic);
        sbStore.setSubject(currentSubject.data.topic);
        await fetchSystemConfig();
        if (isRadio.value) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:410", "电台模式下执行的onShow逻辑", isRadio.value);
          common_vendor.index.__f__("log", "at pages/index/index.vue:411", "背景音乐是否正在播放", audioPlayerStore.bgIsPlaying);
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/index/index.vue:416", "socket连接成功");
          }
        } else {
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/index/index.vue:424", "socket连接成功");
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 3,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:432", "发送input_type=3的初始消息成功");
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:436", "页面显示时发生错误:", error);
        common_vendor.index.showToast({
          title: "连接失败，请重试",
          icon: "none"
        });
      }
    });
    common_vendor.onHide(async () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:446", "onHide主页面隐藏");
      audioPlayerStore.reportCurrentProgress();
      common_vendor.index.__f__("log", "at pages/index/index.vue:450", "音频播放状态已上报");
      if (isRadio.value) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:455", "电台模式下不停止背景音乐onHide", isRadio.value);
        audioPlayerStore.stopTtsAudio();
      } else {
        audioPlayerStore.stopAllAudio();
        barrageStore.clearMessages();
        common_vendor.index.__f__("log", "at pages/index/index.vue:460", "停止并清空所有音频队列", "非电台模式下停止背景音乐");
        common_vendor.index.__f__("log", "at pages/index/index.vue:462", "清空消息列表");
      }
      await wsStore.close();
      common_vendor.index.__f__("log", "at pages/index/index.vue:467", "Hidesocket连接关闭");
    });
    common_vendor.onShareAppMessage(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:470", "onShareAppMessage......");
      return {
        title: `不芒一点，陪你世界加一点`,
        imageUrl: "../../static/share.png",
        path: "/pages/index/index"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:478", "onShareTimeline......");
      return {
        title: `不芒一点，陪你世界加一点`
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: isGoldModeAvailable.value
      }, isGoldModeAvailable.value ? {
        c: changeModelSrc.value,
        d: common_vendor.t(currentModel.value === "常规模式" ? "「不芒」学长" : "「树洞」模式"),
        e: common_vendor.t(currentModel.value === "常规模式" ? "创新创业专家解读" : "陪你早安到晚安"),
        f: common_vendor.o(toggleSystemModel)
      } : {}, {
        g: bgSrc.value,
        h: shinePointVisible.value
      }, shinePointVisible.value ? {
        i: common_assets._imports_1$3,
        j: common_vendor.t(shinePointConfig.text),
        k: `${shinePointConfig.x_ratio * 100}%`,
        l: `${shinePointConfig.y_ratio * 100}%`
      } : {}, {
        m: currentModel.value != "金种子杯模式" && subjectShow.value
      }, currentModel.value != "金种子杯模式" && subjectShow.value ? common_vendor.e({
        n: common_vendor.t(subejctText.value),
        o: needScroll.value
      }, needScroll.value ? {} : {}, {
        p: needScroll.value
      }, needScroll.value ? {
        q: common_vendor.t(subejctText.value)
      } : {}, {
        r: `translateX(${-scrollPosition.value}px)`,
        s: systemColor.value
      }) : {}, {
        t: common_vendor.o(handleSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map

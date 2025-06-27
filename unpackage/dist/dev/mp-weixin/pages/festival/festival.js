"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const stores_websocket = require("../../stores/websocket.js");
const stores_barrage = require("../../stores/barrage.js");
const stores_model = require("../../stores/model.js");
const utils_report = require("../../utils/report.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
const stores_subject = require("../../stores/subject.js");
const stores_isRadio = require("../../stores/isRadio.js");
const stores_subjectShow = require("../../stores/subjectShow.js");
const stores_placeholderStore = require("../../stores/placeholderStore.js");
const stores_toggleModelStore = require("../../stores/toggleModelStore.js");
if (!Math) {
  (recordAnimation + barrage + festivalChat + guide + DanmakuComponent)();
}
const DanmakuComponent = () => "../../components/DanmakuComponent/DanmakuComponent.js";
const barrage = () => "../../components/barrage/barrage.js";
const festivalChat = () => "../../components/festival-chat/festival-chat.js";
const guide = () => "../../components/guide/guide.js";
const recordAnimation = () => "../../components/record-animation/record-animation.js";
const scrollSpeed = 1;
const scrollDelay = 10;
const _sfc_main = {
  __name: "festival",
  setup(__props) {
    let heartbeatTimer = null;
    const startHeartbeat = () => {
      stopHeartbeat();
      heartbeatTimer = setInterval(async () => {
        try {
          if (wsStore.isConnected) {
            await wsStore.sendMessage({
              system_model: currentModel.value,
              input_type: 5,
              text: ""
            });
            common_vendor.index.__f__("log", "at pages/festival/festival.vue:161", "心跳消息发送成功");
          } else {
            common_vendor.index.__f__("warn", "at pages/festival/festival.vue:163", "WebSocket未连接，跳过心跳消息发送");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/festival/festival.vue:166", "心跳消息发送失败:", error);
        }
      }, 1e4);
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:170", "心跳定时器已启动");
    };
    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:178", "心跳定时器已清除");
      }
    };
    const showAd = common_vendor.ref(false);
    const adList = common_vendor.ref([]);
    const showDots = common_vendor.ref(false);
    const toggleModelStore = stores_toggleModelStore.useToggleModelStore();
    const sptime = common_vendor.ref(0);
    const current = common_vendor.ref(0);
    const danmakuRef = common_vendor.ref();
    const startDanmaku = () => {
      var _a;
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:193", "开始弹幕");
      (_a = danmakuRef.value) == null ? void 0 : _a.startDanmaku();
    };
    const handleAdClose = () => {
      showAd.value = false;
    };
    const adNav = (adUrl) => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:205", "广告链接......:", adUrl);
      const url = `/pages/ad/ad?address=${adUrl}`;
      common_vendor.index.navigateTo({ url });
    };
    const handleAdChange = (e) => {
      current.value = e.detail.current;
    };
    common_vendor.watch(
      () => toggleModelStore.shouldToggleModel,
      (newValue) => {
        if (newValue) {
          toggleSystemModel();
          toggleModelStore.resetModelChangeFlag();
        }
      }
    );
    stores_placeholderStore.usePlaceholderStore();
    common_vendor.ref("rgba(26, 28, 30, 1);");
    const subjectshowStore = stores_subjectShow.subjectShowStore();
    common_vendor.computed(() => {
      return isRadioStore.isRadio || subjectshowStore.subjectShow ? true : false;
    });
    const isRadioStore = stores_isRadio.useIsRadioStore();
    const isRadio = common_vendor.computed(() => isRadioStore.isRadio);
    common_vendor.ref("../../static/changeModel.png");
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
    stores_model.useModelStore();
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
    common_vendor.ref(false);
    const handleSubmit = (message) => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:352", message, "handleSubmit");
    };
    const fetchSystemConfig = async () => {
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/system/get_system_setting`, "GET");
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:359", "获取系统配置", res);
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
        common_vendor.index.__f__("error", "at pages/festival/festival.vue:386", "获取系统配置失败:", error);
      }
    };
    common_vendor.onShow(async () => {
      barrageStore.clearMessages();
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:392", "onShow主页面显示");
      startDanmaku();
      startHeartbeat();
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:395", "71活动页面显示");
      sptime.value = (/* @__PURE__ */ new Date()).getTime();
      barrageStore.addMessage({
        type: "ai",
        content: '当舞台的灯光点亮，我们即将开启一场跨越时空的文艺之旅----湖南工商大学"文化+科技联盟"文艺汇演，每一个节目都是文化基因的当代诠释，每段表演都在诉说民族精神的传承与突破。\n接下来我们将借助 AI 的视角，带大家深度赏析这些精彩节目 ---- 从艺术表现到精神内核，从创新设计到情感共鸣，让科技为文艺赏析打开全新维度。现在，就让我们先沉浸于这场视听盛宴，随后一起解锁 AI 眼中的艺术密码吧！',
        time: (/* @__PURE__ */ new Date()).getTime()
      });
      utils_report.dmReport(
        "pv",
        {},
        {
          page: "homePage",
          contents: [
            {
              page: "homePage"
            }
          ]
        }
      );
      try {
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:418", "主页面显示");
        const adRes = await utils_request.request(
          `${utils_config.baseUrl}/system/get_activity_notify`,
          "GET"
        );
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:424", "获取广告", adRes);
        if (adRes.code == 0 && adRes.data.length > 0) {
          adList.value = adRes.data;
          showAd.value = true;
        }
        const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:431", "获取当前主题", currentSubject.data.topic);
        sbStore.setSubject(currentSubject.data.topic);
        await fetchSystemConfig();
        if (isRadio.value) {
          common_vendor.index.__f__("log", "at pages/festival/festival.vue:440", "电台模式下执行的onShow逻辑", isRadio.value);
          common_vendor.index.__f__("log", "at pages/festival/festival.vue:441", "背景音乐是否正在播放", audioPlayerStore.bgIsPlaying);
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/festival/festival.vue:446", "socket连接成功");
            startHeartbeat();
          }
        } else {
          if (!wsStore.isConnected) {
            await wsStore.connect();
            common_vendor.index.__f__("log", "at pages/festival/festival.vue:454", "socket连接成功");
            startHeartbeat();
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/festival/festival.vue:460", "页面显示时发生错误:", error);
      }
    });
    common_vendor.onHide(async () => {
      const endTime = (/* @__PURE__ */ new Date()).getTime();
      const duration = endTime - sptime.value;
      utils_report.dmReport(
        "stay",
        {},
        {
          page: "homePage",
          sptime: duration
        }
      );
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:476", "onHide主页面隐藏");
      stopHeartbeat();
      audioPlayerStore.reportCurrentProgress();
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:483", "音频播放状态已上报");
      if (isRadio.value) {
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:488", "电台模式下不停止背景音乐onHide", isRadio.value);
        audioPlayerStore.stopTtsAudio();
      } else {
        audioPlayerStore.stopTtsAudio();
        barrageStore.clearMessages();
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:494", "停止并清空所有音频队列", "非电台模式下停止背景音乐");
        common_vendor.index.__f__("log", "at pages/festival/festival.vue:496", "清空消息列表");
      }
      await wsStore.close();
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:501", "Hidesocket连接关闭");
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:506", "组件即将卸载，清理定时器");
      stopHeartbeat();
      stopScroll();
    });
    common_vendor.onUnload(() => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:513", "页面卸载，清理定时器");
      stopHeartbeat();
      stopScroll();
    });
    common_vendor.onShareAppMessage(() => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:519", "onShareAppMessage......");
      return {
        title: `不芒一点，陪你世界加一点`,
        imageUrl: "../../static/share.png",
        path: "/pages/index/index"
      };
    });
    common_vendor.onShareTimeline(() => {
      common_vendor.index.__f__("log", "at pages/festival/festival.vue:527", "onShareTimeline......");
      return {
        title: `不芒一点，陪你世界加一点`
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$2,
        b: shinePointVisible.value
      }, shinePointVisible.value ? {
        c: common_assets._imports_1,
        d: common_vendor.t(shinePointConfig.text),
        e: `${shinePointConfig.x_ratio * 100}%`,
        f: `${shinePointConfig.y_ratio * 100}%`
      } : {}, {
        g: common_vendor.o(handleSubmit),
        h: showAd.value
      }, showAd.value ? {
        i: common_vendor.f(adList.value, (imgObj, index, i0) => {
          return {
            a: imgObj.pic_url,
            b: index,
            c: common_vendor.o(($event) => adNav(imgObj.activity_url), index)
          };
        }),
        j: showDots.value,
        k: _ctx.autoplay,
        l: _ctx.interval,
        m: _ctx.duration,
        n: _ctx.circular,
        o: common_vendor.o(handleAdChange),
        p: common_vendor.f(adList.value, (_, index, i0) => {
          return {
            a: index,
            b: current.value === index ? 1 : ""
          };
        }),
        q: common_assets._imports_2,
        r: common_vendor.o(handleAdClose)
      } : {}, {
        s: common_vendor.sr(danmakuRef, "bfd19725-4", {
          "k": "danmakuRef"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bfd19725"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/festival/festival.js.map

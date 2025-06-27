"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_recording = require("../../stores/recording.js");
const stores_barrage = require("../../stores/barrage.js");
const stores_websocket = require("../../stores/websocket.js");
const stores_model = require("../../stores/model.js");
const stores_subject = require("../../stores/subject.js");
const utils_config = require("../../utils/config.js");
const stores_send = require("../../stores/send.js");
const stores_isRadio = require("../../stores/isRadio.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
const stores_subjectShow = require("../../stores/subjectShow.js");
const stores_placeholderStore = require("../../stores/placeholderStore.js");
const utils_request = require("../../utils/request.js");
const utils_report = require("../../utils/report.js");
require("../../__vite-browser-external_events.js");
const cancelThreshold = 50;
const _sfc_main = {
  __name: "festival-chat",
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const radioInput = common_vendor.ref(false);
    const radioInputMessage = common_vendor.ref("");
    const placeholderStore = stores_placeholderStore.usePlaceholderStore();
    const subjectShow = stores_subjectShow.subjectShowStore();
    const radioText = common_vendor.ref("长按左侧图标退出电台");
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    const sbStore = stores_subject.useSubjectStore();
    const wsStore = stores_websocket.useWebSocketStore();
    const sendStore = stores_send.useSendStore();
    const isRadioStore = stores_isRadio.useIsRadioStore();
    const radioPlay = common_vendor.ref(true);
    const colorSystem = common_vendor.ref("background: rgba(0, 0, 0, 0.2);");
    const inputColor = common_vendor.ref("color:rgba(255, 255, 255, 1)");
    const sendAble = common_vendor.computed(() => {
      return sendStore.send;
    });
    const isRadio = common_vendor.computed(() => {
      return isRadioStore.isRadio;
    });
    const voiceIconSrc = common_vendor.computed(() => {
      return "../../static/voice-icon-disable.png";
    });
    const modelStore = stores_model.useModelStore();
    const message = common_vendor.ref("");
    const inputValue = common_vendor.ref("");
    const barrageStore = stores_barrage.useBarrageStore();
    const recordingStore = stores_recording.useRecordingStore();
    const uploadMessage = common_vendor.ref({});
    const keyboardHeight = common_vendor.ref(32);
    common_vendor.ref("");
    const showText = common_vendor.ref(false);
    var plugin = requirePlugin("WechatSI");
    let manager = plugin.getRecordRecognitionManager();
    common_vendor.ref(null);
    const touchStartY = common_vendor.ref(0);
    const shouldCancel = common_vendor.ref(false);
    const onTouchStart = (event) => {
      touchStartY.value = event.touches[0].clientY;
    };
    const onTouchMove = (event) => {
      if (!recordingStore.isRecording)
        return;
      const currentY = event.touches[0].clientY;
      const moveDistance = touchStartY.value - currentY;
      if (moveDistance > cancelThreshold) {
        shouldCancel.value = true;
      } else {
        shouldCancel.value = false;
      }
    };
    const toggleUserPopup = () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "点击用户信息弹窗"
            }
          ]
        }
      );
      common_vendor.index.showToast({
        title: "活动页面当前功能不可用",
        icon: "none",
        duration: 1500
      });
    };
    const onInputFocus = (e) => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:245", "输入框获取焦点", e);
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "点击文字输入框"
            }
          ]
        }
      );
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "",
          content: "登录后体验完整功能",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:267", "用户点击确定");
              await wsStore.close();
              audioPlayerStore.stopAllAudio();
              barrageStore.clearMessages();
              common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:271", "用户点击确定");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1e3);
            } else if (res.cancel) {
              common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:279", "用户点击取消");
            }
          }
        });
        return;
      }
      common_vendor.index.onKeyboardHeightChange((res) => {
        if (res.height > 0) {
          keyboardHeight.value = res.height + 32;
        } else {
          keyboardHeight.value = 32;
        }
      });
    };
    const onInputBlur = () => {
      keyboardHeight.value = 32;
    };
    const changeInputTypeToText = () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:302", "切换到文字模式");
      showText.value = false;
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "切换到文字输入"
            }
          ]
        }
      );
    };
    const changeInputTypeToVoice = () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:319", "切换到语音模式");
      showText.value = true;
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "切换到语音输入"
            }
          ]
        }
      );
    };
    const startRecord = () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "按住说话"
            }
          ]
        }
      );
      audioPlayerStore.setTtsVolume(0);
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:352", "开始录音");
      recordingStore.startRecording();
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:354", recordingStore.isRecording);
      shouldCancel.value = false;
      manager.start({
        lang: "zh_CN"
      });
    };
    const endRecord = () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:363", "结束录音");
      audioPlayerStore.setTtsVolume(1);
      recordingStore.stopRecording();
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:366", recordingStore.isRecording);
      manager.stop();
      if (shouldCancel.value) {
        common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:370", "取消发送录音");
        shouldCancel.value = false;
        common_vendor.index.showToast({
          title: "已取消发送",
          icon: "none",
          duration: 1500
        });
        return;
      }
      manager.onStop = (res) => {
        common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:381", "识别结束：", res.result);
        message.value = res.result;
        handleUploadMessage(message.value);
      };
      manager.onError = (res) => {
        common_vendor.index.__f__("error", "at components/festival-chat/festival-chat.vue:393", "识别错误：", res);
      };
    };
    const onKeyInput = (event) => {
      inputValue.value = event.detail.value;
    };
    const handleSubmit = () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "点击发送按钮"
            }
          ]
        }
      );
      if (!sendAble.value) {
        common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:419", "不能发送消息");
        common_vendor.index.showLoading({
          title: "加载中",
          mask: true,
          duration: 1e3
        });
        return;
      }
      if (!inputValue.value.trim())
        return;
      const currentInput = inputValue.value;
      inputValue.value = "";
      common_vendor.index.hideKeyboard();
      sendStore.setSend(false);
      setTimeout(() => {
        handleUploadMessage(currentInput);
      }, 50);
    };
    const handleStopGenerate = () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:446", "停止生成消息");
      wsStore.sendMessage({
        input_type: 4,
        text: "stop",
        system_model: modelStore.model
      });
    };
    const handleUploadMessage = async (userMessage) => {
      if (!userMessage || !userMessage.trim())
        return;
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:457", "上传消息了sendAble:", sendAble.value);
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:459", "上传的消息:", userMessage);
      const barrageMessages = barrageStore.messages;
      if (barrageMessages.length >= 1 && barrageMessages[barrageMessages.length - 1].type === "subject") {
        common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:466", "上一个对话是主题选择");
        uploadMessage.system_model = stores_model.useModelStore().model;
        uploadMessage.input_type = 2;
        uploadMessage.text = userMessage;
        setTimeout(async () => {
          const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
          common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:473", "获取当前主题", currentSubject.data.topic);
          sbStore.setSubject(currentSubject.data.topic);
        }, 2e3);
      } else {
        uploadMessage.system_model = stores_model.useModelStore().model;
        uploadMessage.input_type = 1;
        uploadMessage.text = userMessage;
      }
      wsStore.sendMessage(uploadMessage);
      barrageStore.addMessage({
        type: "leaveMessage",
        content: userMessage
        // 使用传入的userMessage而不是inputValue
      });
      audioPlayerStore.stopTtsAudio();
      common_vendor.index.showToast({
        title: "留言已收到",
        icon: "success",
        duration: 1e3
      });
    };
    const stopRadio = () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "暂停电台播放"
            }
          ]
        }
      );
      radioPlay.value = false;
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:511", "停止电台");
      audioPlayerStore.pauseBgMusic();
      audioPlayerStore.pauseTtsAudio();
    };
    const resumeRadio = () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "恢复电台播放"
            }
          ]
        }
      );
      radioPlay.value = true;
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:531", "恢复电台");
      try {
        audioPlayerStore.resumeTtsAudio();
        audioPlayerStore.resumeBgMusic();
        audioPlayerStore.setBgLoop(false);
      } catch (e) {
        common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:540", "恢复电台失败", e);
        audioPlayerStore.resumeTtsAudio();
      }
    };
    common_vendor.onShow(() => {
      if (isRadioStore.isRadio) {
        voiceIconSrc.value = "../../static/voice-icon-disable.png";
      }
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:552", "聊天组件显示");
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:553", "聊天组件显示isRadio", isRadioStore.isRadio);
      if (modelStore.model === "金种子杯模式") {
        placeholderStore.setRandomSpecialPlaceholder();
      } else {
        placeholderStore.setRandomNormalPlaceholder();
      }
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:564", "聊天组件加载完成");
    });
    common_vendor.onUnload(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    const backToQA = () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:592", "返回问答");
      utils_report.dmReport(
        "click",
        {},
        {
          page: "homePage",
          contents: [
            {
              element_id: "content",
              element_content: "长按退出电台"
            }
          ]
        }
      );
      audioPlayerStore.stopAllAudio();
      modelStore.setModel("QA模式");
      isRadioStore.setIsRadio(false);
      subjectShow.setSubjectShow(true);
      sendStore.setSend(true);
    };
    const onRadioKeyInput = (e) => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:615", "电台模式下点击输入框允许发送");
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:616", "电台模式下点击输入框允许发送", e);
      radioInputMessage.value = e.detail.value;
    };
    const radioInputFocus = (e) => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:620", "电台模式下点击输入框允许发送");
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:621", "电台模式下点击输入框允许发送", e);
      radioInput.value = true;
    };
    const handleRadioInputSubmit = async () => {
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:625", "电台模式下点击发送按钮");
      if (!radioInputMessage.value.trim())
        return;
      const currentInput = radioInputMessage.value;
      radioInputMessage.value = "";
      const uploadMessage2 = await utils_request.request(
        `${utils_config.baseUrl}/content/leave_message`,
        "POST",
        {
          content: currentInput
        }
      );
      common_vendor.index.__f__("log", "at components/festival-chat/festival-chat.vue:641", "上传的消息:", uploadMessage2);
      if (uploadMessage2.code === 0) {
        common_vendor.index.showToast({
          title: "留言已收到",
          icon: "success",
          duration: 1e3
        });
        barrageStore.addMessage({
          type: "leaveMessage",
          content: currentInput
        });
      } else {
        common_vendor.index.showToast({
          title: "发送失败",
          icon: "none",
          duration: 500
        });
      }
      radioInput.value = false;
    };
    const onRadioInputBlur = () => {
      radioInput.value = false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showText.value && !isRadio.value
      }, showText.value && !isRadio.value ? {
        b: common_assets._imports_0$3,
        c: common_vendor.o(changeInputTypeToText),
        d: common_vendor.o(startRecord),
        e: common_vendor.o(endRecord),
        f: common_vendor.o(onTouchMove),
        g: common_vendor.o(onTouchStart),
        h: common_vendor.s(colorSystem.value)
      } : {}, {
        i: !showText.value && !isRadio.value
      }, !showText.value && !isRadio.value ? common_vendor.e({
        j: common_assets._imports_1$4,
        k: common_vendor.o(changeInputTypeToVoice),
        l: inputColor.value,
        m: common_vendor.o(onKeyInput),
        n: inputValue.value,
        o: common_vendor.o(handleSubmit),
        p: common_vendor.o(onInputFocus),
        q: common_vendor.o(onInputBlur),
        r: sendAble.value
      }, sendAble.value ? {
        s: common_assets._imports_2$3,
        t: common_vendor.o(handleSubmit)
      } : {}, {
        v: !sendAble.value
      }, !sendAble.value ? {
        w: common_vendor.o(handleStopGenerate)
      } : {}, {
        x: common_vendor.s(colorSystem.value)
      }) : {}, {
        y: isRadio.value
      }, isRadio.value ? common_vendor.e({
        z: common_assets._imports_3$2,
        A: common_vendor.o(backToQA),
        B: radioText.value,
        C: inputColor.value,
        D: radioInputMessage.value,
        E: common_vendor.o(radioInputFocus),
        F: common_vendor.o(onRadioKeyInput),
        G: common_vendor.o(onRadioInputBlur),
        H: radioPlay.value && !radioInput.value
      }, radioPlay.value && !radioInput.value ? {
        I: common_assets._imports_4$1,
        J: common_vendor.o(stopRadio)
      } : {}, {
        K: !radioPlay.value && !radioInput.value
      }, !radioPlay.value && !radioInput.value ? {
        L: common_assets._imports_5,
        M: common_vendor.o(resumeRadio)
      } : {}, {
        N: radioInput.value
      }, radioInput.value ? {
        O: common_assets._imports_2$3,
        P: common_vendor.o(handleRadioInputSubmit)
      } : {}, {
        Q: common_vendor.s(colorSystem.value)
      }) : {}, {
        R: voiceIconSrc.value,
        S: common_vendor.o(toggleUserPopup)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-69f12fd0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/festival-chat/festival-chat.js.map

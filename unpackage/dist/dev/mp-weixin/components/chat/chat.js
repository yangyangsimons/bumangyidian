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
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_user_popup2 = common_vendor.resolveComponent("user-popup");
  _easycom_user_popup2();
}
const _easycom_user_popup = () => "../user-popup/user-popup.js";
if (!Math) {
  _easycom_user_popup();
}
const cancelThreshold = 50;
const _sfc_main = {
  __name: "chat",
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    const sbStore = stores_subject.useSubjectStore();
    const wsStore = stores_websocket.useWebSocketStore();
    const sendStore = stores_send.useSendStore();
    const isRadioStore = stores_isRadio.useIsRadioStore();
    const radioPlay = common_vendor.ref(true);
    const sendAble = common_vendor.computed(() => {
      return sendStore.send;
    });
    const isRadio = common_vendor.computed(() => {
      return isRadioStore.isRadio;
    });
    const modelStore = stores_model.useModelStore();
    const message = common_vendor.ref("");
    const inputValue = common_vendor.ref("");
    const barrageStore = stores_barrage.useBarrageStore();
    const recordingStore = stores_recording.useRecordingStore();
    const uploadMessage = common_vendor.ref({});
    const keyboardHeight = common_vendor.ref(32);
    const showText = common_vendor.ref(false);
    var plugin = requirePlugin("WechatSI");
    let manager = plugin.getRecordRecognitionManager();
    const userPopupRef = common_vendor.ref(null);
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
      if (isRadio.value) {
        common_vendor.index.showToast({
          title: "电台模式下无法查看用户信息",
          icon: "none",
          duration: 1500
        });
        return;
      }
      userPopupRef.value.open();
    };
    const onInputFocus = (e) => {
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:194", "切换到文字模式");
      showText.value = false;
    };
    const changeInputTypeToVoice = () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:198", "切换到语音模式");
      showText.value = true;
    };
    const startRecord = () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:204", "开始录音");
      recordingStore.startRecording();
      common_vendor.index.__f__("log", "at components/chat/chat.vue:206", recordingStore.isRecording);
      shouldCancel.value = false;
      manager.start({
        lang: "zh_CN"
      });
    };
    const endRecord = () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:215", "结束录音");
      recordingStore.stopRecording();
      common_vendor.index.__f__("log", "at components/chat/chat.vue:217", recordingStore.isRecording);
      manager.stop();
      if (shouldCancel.value) {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:221", "取消发送录音");
        shouldCancel.value = false;
        common_vendor.index.showToast({
          title: "已取消发送",
          icon: "none",
          duration: 1500
        });
        return;
      }
      manager.onStop = (res) => {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:232", "识别结束：", res.result);
        message.value = res.result;
        handleUploadMessage(message.value);
      };
      manager.onError = (res) => {
        common_vendor.index.__f__("error", "at components/chat/chat.vue:243", "识别错误：", res);
      };
    };
    const onKeyInput = (event) => {
      inputValue.value = event.detail.value;
    };
    const handleSubmit = () => {
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:274", "停止生成消息");
      wsStore.sendMessage({
        input_type: 4,
        text: "stop",
        system_model: modelStore.model
      });
    };
    const handleUploadMessage = async (userMessage) => {
      if (!userMessage || !userMessage.trim())
        return;
      common_vendor.index.__f__("log", "at components/chat/chat.vue:286", "上传的消息:", userMessage);
      const barrageMessages = barrageStore.messages;
      if (barrageMessages.length >= 1 && barrageMessages[barrageMessages.length - 1].type === "subject") {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:293", "上一个对话是主题选择");
        uploadMessage.system_model = stores_model.useModelStore().model;
        uploadMessage.input_type = 2;
        uploadMessage.text = userMessage;
        setTimeout(async () => {
          const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
          common_vendor.index.__f__("log", "at components/chat/chat.vue:300", "获取当前主题", currentSubject.data.topic);
          sbStore.setSubject(currentSubject.data.topic);
        }, 2e3);
      } else {
        uploadMessage.system_model = stores_model.useModelStore().model;
        uploadMessage.input_type = 1;
        uploadMessage.text = userMessage;
      }
      wsStore.sendMessage(uploadMessage);
      barrageStore.addMessage({
        type: "user",
        content: userMessage
        // 使用传入的userMessage而不是inputValue
      });
    };
    const stopRadio = () => {
      radioPlay.value = false;
      common_vendor.index.__f__("log", "at components/chat/chat.vue:319", "停止电台");
      audioPlayerStore.pauseBgMusic();
      audioPlayerStore.pauseTtsAudio();
    };
    const resumeRadio = () => {
      radioPlay.value = true;
      common_vendor.index.__f__("log", "at components/chat/chat.vue:326", "恢复电台");
      try {
        audioPlayerStore.resumeTtsAudio();
        audioPlayerStore.resumeBgMusic();
        audioPlayerStore.setBgLoop(false);
      } catch (e) {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:335", "恢复电台失败", e);
        audioPlayerStore.resumeTtsAudio();
      }
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:343", "聊天组件显示");
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:348", "聊天组件加载完成");
    });
    common_vendor.onUnload(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showText.value && !isRadio.value
      }, showText.value && !isRadio.value ? {
        b: common_assets._imports_0$3,
        c: common_vendor.o(changeInputTypeToText),
        d: common_vendor.o(startRecord),
        e: common_vendor.o(endRecord),
        f: common_vendor.o(onTouchMove),
        g: common_vendor.o(onTouchStart)
      } : {}, {
        h: !showText.value && !isRadio.value
      }, !showText.value && !isRadio.value ? common_vendor.e({
        i: common_assets._imports_1$3,
        j: common_vendor.o(changeInputTypeToVoice),
        k: common_vendor.o(onKeyInput),
        l: inputValue.value,
        m: common_vendor.o(handleSubmit),
        n: common_vendor.o(onInputFocus),
        o: common_vendor.o(onInputBlur),
        p: sendAble.value
      }, sendAble.value ? {
        q: common_assets._imports_2$3,
        r: common_vendor.o(handleSubmit)
      } : {}, {
        s: !sendAble.value
      }, !sendAble.value ? {
        t: common_assets._imports_3$2,
        v: common_vendor.o(handleStopGenerate)
      } : {}) : {}, {
        w: isRadio.value
      }, isRadio.value ? common_vendor.e({
        x: common_assets._imports_4$1,
        y: radioPlay.value
      }, radioPlay.value ? {
        z: common_assets._imports_5,
        A: common_vendor.o(stopRadio)
      } : {}, {
        B: !radioPlay.value
      }, !radioPlay.value ? {
        C: common_assets._imports_6,
        D: common_vendor.o(resumeRadio)
      } : {}) : {}, {
        E: common_assets._imports_7,
        F: common_vendor.o(toggleUserPopup),
        G: common_vendor.sr(userPopupRef, "5a9fb32a-0", {
          "k": "userPopupRef"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a9fb32a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/chat.js.map

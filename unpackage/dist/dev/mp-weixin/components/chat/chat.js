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
new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "events" has been externalized for browser compatibility. Cannot access "events.${key}" in client code.  See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
});
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
      return isRadio.value ? "../../static/voice-icon-disable.png" : "../../static/voice-icon.png";
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:242", "输入框获取焦点", e);
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
              common_vendor.index.__f__("log", "at components/chat/chat.vue:264", "用户点击确定");
              await wsStore.close();
              audioPlayerStore.stopAllAudio();
              barrageStore.clearMessages();
              common_vendor.index.__f__("log", "at components/chat/chat.vue:268", "用户点击确定");
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1e3);
            } else if (res.cancel) {
              common_vendor.index.__f__("log", "at components/chat/chat.vue:276", "用户点击取消");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:299", "切换到文字模式");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:316", "切换到语音模式");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:349", "开始录音");
      recordingStore.startRecording();
      common_vendor.index.__f__("log", "at components/chat/chat.vue:351", recordingStore.isRecording);
      shouldCancel.value = false;
      manager.start({
        lang: "zh_CN"
      });
    };
    const endRecord = () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:360", "结束录音");
      audioPlayerStore.setTtsVolume(1);
      recordingStore.stopRecording();
      common_vendor.index.__f__("log", "at components/chat/chat.vue:363", recordingStore.isRecording);
      manager.stop();
      if (shouldCancel.value) {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:367", "取消发送录音");
        shouldCancel.value = false;
        common_vendor.index.showToast({
          title: "已取消发送",
          icon: "none",
          duration: 1500
        });
        return;
      }
      manager.onStop = (res) => {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:378", "识别结束：", res.result);
        message.value = res.result;
        handleUploadMessage(message.value);
      };
      manager.onError = (res) => {
        common_vendor.index.__f__("error", "at components/chat/chat.vue:390", "识别错误：", res);
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
        common_vendor.index.__f__("log", "at components/chat/chat.vue:416", "不能发送消息");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:443", "停止生成消息");
      wsStore.sendMessage({
        input_type: 4,
        text: "stop",
        system_model: modelStore.model
      });
    };
    const handleUploadMessage = async (userMessage) => {
      if (!userMessage || !userMessage.trim())
        return;
      common_vendor.index.__f__("log", "at components/chat/chat.vue:454", "上传消息了sendAble:", sendAble.value);
      common_vendor.index.__f__("log", "at components/chat/chat.vue:456", "上传的消息:", userMessage);
      const barrageMessages = barrageStore.messages;
      if (barrageMessages.length >= 1 && barrageMessages[barrageMessages.length - 1].type === "subject") {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:463", "上一个对话是主题选择");
        uploadMessage.system_model = stores_model.useModelStore().model;
        uploadMessage.input_type = 2;
        uploadMessage.text = userMessage;
        setTimeout(async () => {
          const currentSubject = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "GET");
          common_vendor.index.__f__("log", "at components/chat/chat.vue:470", "获取当前主题", currentSubject.data.topic);
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
      audioPlayerStore.stopTtsAudio();
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:503", "停止电台");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:523", "恢复电台");
      try {
        audioPlayerStore.resumeTtsAudio();
        audioPlayerStore.resumeBgMusic();
        audioPlayerStore.setBgLoop(false);
      } catch (e) {
        common_vendor.index.__f__("log", "at components/chat/chat.vue:532", "恢复电台失败", e);
        audioPlayerStore.resumeTtsAudio();
      }
    };
    common_vendor.onShow(() => {
      if (isRadioStore.isRadio) {
        voiceIconSrc.value = "../../static/voice-icon-disable.png";
      }
      common_vendor.index.__f__("log", "at components/chat/chat.vue:544", "聊天组件显示");
      common_vendor.index.__f__("log", "at components/chat/chat.vue:545", "聊天组件显示isRadio", isRadioStore.isRadio);
      if (modelStore.model === "金种子杯模式") {
        placeholderStore.setRandomSpecialPlaceholder();
      } else {
        placeholderStore.setRandomNormalPlaceholder();
      }
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:556", "聊天组件加载完成");
    });
    common_vendor.onUnload(() => {
      common_vendor.index.offKeyboardHeightChange();
    });
    const backToQA = () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:584", "返回问答");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:607", "电台模式下点击输入框允许发送");
      common_vendor.index.__f__("log", "at components/chat/chat.vue:608", "电台模式下点击输入框允许发送", e);
      radioInputMessage.value = e.detail.value;
    };
    const radioInputFocus = (e) => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:612", "电台模式下点击输入框允许发送");
      common_vendor.index.__f__("log", "at components/chat/chat.vue:613", "电台模式下点击输入框允许发送", e);
      radioInput.value = true;
    };
    const handleRadioInputSubmit = async () => {
      common_vendor.index.__f__("log", "at components/chat/chat.vue:617", "电台模式下点击发送按钮");
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
      common_vendor.index.__f__("log", "at components/chat/chat.vue:633", "上传的消息:", uploadMessage2);
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
        b: common_assets._imports_0$2,
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
        l: common_vendor.unref(placeholderStore).currentPlaceholder,
        m: inputColor.value,
        n: common_vendor.o(onKeyInput),
        o: inputValue.value,
        p: common_vendor.o(handleSubmit),
        q: common_vendor.o(onInputFocus),
        r: common_vendor.o(onInputBlur),
        s: sendAble.value
      }, sendAble.value ? {
        t: common_assets._imports_2$3,
        v: common_vendor.o(handleSubmit)
      } : {}, {
        w: !sendAble.value
      }, !sendAble.value ? {
        x: common_vendor.o(handleStopGenerate)
      } : {}, {
        y: common_vendor.s(colorSystem.value)
      }) : {}, {
        z: isRadio.value
      }, isRadio.value ? common_vendor.e({
        A: common_assets._imports_3$2,
        B: common_vendor.o(backToQA),
        C: radioText.value,
        D: inputColor.value,
        E: radioInputMessage.value,
        F: common_vendor.o(radioInputFocus),
        G: common_vendor.o(onRadioKeyInput),
        H: common_vendor.o(onRadioInputBlur),
        I: radioPlay.value && !radioInput.value
      }, radioPlay.value && !radioInput.value ? {
        J: common_assets._imports_4$1,
        K: common_vendor.o(stopRadio)
      } : {}, {
        L: !radioPlay.value && !radioInput.value
      }, !radioPlay.value && !radioInput.value ? {
        M: common_assets._imports_5,
        N: common_vendor.o(resumeRadio)
      } : {}, {
        O: radioInput.value
      }, radioInput.value ? {
        P: common_assets._imports_2$3,
        Q: common_vendor.o(handleRadioInputSubmit)
      } : {}, {
        R: common_vendor.s(colorSystem.value)
      }) : {}, {
        S: voiceIconSrc.value,
        T: common_vendor.o(toggleUserPopup),
        U: common_vendor.sr(userPopupRef, "5a9fb32a-0", {
          "k": "userPopupRef"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a9fb32a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/chat/chat.js.map

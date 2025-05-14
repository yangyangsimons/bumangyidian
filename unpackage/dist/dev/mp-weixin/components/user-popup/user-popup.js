"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const utils_config = require("../../utils/config.js");
const stores_websocket = require("../../stores/websocket.js");
const stores_barrage = require("../../stores/barrage.js");
const stores_model = require("../../stores/model.js");
const stores_audioPlayer = require("../../stores/audioPlayer.js");
const stores_toggleModelStore = require("../../stores/toggleModelStore.js");
const utils_report = require("../../utils/report.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "user-popup",
  setup(__props, { expose: __expose }) {
    const modelStore = stores_model.useModelStore();
    const toggleModelStore = stores_toggleModelStore.useToggleModelStore();
    stores_websocket.useWebSocketStore();
    const audioPlayerStore = stores_audioPlayer.useAudioPlayerStore();
    stores_barrage.useBarrageStore();
    const currentTone = common_vendor.ref(null);
    const tones = common_vendor.ref([]);
    const toneId = common_vendor.ref(null);
    const audioPlayer = common_vendor.ref(null);
    const selectedToneId = common_vendor.ref(null);
    const currentTonePath = common_vendor.ref(null);
    const user = common_vendor.ref(null);
    const userName = common_vendor.ref("");
    const userSex = common_vendor.ref("");
    const userAge = common_vendor.ref("");
    const userMbti = common_vendor.ref("");
    const userMbtiShort = common_vendor.ref("");
    const avator = common_vendor.ref("");
    const sexSrc = common_vendor.ref("");
    const sptime = common_vendor.ref(0);
    common_vendor.onShow(async () => {
      try {
        const toneRes = await utils_request.request(`${utils_config.baseUrl}/tone/query`, "get");
        if (toneRes.code === 0) {
          common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:120", "获取音色信息成功", toneRes.data);
          tones.value = toneRes.data;
        } else {
          common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:125", "获取音色信息失败", toneRes.message);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:128", "获取音色信息失败", e);
      }
    });
    const calculateAge = (birthDateString) => {
      if (!birthDateString)
        return 0;
      const parts = birthDateString.split("-");
      if (parts.length !== 3)
        return 0;
      const birthYear = parseInt(parts[0], 10);
      const birthMonth = parseInt(parts[1], 10);
      const birthDay = parseInt(parts[2], 10);
      if ([birthYear, birthMonth, birthDay].some(isNaN))
        return 0;
      const today = /* @__PURE__ */ new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      let age = currentYear - birthYear;
      if (currentMonth < birthMonth || currentMonth === birthMonth && currentDay < birthDay) {
        age--;
      }
      return age;
    };
    const toneClick = (id, index) => {
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:164", "点击音色", id, index);
      tones.value.forEach((item, i) => {
        item.active = i === index;
      });
      selectedToneId.value = id;
      currentTone.value = tones.value[index];
      const selectedTone = tones.value.find((item) => item.id === id);
      if (selectedTone) {
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:175", "选中的音色", selectedTone);
        utils_report.dmReport(
          "click",
          {},
          {
            page: "userInfo",
            contents: [
              {
                element_id: "content",
                element_content: `${selectedTone.name}`
              }
            ]
          }
        );
        currentTonePath.value = selectedTone.path;
      } else {
        common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:192", "未找到对应的音色项");
      }
      tryListen();
    };
    const playAudio = (path) => {
      if (audioPlayer.value) {
        audioPlayer.value.stop();
        audioPlayer.value.destroy();
      }
      audioPlayer.value = common_vendor.index.createInnerAudioContext();
      audioPlayer.value.onError((res) => {
        common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:207", "音频播放错误", res);
      });
      audioPlayer.value.src = path;
      audioPlayer.value.play();
      audioPlayer.value.onEnded(() => {
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:217", "试听音频播放完成");
        audioPlayerStore.setTtsVolume(1);
      });
      audioPlayer.value.onPlay(() => {
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:222", "试听音频开始播放");
        audioPlayerStore.setTtsVolume(0);
      });
    };
    const tryListen = () => {
      audioPlayerStore.setTtsVolume(0.1);
      if (currentTone.value && currentTonePath.value) {
        playAudio(currentTonePath.value);
      } else {
        common_vendor.index.showToast({
          title: "请先选择音色",
          icon: "none"
        });
      }
    };
    const updateTone = async () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "userInfo",
          contents: [
            {
              element_id: "content",
              element_content: `确认`
            }
          ]
        }
      );
      if (!selectedToneId.value) {
        common_vendor.index.showToast({
          title: "请先选择音色",
          icon: "none"
        });
        return;
      }
      if (audioPlayer.value) {
        audioPlayer.value.stop();
        audioPlayer.value.destroy();
      }
      audioPlayer.value = null;
      audioPlayerStore.setTtsVolume(1);
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:272", "更新音色", selectedToneId.value);
      if (selectedToneId.value == 6 && modelStore.model !== "金种子杯模式") {
        common_vendor.index.__f__(
          "log",
          "at components/user-popup/user-popup.vue:276",
          "选了金种子，直接切换模式，不更新音色了",
          selectedToneId.value
        );
        toggleModelStore.triggerModelChange();
        return;
      }
      if (selectedToneId.value == 6 && modelStore.model == "金种子杯模式") {
        common_vendor.index.__f__(
          "log",
          "at components/user-popup/user-popup.vue:285",
          "金种子杯模式下选中的是音色6，什么都不做",
          selectedToneId.value
        );
      }
      const res = await utils_request.request(`${utils_config.baseUrl}/tone/update`, "post", {
        tone_id: selectedToneId.value
      });
      if (res.code === 0) {
        audioPlayerStore.setTtsVolume(1);
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:297", "触发模式切换逻辑", selectedToneId.value);
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:298", "触发模式切换逻辑", modelStore.model);
        common_vendor.index.showToast({
          title: "音色更新成功",
          icon: "success"
        });
        if (modelStore.model == "金种子杯模式" && selectedToneId.value !== 6) {
          common_vendor.index.__f__(
            "log",
            "at components/user-popup/user-popup.vue:306",
            "金种子杯模式下面选了不是6的音色，触发模式切换逻辑",
            selectedToneId.value
          );
          toggleModelStore.triggerModelChange();
        }
      } else {
        common_vendor.index.showToast({
          title: "请稍后再试",
          icon: "none"
        });
      }
    };
    const changeAvator = async () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "userInfo",
          contents: [
            {
              element_id: "content",
              element_content: `修改头像`
            }
          ]
        }
      );
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:339", "选择的头像", res.tempFilePaths[0]);
          const avatorFile = res.tempFilePaths[0];
          common_vendor.index.getFileSystemManager().readFile({
            filePath: avatorFile,
            encoding: "base64",
            success: async (readRes) => {
              const base64String = readRes.data;
              try {
                const uploadResult = await utils_request.request(
                  `${utils_config.baseUrl}/user/upload_avatar`,
                  "POST",
                  {
                    pic_base64: base64String
                  }
                );
                common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:359", "头像上传成功", uploadResult);
                common_vendor.index.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
                avator.value = uploadResult.data.avator_url;
              } catch (error) {
                common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:366", "头像上传失败", error);
                common_vendor.index.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
              }
            },
            fail: (error) => {
              common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:374", "读取文件失败", error);
              common_vendor.index.showToast({
                title: "头像更新成功",
                icon: "success"
              });
            }
          });
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:383", "选择头像失败", error);
        }
      });
    };
    const changeName = async () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "userInfo",
          contents: [
            {
              element_id: "content",
              element_content: `修改昵称`
            }
          ]
        }
      );
      common_vendor.index.showModal({
        title: "修改昵称（不超过9个字）",
        editable: true,
        placeholderText: "请输入新的昵称",
        content: userName.value,
        success: async (res) => {
          if (res.confirm && res.content) {
            if (res.content.length > 10) {
              common_vendor.index.showToast({
                title: "昵称不能超过20个字符",
                icon: "none"
              });
              return;
            }
            try {
              const result = await utils_request.request(
                `${utils_config.baseUrl}/user/update_username`,
                "POST",
                {
                  username: res.content
                }
              );
              if (result.code === 0) {
                userName.value = res.content;
                common_vendor.index.showToast({
                  title: "昵称修改成功",
                  icon: "success"
                });
                const modelStore2 = stores_model.useModelStore();
                if (modelStore2.userInfo) {
                  modelStore2.updateUserInfo({ username: res.content });
                }
              } else {
                common_vendor.index.showToast({
                  title: result.message || "修改失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:446", "修改昵称失败", error);
              common_vendor.index.showToast({
                title: "网络错误，请稍后再试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const changeMbti = async () => {
      utils_report.dmReport(
        "click",
        {},
        {
          page: "userInfo",
          contents: [
            {
              element_id: "content",
              element_content: `修改MBTI`
            }
          ]
        }
      );
      common_vendor.index.reLaunch({
        url: "/pages/questionnaire/questionnaire?changeMbti=changeMbti"
      });
    };
    const userPopupRef = common_vendor.ref(null);
    const popupChange = (e) => {
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:478", "popupChange", e);
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:479", "状态", e.show);
      if (!e.show) {
        const endTime = (/* @__PURE__ */ new Date()).getTime();
        const duration = endTime - sptime.value;
        utils_report.dmReport(
          "stay",
          {},
          {
            contents: [
              {
                page: "userInfo",
                sptime: duration
              }
            ]
          }
        );
      }
    };
    const open = async () => {
      sptime.value = (/* @__PURE__ */ new Date()).getTime();
      utils_report.dmReport(
        "pv",
        {},
        {
          contents: [
            {
              page: "userInfo"
            }
          ]
        }
      );
      try {
        const userInfoRes = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "get");
        if (userInfoRes.code === 0) {
          common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:514", "获取用户信息成功", userInfoRes.data);
          user.value = userInfoRes.data;
          avator.value = userInfoRes.data.avator;
          toneId.value = userInfoRes.data.tone;
          common_vendor.index.setStorage({
            key: "toneId",
            data: toneId.value
          });
          userName.value = userInfoRes.data.username;
          userAge.value = calculateAge(userInfoRes.data.birth);
          userMbtiShort.value = userInfoRes.data.mbti;
          userMbti.value = userInfoRes.data.mbti_ch;
          userSex.value = userInfoRes.data.sex;
          sexSrc.value = userSex.value === "男" ? "../../static/male.png" : "../../static/female.png";
          if (toneId.value && tones.value.length > 0) {
            tones.value.forEach((item) => {
              item.active = item.id === toneId.value;
              if (item.active) {
                selectedToneId.value = item.id;
                currentTone.value = item;
                currentTonePath.value = item.path;
              }
            });
          }
        } else {
          common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:547", "获取用户信息失败", userInfoRes.message);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:550", "打开弹窗失败", error);
      }
      userPopupRef.value.open("bottom");
      if (modelStore.model === "金种子杯模式") {
        const index = tones.value.findIndex((item) => item.id === 6);
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:556", "打开了音色页面，金种子杯模式");
        autoClick(6, index);
      }
    };
    const autoClick = (id, index) => {
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:562", "点击音色", id, index);
      tones.value.forEach((item, i) => {
        item.active = i === index;
      });
      selectedToneId.value = id;
      currentTone.value = tones.value[index];
      const selectedTone = tones.value.find((item) => item.id === id);
      if (selectedTone) {
        common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:573", "选中的音色", selectedTone);
        currentTonePath.value = selectedTone.path;
      } else {
        common_vendor.index.__f__("error", "at components/user-popup/user-popup.vue:576", "未找到对应的音色项");
      }
    };
    const close = () => {
      userPopupRef.value.close();
      common_vendor.index.__f__("log", "at components/user-popup/user-popup.vue:582", "关闭弹窗");
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$5,
        b: avator.value,
        c: common_vendor.o(changeAvator),
        d: common_vendor.t(userName.value),
        e: common_assets._imports_1$6,
        f: common_vendor.o(changeName),
        g: common_vendor.t(userAge.value),
        h: sexSrc.value,
        i: common_vendor.t(userMbti.value),
        j: common_vendor.t(userMbtiShort.value),
        k: common_assets._imports_1$6,
        l: common_vendor.o(changeMbti),
        m: common_vendor.f(tones.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.style),
            d: index,
            e: item.active ? 1 : "",
            f: common_vendor.o(($event) => toneClick(item.id, index), index)
          };
        }),
        n: common_assets._imports_2$5,
        o: common_vendor.o(updateTone),
        p: common_vendor.sr(userPopupRef, "52d19f64-0", {
          "k": "userPopupRef"
        }),
        q: common_vendor.o(popupChange)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-52d19f64"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/user-popup/user-popup.js.map

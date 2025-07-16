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
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  _easycom_uni_nav_bar2();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  _easycom_uni_nav_bar();
}
const _sfc_main = {
  __name: "my",
  setup(__props) {
    stores_model.useModelStore();
    stores_toggleModelStore.useToggleModelStore();
    stores_websocket.useWebSocketStore();
    stores_audioPlayer.useAudioPlayerStore();
    stores_barrage.useBarrageStore();
    common_vendor.ref(null);
    common_vendor.ref([]);
    const toneId = common_vendor.ref(null);
    common_vendor.ref(null);
    common_vendor.ref(null);
    common_vendor.ref(null);
    const user = common_vendor.ref(null);
    const userName = common_vendor.ref("");
    const userSex = common_vendor.ref("");
    common_vendor.ref("");
    const userMbti = common_vendor.ref("");
    const userMbtiShort = common_vendor.ref("");
    const avator = common_vendor.ref("");
    const sexSrc = common_vendor.ref("");
    const school = common_vendor.ref("湖南工商大学");
    common_vendor.ref(0);
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
          common_vendor.index.__f__("log", "at pages/my/my.vue:103", "选择的头像", res.tempFilePaths[0]);
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
                common_vendor.index.__f__("log", "at pages/my/my.vue:123", "头像上传成功", uploadResult);
                common_vendor.index.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
                avator.value = uploadResult.data.avator_url;
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/my/my.vue:130", "头像上传失败", error);
                common_vendor.index.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
              }
            },
            fail: (error) => {
              common_vendor.index.__f__("error", "at pages/my/my.vue:138", "读取文件失败", error);
              common_vendor.index.showToast({
                title: "头像更新成功",
                icon: "success"
              });
            }
          });
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/my/my.vue:147", "选择头像失败", error);
        }
      });
    };
    common_vendor.onShow(async () => {
      try {
        const userInfoRes = await utils_request.request(`${utils_config.baseUrl}/user/user_info`, "get");
        if (userInfoRes.code === 0) {
          common_vendor.index.__f__("log", "at pages/my/my.vue:168", "获取用户信息成功", userInfoRes.data);
          user.value = userInfoRes.data;
          avator.value = userInfoRes.data.avator;
          toneId.value = userInfoRes.data.tone;
          common_vendor.index.setStorage({
            key: "toneId",
            data: toneId.value
          });
          userName.value = userInfoRes.data.username;
          userMbtiShort.value = userInfoRes.data.mbti;
          userMbti.value = userInfoRes.data.mbti_ch;
          userSex.value = userInfoRes.data.sex;
          school.value = userInfoRes.data.school_name;
          sexSrc.value = userSex.value === "男" ? "../../static/male.png" : "../../static/female.png";
        } else {
          common_vendor.index.__f__("error", "at pages/my/my.vue:186", "获取用户信息失败", userInfoRes.message);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:189", "打开弹窗失败", error);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          fixed: true,
          ["status-bar"]: true,
          shadow: false,
          ["background-color"]: "rgba(255, 255, 255, 0)",
          color: "#333",
          border: false,
          leftWidth: "0",
          title: "我的"
        }),
        b: avator.value,
        c: common_vendor.o(changeAvator),
        d: common_vendor.t(userName.value),
        e: common_vendor.t(school.value),
        f: common_assets._imports_0,
        g: common_vendor.t(26)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map

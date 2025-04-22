"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "questionnaire",
  setup(__props) {
    const options = common_vendor.ref({});
    const sex = common_vendor.ref("");
    const birth = common_vendor.ref("");
    const selectedMbti = common_vendor.ref("");
    const selectedMbtiValue = common_vendor.ref("");
    const question_id = common_vendor.ref("");
    const question_text = common_vendor.ref("");
    const changeMbti = common_vendor.ref(false);
    common_vendor.onLoad((param) => {
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:50", "页面加载questionnaire", param);
      if (param.changeMbti !== void 0) {
        changeMbti.value = true;
      }
    });
    common_vendor.onShow(async () => {
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:57", "页面显示questionnaire");
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/user/question`, "GET");
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:60", "获取问卷数据", res);
        if (res.code === 0) {
          question_id.value = res.data[0].id;
          options.value = res.data[0].options;
          question_text.value = res.data[0].question_text;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:67", "获取问卷数据失败", e);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      }
    });
    const selectMBTI = (key, value) => {
      selectedMbti.value = key;
      selectedMbtiValue.value = options.value[key];
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:78", "选择了MBTI:", key, selectedMbtiValue.value);
    };
    const handleNext = async () => {
      if (changeMbti.value) {
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:83", selectedMbtiValue.value);
        await utils_request.request(`${utils_config.baseUrl}/user/update_mbti`, "POST", {
          mbti: selectedMbtiValue.value
        });
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
        return;
      }
      common_vendor.index.getStorage({
        key: "sex",
        success: ({ data }) => {
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:94", "获取到的性别:", data);
          if (data == "male") {
            sex.value = "男";
          } else {
            sex.value = "女";
          }
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:100", "获取到的出生日期:", birth.value);
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:103", "获取性别失败", error);
          return;
        }
      });
      common_vendor.index.getStorage({
        key: "birth",
        success: async ({ data }) => {
          birth.value = data;
          if (selectedMbti.value) {
            common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:112", "提交选择", selectedMbti.value, selectedMbtiValue.value);
            try {
              const res = await utils_request.request(`${utils_config.baseUrl}/user/register`, "POST", {
                sex: sex.value,
                birth: birth.value,
                username: "李思明",
                avator: "http://avatar1",
                answers: [
                  {
                    question_id: question_id.value,
                    option: [selectedMbtiValue.value]
                  }
                ]
              });
              common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:126", "提交问卷结果", res);
              if (res.code == 0) {
                common_vendor.index.reLaunch({ url: "/pages/index/index" });
              }
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:131", "提交问卷结果失败", e);
              common_vendor.index.showToast({
                title: "网络异常，请稍后再试",
                icon: "none"
              });
            }
          } else {
            common_vendor.index.showToast({
              title: "请先选择一个MBTI类型",
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:146", "获取出生日期失败", error);
          return;
        }
      });
    };
    const skip = async () => {
      if (changeMbti.value) {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
        return;
      }
      common_vendor.index.getStorage({
        key: "sex",
        success: ({ data }) => {
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:161", "获取到的性别:", data);
          if (data == "male") {
            sex.value = "男";
          } else {
            sex.value = "女";
          }
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:167", "获取到的出生日期:", birth.value);
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:170", "获取性别失败", error);
          return;
        }
      });
      common_vendor.index.getStorage({
        key: "birth",
        success: async ({ data }) => {
          birth.value = data;
          try {
            const res = await utils_request.request(`${utils_config.baseUrl}/user/register`, "POST", {
              sex: sex.value,
              birth: birth.value,
              username: "李思明",
              avator: "http://avatar1",
              answers: []
            });
            common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:186", "提交问卷结果", res);
            if (res.code == 0) {
              common_vendor.index.reLaunch({ url: "/pages/index/index" });
            }
          } catch (e) {
            common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:191", "提交问卷结果失败", e);
            common_vendor.index.showToast({
              title: "网络异常，请稍后再试",
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:199", "获取出生日期失败", error);
          return;
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_vendor.t(question_text.value),
        c: common_vendor.f(options.value, (value, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(value),
            c: key,
            d: selectedMbti.value === key ? 1 : "",
            e: common_vendor.o(($event) => selectMBTI(key), key)
          };
        }),
        d: common_vendor.o(handleNext),
        e: common_assets._imports_1$3,
        f: common_vendor.o(skip)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-57a88e77"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaire.js.map

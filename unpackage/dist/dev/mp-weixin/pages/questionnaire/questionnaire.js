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
    const school = common_vendor.ref("");
    const selectedMbti = common_vendor.ref("");
    const selectedMbtiValue = common_vendor.ref("");
    const question_id = common_vendor.ref("");
    const question_text = common_vendor.ref("");
    const changeMbti = common_vendor.ref(false);
    const dataLoaded = common_vendor.ref(false);
    common_vendor.onLoad((param) => {
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:55", "页面加载questionnaire", param);
      if (param.changeMbti !== void 0) {
        changeMbti.value = true;
      }
    });
    common_vendor.onShow(async () => {
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:62", "页面显示questionnaire");
      dataLoaded.value = false;
      try {
        await Promise.all([getQuestionnaireData(), getStorageData()]);
        dataLoaded.value = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:70", "数据加载失败", error);
        common_vendor.index.showToast({
          title: "数据加载失败，请稍后再试",
          icon: "none"
        });
      }
    });
    const getQuestionnaireData = async () => {
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/user/question`, "GET");
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:82", "获取问卷数据", res);
        if (res.code === 0) {
          question_id.value = res.data[0].id;
          options.value = res.data[0].options;
          question_text.value = res.data[0].question_text;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:89", "获取问卷数据失败", e);
        throw new Error("获取问卷数据失败");
      }
    };
    const getStorageData = async () => {
      try {
        const [schoolData, sexData, birthData] = await Promise.all([
          getStorageItem("school"),
          getStorageItem("sex"),
          getStorageItem("birth")
        ]);
        school.value = schoolData.id;
        sex.value = sexData === "male" ? "男" : "女";
        birth.value = birthData;
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:108", "预加载数据完成:", {
          school: school.value,
          sex: sex.value,
          birth: birth.value
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:114", "获取storage数据失败", error);
        throw new Error("获取用户数据失败");
      }
    };
    const getStorageItem = (key) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.getStorage({
          key,
          success: ({ data }) => {
            resolve(data);
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:128", `获取${key}失败`, error);
            reject(error);
          }
        });
      });
    };
    const selectMBTI = (key) => {
      selectedMbti.value = key;
      selectedMbtiValue.value = options.value[key];
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:138", "选择了MBTI:", key, selectedMbtiValue.value);
    };
    const handleNext = async () => {
      if (!dataLoaded.value) {
        common_vendor.index.showToast({
          title: "数据加载中，请稍后",
          icon: "none"
        });
        return;
      }
      if (changeMbti.value) {
        if (!selectedMbti.value) {
          common_vendor.index.showToast({
            title: "请先选择一个MBTI类型",
            icon: "none"
          });
          return;
        }
        try {
          const res = await utils_request.request(`${utils_config.baseUrl}/user/update_mbti`, "POST", {
            mbti: selectedMbtiValue.value
          });
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:164", "更新MBTI结果", res);
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:167", "更新MBTI失败", e);
          common_vendor.index.showToast({
            title: "网络异常，请稍后再试",
            icon: "none"
          });
        }
        return;
      }
      if (!school.value) {
        common_vendor.index.showToast({
          title: "请先选择学校",
          icon: "none"
        });
        return;
      }
      if (!selectedMbti.value) {
        common_vendor.index.showToast({
          title: "请先选择一个MBTI类型",
          icon: "none"
        });
        return;
      }
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
          ],
          school: school.value
        });
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:208", "提交问卷结果", res);
        if (res.code === 0) {
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:213", "提交问卷结果失败", e);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      }
    };
    const skip = async () => {
      if (!dataLoaded.value) {
        common_vendor.index.showToast({
          title: "数据加载中，请稍后",
          icon: "none"
        });
        return;
      }
      if (changeMbti.value) {
        common_vendor.index.reLaunch({ url: "/pages/index/index" });
        return;
      }
      if (!school.value) {
        common_vendor.index.showToast({
          title: "请先选择学校",
          icon: "none"
        });
        return;
      }
      try {
        const res = await utils_request.request(`${utils_config.baseUrl}/user/register`, "POST", {
          sex: sex.value,
          birth: birth.value,
          school: school.value,
          username: "不芒同学",
          avator: "http://avatar1",
          answers: []
        });
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:255", "跳过提交结果", res);
        if (res.code === 0) {
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:260", "跳过提交失败", e);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.f(options.value, (value, key, i0) => {
          return {
            a: common_vendor.t(key),
            b: common_vendor.t(value),
            c: key,
            d: selectedMbti.value === key ? 1 : "",
            e: common_vendor.o(($event) => selectMBTI(key), key)
          };
        }),
        c: common_vendor.o(handleNext),
        d: common_assets._imports_1$4,
        e: common_vendor.o(skip)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-57a88e77"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaire.js.map

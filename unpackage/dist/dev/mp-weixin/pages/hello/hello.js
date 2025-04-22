"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "hello",
  setup(__props) {
    const selectedSex = common_vendor.ref("male");
    const maleImageSrc = common_vendor.computed(() => {
      return selectedSex.value === "male" ? "../../static/sex/male-select.png" : "../../static/sex/male-unselect.png";
    });
    const femaleImageSrc = common_vendor.computed(() => {
      return selectedSex.value === "female" ? "../../static/sex/female-select.png" : "../../static/sex/female-unselect.png";
    });
    const selectSex = (sex) => {
      selectedSex.value = sex;
      common_vendor.index.__f__("log", "at pages/hello/hello.vue:74", "选择的性别:", selectedSex.value);
    };
    const rawDate = common_vendor.ref("2020-10-10");
    const startDate = common_vendor.ref("1900-01-01");
    const endDate = common_vendor.ref("2023-10-01");
    const dateParts = common_vendor.computed(() => {
      const [year, month, day] = rawDate.value.split("-");
      return {
        year,
        month: parseInt(month),
        // 去除前导零
        day: parseInt(day)
        // 去除前导零
      };
    });
    const bindDateChange = (e) => {
      rawDate.value = e.detail.value;
    };
    const handleNext = () => {
      if (selectedSex.value) {
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:97", "选择的性别:", selectedSex.value);
        common_vendor.index.__f__("log", "at pages/hello/hello.vue:98", "选择的日期:", rawDate.value);
        common_vendor.index.setStorage({
          key: "sex",
          data: selectedSex.value,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:103", "性别存储成功:", result);
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:106", "性别存储失败:", error);
          }
        });
        common_vendor.index.setStorage({
          key: "birth",
          data: rawDate.value,
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:113", "出生日期存储成功:", result);
            common_vendor.index.reLaunch({ url: "/pages/questionnaire/questionnaire" });
          },
          fail: (error) => {
            common_vendor.index.__f__("log", "at pages/hello/hello.vue:117", "出生日期存储失败:", error);
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "请先选择性别",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$1,
        b: common_assets._imports_1$2,
        c: maleImageSrc.value,
        d: common_vendor.o(($event) => selectSex("male")),
        e: femaleImageSrc.value,
        f: common_vendor.o(($event) => selectSex("female")),
        g: common_assets._imports_2$1,
        h: common_assets._imports_3$1,
        i: common_vendor.t(dateParts.value.year),
        j: common_vendor.t(dateParts.value.month),
        k: common_vendor.t(dateParts.value.day),
        l: startDate.value,
        m: endDate.value,
        n: common_vendor.o(bindDateChange),
        o: common_assets._imports_4,
        p: common_vendor.o(handleNext)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc3958f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/hello/hello.js.map

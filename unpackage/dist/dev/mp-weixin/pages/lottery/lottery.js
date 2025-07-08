"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "lottery",
  setup(__props) {
    const goBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        goHome();
      }
    };
    const goHome = () => {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    };
    const currentParticipants = common_vendor.ref(0);
    common_vendor.onShow(async () => {
      const rest = await utils_request.request(`${utils_config.baseUrl}/user/count_new_term_activity`, "get");
      if (rest.code === 0) {
        currentParticipants.value = rest.data.count;
      } else {
        common_vendor.index.showToast({
          title: "获取参与人数失败",
          icon: "none"
        });
      }
    });
    const stages = common_vendor.ref([
      { target: 1e3, label: "满1千" },
      { target: 5e3, label: "满5千" },
      { target: 2e4, label: "满2万" },
      { target: 5e4, label: "满5万" }
    ]);
    const rewards = common_vendor.ref([
      {
        image: "../../static/reward.jpg",
        desc: "芒果会员7天"
      },
      {
        image: "../../static/reward.jpg",
        desc: "芒果会员30天"
      },
      {
        image: "../../static/reward.jpg",
        desc: "芒果年费会员限量周边"
      },
      {
        image: "../../static/reward.jpg",
        desc: "终身会员\n+神秘大奖"
      }
    ]);
    const progressHeight = common_vendor.computed(() => {
      const participants = currentParticipants.value;
      const stageTargets = stages.value.map((s) => s.target);
      let baseProgress = 0;
      if (participants < stageTargets[0]) {
        baseProgress = participants / stageTargets[0] * 25;
      } else {
        let found = false;
        for (let i = 0; i < stageTargets.length - 1; i++) {
          if (participants >= stageTargets[i] && participants < stageTargets[i + 1]) {
            const segmentProgress = (participants - stageTargets[i]) / (stageTargets[i + 1] - stageTargets[i]);
            baseProgress = (i + 1) * 25 + segmentProgress * 25;
            found = true;
            break;
          }
        }
        if (!found && participants >= stageTargets[stageTargets.length - 1]) {
          baseProgress = 100;
        }
      }
      const offsetPercentage = 100 / 600 * 100;
      return Math.max(0, baseProgress - offsetPercentage);
    });
    const formatNumber = (num) => {
      if (num >= 1e4) {
        return (num / 1e4).toFixed(1) + "万";
      }
      if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + "k";
      }
      return num.toString();
    };
    const getNextStageNeeded = () => {
      for (let stage of stages.value) {
        if (currentParticipants.value < stage.target) {
          return formatNumber(stage.target - currentParticipants.value);
        }
      }
      return 0;
    };
    const handleShare = () => {
      common_vendor.index.navigateTo({ url: "/pages/enrollment2025/enrollment2025" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "left",
          size: "22"
        }),
        c: common_vendor.o(goHome),
        d: common_vendor.p({
          type: "home",
          size: "22"
        }),
        e: common_vendor.f(stages.value, (stage, index, i0) => {
          return {
            a: common_vendor.t(stage.label),
            b: index,
            c: currentParticipants.value >= stage.target ? 1 : ""
          };
        }),
        f: common_vendor.t(formatNumber(currentParticipants.value)),
        g: progressHeight.value + "%",
        h: common_vendor.f(rewards.value, (reward, index, i0) => {
          return {
            a: reward.image,
            b: common_vendor.t(reward.desc),
            c: index,
            d: currentParticipants.value >= stages.value[index].target ? 1 : ""
          };
        }),
        i: common_vendor.t(getNextStageNeeded()),
        j: common_vendor.o(handleShare)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-619cda96"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lottery/lottery.js.map

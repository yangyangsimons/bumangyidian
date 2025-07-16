"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
    const disclaimerText = common_vendor.ref(
      `参与“不芒一点”分享活动，赢取惊喜好礼！
        活动达成指定参与人数，即解锁对应奖池： 
        • 满1000人，前1000位用户可获得9.9元好礼； 
        • 满5000人，抽50位送芒果TV半年卡； 
        • 满1万人，抽50位送芒果TV大会员；
        • 满2万人，抽20位送芒果综艺录制名额； 
        • 满5万人，抽5位送芒果跨年演唱会门票！
        除1000人奖励外，其他奖项均从所有参与者中随机抽取。
        奖品兑换预计8月下旬开放，请关注服务信息推送，或在不芒一点2.0上线后，前往“我的-积分商城”领取，奖品以实际发放为准，活动最终解释权归主办方所有。`
    );
    const indicatorPosition = common_vendor.computed(() => {
      const progress = progressHeight.value;
      const position = 100 - progress;
      const adjustment = 1;
      return Math.max(0, Math.min(97, position + adjustment));
    });
    const debugMode = common_vendor.ref(false);
    const testProgress = () => {
      const testValues = [0, 1e3, 5e3, 1e4, 2e4, 5e4];
      const currentIndex = testValues.indexOf(currentParticipants.value);
      const nextIndex = (currentIndex + 1) % testValues.length;
      currentParticipants.value = testValues[nextIndex];
    };
    const baseProgressDebug = common_vendor.ref(0);
    const offsetPercentageDebug = common_vendor.ref(0);
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
      setTimeout(() => {
        startImageCarousel();
      }, 500);
    });
    const stages = common_vendor.ref([
      { target: 1e3, label: "满1千" },
      { target: 5e3, label: "满5千" },
      { target: 1e4, label: "满1万" },
      { target: 2e4, label: "满2万" },
      { target: 5e4, label: "满5万" }
    ]);
    const rewards = common_vendor.ref([
      {
        image: "../../static/enrollment/reward/stage-1.jpg",
        desc: "9.9元好礼"
      },
      {
        image: "../../static/enrollment/reward/stage-2.jpg",
        desc: "芒果tv季卡会员"
      },
      {
        image: "../../static/enrollment/reward/stage-3.jpg",
        desc: "芒果tv年卡会员"
      },
      {
        image: "../../static/enrollment/reward/stage-4.jpg",
        desc: "芒果综艺录制名额"
      },
      {
        image: "../../static/enrollment/reward/stage-5.jpg",
        desc: "芒果跨年权益"
      }
    ]);
    const isScrolling = common_vendor.ref(false);
    const infiniteImages = common_vendor.computed(() => {
      const validImages = rewards.value.filter((reward) => reward.image).map((reward) => reward.image);
      if (validImages.length === 0)
        return [];
      const result = [];
      for (let i = 0; i < 20; i++) {
        result.push(...validImages);
      }
      return result;
    });
    const startImageCarousel = () => {
      if (rewards.value.filter((reward) => reward.image).length === 0)
        return;
      isScrolling.value = true;
    };
    const stopImageCarousel = () => {
      isScrolling.value = false;
    };
    common_vendor.onHide(() => {
      stopImageCarousel();
    });
    common_vendor.onUnmounted(() => {
      stopImageCarousel();
    });
    const progressHeight = common_vendor.computed(() => {
      const participants = currentParticipants.value;
      const stageTargets = stages.value.map((s) => s.target);
      const stageCount = stageTargets.length;
      const segmentPercentage = 100 / stageCount;
      let baseProgress = 0;
      if (participants < stageTargets[0]) {
        baseProgress = participants / stageTargets[0] * segmentPercentage;
      } else {
        let found = false;
        for (let i = 0; i < stageTargets.length - 1; i++) {
          if (participants >= stageTargets[i] && participants < stageTargets[i + 1]) {
            const segmentProgress = (participants - stageTargets[i]) / (stageTargets[i + 1] - stageTargets[i]);
            baseProgress = (i + 1) * segmentPercentage + segmentProgress * segmentPercentage;
            found = true;
            break;
          }
        }
        if (!found && participants >= stageTargets[stageTargets.length - 1]) {
          baseProgress = 100;
        }
      }
      const peopleStagesPaddingTop = 15;
      const progressTrackHeight = 470;
      const offsetPercentage = peopleStagesPaddingTop / progressTrackHeight * 100;
      return Math.max(0, baseProgress - offsetPercentage);
    });
    const handleShare = () => {
      common_vendor.index.navigateTo({ url: "/pages/enrollment2025/enrollment2025" });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        e: debugMode.value
      }, debugMode.value ? {
        f: common_vendor.t(currentParticipants.value),
        g: common_vendor.t(baseProgressDebug.value.toFixed(2)),
        h: common_vendor.t(progressHeight.value.toFixed(2)),
        i: common_vendor.t(offsetPercentageDebug.value.toFixed(2)),
        j: common_vendor.o(testProgress)
      } : {}, {
        k: common_assets._imports_0$2,
        l: common_vendor.f(stages.value, (stage, index, i0) => {
          return {
            a: common_vendor.t(stage.label),
            b: index,
            c: currentParticipants.value >= stage.target ? 1 : ""
          };
        }),
        m: progressHeight.value + "%",
        n: indicatorPosition.value + "%",
        o: common_vendor.f(infiniteImages.value, (image, index, i0) => {
          return common_vendor.e({
            a: image
          }, image ? {
            b: image
          } : {}, {
            c: index
          });
        }),
        p: isScrolling.value ? 1 : "",
        q: common_vendor.f(rewards.value, (reward, index, i0) => {
          return {
            a: common_vendor.t(reward.desc),
            b: index,
            c: currentParticipants.value >= stages.value[index].target ? 1 : ""
          };
        }),
        r: common_vendor.t(disclaimerText.value),
        s: common_assets._imports_1$1,
        t: common_vendor.o(handleShare)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-619cda96"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lottery/lottery.js.map
